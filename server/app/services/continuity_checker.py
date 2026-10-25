"""
Continuity checking service - Conflict detection and contradiction analysis
"""

from typing import List, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session

from app.models import ArtifactVersion, CanonFact, Project
from app.services.context_resolver import ContextResolver


class ContinuityChecker:
    """Detect contradictions and continuity issues"""

    def __init__(self, db: Session):
        self.db = db
        self.context_resolver = ContextResolver(db)

    def check_artifact_continuity(
        self,
        project_id: UUID,
        artifact_id: UUID,
        content: str,
    ) -> Dict[str, Any]:
        """Check if artifact content contradicts canon"""

        # Get canon facts for project
        canon_facts = self.db.query(CanonFact).filter(
            CanonFact.project_id == project_id,
            CanonFact.confirmed == True,
        ).all()

        # Get continuity context
        continuity_context = self.context_resolver.resolve_continuity_context(
            project_id
        )

        conflicts = self._find_conflicts(content, canon_facts, continuity_context)

        return {
            "artifact_id": str(artifact_id),
            "project_id": str(project_id),
            "status": "passed" if len(conflicts) == 0 else "failed",
            "conflicts_found": len(conflicts),
            "conflicts": conflicts,
            "confidence": self._calculate_confidence(conflicts),
        }

    def _find_conflicts(
        self,
        content: str,
        canon_facts: List[CanonFact],
        context: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Find conflicts between content and canon"""

        conflicts = []

        # Check for explicit contradictions in canon facts
        for fact in canon_facts:
            # Simple keyword matching for now
            fact_keywords = fact.fact.lower().split()
            content_lower = content.lower()

            # Check if fact is negated in content
            for keyword in fact_keywords:
                if f"not {keyword}" in content_lower or f"no {keyword}" in content_lower:
                    conflicts.append(
                        {
                            "type": "direct_contradiction",
                            "canon_fact": fact.fact,
                            "conflicting_content": self._extract_context(
                                content, keyword
                            ),
                            "severity": "high",
                        }
                    )

        return conflicts

    def _extract_context(self, text: str, keyword: str, window: int = 50) -> str:
        """Extract context around keyword"""
        idx = text.lower().find(keyword.lower())
        if idx == -1:
            return ""

        start = max(0, idx - window)
        end = min(len(text), idx + len(keyword) + window)
        return text[start:end].strip()

    def _calculate_confidence(self, conflicts: List[Dict[str, Any]]) -> str:
        """Calculate confidence level of conflict detection"""
        if len(conflicts) == 0:
            return "high"
        elif len(conflicts) <= 2:
            return "medium"
        else:
            return "low"

    def check_character_consistency(
        self,
        project_id: UUID,
        character_id: UUID,
        properties: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Check if character properties are internally consistent"""

        issues = []

        # Check motivation vs arc alignment
        if "motivation" in properties and "arc" in properties:
            motivation = properties["motivation"].lower()
            arc = properties["arc"].lower()

            # Simple consistency checks
            if "revenge" in motivation and "redemption" in arc:
                issues.append(
                    {
                        "type": "arc_motivation_tension",
                        "message": "Revenge motivation may conflict with redemption arc",
                        "severity": "medium",
                    }
                )

        return {
            "character_id": str(character_id),
            "project_id": str(project_id),
            "issues_found": len(issues),
            "issues": issues,
            "status": "passed" if len(issues) == 0 else "warning",
        }

    def check_timeline_consistency(
        self,
        project_id: UUID,
        events: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Check if timeline of events is consistent"""

        issues = []

        # Sort events by timestamp
        sorted_events = sorted(
            events,
            key=lambda e: e.get("timestamp", ""),
        )

        # Check for temporal contradictions
        for i in range(len(sorted_events) - 1):
            current = sorted_events[i]
            next_event = sorted_events[i + 1]

            # Check for causality issues
            if current.get("caused_by") and next_event.get("timestamp"):
                # Simple temporal check
                pass

        return {
            "project_id": str(project_id),
            "events_checked": len(events),
            "issues_found": len(issues),
            "issues": issues,
            "status": "passed" if len(issues) == 0 else "warning",
        }
