"""Running an approved research plan task: search government sites first, fetch, extract, quote-check."""

import json

import pytest

from app.config import settings
from app.models import AIRun, Evidence
from app.services import llm, retrieval, web_search
from tests.test_api import create_project
from tests.test_research_plan import BRIEF, MODEL_TASKS

ASI_PAGE = b"""<html><head><title>Sindhudurg Fort | ASI</title></head><body><main>
<p>Sindhudurg Fort was built by Chhatrapati Shivaji Maharaj between 1664 and 1667 on Kurte island off Malvan.</p>
<p>More than three thousand workers laboured on the fort, and molten lead was poured into the foundation stones.</p>
</main></body></html>"""
TOURISM_PAGE = b"""<html><head><title>Sindhudurg | Maharashtra Tourism</title></head><body><main>
<p>The fort of Sindhudurg is a popular tourist destination reached by boat from the Malvan jetty.</p>
</main></body></html>"""
WIKI_TEXT = "Sindhudurg is a sea fort. Local legend says the fort's walls hold the palm and footprints of Shivaji."

EXTRACTED = {
    "findings": [
        {
            "claim": "Sindhudurg was built between 1664 and 1667.",
            "quote": "built by Chhatrapati Shivaji Maharaj between 1664 and 1667",
            "epistemic_type": "DOCUMENTED_FACT",
            "relevance": "Anchors the construction timeline.",
        },
        {
            "claim": "Lead was used in the foundations.",
            "quote": "molten lead was poured into the foundation stones",
            "epistemic_type": "DOCUMENTED_FACT",
            "relevance": "Construction technique.",
        },
        {
            "claim": "The British rebuilt the fort.",
            "quote": "the British rebuilt the walls of the fort in 1820",
            "epistemic_type": "DOCUMENTED_FACT",
            "relevance": "Invented by the model; not in the source.",
        },
    ]
}
WIKI_EXTRACTED = {
    "findings": [{
        "claim": "Legend says Shivaji's palm print is in the walls.",
        "quote": "the fort's walls hold the palm and footprints of Shivaji",
        "epistemic_type": "MYTHOLOGY_FOLKLORE",
        "relevance": "Folklore texture.",
    }, {
        "claim": "Sindhudurg is a sea fort.",
        "quote": "Sindhudurg is a sea fort",
        "epistemic_type": "DOCUMENTED_FACT",
        "relevance": "Basic description.",
    }]
}


@pytest.fixture
def world(monkeypatch):
    """Fake Tavily, web pages, Wikipedia and the model. Records what was called."""
    monkeypatch.setattr(settings, "LLM_PROVIDER", "groq")
    monkeypatch.setattr(settings, "GROQ_API_KEY", "gsk_test")
    monkeypatch.setattr(settings, "TAVILY_API_KEY", "tvly-test")
    state = {
        "primary_results": [
            {"title": "Sindhudurg Fort - ASI", "url": "https://asi.nic.in/sindhudurg", "content": "built 1664"},
            {"title": "Sindhudurg - Tourism", "url": "https://maharashtratourism.gov.in/sindhudurg", "content": "boat"},
        ],
        "searches": [],
        "fetched": [],
        "extract_calls": 0,
    }

    async def tavily(url, headers, payload):
        tier = "primary" if "gov.in" in payload["include_domains"] else "secondary"
        state["searches"].append((tier, payload["query"]))
        return 200, {"results": state["primary_results"] if tier == "primary" else []}

    pages = {
        "https://asi.nic.in/sindhudurg": (200, {"content-type": "text/html"}, ASI_PAGE),
        "https://maharashtratourism.gov.in/sindhudurg": (200, {"content-type": "text/html"}, TOURISM_PAGE),
    }

    state["pages"] = pages

    async def request(url):
        state["fetched"].append(url)
        return state["pages"].get(url, (404, {}, b""))

    async def wiki(url, params):
        if params.get("list") == "search":
            return 200, {"query": {"search": [{"title": "Sindhudurg Fort", "snippet": "sea fort"}]}}
        return 200, {"query": {"pages": [{
            "title": "Sindhudurg Fort", "extract": WIKI_TEXT,
            "fullurl": "https://en.wikipedia.org/wiki/Sindhudurg_Fort", "revisions": [{"revid": 1}],
        }]}}

    async def model(url, headers, payload):
        prompt = payload["messages"][-1]["content"]
        if "plan the research" in prompt.lower():
            body = MODEL_TASKS
        else:
            state["extract_calls"] += 1
            body = WIKI_EXTRACTED if "Local legend" in prompt else EXTRACTED if "Kurte island" in prompt else {"findings": []}
        return 200, {"choices": [{"message": {"content": json.dumps(body)}}], "usage": {"prompt_tokens": 1000, "completion_tokens": 200}}

    monkeypatch.setattr(web_search, "_post", tavily)
    monkeypatch.setattr(retrieval, "_request", request)
    monkeypatch.setattr(retrieval, "_resolves_to_public_address", lambda host: True)
    monkeypatch.setattr(retrieval, "_get", wiki)
    monkeypatch.setattr(llm, "_post", model)
    return state


