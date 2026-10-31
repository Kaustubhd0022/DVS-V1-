"""
Web search restricted to approved sites (Tavily; free plan: 1,000 searches a month, no card).
Results are filtered through source_registry again, so only approved sites ever come back.
"""

import logging
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple

import httpx

from app.config import settings
from app.services import source_registry

logger = logging.getLogger(__name__)

TAVILY_URL = "https://api.tavily.com/search"
REQUEST_TIMEOUT_SECONDS = 30.0


class WebSearchError(Exception):
    def __init__(self, status_code: int, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


@dataclass(frozen=True)
class WebHit:
    title: str
    url: str
    snippet: str
    source_tier: str


async def _post(url: str, headers: Dict[str, str], payload: Dict[str, Any]) -> Tuple[int, Any]:
    """The only network call; tests replace this function."""
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT_SECONDS) as client:
        response = await client.post(url, headers=headers, json=payload)
    try:
        body = response.json()
    except ValueError:
        body = {}
    return response.status_code, body


async def search_approved(query: str, tier: str, max_results: int = 8) -> List[WebHit]:
    """Search only the domains of one tier ('primary' government/UNESCO, or 'secondary')."""
    if not settings.TAVILY_API_KEY:
        raise WebSearchError(
            503, "Web search is not configured on the server (TAVILY_API_KEY). Wikipedia search still works."
        )
    payload = {
        "query": query,
        "include_domains": source_registry.domains_for(tier),
        "max_results": max_results,
        "search_depth": "basic",  # 1 credit per search
    }
    try:
        status, body = await _post(TAVILY_URL, {"Authorization": f"Bearer {settings.TAVILY_API_KEY}"}, payload)
    except httpx.HTTPError:
        logger.exception("Tavily request failed")
        raise WebSearchError(502, "Could not reach the web search service. Try again shortly.")
    if status == 429 or status == 432:
        raise WebSearchError(429, "The monthly web search allowance is used up or rate limited. Try again later.")
    if status != 200 or not isinstance(body, dict):
        logger.warning("Tavily returned %s", status)
        raise WebSearchError(502, "The web search service did not answer the request.")

    hits = []
    for item in body.get("results", []):
        url = item.get("url", "")
        found_tier = source_registry.tier_for(url)
        if found_tier is None:
            continue  # never return a site that is not on the approved list
        hits.append(WebHit(
            title=item.get("title") or url,
            url=url,
            snippet=(item.get("content") or "")[:500],
            source_tier=found_tier,
        ))
    return hits
