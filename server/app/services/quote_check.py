"""Checks that a quoted excerpt really appears in a stored source document."""

import re
from typing import Optional, Tuple

# A shorter quote proves too little ("the fort" appears in any article about forts).
MIN_EXCERPT_WORDS = 5

# One character to one character, so offsets in the normalized text are offsets in the original.
_NORMALIZE = str.maketrans({
    "‘": "'", "’": "'", "“": '"', "”": '"',
    "–": "-", "—": "-", " ": " ",
})
_QUOTE_MARKS = "\"'"


def excerpt_words(excerpt: str) -> list:
    return excerpt.translate(_NORMALIZE).strip().strip(_QUOTE_MARKS).split()


def find_excerpt(text: str, excerpt: str) -> Optional[Tuple[int, int]]:
    """Return the (start, end) offsets of `excerpt` in `text`, or None when it is not there.

    Matching ignores case, runs of whitespace, curly versus straight quotes, and dash styles;
    every word must otherwise appear exactly and in order. If that fails, spacing is ignored
    altogether (OCR text often splits or joins words: "F ort"), but every other character must
    still appear in order.
    """
    words = excerpt_words(excerpt)
    if not words:
        return None
    normalized = text.translate(_NORMALIZE)
    match = re.search(r"\s+".join(re.escape(word) for word in words), normalized, re.IGNORECASE)
    if match is None:
        characters = "".join(words)
        # Space-tolerant OCR fallback matching across split words
        match = re.search(r"\s*".join(re.escape(c) for c in characters), normalized, re.IGNORECASE)
    return match.span() if match else None
