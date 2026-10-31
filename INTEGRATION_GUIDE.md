# Frontend-Backend Integration Guide

## Overview
The TattvaCo application consists of:
- **Frontend**: React + TypeScript (Vite) - `client/`
- **Backend**: FastAPI + SQLAlchemy - `server/`

## Architecture

```
┌─────────────────────────┐
│   React Frontend        │
│   (Vite + TypeScript)   │
├─────────────────────────┤
│  API Client             │
│  (apiClient.ts)         │
├─────────────────────────┤
│  HTTP/REST (localhost)  │
├─────────────────────────┤
│   FastAPI Backend       │
│   (Uvicorn)             │
├─────────────────────────┤
│  SQLAlchemy ORM         │
│  Supabase PostgreSQL    │
└─────────────────────────┘
```

## Setup Instructions

### Backend Setup
```bash
cd server

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.local.example .env.local
# Edit .env.local with:
# - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (Supabase)
# - HUGGINGFACE_API_TOKEN

# Initialize database
python -c "from app.database import init_db; init_db()"

# Start server
python main.py
# Server runs at http://localhost:8000
```

### Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Configure environment
# .env.local is already created with:
# VITE_BACKEND_URL=http://localhost:8000/api

# Start dev server
npm run dev
# Frontend runs at http://localhost:5173
```

## API Integration

### Using the API Client

The frontend has `src/services/apiClient.ts` which provides a typed API client:

```typescript
import { apiClient } from '@/services/apiClient';

// Create a project
const project = await apiClient.createProject(
  orgId,
  'My Film',
  'Feature Film',
  'Drama'
);

// Get project intelligence (Story Brain)
const intelligence = await apiClient.getProjectIntelligence(projectId);

// Execute a workflow
const result = await apiClient.executeWorkflow(
  projectId,
  'story',
  'Write a compelling opening scene'
);

// Check continuity
const continuityCheck = await apiClient.checkContinuity(
  projectId,
  artifactId,
  contentToCheck
);

// Analyze dependency impact
const impact = await apiClient.analyzeDependencyImpact(projectId, artifactId);

// Vector search
const results = await apiClient.vectorSearch(projectId, 'search query');
```

## API Endpoints Available

### Core Endpoints
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project
- `GET /api/projects/{id}/intelligence` - Story Brain / Project Intelligence
- `POST /api/projects/{id}/intent` - Create project intent

### Workflows
- `POST /api/workflows` - Execute agent (INTENT, STORY, CHARACTER, WRITING, RESEARCH, etc.)
- `GET /api/workflows/{run_id}` - Get workflow status

### Content Management
- `POST/GET/PUT/DELETE /api/characters` - Character management
- `POST/GET/PUT/DELETE /api/stories` - Story management
- `POST/GET/PUT /api/research/plans` - Research plans
- `POST/GET /api/research/evidence` - Evidence & sources

### Analytics
- `POST /api/analytics/{project_id}/continuity-check` - Detect contradictions
- `GET /api/analytics/{project_id}/dependency-impact/{artifact_id}` - Impact analysis
- `POST /api/analytics/{project_id}/vector-search` - Semantic search
- `GET /api/analytics/{project_id}/dependencies/validate` - Validate dependency graph

## Database Schema

The backend uses SQLAlchemy ORM with 20+ entities:

### Core Entities
- **Organization** - Multi-tenancy
- **Project** - Film/story project
- **User** - Team members
- **Intent** - Project goals & context
- **Character** - Character profiles
- **Story** - Narrative structure
- **ResearchPlan** - Research organization
- **Evidence** - Sources & findings
- **CanonFact** - Established facts
- **CreativeDecision** - Story decisions
- **ArtifactVersion** - Content versioning
- **Approval** - Approval workflow
- **AIRun** - AI execution tracking
- **Dependency** - Content dependencies

## Workflow Types

The backend supports these AI workflows:

1. **INTENT** - Interpret user goals and missing context
2. **RESEARCH** - Find reliable evidence
3. **STORY** - Develop story alternatives
4. **CHARACTER** - Build character intelligence
5. **WRITING** - Generate context-aware content
6. **SCREENPLAY** - Format screenplay content
7. **DIALOGUE** - Write character dialogue
8. **CONTINUITY** - Detect contradictions
9. **EVALUATION** - Assess quality

## Example: Creating a Project with Intent

```typescript
import { apiClient } from '@/services/apiClient';

// 1. Create organization
const org = await apiClient.createOrganization('My Studio', 'my-studio');

