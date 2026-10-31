"""
Research management endpoints - Evidence, research plans, and source management
"""

from fastapi import APIRouter, HTTPException, Depends, File, Form, UploadFile
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from app.auth import get_current_user, require_project_access
from app.config import settings
from app.database import get_db
from app.models import ResearchPlan, ResearchTask, Evidence, Project, SourceDocument, User
from app.schemas import (
    ResearchPlanCreate, ResearchPlanRead, ResearchPlanUpdate,
    EvidenceCreate, EvidenceRead, EvidenceUpdate, AttestedEvidenceCreate,
    ResearchPlanGenerate, ResearchPlanDetail, ResearchTaskRead, ResearchTaskCreate, ResearchTaskUpdate,
    ResearchTaskRunResult, TaskEvidenceRead,
    SourceSearchRequest, SourceSearchResponse, SourceHitRead, SourceFetchRequest, SourceUrlRequest,
    SourceDocumentRead, SourceDocumentWithText,
)
import time

from app.services import (
    llm, ocr, research_planner, research_runner, retrieval, source_registry, source_store, structured,
    uploads, web_search,
)
from app.services.run_log import record_run
from app.services.quote_check import MIN_EXCERPT_WORDS, excerpt_words, find_excerpt

router = APIRouter(dependencies=[Depends(require_project_access)])

MAX_UPLOAD_BYTES = 25 * 1024 * 1024


@router.post("/plans", response_model=ResearchPlanRead)
async def create_research_plan(
    project_id: UUID,
    plan: ResearchPlanCreate,
    db: Session = Depends(get_db),
):
    """Create a research plan"""

    # Verify project exists
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create plan
    db_plan = ResearchPlan(
        project_id=project_id,
        questions=plan.questions,
        scope=plan.scope,
    )

    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)

    return db_plan