@pytest.fixture
def approved(client, user_a, world):
    """A project with an approved plan; returns (headers, project, plan)."""
    headers, _ = user_a
    project = create_project(client, headers)
    return headers, project, approve_plan(client, headers, project, BRIEF)


def approve_plan(client, headers, project, brief):
    q = f"project_id={project['id']}"
    plan = client.post(f"/api/research/plans/generate?{q}", headers=headers, json={"brief": brief}).json()
    return client.post(f"/api/research/plans/{plan['id']}/approve?{q}", headers=headers).json()


def run_task(client, headers, project, task):
    return client.post(f"/api/research/tasks/{task['id']}/run?project_id={project['id']}", headers=headers)


def chronology_task(plan):
    return next(t for t in plan["tasks"] if t["area"] == "history_chronology")


def test_a_task_searches_government_sites_first_and_keeps_only_found_quotes(client, approved, world):
    headers, project, plan = approved
    task = chronology_task(plan)

    response = run_task(client, headers, project, task)

    assert response.status_code == 200, response.text
    result = response.json()
    assert result["task"]["status"] == "done"
    assert all(tier == "primary" for tier, _ in world["searches"])  # two government sources were enough
    kept = result["evidence"]
    assert sorted(e["claim"] for e in kept) == ["Lead was used in the foundations.", "Sindhudurg was built between 1664 and 1667."]
    assert all(e["validation_status"] == "quote_found" for e in kept)
    assert all(e["research_task_id"] == task["id"] for e in kept)
    assert all(e["source_tier"] == "primary" and e["eligibility"] == "eligible" for e in kept)
    summary = result["summary"]
    assert summary["quotes_not_found"] == 1
    assert summary["sources_read"] == 2
    assert summary["searches"] == len(world["searches"])


def test_queries_run_in_each_planned_language(client, approved, world):
    headers, project, plan = approved
    task = chronology_task(plan)

    run_task(client, headers, project, task)

    assert {q for _, q in world["searches"]} == {q["text"] for q in task["queries"]}


def test_open_sources_are_used_when_government_coverage_is_thin(client, approved, world):
    headers, project, plan = approved
    world["primary_results"] = []

    result = run_task(client, headers, project, chronology_task(plan)).json()

    assert any(tier == "secondary" for tier, _ in world["searches"])
    by_claim = {e["claim"]: e for e in result["evidence"]}
    legend = by_claim["Legend says Shivaji's palm print is in the walls."]
    assert legend["source_tier"] == "secondary"
    assert legend["epistemic_type"] == "MYTHOLOGY_FOLKLORE"
    assert legend["eligibility"] == "eligible"  # folklore is labelled context, not a documented fact
    # HIGH evidence level: an open-source documented fact needs a second source.
    assert by_claim["Sindhudurg is a sea fort."]["eligibility"] == "needs_second_source"


def test_strict_evidence_level_needs_government_sources_for_documented_facts(client, user_a, world):
    headers, _ = user_a
    project = create_project(client, headers)
    plan = approve_plan(client, headers, project, {**BRIEF, "evidence_requirement": "STRICT"})
    world["primary_results"] = []

    result = run_task(client, headers, project, chronology_task(plan)).json()

    fact = next(e for e in result["evidence"] if e["claim"] == "Sindhudurg is a sea fort.")
    assert fact["eligibility"] == "needs_government_source"


def test_without_a_search_key_wikipedia_still_works(client, approved, world, monkeypatch):
    headers, project, plan = approved
    monkeypatch.setattr(settings, "TAVILY_API_KEY", "")

    result = run_task(client, headers, project, chronology_task(plan)).json()

    assert world["searches"] == []
    assert result["summary"]["notes"]
    assert "Government search is not configured" in result["summary"]["notes"][0]
    assert result["evidence"]


def test_sources_that_fail_to_load_are_skipped(client, approved, world):
    headers, project, plan = approved
    world["primary_results"].insert(0, {"title": "Sindhudurg records", "url": "https://asi.nic.in/missing", "content": "x"})

    result = run_task(client, headers, project, chronology_task(plan))

    assert result.status_code == 200, result.text
    assert result.json()["summary"]["sources_failed"] == 1


