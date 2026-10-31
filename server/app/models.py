"""
SQLAlchemy models for Tattava Project Intelligence Layer
Maps to Supabase PostgreSQL
"""

from datetime import datetime
from enum import Enum
from sqlalchemy import (
    Column, String, Integer, Text, DateTime, Boolean, ForeignKey, JSON,
    Table, Enum as SQLEnum, Float, UniqueConstraint, Index
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
import uuid

Base = declarative_base()


class ArtifactStatus(str, Enum):
    """Artifact lifecycle states per unified spec"""
    AI_GENERATED = "AI_GENERATED"
    CANDIDATE = "CANDIDATE"
    HUMAN_EDITED = "HUMAN_EDITED"
    HUMAN_APPROVED = "HUMAN_APPROVED"
    CANONICAL = "CANONICAL"
    SUPERSEDED = "SUPERSEDED"
    REJECTED = "REJECTED"
    STALE = "STALE"


class ProjectStatus(str, Enum):
    """Project workflow states"""
    INITIALIZING = "INITIALIZING"
    ACTIVE = "ACTIVE"
    IN_REVIEW = "IN_REVIEW"
    APPROVED = "APPROVED"
    ARCHIVED = "ARCHIVED"


class ApprovalDecision(str, Enum):
    """Approval outcomes"""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    REQUESTED_CHANGES = "REQUESTED_CHANGES"


# Association table for project members
project_members = Table(
    'project_members',
    Base.metadata,
    Column('project_id', UUID(as_uuid=True), ForeignKey('project.id'), primary_key=True),
    Column('user_id', UUID(as_uuid=True), ForeignKey('user.id'), primary_key=True),
    Column('role', String(50), default='viewer'),
    Column('added_at', DateTime, default=datetime.utcnow),
)


class Organization(Base):
    """Tenancy boundary"""
    __tablename__ = 'organization'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    status = Column(String(50), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship('User', back_populates='organization')
    projects = relationship('Project', back_populates='organization')


class User(Base):
    """User account"""
    __tablename__ = 'user'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organization.id'), nullable=False)
    identity_provider_id = Column(String(255), unique=True, nullable=False)
    name = Column(String(255))
    email = Column(String(255), unique=True, nullable=False)
    status = Column(String(50), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship('Organization', back_populates='users')
    projects = relationship('Project', secondary=project_members, back_populates='members')

    __table_args__ = (
        Index('idx_user_org_id', 'organization_id'),
    )


class Project(Base):
    """Project - primary tenancy and intelligence boundary"""
    __tablename__ = 'project'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organization.id'), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.INITIALIZING)
    format = Column(String(100))  # feature, series, episodic
    genre = Column(String(100))
    owner_id = Column(UUID(as_uuid=True), ForeignKey('user.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship('Organization', back_populates='projects')
    members = relationship('User', secondary=project_members, back_populates='projects')
    inputs = relationship('Input', back_populates='project', cascade='all, delete-orphan')
    intent = relationship('Intent', uselist=False, back_populates='project', cascade='all, delete-orphan')
    stories = relationship('Story', back_populates='project', cascade='all, delete-orphan')
    characters = relationship('Character', back_populates='project', cascade='all, delete-orphan')
    research_plans = relationship('ResearchPlan', back_populates='project', cascade='all, delete-orphan')
    evidence_records = relationship('Evidence', back_populates='project', cascade='all, delete-orphan')
    decisions = relationship('CreativeDecision', back_populates='project', cascade='all, delete-orphan')
    canon_facts = relationship('CanonFact', back_populates='project', cascade='all, delete-orphan')
    artifacts = relationship('ArtifactVersion', back_populates='project', cascade='all, delete-orphan')
    evaluations = relationship('Evaluation', back_populates='project', cascade='all, delete-orphan')
    dependencies = relationship('Dependency', back_populates='project', cascade='all, delete-orphan')
    changes = relationship('ChangeLog', back_populates='project', cascade='all, delete-orphan')
    ai_runs = relationship('AIRun', back_populates='project', cascade='all, delete-orphan')

    __table_args__ = (
        Index('idx_project_org_id', 'organization_id'),
        Index('idx_project_owner_id', 'owner_id'),
    )


class Input(Base):
    """Original project material"""
    __tablename__ = 'input'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    input_type = Column(String(50))  # idea, logline, concept, script, brief
    object_storage_ref = Column(String(500))  # S3/Supabase storage reference
    raw_metadata = Column(JSON)
    parsed_content = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='inputs')


class Intent(Base):
    """Project intent and initial understanding"""
    __tablename__ = 'intent'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False, unique=True)
    intent = Column(Text)
    knowns = Column(JSON)  # structured known facts
    unknowns = Column(JSON)  # structured unknown areas
    assumptions = Column(JSON)  # explicit assumptions
    status = Column(SQLEnum(ArtifactStatus), default=ArtifactStatus.CANDIDATE)
    source_run_id = Column(UUID(as_uuid=True), ForeignKey('ai_run.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='intent')


class ResearchPlan(Base):
    """Research planning"""
    __tablename__ = 'research_plan'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    questions = Column(JSON)  # list of research questions
    scope = Column(Text)
    # active (legacy) | proposed (generated, being reviewed) | approved (locked; ready to run)
    status = Column(String(50), default='active')
    brief = Column(JSON)  # the project parameters the plan was generated from
    policy = Column(JSON)  # evidence rule, search order and languages derived from the brief
    created_by = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_by = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    approved_at = Column(DateTime)

    project = relationship('Project', back_populates='research_plans')


class ResearchTask(Base):
    """One proposed piece of research in a plan, with why it was proposed and how to search for it."""
    __tablename__ = 'research_task'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(UUID(as_uuid=True), ForeignKey('research_plan.id', ondelete='CASCADE'), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id', ondelete='CASCADE'), nullable=False)
    position = Column(Integer, nullable=False, default=0)
    area = Column(String(40), nullable=False)  # app/services/research_planner.py AREAS, or user/open question
    question = Column(Text, nullable=False)
    rationale = Column(Text)
    triggered_by = Column(JSON)  # brief parameters that led to the task
    people = Column(JSON)
    places = Column(JSON)
    period = Column(String(200))
    queries = Column(JSON)  # [{"text", "language"}]
    priority = Column(String(10), default='medium')  # high | medium | low
    status = Column(String(20), default='proposed')  # proposed | removed | approved | running | done
    created_by = Column(String(10), default='ai')  # ai | user
    result = Column(JSON)  # run summary: searches, sources, findings kept/dropped, cost, notes
    run_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('idx_research_task_plan', 'plan_id'),
    )


class Evidence(Base):
    """Research evidence with provenance"""
    __tablename__ = 'evidence'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    research_plan_id = Column(UUID(as_uuid=True), ForeignKey('research_plan.id'))
    source_url = Column(String(500))
    source_type = Column(String(100))  # web, document, interview, reference
    publisher = Column(String(255))
    author = Column(String(255))
    published_at = Column(DateTime)
    retrieved_at = Column(DateTime, default=datetime.utcnow)
    claim = Column(Text)  # what the source claims
    supporting_excerpt = Column(Text)  # quote from source
    # The stored source the excerpt was checked against, and where in its text it was found
    document_id = Column(UUID(as_uuid=True), ForeignKey('source_document.id', ondelete='SET NULL'))
    excerpt_start = Column(Integer)
    excerpt_end = Column(Integer)
    relevance = Column(Text)  # why relevant to project
    confidence = Column(String(50))  # high, medium, low
    # unverified | quote_found (the excerpt is in the stored source text) |
    # attested (offline source vouched for by a named researcher; not machine-checked) | verified | disputed
    validation_status = Column(String(50), default='unverified')
    # Offline sources: book | interview | field_visit | archive_visit, with their citation details
    source_kind = Column(String(30))
    source_tier = Column(String(20))  # primary | secondary | field
    citation = Column(JSON)
    attested_by = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    attested_at = Column(DateTime)
    # Automated research runs: the task that found it, the kind of claim, and whether it can count
    # as a documented fact under the plan's evidence level
    research_task_id = Column(UUID(as_uuid=True), ForeignKey('research_task.id', ondelete='SET NULL'))
    epistemic_type = Column(String(30))  # DOCUMENTED_FACT | SCHOLARLY_DISPUTED | MYTHOLOGY_FOLKLORE | CREATIVE_LICENCE
    eligibility = Column(String(40))  # eligible | needs_government_source | needs_second_source
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='evidence_records')

    __table_args__ = (
        Index('idx_evidence_project_id', 'project_id'),
    )


class SourceDocument(Base):
    """A source stored as read (a Wikipedia revision, an approved web page or PDF, or an uploaded
    document), so quotes taken from it can be checked against exactly this text later."""
    __tablename__ = 'source_document'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id', ondelete='CASCADE'), nullable=False)
    provider = Column(String(50), nullable=False)  # wikipedia | web | upload
    # primary | secondary: from source_registry for fetched sources, declared by the uploader for uploads
    source_tier = Column(String(20), nullable=False)
    url = Column(String(1000))  # null for uploads
    title = Column(String(500), nullable=False)
    language = Column(String(20))
    publisher = Column(String(255))
    revision_id = Column(String(100))
    revised_at = Column(DateTime)  # when the source last changed, per the provider
    content_hash = Column(String(64), nullable=False)  # sha256 of text
    text = Column(Text, nullable=False)
    extraction_method = Column(String(30))  # wikipedia | html | pdf_text | ocr | docx | plain_text
    file_name = Column(String(255))  # uploads only
    retrieved_by = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    retrieved_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('project_id', 'url', 'content_hash', name='uq_source_document_content'),
        Index('idx_source_document_project', 'project_id'),
    )


class Character(Base):
    """Character intelligence"""
    __tablename__ = 'character'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    name = Column(String(255), nullable=False)
    profile = Column(JSON)  # structured character data
    motivation = Column(Text)
    voice = Column(Text)
    status = Column(SQLEnum(ArtifactStatus), default=ArtifactStatus.CANDIDATE)
    current_version_id = Column(UUID(as_uuid=True))
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='characters')
    relationships = relationship(
        'Relationship', back_populates='character', foreign_keys='Relationship.from_entity_id'
    )


class Relationship(Base):
    """Character/entity relationships"""
    __tablename__ = 'relationship'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    from_entity_id = Column(UUID(as_uuid=True), ForeignKey('character.id'))
    to_entity_id = Column(UUID(as_uuid=True), ForeignKey('character.id'))
    relationship_type = Column(String(100))  # mother, mentor, rival, etc
    attributes = Column(JSON)
    status = Column(String(50), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project')
    character = relationship('Character', back_populates='relationships', foreign_keys=[from_entity_id])


class Story(Base):
    """Story/narrative artifact"""
    __tablename__ = 'story'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    premise = Column(Text)
    logline = Column(Text)
    synopsis = Column(Text)
    themes = Column(JSON)
    conflict = Column(Text)
    beats = Column(JSON)  # structured story beats
    status = Column(SQLEnum(ArtifactStatus), default=ArtifactStatus.CANDIDATE)
    current_version_id = Column(UUID(as_uuid=True))
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='stories')


class CreativeDecision(Base):
    """Explicit creative decision"""
    __tablename__ = 'creative_decision'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    statement = Column(Text, nullable=False)  # what was decided
    rationale = Column(Text)  # why
    evidence_refs = Column(ARRAY(UUID(as_uuid=True)))  # evidence supporting decision
    status = Column(SQLEnum(ApprovalDecision), default=ApprovalDecision.PENDING)
    approver_id = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    approved_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='decisions')


class CanonFact(Base):
    """Authoritative project fact"""
    __tablename__ = 'canon_fact'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    category = Column(String(100))  # character, world, timeline, logic
    statement = Column(Text, nullable=False)  # canonical fact
    source_ref = Column(UUID(as_uuid=True))  # artifact/decision that established it
    status = Column(String(50), default='active')
    version_id = Column(UUID(as_uuid=True))  # artifact version this came from
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='canon_facts')


