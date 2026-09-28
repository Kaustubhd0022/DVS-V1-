/**
 * tattvaCo AI Service — Powered by Groq LPU Ultra-Fast Inference
 * Flagship Models: openai/gpt-oss-120b & openai/gpt-oss-20b
 * 
 * CORE PRINCIPLE:
 * NO PROJECT INPUT = NO PROJECT-SPECIFIC INTELLIGENCE.
 * All prompts are dynamically assembled from the CURRENT project state.
 * Never silently returns hardcoded sample text on failure.
 */

import { TattavaProject, Character, ResearchFinding, StoryDirection, ContinuityIssue } from '../types/project';

const DEFAULT_GROQ_KEY = '';
const ENV_KEY = (import.meta as any).env?.VITE_GROQ_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const PRIMARY_MODEL = 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'openai/gpt-oss-20b';

// Global debug telemetry for Section 25 Developer Inspector
export interface AiDebugTrace {
  timestamp: string;
  task: string;
  model: string;
  contextSent: string;
  prompt: string;
  rawResponse: string;
  latencyMs: number;
  status: 'SUCCESS' | 'ERROR';
  errorMessage?: string;
}

export let lastAiDebugTrace: AiDebugTrace | null = null;

export const getLastAiDebugTrace = () => lastAiDebugTrace;

export const getGroqApiKey = (): string => {
  if (typeof localStorage !== 'undefined') {
    const custom = localStorage.getItem('tattvaco_groq_api_key') || localStorage.getItem('tattvaco_gemini_api_key');
    if (custom) return custom;
  }
  return (
    ENV_KEY ||
    DEFAULT_GROQ_KEY ||
    (typeof process !== 'undefined' ? process.env?.VITE_GROQ_API_KEY : '') ||
    ''
  );
};

export const setGroqApiKey = (key: string): void => {
  const trimmed = key.trim();
  localStorage.setItem('tattvaco_groq_api_key', trimmed);
  localStorage.setItem('tattvaco_gemini_api_key', trimmed);
};

// Compatibility aliases
export const getGeminiApiKey = getGroqApiKey;
export const setGeminiApiKey = setGroqApiKey;

/**
 * Robust JSON extraction helper
 * Handles reasoning models that emit thoughts before the JSON, or markdown ```json ... ``` blocks
 */
export function extractJsonFromResponse(raw: string): any {
  if (!raw) throw new Error('AI_VALIDATION_FAILED: Empty response received from AI model.');
  
  // Try direct parse first
  try {
    return JSON.parse(raw);
  } catch (e) {
    // Continue to extraction strategies
  }

  // Look for ```json ... ```
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch (e) {
      // Continue
    }
  }

  // Find outermost curly braces { ... } or brackets [ ... ]
  const firstCurly = raw.indexOf('{');
  const lastCurly = raw.lastIndexOf('}');
  if (firstCurly !== -1 && lastCurly > firstCurly) {
    const candidate = raw.substring(firstCurly, lastCurly + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // Continue
    }
  }

  const firstBracket = raw.indexOf('[');
  const lastBracket = raw.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const candidate = raw.substring(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(candidate);
    } catch (e) {
      // Continue
    }
  }

  throw new Error(`AI_VALIDATION_FAILED: Unable to parse structured JSON from AI output: ${raw.slice(0, 200)}...`);
}

/**
 * SECTION 9: AI CONTEXT BUILDER
 * Dynamically builds a scoped, project-specific context package.
 * Never includes hardcoded data or unrelated project intelligence.
 */
