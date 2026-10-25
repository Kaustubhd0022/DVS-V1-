"""
Agent Orchestration Framework
Uses langchain + langgraph for agent workflow management
"""

from typing import Dict, Any, Optional, List
from uuid import UUID, uuid4
from datetime import datetime
from enum import Enum
from sqlalchemy.orm import Session
import json

from app.models import AIRun, ArtifactVersion, ArtifactStatus
from app.services.context_resolver import ContextResolver


class WorkflowType(str, Enum):
    """Supported workflows"""
    INTENT = "intent"
    RESEARCH = "research"
    STORY = "story"
    CHARACTER = "character"
    WRITING = "writing"
    SCREENPLAY = "screenplay"
    DIALOGUE = "dialogue"
    CONTINUITY = "continuity"
    EVALUATION = "evaluation"


class AgentOutput:
    """Parse agent output"""
    def parse(self, text: str) -> Dict[str, Any]:
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {"content": text, "status": "unparsed"}


class AgentContract:
    """Agent capability contract"""

    def __init__(
        self,
        agent_id: str,
        purpose: str,
        workflow_type: WorkflowType,
        required_context: List[str],
        output_schema: Dict[str, Any],
        approval_required: bool = False,
    ):
        self.agent_id = agent_id
        self.purpose = purpose
        self.workflow_type = workflow_type
        self.required_context = required_context
        self.output_schema = output_schema
        self.approval_required = approval_required


