"""
Source retrieval. Fetched text is returned with a content hash so the caller can store exactly
what was read and later check quotes against it.

- Wikipedia (free, no key): search and article text with revision.
- Approved web pages (source_registry): HTML or PDF from government and open reference sites,
  fetched only from approved domains that resolve to public addresses.
"""

import hashlib
import html
import ipaddress
import logging
import re
import socket
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import quote, urljoin

import httpx

from app.services import source_registry, text_extract

logger = logging.getLogger(__name__)

REQUEST_TIMEOUT_SECONDS = 20.0
# Wikimedia asks API clients to identify themselves: https://meta.wikimedia.org/wiki/User-Agent_policy
USER_AGENT = "TattvaCoResearch/1.0 (https://vyomaibytattvaco.vercel.app)"
# Restricts the language to a subdomain-safe code (en, hi, mr, zh-yue ...): it becomes the host name.
LANGUAGE_PATTERN = r"^[a-z]{2,3}(-[a-z]{2,8})?$"
_LANGUAGE = re.compile(LANGUAGE_PATTERN)
_TAGS = re.compile(r"<[^>]+>")

MAX_DOWNLOAD_BYTES = 15 * 1024 * 1024
MAX_REDIRECTS = 5
# Less than this is a login wall, an error page or an empty shell, not a readable source.
MIN_TEXT_CHARS = 40


class RetrievalError(Exception):
    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


@dataclass(frozen=True)
class SourceHit:
    title: str
    url: str
    snippet: str


@dataclass(frozen=True)
class FetchedDocument:
    provider: str
    title: str
    url: str
    language: str
    publisher: str
    revision_id: Optional[str]
    revised_at: Optional[datetime]
    text: str
    content_hash: str
    source_tier: str
    extraction_method: str


async def _get(url: str, params: Dict[str, Any]) -> Tuple[int, Any]:
    """The only network call; tests replace this function."""
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS, headers={"User-Agent": USER_AGENT}) as client:
        response = await client.get(url, params=params)
    try:
        body = response.json()
    except ValueError:
        body = {}
    return response.status_code, body


def _api_url(language: str) -> str:
    if not _LANGUAGE.match(language):
        raise RetrievalError(422, "Unsupported language code")
    return f"https://{language}.wikipedia.org/w/api.php"


def article_url(language: str, title: str) -> str:
    return f"https://{language}.wikipedia.org/wiki/{quote(title.replace(' ', '_'), safe='()_,-.:')}"


async def _query(language: str, params: Dict[str, Any]) -> Dict[str, Any]:
    url = _api_url(language)
    try:
        status, body = await _get(url, {**params, "action": "query", "format": "json", "formatversion": 2})
    except httpx.HTTPError:
        logger.exception("Wikipedia request failed")
        raise RetrievalError(502, "Could not reach Wikipedia. Try again shortly.")
    if status != 200 or not isinstance(body, dict) or "query" not in body:
        logger.warning("Wikipedia returned %s", status)
        raise RetrievalError(502, "Wikipedia did not answer the request. Try again shortly.")
    return body["query"]


async def search_wikipedia(query_text: str, language: str = "en", limit: int = 5) -> List[SourceHit]:
    result = await _query(language, {"list": "search", "srsearch": query_text, "srlimit": limit})
    return [
        SourceHit(
            title=item["title"],
            url=article_url(language, item["title"]),
            snippet=html.unescape(_TAGS.sub("", item.get("snippet", ""))),
        )
        for item in result.get("search", [])
    ]


async def fetch_wikipedia(title: str, language: str = "en") -> FetchedDocument:
    result = await _query(language, {
        "prop": "extracts|info|revisions",
        "explaintext": 1,
        "inprop": "url",
        "rvprop": "ids|timestamp",
        "titles": title,
        "redirects": 1,
    })
    pages = result.get("pages") or []
    page = pages[0] if pages else {}
    text = (page.get("extract") or "").strip()
    if page.get("missing") or not text:
        raise RetrievalError(404, f"No Wikipedia article named '{title}' was found.")

    revision = (page.get("revisions") or [{}])[0]
    revised_at = None
    if revision.get("timestamp"):
        revised_at = datetime.strptime(revision["timestamp"], "%Y-%m-%dT%H:%M:%SZ")
    return FetchedDocument(
        provider="wikipedia",
        title=page["title"],
        url=page.get("fullurl") or article_url(language, page["title"]),
        language=language,
        publisher="Wikipedia",
        revision_id=str(revision["revid"]) if revision.get("revid") else None,
        revised_at=revised_at,
        text=text,
        content_hash=content_hash(text),
        source_tier=source_registry.SECONDARY,
        extraction_method="wikipedia",
    )


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


