"""Records every model call as an AIRun row: who, which model, tokens, cost, latency, outcome."""

import logging
from datetime import datetime
from typing import Dict, Optional
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import AIRun, User
from app.services import llm

logger = logging.getLogger(__name__)


def record_run(
    db: Session,
    *,
    user: User,
    project_id: Optional[UUID],
    workflow: str,
    task: Optional[str],
    provider: str,
    model: str,
    status: str,
    latency_ms: int,
    usage: Optional[Dict[str, Optional[int]]] = None,
    error_code: Optional[str] = None,
    validation_status: Optional[str] = None,
) -> Optional[AIRun]:
    """Store the run. A logging failure is logged and swallowed so it never fails the AI call."""
    usage = usage or {}
    input_tokens = usage.get("input_tokens")
    output_tokens = usage.get("output_tokens")
    total = input_tokens + output_tokens if input_tokens is not None and output_tokens is not None else None

    run = AIRun(
        project_id=project_id,
        user_id=user.id,
        organization_id=user.organization_id,
        workflow_id=workflow,
        agent_id=(task or "unspecified")[:100],
        model_provider=provider,
        model_id=model,
        status=status,
        latency_ms=latency_ms,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        token_usage=total,
        estimated_cost=llm.estimate_cost(model, input_tokens, output_tokens),
        error_code=error_code,
        validation_status=validation_status,
        completed_at=datetime.utcnow(),
    )
    try:
        db.add(run)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Could not record AI run")
        return None
    return run
