"""Health check endpoints"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    message: str


@router.get("/", response_model=HealthResponse)
async def health_check():
    """Server health check endpoint"""
    return {
        "status": "healthy",
        "message": "TattvaCo Backend is running",
    }