@router.get("/plans/{plan_id}", response_model=ResearchPlanRead)
async def get_research_plan(
    plan_id: UUID,
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """Get research plan by ID"""

    plan = db.query(ResearchPlan).filter(
        ResearchPlan.id == plan_id,
        ResearchPlan.project_id == project_id,
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Research plan not found")

    return plan


@router.get("/plans", response_model=List[ResearchPlanRead])
async def list_research_plans(
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """List all research plans for a project"""

    plans = db.query(ResearchPlan).filter_by(project_id=project_id).all()
    return plans


@router.put("/plans/{plan_id}", response_model=ResearchPlanRead)
async def update_research_plan(
    plan_id: UUID,
    project_id: UUID,
    plan_update: ResearchPlanUpdate,
    db: Session = Depends(get_db),
):
    """Update research plan"""

    plan = db.query(ResearchPlan).filter(
        ResearchPlan.id == plan_id,
        ResearchPlan.project_id == project_id,
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Research plan not found")

    for field, value in plan_update.dict(exclude_unset=True).items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)

    return plan


# ---- Research plans generated from the project brief ---------------------------------------

def _plan_detail(db: Session, plan: ResearchPlan) -> dict:
    tasks = db.query(ResearchTask).filter_by(plan_id=plan.id).order_by(ResearchTask.position).all()
    return {
        "id": plan.id, "project_id": plan.project_id, "status": plan.status, "policy": plan.policy,
        "created_at": plan.created_at, "approved_by": plan.approved_by, "approved_at": plan.approved_at,
        "tasks": [ResearchTaskRead.model_validate(t) for t in tasks],
    }


def _project_plan(db: Session, project_id: UUID, plan_id: UUID) -> ResearchPlan:
    plan = db.query(ResearchPlan).filter_by(id=plan_id, project_id=project_id).first()
    if plan is None:
        raise HTTPException(status_code=404, detail="Research plan not found")
    return plan


def _editable_plan(db: Session, project_id: UUID, plan_id: UUID) -> ResearchPlan:
    plan = _project_plan(db, project_id, plan_id)
    if plan.status != "proposed":
        raise HTTPException(status_code=409, detail="This plan is approved and can no longer be edited.")
    return plan


@router.post("/plans/generate", response_model=ResearchPlanDetail)
async def generate_research_plan(
    project_id: UUID,
    request: ResearchPlanGenerate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Propose a research plan from the project's parameters. Nothing is searched until approval."""
    brief = request.brief.model_dump()
    if not research_planner.has_research_subject(brief):
        raise HTTPException(
            status_code=422,
            detail="Add a premise, subject, places, people or questions before building a research plan.",
        )
    areas = list(request.coverage_areas or research_planner.AREAS.keys())
    policy = research_planner.policy_for(brief)

    started = time.perf_counter()
    run_fields = dict(user=user, project_id=project_id, workflow="research_plan", task="Research plan")
    try:
        active = llm.provider()
        result = await structured.generate_json(
            research_planner.build_prompt(brief, areas, policy),
            schema=research_planner.output_schema(),
            temperature=0.4,
            max_tokens=6000,
        )
    except llm.LLMError as error:
        invalid = isinstance(error, structured.StructuredOutputError)
        record_run(
            db, **run_fields, provider=settings.LLM_PROVIDER, model=getattr(error, "model", ""),
            status="failed", latency_ms=round((time.perf_counter() - started) * 1000),
            usage=getattr(error, "usage", None), error_code=error.code,
            validation_status="invalid" if invalid else None,
        )
        raise HTTPException(status_code=error.status_code, detail=error.message)
    record_run(
        db, **run_fields, provider=active.name.lower(), model=result["model"], status="completed",
        latency_ms=result["latency_ms"], usage=result["usage"], validation_status=result["validation_status"],
    )

    tasks = research_planner.assemble_tasks(brief, areas, policy, result["data"]["tasks"])
    plan = ResearchPlan(
        project_id=project_id, questions=[t["question"] for t in tasks], status="proposed",
        brief=brief, policy=policy, created_by=user.id,
    )
    db.add(plan)
    db.flush()
    for position, task in enumerate(tasks):
        db.add(ResearchTask(plan_id=plan.id, project_id=project_id, position=position, created_by="ai", **task))
    db.commit()
    return _plan_detail(db, plan)


@router.get("/plans/{plan_id}/detail", response_model=ResearchPlanDetail)
async def get_research_plan_detail(project_id: UUID, plan_id: UUID, db: Session = Depends(get_db)):
    return _plan_detail(db, _project_plan(db, project_id, plan_id))


@router.post("/plans/{plan_id}/tasks", response_model=ResearchTaskRead)
async def add_research_task(
    project_id: UUID, plan_id: UUID, request: ResearchTaskCreate, db: Session = Depends(get_db)
):
    plan = _editable_plan(db, project_id, plan_id)
    position = db.query(ResearchTask).filter_by(plan_id=plan.id).count()
    queries = [q.model_dump() for q in request.queries] or [{"text": request.question[:300], "language": "en"}]
    task = ResearchTask(
        plan_id=plan.id, project_id=project_id, position=position, area=request.area,
        question=request.question.strip(), rationale="Added by the project team.",
        triggered_by=["user_questions"], people=[], places=[], period="", queries=queries,
        priority=request.priority, status="proposed", created_by="user",
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/tasks/{task_id}", response_model=ResearchTaskRead)
async def update_research_task(
    project_id: UUID, task_id: UUID, request: ResearchTaskUpdate, db: Session = Depends(get_db)
):
    task = db.query(ResearchTask).filter_by(id=task_id, project_id=project_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Research task not found")
    _editable_plan(db, project_id, task.plan_id)
    changes = request.model_dump(exclude_unset=True)
    if "queries" in changes:
        changes["queries"] = [q for q in changes["queries"]]
    for field, value in changes.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.post("/plans/{plan_id}/approve", response_model=ResearchPlanDetail)
async def approve_research_plan(
    project_id: UUID,
    plan_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lock the plan. Only approved plans can be run, so searches never start without review."""
    plan = _editable_plan(db, project_id, plan_id)
    active = db.query(ResearchTask).filter_by(plan_id=plan.id, status="proposed").all()
    if not active:
        raise HTTPException(status_code=422, detail="Keep at least one task before approving the plan.")
    for task in active:
        task.status = "approved"
    plan.status = "approved"
    plan.approved_by = user.id
    plan.approved_at = datetime.utcnow()
    plan.questions = [t.question for t in active]
    db.commit()
    return _plan_detail(db, plan)


def _task_evidence(db: Session, evidence: List[Evidence]) -> List[dict]:
    doc_ids = {e.document_id for e in evidence if e.document_id}
    docs = {d.id: d for d in db.query(SourceDocument).filter(SourceDocument.id.in_(doc_ids)).all()} if doc_ids else {}
    out = []
    for e in evidence:
        doc = docs.get(e.document_id)
        item = TaskEvidenceRead.model_validate(e).model_dump()
        item["document"] = (
            {"id": doc.id, "title": doc.title, "url": doc.url, "publisher": doc.publisher, "source_tier": doc.source_tier}
            if doc else None
        )
        out.append(item)
    return out


@router.post("/tasks/{task_id}/run", response_model=ResearchTaskRunResult)
async def run_research_task(
    project_id: UUID,
    task_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Run one approved task: government sites first, open sources if thin, quotes checked."""
    task = db.query(ResearchTask).filter_by(id=task_id, project_id=project_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Research task not found")
    plan = _project_plan(db, project_id, task.plan_id)
    if plan.status != "approved":
        raise HTTPException(status_code=409, detail="Approve the research plan before running it.")
    if task.status != "approved":
        raise HTTPException(
            status_code=409,
            detail="This task has already run." if task.status == "done" else "This task is not part of the approved plan.",
        )
    try:
        summary, evidence = await research_runner.run_task(db, user, plan, task)
    except research_runner.RunError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    return {"task": ResearchTaskRead.model_validate(task), "summary": summary, "evidence": _task_evidence(db, evidence)}


@router.get("/tasks/{task_id}/evidence", response_model=List[TaskEvidenceRead])
async def list_task_evidence(project_id: UUID, task_id: UUID, db: Session = Depends(get_db)):
    task = db.query(ResearchTask).filter_by(id=task_id, project_id=project_id).first()
    if task is None:
        raise HTTPException(status_code=404, detail="Research task not found")
    evidence = db.query(Evidence).filter_by(research_task_id=task.id).order_by(Evidence.created_at).all()
    return _task_evidence(db, evidence)


# ---- Source documents (Wikipedia) ---------------------------------------------------------

def _document_read(doc: SourceDocument) -> dict:
    return {
        "id": doc.id, "project_id": doc.project_id, "provider": doc.provider,
        "source_tier": doc.source_tier, "url": doc.url,
        "title": doc.title, "language": doc.language, "publisher": doc.publisher,
        "revision_id": doc.revision_id, "revised_at": doc.revised_at,
        "content_hash": doc.content_hash, "text_length": len(doc.text),
        "extraction_method": doc.extraction_method, "file_name": doc.file_name,
        "retrieved_at": doc.retrieved_at,
    }


def _project_document(db: Session, project_id: UUID, document_id: UUID) -> SourceDocument:
    doc = db.query(SourceDocument).filter_by(id=document_id, project_id=project_id).first()
    if doc is None:
        raise HTTPException(status_code=404, detail="Source document not found")
    return doc


@router.post("/sources/search", response_model=SourceSearchResponse)
async def search_sources(project_id: UUID, request: SourceSearchRequest):
    """Search for candidate sources. Nothing is stored; fetch a result to keep it."""
    if request.scope == "wikipedia":
        try:
            hits = await retrieval.search_wikipedia(request.query, request.language, request.limit)
        except retrieval.RetrievalError as error:
            raise HTTPException(status_code=error.status_code, detail=error.message)
        return SourceSearchResponse(results=[
            SourceHitRead(**hit.__dict__, source_tier=source_registry.SECONDARY) for hit in hits
        ])
    try:
        web_hits = await web_search.search_approved(request.query, request.scope, request.limit)
    except web_search.WebSearchError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    return SourceSearchResponse(results=[SourceHitRead(**hit.__dict__) for hit in web_hits])


@router.post("/sources", response_model=SourceDocumentRead)
async def fetch_source(
    project_id: UUID,
    request: SourceFetchRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch a Wikipedia article and store its text. The same revision is stored once per project."""
    try:
        fetched = await retrieval.fetch_wikipedia(request.title, request.language)
    except retrieval.RetrievalError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    return _store(db, project_id, user, fetched)


@router.post("/sources/url", response_model=SourceDocumentRead)
async def fetch_source_url(
    project_id: UUID,
    request: SourceUrlRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Fetch a page or PDF from an approved government or open reference site and store its text."""
    try:
        fetched = await retrieval.fetch_url(request.url.strip())
    except retrieval.RetrievalError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)
    return _store(db, project_id, user, fetched)


def _store(db: Session, project_id: UUID, user: User, fetched: retrieval.FetchedDocument) -> dict:
    return _document_read(source_store.store_fetched(db, project_id, user, fetched))


@router.post("/sources/upload", response_model=SourceDocumentRead)
async def upload_source(
    project_id: UUID,
    file: UploadFile = File(...),
    title: str = Form(..., min_length=1, max_length=500),
    publisher: str = Form(..., min_length=1, max_length=255),
    declared_tier: Literal["primary", "secondary"] = Form(...),
    rights_confirmed: bool = Form(False),
    ocr_languages: str = Form("eng", max_length=40),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Store an uploaded document (PDF, Word, text, or a scan read with OCR) as a source.

    The uploader names it, says whether it is government (primary) or published / reference
    material (secondary), and confirms they may use it. Quotes are then checked against its text.
    """
    if not rights_confirmed:
        raise HTTPException(
            status_code=422, detail="Confirm that you are allowed to use this document for research."
        )
    if not ocr.valid_languages(ocr_languages):
        raise HTTPException(status_code=422, detail="Unsupported OCR language selection.")
    data = await file.read(MAX_UPLOAD_BYTES + 1)
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="The file is too large (25 MB at most).")

    try:
        # OCR and PDF parsing are CPU-bound: keep them off the event loop.
        text, method = await run_in_threadpool(uploads.extract_text, data, ocr_languages)
    except uploads.UploadError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)

    content_hash = retrieval.content_hash(text)
    existing = db.query(SourceDocument).filter_by(
        project_id=project_id, provider="upload", content_hash=content_hash
    ).first()
    if existing:
        return _document_read(existing)

    doc = SourceDocument(
        project_id=project_id, provider="upload", source_tier=declared_tier, url=None,
        title=title.strip(), publisher=publisher.strip(), content_hash=content_hash, text=text,
        extraction_method=method, file_name=(file.filename or "upload")[:255], retrieved_by=user.id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return _document_read(doc)


@router.get("/sources", response_model=List[SourceDocumentRead])
async def list_sources(
    project_id: UUID,
    tier: Optional[Literal["primary", "secondary"]] = None,
    db: Session = Depends(get_db),
):
    query = db.query(SourceDocument).filter_by(project_id=project_id)
    if tier is not None:
        query = query.filter_by(source_tier=tier)
    docs = query.order_by(SourceDocument.retrieved_at).all()
    return [_document_read(doc) for doc in docs]


@router.get("/sources/{document_id}", response_model=SourceDocumentWithText)
async def get_source(project_id: UUID, document_id: UUID, db: Session = Depends(get_db)):
    doc = _project_document(db, project_id, document_id)
    return {**_document_read(doc), "text": doc.text}


def _excerpt_check(excerpt: Optional[str], doc: SourceDocument) -> Dict[str, Any]:
    """The status and offsets for `excerpt` in the stored text. Rejects a quote that is not there."""
    if not excerpt:
        return {"validation_status": "unverified", "excerpt_start": None, "excerpt_end": None}
    if len(excerpt_words(excerpt)) < MIN_EXCERPT_WORDS:
        raise HTTPException(
            status_code=422,
            detail=f"Quote at least {MIN_EXCERPT_WORDS} words from the source, so the quote shows what it supports.",
        )
    span = find_excerpt(doc.text, excerpt)
    if span is None:
        raise HTTPException(
            status_code=422,
            detail="The excerpt was not found in the source text. Copy it exactly from the source.",
        )
    return {"validation_status": "quote_found", "excerpt_start": span[0], "excerpt_end": span[1]}


# ---- Evidence ----------------------------------------------------------------------------

@router.post("/evidence", response_model=EvidenceRead)
async def create_evidence(
    project_id: UUID,
    evidence: EvidenceCreate,
    db: Session = Depends(get_db),
):
    """Create evidence for research. With a document_id, the excerpt is checked against its text."""

    # Verify project exists
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    doc = _project_document(db, project_id, evidence.document_id) if evidence.document_id else None

    # Create evidence
    db_evidence = Evidence(
        project_id=project_id,
        research_plan_id=evidence.research_plan_id,
        source_url=evidence.source_url,
        source_type=evidence.source_type,
        publisher=evidence.publisher,
        author=evidence.author,
        claim=evidence.claim,
        supporting_excerpt=evidence.supporting_excerpt,
        relevance=evidence.relevance,
        confidence=evidence.confidence,
    )
    if doc is not None:
        db_evidence.document_id = doc.id
        db_evidence.source_url = doc.url
        db_evidence.publisher = doc.publisher
        for field, value in _excerpt_check(evidence.supporting_excerpt, doc).items():
            setattr(db_evidence, field, value)

    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)

    return db_evidence


@router.post("/evidence/attested", response_model=EvidenceRead)
async def create_attested_evidence(
    project_id: UUID,
    evidence: AttestedEvidenceCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record evidence from an offline source (book, interview, field or archive visit).

    Nothing can be machine-checked here, so a named researcher attests to it and it is stored as
    'attested', never as 'quote_found'.
    """
    if not evidence.attested:
        raise HTTPException(
            status_code=422, detail="Confirm that you attest this record is accurate before saving it."
        )
    citation = evidence.citation
    if citation.kind == "interview" and not citation.consent_confirmed:
        raise HTTPException(
            status_code=422, detail="Record the interviewee's consent to be quoted before saving an interview."
        )
    if len(excerpt_words(evidence.excerpt)) < MIN_EXCERPT_WORDS:
        raise HTTPException(
            status_code=422,
            detail=f"Quote at least {MIN_EXCERPT_WORDS} words from the source, so the record shows what it supports.",
        )

    tier = "field" if citation.kind in ("interview", "field_visit") else evidence.source_tier
    publisher = {"book": getattr(citation, "publisher", None), "archive_visit": getattr(citation, "archive", None)}
    db_evidence = Evidence(
        project_id=project_id,
        research_plan_id=evidence.research_plan_id,
        source_type=citation.kind,
        source_kind=citation.kind,
        source_tier=tier,
        citation=citation.model_dump(),
        publisher=publisher.get(citation.kind),
        author=getattr(citation, "author", None),
        claim=evidence.claim,
        supporting_excerpt=evidence.excerpt,
        confidence="attested",
        validation_status="attested",
        attested_by=user.id,
        attested_at=datetime.utcnow(),
    )
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    return db_evidence


@router.get("/evidence/{evidence_id}", response_model=EvidenceRead)
async def get_evidence(
    evidence_id: UUID,
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """Get evidence by ID"""

    evidence = db.query(Evidence).filter(
        Evidence.id == evidence_id,
        Evidence.project_id == project_id,
    ).first()

    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    return evidence


@router.get("/evidence", response_model=List[EvidenceRead])
async def list_evidence(
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """List all evidence for a project"""

    evidence_list = db.query(Evidence).filter_by(project_id=project_id).all()
    return evidence_list


@router.put("/evidence/{evidence_id}", response_model=EvidenceRead)
async def update_evidence(
    evidence_id: UUID,
    project_id: UUID,
    evidence_update: EvidenceUpdate,
    db: Session = Depends(get_db),
):
    """Update evidence"""

    evidence = db.query(Evidence).filter(
        Evidence.id == evidence_id,
        Evidence.project_id == project_id,
    ).first()

    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    changes = evidence_update.model_dump(exclude_unset=True)
    if "supporting_excerpt" in changes and evidence.document_id is not None:
        # Checked before anything changes, so a rejected quote leaves the evidence as it was.
        doc = _project_document(db, project_id, evidence.document_id)
        changes.update(_excerpt_check(changes["supporting_excerpt"], doc))
    for field, value in changes.items():
        setattr(evidence, field, value)

    db.commit()
    db.refresh(evidence)

    return evidence
