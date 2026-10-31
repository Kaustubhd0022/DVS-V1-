"""
LLM access through an OpenAI-compatible chat completions provider (Groq or HuggingFace
Inference Providers), chosen by LLM_PROVIDER.

Provider keys only ever live on the server; browsers call POST /api/ai/generate instead of
calling a model provider directly.
"""

import json
import logging
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_SECONDS = 120.0

JSON_INSTRUCTION = (
    "Respond with a single valid JSON object only. Do not wrap it in markdown fences "
    "and do not add any text before or after it."
)


# USD per 1M tokens (input, output). Source: console.groq.com/docs/models, checked 2026-10-28.
# Models missing here get no cost estimate rather than a guessed one.
MODEL_PRICES_PER_MILLION: Dict[str, Tuple[float, float]] = {
    "openai/gpt-oss-120b": (0.15, 0.60),
    "openai/gpt-oss-20b": (0.075, 0.30),
}


def estimate_cost(model: str, input_tokens: Optional[int], output_tokens: Optional[int]) -> Optional[float]:
    price = MODEL_PRICES_PER_MILLION.get(model)
    if price is None or input_tokens is None or output_tokens is None:
        return None
    return (input_tokens * price[0] + output_tokens * price[1]) / 1_000_000


def _usage(body: Any) -> Dict[str, Optional[int]]:
    usage = body.get("usage") if isinstance(body, dict) else None
    usage = usage if isinstance(usage, dict) else {}
    return {
        "input_tokens": usage.get("prompt_tokens"),
        "output_tokens": usage.get("completion_tokens"),
    }


class LLMError(Exception):
    """An error that is safe to show to the caller. `status_code` is the HTTP status to return."""

    def __init__(self, status_code: int, message: str, code: str = "AI_SERVICE_ERROR"):
        super().__init__(message)
        self.status_code = status_code
        self.message = message
        self.code = code


@dataclass(frozen=True)
class Provider:
    name: str  # shown to users, e.g. in /api/ai/test
    base_url: str
    token: str
    token_setting: str  # the env var to name in configuration errors
    models: List[str]
    supports_response_format: bool
    no_credits_message: Optional[str]  # for HTTP 402, when the provider uses it for billing


def _models(primary: str, fallback: str) -> List[str]:
    return [primary] + ([fallback] if fallback and fallback != primary else [])


def provider() -> Provider:
    """The configured provider. Raises LLMError when LLM_PROVIDER names no known provider."""
    choice = settings.LLM_PROVIDER.strip().lower()
    if choice == "groq":
        return Provider(
            name="Groq",
            base_url=settings.GROQ_BASE_URL,
            token=settings.GROQ_API_KEY,
            token_setting="GROQ_API_KEY",
            models=_models(settings.GROQ_MODEL, settings.GROQ_FALLBACK_MODEL),
            supports_response_format=True,
            no_credits_message=None,
        )
    if choice == "huggingface":
        return Provider(
            name="HuggingFace",
            base_url=settings.HUGGINGFACE_BASE_URL,
            token=settings.HUGGINGFACE_API_TOKEN,
            token_setting="HUGGINGFACE_API_TOKEN",
            models=_models(settings.HUGGINGFACE_MODEL, settings.HUGGINGFACE_FALLBACK_MODEL),
            supports_response_format=False,
            no_credits_message=(
                "The HuggingFace account has no Inference Providers credits left. "
                "Add credits at huggingface.co/settings/billing."
            ),
        )
    raise LLMError(
        503,
        f"LLM_PROVIDER is set to '{settings.LLM_PROVIDER}'. Use 'groq' or 'huggingface'.",
        "AI_CONFIGURATION_REQUIRED",
    )


def is_configured() -> bool:
    try:
        return bool(provider().token)
    except LLMError:
        return False


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


def _with_json_instruction(
    messages: List[Dict[str, str]], output_schema: Optional[Dict[str, Any]] = None
) -> List[Dict[str, str]]:
    instruction = JSON_INSTRUCTION
    if output_schema is not None:
        instruction += "\nThe JSON must match this JSON Schema:\n" + json.dumps(output_schema)
    out = [dict(m) for m in messages]
    for message in out:
        if message["role"] == "system":
            message["content"] = f"{message['content']}\n\n{instruction}"
            return out
    return [{"role": "system", "content": instruction}, *out]


async def chat_completion(
    messages: List[Dict[str, str]],
    *,
    temperature: float = 0.7,
    max_tokens: int = 2000,
    json_mode: bool = False,
    output_schema: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Return {"content", "model", "latency_ms", "usage"}. Raises LLMError with a caller-safe message.

    `usage` holds input_tokens / output_tokens as reported by the provider (None when absent).
    """
    active = provider()
    if not active.token:
        raise LLMError(
            503,
            f"The server has no {active.name} API key configured ({active.token_setting}).",
            "AI_CONFIGURATION_REQUIRED",
        )

    if json_mode:
        messages = _with_json_instruction(messages, output_schema)

    url = f"{active.base_url.rstrip('/')}/chat/completions"
    headers = {"Authorization": f"Bearer {active.token}"}
    models = active.models

    started = time.perf_counter()
    last_error = LLMError(502, "The AI service is unavailable.")

    for model in models:
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode and active.supports_response_format:
            payload["response_format"] = {"type": "json_object"}
        try:
            status, body = await _post(url, headers, payload)
        except httpx.TimeoutException:
            last_error = LLMError(504, "The AI service took too long to respond.")
            continue
        except httpx.HTTPError:
            logger.exception("%s request failed", active.name)
            last_error = LLMError(502, "Could not reach the AI service.")
            continue

        # Problems with the account or token affect every model: stop instead of trying the next.
        if status == 402 and active.no_credits_message:
            raise LLMError(402, active.no_credits_message, "AI_CREDITS_REQUIRED")
        if status in (401, 403):
            hint = (
                " It needs the 'Make calls to Inference Providers' permission."
                if active.name == "HuggingFace"
                else ""
            )
            raise LLMError(
                502,
                f"{active.name} rejected the API key ({active.token_setting}).{hint}",
                "AI_CONFIGURATION_REQUIRED",
            )
        if status == 429:
            raise LLMError(429, "The AI service is rate limiting requests. Try again shortly.")

        if status != 200:
            # Model not available / provider error: try the fallback model.
            logger.warning("%s %s returned %s: %s", active.name, model, status, _upstream_message(body))
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
            "usage": _usage(body),
        }

    raise last_error
