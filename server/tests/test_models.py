"""
Unit tests for SQLAlchemy models
"""

import pytest
from uuid import uuid4
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import (
    Organization, User, Project, Input, Intent, Story, Character,
    Evidence, CreativeDecision, CanonFact, ArtifactVersion,
    ProjectStatus, ArtifactStatus, ApprovalDecision
)


@pytest.mark.unit
def test_organization_creation(test_db: Session):
    """Test creating an organization"""
    org = Organization(
        name="TestStudio",
        status="active"
    )
    test_db.add(org)
    test_db.commit()
    test_db.refresh(org)

    assert org.id is not None
    assert org.name == "TestStudio"
    assert org.status == "active"


@pytest.mark.unit
def test_user_creation(test_db: Session):
    """Test creating a user"""
    org = Organization(name="TestStudio")
    test_db.add(org)
    test_db.commit()

    user = User(
        organization_id=org.id,
        identity_provider_id="test_provider_1",
        name="Test User",
        email="test@example.com",
        status="active"
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)

    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.organization_id == org.id


@pytest.mark.unit
def test_project_creation(test_db: Session):
    """Test creating a project"""
    org = Organization(name="TestStudio")
    test_db.add(org)
    test_db.commit()

    user = User(
        organization_id=org.id,
        identity_provider_id="test_provider_1",
        name="Test User",
        email="test@example.com"
    )
    test_db.add(user)
    test_db.commit()

    project = Project(
        organization_id=org.id,
        title="The Last Monsoon",
        format="feature",
        genre="drama",
        owner_id=user.id,
        status=ProjectStatus.INITIALIZING
    )
    test_db.add(project)
    test_db.commit()
    test_db.refresh(project)

    assert project.id is not None
    assert project.title == "The Last Monsoon"
    assert project.status == ProjectStatus.INITIALIZING


@pytest.mark.unit
def test_intent_creation(test_db: Session):
    """Test creating project intent"""
    org = Organization(name="TestStudio")
    test_db.add(org)
    test_db.commit()

    user = User(
        organization_id=org.id,
        identity_provider_id="test_provider_1",
        name="Test User",
        email="test@example.com"
    )
    test_db.add(user)
    test_db.commit()

    project = Project(
        organization_id=org.id,
        title="Test Project",
        owner_id=user.id
    )
    test_db.add(project)
    test_db.commit()

    intent = Intent(
        project_id=project.id,
        intent="A story about..."
,        knowns={"genre": "drama"},
        unknowns={"ending": "undecided"},
        assumptions=["contemporary setting"],
        status=ArtifactStatus.CANDIDATE
    )
    test_db.add(intent)
    test_db.commit()
    test_db.refresh(intent)

    assert intent.id is not None
    assert intent.intent == "A story about..."
    assert intent.status == ArtifactStatus.CANDIDATE


@pytest.mark.unit
def test_character_creation(test_db: Session):
    """Test creating a character"""
    org = Organization(name="TestStudio")
    test_db.add(org)
    test_db.commit()

    user = User(
        organization_id=org.id,
        identity_provider_id="test_provider_1",
        name="Test User",
        email="test@example.com"
    )
    test_db.add(user)
    test_db.commit()

    project = Project(
        organization_id=org.id,
        title="Test Project",
        owner_id=user.id
    )
    test_db.add(project)
    test_db.commit()

    character = Character(
        project_id=project.id,
        name="Anaya",
        profile={"age": 32, "occupation": "lawyer"},
        motivation="Seek justice",
        voice="Direct, determined",
        status=ArtifactStatus.CANDIDATE
    )
    test_db.add(character)
    test_db.commit()
    test_db.refresh(character)

    assert character.id is not None
    assert character.name == "Anaya"
    assert character.profile["age"] == 32


@pytest.mark.unit
def test_evidence_creation(test_db: Session):
    """Test creating research evidence"""
    org = Organization(name="TestStudio")
    test_db.add(org)
    test_db.commit()

    user = User(
        organization_id=org.id,
        identity_provider_id="test_provider_1",
        name="Test User",
        email="test@example.com"
    )
    test_db.add(user)
    test_db.commit()

    project = Project(
        organization_id=org.id,
        title="Test Project",
        owner_id=user.id
    )
    test_db.add(project)
    test_db.commit()

    evidence = Evidence(
        project_id=project.id,
        source_url="https://example.com/source",
        source_type="web",
        claim="Important historical fact",
        supporting_excerpt="The quote supporting the claim",
        relevance="Directly relevant to story world",
        confidence="high",
        validation_status="verified"
    )
    test_db.add(evidence)
    test_db.commit()
    test_db.refresh(evidence)

    assert evidence.id is not None
    assert evidence.claim == "Important historical fact"
    assert evidence.validation_status == "verified"


@pytest.mark.unit
def test_story_creation(test_db: Session):
    """Test creating a story"""
    org = Organization(name="TestStudio")
    test_db.add(org)
    test_db.commit()

    user = User(
        organization_id=org.id,
        identity_provider_id="test_provider_1",
        name="Test User",
        email="test@example.com"
    )
    test_db.add(user)
    test_db.commit()

    project = Project(
        organization_id=org.id,
        title="Test Project",
        owner_id=user.id
    )
    test_db.add(project)
    test_db.commit()

    story = Story(
        project_id=project.id,
        premise="A young lawyer fights for justice",
        logline="When injustice strikes, one lawyer stands alone",
        themes=["justice", "integrity", "courage"],
        conflict="Internal struggle with morality",
        status=ArtifactStatus.CANDIDATE
    )
    test_db.add(story)
    test_db.commit()
    test_db.refresh(story)

    assert story.id is not None
    assert story.premise == "A young lawyer fights for justice"
    assert len(story.themes) == 3


@pytest.mark.unit
def test_artifact_version_creation(test_db: Session):
    """Test creating artifact version"""
    org = Organization(name="TestStudio")
    test_db.add(org)
    test_db.commit()

    user = User(
        organization_id=org.id,
        identity_provider_id="test_provider_1",
        name="Test User",
        email="test@example.com"
    )
    test_db.add(user)
    test_db.commit()

    project = Project(
        organization_id=org.id,
        title="Test Project",
        owner_id=user.id
    )
    test_db.add(project)
    test_db.commit()

    artifact_id = uuid4()
    artifact_v1 = ArtifactVersion(
        project_id=project.id,
        artifact_type="screenplay",
        artifact_id=artifact_id,
        version_number=1,
        status=ArtifactStatus.AI_GENERATED,
        content="INT. COURTROOM - DAY\n\nAnaya stands...",
        created_by=user.id,
        reason="Initial generation"
    )
    test_db.add(artifact_v1)
    test_db.commit()
    test_db.refresh(artifact_v1)

    assert artifact_v1.id is not None
    assert artifact_v1.version_number == 1
    assert artifact_v1.status == ArtifactStatus.AI_GENERATED

    # Create v2
    artifact_v2 = ArtifactVersion(
        project_id=project.id,
        artifact_type="screenplay",
        artifact_id=artifact_id,
        version_number=2,
        parent_version_id=artifact_v1.id,
        status=ArtifactStatus.HUMAN_EDITED,
        content="INT. COURTROOM - DAY\n\nAnaya stands, resolute...",
        created_by=user.id,
        reason="User edits"
    )
    test_db.add(artifact_v2)
    test_db.commit()
    test_db.refresh(artifact_v2)

    assert artifact_v2.version_number == 2
    assert artifact_v2.parent_version_id == artifact_v1.id
