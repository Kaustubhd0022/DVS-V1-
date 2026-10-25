"""
Story management endpoints - Narrative structure and story development
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.auth import require_project_access
from app.database import get_db
from app.models import Story, Project
from app.schemas import StoryCreate, StoryRead, StoryUpdate

router = APIRouter(dependencies=[Depends(require_project_access)])


@router.post("", response_model=StoryRead)
async def create_story(
    project_id: UUID,
    story: StoryCreate,
    db: Session = Depends(get_db),
):
    """Create a new story"""

    # Verify project exists
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create story
    db_story = Story(
        project_id=project_id,
        premise=story.premise,
        logline=story.logline,
        synopsis=story.synopsis,
        themes=story.themes,
        conflict=story.conflict,
        beats=story.beats,
    )

    db.add(db_story)
    db.commit()
    db.refresh(db_story)

    return db_story


@router.get("/{story_id}", response_model=StoryRead)
async def get_story(
    story_id: UUID,
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """Get story by ID"""

    story = db.query(Story).filter(
        Story.id == story_id,
        Story.project_id == project_id,
    ).first()

    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    return story


@router.get("", response_model=List[StoryRead])
async def list_stories(
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """List all stories in a project"""

    stories = db.query(Story).filter_by(project_id=project_id).all()
    return stories


@router.put("/{story_id}", response_model=StoryRead)
async def update_story(
    story_id: UUID,
    project_id: UUID,
    story_update: StoryUpdate,
    db: Session = Depends(get_db),
):
    """Update story"""

    story = db.query(Story).filter(
        Story.id == story_id,
        Story.project_id == project_id,
    ).first()

    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    for field, value in story_update.dict(exclude_unset=True).items():
        setattr(story, field, value)

    db.commit()
    db.refresh(story)

    return story


@router.delete("/{story_id}")
async def delete_story(
    story_id: UUID,
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """Delete story"""

    story = db.query(Story).filter(
        Story.id == story_id,
        Story.project_id == project_id,
    ).first()

    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    db.delete(story)
    db.commit()

    return {"status": "deleted"}
