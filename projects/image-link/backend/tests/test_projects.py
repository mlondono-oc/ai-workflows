from unittest.mock import MagicMock, patch
from uuid import UUID

import pytest
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def _sample_project_row() -> dict:
    return {
        "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "owner_id": "11111111-1111-1111-1111-111111111111",
        "name": "My project",
        "description": "Desc",
        "created_at": "2026-01-01T00:00:00+00:00",
        "updated_at": "2026-01-01T00:00:00+00:00",
    }


def test_list_projects_returns_user_projects(client: TestClient) -> None:
    mock_db = MagicMock()
    mock_db.table.return_value.select.return_value.execute.return_value = MagicMock(
        data=[_sample_project_row()]
    )
    with patch("backend.projects.router.get_db_client", return_value=mock_db):
        r = client.get(
            "/projects",
            headers={"Authorization": "Bearer token"},
        )
    assert r.status_code == 200
    body = r.json()
    assert len(body) == 1
    assert body[0]["name"] == "My project"


def test_create_project_returns_created_project(client: TestClient) -> None:
    mock_auth = MagicMock()
    user = MagicMock()
    user.id = UUID("11111111-1111-1111-1111-111111111111")
    mock_auth.auth.get_user.return_value = MagicMock(user=user)

    mock_db = MagicMock()
    mock_db.table.return_value.insert.return_value.execute.return_value = MagicMock(
        data=[_sample_project_row()]
    )

    with (
        patch("backend.projects.router.get_auth_client", return_value=mock_auth),
        patch("backend.projects.router.get_db_client", return_value=mock_db),
    ):
        r = client.post(
            "/projects",
            headers={"Authorization": "Bearer token"},
            json={"name": "My project", "description": "Desc"},
        )
    assert r.status_code == 201
    assert r.json()["name"] == "My project"


def test_create_project_missing_name_returns_422(client: TestClient) -> None:
    r = client.post(
        "/projects",
        headers={"Authorization": "Bearer token"},
        json={"description": "only desc"},
    )
    assert r.status_code == 422


def test_update_project_returns_updated_data(client: TestClient) -> None:
    updated = _sample_project_row()
    updated["name"] = "Renamed"
    mock_db = MagicMock()
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = (
        MagicMock(data=[updated])
    )
    with patch("backend.projects.router.get_db_client", return_value=mock_db):
        r = client.patch(
            "/projects/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            headers={"Authorization": "Bearer token"},
            json={"name": "Renamed"},
        )
    assert r.status_code == 200
    assert r.json()["name"] == "Renamed"


def test_update_project_not_owned_returns_403(client: TestClient) -> None:
    mock_db = MagicMock()
    mock_db.table.return_value.update.return_value.eq.return_value.execute.return_value = (
        MagicMock(data=[])
    )
    with patch("backend.projects.router.get_db_client", return_value=mock_db):
        r = client.patch(
            "/projects/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
            headers={"Authorization": "Bearer token"},
            json={"name": "Hack"},
        )
    assert r.status_code == 403