class AgentOrchestrator:
    """Orchestrate AI agents and workflows"""

    # Agent registry
    AGENTS = {
        WorkflowType.INTENT: AgentContract(
            agent_id="intent_agent",
            purpose="Interpret user goal and missing context",
            workflow_type=WorkflowType.INTENT,
            required_context=["project", "user_request"],
            output_schema={
                "intent": str,
                "knowns": dict,
                "unknowns": dict,
                "assumptions": list,
            },
            approval_required=False,
        ),
        WorkflowType.RESEARCH: AgentContract(
            agent_id="research_agent",
            purpose="Find reliable evidence for project questions",
            workflow_type=WorkflowType.RESEARCH,
            required_context=["project", "research_questions"],
            output_schema={
                "findings": list,
                "sources": list,
                "confidence": str,
            },
            approval_required=False,
        ),
        WorkflowType.STORY: AgentContract(
            agent_id="story_agent",
            purpose="Develop story alternatives and narrative",
            workflow_type=WorkflowType.STORY,
            required_context=["project", "intent", "characters", "research"],
            output_schema={
                "premise": str,
                "logline": str,
                "themes": list,
                "conflict": str,
                "beats": list,
            },
            approval_required=True,  # Hard gate before downstream
        ),
        WorkflowType.CHARACTER: AgentContract(
            agent_id="character_agent",
            purpose="Build and maintain character intelligence",
            workflow_type=WorkflowType.CHARACTER,
            required_context=["project", "character_data", "story"],
            output_schema={
                "name": str,
                "motivation": str,
                "voice": str,
                "relationships": list,
            },
            approval_required=False,
        ),
        WorkflowType.WRITING: AgentContract(
            agent_id="writing_agent",
            purpose="Generate context-aware writing",
            workflow_type=WorkflowType.WRITING,
            required_context=["story", "characters", "canon", "research"],
            output_schema={
                "content": str,
                "grounding": list,
            },
            approval_required=False,
        ),
        WorkflowType.CONTINUITY: AgentContract(
            agent_id="continuity_agent",
            purpose="Detect contradictions against canon",
            workflow_type=WorkflowType.CONTINUITY,
            required_context=["canon_facts", "artifact_content"],
            output_schema={
                "conflicts": list,
                "confidence": str,
            },
            approval_required=False,
        ),
    }

    def __init__(
        self,
        db: Session,
        settings,
        context_resolver: Optional[ContextResolver] = None,
    ):
        self.db = db
        self.settings = settings
        self.context_resolver = context_resolver or ContextResolver(db)
        self.parser = AgentOutput()

    async def run_agent(
        self,
        project_id: UUID,
        workflow_type: WorkflowType,
        user_input: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Execute an agent workflow

        Args:
            project_id: Project context
            workflow_type: Which agent to run
            user_input: User instruction/request
            context: Optional pre-built context

        Returns:
            Agent output with metadata
        """
        if workflow_type not in self.AGENTS:
            raise ValueError(f"Unknown workflow type: {workflow_type}")

        contract = self.AGENTS[workflow_type]

        # Create AI run record
        run_id = uuid4()
        ai_run = AIRun(
            id=run_id,
            project_id=project_id,
            workflow_id=contract.workflow_type.value,
            agent_id=contract.agent_id,
            status="running",
        )
        self.db.add(ai_run)
        self.db.commit()

        try:
            # Resolve context
            if context is None:
                context = self.context_resolver.resolve_project_context(
                    project_id,
                    limit=5,
                )

            # Mock output for now - LLM integration to follow
            start_time = datetime.utcnow()

            # Generate mock output based on workflow type
            output = self._generate_mock_output(contract, user_input)

            latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

            # Update run record
            ai_run.status = "completed"
            ai_run.latency_ms = latency_ms
            ai_run.completed_at = datetime.utcnow()
            self.db.commit()

            return {
                "run_id": str(run_id),
                "status": "success",
                "output": output,
                "latency_ms": latency_ms,
                "approval_required": contract.approval_required,
            }

        except Exception as e:
            ai_run.status = "failed"
            ai_run.error_code = str(type(e).__name__)
            self.db.commit()

            return {
                "run_id": str(run_id),
                "status": "failed",
                "error": str(e),
                "approval_required": False,
            }

    def _generate_mock_output(
        self,
        contract: AgentContract,
        user_input: str,
    ) -> Dict[str, Any]:
        """Generate mock output for agent workflow (LLM integration to follow)"""

        if contract.workflow_type == WorkflowType.INTENT:
            return {
                "intent": user_input,
                "knowns": {"provided": True},
                "unknowns": {"to_explore": []},
                "assumptions": ["To be validated"],
            }
        elif contract.workflow_type == WorkflowType.STORY:
            return {
                "premise": "Story based on user input",
                "logline": user_input[:100],
                "themes": ["Theme 1"],
                "conflict": "To be developed",
                "beats": ["Setup", "Conflict", "Resolution"],
            }
        elif contract.workflow_type == WorkflowType.CHARACTER:
            return {
                "name": "Character Name",
                "motivation": "To be determined",
                "voice": "Unique voice",
                "relationships": [],
            }
        elif contract.workflow_type == WorkflowType.WRITING:
            return {
                "content": f"Generated content based on: {user_input[:50]}...",
                "grounding": ["Source 1", "Source 2"],
            }
        elif contract.workflow_type == WorkflowType.RESEARCH:
            return {
                "findings": ["Finding 1", "Finding 2"],
                "sources": ["Source A", "Source B"],
                "confidence": "medium",
            }
        else:
            return {
                "status": "pending",
                "message": f"Workflow {contract.workflow_type} executed",
            }

    def _parse_output(self, text: str) -> Dict[str, Any]:
        """Parse agent output"""
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Try to extract JSON from text
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
            return {"content": text, "status": "unparsed"}

    async def create_artifact_version(
        self,
        project_id: UUID,
        artifact_type: str,
        artifact_id: UUID,
        content: str,
        agent_run_id: UUID,
        created_by: UUID,
        reason: str = "AI generated",
    ) -> ArtifactVersion:
        """Create candidate artifact version from agent output"""

        # Get next version number
        latest = self.db.query(ArtifactVersion).filter(
            ArtifactVersion.artifact_id == artifact_id,
            ArtifactVersion.artifact_type == artifact_type,
        ).order_by(ArtifactVersion.version_number.desc()).first()

        next_version = (latest.version_number + 1) if latest else 1
        parent_version_id = latest.id if latest else None

        version = ArtifactVersion(
            project_id=project_id,
            artifact_type=artifact_type,
            artifact_id=artifact_id,
            version_number=next_version,
            parent_version_id=parent_version_id,
            status=ArtifactStatus.AI_GENERATED,
            content=content,
            created_by=created_by,
            reason=reason,
        )
        self.db.add(version)
        self.db.commit()
        self.db.refresh(version)

        return version
