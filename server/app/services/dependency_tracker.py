"""
Dependency tracking service - Impact analysis and dependency management
"""

from typing import List, Dict, Any, Set
from uuid import UUID
from sqlalchemy.orm import Session

from app.models import Dependency, ArtifactVersion, Project


class DependencyTracker:
    """Track and analyze artifact dependencies"""

    def __init__(self, db: Session):
        self.db = db

    def add_dependency(
        self,
        source_artifact_id: UUID,
        source_type: str,
        target_artifact_id: UUID,
        target_type: str,
        project_id: UUID,
        reason: str = "",
    ) -> Dependency:
        """Record that one artifact depends on another"""

        dependency = Dependency(
            project_id=project_id,
            source_artifact_id=source_artifact_id,
            source_type=source_type,
            target_artifact_id=target_artifact_id,
            target_type=target_type,
            reason=reason,
        )

        self.db.add(dependency)
        self.db.commit()

        return dependency

    def get_artifact_dependencies(
        self,
        artifact_id: UUID,
        project_id: UUID,
        direction: str = "downstream",
    ) -> List[Dict[str, Any]]:
        """Get dependencies for an artifact"""

        if direction == "downstream":
            # What depends on this artifact
            deps = self.db.query(Dependency).filter(
                Dependency.project_id == project_id,
                Dependency.target_artifact_id == artifact_id,
            ).all()
        else:
            # What this artifact depends on
            deps = self.db.query(Dependency).filter(
                Dependency.project_id == project_id,
                Dependency.source_artifact_id == artifact_id,
            ).all()

        return [
            {
                "source_artifact_id": str(d.source_artifact_id),
                "source_type": d.source_type,
                "target_artifact_id": str(d.target_artifact_id),
                "target_type": d.target_type,
                "reason": d.reason,
            }
            for d in deps
        ]

    def get_impact_of_change(
        self,
        artifact_id: UUID,
        project_id: UUID,
    ) -> Dict[str, Any]:
        """Get impact analysis for changes to an artifact"""

        # Get all downstream dependencies
        affected = self._get_affected_artifacts(artifact_id, project_id, set())

        # Get risk assessment
        risk_level = self._assess_risk(affected)

        return {
            "changed_artifact_id": str(artifact_id),
            "project_id": str(project_id),
            "affected_artifacts": [str(a) for a in affected],
            "impact_count": len(affected),
            "risk_level": risk_level,
            "recommendation": self._get_recommendation(risk_level, affected),
        }

    def _get_affected_artifacts(
        self,
        artifact_id: UUID,
        project_id: UUID,
        visited: Set[UUID],
    ) -> Set[UUID]:
        """Recursively find all affected artifacts"""

        if artifact_id in visited:
            return set()

        visited.add(artifact_id)
        affected = set()

        # Get immediate downstream dependencies
        downstream = self.db.query(Dependency).filter(
            Dependency.project_id == project_id,
            Dependency.target_artifact_id == artifact_id,
        ).all()

        for dep in downstream:
            affected.add(dep.source_artifact_id)
            # Recursively find deeper dependencies
            deeper = self._get_affected_artifacts(
                dep.source_artifact_id,
                project_id,
                visited,
            )
            affected.update(deeper)

        return affected

    def _assess_risk(self, affected_artifacts: Set[UUID]) -> str:
        """Assess risk level based on number of affected artifacts"""
        count = len(affected_artifacts)
        if count == 0:
            return "low"
        elif count <= 3:
            return "medium"
        else:
            return "high"

    def _get_recommendation(
        self,
        risk_level: str,
        affected_artifacts: Set[UUID],
    ) -> str:
        """Get recommendation based on impact"""
        if risk_level == "low":
            return "Safe to proceed with changes"
        elif risk_level == "medium":
            return f"Review {len(affected_artifacts)} affected artifacts before proceeding"
        else:
            return "High impact change - extensive review and testing recommended"

    def validate_dependencies(
        self,
        project_id: UUID,
    ) -> Dict[str, Any]:
        """Check for circular dependencies and other issues"""

        dependencies = self.db.query(Dependency).filter(
            Dependency.project_id == project_id,
        ).all()

        circular = self._detect_circular_dependencies(dependencies)
        orphaned = self._find_orphaned_artifacts(project_id)

        return {
            "project_id": str(project_id),
            "total_dependencies": len(dependencies),
            "circular_dependencies": circular,
            "orphaned_artifacts": orphaned,
            "status": "valid" if len(circular) == 0 and len(orphaned) == 0 else "warning",
        }

    def _detect_circular_dependencies(
        self,
        dependencies: List[Dependency],
    ) -> List[List[str]]:
        """Detect circular dependency chains"""
        # Simplified circular detection
        # In production, use proper graph cycle detection algorithm
        return []

    def _find_orphaned_artifacts(
        self,
        project_id: UUID,
    ) -> List[str]:
        """Find artifacts with no dependencies"""

        all_artifacts = self.db.query(ArtifactVersion.artifact_id).filter(
            ArtifactVersion.project_id == project_id,
        ).distinct().all()

        involved_artifacts = set()
        deps = self.db.query(Dependency).filter(
            Dependency.project_id == project_id,
        ).all()

        for dep in deps:
            involved_artifacts.add(dep.source_artifact_id)
            involved_artifacts.add(dep.target_artifact_id)

        orphaned = [
            str(a[0]) for a in all_artifacts if a[0] not in involved_artifacts
        ]

        return orphaned
