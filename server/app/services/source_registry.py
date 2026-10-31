"""
Which sites research may use, and how much weight each carries.

primary   - Indian government (central and state: *.gov.in, *.nic.in), official government portals
            on other domains, and UNESCO.
secondary - open reference sources (Wikipedia, open-access Oxford pages, archives, encyclopedias).

Anything else is not an approved source: the server neither fetches it nor accepts it as evidence.
"""

from typing import List, Optional
from urllib.parse import urlparse

PRIMARY = "primary"
SECONDARY = "secondary"

# A host matches a domain when it equals it or is a subdomain of it.
PRIMARY_DOMAINS = [
    "gov.in",                # central and state government (ASI is asi.nic.in; culture, tourism, gazetteers ...)
    "nic.in",                # National Informatics Centre hosting for government bodies
    "abhilekh-patal.in",     # National Archives of India digital repository
    "unesco.org",            # World Heritage (whc.) and Intangible Cultural Heritage (ich.) listings
]
SECONDARY_DOMAINS = [
    "wikipedia.org",
    "oxfordreference.com",
    "oxfordre.com",
    "academic.oup.com",
    "archive.org",
    "jstor.org",
    "britannica.com",
    "sahapedia.org",
    "doaj.org",
]


def _matches(host: str, domains: List[str]) -> bool:
    return any(host == domain or host.endswith("." + domain) for domain in domains)


def host_of(url: str) -> Optional[str]:
    try:
        parsed = urlparse(url)
    except ValueError:
        return None
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        return None
    return parsed.hostname.lower().rstrip(".")


def tier_for(url: str) -> Optional[str]:
    """'primary', 'secondary', or None when the URL is not on an approved site."""
    host = host_of(url)
    if host is None:
        return None
    if _matches(host, PRIMARY_DOMAINS):
        return PRIMARY
    if _matches(host, SECONDARY_DOMAINS):
        return SECONDARY
    return None


def domains_for(tier: str) -> List[str]:
    return list(PRIMARY_DOMAINS if tier == PRIMARY else SECONDARY_DOMAINS)
