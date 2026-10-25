# TattvaCo Backend Setup

## Prerequisites
- Python 3.11+
- PostgreSQL (or Supabase)
- Huggingface API token

## Installation

### 1. Create virtual environment
```bash
cd server
python -m venv .venv
source .venv/bin/activate  # or `.venv\Scripts\activate` on Windows
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your settings:
# - DB_HOST, DB_PASSWORD (Supabase credentials)
# - HUGGINGFACE_API_TOKEN
```

### 4. Initialize database
```bash
python -c "from app.database import init_db; init_db()"
```

## Running

### Development server
```bash
python main.py
```

Server runs at `http://localhost:8000`
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health/

### Tests
```bash
pytest
pytest -v  # verbose
pytest --cov  # with coverage
```

## Architecture

### Data Layer
- **Models** (app/models.py): SQLAlchemy ORM - 20 entities
- **Database** (app/database.py): Supabase PostgreSQL + pgvector
- **Schemas** (app/schemas.py): Pydantic request/response validation

### Service Layer
- **ContextResolver**: Minimal context retrieval for agents (project, story, character, writing, continuity)
- **AgentOrchestrator**: Langchain + Langgraph workflow execution with agent contracts
- **VectorSearchService**: Semantic search using pgvector and sentence-transformers
- **ContinuityChecker**: Detect contradictions and consistency issues
- **DependencyTracker**: Track artifact dependencies and impact analysis

### API Layer
- **Projects**: CRUD, Project Intelligence retrieval
- **Workflows**: Agent execution endpoints
- **Health**: Status and readiness

## Key Concepts

### Project Intelligence (Story Brain)
Central source of truth containing:
- Project metadata
- Intent & context
- Characters with relationships
- Story structure & narrative
- Research & evidence with provenance
- Creative decisions & canon facts
- Artifact versions & approvals
- Dependency graph

### Context Resolver
Prevents dumping entire project into every LLM call:
- Resolves minimal relevant context
- Version-aware
- Authorization filtered
- Scoped to entity types

### Agent Orchestration
Langchain-based workflows:
- Defined agent contracts
- Modular prompt building
- Output schema validation
- Run tracking & telemetry
- Artifact versioning

## API Endpoints

### Organizations (Multi-tenancy)
- `POST /api/organizations` - Create
- `GET /api/organizations` - List
- `GET /api/organizations/{id}` - Get
- `POST /api/organizations/{id}/users` - Add user
- `GET /api/organizations/{id}/users` - List users

### Projects
- `POST /api/projects?org_id={id}` - Create
- `GET /api/projects/{id}` - Read
- `PUT /api/projects/{id}` - Update
- `DELETE /api/projects/{id}` - Archive
- `GET /api/projects/{id}/intelligence` - Story Brain
- `POST /api/projects/{id}/intent` - Create intent
- `GET /api/projects/{id}/intent` - Get intent

### Workflows
- `POST /api/workflows` - Execute agent
- `GET /api/workflows/{run_id}` - Get status

### Approvals
- `POST /api/approvals/{version_id}` - Approve/reject artifact
- `GET /api/approvals/{version_id}` - Get approval
- `GET /api/approvals/project/{project_id}` - List pending

### Artifacts
- `POST /api/artifacts?project_id={id}` - Create version
- `GET /api/artifacts/{id}/versions` - List versions
- `GET /api/artifacts/{version_id}` - Get version
- `GET /api/artifacts/{id}/latest` - Get latest

### Characters
- `POST /api/characters?project_id={id}` - Create
- `GET /api/characters/{id}?project_id={id}` - Get
- `GET /api/characters?project_id={id}` - List
- `PUT /api/characters/{id}?project_id={id}` - Update
- `DELETE /api/characters/{id}?project_id={id}` - Delete
- `GET /api/characters/{id}/relationships?project_id={id}` - Get relationships

### Stories
- `POST /api/stories?project_id={id}` - Create
- `GET /api/stories/{id}?project_id={id}` - Get
- `GET /api/stories?project_id={id}` - List
- `PUT /api/stories/{id}?project_id={id}` - Update
- `DELETE /api/stories/{id}?project_id={id}` - Delete

### Research
- `POST /api/research/plans?project_id={id}` - Create plan
- `GET /api/research/plans/{id}?project_id={id}` - Get plan
- `GET /api/research/plans?project_id={id}` - List plans
- `PUT /api/research/plans/{id}?project_id={id}` - Update plan
- `POST /api/research/evidence?project_id={id}` - Create evidence
- `GET /api/research/evidence/{id}?project_id={id}` - Get evidence
- `GET /api/research/evidence?project_id={id}` - List evidence
- `PUT /api/research/evidence/{id}?project_id={id}` - Update evidence