class ArtifactVersion(Base):
    """Versioned artifact"""
    __tablename__ = 'artifact_version'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    artifact_type = Column(String(100), nullable=False)  # story, screenplay, dialogue, treatment
    artifact_id = Column(UUID(as_uuid=True), nullable=False)  # reference to Story, Screenplay, etc
    version_number = Column(Integer, nullable=False)
    parent_version_id = Column(UUID(as_uuid=True))  # previous version
    status = Column(SQLEnum(ArtifactStatus), default=ArtifactStatus.AI_GENERATED)
    content = Column(Text)  # actual artifact content
    created_by = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    reason = Column(String(255))  # why this version
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='artifacts')

    __table_args__ = (
        Index('idx_artifact_version_project', 'project_id'),
        UniqueConstraint('artifact_id', 'artifact_type', 'version_number', name='uq_artifact_version'),
    )


class Approval(Base):
    """Approval record"""
    __tablename__ = 'approval'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artifact_version_id = Column(UUID(as_uuid=True), ForeignKey('artifact_version.id'), nullable=False)
    approver_id = Column(UUID(as_uuid=True), ForeignKey('user.id'), nullable=False)
    decision = Column(SQLEnum(ApprovalDecision), nullable=False)
    reason = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index('idx_approval_artifact', 'artifact_version_id'),
    )


