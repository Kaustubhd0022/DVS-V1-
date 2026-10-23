"""
TattvaCo Film OS Backend — FastAPI Server
AI-native project intelligence and story development copilot
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.config import settings
from app.database import init_db
from app.api import health, projects

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and manage app lifecycle"""
    logger.info("🚀 TattvaCo Backend Starting")

    # Initialize database schema
    try:
        init_db()
        logger.info("✓ Database schema initialized")
    except Exception as e:
        logger.error(f"✗ Database initialization failed: {e}")

    yield

    logger.info("🛑 TattvaCo Backend Shutting Down")


app = FastAPI(
    title="TattvaCo API",
    description="AI-native film & storytelling platform backend",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(health.router, prefix="/api/health", tags=["health"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "TattvaCo",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
