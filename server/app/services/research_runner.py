"""
Runs one task of an approved research plan:

1. Search government and UNESCO sites first, with each of the task's queries (one per language).
2. If fewer than MIN_PRIMARY_SOURCES government sources could be read, add open sources
   (open-reference web search and Wikipedia in the query's language).
3. Fetch and store the sources; failures are skipped and counted.
4. For each source, the model proposes findings with quotes, from the most relevant passages only.
5. Keep only quotes the server finds in the stored text; drop the rest and count them.
6. Mark each kept documented fact by the plan's evidence rule: eligible, or needs a government
   source (STRICT) or a second source (HIGH). Disputed, folklore and creative items are context.

Bounded per call (a few searches, at most PRIMARY_SOURCES + SECONDARY_SOURCES fetches), so a task
finishes within one request; the client runs tasks one by one and shows progress.
"""

import asyncio
import logging
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy.orm import Session

from app.config import settings
from app.models import Evidence, ResearchPlan, ResearchTask, SourceDocument, User
from app.services import llm, retrieval, structured, web_search
from app.services.passages import select_passages
from app.services.quote_check import MIN_EXCERPT_WORDS, excerpt_words, find_excerpt
from app.services.run_log import record_run
from app.services.source_store import store_fetched

logger = logging.getLogger(__name__)

PRIMARY_SOURCES = 3
SECONDARY_SOURCES = 2
MIN_PRIMARY_SOURCES = 2
FETCH_ATTEMPTS = 5
SEARCH_RESULTS = 5
SECONDARY_QUERIES = 2
EXTRACT_CONCURRENCY = 3
FINDINGS_PER_SOURCE = 3

EPISTEMIC_TYPES = ["DOCUMENTED_FACT", "SCHOLARLY_DISPUTED", "MYTHOLOGY_FOLKLORE", "CREATIVE_LICENCE"]

EXTRACTION_SCHEMA = {
    "type": "object",
    "required": ["findings"],
    "properties": {
        "findings": {
            "type": "array",
            "maxItems": FINDINGS_PER_SOURCE,
            "items": {
                "type": "object",
                "required": ["claim", "quote", "epistemic_type", "relevance"],
                "properties": {
                    "claim": {"type": "string", "minLength": 5},
                    "quote": {"type": "string", "minLength": 10},
                    "epistemic_type": {"enum": EPISTEMIC_TYPES},
                    "relevance": {"type": "string"},
                },
            },
        }
    },
}


class RunError(Exception):
    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


def eligibility(epistemic_type: str, source_tier: str, evidence_requirement: str) -> str:
    """Whether a finding can count as a documented fact under the plan's evidence level."""
    if epistemic_type != "DOCUMENTED_FACT" or source_tier == "primary":
        return "eligible"
    if evidence_requirement == "STRICT":
        return "needs_government_source"
    if evidence_requirement == "HIGH":
        return "needs_second_source"
    return "eligible"


async def _search(task: ResearchTask, tier: str, queries: List[Dict[str, str]], summary: Dict[str, Any]) -> List[str]:
    """Approved URLs for one tier, in result order, without duplicates."""
    urls: List[str] = []
    for query in queries:
        try:
            hits = await web_search.search_approved(query["text"], tier, SEARCH_RESULTS)
        except web_search.WebSearchError as error:
            summary["notes"].append(f"Search stopped: {error.message}")
            break
        summary["searches"] += 1
        urls += [h.url for h in hits if h.url not in urls]
    return urls


async def _fetch(urls: List[str], wanted: int, summary: Dict[str, Any]) -> List[retrieval.FetchedDocument]:
    """Fetch candidates in order until `wanted` succeed (at most FETCH_ATTEMPTS tries)."""
    candidates = urls[:FETCH_ATTEMPTS]
    results = await asyncio.gather(*(retrieval.fetch_url(url) for url in candidates), return_exceptions=True)
    fetched = []
    for url, result in zip(candidates, results):
        if isinstance(result, retrieval.FetchedDocument):
            if len(fetched) < wanted:
                fetched.append(result)
        else:
            summary["sources_failed"] += 1
            logger.info("Research source %s skipped: %s", url, getattr(result, "message", result))
    return fetched


async def _wikipedia(queries: List[Dict[str, str]], summary: Dict[str, Any]) -> List[retrieval.FetchedDocument]:
    docs: List[retrieval.FetchedDocument] = []
    for query in queries[:SECONDARY_QUERIES]:
        try:
            hits = await retrieval.search_wikipedia(query["text"], query["language"], 1)
            if hits:
                docs.append(await retrieval.fetch_wikipedia(hits[0].title, query["language"]))
        except retrieval.RetrievalError as error:
            summary["sources_failed"] += 1
            logger.info("Wikipedia skipped: %s", error.message)
    unique = {d.url + d.content_hash: d for d in docs}
    return list(unique.values())[:SECONDARY_SOURCES]


def _extraction_prompt(task: ResearchTask, doc: SourceDocument, passages: str) -> List[Dict[str, str]]:
    scope = " · ".join(v for v in [", ".join(task.people or []), ", ".join(task.places or []), task.period or ""] if v)
    return [
        {"role": "system", "content": "You extract evidence from one source for a film research team. You never use outside knowledge."},
        {"role": "user", "content": f"""RESEARCH QUESTION: {task.question}
{f"FOCUS: {scope}" if scope else ""}

SOURCE: {doc.title} ({doc.publisher or doc.url})
SOURCE TEXT:
{passages}

From the source text only, give up to {FINDINGS_PER_SOURCE} findings that help answer the research question.
- claim: the finding in one plain sentence.
- quote: copied exactly, word for word, from the source text (10 to 60 words). Do not translate, shorten or join separate passages.
- epistemic_type: DOCUMENTED_FACT (the source states it as recorded fact), SCHOLARLY_DISPUTED (the source presents it as contested), MYTHOLOGY_FOLKLORE (legend, belief or tradition), or CREATIVE_LICENCE (dramatisation).
- relevance: why it matters for the question, in one sentence.
If the source has nothing relevant, return {{"findings": []}}."""},
    ]


