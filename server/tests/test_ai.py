"""AI proxy tests. The provider network call is replaced; no real request is made."""

import pytest

from app.api import ai as ai_module
from app.config import settings
from app.services import llm
from tests.conftest import auth_headers

OK_BODY = {"choices": [{"message": {"content": "  Hello from the model  "}}]}


@pytest.fixture(autouse=True)
def configured(monkeypatch):
    monkeypatch.setattr(settings, "LLM_PROVIDER", "huggingface")
    monkeypatch.setattr(settings, "HUGGINGFACE_API_TOKEN", "hf_test_token")
    monkeypatch.setattr(settings, "HUGGINGFACE_MODEL", "primary/model")
    monkeypatch.setattr(settings, "HUGGINGFACE_FALLBACK_MODEL", "fallback/model")
    ai_module.limiter.reset()


def fake_post(monkeypatch, responses):
    """Replace the network call. `responses` maps model -> (status, body). Records the calls."""
    calls = []

    async def _post(url, headers, payload):
        calls.append({"url": url, "headers": headers, "payload": payload})
        return responses[payload["model"]]

    monkeypatch.setattr(llm, "_post", _post)
    return calls


BODY = {"messages": [{"role": "user", "content": "hi"}]}


def test_requires_sign_in(client):
    assert client.post("/api/ai/generate", json=BODY).status_code == 401
    assert client.get("/api/ai/status").status_code == 401
    assert client.post("/api/ai/test").status_code == 401


def test_generate_returns_content_and_sends_token_server_side(client, user_a, monkeypatch):
    headers, _ = user_a
    calls = fake_post(monkeypatch, {"primary/model": (200, OK_BODY)})

    response = client.post("/api/ai/generate", headers=headers, json={**BODY, "max_tokens": 50})

    assert response.status_code == 200, response.text
    assert response.json()["content"] == "Hello from the model"
    assert response.json()["model"] == "primary/model"
    assert calls[0]["headers"]["Authorization"] == "Bearer hf_test_token"
    assert calls[0]["payload"]["max_tokens"] == 50
    assert "hf_test_token" not in response.text


def test_json_mode_adds_an_instruction(client, user_a, monkeypatch):
    headers, _ = user_a
    calls = fake_post(monkeypatch, {"primary/model": (200, OK_BODY)})

    client.post(
        "/api/ai/generate",
        headers=headers,
        json={
            "messages": [
                {"role": "system", "content": "You are a screenwriter."},
                {"role": "user", "content": "Give me a character"},
            ],
            "json_mode": True,
        },
    )

    system = calls[0]["payload"]["messages"][0]["content"]
    assert system.startswith("You are a screenwriter.")
    assert "valid JSON" in system


def test_falls_back_when_primary_model_is_unavailable(client, user_a, monkeypatch):
    headers, _ = user_a
    calls = fake_post(
        monkeypatch,
        {"primary/model": (400, {"error": "model not supported"}), "fallback/model": (200, OK_BODY)},
    )

    response = client.post("/api/ai/generate", headers=headers, json=BODY)

    assert response.status_code == 200
    assert response.json()["model"] == "fallback/model"
    assert [c["payload"]["model"] for c in calls] == ["primary/model", "fallback/model"]


def test_no_credits_stops_immediately_with_a_clear_message(client, user_a, monkeypatch):
    headers, _ = user_a
    calls = fake_post(
        monkeypatch,
        {"primary/model": (402, {"error": "You have no remaining credits"}), "fallback/model": (200, OK_BODY)},
    )

    response = client.post("/api/ai/generate", headers=headers, json=BODY)

    assert response.status_code == 402
    assert "credits" in response.json()["detail"]
    assert len(calls) == 1  # the fallback would hit the same account, so it is not tried


def test_rejected_token_is_reported_without_leaking_it(client, user_a, monkeypatch):
    headers, _ = user_a
    fake_post(monkeypatch, {"primary/model": (401, {"error": "Invalid token hf_test_token"})})

    response = client.post("/api/ai/generate", headers=headers, json=BODY)

    assert response.status_code == 502
    assert "hf_test_token" not in response.text
    assert "Inference Providers" in response.json()["detail"]


def test_not_configured_returns_503(client, user_a, monkeypatch):
    headers, _ = user_a
    monkeypatch.setattr(settings, "HUGGINGFACE_API_TOKEN", "")
    assert client.get("/api/ai/status", headers=headers).json()["configured"] is False
    response = client.post("/api/ai/generate", headers=headers, json=BODY)
    assert response.status_code == 503
    assert "HUGGINGFACE_API_TOKEN" in response.json()["detail"]


def test_all_models_failing_returns_502(client, user_a, monkeypatch):
    headers, _ = user_a
    fake_post(monkeypatch, {"primary/model": (500, {}), "fallback/model": (200, {"choices": []})})
    assert client.post("/api/ai/generate", headers=headers, json=BODY).status_code == 502


