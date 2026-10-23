"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models import (
    ProjectStatus, ArtifactStatus, ApprovalDecision
)


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
    assumptions: Optional[Dict[str, Any]] = None


class IntentUpdate(BaseModel):
    intent: Optional[str] = None
    knowns: Optional[Dict[str, Any]] = None
    unknowns: Optional[Dict[str, Any]] = None
    assumptions: Optional[Dict[str, Any]] = None
    status: Optional[ArtifactStatus] = None


class IntentRead(BaseModel):
    id: UUID
    project_id: UUID
    intent: str
    knowns: Optional[Dict[str, Any]]
    unknowns: Optional[Dict[str, Any]]
    assumptions: Optional[Dict[str, Any]]
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


class EvidenceCreate(BaseModel):
    research_plan_id: Optional[UUID] = None
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
    created_at: datetime

    class Config:
        from_attributes = True


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
