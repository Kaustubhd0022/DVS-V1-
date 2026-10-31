"""
Project endpoints - CRUD and Project Intelligence operations

Every route requires a signed-in user. Project routes additionally require the user to own
the project or be a member of it (see app.auth.require_project_access).
"""

import json
from datetime import datetime
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth import get_current_user, require_project_access
from app.database import get_db
from app.models import (
    ArtifactVersion, CanonFact, Character, CreativeDecision, Evidence,
    Intent, Project, ProjectSnapshot, ProjectStatus, Story, User, project_members,
)
from app.schemas import (
    IntentCreate, IntentRead, ProjectCreate, ProjectImport, ProjectImportResult,
    ProjectIntelligenceRead, ProjectRead, ProjectUpdate, SnapshotRead, SnapshotWrite,
)

router = APIRouter()


@router.post("", response_model=ProjectRead)
async def create_project(
    project: ProjectCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a project owned by the signed-in user, in their organization"""
    db_project = Project(
        organization_id=user.organization_id,
        title=project.title,
        format=project.format,
        genre=project.genre,
        owner_id=user.id,
        status=ProjectStatus.INITIALIZING,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("", response_model=List[ProjectRead])
async def list_projects(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Projects the signed-in user owns or is a member of (archived projects excluded)"""
    member_ids = db.query(project_members.c.project_id).filter(
        project_members.c.user_id == user.id
    )
    return (
        db.query(Project)
        .filter(
            Project.organization_id == user.organization_id,
            Project.status != ProjectStatus.ARCHIVED,
            or_(Project.owner_id == user.id, Project.id.in_(member_ids)),
        )
        .order_by(Project.updated_at.desc())
        .all()
    )


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(project: Project = Depends(require_project_access)):
    """Get project by ID"""
    return project


@router.get("/{project_id}/intelligence", response_model=ProjectIntelligenceRead)
async def get_project_intelligence(
    project: Project = Depends(require_project_access),
    db: Session = Depends(get_db),
):
    """Get complete Project Intelligence / Story Brain"""
    intent = db.query(Intent).filter_by(project_id=project.id).first()
    characters = db.query(Character).filter_by(project_id=project.id).all()
    stories = db.query(Story).filter_by(project_id=project.id).all()
    research = db.query(Evidence).filter_by(project_id=project.id).all()
    decisions = db.query(CreativeDecision).filter_by(project_id=project.id).all()
    canon = db.query(CanonFact).filter_by(project_id=project.id).all()
    versions = db.query(ArtifactVersion).filter_by(project_id=project.id).all()

    return {
        "project": ProjectRead.model_validate(project),
        "intent": IntentRead.model_validate(intent) if intent else None,
        "research": research,
        "characters": characters,
        "stories": stories,
        "decisions": decisions,
        "canon": canon,
        "versions": versions,
    }


@router.put("/{project_id}", response_model=ProjectRead)
async def update_project(
    project_update: ProjectUpdate,
    project: Project = Depends(require_project_access),
    db: Session = Depends(get_db),
):
    """Update project metadata"""
    if project_update.title:
        project.title = project_update.title
    if project_update.format:
        project.format = project_update.format
    if project_update.genre:
        project.genre = project_update.genre
    if project_update.status:
        project.status = project_update.status

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}")
async def delete_project(
    project: Project = Depends(require_project_access),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete project (soft delete via status). Only the owner may delete."""
    if project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Only the project owner can delete it")
    project.status = ProjectStatus.ARCHIVED
    db.commit()
    return {"status": "deleted"}


@router.post("/{project_id}/intent", response_model=IntentRead)
async def create_intent(
    intent: IntentCreate,
    project: Project = Depends(require_project_access),
    db: Session = Depends(get_db),
):
    """Create or update project intent"""
    existing = db.query(Intent).filter_by(project_id=project.id).first()
    if existing:
        existing.intent = intent.intent
        existing.knowns = intent.knowns
        existing.unknowns = intent.unknowns
        existing.assumptions = intent.assumptions
        db.commit()
        db.refresh(existing)
        return existing

    db_intent = Intent(
        project_id=project.id,
        intent=intent.intent,
        knowns=intent.knowns,
        unknowns=intent.unknowns,
        assumptions=intent.assumptions,
    )
    db.add(db_intent)
    db.commit()
    db.refresh(db_intent)
    return db_intent


@router.get("/{project_id}/intent", response_model=IntentRead)
async def get_intent(
    project: Project = Depends(require_project_access),
    db: Session = Depends(get_db),
):
    """Get project intent"""
    intent = db.query(Intent).filter_by(project_id=project.id).first()
    if not intent:
        raise HTTPException(status_code=404, detail="Intent not found")
    return intent


# ---- Project snapshot (the frontend's whole project document) ----------------------------

MAX_SNAPSHOT_BYTES = 8 * 1024 * 1024


def _check_size(data: dict) -> None:
    if len(json.dumps(data, separators=(",", ":"))) > MAX_SNAPSHOT_BYTES:
        raise HTTPException(status_code=413, detail="Project document is too large")


def _sync_title(project: Project, data: dict) -> None:
    title = data.get("title")
    if isinstance(title, str) and title.strip():
        project.title = title.strip()[:255]


@router.post("/import", response_model=ProjectImportResult)
async def import_project(
    body: ProjectImport,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a project and its document in one call. Used for new projects and for importing
    projects that so far only lived in the browser's localStorage."""
    _check_size(body.data)
    if body.id is not None and db.query(Project.id).filter_by(id=body.id).first():
        raise HTTPException(status_code=409, detail="A project with this id already exists")

    project = Project(
        organization_id=user.organization_id,
        owner_id=user.id,
        title=body.title.strip(),
        format=body.format,
        genre=body.genre,
        status=ProjectStatus.ACTIVE,
    )
    if body.id is not None:
        project.id = body.id
    db.add(project)
    db.flush()

    snapshot = ProjectSnapshot(
        project_id=project.id,
        schema_version=body.schema_version,
        version=1,
        data=body.data,
        updated_by=user.id,
    )
    db.add(snapshot)
    db.commit()
    db.refresh(project)
    db.refresh(snapshot)
    return {"project": project, "snapshot": snapshot}


@router.get("/{project_id}/snapshot", response_model=SnapshotRead)
async def get_snapshot(
    project: Project = Depends(require_project_access),
    db: Session = Depends(get_db),
):
    snapshot = db.query(ProjectSnapshot).filter_by(project_id=project.id).first()
    if snapshot is None:
        raise HTTPException(status_code=404, detail="Snapshot not found")
    return snapshot


@router.put("/{project_id}/snapshot", response_model=SnapshotRead)
async def save_snapshot(
    body: SnapshotWrite,
    project: Project = Depends(require_project_access),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save the document. 409 (with the current version) if `base_version` is stale."""
    _check_size(body.data)

    # Compare-and-swap in a single UPDATE so two concurrent saves cannot both win.
    updated = (
        db.query(ProjectSnapshot)
        .filter(
            ProjectSnapshot.project_id == project.id,
            ProjectSnapshot.version == body.base_version,
        )
        .update(
            {
                ProjectSnapshot.data: body.data,
                ProjectSnapshot.schema_version: body.schema_version,
                ProjectSnapshot.version: body.base_version + 1,
                ProjectSnapshot.updated_by: user.id,
                ProjectSnapshot.updated_at: datetime.utcnow(),
            },
            synchronize_session=False,
        )
    )
    if updated == 0:
        current = db.query(ProjectSnapshot.version).filter_by(project_id=project.id).scalar()
        if current is None:
            raise HTTPException(status_code=404, detail="Snapshot not found")
        raise HTTPException(
            status_code=409,
            detail={"message": "Project was changed elsewhere", "current_version": current},
        )

    _sync_title(project, body.data)
    db.commit()
    return db.query(ProjectSnapshot).filter_by(project_id=project.id).one()