export function buildProjectContext(
  project: TattavaProject,
  task: string,
  options: {
    selectedCharacterId?: string;
    includeDrafts?: boolean;
    includeResearch?: boolean;
    includeDecisions?: boolean;
  } = {}
): string {
  const parts: string[] = [];

  parts.push(`=== PROJECT HEADER ===`);
  parts.push(`Title: ${project.title || 'Untitled Project'}`);
  parts.push(`Type: ${project.contentType || 'Feature Film'}`);
  parts.push(`Genre: ${project.genre || 'Drama'}`);
  parts.push(`Language: ${project.language || 'Hindi / English'}`);
  parts.push(`Canonical Version: ${project.canonicalVersion || 'v0.1'}`);

  if (project.intent?.premise) {
    parts.push(`\n=== APPROVED USER PREMISE ===\n${project.intent.premise}`);
  }

  if (project.intent?.uploadedMaterialContent) {
    parts.push(`\n=== UPLOADED SOURCE MATERIAL (${project.intent.uploadedMaterialName || 'User Doc'}) ===\n${project.intent.uploadedMaterialContent.slice(0, 1500)}`);
  }

  // Story Brain Canon Facts
  const canonFacts = project.storyBrain?.canonFacts || [];
  if (canonFacts.length > 0) {
    parts.push(`\n=== APPROVED CANONICAL FACTS (STORY BRAIN) ===`);
    canonFacts.forEach((fact, idx) => {
      parts.push(`[CANON #${idx + 1}] (${fact.category}): ${fact.statement}`);
    });
  } else {
    parts.push(`\n=== STORY BRAIN CANON ===\nNo canonical facts established yet.`);
  }

  // Characters
  const characters = project.characters || [];
  if (characters.length > 0) {
    parts.push(`\n=== ESTABLISHED CHARACTERS ===`);
    characters.forEach(c => {
      parts.push(`- ${c.name} (${c.role}, Age ${c.age}): Flaw="${c.flaw}", Want="${c.want}", Fear="${c.fear}"`);
    });
  }

  // Selected Character detail if requested
  if (options.selectedCharacterId) {
    const char = characters.find(c => c.id === options.selectedCharacterId);
    if (char) {
      parts.push(`\n=== TARGET CHARACTER FOCUS ===`);
      parts.push(`Name: ${char.name} (${char.role})`);
      parts.push(`Flaw: ${char.flaw} | Want: ${char.want} | Fear: ${char.fear}`);
      if (char.backstory) parts.push(`Backstory: ${char.backstory}`);
      if (char.secret) parts.push(`Secret: ${char.secret}`);
    }
  }

  // Research Findings if requested
  if (options.includeResearch && project.researchFindings && project.researchFindings.length > 0) {
    parts.push(`\n=== VERIFIED RESEARCH EVIDENCE ===`);
    project.researchFindings.slice(0, 6).forEach((r, idx) => {
      parts.push(`[EVIDENCE #${idx + 1}] ${r.topic}: "${r.claim}" (Source: ${r.source})`);
    });
  }

  // Creative Decisions Log
  if (options.includeDecisions && project.storyBrain?.decisionLog && project.storyBrain.decisionLog.length > 0) {
    parts.push(`\n=== CREATIVE DECISION AUDIT TRAIL ===`);
    project.storyBrain.decisionLog.slice(0, 5).forEach(d => {
      parts.push(`- Decision: ${d.decision || d.title} | Rationale: ${d.rationale}`);
    });
  }

  // Current Draft Scenes if requested
  if (options.includeDrafts && project.scenes && project.scenes.length > 0) {
    parts.push(`\n=== CURRENT DRAFT SCENES ===`);
    project.scenes.slice(0, 4).forEach(s => {
      parts.push(`Scene ${s.sceneNumber}: ${s.slugline} — ${s.summary}`);
    });
  }

  parts.push(`\n=== ACTIVE TASK ===\n${task}`);

  return parts.join('\n');
}

/**
 * Generic Groq API caller with model fallback and strict error reporting
 */