# ---- Approved web pages ------------------------------------------------------------------

async def _request(url: str) -> Tuple[int, Dict[str, str], bytes]:
    """One GET without following redirects; the only network call for web pages (tests replace it).
    Stops reading past MAX_DOWNLOAD_BYTES."""
    async with httpx.AsyncClient(
        timeout=REQUEST_TIMEOUT_SECONDS, headers={"User-Agent": USER_AGENT}, follow_redirects=False
    ) as client:
        async with client.stream("GET", url) as response:
            body = bytearray()
            async for chunk in response.aiter_bytes():
                body.extend(chunk)
                if len(body) > MAX_DOWNLOAD_BYTES:
                    raise RetrievalError(422, "The document is too large to fetch (over 15 MB).")
            headers = {key.lower(): value for key, value in response.headers.items()}
            return response.status_code, headers, bytes(body)


def _resolves_to_public_address(host: str) -> bool:
    """False when any address for `host` is private, loopback or otherwise not public, so an
    approved-looking name cannot reach the server's own network. (Tests replace this.)"""
    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror:
        return False
    return bool(infos) and all(ipaddress.ip_address(info[4][0]).is_global for info in infos)


def _decode(body: bytes, content_type: str) -> str:
    match = re.search(r"charset=([\w-]+)", content_type)
    try:
        return body.decode(match.group(1) if match else "utf-8", errors="replace")
    except LookupError:
        return body.decode("utf-8", errors="replace")


async def fetch_url(url: str) -> FetchedDocument:
    """Fetch an approved page or PDF and return its text. Every redirect hop is checked again."""
    for _ in range(MAX_REDIRECTS + 1):
        tier = source_registry.tier_for(url)
        if tier is None:
            raise RetrievalError(
                422, "That site is not on the approved source list (government, UNESCO or open reference sites)."
            )
        host = source_registry.host_of(url)
        if not _resolves_to_public_address(host):
            raise RetrievalError(422, "That address cannot be fetched.")
        try:
            status, headers, body = await _request(url)
        except httpx.HTTPError:
            logger.exception("Fetching %s failed", host)
            raise RetrievalError(502, f"Could not reach {host}. Try again shortly.")

        if status in (301, 302, 303, 307, 308) and headers.get("location"):
            url = urljoin(url, headers["location"])
            continue
        if status != 200:
            raise RetrievalError(502, f"{host} answered with HTTP {status}.")

        content_type = headers.get("content-type", "").lower()
        title: Optional[str] = None
        if "application/pdf" in content_type or body[:5] == b"%PDF-":
            text, method = text_extract.pdf_to_text(body), "pdf_text"
        elif "html" in content_type:
            title, text = text_extract.html_to_text(_decode(body, content_type))
            method = "html"
        elif content_type.startswith("text/plain"):
            text, method = _decode(body, content_type).strip(), "plain_text"
        else:
            raise RetrievalError(422, "Only web pages, PDFs and plain text can be used as sources.")

        if len(text) < MIN_TEXT_CHARS:
            raise RetrievalError(
                422, "No readable text was found at that address (it may need a login or be an image)."
            )
        publisher = host[4:] if host.startswith("www.") else host
        return FetchedDocument(
            provider="web",
            title=(title or url)[:500],
            url=url,
            language=None,
            publisher=publisher,
            revision_id=None,
            revised_at=None,
            text=text,
            content_hash=content_hash(text),
            source_tier=tier,
            extraction_method=method,
        )
    raise RetrievalError(422, "Too many redirects.")
