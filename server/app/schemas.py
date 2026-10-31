"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Annotated, Optional, List, Dict, Any, Literal, Union
from datetime import datetime
from uuid import UUID
from app.models import (
    ProjectStatus, ArtifactStatus, ApprovalDecision
)
from app.services.retrieval import LANGUAGE_PATTERN


# ============ User & Organization ============

class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    identity_provider_id: str


class UserRead(UserBase):
    id: UUID
    organization_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrganizationBase(BaseModel):
    name: str


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationRead(OrganizationBase):
    id: UUID
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Project ============

class ProjectBase(BaseModel):
    title: str
    format: Optional[str] = None
    genre: Optional[str] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    format: Optional[str] = None
    genre: Optional[str] = None
    status: Optional[ProjectStatus] = None


class ProjectRead(ProjectBase):
    id: UUID
    organization_id: UUID
    status: ProjectStatus
    owner_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Input ============

class InputCreate(BaseModel):
    input_type: str
    parsed_content: str
    object_storage_ref: Optional[str] = None
    raw_metadata: Optional[Dict[str, Any]] = None


class InputRead(BaseModel):
    id: UUID
    project_id: UUID
    input_type: str
    parsed_content: str
    object_storage_ref: Optional[str]
    created_by: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Intent ============

class IntentCreate(BaseModel):
    intent: str
    knowns: Optional[Dict[str, Any]] = None
    unknowns: Optional[Dict[str, Any]] = None
    assumptions: Optional[List[str]] = None


class IntentUpdate(BaseModel):
    intent: Optional[str] = None
    knowns: Optional[Dict[str, Any]] = None
    unknowns: Optional[Dict[str, Any]] = None
    assumptions: Optional[List[str]] = None
    status: Optional[ArtifactStatus] = None


class IntentRead(BaseModel):
    id: UUID
    project_id: UUID
    intent: str
    knowns: Optional[Dict[str, Any]]
    unknowns: Optional[Dict[str, Any]]
    assumptions: Optional[List[str]]
    status: ArtifactStatus
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Research ============

class ResearchPlanCreate(BaseModel):
    questions: List[str]
    scope: Optional[str] = None


class ResearchPlanRead(BaseModel):
    id: UUID
    project_id: UUID
    questions: List[str]
    scope: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ResearchPlanUpdate(BaseModel):
    questions: Optional[List[str]] = None
    scope: Optional[str] = None
    status: Optional[str] = None


class EvidenceCreate(BaseModel):
    research_plan_id: Optional[UUID] = None
    # A stored source document; supporting_excerpt must then be found in its text
    document_id: Optional[UUID] = None
    source_url: Optional[str] = None
    source_type: str
    publisher: Optional[str] = None
    author: Optional[str] = None
    claim: str
    supporting_excerpt: Optional[str] = None
    relevance: Optional[str] = None
    confidence: str = "medium"


class EvidenceRead(BaseModel):
    id: UUID
    project_id: UUID
    source_url: Optional[str]
    source_type: str
    publisher: Optional[str]
    author: Optional[str]
    claim: str
    supporting_excerpt: Optional[str]
    relevance: Optional[str]
    confidence: str
    validation_status: str
    document_id: Optional[UUID] = None
    excerpt_start: Optional[int] = None
    excerpt_end: Optional[int] = None
    source_kind: Optional[str] = None
    source_tier: Optional[str] = None
    citation: Optional[Dict[str, Any]] = None
    attested_by: Optional[UUID] = None
    attested_at: Optional[datetime] = None
    research_task_id: Optional[UUID] = None
    epistemic_type: Optional[str] = None
    eligibility: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class EvidenceUpdate(BaseModel):
    source_url: Optional[str] = None
    source_type: Optional[str] = None
    publisher: Optional[str] = None
    author: Optional[str] = None
    claim: Optional[str] = None
    supporting_excerpt: Optional[str] = None
    relevance: Optional[str] = None
    confidence: Optional[str] = None
    # validation_status is not client-settable: it follows from the source check.


# ============ Research plans generated from the project brief ============

_Short = Field(default=None, max_length=1000)


class BriefFormat(BaseModel):
    media: Optional[str] = Field(default=None, max_length=100)
    episode_count: Optional[int] = Field(default=None, ge=1, le=500)
    audience: Optional[str] = Field(default=None, max_length=300)


