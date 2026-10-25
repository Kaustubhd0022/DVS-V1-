"""
Approval workflow endpoints - Artifact review and decision management
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from enum import Enum
from datetime import datetime

from app.auth import get_accessible_project, get_current_user, require_project_access
from app.database import get_db
from app.models import (
    Approval, ArtifactVersion, ArtifactStatus, ApprovalDecision,
    Project, User
)
from app.schemas import ApprovalRead

router = APIRouter()


class ApprovalDecisionRequest(BaseModel):
    decision: ApprovalDecision
    notes: str = ""


@router.post("/{artifact_version_id}", response_model=ApprovalRead)
async def create_approval(
    artifact_version_id: UUID,
    approval_req: ApprovalDecisionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create approval request for artifact version"""

    # Verify artifact version exists
    artifact = db.query(ArtifactVersion).filter_by(id=artifact_version_id).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact version not found")

    # The approver is always the signed-in user, never a caller-supplied id
    get_accessible_project(db, user, artifact.project_id)

    # Create approval record
    approval = Approval(
        artifact_version_id=artifact_version_id,
        approver_id=user.id,
        decision=approval_req.decision,
        reason=approval_req.notes,
    )

    # Update artifact status based on decision
    if approval_req.decision == ApprovalDecision.APPROVED:
        artifact.status = ArtifactStatus.HUMAN_APPROVED
    elif approval_req.decision == ApprovalDecision.REJECTED:
        artifact.status = ArtifactStatus.REJECTED
    elif approval_req.decision == ApprovalDecision.REQUESTED_CHANGES:
        artifact.status = ArtifactStatus.CANDIDATE

    db.add(approval)
    db.commit()
    db.refresh(approval)

    return approval


@router.get("/{artifact_version_id}", response_model=ApprovalRead)
async def get_approval(
    artifact_version_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get approval status for artifact version"""
    version = db.query(ArtifactVersion).filter_by(id=artifact_version_id).first()
    if version is None:
        raise HTTPException(status_code=404, detail="Approval not found")
    get_accessible_project(db, user, version.project_id)
    approval = db.query(Approval).filter_by(artifact_version_id=artifact_version_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    return approval


@router.get("/project/{project_id}")
async def get_pending_approvals(
    project_id: UUID,
    _: Project = Depends(require_project_access),
    db: Session = Depends(get_db),
):
    """Get all pending approvals for a project"""

    # Verify project exists
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get pending artifact versions needing approval
    pending = db.query(ArtifactVersion).filter(
        ArtifactVersion.project_id == project_id,
        ArtifactVersion.status == ArtifactStatus.AI_GENERATED,
    ).all()

    return {
        "project_id": str(project_id),
        "pending_count": len(pending),
        "artifacts": [
            {
                "artifact_version_id": str(a.id),
                "artifact_type": a.artifact_type,
                "artifact_id": str(a.artifact_id),
                "version_number": a.version_number,
                "created_at": a.created_at,
            }
            for a in pending
        ],
    }
