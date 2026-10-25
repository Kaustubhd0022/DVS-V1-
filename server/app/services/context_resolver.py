"""
Context Resolver Service
Retrieves minimal, relevant project context for agents
Prevents dumping entire project into every LLM call
"""

from typing import List, Dict, Any, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models import (
    Project, Story, Character, Evidence, CanonFact,
    CreativeDecision, ArtifactVersion, Intent
)


class ContextResolver:
    """Resolve minimal relevant context for agent operations"""

    def __init__(self, db: Session):
        self.db = db

    def resolve_project_context(
        self,
        project_id: UUID,
        entity_types: Optional[List[str]] = None,
        limit: int = 5
    ) -> Dict[str, Any]:
        """
        Resolve project context for an agent

        Args:
            project_id: Project to get context for
            entity_types: Which entity types to include (None = all)
            limit: Max items per entity type

        Returns:
            Structured context dict
        """
        project = self.db.query(Project).filter_by(id=project_id).first()
        if not project:
            raise ValueError(f"Project {project_id} not found")

        context = {
            "project_id": str(project.id),
            "project_title": project.title,
            "format": project.format,
            "genre": project.genre,
        }

        # Intent
        if entity_types is None or "intent" in entity_types:
            intent = self.db.query(Intent).filter_by(project_id=project_id).first()
            if intent:
                context["intent"] = {
                    "statement": intent.intent,
                    "knowns": intent.knowns,
                    "unknowns": intent.unknowns,
                    "assumptions": intent.assumptions,
                }

        # Approved story
        if entity_types is None or "story" in entity_types:
            stories = self.db.query(Story).filter_by(project_id=project_id).limit(limit).all()
            context["stories"] = [
                {
                    "id": str(s.id),
                    "premise": s.premise,
                    "logline": s.logline,
                    "themes": s.themes,
                    "status": s.status.value if s.status else None,
                }
                for s in stories
            ]

        # Characters
        if entity_types is None or "character" in entity_types:
            characters = self.db.query(Character).filter_by(project_id=project_id).limit(limit).all()
            context["characters"] = [
                {
                    "id": str(c.id),
                    "name": c.name,
                    "motivation": c.motivation,
                    "voice": c.voice,
                    "profile": c.profile,
                    "status": c.status.value if c.status else None,
                }
                for c in characters
            ]

        # Canon facts
        if entity_types is None or "canon" in entity_types:
            canon = self.db.query(CanonFact).filter_by(project_id=project_id).limit(limit).all()
            context["canon_facts"] = [
                {
                    "id": str(c.id),
                    "category": c.category,
                    "statement": c.statement,
                }
                for c in canon
            ]

        # Research findings
        if entity_types is None or "research" in entity_types:
            evidence = self.db.query(Evidence).filter_by(project_id=project_id).limit(limit).all()
            context["research"] = [
                {
                    "id": str(e.id),
                    "claim": e.claim,
                    "source_url": e.source_url,
                    "supporting_excerpt": e.supporting_excerpt,
                    "relevance": e.relevance,
                    "confidence": e.confidence,
                }
                for e in evidence
            ]

        # Decisions
        if entity_types is None or "decision" in entity_types:
            decisions = self.db.query(CreativeDecision).filter_by(project_id=project_id).limit(limit).all()
            context["decisions"] = [
                {
                    "id": str(d.id),
                    "statement": d.statement,
                    "rationale": d.rationale,
                    "status": d.status.value if d.status else None,
                }
                for d in decisions
            ]

        return context

    def resolve_story_context(
        self,
        story_id: UUID,
        project_id: UUID
    ) -> Dict[str, Any]:
        """Resolve context for story-related operations"""
        story = self.db.query(Story).filter_by(id=story_id, project_id=project_id).first()
        if not story:
            raise ValueError(f"Story {story_id} not found")

        return {
            "story_id": str(story.id),
            "premise": story.premise,
            "logline": story.logline,
            "synopsis": story.synopsis,
            "themes": story.themes,
            "conflict": story.conflict,
            "beats": story.beats,
            "characters": self._get_story_characters(project_id),
            "canon": self._get_story_canon(project_id),
        }

    def resolve_character_context(
        self,
        character_id: UUID,
        project_id: UUID
    ) -> Dict[str, Any]:
        """Resolve context for character-related operations"""
        character = self.db.query(Character).filter_by(id=character_id, project_id=project_id).first()
        if not character:
            raise ValueError(f"Character {character_id} not found")

        return {
            "character_id": str(character.id),
            "name": character.name,
            "profile": character.profile,
            "motivation": character.motivation,
            "voice": character.voice,
            "story_context": self._get_character_story_context(character_id),
            "relationships": self._get_character_relationships(character_id),
        }

    def resolve_writing_context(
        self,
        artifact_type: str,
        project_id: UUID,
        character_ids: Optional[List[UUID]] = None
    ) -> Dict[str, Any]:
        """Resolve context for writing operations"""
        context = self.resolve_project_context(
            project_id,
            entity_types=["story", "character", "canon", "research"],
            limit=10
        )

        # Filter characters if specified
        if character_ids:
            context["characters"] = [
                c for c in context.get("characters", [])
                if UUID(c["id"]) in character_ids
            ]

        return context

    def resolve_continuity_context(
        self,
        project_id: UUID
    ) -> Dict[str, Any]:
        """Resolve context for continuity checking"""
        return {
            "canon_facts": self._get_all_canon(project_id),
            "characters": self._get_all_characters(project_id),
            "story_timeline": self._get_story_timeline(project_id),
            "decisions": self._get_all_decisions(project_id),
        }

    def _get_story_characters(self, project_id: UUID) -> List[Dict[str, Any]]:
        """Get all characters for a story"""
        characters = self.db.query(Character).filter_by(project_id=project_id).all()
        return [
            {
                "id": str(c.id),
                "name": c.name,
                "motivation": c.motivation,
            }
            for c in characters
        ]

    def _get_story_canon(self, project_id: UUID) -> List[Dict[str, Any]]:
        """Get canon facts for story"""
        canon = self.db.query(CanonFact).filter_by(project_id=project_id).all()
        return [
            {
                "category": c.category,
                "statement": c.statement,
            }
            for c in canon
        ]

    def _get_character_story_context(self, character_id: UUID) -> Dict[str, Any]:
        """Get story context for a character"""
        # Could involve story beats, scenes, dialogue
        return {}

    def _get_character_relationships(self, character_id: UUID) -> List[Dict[str, Any]]:
        """Get character relationships"""
        # Would query Relationship table
        return []

    def _get_all_canon(self, project_id: UUID) -> List[Dict[str, Any]]:
        """Get all canon facts"""
        canon = self.db.query(CanonFact).filter_by(project_id=project_id).all()
        return [
            {
                "id": str(c.id),
                "category": c.category,
                "statement": c.statement,
            }
            for c in canon
        ]

    def _get_all_characters(self, project_id: UUID) -> List[Dict[str, Any]]:
        """Get all characters"""
        characters = self.db.query(Character).filter_by(project_id=project_id).all()
        return [
            {
                "id": str(c.id),
                "name": c.name,
                "profile": c.profile,
            }
            for c in characters
        ]

    def _get_story_timeline(self, project_id: UUID) -> Dict[str, Any]:
        """Get story timeline"""
        return {}

    def _get_all_decisions(self, project_id: UUID) -> List[Dict[str, Any]]:
        """Get all creative decisions"""
        decisions = self.db.query(CreativeDecision).filter_by(project_id=project_id).all()
        return [
            {
                "id": str(d.id),
                "statement": d.statement,
                "rationale": d.rationale,
            }
            for d in decisions
        ]
