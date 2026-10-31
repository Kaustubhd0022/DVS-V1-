"""Offline sources (books, interviews, field and archive visits) recorded as attested evidence."""

import pytest

from tests.test_api import create_project

BOOK = {
    "kind": "book",
    "title": "Sea Forts of the Konkan",
    "author": "R. V. Gadre",
    "publisher": "Maharashtra Rajya Sahitya Sanskriti Mandal",
    "year": "1978",
    "page": "112-113",
}


@pytest.fixture
def project(client, user_a):
    headers, user = user_a
    return headers, user, create_project(client, headers)


def record(client, headers, project_id, citation, **fields):
    body = {
        "claim": "Lead was poured into the foundation stones of Sindhudurg",
        "excerpt": "molten lead was poured between the foundation blocks",
        "source_tier": "secondary",
        "citation": citation,
        "attested": True,
        **fields,
    }
    return client.post(f"/api/research/evidence/attested?project_id={project_id}", headers=headers, json=body)


def test_a_book_citation_is_recorded_as_attested_evidence(client, project):
    headers, user, p = project

    response = record(client, headers, p["id"], BOOK)

    assert response.status_code == 200, response.text
    evidence = response.json()
    assert evidence["validation_status"] == "attested"
    assert evidence["source_kind"] == "book"
    assert evidence["source_tier"] == "secondary"
    assert evidence["citation"]["page"] == "112-113"
    assert evidence["attested_by"] == user["id"]
    assert evidence["attested_at"] is not None
    assert evidence["document_id"] is None
    assert evidence["publisher"] == "Maharashtra Rajya Sahitya Sanskriti Mandal"


def test_an_interview_needs_consent_and_is_field_research(client, project):
    headers, _, p = project
    interview = {
        "kind": "interview",
        "informant": "Fisherman, Malvan jetty (name withheld)",
        "date": "2026-09-14",
        "place": "Malvan, Sindhudurg district",
        "interviewer": "A. Kulkarni",
        "consent_confirmed": True,
        "recording_reference": "Audio file MLV-014",
    }

    response = record(client, headers, p["id"], interview, source_tier="primary")

    assert response.status_code == 200, response.text
    # Interviews and field visits are field research, whatever tier the client sends.
    assert response.json()["source_tier"] == "field"

    no_consent = record(client, headers, p["id"], {**interview, "consent_confirmed": False})
    assert no_consent.status_code == 422
    assert "consent" in no_consent.json()["detail"]


def test_field_and_archive_visits_are_supported(client, project):
    headers, _, p = project
    field = {"kind": "field_visit", "place": "Sindhudurg Fort, north rampart", "date": "2026-09-15", "observer": "A. Kulkarni"}
    archive = {
        "kind": "archive_visit",
        "archive": "Maharashtra State Archives, Pune",
        "record_reference": "Peshwa Daftar, Rumal 214",
        "folio": "17",
        "date": "2026-08-02",
    }

    assert record(client, headers, p["id"], field).json()["source_tier"] == "field"
    archived = record(client, headers, p["id"], archive, source_tier="primary")
    assert archived.status_code == 200, archived.text
    assert archived.json()["source_tier"] == "primary"


@pytest.mark.parametrize("citation", [
    {"kind": "book", "title": "No author or page"},
    {"kind": "interview", "informant": "X", "consent_confirmed": True},
    {"kind": "field_visit", "place": "Somewhere"},
    {"kind": "archive_visit", "archive": "Somewhere"},
    {"kind": "rumour", "detail": "heard it somewhere"},
])
def test_each_kind_requires_its_citation_details(client, project, citation):
    headers, _, p = project
    assert record(client, headers, p["id"], citation).status_code == 422


def test_the_researcher_must_attest(client, project):
    headers, _, p = project
    response = record(client, headers, p["id"], BOOK, attested=False)
    assert response.status_code == 422
    assert "attest" in response.json()["detail"]


def test_the_excerpt_must_say_something(client, project):
    headers, _, p = project
    assert record(client, headers, p["id"], BOOK, excerpt="see book").status_code == 422


def test_attested_evidence_is_listed_and_isolated(client, project, user_b):
    headers, _, p = project
    evidence = record(client, headers, p["id"], BOOK).json()

    listed = client.get(f"/api/research/evidence?project_id={p['id']}", headers=headers).json()
    assert [e["id"] for e in listed] == [evidence["id"]]

    headers_b, _ = user_b
    other = create_project(client, headers_b, title="Other")
    leaked = client.get(f"/api/research/evidence/{evidence['id']}?project_id={other['id']}", headers=headers_b)
    assert leaked.status_code == 404
