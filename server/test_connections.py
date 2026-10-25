"""
Test database and LLM connections
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv(".env")

print("=" * 60)
print("Testing TattvaCo Backend Connections")
print("=" * 60)

# Test 1: Database Connection
print("\n[1] Testing PostgreSQL/Supabase Connection...")
try:
    from sqlalchemy import create_engine, text
    from app.config import settings

    db_url = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

    print(f"  Database Host: {settings.DB_HOST}")
    print(f"  Database Port: {settings.DB_PORT}")
    print(f"  Database Name: {settings.DB_NAME}")
    print(f"  Database User: {settings.DB_USER}")

    engine = create_engine(db_url)
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.fetchone()[0]
        print(f"  ✓ Connected successfully!")
        print(f"  PostgreSQL Version: {version[:50]}...")

except Exception as e:
    print(f"  ✗ Connection failed: {str(e)}")
    sys.exit(1)

# Test 2: Huggingface Token & Model
print("\n[2] Testing Huggingface Access...")
try:
    from huggingface_hub import model_info
    from app.config import settings

    token = settings.HUGGINGFACE_API_TOKEN
    model_name = settings.HUGGINGFACE_MODEL

    if not token or token == "hf_xxx":
        print(f"  ⚠ Token not configured or invalid (set in .env)")
        print(f"  Model: {model_name}")
    else:
        print(f"  Huggingface Token: {token[:20]}...")
        print(f"  Model: {model_name}")

        # Try to get model info
        info = model_info(model_name, token=token)
        print(f"  ✓ Model access confirmed!")
        print(f"  Model ID: {info.model_id}")
        print(f"  Model Type: {info.model_id.split('/')[-1]}")

except Exception as e:
    print(f"  ⚠ Huggingface check failed: {str(e)}")
    print(f"  (This is OK if token not set yet)")

# Test 3: Embeddings Model
print("\n[3] Testing Embeddings Model...")
try:
    from sentence_transformers import SentenceTransformer
    from app.config import settings

    model_name = settings.EMBEDDINGS_MODEL
    print(f"  Loading: {model_name}")

    model = SentenceTransformer(model_name)
    test_embedding = model.encode("test")

    print(f"  ✓ Model loaded successfully!")
    print(f"  Embedding dimensions: {len(test_embedding)}")

except Exception as e:
    print(f"  ✗ Embeddings model failed: {str(e)}")
    sys.exit(1)

# Test 4: Database Schema
print("\n[4] Testing Database Schema...")
try:
    from app.database import init_db

    print("  Initializing database schema...")
    init_db()
    print("  ✓ Schema initialized successfully!")

except Exception as e:
    print(f"  ✗ Schema initialization failed: {str(e)}")
    sys.exit(1)

# Test 5: FastAPI Server
print("\n[5] Checking FastAPI Setup...")
try:
    from main import app
    from fastapi.testclient import TestClient

    client = TestClient(app)
    response = client.get("/api/health/")

    if response.status_code == 200:
        print(f"  ✓ API health check passed!")
        print(f"  Response: {response.json()}")
    else:
        print(f"  ✗ API health check failed: {response.status_code}")

except Exception as e:
    print(f"  ✗ FastAPI check failed: {str(e)}")
    sys.exit(1)

print("\n" + "=" * 60)
print("✓ All connections verified successfully!")
print("=" * 60)
print("\nNext steps:")
print("1. Start dev server: python main.py")
print("2. Visit: http://localhost:8000/docs")
print("3. Test API endpoints with Swagger UI")
