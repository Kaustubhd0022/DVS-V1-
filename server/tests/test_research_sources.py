"""Source retrieval (Wikipedia) and quote checking. The Wikipedia network call is replaced."""

import pytest

from app.services import retrieval
from app.services.quote_check import find_excerpt
from tests.test_api import create_project

ARTICLE_TEXT = (
    "Sindhudurg is a fort in the Konkan region of Maharashtra.\n\n"
    "Construction of the fort began in 1664 on the orders of Shivaji, using an island off "
    "the coast at Malvan. The walls rise from the sea and were built to withstand the "
    "monsoon swell. It was one of the principal naval bases of the Maratha navy."
)

SEARCH_BODY = {
    "query": {
        "search": [
            {"title": "Sindhudurg Fort", "pageid": 101, "snippet": 'A <span class="searchmatch">sea fort</span> built in 1664'},
            {"title": "Vijaydurg Fort", "pageid": 102, "snippet": "Another coastal fort"},
        ]
    }
}

PAGE_BODY = {
    "query": {
        "pages": [
            {
                "pageid": 101,
                "title": "Sindhudurg Fort",
                "extract": ARTICLE_TEXT,
                "fullurl": "https://en.wikipedia.org/wiki/Sindhudurg_Fort",
                "revisions": [{"revid": 555, "timestamp": "2026-09-01T10:00:00Z"}],
            }
        ]
    }
}


@pytest.fixture
def wiki(monkeypatch):
    """Replace the network call; answers search and page requests. Records the calls."""
    calls = []

    async def _get(url, params):
        calls.append({"url": url, "params": params})
        if params.get("list") == "search":
            return 200, SEARCH_BODY
        if params.get("titles") == "Missing Page":
            return 200, {"query": {"pages": [{"title": "Missing Page", "missing": True}]}}
        return 200, PAGE_BODY

    monkeypatch.setattr(retrieval, "_get", _get)
    return calls


@pytest.fixture
def project(client, user_a):
    headers, _ = user_a
    return headers, create_project(client, headers)


def fetch_article(client, headers, project_id, title="Sindhudurg Fort"):
    return client.post(
        f"/api/research/sources?project_id={project_id}",
        headers=headers,
        json={"title": title, "language": "en"},
    )


# --- quote matching ------------------------------------------------------------------------


def test_finds_a_quote_despite_spacing_quotes_and_case():
    text = "He said “the walls rise from the sea” and left."
    span = find_excerpt(text, '"The walls rise from   the sea"')
    assert span is not None
    assert text[span[0] : span[1]] == "the walls rise from the sea"


def test_quotes_survive_ocr_spacing_errors():
    ocr_text = "Sindhudurg F ort was built on Kur te island in 1664."
    span = find_excerpt(ocr_text, "Sindhudurg Fort was built on Kurte island")
    assert span is not None
    assert ocr_text[span[0] : span[1]] == "Sindhudurg F ort was built on Kur te island"


def test_spacing_tolerance_still_needs_every_character_in_order():
    assert find_excerpt("Sindhudurg F ort was built on Kurte island", "Sindhudurg Fort was rebuilt on Kurte island") is None


def test_a_quote_that_is_not_in_the_text_is_not_found():
    assert find_excerpt(ARTICLE_TEXT, "The fort was built in 1700 by the British navy") is None


# --- search and fetch ----------------------------------------------------------------------


def test_search_returns_titles_urls_and_plain_snippets(client, project, wiki):
    headers, p = project
    response = client.post(
        f"/api/research/sources/search?project_id={p['id']}",
        headers=headers,
        json={"query": "Konkan sea forts", "language": "en"},
    )

    assert response.status_code == 200, response.text
    first = response.json()["results"][0]
    assert first == {
        "title": "Sindhudurg Fort",
        "url": "https://en.wikipedia.org/wiki/Sindhudurg_Fort",
        "snippet": "A sea fort built in 1664",
        "source_tier": "secondary",
    }
    assert wiki[0]["url"] == "https://en.wikipedia.org/w/api.php"
    assert wiki[0]["params"]["srsearch"] == "Konkan sea forts"


def test_fetch_stores_the_article_text_with_its_revision(client, project, wiki):
    headers, p = project

    response = fetch_article(client, headers, p["id"])

    assert response.status_code == 200, response.text
    doc = response.json()
    assert doc["title"] == "Sindhudurg Fort"
    assert doc["url"] == "https://en.wikipedia.org/wiki/Sindhudurg_Fort"
    assert doc["provider"] == "wikipedia"
    assert doc["revision_id"] == "555"
    assert doc["text_length"] == len(ARTICLE_TEXT)
    assert len(doc["content_hash"]) == 64

    full = client.get(f"/api/research/sources/{doc['id']}?project_id={p['id']}", headers=headers)
    assert full.json()["text"] == ARTICLE_TEXT


