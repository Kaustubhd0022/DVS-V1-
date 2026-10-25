"""
LLM access (HuggingFace Inference Providers, OpenAI-compatible chat completions).

The API token only ever lives on the server (HUGGINGFACE_API_TOKEN); browsers call
POST /api/ai/generate instead of calling a model provider directly.
"""

import logging
import time
from typing import Any, Dict, List, Tuple

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_SECONDS = 120.0

JSON_INSTRUCTION = (
    "Respond with a single valid JSON object only. Do not wrap it in markdown fences "
    "and do not add any text before or after it."
)


class LLMError(Exception):
    """An error that is safe to show to the caller. `status_code` is the HTTP status to return."""

    def __init__(self, status_code: int, message: str, code: str = "AI_SERVICE_ERROR"):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.code = code


def is_configured() -> bool:
    return bool(settings.HUGGINGFACE_API_TOKEN)


async def _post(url: str, headers: Dict[str, str], payload: Dict[str, Any]) -> Tuple[int, Any]:
    """The only network call; tests replace this function."""
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
        response = await client.post(url, headers=headers, json=payload)
    try:
        body = response.json()
    except ValueError:
        body = {}
    return response.status_code, body


def _upstream_message(body: Any) -> str:
    error = body.get("error") if isinstance(body, dict) else None
    if isinstance(error, dict):
        error = error.get("message")
    return str(error or "")[:200]


def _with_json_instruction(messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
    out = [dict(m) for m in messages]
    for message in out:
        if message["role"] == "system":
            message["content"] = f"{message['content']}\n\n{JSON_INSTRUCTION}"
            return out
    return [{"role": "system", "content": JSON_INSTRUCTION}, *out]


async def chat_completion(
    messages: List[Dict[str, str]],
    *,
    temperature: float = 0.7,
    max_tokens: int = 2000,
    json_mode: bool = False,
) -> Dict[str, Any]:
    """Return {"content", "model", "latency_ms"}. Raises LLMError with a caller-safe message."""
    if not is_configured():
        raise LLMError(
            503,
            "The server has no HuggingFace API token configured (HUGGINGFACE_API_TOKEN).",
            "AI_CONFIGURATION_REQUIRED",
        )

    if json_mode:
        messages = _with_json_instruction(messages)

    url = f"{settings.HUGGINGFACE_BASE_URL.rstrip('/')}/chat/completions"
    headers = {"Authorization": f"Bearer {settings.HUGGINGFACE_API_TOKEN}"}
    models = [settings.HUGGINGFACE_MODEL]
    if settings.HUGGINGFACE_FALLBACK_MODEL and settings.HUGGINGFACE_FALLBACK_MODEL not in models:
        models.append(settings.HUGGINGFACE_FALLBACK_MODEL)

    started = time.perf_counter()
    last_error = LLMError(502, "The AI service is unavailable.")

    for model in models:
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        try:
            status, body = await _post(url, headers, payload)
        except httpx.TimeoutException:
            last_error = LLMError(504, "The AI service took too long to respond.")
            continue
        except httpx.HTTPError:
            logger.exception("HuggingFace request failed")
            last_error = LLMError(502, "Could not reach the AI service.")
            continue

        # Problems with the account or token affect every model: stop instead of trying the next.
        if status == 402:
            raise LLMError(
                402,
                "The HuggingFace account has no Inference Providers credits left. "
                "Add credits at huggingface.co/settings/billing.",
                "AI_CREDITS_REQUIRED",
            )
        if status in (401, 403):
            raise LLMError(
                502,
                "HuggingFace rejected the API token. It needs the 'Make calls to Inference "
                "Providers' permission.",
                "AI_CONFIGURATION_REQUIRED",
            )
        if status == 429:
            raise LLMError(429, "The AI service is rate limiting requests. Try again shortly.")

        if status != 200:
            # Model not available / provider error: try the fallback model.
            logger.warning("HuggingFace %s returned %s: %s", model, status, _upstream_message(body))
            last_error = LLMError(502, f"The AI model '{model}' is unavailable.")
            continue

        choice = (body.get("choices") or [{}])[0] if isinstance(body, dict) else {}
        message = choice.get("message") or {}
        content = (message.get("content") or message.get("reasoning") or "").strip()
        if not content:
            last_error = LLMError(502, f"The AI model '{model}' returned an empty response.")
            continue

        return {
            "content": content,
            "model": model,
            "latency_ms": round((time.perf_counter() - started) * 1000),
        }

    raise last_error