def test_input_limits(client, user_a):
    headers, _ = user_a
    assert client.post("/api/ai/generate", headers=headers, json={"messages": []}).status_code == 422
    too_long = {"messages": [{"role": "user", "content": "x" * 200_001}]}
    assert client.post("/api/ai/generate", headers=headers, json=too_long).status_code == 422
    many = {"messages": [{"role": "user", "content": "x" * 150_000}] * 2}
    assert client.post("/api/ai/generate", headers=headers, json=many).status_code == 413
    assert client.post("/api/ai/generate", headers=headers, json={**BODY, "max_tokens": 99999}).status_code == 422
    bad_role = {"messages": [{"role": "tool", "content": "x"}]}
    assert client.post("/api/ai/generate", headers=headers, json=bad_role).status_code == 422


def test_rate_limit_is_per_user(client, user_a, user_b, monkeypatch):
    headers_a, _ = user_a
    headers_b, _ = user_b
    fake_post(monkeypatch, {"primary/model": (200, OK_BODY)})
    ai_module.limiter.limit = 2

    assert client.post("/api/ai/generate", headers=headers_a, json=BODY).status_code == 200
    assert client.post("/api/ai/generate", headers=headers_a, json=BODY).status_code == 200
    assert client.post("/api/ai/generate", headers=headers_a, json=BODY).status_code == 429
    assert client.post("/api/ai/generate", headers=headers_b, json=BODY).status_code == 200
    ai_module.limiter.limit = settings.AI_REQUESTS_PER_MINUTE


def test_test_endpoint_reports_failure_in_the_body(client, user_a, monkeypatch):
    headers, _ = user_a
    fake_post(monkeypatch, {"primary/model": (402, {"error": "no credits"})})
    response = client.post("/api/ai/test", headers=headers)
    assert response.status_code == 200
    assert response.json()["success"] is False
    assert "credits" in response.json()["message"]

    fake_post(monkeypatch, {"primary/model": (200, OK_BODY)})
    response = client.post("/api/ai/test", headers=headers)
    assert response.json()["success"] is True


# --- Groq provider -------------------------------------------------------------------------


@pytest.fixture
def groq(monkeypatch):
    monkeypatch.setattr(settings, "LLM_PROVIDER", "groq")
    monkeypatch.setattr(settings, "GROQ_API_KEY", "gsk_test_key")
    monkeypatch.setattr(settings, "GROQ_MODEL", "groq/primary")
    monkeypatch.setattr(settings, "GROQ_FALLBACK_MODEL", "groq/fallback")


def test_groq_calls_groq_with_the_server_key(client, user_a, monkeypatch, groq):
    headers, _ = user_a
    calls = fake_post(monkeypatch, {"groq/primary": (200, OK_BODY)})

    response = client.post("/api/ai/generate", headers=headers, json=BODY)

    assert response.status_code == 200, response.text
    assert response.json()["model"] == "groq/primary"
    assert calls[0]["url"] == "https://api.groq.com/openai/v1/chat/completions"
    assert calls[0]["headers"]["Authorization"] == "Bearer gsk_test_key"
    assert "gsk_test_key" not in response.text


def test_groq_json_mode_requests_a_json_object(client, user_a, monkeypatch, groq):
    headers, _ = user_a
    calls = fake_post(monkeypatch, {"groq/primary": (200, OK_BODY)})

    client.post("/api/ai/generate", headers=headers, json={**BODY, "json_mode": True})

    assert calls[0]["payload"]["response_format"] == {"type": "json_object"}


def test_groq_falls_back_to_its_second_model(client, user_a, monkeypatch, groq):
    headers, _ = user_a
    calls = fake_post(
        monkeypatch,
        {"groq/primary": (404, {"error": {"message": "model not found"}}), "groq/fallback": (200, OK_BODY)},
    )

    response = client.post("/api/ai/generate", headers=headers, json=BODY)

    assert response.json()["model"] == "groq/fallback"
    assert [c["payload"]["model"] for c in calls] == ["groq/primary", "groq/fallback"]


def test_groq_rejected_key_names_the_right_setting(client, user_a, monkeypatch, groq):
    headers, _ = user_a
    fake_post(monkeypatch, {"groq/primary": (401, {"error": {"message": "Invalid API Key"}})})

    response = client.post("/api/ai/generate", headers=headers, json=BODY)

    assert response.status_code == 502
    assert "GROQ_API_KEY" in response.json()["detail"]


def test_groq_not_configured_returns_503(client, user_a, monkeypatch, groq):
    headers, _ = user_a
    monkeypatch.setattr(settings, "GROQ_API_KEY", "")

    status = client.get("/api/ai/status", headers=headers).json()
    assert status["configured"] is False
    assert status["provider"] == "groq"
    response = client.post("/api/ai/generate", headers=headers, json=BODY)
    assert response.status_code == 503
    assert "GROQ_API_KEY" in response.json()["detail"]


