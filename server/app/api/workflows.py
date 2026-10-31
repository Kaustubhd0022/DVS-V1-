from __future__ import annotations

"""
Workflow execution endpoints - Agent orchestration and task execution
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Dict, Any, Optional
from pydantic import BaseModel

from app.auth import get_accessible_project, get_current_user
from app.database import get_db
from app.models import AIRun, User
from app.services import AgentOrchestrator, WorkflowType
from app.config import settings

import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class WorkflowInput(BaseModel):
    project_id: UUID
    workflow_type: WorkflowType
    user_input: str
    context: Optional[Dict[str, Any]] = None


class WorkflowResponse(BaseModel):
    run_id: str
    status: str
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    latency_ms: Optional[int] = None
    approval_required: bool = False


@router.post("", response_model=WorkflowResponse)
async def execute_workflow(
    workflow: WorkflowInput,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> WorkflowResponse:
    """Execute an agent workflow"""

    get_accessible_project(db, user, workflow.project_id)

    # Initialize orchestrator
    orchestrator = AgentOrchestrator(db, settings)

    # Execute workflow
    try:
        result = await orchestrator.run_agent(
            project_id=workflow.project_id,
            workflow_type=workflow.workflow_type,
            user_input=workflow.user_input,
            context=workflow.context,
        )
        return WorkflowResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Workflow execution failed")
        raise HTTPException(status_code=500, detail="Workflow execution failed")


@router.get("/{run_id}", response_model=Dict[str, Any])
async def get_workflow_status(
    run_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get workflow execution status and results"""
    ai_run = db.query(AIRun).filter_by(id=run_id).first()
    if not ai_run:
        raise HTTPException(status_code=404, detail="Workflow run not found")
    get_accessible_project(db, user, ai_run.project_id)  # 404 if not the caller's project

    return {
        "run_id": str(ai_run.id),
        "project_id": str(ai_run.project_id),
        "agent_id": ai_run.agent_id,
        "workflow_id": ai_run.workflow_id,
        "status": ai_run.status,
        "created_at": ai_run.created_at,
        "completed_at": ai_run.completed_at,
        "latency_ms": ai_run.latency_ms,
        "error_code": ai_run.error_code,
    }
