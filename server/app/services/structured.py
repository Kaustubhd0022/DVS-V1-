"""
Structured (JSON) model output: parse it, check it against an optional JSON Schema, and give the
model one chance to fix a bad reply before failing with a clear error.
"""

import json
import re
from typing import Any, Dict, List, Optional

from jsonschema import Draft202012Validator

from app.services import llm

MAX_REPORTED_ERRORS = 8
_FENCE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL | re.IGNORECASE)


class StructuredOutputError(llm.LLMError):
    """The model's reply stayed invalid after the retry. Carries what the run log needs."""

    def __init__(self, message: str, model: str, usage: Dict[str, Optional[int]]):
        super().__init__(502, message, "AI_VALIDATION_FAILED")
        self.model = model
        self.usage = usage


def check_schema(schema: Dict[str, Any]) -> None:
    """Raise jsonschema.SchemaError when the caller's schema is itself invalid."""
    Draft202012Validator.check_schema(schema)


def extract_json(text: str) -> Any:
    """Parse a JSON value from model text, allowing code fences or prose around one object/array."""
    text = text.strip()
    fenced = _FENCE.search(text)
    candidates = [text, fenced.group(1)] if fenced else [text]
    for opener, closer in (("{", "}"), ("[", "]")):
        start, end = text.find(opener), text.rfind(closer)
        if start != -1 and end > start:
            candidates.append(text[start : end + 1])
    for candidate in candidates:
        try:
            return json.loads(candidate)
        except ValueError:
            continue
    raise ValueError("no JSON value found")


def schema_errors(data: Any, schema: Dict[str, Any]) -> List[str]:
    errors = sorted(Draft202012Validator(schema).iter_errors(data), key=lambda e: list(e.absolute_path))
    return [
        f"{'/'.join(str(p) for p in error.absolute_path) or '(top level)'}: {error.message}"
        for error in errors[:MAX_REPORTED_ERRORS]
    ]


def _add_usage(total: Dict[str, Optional[int]], usage: Dict[str, Optional[int]]) -> None:
    for key in ("input_tokens", "output_tokens"):
        if usage.get(key) is None:
            continue
        total[key] = (total.get(key) or 0) + usage[key]


def _problem(content: str, schema: Optional[Dict[str, Any]]) -> Optional[str]:
    """What is wrong with the reply, in words the model can act on; None when it is fine."""
    try:
        data = extract_json(content)
    except ValueError:
        return "Your previous reply was not valid JSON."
    if schema is not None:
        errors = schema_errors(data, schema)
        if errors:
            return "Your previous reply did not match the required JSON Schema:\n" + "\n".join(
                f"- {e}" for e in errors
            )
    return None


async def generate_json(
    messages: List[Dict[str, str]],
    *,
    schema: Optional[Dict[str, Any]],
    temperature: float,
    max_tokens: int,
) -> Dict[str, Any]:
    """Like llm.chat_completion, plus `data` (the parsed value) and `validation_status`
    ("valid" or "valid_after_retry"). `usage` and `latency_ms` cover both attempts."""
    usage: Dict[str, Optional[int]] = {"input_tokens": None, "output_tokens": None}
    latency_ms = 0
    attempt_messages = messages

    for attempt in range(2):
        result = await llm.chat_completion(
            attempt_messages,
            temperature=temperature,
            max_tokens=max_tokens,
            json_mode=True,
            output_schema=schema,
        )
        _add_usage(usage, result["usage"])
        latency_ms += result["latency_ms"]
        problem = _problem(result["content"], schema)
        if problem is None:
            return {
                **result,
                "data": extract_json(result["content"]),
                "usage": usage,
                "latency_ms": latency_ms,
                "validation_status": "valid" if attempt == 0 else "valid_after_retry",
            }
        attempt_messages = [
            *messages,
            {"role": "assistant", "content": result["content"]},
            {"role": "user", "content": f"{problem}\nReply again with only the corrected JSON."},
        ]

    message = (
        "The AI model did not return valid JSON."
        if problem.startswith("Your previous reply was not valid JSON")
        else "The AI model's reply did not match the expected format."
    )
    raise StructuredOutputError(message, result["model"], usage)
