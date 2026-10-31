"""AI endpoints - server-side model access so the provider token never reaches the browser"""

import json
import logging
import time
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID

from jsonschema import SchemaError

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth import get_accessible_project, get_current_user
from app.config import settings
from app.database import get_db
from app.models import User
from app.ratelimit import RateLimiter
from app.services import llm, structured
from app.services.run_log import record_run

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = RateLimiter(settings.AI_REQUESTS_PER_MINUTE)

MAX_PROMPT_CHARS = 200_000
MAX_SCHEMA_CHARS = 20_000


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(max_length=MAX_PROMPT_CHARS)


class GenerateRequest(BaseModel):
    messages: List[ChatMessage] = Field(min_length=1, max_length=40)
    temperature: float = Field(default=0.7, ge=0, le=2)
    max_tokens: int = Field(default=2000, ge=1, le=8192)
    json_mode: bool = False
    # JSON Schema the reply must match. Implies json_mode; a bad reply is retried once.
    output_schema: Optional[Dict[str, Any]] = None
    task: Optional[str] = Field(default=None, max_length=100)
    project_id: Optional[UUID] = None  # links the run to a project for per-project usage


class GenerateResponse(BaseModel):
    content: str
    model: str
    latency_ms: int
    run_id: Optional[str] = None
    data: Optional[Any] = None  # the parsed JSON, in json_mode or with an output_schema


class AIStatus(BaseModel):
    configured: bool
    provider: str
    model: str


class AITestResult(BaseModel):
    success: bool
    message: str
    latency_ms: Optional[int] = None


@router.get("/status", response_model=AIStatus)
async def ai_status(user: User = Depends(get_current_user)):
    try:
        active = llm.provider()
    except llm.LLMError:
        return AIStatus(configured=False, provider=settings.LLM_PROVIDER, model="")
    return AIStatus(
        configured=bool(active.token), provider=active.name.lower(), model=active.models[0]
    )


@router.post("/generate", response_model=GenerateResponse)
async def generate(
    body: GenerateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if sum(len(m.content) for m in body.messages) > MAX_PROMPT_CHARS:
        raise HTTPException(status_code=413, detail="Prompt is too large")
    if body.output_schema is not None:
        if len(json.dumps(body.output_schema)) > MAX_SCHEMA_CHARS:
            raise HTTPException(status_code=413, detail="output_schema is too large")
        try:
            structured.check_schema(body.output_schema)
        except SchemaError as error:
            raise HTTPException(status_code=422, detail=f"output_schema is not a valid JSON Schema: {error.message}")
    if body.project_id is not None:
        get_accessible_project(db, user, body.project_id)  # 404 if not the caller's project
    limiter.check(str(user.id))

    run_fields = dict(user=user, project_id=body.project_id, workflow="generate", task=body.task)
    started = time.perf_counter()

    def fail(error: llm.LLMError, provider_name: str, model: str) -> HTTPException:
        invalid_output = isinstance(error, structured.StructuredOutputError)
        record_run(
            db, **run_fields, provider=provider_name,
            model=error.model if invalid_output else model, status="failed",
            latency_ms=round((time.perf_counter() - started) * 1000), error_code=error.code,
            usage=error.usage if invalid_output else None,
            validation_status="invalid" if invalid_output else None,
        )
        return HTTPException(status_code=error.status_code, detail=error.message)

    try:
        active = llm.provider()
    except llm.LLMError as error:  # LLM_PROVIDER names no known provider
        raise fail(error, settings.LLM_PROVIDER, "")
    messages = [m.model_dump() for m in body.messages]
    try:
        if body.json_mode or body.output_schema is not None:
            result = await structured.generate_json(
                messages, schema=body.output_schema,
                temperature=body.temperature, max_tokens=body.max_tokens,
            )
        else:
            result = await llm.chat_completion(
                messages, temperature=body.temperature, max_tokens=body.max_tokens
            )
    except llm.LLMError as error:
        raise fail(error, active.name.lower(), active.models[0])

    run = record_run(
        db, **run_fields, provider=active.name.lower(), model=result["model"], status="completed",
        latency_ms=result["latency_ms"], usage=result["usage"],
        validation_status=result.get("validation_status"),
    )
    # Usage log without prompt or response content.
    logger.info(
        "ai.generate user=%s task=%s model=%s latency_ms=%s",
        user.id, body.task, result["model"], result["latency_ms"],
    )
    return GenerateResponse(
        content=result["content"],
        model=result["model"],
        latency_ms=result["latency_ms"],
        run_id=str(run.id) if run else None,
        data=result.get("data"),
    )


@router.post("/test", response_model=AITestResult)
async def test_connection(user: User = Depends(get_current_user)):
    """Tiny round-trip so the UI can show whether AI works. Never raises for model problems."""
    limiter.check(str(user.id))
    try:
        result = await llm.chat_completion(
            [{"role": "user", "content": 'Say "tattvaCo Online" and nothing else.'}], max_tokens=30
        )
    except llm.LLMError as error:
        return AITestResult(success=False, message=error.message)
    return AITestResult(
        success=True,
        message=f"Connected: {llm.provider().name} ({result['model']}) • {result['latency_ms']}ms",
        latency_ms=result["latency_ms"],
    )