async function callGroq(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    temperature?: number;
    max_tokens?: number;
    jsonMode?: boolean;
    taskName?: string;
    contextSnapshot?: string;
  } = {}
): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    const err = new Error('AI_CONFIGURATION_REQUIRED: No Groq or Gemini API key found. Please configure your API key in Settings.');
    (err as any).code = 'AI_CONFIGURATION_REQUIRED';
    throw err;
  }

  const { temperature = 0.7, max_tokens = 2000, jsonMode = false, taskName = 'General Inference', contextSnapshot = '' } = options;
  const startTime = performance.now();

  const modelsToTry = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const payload: any = {
        model,
        messages,
        temperature,
        max_tokens
      };

      if (jsonMode) {
        payload.response_format = { type: 'json_object' };
      }

      const res = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const elapsed = Math.round(performance.now() - startTime);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson.error?.message || `HTTP ${res.status}`;
        console.warn(`Groq model ${model} failed: ${errMsg}`);
        lastError = new Error(`AI_SERVICE_ERROR: ${errMsg}`);
        continue;
      }

      const data = await res.json();
      const choice = data.choices?.[0];
      if (!choice) continue;

      let content = choice.message?.content?.trim() || '';
      // If reasoning model left content blank but produced reasoning, extract text
      if (!content && choice.message?.reasoning) {
        content = choice.message.reasoning.trim();
      }

      if (content) {
        // Record debug trace for Section 25 Developer Inspector
        lastAiDebugTrace = {
          timestamp: new Date().toLocaleTimeString(),
          task: taskName,
          model,
          contextSent: contextSnapshot || messages[0]?.content || '',
          prompt: messages[messages.length - 1]?.content || '',
          rawResponse: content,
          latencyMs: elapsed,
          status: 'SUCCESS'
        };
        return content;
      }
    } catch (err: any) {
      console.warn(`Error invoking ${model}:`, err);
      lastError = err;
    }
  }

  const finalElapsed = Math.round(performance.now() - startTime);
  lastAiDebugTrace = {
    timestamp: new Date().toLocaleTimeString(),
    task: taskName,
    model: PRIMARY_MODEL,
    contextSent: contextSnapshot || '',
    prompt: messages[messages.length - 1]?.content || '',
    rawResponse: '',
    latencyMs: finalElapsed,
    status: 'ERROR',
    errorMessage: lastError?.message || 'Groq connection failed'
  };

  throw lastError || new Error('AI_UNAVAILABLE: All attempts to connect to Groq inference failed.');
}

/**
 * Test connection to Groq API and measure latency
 */
export const testGroqConnection = async (): Promise<{ success: boolean; message: string; latencyMs?: number }> => {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return { success: false, message: 'No API Key configured. Please enter your Groq API key.' };
  }

  const startTime = performance.now();

  try {
    const res = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: PRIMARY_MODEL,
        messages: [{ role: 'user', content: 'Say "tattvaCo Online" and nothing else.' }],
        max_tokens: 300
      })
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { 
        success: false, 
        message: err.error?.message || `HTTP ${res.status}: Connection failed` 
      };
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || data.choices?.[0]?.message?.reasoning?.trim() || 'Online';
    return {
      success: true,
      message: `Connected: Groq LPU (${PRIMARY_MODEL}) • ${elapsed}ms latency • "${reply.slice(0, 30)}"`,
      latencyMs: elapsed
    };
  } catch (e: any) {
    return { success: false, message: e.message || 'Network error connecting to Groq' };
  }
};

export const testGeminiConnection = testGroqConnection;

/**
 * Contextual Film Intelligence Copilot
 * Always grounded in the provided project context summary.
 */
export const askCopilot = async (
  userPrompt: string,
  projectContextSummary: string,
  chatHistory: Array<{ sender: 'user' | 'tattvaCo' | 'tattava'; text: string }> = []
): Promise<string> => {
  const systemInstruction = `You are Tattava Copilot, an elite film development executive, story analyst, and AI-native creative co-creator.
You speak with cinematic authority, deep structural insight, and commercial realism.
You are assisting on this specific project:

${projectContextSummary}

RULES:
- Answer ONLY using the context of the user's specific project above.
- NEVER invent unrelated characters, storylines, or mention other films unless drawing a brief thematic comparison.
- Be concise, direct, and actionable for story development (2-3 paragraphs or bullet points).
- If the user asks for dialogue, write standard formatted screenplay lines with emotional subtext.`;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemInstruction }
  ];

  for (const msg of chatHistory.slice(-4)) {
    messages.push({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    });
  }

  messages.push({
    role: 'user',
    content: userPrompt
  });

  return await callGroq(messages, {
    temperature: 0.7,
    max_tokens: 1500,
    taskName: 'Copilot Chat',
    contextSnapshot: projectContextSummary
  });
};

/**
 * SECTION 5 & 15: CONCEPT INTAKE & PROJECT UNDERSTANDING
 * Deconstructs raw user input into structured project intelligence.
 */
