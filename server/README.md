# TattvaCo Backend

FastAPI-based backend for TattvaCo Film OS — AI-native product strategy platform.

## Setup

### Prerequisites
- Python 3.11+
- pip or uv

### Installation

```bash
cd server
python -m venv .venv
source .venv/bin/activate  # or `.venv\Scripts\activate` on Windows
pip install -e .
```

### Configuration

Copy `.env.example` to `.env` and adjust settings:

```bash
cp .env.example .env
```

### Run Development Server

```bash
python main.py
# or
uvicorn main:app --reload
```

Server runs at `http://localhost:8000`

API docs at `http://localhost:8000/docs`

## Deploying (Render)

`render.yaml` at the repository root is a Render Blueprint for this server.

1. In Render: **New → Blueprint**, pick this repository. Render reads `render.yaml`.
2. Fill in the secrets it asks for:
   - `DATABASE_URL`: Supabase → Connect → Session pooler connection string.
   - `SUPABASE_JWT_SECRET`: Supabase → Project Settings → JWT keys (legacy secret).
   - `GROQ_API_KEY`: a Groq key created for the server.
3. After the first deploy, open `https://<service>.onrender.com/api/health/`; it should say healthy.
4. In Vercel, set `VITE_BACKEND_URL=https://<service>.onrender.com/api` and redeploy the client.

The deployed server installs `requirements.txt` only. Tests and linters are in
`requirements-dev.txt`; local embeddings for semantic search are in `requirements-ml.txt`.

## Project Structure

```
server/
├── app/
│   ├── api/
│   │   ├── health.py       # Health check endpoints
│   │   ├── projects.py     # Project CRUD endpoints
│   │   └── __init__.py
│   ├── config.py           # Configuration & settings
│   └── __init__.py
├── main.py                 # FastAPI app entry point
├── pyproject.toml          # Dependencies & metadata
├── .env.example            # Environment template
└── README.md               # This file
```

## Development

### Install Dev Dependencies

```bash
pip install -e ".[dev]"
```

### Run Tests

```bash
pytest
```

### Linting & Formatting

```bash
ruff check .
black .
mypy .
```

## API Endpoints

### Health
- `GET /api/health/` — Server health check

### Projects
- `GET /api/projects/` — List all projects
- `POST /api/projects/` — Create new project
- `GET /api/projects/{project_id}` — Get project details

## Architecture Notes

- **Framework**: FastAPI (async, type-safe)
- **Server**: Uvicorn (ASGI)
- **Validation**: Pydantic v2
- **Config**: Environment variables via pydantic-settings
- **CORS**: Enabled for local development (adjust in `app/config.py`)
