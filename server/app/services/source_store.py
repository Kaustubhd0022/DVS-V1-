"""Stores fetched sources once per project and content version."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models import SourceDocument, User
from app.services.retrieval import FetchedDocument


def store_fetched(db: Session, project_id: UUID, user: User, fetched: FetchedDocument) -> SourceDocument:
    existing = db.query(SourceDocument).filter_by(
        project_id=project_id, url=fetched.url, content_hash=fetched.content_hash
    ).first()
    if existing:
        return existing
    doc = SourceDocument(
        project_id=project_id, provider=fetched.provider, source_tier=fetched.source_tier,
        url=fetched.url, title=fetched.title, language=fetched.language, publisher=fetched.publisher,
        revision_id=fetched.revision_id, revised_at=fetched.revised_at,
        content_hash=fetched.content_hash, text=fetched.text,
        extraction_method=fetched.extraction_method, retrieved_by=user.id,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
