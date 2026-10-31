"""Web search restricted to approved sites (Tavily). The network call is replaced."""

import pytest

from app.config import settings
from app.services import source_registry, web_search
from tests.test_api import create_project

TAVILY_BODY = {
    "results": [
        {"title": "Sindhudurg Fort - ASI", "url": "https://asi.nic.in/sindhudurg", "content": "Built 1664-1667"},
        {"title": "Konkan forts", "url": "https://www.maharashtratourism.gov.in/forts", "content": "Sea forts"},
        {"title": "Some blog", "url": "https://randomblog.example.com/forts", "content": "Not approved"},
    ]
}


@pytest.fixture
def tavily(monkeypatch):
    monkeypatch.setattr(settings, "TAVILY_API_KEY", "tvly-test")
    calls = []

    async def _post(url, headers, payload):
        calls.append({"url": url, "headers": headers, "payload": payload})
        return 200, TAVILY_BODY

    monkeypatch.setattr(web_search, "_post", _post)
    return calls


@pytest.fixture
def project(client, user_a):
    headers, _ = user_a
    return headers, create_project(client, headers)


def search(client, headers, project_id, **body):
    return client.post(
        f"/api/research/sources/search?project_id={project_id}", headers=headers, json={"query": "Konkan sea forts", **body}
    )


def test_primary_search_is_restricted_to_government_domains(client, project, tavily):
    headers, p = project

    response = search(client, headers, p["id"], scope="primary")

    assert response.status_code == 200, response.text
    sent = tavily[0]
    assert sent["url"] == "https://api.tavily.com/search"
    assert sent["headers"]["Authorization"] == "Bearer tvly-test"
    assert sent["payload"]["include_domains"] == source_registry.domains_for("primary")
    assert sent["payload"]["query"] == "Konkan sea forts"


def test_results_off_the_approved_list_are_dropped(client, project, tavily):
    headers, p = project

    results = search(client, headers, p["id"], scope="primary").json()["results"]

    assert [r["url"] for r in results] == [
        "https://asi.nic.in/sindhudurg",
        "https://www.maharashtratourism.gov.in/forts",
    ]
    assert all(r["source_tier"] == "primary" for r in results)
    assert results[0]["snippet"] == "Built 1664-1667"


def test_secondary_search_uses_the_open_reference_domains(client, project, tavily):
    headers, p = project
    search(client, headers, p["id"], scope="secondary")
    assert tavily[0]["payload"]["include_domains"] == source_registry.domains_for("secondary")


def test_web_search_without_a_key_explains_the_setting(client, project, monkeypatch):
    headers, p = project
    monkeypatch.setattr(settings, "TAVILY_API_KEY", "")

    response = search(client, headers, p["id"], scope="primary")

    assert response.status_code == 503
    assert "TAVILY_API_KEY" in response.json()["detail"]


def test_tavily_errors_do_not_leak_the_key(client, project, monkeypatch, tavily):
    headers, p = project

    async def _post(url, headers, payload):
        return 401, {"detail": {"error": "Invalid API key tvly-test"}}

    monkeypatch.setattr(web_search, "_post", _post)
    response = search(client, headers, p["id"], scope="primary")

    assert response.status_code == 502
    assert "tvly-test" not in response.text


def test_wikipedia_remains_the_default_scope(client, project, monkeypatch):
    headers, p = project
    from app.services import retrieval

    async def _get(url, params):
        return 200, {"query": {"search": [{"title": "Sindhudurg Fort", "snippet": "fort"}]}}

    monkeypatch.setattr(retrieval, "_get", _get)
    results = search(client, headers, p["id"]).json()["results"]
    assert results[0]["source_tier"] == "secondary"
