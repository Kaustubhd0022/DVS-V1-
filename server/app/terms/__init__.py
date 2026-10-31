"""The Terms & Conditions the user must accept.

The text lives in terms.md. Change the text => bump TERMS_VERSION, so everyone is asked
to accept again. The SHA-256 of the exact text is stored with each acceptance as evidence of
what was agreed to.
"""

import hashlib
import re
from dataclasses import dataclass
from pathlib import Path

TERMS_VERSION = "2026-10-v2"
TERMS_TITLE = "Notice"

_TERMS_FILE = Path(__file__).with_name("terms.md")


@dataclass(frozen=True)
class Terms:
    version: str
    title: str
    text: str
    sha256: str


def _load() -> Terms:
    raw = _TERMS_FILE.read_text(encoding="utf-8")
    # Drop the leading maintainer comment; it is not part of what users agree to.
    text = re.sub(r"\A\s*<!--.*?-->\s*", "", raw, flags=re.DOTALL).strip().replace("\r\n", "\n")
    return Terms(
        version=TERMS_VERSION,
        title=TERMS_TITLE,
        text=text,
        sha256=hashlib.sha256(text.encode("utf-8")).hexdigest(),
    )


CURRENT_TERMS = _load()