### Analytics
- `POST /api/analytics/{project_id}/continuity-check` - Check continuity
- `GET /api/analytics/{project_id}/dependency-impact/{artifact_id}` - Impact analysis
- `POST /api/analytics/{project_id}/vector-search` - Semantic search
- `GET /api/analytics/{project_id}/dependencies/validate` - Validate dependencies
- `GET /api/analytics/{project_id}/artifacts/{artifact_id}/dependencies` - Get dependencies

## Environment Variables

```
# Server
DEBUG=True
ENVIRONMENT=development

# Database
DB_HOST=your-supabase-host
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your-password

# LLM
HUGGINGFACE_API_TOKEN=hf_xxx
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1

# Embeddings
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
VECTOR_DIMENSIONS=384
```

## Development

### Code Quality
```bash
# Format
black .

# Lint
ruff check .

# Type check
mypy app
```

### Database
Schema is auto-created on startup. To reset:
```python
from app.database import drop_db, init_db
drop_db()
init_db()
```

### Adding Models
1. Update `app/models.py`
2. Create Pydantic schemas in `app/schemas.py`
3. Add API endpoints in `app/api/`
4. Database migrates automatically

## Troubleshooting

### Connection refused
Check DB_HOST, DB_PORT, DB_PASSWORD in .env.local

### pgvector extension error
Supabase auto-enables pgvector. If using local PostgreSQL:
```sql
CREATE EXTENSION vector;
```

### Huggingface token invalid
- Get token from https://huggingface.co/settings/tokens
- Token needs read access to models

## Implementation Status

### ✅ Completed
- Data Schema: 20 SQLAlchemy entities with relationships
- Database Configuration: Supabase PostgreSQL + pgvector
- Pydantic Schemas: Complete request/response models
- Core API Endpoints: Organizations, Projects, Intent, Characters, Stories, Research
- Workflow Execution: Agent orchestration with langchain + langgraph
- Approval System: Artifact versioning and approval workflow
- Artifact Management: Versioning with parent-child relationships
- Services Layer:
  - ContextResolver: Minimal context retrieval
  - AgentOrchestrator: 9 workflow types (INTENT, RESEARCH, STORY, CHARACTER, WRITING, SCREENPLAY, DIALOGUE, CONTINUITY, EVALUATION)
  - VectorSearchService: Semantic search with pgvector
  - ContinuityChecker: Detect contradictions and consistency issues
  - DependencyTracker: Impact analysis and dependency validation
- Analytics Endpoints: Continuity checks, dependency analysis, vector search
- Tests: Unit tests for models and services
- Documentation: Complete API documentation and setup guide

### 📋 Files Structure
```
server/
├── main.py                          # FastAPI application entry point
├── requirements.txt                 # Dependencies (torch>=2.2.0, langchain, langgraph, etc.)
├── SETUP.md                         # This file
├── app/
│   ├── __init__.py
│   ├── config.py                    # Settings with Pydantic
│   ├── database.py                  # SQLAlchemy engine, session factory
│   ├── models.py                    # 20 entities
│   ├── schemas.py                   # Pydantic schemas
│   ├── api/
│   │   ├── __init__.py
│   │   ├── health.py                # Health check
│   │   ├── organizations.py         # Multi-tenancy
│   │   ├── projects.py              # CRUD + intelligence
│   │   ├── workflows.py             # Agent execution
│   │   ├── approvals.py             # Approval workflow
│   │   ├── artifacts.py             # Versioning
│   │   ├── characters.py            # Character management
│   │   ├── stories.py               # Story management
│   │   ├── research.py              # Research plans + evidence
│   │   └── analytics.py             # Continuity, dependencies, vector search
│   └── services/
│       ├── __init__.py
│       ├── context_resolver.py      # Context assembly
│       ├── agent_orchestrator.py    # Workflow execution
│       ├── vector_search.py         # Semantic search
│       ├── continuity_checker.py    # Conflict detection
│       └── dependency_tracker.py    # Impact analysis
└── tests/
    ├── conftest.py                  # pytest fixtures
    ├── test_models.py               # Data model tests
    ├── test_services.py             # Service layer tests
    └── test_api.py                  # API endpoint tests
```

## Next Steps

1. **Complete pip installation** - Currently installing dependencies
2. **Run test suite** - Verify all models, services, and endpoints
3. **Connect to Supabase** - Configure DB_HOST, DB_PASSWORD in .env.local
4. **Provide Huggingface token** - Set HUGGINGFACE_API_TOKEN in .env.local
5. **Start dev server** - `python main.py`
6. **Test workflows** - Execute POST /api/workflows with different workflow types
7. **Advanced features** (optional):
   - Implement pgvector-based semantic similarity for vector search
   - Add WebSocket support for real-time collaboration
   - Build advanced prompt engineering for agents
   - Add audit logging to ChangeLog entity
   - Implement caching for context resolution