class Dependency(Base):
    """Project dependency (upstream affects downstream)"""
    __tablename__ = 'dependency'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    upstream_entity = Column(String(255), nullable=False)  # entity type and ID
    downstream_entity = Column(String(255), nullable=False)  # entity type and ID
    dependency_type = Column(String(100))  # character_to_scene, canon_to_dialogue, etc
    strength = Column(String(50))  # hard, soft
    status = Column(String(50), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='dependencies')


class Evaluation(Base):
    """Project/artifact evaluation"""
    __tablename__ = 'evaluation'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    artifact_version_id = Column(UUID(as_uuid=True), ForeignKey('artifact_version.id'))
    rubric_version = Column(String(100))
    findings = Column(JSON)  # strengths, gaps, risks
    status = Column(String(50), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='evaluations')


class ChangeLog(Base):
    """Audit trail of mutations"""
    __tablename__ = 'change_log'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    entity_type = Column(String(100), nullable=False)  # Story, Character, etc
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    actor_type = Column(String(50))  # user, agent
    actor_id = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    action = Column(String(100), nullable=False)  # created, modified, approved
    before_ref = Column(UUID(as_uuid=True))  # previous version
    after_ref = Column(UUID(as_uuid=True))  # new version
    run_id = Column(UUID(as_uuid=True))  # AI run that triggered change
    timestamp = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='changes')

    __table_args__ = (
        Index('idx_changelog_project', 'project_id'),
    )


