"""
Analytics endpoints - Continuity checking, dependency analysis, and vector search
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Dict, Any, List
from pydantic import BaseModel

from app.auth import require_project_access
from app.database import get_db
from app.models import Project, ArtifactVersion
from app.services import (
    ContinuityChecker, DependencyTracker, VectorSearchService
)

router = APIRouter(dependencies=[Depends(require_project_access)])


class ContinuityCheckRequest(BaseModel):
    artifact_id: UUID
    content: str


class DependencyAnalysisRequest(BaseModel):
    artifact_id: UUID


class VectorSearchRequest(BaseModel):
    query: str
    artifact_type: str | None = None
    limit: int = 5


@router.post("/{project_id}/continuity-check")
async def check_continuity(
    project_id: UUID,
    request: ContinuityCheckRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Check artifact for continuity issues"""

    # Verify project exists
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    checker = ContinuityChecker(db)
    result = checker.check_artifact_continuity(
        project_id=project_id,
        artifact_id=request.artifact_id,
        content=request.content,
    )

    return result


@router.get("/{project_id}/dependency-impact/{artifact_id}")
async def analyze_dependency_impact(
    project_id: UUID,
    artifact_id: UUID,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Analyze impact of changes to an artifact"""

    # Verify project and artifact exist
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    artifact = db.query(ArtifactVersion).filter(
        ArtifactVersion.artifact_id == artifact_id,
        ArtifactVersion.project_id == project_id,
    ).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")

    tracker = DependencyTracker(db)
    result = tracker.get_impact_of_change(artifact_id, project_id)

    return result


@router.post("/{project_id}/vector-search")
async def vector_search(
    project_id: UUID,
    request: VectorSearchRequest,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Semantic search across project artifacts"""

    # Verify project exists
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    searcher = VectorSearchService(db)
    results = searcher.search_artifacts(
        project_id=project_id,
        query=request.query,
        artifact_type=request.artifact_type,
        limit=request.limit,
    )

    return {
        "project_id": str(project_id),
        "query": request.query,
        "results_count": len(results),
        "results": results,
    }


@router.get("/{project_id}/dependencies/validate")
async def validate_dependencies(
    project_id: UUID,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Validate project dependencies for circular refs and orphans"""

    # Verify project exists
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tracker = DependencyTracker(db)
    result = tracker.validate_dependencies(project_id)

    return result


@router.get("/{project_id}/artifacts/{artifact_id}/dependencies")
async def get_artifact_dependencies(
    project_id: UUID,
    artifact_id: UUID,
    direction: str = "downstream",
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Get dependencies for an artifact"""

    # Verify project exists
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tracker = DependencyTracker(db)
    dependencies = tracker.get_artifact_dependencies(
        artifact_id=artifact_id,
        project_id=project_id,
        direction=direction,
    )

    return {
        "artifact_id": str(artifact_id),
        "project_id": str(project_id),
        "direction": direction,
        "dependencies": dependencies,
    }
