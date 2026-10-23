"""Project endpoints"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()


class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectResponse(ProjectBase):
    id: str


@router.get("/", response_model=List[ProjectResponse])
async def list_projects():
    """List all projects"""
    return []


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str):
    """Get a specific project"""
    raise HTTPException(status_code=404, detail="Project not found")


@router.post("/", response_model=ProjectResponse)
async def create_project(project: ProjectBase):
    """Create a new project"""
    return {
        "id": "placeholder-id",
        **project.model_dump(),
    }
