"""
Character management endpoints - Character intelligence and relationships
"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.auth import require_project_access
from app.database import get_db
from app.models import Character, Project, Relationship
from app.schemas import CharacterCreate, CharacterRead, CharacterUpdate

router = APIRouter(dependencies=[Depends(require_project_access)])


@router.post("", response_model=CharacterRead)
async def create_character(
    project_id: UUID,
    character: CharacterCreate,
    db: Session = Depends(get_db),
):
    """Create a new character"""

    # Verify project exists
    project = db.query(Project).filter_by(id=project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create character
    db_character = Character(
        project_id=project_id,
        name=character.name,
        profile=character.profile,
        motivation=character.motivation,
        voice=character.voice,
    )

    db.add(db_character)
    db.commit()
    db.refresh(db_character)

    return db_character


@router.get("/{character_id}", response_model=CharacterRead)
async def get_character(
    character_id: UUID,
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """Get character by ID"""

    character = db.query(Character).filter(
        Character.id == character_id,
        Character.project_id == project_id,
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    return character


@router.get("", response_model=List[CharacterRead])
async def list_characters(
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """List all characters in a project"""

    characters = db.query(Character).filter_by(project_id=project_id).all()
    return characters


@router.put("/{character_id}", response_model=CharacterRead)
async def update_character(
    character_id: UUID,
    project_id: UUID,
    character_update: CharacterUpdate,
    db: Session = Depends(get_db),
):
    """Update character"""

    character = db.query(Character).filter(
        Character.id == character_id,
        Character.project_id == project_id,
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    for field, value in character_update.dict(exclude_unset=True).items():
        setattr(character, field, value)

    db.commit()
    db.refresh(character)

    return character


@router.delete("/{character_id}")
async def delete_character(
    character_id: UUID,
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """Delete character"""

    character = db.query(Character).filter(
        Character.id == character_id,
        Character.project_id == project_id,
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    db.delete(character)
    db.commit()

    return {"status": "deleted"}


@router.get("/{character_id}/relationships", response_model=List[dict])
async def get_character_relationships(
    character_id: UUID,
    project_id: UUID,
    db: Session = Depends(get_db),
):
    """Get character relationships"""

    character = db.query(Character).filter(
        Character.id == character_id,
        Character.project_id == project_id,
    ).first()

    if not character:
        raise HTTPException(status_code=404, detail="Character not found")

    relationships = db.query(Relationship).filter(
        (Relationship.from_entity_id == character_id) |
        (Relationship.to_entity_id == character_id)
    ).all()

    return [
        {
            "relationship_id": str(r.id),
            "from_entity_id": str(r.from_entity_id),
            "to_entity_id": str(r.to_entity_id),
            "type": r.relationship_type,
            "attributes": r.attributes,
        }
        for r in relationships
    ]
