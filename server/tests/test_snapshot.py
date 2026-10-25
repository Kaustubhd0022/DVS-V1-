"""Project snapshot (whole-document persistence) and import tests."""

import uuid


def import_project(client, headers, **overrides):
    body = {"title": "Imported", "data": {"title": "Imported", "scenes": [1, 2]}}
    body.update(overrides)
    return client.post("/api/projects/import", headers=headers, json=body)


def test_import_creates_project_and_snapshot(client, user_a):
    headers, user = user_a
    response = import_project(client, headers)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["project"]["owner_id"] == user["id"]
    assert body["snapshot"]["version"] == 1
    assert body["snapshot"]["data"]["scenes"] == [1, 2]

    pid = body["project"]["id"]
    assert [p["id"] for p in client.get("/api/projects", headers=headers).json()] == [pid]
    assert client.get(f"/api/projects/{pid}/snapshot", headers=headers).json()["data"]["scenes"] == [1, 2]


def test_import_accepts_client_generated_id_once(client, user_a):
    headers, _ = user_a
    pid = str(uuid.uuid4())
    assert import_project(client, headers, id=pid).json()["project"]["id"] == pid
    assert import_project(client, headers, id=pid).status_code == 409


def test_import_rejects_oversized_document(client, user_a):
    headers, _ = user_a
    huge = {"blob": "x" * (8 * 1024 * 1024 + 1)}
    assert import_project(client, headers, data=huge).status_code == 413


def test_save_bumps_version_and_syncs_title(client, user_a):
    headers, _ = user_a
    pid = import_project(client, headers).json()["project"]["id"]

    response = client.put(
        f"/api/projects/{pid}/snapshot",
        headers=headers,
        json={"base_version": 1, "data": {"title": "Renamed", "scenes": [1, 2, 3]}},
    )
    assert response.status_code == 200, response.text
    assert response.json()["version"] == 2
    assert client.get(f"/api/projects/{pid}", headers=headers).json()["title"] == "Renamed"
    assert client.get(f"/api/projects/{pid}/snapshot", headers=headers).json()["data"]["scenes"] == [1, 2, 3]


def test_stale_save_conflicts_and_keeps_newer_data(client, user_a):
    headers, _ = user_a
    pid = import_project(client, headers).json()["project"]["id"]
    url = f"/api/projects/{pid}/snapshot"

    assert client.put(url, headers=headers, json={"base_version": 1, "data": {"v": "first"}}).status_code == 200
    stale = client.put(url, headers=headers, json={"base_version": 1, "data": {"v": "stale"}})

    assert stale.status_code == 409
    assert stale.json()["detail"]["current_version"] == 2
    assert client.get(url, headers=headers).json()["data"] == {"v": "first"}


def test_snapshot_is_private_to_the_project_owner(client, user_a, user_b):
    headers_a, _ = user_a
    headers_b, _ = user_b
    pid = import_project(client, headers_a).json()["project"]["id"]
    url = f"/api/projects/{pid}/snapshot"

    assert client.get(url, headers=headers_b).status_code == 404
    assert client.put(url, headers=headers_b, json={"base_version": 1, "data": {}}).status_code == 404
    assert client.get(url).status_code == 401
    assert client.get(url, headers=headers_a).status_code == 200


def test_snapshot_missing_for_plain_project(client, user_a):
    headers, _ = user_a
    pid = client.post("/api/projects", headers=headers, json={"title": "Plain"}).json()["id"]
    assert client.get(f"/api/projects/{pid}/snapshot", headers=headers).status_code == 404
    response = client.put(
        f"/api/projects/{pid}/snapshot", headers=headers, json={"base_version": 1, "data": {}}
    )
    assert response.status_code == 404


def test_save_rejects_invalid_base_version(client, user_a):
    headers, _ = user_a
    pid = import_project(client, headers).json()["project"]["id"]
    response = client.put(
        f"/api/projects/{pid}/snapshot", headers=headers, json={"base_version": 0, "data": {}}
    )
    assert response.status_code == 422
