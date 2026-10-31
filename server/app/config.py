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

    # Auth - Supabase (set SUPABASE_URL for ES256/RS256 tokens, SUPABASE_JWT_SECRET for HS256)
    SUPABASE_URL: str = ""
    SUPABASE_JWT_SECRET: str = ""
    SUPABASE_JWT_AUDIENCE: str = "authenticated"

    # LLM provider for /api/ai: "groq" or "huggingface"
    LLM_PROVIDER: str = "groq"

    # LLM - Groq (OpenAI-compatible chat completions)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GROQ_FALLBACK_MODEL: str = "openai/gpt-oss-20b"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    # Web search restricted to approved source sites (Tavily free plan: 1,000 searches/month)
    TAVILY_API_KEY: str = ""

    # LLM - Huggingface
    HUGGINGFACE_API_TOKEN: str = ""
    HUGGINGFACE_MODEL: str = "meta-llama/Llama-3.1-8B-Instruct"
    HUGGINGFACE_FALLBACK_MODEL: str = "Qwen/Qwen2.5-72B-Instruct"
    HUGGINGFACE_BASE_URL: str = "https://router.huggingface.co/v1"

    # Max AI requests per user per minute (in-memory limiter)
    AI_REQUESTS_PER_MINUTE: int = 30

    # Email (SMTP) - used to send each signed Terms & Conditions form to the compliance mailbox
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""  # defaults to SMTP_USERNAME
    SMTP_SECURITY: str = "starttls"  # starttls (port 587) | ssl (port 465) | none (local testing only)
    SMTP_TIMEOUT_SECONDS: int = 20
    TERMS_RECIPIENT_EMAIL: str = "renee@manuvanzara.com"

    # Embeddings - Huggingface
    EMBEDDINGS_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    # Vector DB
    VECTOR_DIMENSIONS: int = 384  # For all-MiniLM-L6-v2

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