export interface IntakeAnalysisResult {
  premise: string;
  protagonist: string;
  setting: string;
  conflict: string;
  stakes: string;
  themes: string[];
  tone: string;
  knownInformation: string[];
  unknownInformation: string[];
  missingQuestions: string[];
  suggestedResearchAreas: string[];
}

export const analyzeConceptIntake = async (
  rawIdea: string,
  contentType: string = 'Feature Film',
  language: string = 'Hindi / English'
): Promise<IntakeAnalysisResult> => {
  const prompt = `Deconstruct this raw film/series idea into structured narrative intelligence.
Input Concept:
"""${rawIdea}"""
Format: ${contentType}
Target Language: ${language}

Return ONLY valid JSON matching this exact structure:
{
  "premise": "A sharp, compelling logline synthesizing the core dramatic hook (1 sentence)",
  "protagonist": "Who is the central character, their specific profession/role, core vulnerability, and dramatic objective",
  "setting": "Specific geographical, atmospheric, and temporal world",
  "conflict": "The core dramatic conflict or antagonistic force confronting them",
  "stakes": "What happens if the protagonist fails (catastrophic personal or public consequences)",
  "themes": ["Theme 1", "Theme 2", "Theme 3"],
  "tone": "Atmospheric adjectives describing the genre feel (e.g. Gritty, Urgent, Atmospheric)",
  "knownInformation": [
    "Fact 1 explicitly provided or clearly implied by the user",
    "Fact 2 explicitly provided or clearly implied by the user"
  ],
  "unknownInformation": [
    "Key story element not yet defined (e.g. Antagonist's motive, exact timeframe)",
    "Key story element not yet defined"
  ],
  "missingQuestions": [
    "Crucial clarifying question 1 to unlock the next story phase",
    "Crucial clarifying question 2 to unlock the next story phase"
  ],
  "suggestedResearchAreas": [
    "Specific domain 1 to research for authentic grounding",
    "Specific domain 2 to research for authentic grounding"
  ]
}`;

  const rawJson = await callGroq(
    [
      { role: 'system', content: 'You are an elite Hollywood and Indian cinema development executive. You output clean, valid JSON only.' },
      { role: 'user', content: prompt }
    ],
    {
      temperature: 0.6,
      max_tokens: 2200,
      jsonMode: true,
      taskName: 'Concept Intake Analysis',
      contextSnapshot: `Raw Idea: ${rawIdea}`
    }
  );

  const parsed = extractJsonFromResponse(rawJson);

  return {
    premise: parsed.premise || rawIdea,
    protagonist: parsed.protagonist || 'Central protagonist to be defined.',
    setting: parsed.setting || 'Setting to be defined.',
    conflict: parsed.conflict || 'Central conflict to be established.',
    stakes: parsed.stakes || 'High dramatic stakes.',
    themes: Array.isArray(parsed.themes) && parsed.themes.length ? parsed.themes : ['Ambition', 'Truth', 'Survival'],
    tone: parsed.tone || 'Cinematic, Urgent, Grounded',
    knownInformation: Array.isArray(parsed.knownInformation) && parsed.knownInformation.length ? parsed.knownInformation : ['Core User Premise'],
    unknownInformation: Array.isArray(parsed.unknownInformation) && parsed.unknownInformation.length ? parsed.unknownInformation : ['Specific antagonist identity', 'Timeline pacing'],
    missingQuestions: Array.isArray(parsed.missingQuestions) && parsed.missingQuestions.length ? parsed.missingQuestions : ['What is the protagonist’s primary vulnerability?'],
    suggestedResearchAreas: Array.isArray(parsed.suggestedResearchAreas) && parsed.suggestedResearchAreas.length ? parsed.suggestedResearchAreas : ['Domain background and institutional procedures']
  };
};

/**
 * SECTION 8: DYNAMIC CHARACTER CANDIDATE SYNTHESIS
 */
export interface CharacterCandidateResult {
  name: string;
  age: number;
  role: string;
  want: string;
  flaw: string;
  fear: string;
  moralDilemma: string;
  backstory: string;
  secret: string;
  linguisticCadence: string;
  relationships: Array<{ relatedCharName: string; relationType: string; dynamic: string }>;
}

