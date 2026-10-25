"""AI endpoints - server-side model access so the provider token never reaches the browser"""

import logging
from typing import List, Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.config import settings
from app.models import User
from app.ratelimit import RateLimiter
from app.services import llm

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = RateLimiter(settings.AI_REQUESTS_PER_MINUTE)

MAX_PROMPT_CHARS = 200_000


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(max_length=MAX_PROMPT_CHARS)


class GenerateRequest(BaseModel):
    messages: List[ChatMessage] = Field(min_length=1, max_length=40)
    temperature: float = Field(default=0.7, ge=0, le=2)
    max_tokens: int = Field(default=2000, ge=1, le=8192)
    json_mode: bool = False
    task: Optional[str] = Field(default=None, max_length=100)


class GenerateResponse(BaseModel):
    content: str
    model: str
    latency_ms: int


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
    return AIStatus(
        configured=llm.is_configured(), provider="huggingface", model=settings.HUGGINGFACE_MODEL
    )


@router.post("/generate", response_model=GenerateResponse)
async def generate(body: GenerateRequest, user: User = Depends(get_current_user)):
    if sum(len(m.content) for m in body.messages) > MAX_PROMPT_CHARS:
        raise HTTPException(status_code=413, detail="Prompt is too large")
    limiter.check(str(user.id))

    try:
        result = await llm.chat_completion(
            [m.model_dump() for m in body.messages],
            temperature=body.temperature,
            max_tokens=body.max_tokens,
            json_mode=body.json_mode,
        )
    except llm.LLMError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message)

    # Usage log without prompt or response content.
    logger.info(
        "ai.generate user=%s task=%s model=%s latency_ms=%s",
        user.id, body.task, result["model"], result["latency_ms"],
    )
    return result


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
        message=f"Connected: HuggingFace ({result['model']}) • {result['latency_ms']}ms",
        latency_ms=result["latency_ms"],
    )
