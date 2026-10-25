"""
Tests for service layer - ContextResolver and AgentOrchestrator
"""

import pytest
from uuid import uuid4
from sqlalchemy.orm import Session

from app.models import Project, Intent, Story, Character, CanonFact, ProjectStatus
from app.services import ContextResolver, AgentOrchestrator, WorkflowType
from app.config import settings


@pytest.fixture
def project_with_content(test_db: Session):
    """Create project with intent, story, character, and canon"""
    from app.models import Organization, User

    # Create org and user
    org = Organization(name="Test Org")
    test_db.add(org)
    test_db.flush()

    user = User(
        organization_id=org.id,
        name="Test User",
        email="test@example.com",
        identity_provider_id="test-idp-user-1",
    )
    test_db.add(user)
    test_db.flush()

    # Create project
    project = Project(
        organization_id=org.id,
        title="Test Project",
        format="Feature Film",
        genre="Drama",
        owner_id=user.id,
        status=ProjectStatus.ACTIVE,
    )
    test_db.add(project)
    test_db.flush()

    # Create intent
    intent = Intent(
        project_id=project.id,
        intent="Test intent statement",
        knowns={"setting": "NYC"},
        unknowns={"theme": None},
        assumptions=["Contemporary setting"],
    )
    test_db.add(intent)
    test_db.flush()

    # Create character
    character = Character(
        project_id=project.id,
        name="John Doe",
        profile={"role": "Protagonist", "background": "Former detective", "arc": "Transformation"},
        motivation="Redemption",
        voice="Thoughtful",
    )
    test_db.add(character)
    test_db.flush()

    # Create story
    story = Story(
        project_id=project.id,
        premise="A detective seeks redemption",
        logline="A former detective must solve one last case",
        themes=["Redemption", "Justice"],
        conflict="Moral dilemma",
        synopsis="Redemption through one last case",
    )
    test_db.add(story)
    test_db.flush()

    # Create canon fact
    canon = CanonFact(
        project_id=project.id,
        category="character",
        statement="John left the force in 2015",
    )
    test_db.add(canon)

    test_db.commit()

    return project


def test_context_resolver_project_context(test_db: Session, project_with_content):
    """Test resolving complete project context"""
    resolver = ContextResolver(test_db)

    context = resolver.resolve_project_context(
        project_with_content.id,
        entity_types=["intent", "character", "story", "canon"],
        limit=10,
    )

    assert context["intent"]["statement"] == "Test intent statement"
    assert len(context["characters"]) > 0
    assert len(context["stories"]) > 0
    assert len(context["canon_facts"]) > 0


def test_context_resolver_story_context(test_db: Session, project_with_content):
    """Test resolving story-specific context"""
    story = test_db.query(Story).filter_by(project_id=project_with_content.id).first()

    resolver = ContextResolver(test_db)
    context = resolver.resolve_story_context(story.id, project_with_content.id)

    assert context["story_id"] == str(story.id)
    assert "characters" in context
    assert "canon" in context


def test_context_resolver_character_context(test_db: Session, project_with_content):
    """Test resolving character-specific context"""
    character = test_db.query(Character).filter_by(
        project_id=project_with_content.id
    ).first()

    resolver = ContextResolver(test_db)
    context = resolver.resolve_character_context(character.id, project_with_content.id)

    assert context["character_id"] == str(character.id)
    assert context["name"] == "John Doe"
    assert "story_context" in context


def test_agent_orchestrator_contracts():
    """Test agent contract registry"""
    assert WorkflowType.INTENT in AgentOrchestrator.AGENTS
    assert WorkflowType.STORY in AgentOrchestrator.AGENTS
    assert WorkflowType.CHARACTER in AgentOrchestrator.AGENTS
    assert WorkflowType.WRITING in AgentOrchestrator.AGENTS

    # Check story agent requires approval
    story_contract = AgentOrchestrator.AGENTS[WorkflowType.STORY]
    assert story_contract.approval_required is True

    # Check writing agent doesn't require approval
    writing_contract = AgentOrchestrator.AGENTS[WorkflowType.WRITING]
    assert writing_contract.approval_required is False


def test_agent_orchestrator_initialization(test_db: Session):
    """Test orchestrator initialization"""
    orchestrator = AgentOrchestrator(test_db, settings)

    assert orchestrator.db is test_db
    assert orchestrator.context_resolver is not None
    assert orchestrator.parser is not None
