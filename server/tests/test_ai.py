"""AI proxy tests. The HuggingFace network call is replaced; no real request is made."""

import pytest

from app.api import ai as ai_module
from app.config import settings
from app.services import llm
from tests.conftest import auth_headers

OK_BODY = {"choices": [{"message": {"content": "  Hello from the model  "}}]}


@pytest.fixture(autouse=True)
def configured(monkeypatch):
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