def test_extraction_calls_are_logged_with_cost(client, test_db, approved, world):
    headers, project, plan = approved
    run_task(client, headers, project, chronology_task(plan))
    runs = test_db.query(AIRun).filter_by(workflow_id="research_extract").all()
    assert len(runs) == world["extract_calls"] >= 1
    assert all(str(r.project_id) == project["id"] for r in runs)


def test_only_approved_plans_run(client, user_a, world):
    headers, _ = user_a
    project = create_project(client, headers)
    q = f"project_id={project['id']}"
    plan = client.post(f"/api/research/plans/generate?{q}", headers=headers, json={"brief": BRIEF}).json()

    response = run_task(client, headers, project, plan["tasks"][0])

    assert response.status_code == 409
    assert world["searches"] == []


def test_a_finished_task_is_not_run_again(client, approved, world):
    headers, project, plan = approved
    task = chronology_task(plan)
    run_task(client, headers, project, task)
    searches = len(world["searches"])

    again = run_task(client, headers, project, task)

    assert again.status_code == 409
    assert len(world["searches"]) == searches


def test_removed_tasks_do_not_run(client, user_a, world):
    headers, _ = user_a
    project = create_project(client, headers)
    q = f"project_id={project['id']}"
    plan = client.post(f"/api/research/plans/generate?{q}", headers=headers, json={"brief": BRIEF}).json()
    removed = plan["tasks"][0]
    client.patch(f"/api/research/tasks/{removed['id']}?{q}", headers=headers, json={"status": "removed"})
    client.post(f"/api/research/plans/{plan['id']}/approve?{q}", headers=headers)

    assert run_task(client, headers, project, removed).status_code == 409


def test_runs_are_isolated_per_project(client, approved, user_b, world):
    headers, project, plan = approved
    headers_b, _ = user_b
    other = create_project(client, headers_b, title="Other")
    response = client.post(f"/api/research/tasks/{plan['tasks'][0]['id']}/run?project_id={other['id']}", headers=headers_b)
    assert response.status_code == 404


def test_task_evidence_can_be_listed(client, approved, world):
    headers, project, plan = approved
    task = chronology_task(plan)
    run_task(client, headers, project, task)

    listed = client.get(f"/api/research/tasks/{task['id']}/evidence?project_id={project['id']}", headers=headers)

    assert listed.status_code == 200
    assert len(listed.json()) == 2
    assert listed.json()[0]["document"]["title"]


def test_search_results_that_do_not_mention_the_task_are_not_read(client, approved, world):
    headers, project, plan = approved
    world["primary_results"].insert(0, {
        "title": "List of Infrastructure Projects", "url": "https://www.pppinindia.gov.in/all_projects",
        "content": "Government infrastructure projects under construction",
    })

    result = run_task(client, headers, project, chronology_task(plan)).json()

    assert "https://www.pppinindia.gov.in/all_projects" not in world["fetched"]
    assert result["summary"]["results_skipped_as_off_topic"] >= 1


def test_open_sources_are_added_when_government_pages_yield_too_few_findings(client, approved, world):
    headers, project, plan = approved
    # Two on-topic government pages load, but neither yields a usable finding.
    world["pages"]["https://sindhudurg.nic.in/tourism"] = (200, {"content-type": "text/html"}, TOURISM_PAGE)
    world["primary_results"] = [
        {"title": "Sindhudurg - Tourism", "url": "https://maharashtratourism.gov.in/sindhudurg", "content": "boat"},
        {"title": "Sindhudurg district tourism", "url": "https://sindhudurg.nic.in/tourism", "content": "beaches"},
    ]

    result = run_task(client, headers, project, chronology_task(plan)).json()

    assert any(tier == "secondary" for tier, _ in world["searches"])
    assert any(e["source_tier"] == "secondary" for e in result["evidence"])


def test_a_rate_limited_model_call_is_retried(client, approved, world, monkeypatch):
    headers, project, plan = approved
    monkeypatch.setattr(llm, "RATE_LIMIT_RETRY_SECONDS", 0)
    original = llm._post
    calls = {"n": 0}

    async def flaky(url, headers_, payload):
        calls["n"] += 1
        if calls["n"] == 1:
            return 429, {"error": {"message": "rate limited"}}
        return await original(url, headers_, payload)

    monkeypatch.setattr(llm, "_post", flaky)
    result = run_task(client, headers, project, chronology_task(plan)).json()

    assert result["summary"]["findings_kept"] == 2