async def _extract(
    db: Session, user: User, task: ResearchTask, doc: SourceDocument, limit: asyncio.Semaphore, summary: Dict[str, Any]
) -> List[Dict[str, Any]]:
    about = [task.question, task.period or "", *(task.people or []), *(task.places or []), *(q["text"] for q in task.queries or [])]
    passages = select_passages(doc.text, about)
    started = time.perf_counter()
    run_fields = dict(user=user, project_id=task.project_id, workflow="research_extract", task=task.question[:100])
    async with limit:
        try:
            active = llm.provider()
            result = await structured.generate_json(
                _extraction_prompt(task, doc, passages), schema=EXTRACTION_SCHEMA, temperature=0.2, max_tokens=3000
            )
        except llm.LLMError as error:
            record_run(
                db, **run_fields, provider=settings.LLM_PROVIDER, model=getattr(error, "model", ""),
                status="failed", latency_ms=round((time.perf_counter() - started) * 1000),
                usage=getattr(error, "usage", None), error_code=error.code,
            )
            if error.code in ("AI_CONFIGURATION_REQUIRED", "AI_CREDITS_REQUIRED"):
                raise RunError(error.status_code, error.message)
            return []  # one unreadable source does not fail the task
    run = record_run(
        db, **run_fields, provider=active.name.lower(), model=result["model"], status="completed",
        latency_ms=result["latency_ms"], usage=result["usage"], validation_status=result["validation_status"],
    )
    if run is not None and run.estimated_cost:
        summary["estimated_cost"] += run.estimated_cost
    return result["data"]["findings"]


def _keep(
    db: Session, plan: ResearchPlan, task: ResearchTask, doc: SourceDocument, findings: List[Dict[str, Any]],
    seen: set, summary: Dict[str, Any],
) -> List[Evidence]:
    kept = []
    requirement = (plan.policy or {}).get("evidence_requirement", "HIGH")
    for finding in findings:
        quote = finding["quote"].strip()
        span = find_excerpt(doc.text, quote) if len(excerpt_words(quote)) >= MIN_EXCERPT_WORDS else None
        if span is None:
            summary["quotes_not_found"] += 1
            continue
        if (doc.id, span) in seen:
            continue
        seen.add((doc.id, span))
        evidence = Evidence(
            project_id=task.project_id, research_plan_id=plan.id, research_task_id=task.id,
            document_id=doc.id, source_url=doc.url, publisher=doc.publisher, source_type=doc.provider,
            claim=finding["claim"].strip(), supporting_excerpt=quote, excerpt_start=span[0], excerpt_end=span[1],
            relevance=finding.get("relevance", "").strip(), confidence="model", validation_status="quote_found",
            source_tier=doc.source_tier, epistemic_type=finding["epistemic_type"],
            eligibility=eligibility(finding["epistemic_type"], doc.source_tier, requirement),
        )
        db.add(evidence)
        kept.append(evidence)
    return kept


async def run_task(db: Session, user: User, plan: ResearchPlan, task: ResearchTask) -> Tuple[Dict[str, Any], List[Evidence]]:
    summary: Dict[str, Any] = {
        "searches": 0, "sources_read": 0, "sources_failed": 0, "findings_kept": 0,
        "quotes_not_found": 0, "estimated_cost": 0.0, "notes": [],
    }
    queries = list(task.queries or [])
    task.status = "running"
    db.commit()

    try:
        fetched: List[retrieval.FetchedDocument] = []
        if settings.TAVILY_API_KEY:
            primary_urls = await _search(task, "primary", queries, summary)
            fetched += await _fetch(primary_urls, PRIMARY_SOURCES, summary)
        else:
            summary["notes"].append(
                "Government search is not configured (TAVILY_API_KEY), so only Wikipedia was searched."
            )

        if len(fetched) < MIN_PRIMARY_SOURCES:
            secondary: List[retrieval.FetchedDocument] = []
            if settings.TAVILY_API_KEY:
                secondary_urls = await _search(task, "secondary", queries[:SECONDARY_QUERIES], summary)
                secondary += await _fetch(secondary_urls, SECONDARY_SOURCES, summary)
            if len(secondary) < SECONDARY_SOURCES:
                secondary += await _wikipedia(queries, summary)
            fetched += secondary[:SECONDARY_SOURCES]

        docs = [store_fetched(db, task.project_id, user, f) for f in fetched]
        docs = list({d.id: d for d in docs}.values())
        summary["sources_read"] = len(docs)

        limit = asyncio.Semaphore(EXTRACT_CONCURRENCY)
        all_findings = await asyncio.gather(*(_extract(db, user, task, doc, limit, summary) for doc in docs))
        seen: set = set()
        kept: List[Evidence] = []
        for doc, findings in zip(docs, all_findings):
            kept += _keep(db, plan, task, doc, findings, seen, summary)
    except Exception:
        db.rollback()
        task.status = "approved"  # can be run again
        db.commit()
        raise

    summary["findings_kept"] = len(kept)
    summary["estimated_cost"] = round(summary["estimated_cost"], 6)
    if not kept:
        summary["notes"].append("No usable quotes were found. Try rewording the task's searches or adding a source by hand.")
    task.status = "done"
    task.result = summary
    task.run_at = datetime.utcnow()
    db.commit()
    for evidence in kept:
        db.refresh(evidence)
    return summary, kept
