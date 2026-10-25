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
from app.api import ai, health, me, projects, workflows, approvals, artifacts, characters, stories, research, organizations, analytics

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and manage app lifecycle"""
    logger.info("🚀 TattvaCo Backend Starting")

    # Schema is managed by Alembic outside development/testing (`alembic upgrade head`)
    try:
        if settings.ENVIRONMENT in ("development", "testing"):
            init_db()
            logger.info("✓ Database schema initialized")
    except Exception:
        # Fail fast: a server that cannot reach its database would only return 500s.
        logger.exception("✗ Database initialization failed")
        raise

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
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
app.include_router(me.router, prefix="/api/me", tags=["me"])
app.include_router(organizations.router, prefix="/api/organizations", tags=["organizations"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(workflows.router, prefix="/api/workflows", tags=["workflows"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["approvals"])
app.include_router(artifacts.router, prefix="/api/artifacts", tags=["artifacts"])
app.include_router(characters.router, prefix="/api/characters", tags=["characters"])
app.include_router(stories.router, prefix="/api/stories", tags=["stories"])
app.include_router(research.router, prefix="/api/research", tags=["research"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])


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
