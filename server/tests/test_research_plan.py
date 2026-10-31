"""Research plans generated from the project's parameters, reviewed and edited before any run."""

import json

import pytest

from app.config import settings
from app.models import AIRun
from app.services import llm
from tests.test_api import create_project

BRIEF = {
    "title": "The Sea Forts",
    "premise": "A young mason helps build Sindhudurg while the Siddis of Janjira threaten the coast.",
    "subject": "Construction of Sindhudurg fort",
    "genre": "Historical drama",
    "themes": ["sovereignty", "craft"],
    "tone": "epic",
    "format": {"media": "Series", "episode_count": 8, "audience": "Indian family audience"},
    "setting": {
        "description": "Konkan coast",
        "era": "17th century Maratha period",
        "time_range": "1664-1667",
        "places": [{"name": "Sindhudurg Fort", "address": "Malvan, Maharashtra"}, {"name": "Janjira"}],
    },
    "people": [
        {"name": "Chhatrapati Shivaji Maharaj", "role": "patron", "historical": True},
        {"name": "Hiroji", "role": "young mason", "historical": False},
    ],
    "language": "Marathi / Hindi / English",
    "narrative_freedom": "GROUNDED_HYBRID",
    "evidence_requirement": "HIGH",
    "known_facts": ["The fort stands on Kurte island."],
    "open_questions": ["How were the foundation stones fixed against the sea?"],
    "suggested_areas": ["Maratha navy"],
    "user_questions": ["Who supplied the stone for the fort?"],
}

MODEL_TASKS = {
    "tasks": [
        {
            "area": "history_chronology",
            "question": "What is the documented construction timeline of Sindhudurg (1664-1667)?",
            "rationale": "The series is set during the construction years.",
            "triggered_by": ["setting", "era"],
            "people": ["Chhatrapati Shivaji Maharaj"],
            "places": ["Sindhudurg Fort"],
            "period": "1664-1667",
            "queries": [
                {"text": "Sindhudurg fort construction 1664 1667", "language": "en"},
                {"text": "सिंधुदुर्ग किल्ला बांधकाम", "language": "mr"},
            ],
            "priority": "high",
        },
        {
            "area": "ritual_festival_folklore",
            "question": "What local traditions surround the fort's foundation?",
            "rationale": "Folklore texture for the mason's story.",
            "triggered_by": ["themes", "people"],
            "people": [],
            "places": ["Malvan"],
            "period": "17th century",
            "queries": [{"text": "Sindhudurg fort foundation legend", "language": "en"}],
            "priority": "medium",
        },
        {
            "area": "daily_life",
            "question": "What did masons eat and wear on the Konkan coast in the 1660s?",
            "rationale": "Daily-life detail for the protagonist.",
            "triggered_by": ["people", "setting"],
            "people": [],
            "places": ["Konkan"],
            "period": "1660s",
            "queries": [{"text": "Konkan masons 17th century", "language": "xx"}],
            "priority": "low",
        },
        {
            "area": "history_chronology",
            "question": "What is the documented construction timeline of Sindhudurg (1664-1667)?",
            "rationale": "Duplicate that should be dropped.",
            "triggered_by": ["era"],
            "people": [],
            "places": [],
            "period": "",
            "queries": [{"text": "duplicate", "language": "en"}],
            "priority": "high",
        },
    ]
}


@pytest.fixture
def model(monkeypatch):
    monkeypatch.setattr(settings, "LLM_PROVIDER", "groq")
    monkeypatch.setattr(settings, "GROQ_API_KEY", "gsk_test")
    calls = []
    reply = {"body": MODEL_TASKS}

    async def _post(url, headers, payload):
        calls.append(payload)
        return 200, {
            "choices": [{"message": {"content": json.dumps(reply["body"])}}],
            "usage": {"prompt_tokens": 900, "completion_tokens": 600},
        }

    monkeypatch.setattr(llm, "_post", _post)
    return calls, reply


@pytest.fixture
def project(client, user_a):
    headers, user = user_a
    return headers, user, create_project(client, headers)


def generate(client, headers, project_id, brief=BRIEF, **extra):
    return client.post(
        f"/api/research/plans/generate?project_id={project_id}",
        headers=headers,
        json={"brief": brief, **extra},
    )


def test_plan_is_built_from_the_projects_parameters(client, project, model):
    headers, _, p = project
    calls, _ = model

    response = generate(client, headers, p["id"])

    assert response.status_code == 200, response.text
    plan = response.json()
    assert plan["status"] == "proposed"
    prompt = calls[0]["messages"][-1]["content"]
    for parameter in ["Sindhudurg Fort", "1664-1667", "Chhatrapati Shivaji Maharaj", "Series", "8 episodes",
                      "GROUNDED_HYBRID", "HIGH", "The fort stands on Kurte island.", "Maratha navy"]:
        assert parameter in prompt, parameter
    # Historical and fictional people are distinguished for the model.
    assert "Hiroji (young mason; fictional" in prompt


def test_every_task_explains_why_it_was_proposed(client, project, model):
    headers, _, p = project

    tasks = generate(client, headers, p["id"]).json()["tasks"]

    for task in tasks:
        assert task["rationale"]
        assert task["triggered_by"]
        assert task["status"] == "proposed"


def test_user_and_open_questions_are_always_in_the_plan(client, project, model):
    headers, _, p = project

    tasks = generate(client, headers, p["id"]).json()["tasks"]
    questions = {t["question"]: t for t in tasks}

    assert questions["Who supplied the stone for the fort?"]["area"] == "user_question"
    assert questions["Who supplied the stone for the fort?"]["triggered_by"] == ["user_questions"]
    assert "How were the foundation stones fixed against the sea?" in questions
    assert questions["How were the foundation stones fixed against the sea?"]["triggered_by"] == ["open_questions"]


