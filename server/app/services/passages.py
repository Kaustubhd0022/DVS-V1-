"""Picks the parts of a long source most relevant to a question, to keep model input small."""

import re
from typing import Iterable

PASSAGE_CHARS = 600
_WORD = re.compile(r"\w{4,}", re.UNICODE)


def _terms(texts: Iterable[str]) -> set:
    return {w.lower() for text in texts for w in _WORD.findall(text or "")}


def select_passages(text: str, about: Iterable[str], budget: int = 8000) -> str:
    """The whole text if it fits; otherwise the best-matching passages, kept in document order."""
    if len(text) <= budget:
        return text
    terms = _terms(about)
    blocks = [b.strip() for b in re.split(r"\n\s*\n|\n", text) if b.strip()]
    passages, current = [], ""
    for block in blocks:  # merge short lines into passages of about PASSAGE_CHARS
        current = f"{current}\n{block}" if current else block
        if len(current) >= PASSAGE_CHARS:
            passages.append(current)
            current = ""
    if current:
        passages.append(current)

    scored = sorted(
        range(len(passages)),
        key=lambda i: -len(terms & {w.lower() for w in _WORD.findall(passages[i])}),
    )
    chosen, used = set(), 0
    for i in scored:
        if used + len(passages[i]) > budget:
            continue
        chosen.add(i)
        used += len(passages[i])
    return "\n...\n".join(passages[i] for i in sorted(chosen))