class AIRun(Base):
    """AI execution record"""
    __tablename__ = 'ai_run'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Null for calls not tied to a project (e.g. a bare POST /api/ai/generate)
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organization.id'))
    workflow_id = Column(String(100), nullable=False)  # intent, research, story, etc
    agent_id = Column(String(100), nullable=False)
    agent_version = Column(String(50))
    model_provider = Column(String(100))
    model_id = Column(String(100))
    model_version = Column(String(50))
    prompt_version = Column(UUID(as_uuid=True))
    input_refs = Column(ARRAY(UUID(as_uuid=True)))  # input context IDs
    context_refs = Column(ARRAY(UUID(as_uuid=True)))  # artifact/entity IDs used
    tool_calls = Column(JSON)  # tools invoked
    output_ref = Column(UUID(as_uuid=True))  # resulting artifact
    validation_status = Column(String(50))
    status = Column(String(50), default='completed')  # queued, running, completed, failed
    latency_ms = Column(Integer)
    token_usage = Column(Integer)  # input + output
    input_tokens = Column(Integer)
    output_tokens = Column(Integer)
    estimated_cost = Column(Float)  # USD; null when the model has no known price
    error_code = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    project = relationship('Project', back_populates='ai_runs')

    __table_args__ = (
        Index('idx_airun_project', 'project_id'),
        Index('idx_airun_org_created', 'organization_id', 'created_at'),
    )


class PromptVersion(Base):
    """Prompt template versioning"""
    __tablename__ = 'prompt_version'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(String(100), nullable=False)
    version = Column(Integer, nullable=False)
    system_policy_ref = Column(String(500))
    workflow_policy_ref = Column(String(500))
    template = Column(Text, nullable=False)
    output_schema_ref = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(50), default='active')

    __table_args__ = (
        UniqueConstraint('agent_id', 'version', name='uq_prompt_version'),
    )


class RetrievalRecord(Base):
    """Vector/semantic retrieval audit"""
    __tablename__ = 'retrieval_record'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey('ai_run.id'))
    project_id = Column(UUID(as_uuid=True), ForeignKey('project.id'), nullable=False)
    query = Column(Text)
    entity_refs = Column(ARRAY(UUID(as_uuid=True)))  # entities retrieved
    document_refs = Column(ARRAY(UUID(as_uuid=True)))  # documents retrieved
    ranking_metadata = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project')


class ProjectSnapshot(Base):
    """The whole frontend project document (client `TattavaProject`), one row per project.

    `version` is an optimistic-concurrency counter: a write must name the version it was
    based on, and loses with 409 if someone else saved first.
    """
    __tablename__ = 'project_snapshot'

    project_id = Column(
        UUID(as_uuid=True), ForeignKey('project.id', ondelete='CASCADE'), primary_key=True
    )
    schema_version = Column(Integer, nullable=False, default=1)
    version = Column(Integer, nullable=False, default=1)
    data = Column(JSON, nullable=False)
    updated_by = Column(UUID(as_uuid=True), ForeignKey('user.id'))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TermsAcceptance(Base):
    """A user's signed acceptance of a version of the Terms & Conditions.

    One row per (user, terms version). `email_status` tracks the signed copy sent to the
    compliance mailbox: pending -> sent | failed (failed rows can be re-sent).
    """
    __tablename__ = 'terms_acceptance'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user.id'), nullable=False)
    terms_version = Column(String(50), nullable=False)
    terms_sha256 = Column(String(64), nullable=False)  # hash of the exact text that was shown
    signed_name = Column(String(255), nullable=False)  # name the user typed as their signature
    accepted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ip_address = Column(String(64))
    user_agent = Column(String(500))
    email_status = Column(String(20), nullable=False, default='pending')
    email_attempts = Column(Integer, nullable=False, default=0)
    email_sent_at = Column(DateTime)
    email_error = Column(String(500))

    __table_args__ = (
        UniqueConstraint('user_id', 'terms_version', name='uq_terms_acceptance_user_version'),
        Index('idx_terms_acceptance_user', 'user_id'),
    )