def test_duplicates_are_dropped_and_languages_are_checked(client, project, model):
    headers, _, p = project

    tasks = generate(client, headers, p["id"]).json()["tasks"]
    questions = [t["question"] for t in tasks]

    assert questions.count("What is the documented construction timeline of Sindhudurg (1664-1667)?") == 1
    daily = next(t for t in tasks if t["area"] == "daily_life")
    assert daily["queries"] == [{"text": "Konkan masons 17th century", "language": "en"}]
    chronology = next(t for t in tasks if t["area"] == "history_chronology")
    assert {"text": "सिंधुदुर्ग किल्ला बांधकाम", "language": "mr"} in chronology["queries"]


def test_disabled_coverage_areas_are_never_proposed(client, project, model):
    headers, _, p = project

    tasks = generate(client, headers, p["id"], coverage_areas=["history_chronology", "people"]).json()["tasks"]

    assert {t["area"] for t in tasks} <= {"history_chronology", "people", "user_question", "open_question"}


def test_policy_follows_the_evidence_and_freedom_settings(client, project, model):
    headers, _, p = project

    plan = generate(client, headers, p["id"]).json()

    assert plan["policy"]["evidence_requirement"] == "HIGH"
    assert plan["policy"]["narrative_freedom"] == "GROUNDED_HYBRID"
    assert plan["policy"]["search_order"] == ["primary", "secondary"]
    assert "two independent" in plan["policy"]["documented_fact_rule"]
    assert plan["policy"]["search_languages"] == ["en", "mr", "hi"]

    strict = generate(client, headers, p["id"], brief={**BRIEF, "evidence_requirement": "STRICT"}).json()
    assert "Government" in strict["policy"]["documented_fact_rule"]


def test_creative_projects_get_a_smaller_texture_focused_plan(client, project, model):
    headers, _, p = project
    calls, _ = model

    generate(client, headers, p["id"], brief={**BRIEF, "narrative_freedom": "CREATIVE"})

    prompt = calls[0]["messages"][-1]["content"]
    assert "at most 12 tasks" in prompt
    assert "texture" in prompt


def test_plan_generation_is_logged_as_an_ai_run(client, test_db, project, model):
    headers, _, p = project
    generate(client, headers, p["id"])
    [run] = test_db.query(AIRun).all()
    assert run.workflow_id == "research_plan"
    assert str(run.project_id) == p["id"]
    assert run.input_tokens == 900


def test_tasks_can_be_edited_removed_and_added_before_approval(client, project, model):
    headers, _, p = project
    plan = generate(client, headers, p["id"]).json()
    q = f"project_id={p['id']}"
    task = plan["tasks"][0]

    edited = client.patch(f"/api/research/tasks/{task['id']}?{q}", headers=headers,
                          json={"question": "Edited question about the fort?", "priority": "low"})
    assert edited.status_code == 200, edited.text
    assert edited.json()["question"] == "Edited question about the fort?"
    assert edited.json()["created_by"] == "ai"

    removed = client.patch(f"/api/research/tasks/{plan['tasks'][1]['id']}?{q}", headers=headers, json={"status": "removed"})
    assert removed.json()["status"] == "removed"

    added = client.post(f"/api/research/plans/{plan['id']}/tasks?{q}", headers=headers, json={
        "area": "present_day_tourism", "question": "What is the fort's condition today?",
        "queries": [{"text": "Sindhudurg fort conservation", "language": "en"}],
    })
    assert added.status_code == 200, added.text
    assert added.json()["created_by"] == "user"
    assert added.json()["triggered_by"] == ["user_questions"]


def test_approval_locks_the_plan(client, project, model):
    headers, user, p = project
    plan = generate(client, headers, p["id"]).json()
    q = f"project_id={p['id']}"

    approved = client.post(f"/api/research/plans/{plan['id']}/approve?{q}", headers=headers)

    assert approved.status_code == 200, approved.text
    assert approved.json()["status"] == "approved"
    assert approved.json()["approved_by"] == user["id"]
    assert all(t["status"] == "approved" for t in approved.json()["tasks"] if t["status"] != "removed")
    locked = client.patch(f"/api/research/tasks/{plan['tasks'][0]['id']}?{q}", headers=headers, json={"priority": "low"})
    assert locked.status_code == 409


def test_a_plan_with_every_task_removed_cannot_be_approved(client, project, model):
    headers, _, p = project
    plan = generate(client, headers, p["id"]).json()
    q = f"project_id={p['id']}"
    for task in plan["tasks"]:
        client.patch(f"/api/research/tasks/{task['id']}?{q}", headers=headers, json={"status": "removed"})

    response = client.post(f"/api/research/plans/{plan['id']}/approve?{q}", headers=headers)
    assert response.status_code == 422


def test_plans_and_tasks_are_isolated_per_project(client, project, user_b, model):
    headers, _, p = project
    plan = generate(client, headers, p["id"]).json()
    headers_b, _ = user_b
    other = create_project(client, headers_b, title="Other")
    q = f"project_id={other['id']}"

    assert client.get(f"/api/research/plans/{plan['id']}/detail?{q}", headers=headers_b).status_code == 404
    assert client.patch(f"/api/research/tasks/{plan['tasks'][0]['id']}?{q}", headers=headers_b, json={"priority": "low"}).status_code == 404


def test_the_brief_needs_something_to_research(client, project, model):
    headers, _, p = project
    empty = {"title": "Untitled", "premise": "", "narrative_freedom": "FACTUAL", "evidence_requirement": "STANDARD"}
    response = generate(client, headers, p["id"], brief=empty)
    assert response.status_code == 422
