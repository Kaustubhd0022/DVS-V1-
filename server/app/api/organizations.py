"""
Organization endpoints - read-only access to the signed-in user's own organization.

Organizations are created when a user first signs in (POST /api/me). There is no role model
yet, so adding users to an organization is intentionally not exposed.
"""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Organization, User
from app.schemas import OrganizationRead, UserRead

router = APIRouter()


def _own_org(db: Session, user: User, org_id: UUID) -> Organization:
    org = db.query(Organization).filter_by(id=org_id).first()
    if org is None or org.id != user.organization_id:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


@router.get("", response_model=List[OrganizationRead])
async def list_organizations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """The signed-in user's organization (as a one-item list)"""
    return db.query(Organization).filter_by(id=user.organization_id).all()


@router.get("/{org_id}", response_model=OrganizationRead)
async def get_organization(
    org_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _own_org(db, user, org_id)


@router.get("/{org_id}/users", response_model=List[UserRead])
async def get_org_users(
    org_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    org = _own_org(db, user, org_id)
    return db.query(User).filter_by(organization_id=org.id).all()
