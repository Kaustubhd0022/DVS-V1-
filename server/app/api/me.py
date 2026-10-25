"""Current-user endpoints - bootstrap the local user for a Supabase identity"""

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_token_claims
from app.database import get_db
from app.models import Organization, User
from app.schemas import UserRead

router = APIRouter()


@router.get("", response_model=UserRead)
async def get_me(user: User = Depends(get_current_user)):
    """The signed-in user (403 until POST /api/me has provisioned them)"""
    return user


@router.post("", response_model=UserRead)
async def provision_me(
    claims: Dict[str, Any] = Depends(get_token_claims),
    db: Session = Depends(get_db),
):
    """Create the local user and a personal organization on first sign-in (idempotent)"""
    existing = db.query(User).filter_by(identity_provider_id=claims["sub"]).first()
    if existing:
        return existing

    email = claims.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Token has no email claim")
    if db.query(User).filter_by(email=email).first():
        raise HTTPException(status_code=409, detail="Email already belongs to another account")

    metadata = claims.get("user_metadata") or {}
    name = metadata.get("full_name") or metadata.get("name") or email.split("@")[0]

    org = Organization(name=f"{name}'s workspace")
    db.add(org)
    db.flush()
    user = User(
        organization_id=org.id,
        identity_provider_id=claims["sub"],
        name=name,
        email=email,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
