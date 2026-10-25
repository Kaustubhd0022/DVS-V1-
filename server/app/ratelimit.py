"""Small in-memory sliding-window rate limiter (per process; use Redis if you run several workers)."""

import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import HTTPException


class RateLimiter:
    def __init__(self, limit_per_minute: int):
        self.limit = limit_per_minute
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)

    def check(self, key: str) -> None:
        now = time.monotonic()
        hits = self._hits[key]
        while hits and now - hits[0] > 60:
            hits.popleft()
        if len(hits) >= self.limit:
            raise HTTPException(status_code=429, detail="Too many AI requests. Try again in a minute.")
        hits.append(now)

    def reset(self) -> None:
        self._hits.clear()
