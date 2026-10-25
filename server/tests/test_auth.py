"""Authentication, provisioning and tenant-isolation tests."""

import time
import uuid

import jwt
import pytest

from tests.conftest import auth_headers, make_token

PROTECTED_GETS = [
    "/api/me",
    "/api/projects",
    "/api/organizations",
    f"/api/projects/{uuid.uuid4()}",
    f"/api/characters?project_id={uuid.uuid4()}",
    f"/api/stories?project_id={uuid.uuid4()}",
    f"/api/research/plans?project_id={uuid.uuid4()}",
    f"/api/approvals/project/{uuid.uuid4()}",
    f"/api/analytics/{uuid.uuid4()}/dependencies/validate",
    f"/api/workflows/{uuid.uuid4()}",
]


@pytest.mark.parametrize("path", PROTECTED_GETS)
def test_requests_without_token_are_rejected(client, path):
    assert client.get(path).status_code == 401


def test_invalid_tokens_are_rejected(client):
    claims = {"sub": "x", "aud": "authenticated", "exp": int(time.time()) + 60}
    bad_secret = jwt.encode(claims, "wrong-secret-wrong-secret-wrong-secret", "HS256")
    expired = make_token("x", exp=int(time.time()) - 10)
    wrong_audience = make_token("x", aud="somebody-else")
    unsigned = jwt.encode({"sub": "x"}, key=None, algorithm="none")
    for token in (bad_secret, expired, wrong_audience, unsigned, "not-a-jwt"):
        response = client.get("/api/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 401, token


def test_unprovisioned_user_gets_403_until_bootstrap(client):
    headers = auth_headers("newcomer")
    assert client.get("/api/me", headers=headers).status_code == 403

    created = client.post("/api/me", headers=headers)
    assert created.status_code == 200
    assert client.get("/api/me", headers=headers).json()["id"] == created.json()["id"]


def test_provisioning_is_idempotent(client):
    headers = auth_headers("repeat")
    first = client.post("/api/me", headers=headers).json()
    second = client.post("/api/me", headers=headers).json()
    assert first["id"] == second["id"]
    assert first["organization_id"] == second["organization_id"]


def test_duplicate_email_for_different_identity_is_rejected(client):
    first = client.post("/api/me", headers=auth_headers("one", email="same@example.com"))
    second = client.post("/api/me", headers=auth_headers("two", email="same@example.com"))
    assert first.status_code == 200
    assert second.status_code == 409


def test_auth_not_configured_fails_closed(client, monkeypatch):
    from app.config import settings

    headers = auth_headers("x")
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", "")
    monkeypatch.setattr(settings, "SUPABASE_URL", "")
    assert client.get("/api/me", headers=headers).status_code == 503


def test_user_cannot_access_another_tenants_project(client, user_a, user_b):
    headers_a, _ = user_a
    headers_b, _ = user_b
    project = client.post("/api/projects", headers=headers_a, json={"title": "Private"}).json()
    pid = project["id"]
    q = f"project_id={pid}"

    # Every project-scoped route returns 404 (not 403) so ids cannot be probed.
    assert client.get(f"/api/projects/{pid}", headers=headers_b).status_code == 404
    assert client.put(f"/api/projects/{pid}", headers=headers_b, json={"title": "x"}).status_code == 404
    assert client.delete(f"/api/projects/{pid}", headers=headers_b).status_code == 404
    assert client.get(f"/api/projects/{pid}/intent", headers=headers_b).status_code == 404
    assert client.get(f"/api/projects/{pid}/intelligence", headers=headers_b).status_code == 404
    assert client.get(f"/api/characters?{q}", headers=headers_b).status_code == 404
    assert client.post(f"/api/characters?{q}", headers=headers_b, json={"name": "x"}).status_code == 404
    assert client.get(f"/api/stories?{q}", headers=headers_b).status_code == 404
    assert client.get(f"/api/research/plans?{q}", headers=headers_b).status_code == 404
    assert client.get(f"/api/approvals/project/{pid}", headers=headers_b).status_code == 404
    assert client.get(f"/api/analytics/{pid}/dependencies/validate", headers=headers_b).status_code == 404
    workflow = {"project_id": pid, "workflow_type": "intent", "user_input": "x"}
    assert client.post("/api/workflows", headers=headers_b, json=workflow).status_code == 404

    # The owner is unaffected.
    assert client.get(f"/api/projects/{pid}", headers=headers_a).status_code == 200


def test_cross_tenant_artifact_and_approval_are_hidden(client, user_a, user_b):
    headers_a, _ = user_a
    headers_b, _ = user_b
    project = client.post("/api/projects", headers=headers_a, json={"title": "Private"}).json()
    version = client.post(
        f"/api/artifacts?project_id={project['id']}",
        headers=headers_a,
        json={"artifact_type": "story", "artifact_id": str(uuid.uuid4()), "content": "secret"},
    ).json()

    assert client.get(f"/api/artifacts/{version['id']}", headers=headers_b).status_code == 404
    approve = {"decision": "APPROVED"}
    assert client.post(f"/api/approvals/{version['id']}", headers=headers_b, json=approve).status_code == 404
    assert client.get(f"/api/approvals/{version['id']}", headers=headers_b).status_code == 404


def test_organizations_are_scoped_to_the_caller(client, user_a, user_b):
    headers_a, user = user_a
    _, other = user_b

    listed = client.get("/api/organizations", headers=headers_a).json()
    assert [o["id"] for o in listed] == [user["organization_id"]]
    other_org = other["organization_id"]
    assert client.get(f"/api/organizations/{other_org}", headers=headers_a).status_code == 404
    assert client.get(f"/api/organizations/{other_org}/users", headers=headers_a).status_code == 404
    own_org = user["organization_id"]
    assert client.get(f"/api/organizations/{own_org}/users", headers=headers_a).status_code == 200