def test_fetching_the_same_revision_twice_reuses_the_document(client, project, wiki):
    headers, p = project
    first = fetch_article(client, headers, p["id"]).json()
    second = fetch_article(client, headers, p["id"]).json()

    assert first["id"] == second["id"]
    listed = client.get(f"/api/research/sources?project_id={p['id']}", headers=headers).json()
    assert len(listed) == 1
    assert "text" not in listed[0]


def test_missing_article_returns_404(client, project, wiki):
    headers, p = project
    response = fetch_article(client, headers, p["id"], title="Missing Page")
    assert response.status_code == 404


@pytest.mark.parametrize("language", ["evil.example.com/x", "en.wikipedia.org#", "EN", "e", ""])
def test_language_codes_cannot_change_the_host(client, project, wiki, language):
    headers, p = project
    response = client.post(
        f"/api/research/sources/search?project_id={p['id']}",
        headers=headers,
        json={"query": "forts", "language": language},
    )
    assert response.status_code == 422
    assert wiki == []


def test_wikipedia_outage_is_reported_as_502(client, project, monkeypatch):
    headers, p = project

    async def _get(url, params):
        return 503, {}

    monkeypatch.setattr(retrieval, "_get", _get)
    response = fetch_article(client, headers, p["id"])
    assert response.status_code == 502


def test_sources_are_isolated_per_project(client, project, user_b, wiki):
    headers, p = project
    doc = fetch_article(client, headers, p["id"]).json()
    headers_b, _ = user_b
    other = create_project(client, headers_b, title="Other")

    response = client.get(f"/api/research/sources/{doc['id']}?project_id={other['id']}", headers=headers_b)
    assert response.status_code == 404


# --- evidence linked to a document ---------------------------------------------------------


def create_evidence(client, headers, project_id, **fields):
    body = {"source_type": "web", "claim": "Sindhudurg was begun in 1664", **fields}
    return client.post(f"/api/research/evidence?project_id={project_id}", headers=headers, json=body)


def test_evidence_with_a_quote_found_in_the_source_is_marked_quote_found(client, project, wiki):
    headers, p = project
    doc = fetch_article(client, headers, p["id"]).json()
    excerpt = "Construction of the fort began in 1664 on the orders of Shivaji"

    response = create_evidence(client, headers, p["id"], document_id=doc["id"], supporting_excerpt=excerpt)

    assert response.status_code == 200, response.text
    evidence = response.json()
    assert evidence["validation_status"] == "quote_found"
    assert evidence["document_id"] == doc["id"]
    assert evidence["source_url"] == doc["url"]
    assert evidence["publisher"] == "Wikipedia"
    assert ARTICLE_TEXT[evidence["excerpt_start"] : evidence["excerpt_end"]] == excerpt


def test_evidence_with_a_quote_not_in_the_source_is_rejected(client, project, wiki):
    headers, p = project
    doc = fetch_article(client, headers, p["id"]).json()

    response = create_evidence(
        client, headers, p["id"], document_id=doc["id"],
        supporting_excerpt="The fort was completed by the British in 1820",
    )

    assert response.status_code == 422
    assert "not found in the source" in response.json()["detail"]


def test_a_quote_must_be_long_enough_to_mean_something(client, project, wiki):
    headers, p = project
    doc = fetch_article(client, headers, p["id"]).json()

    response = create_evidence(client, headers, p["id"], document_id=doc["id"], supporting_excerpt="the fort")

    assert response.status_code == 422


def test_evidence_cannot_use_another_projects_document(client, project, user_b, wiki):
    headers, p = project
    doc = fetch_article(client, headers, p["id"]).json()
    headers_b, _ = user_b
    other = create_project(client, headers_b, title="Other")

    response = create_evidence(
        client, headers_b, other["id"], document_id=doc["id"],
        supporting_excerpt="Construction of the fort began in 1664 on the orders of Shivaji",
    )
    assert response.status_code == 404


def test_changing_the_excerpt_rechecks_it(client, project, wiki):
    headers, p = project
    doc = fetch_article(client, headers, p["id"]).json()
    evidence = create_evidence(
        client, headers, p["id"], document_id=doc["id"],
        supporting_excerpt="Construction of the fort began in 1664 on the orders of Shivaji",
    ).json()
    url = f"/api/research/evidence/{evidence['id']}?project_id={p['id']}"

    bad = client.put(url, headers=headers, json={"supporting_excerpt": "It was built by aliens in the year 3000"})
    assert bad.status_code == 422

    good = client.put(url, headers=headers, json={"supporting_excerpt": "one of the principal naval bases of the Maratha navy"})
    assert good.status_code == 200, good.text
    assert good.json()["validation_status"] == "quote_found"


def test_clients_cannot_set_validation_status_directly(client, project, wiki):
    headers, p = project
    evidence = create_evidence(client, headers, p["id"]).json()
    url = f"/api/research/evidence/{evidence['id']}?project_id={p['id']}"

    response = client.put(url, headers=headers, json={"validation_status": "verified", "claim": "Edited"})

    assert response.status_code == 200
    assert response.json()["validation_status"] == "unverified"
    assert response.json()["claim"] == "Edited"
