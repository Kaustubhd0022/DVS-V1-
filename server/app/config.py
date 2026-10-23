"""Application Configuration"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Server
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:8080",
    ]

    # Database - Supabase PostgreSQL
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "tattva"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"

    # LLM - Huggingface
    HUGGINGFACE_API_TOKEN: str = ""
    HUGGINGFACE_MODEL: str = "mistralai/Mistral-7B-Instruct-v0.1"

    # Embeddings - Huggingface
    EMBEDDINGS_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    # Vector DB
    VECTOR_DIMENSIONS: int = 384  # For all-MiniLM-L6-v2

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