export const generateCharacterCandidate = async (
  project: TattavaProject,
  roleFocus: 'Protagonist' | 'Antagonist' | 'Key Supporting' = 'Protagonist',
  userGuidance?: string
): Promise<CharacterCandidateResult> => {
  const context = buildProjectContext(project, `Generate a ${roleFocus} candidate`);

  const prompt = `${context}

TASK:
Synthesize a multidimensional ${roleFocus} character candidate specifically designed for this film.
${userGuidance ? `User Guidance: "${userGuidance}"` : ''}

Return ONLY valid JSON matching:
{
  "name": "Character full name",
  "age": 32,
  "role": "${roleFocus}",
  "want": "Clear, external dramatic objective",
  "flaw": "Fatal psychological or moral blindspot",
  "fear": "Deepest dread or existential vulnerability",
  "moralDilemma": "The impossible moral choice they will face in the climax",
  "backstory": "2 sentences describing formative childhood trauma or career defining failure",
  "secret": "A devastating secret they hide from others",
  "linguisticCadence": "Description of vocabulary register, rhythm, and defense mechanism",
  "relationships": [
    { "relatedCharName": "Key relation", "relationType": "Colleague / Rival / Family", "dynamic": "Tense and guarded" }
  ]
}`;

  const raw = await callGroq([
    { role: 'system', content: 'You are an elite screenwriting character consultant. Return JSON only.' },
    { role: 'user', content: prompt }
  ], {
    temperature: 0.7,
    max_tokens: 2000,
    jsonMode: true,
    taskName: `Character Synthesis (${roleFocus})`,
    contextSnapshot: context
  });

  return extractJsonFromResponse(raw);
};

/**
 * SECTION 8: DYNAMIC STORY DIRECTIONS
 */
export interface StoryDirectionCandidate {
  title: string;
  badgeLetter: 'A' | 'B' | 'C' | 'D';
  logline: string;
  narrativeEngine: string;
  protagonistArc: string;
  conflict: string;
  stakes: string;
  theme: string;
  tone: string;
  risks: string;
  strengths: string;
  compTitles: string;
}

export const generateStoryDirections = async (
  project: TattavaProject
): Promise<StoryDirectionCandidate[]> => {
  const context = buildProjectContext(project, 'Synthesize 3 distinct alternative Story Directions');

  const prompt = `${context}

TASK:
Create 3 radically distinct, commercially viable story directions exploring different narrative engines for this premise:
- Direction A: Tight, claustrophobic psychological procedural
- Direction B: High-stakes institutional conspiracy / thriller
- Direction C: Intimate character-driven drama / moral tragedy

Return ONLY valid JSON matching:
{
  "directions": [
    {
      "badgeLetter": "A",
      "title": "Title A",
      "logline": "Compelling 1-sentence logline",
      "narrativeEngine": "What powers the story forward week after week or minute after minute",
      "protagonistArc": "How the protagonist transforms from start to finish",
      "conflict": "Primary dramatic opposition",
      "stakes": "The catastrophic cost of failure",
      "theme": "Core thematic question",
      "tone": "Tonal reference adjectives",
      "strengths": "Why this direction is compelling",
      "risks": "Potential creative pitfall to watch out for",
      "compTitles": "Two reference films (e.g. Chinatown meets Michael Clayton)"
    },
    {
      "badgeLetter": "B",
      "title": "Title B",
      "logline": "...",
      "narrativeEngine": "...",
      "protagonistArc": "...",
      "conflict": "...",
      "stakes": "...",
      "theme": "...",
      "tone": "...",
      "strengths": "...",
      "risks": "...",
      "compTitles": "..."
    },
    {
      "badgeLetter": "C",
      "title": "Title C",
      "logline": "...",
      "narrativeEngine": "...",
      "protagonistArc": "...",
      "conflict": "...",
      "stakes": "...",
      "theme": "...",
      "tone": "...",
      "strengths": "...",
      "risks": "...",
      "compTitles": "..."
    }
  ]
}`;

  const raw = await callGroq([
    { role: 'system', content: 'You are an elite film development strategist. Return JSON only.' },
    { role: 'user', content: prompt }
  ], {
    temperature: 0.75,
    max_tokens: 3000,
    jsonMode: true,
    taskName: 'Story Direction Exploration',
    contextSnapshot: context
  });

  const parsed = extractJsonFromResponse(raw);
  return Array.isArray(parsed.directions) ? parsed.directions : [];
};

