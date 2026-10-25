"""
Research management endpoints - Evidence, research plans, and source management
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.auth import require_project_access
from app.database import get_db
from app.models import ResearchPlan, Evidence, Project
from app.schemas import (
    ResearchPlanCreate, ResearchPlanRead, ResearchPlanUpdate,
    EvidenceCreate, EvidenceRead, EvidenceUpdate
)

router = APIRouter(dependencies=[Depends(require_project_access)])


@router.post("/plans", response_model=ResearchPlanRead)
async def create_research_plan(
    project_id: UUID,
    plan: ResearchPlanCreate,
    db: Session = Depends(get_db),
):
    """Create a research plan"""

    # Verify project exists
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create plan
    db_plan = ResearchPlan(
        project_id=project_id,
        questions=plan.questions,
        scope=plan.scope,
    )

    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)

    return db_plan


@router.get("/plans/{plan_id}", response_model=ResearchPlanRead)
async def get_research_plan(
    plan_id: UUID,
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """Get research plan by ID"""

    plan = db.query(ResearchPlan).filter(
        ResearchPlan.id == plan_id,
        ResearchPlan.project_id == project_id,
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Research plan not found")

    return plan


@router.get("/plans", response_model=List[ResearchPlanRead])
async def list_research_plans(
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """List all research plans for a project"""

    plans = db.query(ResearchPlan).filter_by(project_id=project_id).all()
    return plans


@router.put("/plans/{plan_id}", response_model=ResearchPlanRead)
async def update_research_plan(
    plan_id: UUID,
    project_id: UUID,
    plan_update: ResearchPlanUpdate,
    db: Session = Depends(get_db),
):
    """Update research plan"""

    plan = db.query(ResearchPlan).filter(
        ResearchPlan.id == plan_id,
        ResearchPlan.project_id == project_id,
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Research plan not found")

    for field, value in plan_update.dict(exclude_unset=True).items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)

    return plan


@router.post("/evidence", response_model=EvidenceRead)
async def create_evidence(
    project_id: UUID,
    evidence: EvidenceCreate,
    db: Session = Depends(get_db),
):
    """Create evidence for research"""

    # Verify project exists
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create evidence
    db_evidence = Evidence(
        project_id=project_id,
        research_plan_id=evidence.research_plan_id,
        source_url=evidence.source_url,
        source_type=evidence.source_type,
        publisher=evidence.publisher,
        author=evidence.author,
        claim=evidence.claim,
        supporting_excerpt=evidence.supporting_excerpt,
        relevance=evidence.relevance,
        confidence=evidence.confidence,
    )

    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)

    return db_evidence


@router.get("/evidence/{evidence_id}", response_model=EvidenceRead)
async def get_evidence(
    evidence_id: UUID,
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """Get evidence by ID"""

    evidence = db.query(Evidence).filter(
        Evidence.id == evidence_id,
        Evidence.project_id == project_id,
    ).first()

    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    return evidence


@router.get("/evidence", response_model=List[EvidenceRead])
async def list_evidence(
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """List all evidence for a project"""

    evidence_list = db.query(Evidence).filter_by(project_id=project_id).all()
    return evidence_list


@router.put("/evidence/{evidence_id}", response_model=EvidenceRead)
async def update_evidence(
    evidence_id: UUID,
    project_id: UUID,
    evidence_update: EvidenceUpdate,
    db: Session = Depends(get_db),
):
    """Update evidence"""

    evidence = db.query(Evidence).filter(
        Evidence.id == evidence_id,
        Evidence.project_id == project_id,
    ).first()

    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    for field, value in evidence_update.dict(exclude_unset=True).items():
        setattr(evidence, field, value)

    db.commit()
    db.refresh(evidence)

    return evidence
