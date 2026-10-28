"""
Terms (Notice) acceptance endpoints.

Flow: the signed-in user reads GET /api/terms, then POST /api/terms/accept with their typed name.
The acceptance is stored, and a signed PDF is emailed to TERMS_RECIPIENT_EMAIL in the background
(SMTP). A failed email never blocks the user; it is recorded and can be re-sent.
"""

import logging
import time
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import SessionLocal, get_db
from app.models import TermsAcceptance, User
from app.ratelimit import RateLimiter
from app.services import mailer
from app.terms import CURRENT_TERMS

logger = logging.getLogger(__name__)

router = APIRouter()
resend_limiter = RateLimiter(5)

MAX_EMAIL_ATTEMPTS = 3
RETRY_DELAYS_SECONDS = (0, 3, 10)


class TermsRead(BaseModel):
    version: str
    title: str
    text: str
    sha256: str


class AcceptRequest(BaseModel):
    terms_version: str
    signed_name: str = Field(min_length=2, max_length=120)
    agree: bool

    @field_validator("signed_name")
    @classmethod
    def _clean_name(cls, value: str) -> str:
        cleaned = mailer.clean_line(value, 120)
        if len(cleaned) < 2:
            raise ValueError("Enter your full name")
        return cleaned


class AcceptanceRead(BaseModel):
    terms_version: str
    signed_name: str
    accepted_at: datetime
    email_status: str

    class Config:
        from_attributes = True


class TermsStatus(BaseModel):
    accepted: bool
    current_version: str
    acceptance: Optional[AcceptanceRead] = None


def _current_acceptance(db: Session, user: User) -> Optional[TermsAcceptance]:
    return (
        db.query(TermsAcceptance)
        .filter_by(user_id=user.id, terms_version=CURRENT_TERMS.version)
        .first()
    )


def _deliver(acceptance_id) -> None:
    """Background task: send the signed form (up to 3 attempts) and record the outcome."""
    db = SessionLocal()
    try:
        acceptance = db.get(TermsAcceptance, acceptance_id)
        if acceptance is None or acceptance.email_status == "sent":
            return
        user = db.get(User, acceptance.user_id)
        signed = mailer.SignedTerms(
            signed_name=acceptance.signed_name,
            account_name=user.name or "",
            account_email=user.email,
            user_id=str(user.id),
            terms_title=CURRENT_TERMS.title,
            terms_version=acceptance.terms_version,
            terms_sha256=acceptance.terms_sha256,
            terms_text=CURRENT_TERMS.text,
            accepted_at=acceptance.accepted_at,
            ip_address=acceptance.ip_address,
            user_agent=acceptance.user_agent,
            acceptance_id=str(acceptance.id),
        )

        for attempt, delay in enumerate(RETRY_DELAYS_SECONDS[:MAX_EMAIL_ATTEMPTS], start=1):
            if delay:
                time.sleep(delay)
            acceptance.email_attempts = (acceptance.email_attempts or 0) + 1
            try:
                mailer.send_signed_terms(signed)
            except mailer.MailError as error:
                acceptance.email_status = "failed"
                acceptance.email_error = str(error)[:500]
                db.commit()
                logger.warning("Terms email attempt %s failed for acceptance %s: %s", attempt, acceptance.id, error)
                if not mailer.smtp_configured():
                    return  # retrying cannot help until SMTP is configured
                continue
            acceptance.email_status = "sent"
            acceptance.email_sent_at = datetime.utcnow()
            acceptance.email_error = None
            db.commit()
            logger.info("Signed terms emailed for acceptance %s", acceptance.id)
            return
    except Exception:
        logger.exception("Unexpected error delivering signed terms for %s", acceptance_id)
    finally:
        db.close()


@router.get("", response_model=TermsRead)
async def get_terms():
    """The current Terms & Conditions text (public: it can be shown before sign-in)."""
    return CURRENT_TERMS.__dict__


@router.get("/status", response_model=TermsStatus)
async def terms_status(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    acceptance = _current_acceptance(db, user)
    return TermsStatus(
        accepted=acceptance is not None,
        current_version=CURRENT_TERMS.version,
        acceptance=AcceptanceRead.model_validate(acceptance) if acceptance else None,
    )


@router.post("/accept", response_model=AcceptanceRead)
async def accept_terms(
    body: AcceptRequest,
    request: Request,
    background: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not body.agree:
        raise HTTPException(status_code=422, detail="You must agree to the Notice to continue")
    if body.terms_version != CURRENT_TERMS.version:
        raise HTTPException(
            status_code=409,
            detail={"message": "The Notice was updated. Please review the latest version.",
                    "current_version": CURRENT_TERMS.version},
        )

    existing = _current_acceptance(db, user)
    if existing:
        return existing  # idempotent: one record and one email per user per version

    acceptance = TermsAcceptance(
        user_id=user.id,
        terms_version=CURRENT_TERMS.version,
        terms_sha256=CURRENT_TERMS.sha256,
        signed_name=body.signed_name,
        accepted_at=datetime.utcnow(),
        ip_address=mailer.clean_line(request.client.host if request.client else None, 64) or None,
        user_agent=mailer.clean_line(request.headers.get("user-agent"), 500) or None,
        email_status="pending",
    )
    db.add(acceptance)
    db.commit()
    db.refresh(acceptance)

    background.add_task(_deliver, acceptance.id)
    return acceptance


@router.post("/resend", response_model=AcceptanceRead)
async def resend_signed_copy(
    background: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retry emailing the signed copy when an earlier attempt failed."""
    resend_limiter.check(str(user.id))
    acceptance = _current_acceptance(db, user)
    if acceptance is None:
        raise HTTPException(status_code=404, detail="Terms have not been accepted yet")
    if acceptance.email_status == "failed":
        acceptance.email_status = "pending"
        db.commit()
        db.refresh(acceptance)
        background.add_task(_deliver, acceptance.id)
    return acceptance