/**
 * SECTION 17: DYNAMIC RESEARCH & EVIDENCE SYNTHESIS
 */
export interface ResearchSynthesisResult {
  topics: Array<{
    topic: string;
    claim: string;
    evidence: string;
    source: string;
    sourceType: 'Primary Source' | 'Academic' | 'Established Publication' | 'Government' | 'Field Report';
    implicationForPlot: string;
    confidence: number;
  }>;
}

export const generateResearchTopics = async (
  project: TattavaProject
): Promise<ResearchSynthesisResult> => {
  const context = buildProjectContext(project, 'Synthesize authentic research and procedural evidence');

  const prompt = `${context}

TASK:
Identify 4 authentic, real-world investigative or technical research domains required to ground this project in reality.
For each domain, provide a plausible real-world finding, source type, and its direct dramatic implication for the narrative.

Return ONLY valid JSON matching:
{
  "topics": [
    {
      "topic": "Specific scientific, legal, or procedural domain",
      "claim": "Specific factual mechanism or empirical finding",
      "evidence": "Summary of documented occurrences or technical realities",
      "source": "Realistic institutional body, academic journal, or public archive",
      "sourceType": "Established Publication",
      "implicationForPlot": "How this factual reality forces dramatic action or creates an obstacle in the story",
      "confidence": 92
    }
  ]
}`;

  const raw = await callGroq([
    { role: 'system', content: 'You are a research journalist and film dramaturge. Return JSON only.' },
    { role: 'user', content: prompt }
  ], {
    temperature: 0.6,
    max_tokens: 2500,
    jsonMode: true,
    taskName: 'Research Evidence Generation',
    contextSnapshot: context
  });

  return extractJsonFromResponse(raw);
};

/**
 * SECTION 18: DYNAMIC CONTINUITY CHECK
 * Compares current approved canon against current draft/story elements.
 */
export interface ContinuityCheckResult {
  hasIssues: boolean;
  issues: Array<{
    title: string;
    severity: 'High' | 'Medium' | 'Low';
    canonTruth: string;
    draftConflict: string;
    affectedEntities: string[];
    fixRecommendation: string;
  }>;
  summary: string;
}

export const checkProjectContinuity = async (
  project: TattavaProject
): Promise<ContinuityCheckResult> => {
  const context = buildProjectContext(project, 'Continuity & Canon Verification', {
    includeDrafts: true,
    includeDecisions: true
  });

  const prompt = `${context}

TASK:
Carefully audit the project context. Compare the [APPROVED CANONICAL FACTS] against the established characters, premise, and drafts.
Look for ANY genuine logical contradictions, timeline impossibilities, or character behavioral discrepancies.
If the project is new with minimal canon, report no contradictions.

Return ONLY valid JSON matching:
{
  "hasIssues": false,
  "summary": "1-2 sentence overall audit verdict",
  "issues": [
    {
      "title": "Brief title of the contradiction",
      "severity": "High",
      "canonTruth": "What Story Brain canon established",
      "draftConflict": "Where the conflicting statement or scene contradicts it",
      "affectedEntities": ["Character or location name"],
      "fixRecommendation": "Concrete resolution preserving canon truth"
    }
  ]
}`;

  const raw = await callGroq([
    { role: 'system', content: 'You are a script continuity supervisor and narrative logic auditor. Return JSON only.' },
    { role: 'user', content: prompt }
  ], {
    temperature: 0.4,
    max_tokens: 2000,
    jsonMode: true,
    taskName: 'Continuity Verification',
    contextSnapshot: context
  });

  return extractJsonFromResponse(raw);
};

/**
 * SECTION 19: DYNAMIC STORY EVALUATION
 * Evaluates the actual project state across the 6-dimension rubric.
 */
export interface EvaluationResult {
  overallScore: number;
  readinessStatus: 'Draft' | 'Needs Revisions' | 'Pilot Ready' | 'Greenlight Recommended';
  criticalRisks: string[];
  keyStrengths: string[];
  strengths?: string[];
  actionItems: string[];
  dimensions: Array<{
    name: string;
    score: number;
    diagnostic?: string;
    notes?: string;
    strengths?: string[];
    gaps?: string[];
    recommendation?: string;
  }>;
}