def test_unknown_provider_is_a_configuration_error(client, user_a, monkeypatch):
    headers, _ = user_a
    monkeypatch.setattr(settings, "LLM_PROVIDER", "nope")
    response = client.post("/api/ai/generate", headers=headers, json=BODY)
    assert response.status_code == 503
    assert "LLM_PROVIDER" in response.json()["detail"]


# --- Run logging (AIRun) -------------------------------------------------------------------

from app.models import AIRun  # noqa: E402
from tests.test_api import create_project  # noqa: E402

USAGE_BODY = {
    "choices": [{"message": {"content": "ok"}}],
    "usage": {"prompt_tokens": 1000, "completion_tokens": 2000, "total_tokens": 3000},
}


def runs(test_db):
    return test_db.query(AIRun).order_by(AIRun.created_at).all()


def test_generate_records_a_run_with_tokens(client, test_db, user_a, monkeypatch):
    headers, user = user_a
    fake_post(monkeypatch, {"primary/model": (200, USAGE_BODY)})

    response = client.post("/api/ai/generate", headers=headers, json={**BODY, "task": "Research Leads"})

    assert response.status_code == 200, response.text
    [run] = runs(test_db)
    assert response.json()["run_id"] == str(run.id)
    assert str(run.user_id) == user["id"]
    assert str(run.organization_id) == user["organization_id"]
    assert run.project_id is None
    assert run.workflow_id == "generate"
    assert run.agent_id == "Research Leads"
    assert run.model_provider == "huggingface"
    assert run.model_id == "primary/model"
    assert (run.input_tokens, run.output_tokens, run.token_usage) == (1000, 2000, 3000)
    assert run.estimated_cost is None  # no published price for this model
    assert run.status == "completed"
    assert run.latency_ms is not None and run.completed_at is not None


def test_cost_is_estimated_for_priced_models(client, test_db, user_a, monkeypatch, groq):
    headers, _ = user_a
    monkeypatch.setattr(settings, "GROQ_MODEL", "openai/gpt-oss-120b")
    fake_post(monkeypatch, {"openai/gpt-oss-120b": (200, USAGE_BODY)})

    client.post("/api/ai/generate", headers=headers, json=BODY)

    [run] = runs(test_db)
    # 1,000 input tokens at $0.15/M + 2,000 output tokens at $0.60/M
    assert run.estimated_cost == pytest.approx(0.00135)


def test_missing_usage_leaves_token_fields_empty(client, test_db, user_a, monkeypatch):
    headers, _ = user_a
    fake_post(monkeypatch, {"primary/model": (200, OK_BODY)})

    client.post("/api/ai/generate", headers=headers, json=BODY)

    [run] = runs(test_db)
    assert (run.input_tokens, run.output_tokens, run.token_usage, run.estimated_cost) == (None, None, None, None)
    assert run.agent_id == "unspecified"


def test_failed_generation_is_recorded(client, test_db, user_a, monkeypatch):
    headers, _ = user_a
    fake_post(monkeypatch, {"primary/model": (402, {"error": "no credits"})})

    response = client.post("/api/ai/generate", headers=headers, json=BODY)

    assert response.status_code == 402
    [run] = runs(test_db)
    assert run.status == "failed"
    assert run.error_code == "AI_CREDITS_REQUIRED"
    assert run.model_provider == "huggingface"


def test_run_can_be_linked_to_an_accessible_project(client, test_db, user_a, monkeypatch):
    headers, _ = user_a
    project = create_project(client, headers)
    fake_post(monkeypatch, {"primary/model": (200, OK_BODY)})

    response = client.post("/api/ai/generate", headers=headers, json={**BODY, "project_id": project["id"]})

    assert response.status_code == 200, response.text
    [run] = runs(test_db)
    assert str(run.project_id) == project["id"]


def test_cannot_log_runs_against_another_users_project(client, test_db, user_a, user_b, monkeypatch):
    headers_a, _ = user_a
    headers_b, _ = user_b
    project = create_project(client, headers_a)
    calls = fake_post(monkeypatch, {"primary/model": (200, OK_BODY)})

    response = client.post("/api/ai/generate", headers=headers_b, json={**BODY, "project_id": project["id"]})

    assert response.status_code == 404
    assert calls == []
    assert runs(test_db) == []


# --- Structured output (JSON mode and output_schema) --------------------------------------

import json  # noqa: E402

FINDINGS_SCHEMA = {
    "type": "object",
    "required": ["topics"],
    "properties": {
        "topics": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["topic", "claim"],
                "properties": {"topic": {"type": "string"}, "claim": {"type": "string"}},
            },
        }
    },
}


