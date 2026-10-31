"""Small in-memory sliding-window rate limiter (per process; use Redis if you run several workers)."""

import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import HTTPException


class RateLimiter:
    def __init__(self, limit_per_minute: int, max_keys: int = 10_000):
        self.limit = limit_per_minute
        self.max_keys = max_keys
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)
        self._last_cleanup = time.monotonic()

    def _cleanup_expired(self, now: float) -> None:
        """Periodically purge empty or stale rate limit buckets to prevent memory leaks."""
        stale_keys = []
        for k, hits in list(self._hits.items()):
            while hits and now - hits[0] > 60:
                hits.popleft()
            if not hits:
                stale_keys.append(k)
        for k in stale_keys:
            self._hits.pop(k, None)
        self._last_cleanup = now

    def check(self, key: str) -> None:
        now = time.monotonic()
        if now - self._last_cleanup > 60 or len(self._hits) > self.max_keys:
            self._cleanup_expired(now)

        hits = self._hits[key]
        while hits and now - hits[0] > 60:
            hits.popleft()
        if len(hits) >= self.limit:
            raise HTTPException(status_code=429, detail="Too many AI requests. Try again in a minute.")
        hits.append(now)

    def reset(self) -> None:
        self._hits.clear()
        self._last_cleanup = time.monotonic()