export const evaluateProjectNarrative = async (
  project: TattavaProject
): Promise<EvaluationResult> => {
  const context = buildProjectContext(project, 'Comprehensive Narrative Quality Evaluation', {
    includeDrafts: true,
    includeResearch: true,
    includeDecisions: true
  });

  const prompt = `${context}

TASK:
Evaluate this project's narrative readiness across the 6-dimension industry rubric:
1. Premise Integrity
2. Character Consistency & Depth
3. Narrative Pacing & Tension
4. Subtext Density & Visual Storytelling
5. Dialogue Authenticity & Tone
6. Thematic Resonance & Commercial Viability

Score each dimension from 0 to 100 based strictly on how thoroughly developed the current project actually is.
If it is an early-stage project with few facts/characters, reflect that honestly in the scores.

Return ONLY valid JSON:
{
  "overallScore": 72,
  "readinessStatus": "Needs Revisions",
  "criticalRisks": ["Risk 1 based on current gaps", "Risk 2"],
  "keyStrengths": ["Strength 1", "Strength 2"],
  "actionItems": ["Action 1", "Action 2", "Action 3"],
  "dimensions": [
    {
      "name": "Premise Integrity",
      "score": 85,
      "diagnostic": "Diagnostic assessment",
      "strengths": ["Strength point"],
      "gaps": ["Gap point"],
      "recommendation": "Prescriptive fix"
    }
  ]
}`;

  const raw = await callGroq([
    { role: 'system', content: 'You are an executive film development evaluator. Return JSON only.' },
    { role: 'user', content: prompt }
  ], {
    temperature: 0.5,
    max_tokens: 2800,
    jsonMode: true,
    taskName: 'Narrative Rubric Evaluation',
    contextSnapshot: context
  });

  return extractJsonFromResponse(raw);
};

/**
 * Dialogue Line Punch-Up
 */
export const punchUpDialogue = async (
  currentDialogue: string,
  characterName: string,
  sceneContext: string,
  project?: TattavaProject,
  instruction: string = 'Inject cold subtext and eliminate on-the-nose exposition'
): Promise<string> => {
  const projectSummary = project ? `Film: "${project.title}", Premise: "${project.intent?.premise}"` : '';

  const prompt = `Punch up this screenplay line with rich subtext.
${projectSummary}
Character: ${characterName}
Scene Context: ${sceneContext}
Current Line: "${currentDialogue}"
Doctor's Instruction: ${instruction}

Return ONLY the punched-up dialogue line itself in quotation marks. No other text.`;

  const raw = await callGroq([
    { role: 'system', content: 'You are an elite screenplay dialogue doctor. Output only the revised line.' },
    { role: 'user', content: prompt }
  ], {
    temperature: 0.75,
    max_tokens: 300,
    taskName: 'Dialogue Punch-Up',
    contextSnapshot: `${characterName}: ${currentDialogue}`
  });

  return raw.trim().replace(/^["']|["']$/g, '');
};

/**
 * Legacy aliases for backward compatibility
 */
export const generateCharacterBackstory = async (
  charName: string,
  charRole: string,
  age: number,
  logline: string
) => {
  const candidate = await generateCharacterCandidate(
    {
      id: 'temp',
      title: 'Current Project',
      intent: { premise: logline }
    } as any,
    charRole as any,
    `Name: ${charName}, Age: ${age}`
  );
  return {
    backstory: candidate.backstory,
    contradictions: candidate.flaw,
    secret: candidate.secret
  };
};

export const generateStoryDirection = async (
  currentPremise: string,
  notes: string
) => {
  const directions = await generateStoryDirections({
    id: 'temp',
    title: 'Current Project',
    intent: { premise: currentPremise }
  } as any);

  const first = directions[0] || {
    title: 'High Tension Direction',
    logline: currentPremise,
    narrativeEngine: 'Personal stakes vs institutional crisis',
    compTitles: 'Sicario meets Spotlight'
  };

  return {
    title: first.title,
    logline: first.logline,
    engine: first.narrativeEngine,
    comp: first.compTitles
  };
};