class BriefPlace(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    address: Optional[str] = Field(default=None, max_length=300)


class BriefSetting(BaseModel):
    description: Optional[str] = _Short
    era: Optional[str] = Field(default=None, max_length=200)
    time_range: Optional[str] = Field(default=None, max_length=200)
    places: List[BriefPlace] = Field(default_factory=list, max_length=40)


class BriefPerson(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    role: Optional[str] = Field(default=None, max_length=200)
    historical: bool = False


_Items = Field(default_factory=list, max_length=50)


class ResearchBrief(BaseModel):
    """The project parameters research is planned from (assembled by the client from the project)."""
    title: str = Field(min_length=1, max_length=300)
    premise: Optional[str] = Field(default=None, max_length=4000)
    subject: Optional[str] = _Short
    genre: Optional[str] = Field(default=None, max_length=200)
    themes: List[str] = Field(default_factory=list, max_length=20)
    tone: Optional[str] = Field(default=None, max_length=200)
    format: BriefFormat = Field(default_factory=BriefFormat)
    setting: BriefSetting = Field(default_factory=BriefSetting)
    people: List[BriefPerson] = Field(default_factory=list, max_length=40)
    language: Optional[str] = Field(default=None, max_length=200)
    narrative_freedom: Literal["FACTUAL", "GROUNDED_HYBRID", "CREATIVE"] = "GROUNDED_HYBRID"
    evidence_requirement: Literal["STANDARD", "HIGH", "STRICT"] = "HIGH"
    known_facts: List[str] = _Items
    open_questions: List[str] = Field(default_factory=list, max_length=30)
    suggested_areas: List[str] = Field(default_factory=list, max_length=30)
    user_questions: List[str] = Field(default_factory=list, max_length=30)
    uploaded_material: Optional[str] = Field(default=None, max_length=6000)


CoverageArea = Literal[
    "history_chronology", "people", "places_architecture", "art_craft_material",
    "ritual_festival_folklore", "language_dialect", "daily_life", "present_day_tourism",
    "disputed_accounts", "sensitivities",
]


class ResearchPlanGenerate(BaseModel):
    brief: ResearchBrief
    coverage_areas: Optional[List[CoverageArea]] = None  # default: all


class TaskQuery(BaseModel):
    text: str = Field(min_length=2, max_length=300)
    language: str = Field(default="en", pattern=LANGUAGE_PATTERN)


class ResearchTaskRead(BaseModel):
    id: UUID
    plan_id: UUID
    position: int
    area: str
    question: str
    rationale: Optional[str]
    triggered_by: List[str]
    people: List[str]
    places: List[str]
    period: Optional[str]
    queries: List[TaskQuery]
    priority: str
    status: str
    created_by: str
    result: Optional[Dict[str, Any]] = None
    run_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResearchTaskCreate(BaseModel):
    area: Union[CoverageArea, Literal["user_question"]] = "user_question"
    question: str = Field(min_length=5, max_length=1000)
    queries: List[TaskQuery] = Field(default_factory=list, max_length=3)
    priority: Literal["high", "medium", "low"] = "medium"


class ResearchTaskUpdate(BaseModel):
    question: Optional[str] = Field(default=None, min_length=5, max_length=1000)
    queries: Optional[List[TaskQuery]] = Field(default=None, min_length=1, max_length=3)
    priority: Optional[Literal["high", "medium", "low"]] = None
    status: Optional[Literal["proposed", "removed"]] = None


class ResearchPlanDetail(BaseModel):
    id: UUID
    project_id: UUID
    status: str
    policy: Optional[Dict[str, Any]]
    created_at: datetime
    approved_by: Optional[UUID]
    approved_at: Optional[datetime]
    tasks: List[ResearchTaskRead]


class EvidenceDocument(BaseModel):
    id: UUID
    title: str
    url: Optional[str]
    publisher: Optional[str]
    source_tier: str


class TaskEvidenceRead(EvidenceRead):
    document: Optional[EvidenceDocument] = None


class ResearchTaskRunResult(BaseModel):
    task: "ResearchTaskRead"
    summary: Dict[str, Any]
    evidence: List[TaskEvidenceRead]


# ============ Offline sources (attested evidence) ============

_Text = Field(min_length=1, max_length=500)


class BookCitation(BaseModel):
    kind: Literal["book"]
    title: str = _Text
    author: str = _Text
    page: str = Field(min_length=1, max_length=50)
    publisher: Optional[str] = Field(default=None, max_length=500)
    year: Optional[str] = Field(default=None, max_length=20)
    edition: Optional[str] = Field(default=None, max_length=100)


class InterviewCitation(BaseModel):
    kind: Literal["interview"]
    informant: str = _Text  # a name, or a description when the name is withheld
    date: str = Field(min_length=4, max_length=50)
    place: str = _Text
    interviewer: str = _Text
    consent_confirmed: bool
    recording_reference: Optional[str] = Field(default=None, max_length=500)
    language: Optional[str] = Field(default=None, max_length=100)


class FieldVisitCitation(BaseModel):
    kind: Literal["field_visit"]
    place: str = _Text
    date: str = Field(min_length=4, max_length=50)
    observer: str = _Text
    notes: Optional[str] = Field(default=None, max_length=2000)


class ArchiveVisitCitation(BaseModel):
    kind: Literal["archive_visit"]
    archive: str = _Text
    record_reference: str = _Text
    folio: str = Field(min_length=1, max_length=50)
    date: str = Field(min_length=4, max_length=50)


OfflineCitation = Annotated[
    Union[BookCitation, InterviewCitation, FieldVisitCitation, ArchiveVisitCitation],
    Field(discriminator="kind"),
]


class AttestedEvidenceCreate(BaseModel):
    claim: str = Field(min_length=3, max_length=2000)
    # The passage quoted (or closely paraphrased, for interviews) from the offline source
    excerpt: str = Field(min_length=1, max_length=5000)
    # For books and archive records; interviews and field visits are always "field"
    source_tier: Literal["primary", "secondary"] = "secondary"
    citation: OfflineCitation
    attested: bool = False
    research_plan_id: Optional[UUID] = None


# ============ Source documents ============

class SourceSearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=300)
    # wikipedia: Wikipedia API (free, no key). primary / secondary: web search limited to that
    # tier's approved sites (needs TAVILY_API_KEY).
    scope: Literal["wikipedia", "primary", "secondary"] = "wikipedia"
    language: str = Field(default="en", pattern=LANGUAGE_PATTERN)
    limit: int = Field(default=5, ge=1, le=20)


class SourceHitRead(BaseModel):
    title: str
    url: str
    snippet: str
    source_tier: str


class SourceSearchResponse(BaseModel):
    results: List[SourceHitRead]


class SourceFetchRequest(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    language: str = Field(default="en", pattern=LANGUAGE_PATTERN)


class SourceUrlRequest(BaseModel):
    url: str = Field(min_length=8, max_length=2000)


class SourceDocumentRead(BaseModel):
    id: UUID
    project_id: UUID
    provider: str
    source_tier: str
    url: Optional[str]
    title: str
    language: Optional[str]
    publisher: Optional[str]
    revision_id: Optional[str]
    revised_at: Optional[datetime]
    content_hash: str
    text_length: int
    extraction_method: Optional[str] = None
    file_name: Optional[str] = None
    retrieved_at: datetime


class SourceDocumentWithText(SourceDocumentRead):
    text: str


# ============ Character ============

class CharacterCreate(BaseModel):
    name: str
    profile: Optional[Dict[str, Any]] = None
    motivation: Optional[str] = None
    voice: Optional[str] = None


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    profile: Optional[Dict[str, Any]] = None
    motivation: Optional[str] = None
    voice: Optional[str] = None
    status: Optional[ArtifactStatus] = None


class CharacterRead(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    profile: Optional[Dict[str, Any]]
    motivation: Optional[str]
    voice: Optional[str]
    status: ArtifactStatus
    current_version_id: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Story ============

class StoryCreate(BaseModel):
    premise: Optional[str] = None
    logline: Optional[str] = None
    synopsis: Optional[str] = None
    themes: Optional[List[str]] = None
    conflict: Optional[str] = None
    beats: Optional[List[Dict[str, Any]]] = None


class StoryUpdate(BaseModel):
    premise: Optional[str] = None
    logline: Optional[str] = None
    synopsis: Optional[str] = None
    themes: Optional[List[str]] = None
    conflict: Optional[str] = None
    beats: Optional[List[Dict[str, Any]]] = None
    status: Optional[ArtifactStatus] = None


class StoryRead(BaseModel):
    id: UUID
    project_id: UUID
    premise: Optional[str]
    logline: Optional[str]
    synopsis: Optional[str]
    themes: Optional[List[str]]
    conflict: Optional[str]
    beats: Optional[List[Dict[str, Any]]]
    status: ArtifactStatus
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Artifact Version ============

class ArtifactVersionCreate(BaseModel):
    artifact_type: str
    artifact_id: UUID
    content: str
    reason: Optional[str] = None


class ArtifactVersionRead(BaseModel):
    id: UUID
    project_id: UUID
    artifact_type: str
    artifact_id: UUID
    version_number: int
    status: ArtifactStatus
    content: Optional[str]
    created_by: Optional[UUID]
    reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Decision & Canon ============

class CreativeDecisionCreate(BaseModel):
    statement: str
    rationale: Optional[str] = None
    evidence_refs: Optional[List[UUID]] = None


class CreativeDecisionRead(BaseModel):
    id: UUID
    project_id: UUID
    statement: str
    rationale: Optional[str]
    evidence_refs: Optional[List[UUID]]
    status: ApprovalDecision
    approver_id: Optional[UUID]
    approved_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class CanonFactCreate(BaseModel):
    category: str
    statement: str
    source_ref: Optional[UUID] = None
    version_id: Optional[UUID] = None


class CanonFactRead(BaseModel):
    id: UUID
    project_id: UUID
    category: str
    statement: str
    source_ref: Optional[UUID]
    version_id: Optional[UUID]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Approval ============

class ApprovalCreate(BaseModel):
    artifact_version_id: UUID
    decision: ApprovalDecision
    reason: Optional[str] = None


class ApprovalRead(BaseModel):
    id: UUID
    artifact_version_id: UUID
    approver_id: UUID
    decision: ApprovalDecision
    reason: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True


# ============ Evaluation ============

class EvaluationCreate(BaseModel):
    artifact_version_id: Optional[UUID] = None
    rubric_version: Optional[str] = None
    findings: Dict[str, Any]


class EvaluationRead(BaseModel):
    id: UUID
    project_id: UUID
    artifact_version_id: Optional[UUID]
    rubric_version: Optional[str]
    findings: Dict[str, Any]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============ AI Run ============

class AIRunCreate(BaseModel):
    workflow_id: str
    agent_id: str
    model_id: str


class AIRunRead(BaseModel):
    id: UUID
    project_id: UUID
    workflow_id: str
    agent_id: str
    model_id: str
    status: str
    latency_ms: Optional[int]
    token_usage: Optional[int]
    estimated_cost: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


# ============ Project Intelligence (Composite) ============

class ProjectIntelligenceRead(BaseModel):
    """Complete Story Brain snapshot"""
    project: ProjectRead
    intent: Optional[IntentRead]
    research: List[EvidenceRead]
    characters: List[CharacterRead]
    stories: List[StoryRead]
    decisions: List[CreativeDecisionRead]
    canon: List[CanonFactRead]
    versions: List[ArtifactVersionRead]

    class Config:
        from_attributes = True


# ============ Project Snapshot (frontend project document) ============

class SnapshotWrite(BaseModel):
    """Save the project document. `base_version` is the version this edit was based on."""
    data: Dict[str, Any]
    base_version: int = Field(ge=1)
    schema_version: int = Field(default=1, ge=1)


class SnapshotRead(BaseModel):
    project_id: UUID
    version: int
    schema_version: int
    data: Dict[str, Any]
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ProjectImport(BaseModel):
    """Create a project together with its document (new project or localStorage import)."""
    id: Optional[UUID] = None
    title: str = Field(min_length=1, max_length=255)
    format: Optional[str] = None
    genre: Optional[str] = None
    data: Dict[str, Any]
    schema_version: int = Field(default=1, ge=1)


class ProjectImportResult(BaseModel):
    project: ProjectRead
    snapshot: SnapshotRead
