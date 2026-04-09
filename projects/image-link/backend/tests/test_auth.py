from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from backend.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_login_returns_access_token(client: TestClient) -> None:
    mock_sb = MagicMock()
    session = MagicMock(access_token="test-access-token")
    mock_sb.auth.sign_in_with_password.return_value = MagicMock(session=session)
    with patch("backend.auth.router.get_auth_client", return_value=mock_sb):
        r = client.post(
            "/auth/login",
            json={"email": "u@example.com", "password": "secret"},
        )
    assert r.status_code == 200
    assert r.json() == {
        "access_token": "test-access-token",
        "token_type": "bearer",
    }


def test_login_invalid_credentials_returns_401(client: TestClient) -> None:
    from supabase_auth.errors import AuthInvalidCredentialsError

    mock_sb = MagicMock()
    mock_sb.auth.sign_in_with_password.side_effect = AuthInvalidCredentialsError(
        "Invalid login credentials"
    )
    with patch("backend.auth.router.get_auth_client", return_value=mock_sb):
        r = client.post(
            "/auth/login",
            json={"email": "u@example.com", "password": "wrong"},
        )
    assert r.status_code == 401


def test_me_without_token_returns_401(client: TestClient) -> None:
    r = client.get("/auth/me")
    assert r.status_code == 401


def test_me_with_valid_token(client: TestClient) -> None:
    mock_sb = MagicMock()
    user = MagicMock()
    user.id = "11111111-1111-1111-1111-111111111111"
    user.email = "u@example.com"
    mock_sb.auth.get_user.return_value = MagicMock(user=user)
    with patch("backend.auth.router.get_auth_client", return_value=mock_sb):
        r = client.get(
            "/auth/me",
            headers={"Authorization": "Bearer valid.jwt.token"},
        )
    assert r.status_code == 200
    assert r.json()["id"] == "11111111-1111-1111-1111-111111111111"
    assert r.json()["email"] == "u@example.com"
