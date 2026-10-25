"""
API integration tests (authenticated).

Auth, provisioning and cross-tenant isolation are covered in test_auth.py.
"""


def create_project(client, headers, title="Test Story"):
    response = client.post(
        "/api/projects",
        headers=headers,
        json={"title": title, "format": "Feature Film", "genre": "Drama"},
    )
    assert response.status_code == 200, response.text
    return response.json()


def test_health_check(client):
    response = client.get("/api/health/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["name"] == "TattvaCo"


def test_create_and_get_project(client, user_a):
    headers, user = user_a
    project = create_project(client, headers)

    assert project["title"] == "Test Story"
    assert project["owner_id"] == user["id"]
    assert project["organization_id"] == user["organization_id"]

    response = client.get(f"/api/projects/{project['id']}", headers=headers)
    assert response.status_code == 200
    assert response.json()["format"] == "Feature Film"


def test_list_projects_only_returns_own_and_hides_archived(client, user_a, user_b):
    headers_a, _ = user_a
    headers_b, _ = user_b
    keep = create_project(client, headers_a, "Keep")
    gone = create_project(client, headers_a, "Gone")
    create_project(client, headers_b, "Other tenant")

    assert client.delete(f"/api/projects/{gone['id']}", headers=headers_a).status_code == 200

    response = client.get("/api/projects", headers=headers_a)
    assert response.status_code == 200
    assert [p["id"] for p in response.json()] == [keep["id"]]


def test_update_project(client, user_a):
    headers, _ = user_a
    project = create_project(client, headers)

    response = client.put(
        f"/api/projects/{project['id']}",
        headers=headers,
        json={"title": "Updated Title", "format": "Short Film"},
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"
    assert response.json()["format"] == "Short Film"


def test_delete_project_is_soft(client, user_a):
    headers, _ = user_a
    project = create_project(client, headers)

    assert client.delete(f"/api/projects/{project['id']}", headers=headers).status_code == 200

    response = client.get(f"/api/projects/{project['id']}", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "ARCHIVED"


def test_create_and_update_intent(client, user_a):
    headers, _ = user_a
    project = create_project(client, headers)
    body = {
        "intent": "Create a compelling drama",
        "knowns": {"setting": "NYC"},
        "unknowns": {"theme": None},
        "assumptions": ["Contemporary setting"],
    }

    response = client.post(f"/api/projects/{project['id']}/intent", headers=headers, json=body)
    assert response.status_code == 200
    assert response.json()["assumptions"] == ["Contemporary setting"]

    body["intent"] = "Revised"
    client.post(f"/api/projects/{project['id']}/intent", headers=headers, json=body)
    response = client.get(f"/api/projects/{project['id']}/intent", headers=headers)
    assert response.json()["intent"] == "Revised"


def test_character_crud(client, user_a):
    headers, _ = user_a
    project = create_project(client, headers)
    q = f"project_id={project['id']}"

    response = client.post(
        f"/api/characters?{q}",
        headers=headers,
        json={"name": "Mira", "motivation": "Truth", "profile": {"role": "Protagonist"}},
    )
    assert response.status_code == 200, response.text
    character_id = response.json()["id"]

    response = client.put(
        f"/api/characters/{character_id}?{q}", headers=headers, json={"voice": "Quiet"}
    )
    assert response.status_code == 200
    assert response.json()["voice"] == "Quiet"

    assert len(client.get(f"/api/characters?{q}", headers=headers).json()) == 1
    assert client.delete(f"/api/characters/{character_id}?{q}", headers=headers).status_code == 200
    assert client.get(f"/api/characters?{q}", headers=headers).json() == []


def test_story_and_research_create(client, user_a):
    headers, _ = user_a
    project = create_project(client, headers)
    q = f"project_id={project['id']}"

    response = client.post(
        f"/api/stories?{q}", headers=headers, json={"premise": "A", "themes": ["loss"]}
    )
    assert response.status_code == 200, response.text

    response = client.post(
        f"/api/research/plans?{q}", headers=headers, json={"questions": ["Q1"], "scope": "history"}
    )
    assert response.status_code == 200, response.text

    response = client.post(
        f"/api/research/evidence?{q}",
        headers=headers,
        json={"source_type": "web", "claim": "A claim", "source_url": "https://example.com"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["validation_status"] == "unverified"


def test_artifact_version_and_approval_flow(client, user_a):
    headers, user = user_a
    project = create_project(client, headers)
    artifact_id = "11111111-1111-1111-1111-111111111111"

    response = client.post(
        f"/api/artifacts?project_id={project['id']}",
        headers=headers,
        json={"artifact_type": "story", "artifact_id": artifact_id, "content": "v1"},
    )
    assert response.status_code == 200, response.text
    version = response.json()
    assert version["version_number"] == 1

    response = client.post(
        f"/api/approvals/{version['id']}",
        headers=headers,
        json={"decision": "APPROVED", "notes": "ok", "approved_by": "ignored"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["approver_id"] == user["id"]  # taken from the token, not the body

    response = client.get(f"/api/artifacts/{version['id']}", headers=headers)
    assert response.json()["status"] == "HUMAN_APPROVED"


def test_workflow_runs_for_own_project(client, user_a):
    headers, _ = user_a
    project = create_project(client, headers)
    response = client.post(
        "/api/workflows",
        headers=headers,
        json={"project_id": project["id"], "workflow_type": "intent", "user_input": "idea"},
    )
    assert response.status_code == 200, response.text
