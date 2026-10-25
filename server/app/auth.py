"""
Authentication and project-access dependencies (Supabase Auth).

The browser signs in with Supabase and sends the access token as
`Authorization: Bearer <jwt>`. This module verifies the token and maps it to a local
`User` row (matched on `User.identity_provider_id == jwt.sub`).

Verification:
  * HS256 tokens (legacy Supabase projects) are checked with SUPABASE_JWT_SECRET.
  * ES256/RS256 tokens (current Supabase projects) are checked against the project's
    JWKS endpoint, derived from SUPABASE_URL.
If neither is configured, every protected request is rejected (fail closed).
"""

import logging
from functools import lru_cache
from typing import Any, Dict
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Project, User, project_members

logger = logging.getLogger(__name__)

_bearer = HTTPBearer(auto_error=False)

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid or missing authentication token",
    headers={"WWW-Authenticate": "Bearer"},
)


@lru_cache(maxsize=1)
def _jwks_client(url: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(f"{url.rstrip('/')}/auth/v1/.well-known/jwks.json", cache_keys=True)


def verify_token(token: str) -> Dict[str, Any]:
    """Return the verified JWT claims, or raise 401 (503 if auth is not configured)."""
    if not settings.SUPABASE_JWT_SECRET and not settings.SUPABASE_URL:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured on the server",
        )

    try:
        alg = jwt.get_unverified_header(token).get("alg", "")
        if alg == "HS256":
            if not settings.SUPABASE_JWT_SECRET:
                raise _UNAUTHORIZED
            key: Any = settings.SUPABASE_JWT_SECRET
            algorithms = ["HS256"]
        elif alg in ("ES256", "RS256"):
            if not settings.SUPABASE_URL:
                raise _UNAUTHORIZED
            key = _jwks_client(settings.SUPABASE_URL).get_signing_key_from_jwt(token).key
            algorithms = [alg]
        else:
            raise _UNAUTHORIZED

        return jwt.decode(
            token,
            key,
            algorithms=algorithms,
            audience=settings.SUPABASE_JWT_AUDIENCE,
            options={"require": ["exp", "sub"]},
        )
    except HTTPException:
        raise
    except jwt.PyJWTError:
        raise _UNAUTHORIZED
    except Exception:
        # e.g. JWKS endpoint unreachable; never leak details to the caller
        logger.exception("Token verification failed unexpectedly")
        raise _UNAUTHORIZED


def get_token_claims(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> Dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _UNAUTHORIZED
    return verify_token(credentials.credentials)


def get_current_user(
    claims: Dict[str, Any] = Depends(get_token_claims),
    db: Session = Depends(get_db),
) -> User:
    """The local user for a verified token. 403 if the user has not been provisioned yet."""
    user = db.query(User).filter_by(identity_provider_id=claims["sub"]).first()
    if user is None or user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not provisioned; call POST /api/me first",
        )
    return user


def user_can_access_project(db: Session, user: User, project: Project) -> bool:
    """A user can access a project in their own organization if they own it or are a member."""
    if project.organization_id != user.organization_id:
        return False
    if project.owner_id == user.id:
        return True
    member = (
        db.query(project_members.c.user_id)
        .filter(project_members.c.project_id == project.id, project_members.c.user_id == user.id)
        .first()
    )
    return member is not None


def get_accessible_project(db: Session, user: User, project_id: UUID) -> Project:
    """Load a project the user may access. Missing and forbidden both return 404, so project
    ids cannot be probed across tenants."""
    project = db.query(Project).filter_by(id=project_id).first()
    if project is None or not user_can_access_project(db, user, project):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def require_project_access(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Project:
    """FastAPI dependency: `project_id` comes from the path or query string."""
    return get_accessible_project(db, user, project_id)
