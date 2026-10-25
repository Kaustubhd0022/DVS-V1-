# Huggingface Integration - Frontend & Backend

## Architecture
Both frontend and backend now use Huggingface for AI inference.

```
┌──────────────────────────────┐
│   React Frontend             │
│   huggingfaceService.ts      │
└──────────────────────────────┘
           ↓
   Direct Huggingface API
   (Client-side inference)
           
   OR
           ↓
┌──────────────────────────────┐
│   FastAPI Backend            │
│   Agent Orchestration        │
│   (Server-side workflows)    │
└──────────────────────────────┘
           ↓
   Huggingface API
   (via langchain)
           ↓
┌──────────────────────────────┐
│   Supabase PostgreSQL        │
│   Project Intelligence       │
└──────────────────────────────┘
```

## Setup

### 1. Get Huggingface Token
1. Go to [huggingface.co](https://huggingface.co)
2. Sign up or log in
3. Go to Settings → Access Tokens
4. Create new token with **read** access
5. Copy token

### 2. Backend Configuration
```bash
cd server

# Edit .env with:
HUGGINGFACE_API_TOKEN=hf_your_token_here
HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1
```

### 3. Frontend Configuration
```bash
cd client

# .env.local already has:
VITE_HUGGINGFACE_API_TOKEN=hf_your_token_here
VITE_HUGGINGFACE_MODEL=mistralai/Mistral-7B-Instruct-v0.1
```

## Available Models

**Fast & Efficient:**
- `mistralai/Mistral-7B-Instruct-v0.1` - Balanced (7B params)
- `mistralai/Mistral-7B-v0.1` - Base model

**Larger/Better Quality:**
- `meta-llama/Llama-2-7b-chat-hf` - Meta's Llama
- `NousResearch/Nous-Hermes-2-Mistral-7B-DPO` - High quality

**Check model availability:**
```bash
# Test if model is available and ready
curl -s -H "Authorization: Bearer $HF_TOKEN" \
  https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1
```

## Usage

### Frontend - Direct Inference
```typescript
import { huggingfaceService } from '@/services/huggingfaceService';

// Simple text generation
const result = await huggingfaceService.generateText(
  'Write a short story about a detective'
);

// Story generation
const story = await huggingfaceService.generateStory(
  premise: 'A heist in a museum',
  tone: 'thrilling',
  length: 'medium'
);

// Character creation
const character = await huggingfaceService.generateCharacter(
  name: 'Detective Sarah',
  role: 'Protagonist',
  context: 'NYC, 2024'
);

// Dialogue writing
const dialogue = await huggingfaceService.generateDialogue(
  character1: 'Sarah (Detective)',
  character2: 'Jack (Suspect)',
  scenario: 'Interrogation room',
  tone: 'tense'
);

// Screenplay scenes
const scene = await huggingfaceService.generateScreenplay(
  sceneDescription: 'INT. MUSEUM - NIGHT. Sarah enters...',
  tone: 'cinematic'
);

// Text analysis
const analysis = await huggingfaceService.analyzeText(
  text: contentToAnalyze,
  analysisType: 'theme' // 'theme' | 'tone' | 'structure' | 'pacing'
);

// Brainstorming
const ideas = await huggingfaceService.brainstorm(
  topic: 'Film plot twists',
  numIdeas: 5
);

// Continuity checking
const continuity = await huggingfaceService.continuityCheck(
  context: 'Earlier in the story...',
  newContent: 'Now the character does...'
);
```

### Backend - Workflow Execution
```typescript
import { apiClient } from '@/services/apiClient';

// Execute backend AI workflows (also use Huggingface)
const result = await apiClient.executeWorkflow(
  projectId,
  'story',
  'Write opening scene for a heist thriller'
);

// Backend automatically:
// 1. Resolves context via ContextResolver
// 2. Calls Huggingface via langchain
// 3. Parses & validates output
// 4. Stores in database
// 5. Returns result
```

## Comparison: Frontend vs Backend

| Aspect | Frontend | Backend |
|--------|----------|---------|
| **Direct Calls** | ✅ Yes (huggingfaceService) | ❌ No |
| **Database Storage** | ❌ No | ✅ Yes (Supabase) |
| **Context Awareness** | Limited | ✅ Full (Project Intelligence) |
| **Versioning** | ❌ No | ✅ Yes (Artifact Versions) |
| **Approval Workflow** | ❌ No | ✅ Yes |
| **Continuity Checking** | Basic | ✅ Advanced |
| **Dependency Tracking** | ❌ No | ✅ Yes |
| **Use Case** | Quick inference, brainstorming | Complex workflows, persistence |

## Recommended Workflow

1. **Brainstorming/Quick Ideas** → Use `huggingfaceService` (Frontend)
   ```typescript
   const ideas = await huggingfaceService.brainstorm('story ideas', 5);
   ```

2. **Content Creation with Context** → Use `apiClient` (Backend)
   ```typescript
   const story = await apiClient.executeWorkflow(
     projectId, 'story', 'write opening'
   );
   ```

3. **Continuity & Impact Analysis** → Use `apiClient` (Backend)
   ```typescript
   const check = await apiClient.checkContinuity(
     projectId, artifactId, content
   );
   ```

## Rate Limits & Performance

**Huggingface API Limits:**
- Free tier: Rate limited, may queue requests
- Pro tier: Higher concurrency
- Model loading: First request takes 5-30s (model warming up)

**Optimization Tips:**
1. Cache frequently used models
2. Use smaller models for fast responses (Mistral-7B)
3. Batch requests when possible
4. Implement request queuing on backend

## Troubleshooting

### Model Loading (Queue Estimate)
If response is: `{"estimated_time": 45}`
- Model is loading on Huggingface's infrastructure
- Try again after waiting

### Token Invalid
```
Error: "401 Unauthorized"
```
- Check token at https://huggingface.co/settings/tokens
- Verify token has **read** access
- Regenerate if expired

### Model Not Available
```
Error: "Model not found"
```
- Check model name spelling
- Verify model exists: https://huggingface.co/models
- Some models require acceptance of terms

### Rate Limited
```
Error: "429 Too Many Requests"
```
- Implement exponential backoff retry
- Use backend workflows (better rate limits)
- Consider upgrading Huggingface tier

## Testing

```bash
# Test backend Huggingface integration
curl -X POST http://localhost:8000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "your-project-id",
    "workflow_type": "intent",
    "user_input": "Create a thriller story"
  }'

# Test frontend Huggingface service
# In browser console:
import { huggingfaceService } from '@/services/huggingfaceService';
huggingfaceService.generateText('Hello').then(console.log);
```

## Complete Setup Commands

```bash
# Backend
cd server
python main.py
# API at http://localhost:8000

# Frontend  
cd client
npm run dev
# App at http://localhost:5173

# Both servers ready to use Huggingface!
```

---

**Summary**: Frontend and backend now use the same Huggingface models for consistent AI capabilities. Use frontend service for quick tasks, backend workflows for persistent, context-aware generation with continuity checking.
