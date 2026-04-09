from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health_returns_ok() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_root_returns_api_metadata() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"name": "ImageLink API", "version": "0.1.0"}
