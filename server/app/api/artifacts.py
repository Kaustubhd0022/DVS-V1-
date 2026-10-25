"""
Artifact management endpoints - Versioning, history, and content management
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from typing import List

from app.auth import get_accessible_project, get_current_user, require_project_access
from app.database import get_db
from app.models import ArtifactVersion, Project, ArtifactStatus, User
from app.schemas import ArtifactVersionRead

router = APIRouter()


class ArtifactVersionCreate(BaseModel):
    artifact_type: str
    artifact_id: UUID
    content: str
    reason: str = "Manual creation"


@router.post("", response_model=ArtifactVersionRead)
async def create_artifact_version(
    project_id: UUID,
    artifact: ArtifactVersionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create new artifact version"""

    project = get_accessible_project(db, user, project_id)

    # Get next version number
    latest = db.query(ArtifactVersion).filter(
        ArtifactVersion.artifact_id == artifact.artifact_id,
        ArtifactVersion.artifact_type == artifact.artifact_type,
    ).order_by(ArtifactVersion.version_number.desc()).first()

    next_version = (latest.version_number + 1) if latest else 1
    parent_version_id = latest.id if latest else None

    # Create version
    version = ArtifactVersion(
        project_id=project_id,
        artifact_type=artifact.artifact_type,
        artifact_id=artifact.artifact_id,
        version_number=next_version,
        parent_version_id=parent_version_id,
        status=ArtifactStatus.CANDIDATE,
        content=artifact.content,
        created_by=project.owner_id,
        reason=artifact.reason,
    )

    db.add(version)
    db.commit()
    db.refresh(version)

    return version


@router.get("/{artifact_id}/versions", response_model=List[ArtifactVersionRead])
async def get_artifact_versions(
    artifact_id: UUID,
    project_id: UUID,
    _: Project = Depends(require_project_access),
    db: Session = Depends(get_db),
):
    """Get all versions of an artifact"""

    versions = db.query(ArtifactVersion).filter(
        ArtifactVersion.artifact_id == artifact_id,
        ArtifactVersion.project_id == project_id,
    ).order_by(ArtifactVersion.version_number.desc()).all()

    if not versions:
        raise HTTPException(status_code=404, detail="No versions found for artifact")

    return versions


@router.get("/{artifact_version_id}", response_model=ArtifactVersionRead)
async def get_artifact_version(
    artifact_version_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get specific artifact version"""

    version = db.query(ArtifactVersion).filter_by(id=artifact_version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Artifact version not found")
    get_accessible_project(db, user, version.project_id)

    return version


@router.get("/{artifact_id}/latest", response_model=ArtifactVersionRead)
async def get_latest_artifact_version(
    artifact_id: UUID,
    project_id: UUID,
    _: Project = Depends(require_project_access),
    db: Session = Depends(get_db),
):
    """Get latest version of an artifact"""

    version = db.query(ArtifactVersion).filter(
        ArtifactVersion.artifact_id == artifact_id,
        ArtifactVersion.project_id == project_id,
    ).order_by(ArtifactVersion.version_number.desc()).first()

    if not version:
        raise HTTPException(status_code=404, detail="Artifact not found")

    return version
