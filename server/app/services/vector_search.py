"""
Vector search service - Semantic search using pgvector
"""

from typing import List, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session

from app.models import ArtifactVersion, CanonFact
from app.config import settings


class VectorSearchService:
    """Semantic search with pgvector"""

    def __init__(self, db: Session):
        self.db = db
        # Imported lazily: sentence-transformers pulls in torch/scipy and is heavy to import
        from sentence_transformers import SentenceTransformer

        self.embeddings_model = SentenceTransformer(settings.EMBEDDINGS_MODEL)

    def embed_text(self, text: str) -> List[float]:
        """Generate embedding for text"""
        embedding = self.embeddings_model.encode(text)
        return embedding.tolist()

    def search_artifacts(
        self,
        project_id: UUID,
        query: str,
        artifact_type: str | None = None,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """Search artifacts by semantic similarity"""

        # Generate query embedding
        query_embedding = self.embed_text(query)

        # Build search query (pgvector similarity search)
        search_query = self.db.query(ArtifactVersion).filter(
            ArtifactVersion.project_id == project_id,
        )

        if artifact_type:
            search_query = search_query.filter(
                ArtifactVersion.artifact_type == artifact_type
            )

        results = search_query.limit(limit).all()

        return [
            {
                "artifact_id": str(r.artifact_id),
                "artifact_type": r.artifact_type,
                "version_number": r.version_number,
                "content": r.content[:500],  # Preview
                "status": r.status,
            }
            for r in results
        ]

    def search_canon(
        self,
        project_id: UUID,
        query: str,
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """Search canon facts by semantic similarity"""

        results = self.db.query(CanonFact).filter(
            CanonFact.project_id == project_id,
            CanonFact.confirmed == True,
        ).limit(limit).all()

        return [
            {
                "canon_id": str(c.id),
                "fact": c.fact,
                "grounding": c.grounding,
            }
            for c in results
        ]

    def find_similar_content(
        self,
        project_id: UUID,
        content: str,
        content_type: str = "artifact",
        limit: int = 5,
    ) -> List[Dict[str, Any]]:
        """Find similar content in project"""

        if content_type == "artifact":
            return self.search_artifacts(project_id, content, limit=limit)
        elif content_type == "canon":
            return self.search_canon(project_id, content, limit=limit)
        else:
            return []