def body_with(content, prompt_tokens=10, completion_tokens=20):
    return {
        "choices": [{"message": {"content": content}}],
        "usage": {"prompt_tokens": prompt_tokens, "completion_tokens": completion_tokens},
    }


def sequenced_post(monkeypatch, replies):
    """Replace the network call with replies returned in order, whatever the model."""
    calls = []
    queue = list(replies)

    async def _post(url, headers, payload):
        calls.append(payload)
        return queue.pop(0)

    monkeypatch.setattr(llm, "_post", _post)
    return calls


def test_json_mode_returns_parsed_data(client, test_db, user_a, monkeypatch):
    headers, _ = user_a
    sequenced_post(monkeypatch, [(200, body_with('```json\n{"a": 1}\n```'))])

    response = client.post("/api/ai/generate", headers=headers, json={**BODY, "json_mode": True})

    assert response.status_code == 200, response.text
    assert response.json()["data"] == {"a": 1}
    [run] = runs(test_db)
    assert run.validation_status == "valid"


def test_json_inside_prose_and_a_code_fence_is_found(client, user_a, monkeypatch):
    headers, _ = user_a
    reply = 'Here you go:\n```json\n{"a": [1, 2]}\n```\nLet me know if you need more.'
    sequenced_post(monkeypatch, [(200, body_with(reply))])

    response = client.post("/api/ai/generate", headers=headers, json={**BODY, "json_mode": True})

    assert response.json()["data"] == {"a": [1, 2]}


def test_plain_text_mode_is_not_validated(client, test_db, user_a, monkeypatch):
    headers, _ = user_a
    sequenced_post(monkeypatch, [(200, body_with("just prose"))])

    response = client.post("/api/ai/generate", headers=headers, json=BODY)

    assert response.json()["data"] is None
    [run] = runs(test_db)
    assert run.validation_status is None


def test_invalid_json_is_retried_once_with_the_problem_explained(client, test_db, user_a, monkeypatch):
    headers, _ = user_a
    calls = sequenced_post(
        monkeypatch,
        [(200, body_with("Sure! {not json", 10, 20)), (200, body_with('{"a": 2}', 30, 40))],
    )

    response = client.post("/api/ai/generate", headers=headers, json={**BODY, "json_mode": True})

    assert response.status_code == 200, response.text
    assert response.json()["data"] == {"a": 2}
    assert len(calls) == 2
    retry_messages = calls[1]["messages"]
    assert retry_messages[-2] == {"role": "assistant", "content": "Sure! {not json"}
    assert "not valid JSON" in retry_messages[-1]["content"]
    [run] = runs(test_db)
    assert (run.input_tokens, run.output_tokens) == (40, 60)  # both attempts
    assert run.validation_status == "valid_after_retry"


def test_schema_violations_are_named_in_the_retry(client, test_db, user_a, monkeypatch):
    headers, _ = user_a
    good = {"topics": [{"topic": "Forts", "claim": "Built in 1670"}]}
    calls = sequenced_post(
        monkeypatch,
        [(200, body_with(json.dumps({"topics": [{"topic": "Forts"}]}))), (200, body_with(json.dumps(good)))],
    )

    response = client.post(
        "/api/ai/generate", headers=headers, json={**BODY, "output_schema": FINDINGS_SCHEMA}
    )

    assert response.status_code == 200, response.text
    assert response.json()["data"] == good
    assert "'claim' is a required property" in calls[1]["messages"][-1]["content"]
    assert "topics/0" in calls[1]["messages"][-1]["content"]
    # A schema implies JSON mode: the system instruction and the schema are sent.
    assert "valid JSON" in calls[0]["messages"][0]["content"]
    assert '"required"' in calls[0]["messages"][0]["content"]


def test_output_that_stays_invalid_fails_clearly(client, test_db, user_a, monkeypatch):
    headers, _ = user_a
    sequenced_post(monkeypatch, [(200, body_with("nope")), (200, body_with("still nope"))])

    response = client.post("/api/ai/generate", headers=headers, json={**BODY, "json_mode": True})

    assert response.status_code == 502
    assert "did not return valid JSON" in response.json()["detail"]
    [run] = runs(test_db)
    assert run.status == "failed"
    assert run.error_code == "AI_VALIDATION_FAILED"
    assert run.validation_status == "invalid"
    assert (run.input_tokens, run.output_tokens) == (20, 40)


def test_an_invalid_schema_is_rejected_before_calling_the_model(client, user_a, monkeypatch):
    headers, _ = user_a
    calls = sequenced_post(monkeypatch, [])

    response = client.post(
        "/api/ai/generate", headers=headers, json={**BODY, "output_schema": {"type": "not-a-type"}}
    )

    assert response.status_code == 422
    assert calls == []