// 2. Create project
const project = await apiClient.createProject(
  org.id,
  'My Thriller Film',
  'Feature Film',
  'Thriller'
);

// 3. Set project intent
const intent = await apiClient.createIntent(
  project.id,
  'A high-stakes psychological thriller about...',
  { setting: 'NYC', tone: 'dark' },
  { villain_motivation: null },
  ['Contemporary setting', 'Modern timeline']
);

// 4. Get Project Intelligence
const intelligence = await apiClient.getProjectIntelligence(project.id);
// Returns: { project, intent, characters, stories, research, canon, decisions, versions }

// 5. Execute workflow
const storyResult = await apiClient.executeWorkflow(
  project.id,
  'story',
  'Develop a compelling three-act structure for the story'
);

console.log(storyResult);
// { run_id, status, output: { premise, logline, themes, beats }, latency_ms, approval_required }
```

## Continuity Checking Example

```typescript
// Check if new content contradicts established canon
const continuityResult = await apiClient.checkContinuity(
  projectId,
  artifactId,
  newContent
);

console.log(continuityResult);
// {
//   artifact_id,
//   status: 'passed' | 'failed',
//   conflicts_found: number,
//   conflicts: [{ type, canon_fact, conflicting_content, severity }],
//   confidence: 'high' | 'medium' | 'low'
// }
```

## Dependency Impact Analysis

```typescript
// See what's affected if you change an artifact
const impact = await apiClient.analyzeDependencyImpact(projectId, artifactId);

console.log(impact);
// {
//   changed_artifact_id,
//   affected_artifacts: [id1, id2, id3],
//   impact_count: 3,
//   risk_level: 'low' | 'medium' | 'high',
//   recommendation: 'Safe to proceed...'
// }
```

## Vector Search (Semantic)

```typescript
// Find similar content using semantic embeddings
const results = await apiClient.vectorSearch(
  projectId,
  'find scenes with high tension',
  'screenplay'  // optional artifact type filter
);

console.log(results);
// {
//   query,
//   results_count,
//   results: [{ artifact_id, artifact_type, version_number, content_preview }]
// }
```

## Environment Variables

### Backend (.env or .env.local in server/)
```
DEBUG=true
ENVIRONMENT=development
DB_HOST=your-supabase-host.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.your-project-id
DB_PASSWORD=your-password
HUGGINGFACE_API_TOKEN=hf_xxxx
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1
EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2
VECTOR_DIMENSIONS=384
```

### Frontend (.env.local in client/)
```
VITE_BACKEND_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

Never put model provider keys (Groq, HuggingFace) in a `VITE_*` variable: Vite compiles them
into the JavaScript every visitor downloads. They belong in `server/.env` (see `server/.env.example`).

## Development Workflow

1. **Backend Development**
   ```bash
   cd server
   python main.py
   # API docs at http://localhost:8000/docs
   ```

2. **Frontend Development**
   ```bash
   cd client
   npm run dev
   # App at http://localhost:5173
   ```

3. **Testing API Endpoints**
   ```bash
   # Swagger UI
   http://localhost:8000/docs
   
   # or curl
   curl http://localhost:8000/api/health/
   ```

## Troubleshooting

### CORS Issues
- Backend CORS is configured for `http://localhost:5173` by default
- Update `app/config.py` CORS_ORIGINS if frontend runs on different port

### Backend Not Responding
- Check if server is running: `python main.py`
- Verify database connection in `.env`
- Check logs for import errors

### Frontend Can't Reach Backend
- Ensure `VITE_BACKEND_URL` in `.env.local` matches backend URL
- Check browser console for network errors
- Verify CORS headers in backend response

## Next Steps

1. ✅ Backend API fully implemented
2. ✅ API client created for frontend
3. ⏳ Integrate workflows into UI components
4. ⏳ Connect character creation to backend
5. ⏳ Link story development to continuity checking
6. ⏳ Add real-time collaboration with WebSockets
7. ⏳ Implement approval workflow UI

## Testing the Connection

```typescript
// In any frontend component
import { apiClient } from '@/services/apiClient';

// Test connection
async function testBackend() {
  try {
    const health = await apiClient.healthCheck();
    console.log('✓ Backend connected:', health);
  } catch (error) {
    console.error('✗ Backend connection failed:', error);
  }
}
```

---

**Summary**: Frontend and backend are now connected via REST API. The `apiClient.ts` provides a type-safe interface to all backend endpoints. Start both servers and test via the API documentation or Swagger UI.
