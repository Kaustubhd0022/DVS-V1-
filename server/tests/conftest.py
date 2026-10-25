"""
Pytest configuration and fixtures

Tests run against a LOCAL PostgreSQL (the models use Postgres-only types such as
ARRAY, so SQLite cannot be used). Start one with:

    docker run -d --name tattva-test-db -e POSTGRES_PASSWORD=test -e POSTGRES_DB=tattva_test \
        -p 55432:5432 pgvector/pgvector:pg16

Override the URL with TEST_DATABASE_URL. Non-local hosts are refused so the tests
can never touch the Supabase database configured in .env.
"""

import os
from urllib.parse import urlparse

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://postgres:test@localhost:55432/tattva_test",
)

if urlparse(TEST_DATABASE_URL).hostname not in ("localhost", "127.0.0.1", "::1"):
    raise RuntimeError("Refusing to run tests against a non-local database")

# Must be set before app.database is imported (it builds its engine at import time).
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["ENVIRONMENT"] = "testing"
os.environ["SUPABASE_JWT_SECRET"] = "test-jwt-secret-with-at-least-32-bytes!!"
os.environ["SUPABASE_URL"] = ""

import pytest  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker, Session  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from app.models import Base  # noqa: E402
from app.database import get_db  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture(scope="session")
def test_engine():
    """Create test database engine"""
    engine = create_engine(TEST_DATABASE_URL, echo=False)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_db(test_engine):
    """Get database session for test (rolled back afterwards)"""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(autocommit=False, autoflush=False, bind=connection)()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(test_db: Session):
    """Get FastAPI test client with test database"""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


# ---- auth helpers -------------------------------------------------------------------------
import time  # noqa: E402
import uuid  # noqa: E402

import jwt  # noqa: E402


def make_token(sub: str, email: str | None = None, **overrides) -> str:
    """A Supabase-style HS256 access token signed with the test secret."""
    claims = {
        "sub": sub,
        "email": email or f"{sub}@example.com",
        "aud": "authenticated",
        "exp": int(time.time()) + 3600,
        "user_metadata": {"full_name": "Test User"},
    }
    claims.update(overrides)
    return jwt.encode(claims, os.environ["SUPABASE_JWT_SECRET"], algorithm="HS256")


def auth_headers(sub: str | None = None, **kwargs) -> dict:
    return {"Authorization": f"Bearer {make_token(sub or str(uuid.uuid4()), **kwargs)}"}


@pytest.fixture
def user_a(client):
    """A provisioned user (own organization). Returns (headers, user json)."""
    headers = auth_headers("user-a")
    response = client.post("/api/me", headers=headers)
    assert response.status_code == 200, response.text
    return headers, response.json()


@pytest.fixture
def user_b(client):
    """A second provisioned user in a different organization."""
    headers = auth_headers("user-b")
    response = client.post("/api/me", headers=headers)
    assert response.status_code == 200, response.text
    return headers, response.json()
