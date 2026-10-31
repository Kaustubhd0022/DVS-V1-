"""
Database configuration and session management
Supabase PostgreSQL + pgvector
"""

from sqlalchemy import create_engine, event, Engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
import os
import urllib.parse
from app.config import settings
from app.models import Base

# Supabase connection string
_encoded_password = urllib.parse.quote_plus(settings.DB_PASSWORD) if settings.DB_PASSWORD else ""
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"postgresql://{settings.DB_USER}:{_encoded_password}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)

# Create engine with pgvector support
engine = create_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    poolclass=NullPool if settings.ENVIRONMENT == "testing" else None,
    pool_pre_ping=True,  # Verify connections before using
)

# Enable pgvector extension
@event.listens_for(Engine, "connect")
def enable_extensions(dbapi_conn, connection_record):
    """Enable pgvector and other extensions on connect"""
    cursor = dbapi_conn.cursor()
    try:
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector")
        cursor.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
        dbapi_conn.commit()
    except Exception as e:
        dbapi_conn.rollback()
        print(f"Extension already exists or error: {e}")
    finally:
        cursor.close()


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db() -> Session:
    """Dependency for FastAPI endpoints"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database schema"""
    Base.metadata.create_all(bind=engine)


def drop_db():
    """Drop all tables (testing only)"""
    Base.metadata.drop_all(bind=engine)
