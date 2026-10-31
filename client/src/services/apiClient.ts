/**
 * API Client for TattvaCo Backend
 * Connects React frontend to FastAPI backend.
 *
 * Every endpoint except /health requires a Supabase access token. Register a token source
 * once at startup with `setAccessTokenProvider(() => session?.access_token ?? null)`.
 */

const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BACKEND_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_BACKEND_URL) ||
  'http://localhost:8000/api';
const REQUEST_TIMEOUT_MS = 30_000;
// Model calls (long generations, fallback model) legitimately take longer than normal requests.
const AI_TIMEOUT_MS = 150_000;

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, message: string, detail?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export interface BackendUser {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  status: string;
}

export interface BackendProject {
  id: string;
  organization_id: string;
  owner_id: string;
  title: string;
  format: string | null;
  genre: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type SourceTier = 'primary' | 'secondary';
/** wikipedia: Wikipedia API. primary / secondary: web search limited to that tier's approved sites. */
export type SourceScope = 'wikipedia' | SourceTier;

export interface SourceHit {
  title: string;
  url: string;
  snippet: string;
  source_tier: SourceTier;
}

export interface SourceDocument {
  id: string;
  project_id: string;
  provider: 'wikipedia' | 'web' | 'upload';
  source_tier: SourceTier;
  url: string | null;
  title: string;
  language: string | null;
  publisher: string | null;
  revision_id: string | null;
  revised_at: string | null;
  content_hash: string;
  text_length: number;
  extraction_method: 'wikipedia' | 'html' | 'pdf_text' | 'ocr' | 'docx' | 'plain_text' | null;
  file_name: string | null;
  retrieved_at: string;
}

/** Tesseract language packs installed on the server (server/app/services/ocr.py). */
export const OCR_LANGUAGES: Array<{ code: string; label: string }> = [
  { code: 'eng', label: 'English' }, { code: 'hin', label: 'Hindi' }, { code: 'mar', label: 'Marathi' },
  { code: 'san', label: 'Sanskrit' }, { code: 'ben', label: 'Bengali' }, { code: 'guj', label: 'Gujarati' },
  { code: 'pan', label: 'Punjabi' }, { code: 'tam', label: 'Tamil' }, { code: 'tel', label: 'Telugu' },
  { code: 'kan', label: 'Kannada' }, { code: 'mal', label: 'Malayalam' }, { code: 'ori', label: 'Odia' },
  { code: 'urd', label: 'Urdu' },
];

export interface BackendEvidence {
  id: string;
  project_id: string;
  document_id: string | null;
  source_url: string | null;
  publisher: string | null;
  claim: string;
  supporting_excerpt: string | null;
  excerpt_start: number | null;
  excerpt_end: number | null;
  validation_status: 'unverified' | 'quote_found' | 'attested' | 'verified' | 'disputed';
  source_kind: OfflineCitation['kind'] | null;
  source_tier: SourceTier | 'field' | null;
  citation: OfflineCitation | null;
  attested_by: string | null;
  attested_at: string | null;
  created_at: string;
}

/** The project parameters a research plan is generated from (server/app/schemas.py ResearchBrief). */
export interface ResearchBrief {
  title: string;
  premise?: string;
  subject?: string;
  genre?: string;
  themes: string[];
  tone?: string;
  format: { media?: string; episode_count?: number; audience?: string };
  setting: { description?: string; era?: string; time_range?: string; places: Array<{ name: string; address?: string }> };
  people: Array<{ name: string; role?: string; historical: boolean }>;
  language?: string;
  narrative_freedom: 'FACTUAL' | 'GROUNDED_HYBRID' | 'CREATIVE';
  evidence_requirement: 'STANDARD' | 'HIGH' | 'STRICT';
  known_facts: string[];
  open_questions: string[];
  suggested_areas: string[];
  user_questions: string[];
  uploaded_material?: string;
}

export type CoverageArea =
  | 'history_chronology' | 'people' | 'places_architecture' | 'art_craft_material'
  | 'ritual_festival_folklore' | 'language_dialect' | 'daily_life' | 'present_day_tourism'
  | 'disputed_accounts' | 'sensitivities';

export type ResearchTaskArea = CoverageArea | 'user_question' | 'open_question';

export interface ResearchTask {
  id: string;
  plan_id: string;
  position: number;
  area: ResearchTaskArea;
  question: string;
  rationale: string | null;
  triggered_by: string[];
  people: string[];
  places: string[];
  period: string | null;
  queries: Array<{ text: string; language: string }>;
  priority: 'high' | 'medium' | 'low';
  status: 'proposed' | 'removed' | 'approved' | 'running' | 'done';
  created_by: 'ai' | 'user';
}

export interface ResearchPlanDetail {
  id: string;
  project_id: string;
  status: 'proposed' | 'approved' | 'active';
  policy: {
    evidence_requirement: ResearchBrief['evidence_requirement'];
    narrative_freedom: ResearchBrief['narrative_freedom'];
    search_order: SourceTier[];
    documented_fact_rule: string;
    search_languages: string[];
    max_tasks: number;
  } | null;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  tasks: ResearchTask[];
}

/** Offline sources: what must be recorded for each kind (server/app/schemas.py). */
export type OfflineCitation =
  | { kind: 'book'; title: string; author: string; page: string; publisher?: string; year?: string; edition?: string }
  | {
      kind: 'interview'; informant: string; date: string; place: string; interviewer: string;
      consent_confirmed: boolean; recording_reference?: string; language?: string;
    }
  | { kind: 'field_visit'; place: string; date: string; observer: string; notes?: string }
  | { kind: 'archive_visit'; archive: string; record_reference: string; folio: string; date: string };

export interface BackendSnapshot {
  project_id: string;
  version: number;
  schema_version: number;
  data: Record<string, any>;
  updated_at: string | null;
}

type AccessTokenProvider = () => string | null | Promise<string | null>;

let accessTokenProvider: AccessTokenProvider = () => null;

export const setAccessTokenProvider = (provider: AccessTokenProvider): void => {
  accessTokenProvider = provider;
};

/** FastAPI errors are `{ detail: string }` or, for validation, `{ detail: [{ msg, loc }] }`. */
const describeError = (status: number, statusText: string, body: any): string => {
  const detail = body?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d: any) => `${(d.loc ?? []).slice(1).join('.')}: ${d.msg}`).join('; ');
  }
  return `${status} ${statusText}`.trim();
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs: number = REQUEST_TIMEOUT_MS
  ): Promise<T> {
    const headers = new Headers(options.headers);
    // FormData bodies (uploads) set their own multipart Content-Type with the boundary.
    if (options.body !== undefined && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    const token = await accessTokenProvider();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => undefined);
        throw new ApiError(
          response.status,
          describeError(response.status, response.statusText, body),
          body?.detail
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(0, 'Request timed out');
      }
      throw new ApiError(0, 'Could not reach the server');
    } finally {
      clearTimeout(timer);
    }
  }

  private json(method: string, body: unknown): RequestInit {
    return { method, body: JSON.stringify(body) };
  }

  // AI (server-side model access; the provider token never reaches the browser)
  async generate(input: {
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
    outputSchema?: object;
    task?: string;
  }): Promise<{ content: string; model: string; latency_ms: number; run_id?: string | null; data?: unknown }> {
    return this.request(
      '/ai/generate',
      this.json('POST', {
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.maxTokens,
        json_mode: input.jsonMode ?? false,
        output_schema: input.outputSchema,
        task: input.task,
      }),
      AI_TIMEOUT_MS
    );
  }

  async testAi(): Promise<{ success: boolean; message: string; latency_ms: number | null }> {
    return this.request('/ai/test', { method: 'POST' }, AI_TIMEOUT_MS);
  }

  async aiStatus(): Promise<{ configured: boolean; provider: string; model: string }> {
    return this.request('/ai/status');
  }

  // Health Check (public)
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health/');
  }

  // Current user. provisionMe is idempotent: call it after every sign-in.
  async getMe(): Promise<BackendUser> {
    return this.request('/me');
  }

  async provisionMe(): Promise<BackendUser> {
    return this.request('/me', { method: 'POST' });
  }

  // Organizations (read-only: the caller's own organization)
  async getOrganization(orgId: string) {
    return this.request(`/organizations/${orgId}`);
  }

  async listOrganizations() {
    return this.request('/organizations');
  }

  // Projects
  async listProjects(): Promise<BackendProject[]> {
    return this.request('/projects');
  }

  async createProject(title: string, format?: string, genre?: string): Promise<BackendProject> {
    return this.request('/projects', this.json('POST', { title, format, genre }));
  }

  async getProject(projectId: string): Promise<BackendProject> {
    return this.request(`/projects/${projectId}`);
  }

  // Project document (the whole frontend project, optimistic-concurrency versioned)
  async getSnapshot(projectId: string): Promise<BackendSnapshot> {
    return this.request(`/projects/${projectId}/snapshot`);
  }

  async saveSnapshot(
    projectId: string,
    baseVersion: number,
    data: Record<string, unknown>,
    schemaVersion = 1
  ): Promise<BackendSnapshot> {
    return this.request(
      `/projects/${projectId}/snapshot`,
      this.json('PUT', { data, base_version: baseVersion, schema_version: schemaVersion })
    );
  }

  async importProject(input: {
    id?: string;
    title: string;
    format?: string;
    genre?: string;
    data: Record<string, unknown>;
    schemaVersion?: number;
  }): Promise<{ project: BackendProject; snapshot: BackendSnapshot }> {
    return this.request(
      '/projects/import',
      this.json('POST', {
        id: input.id,
        title: input.title,
        format: input.format,
        genre: input.genre,
        data: input.data,
        schema_version: input.schemaVersion ?? 1,
      })
    );
  }

  async getProjectIntelligence(projectId: string) {
    return this.request(`/projects/${projectId}/intelligence`);
  }

  async updateProject(projectId: string, updates: Record<string, unknown>): Promise<BackendProject> {
    return this.request(`/projects/${projectId}`, this.json('PUT', updates));
  }

  async deleteProject(projectId: string) {
    return this.request(`/projects/${projectId}`, { method: 'DELETE' });
  }

  // Intent
  async createIntent(
    projectId: string,
    intent: string,
    knowns: Record<string, unknown>,
    unknowns: Record<string, unknown>,
    assumptions: string[]
  ) {
    return this.request(
      `/projects/${projectId}/intent`,
      this.json('POST', { intent, knowns, unknowns, assumptions })
    );
  }

  async getIntent(projectId: string) {
    return this.request(`/projects/${projectId}/intent`);
  }

  // Workflows
  async executeWorkflow(projectId: string, workflowType: string, userInput: string) {
    return this.request(
      '/workflows',
      this.json('POST', {
        project_id: projectId,
        workflow_type: workflowType,
        user_input: userInput,
      })
    );
  }

  async getWorkflowStatus(runId: string) {
    return this.request(`/workflows/${runId}`);
  }

  // Characters. Role, background, arc etc. live in the free-form `profile` object.
  async createCharacter(
    projectId: string,
    name: string,
    motivation: string,
    voice: string,
    profile: Record<string, unknown> = {}
  ) {
    return this.request(
      `/characters?project_id=${projectId}`,
      this.json('POST', { name, motivation, voice, profile })
    );
  }

  async getCharacter(characterId: string, projectId: string) {
    return this.request(`/characters/${characterId}?project_id=${projectId}`);
  }

  async listCharacters(projectId: string) {
    return this.request(`/characters?project_id=${projectId}`);
  }

  async updateCharacter(characterId: string, projectId: string, updates: Record<string, unknown>) {
    return this.request(
      `/characters/${characterId}?project_id=${projectId}`,
      this.json('PUT', updates)
    );
  }

  async deleteCharacter(characterId: string, projectId: string) {
    return this.request(`/characters/${characterId}?project_id=${projectId}`, { method: 'DELETE' });
  }

  // Stories
  async createStory(
    projectId: string,
    story: {
      premise?: string;
      logline?: string;
      synopsis?: string;
      themes?: string[];
      conflict?: string;
      beats?: Record<string, unknown>[];
    }
  ) {
    return this.request(`/stories?project_id=${projectId}`, this.json('POST', story));
  }

  async getStory(storyId: string, projectId: string) {
    return this.request(`/stories/${storyId}?project_id=${projectId}`);
  }

  async listStories(projectId: string) {
    return this.request(`/stories?project_id=${projectId}`);
  }

  // Research
  async createResearchPlan(projectId: string, questions: string[], scope?: string) {
    return this.request(
      `/research/plans?project_id=${projectId}`,
      this.json('POST', { questions, scope })
    );
  }

  async getResearchPlan(planId: string, projectId: string) {
    return this.request(`/research/plans/${planId}?project_id=${projectId}`);
  }

  async listResearchPlans(projectId: string) {
    return this.request(`/research/plans?project_id=${projectId}`);
  }

  // Research plans generated from the project brief, reviewed before any search runs
  async generateResearchPlan(projectId: string, brief: ResearchBrief, coverageAreas: CoverageArea[]): Promise<ResearchPlanDetail> {
    return this.request(
      `/research/plans/generate?project_id=${projectId}`,
      this.json('POST', { brief, coverage_areas: coverageAreas }),
      AI_TIMEOUT_MS
    );
  }

  async getResearchPlanDetail(projectId: string, planId: string): Promise<ResearchPlanDetail> {
    return this.request(`/research/plans/${planId}/detail?project_id=${projectId}`);
  }

  async addResearchTask(
    projectId: string,
    planId: string,
    input: { area: CoverageArea | 'user_question'; question: string; priority: ResearchTask['priority'] }
  ): Promise<ResearchTask> {
    return this.request(`/research/plans/${planId}/tasks?project_id=${projectId}`, this.json('POST', input));
  }

  async updateResearchTask(
    projectId: string,
    taskId: string,
    changes: Partial<Pick<ResearchTask, 'question' | 'priority' | 'queries'>> & { status?: 'proposed' | 'removed' }
  ): Promise<ResearchTask> {
    return this.request(`/research/tasks/${taskId}?project_id=${projectId}`, this.json('PATCH', changes));
  }

  async approveResearchPlan(projectId: string, planId: string): Promise<ResearchPlanDetail> {
    return this.request(`/research/plans/${planId}/approve?project_id=${projectId}`, { method: 'POST' });
  }

  // Research sources: search, fetch and store approved sources; evidence checked against them
  async searchSources(projectId: string, query: string, scope: SourceScope, language = 'en'): Promise<SourceHit[]> {
    const result = await this.request<{ results: SourceHit[] }>(
      `/research/sources/search?project_id=${projectId}`,
      this.json('POST', { query, scope, language })
    );
    return result.results;
  }

  async fetchSourceUrl(projectId: string, url: string): Promise<SourceDocument> {
    return this.request(`/research/sources/url?project_id=${projectId}`, this.json('POST', { url }), AI_TIMEOUT_MS);
  }

  async fetchWikipediaSource(projectId: string, title: string, language = 'en'): Promise<SourceDocument> {
    return this.request(`/research/sources?project_id=${projectId}`, this.json('POST', { title, language }));
  }

  async listSources(projectId: string, tier?: SourceTier): Promise<SourceDocument[]> {
    return this.request(`/research/sources?project_id=${projectId}${tier ? `&tier=${tier}` : ''}`);
  }

  async uploadSource(
    projectId: string,
    input: { file: File; title: string; publisher: string; declaredTier: SourceTier; rightsConfirmed: boolean; ocrLanguages: string }
  ): Promise<SourceDocument> {
    const form = new FormData();
    form.append('file', input.file);
    form.append('title', input.title);
    form.append('publisher', input.publisher);
    form.append('declared_tier', input.declaredTier);
    form.append('rights_confirmed', String(input.rightsConfirmed));
    form.append('ocr_languages', input.ocrLanguages);
    // OCR of a scanned PDF can take a while.
    return this.request(`/research/sources/upload?project_id=${projectId}`, { method: 'POST', body: form }, AI_TIMEOUT_MS);
  }

  async getSource(projectId: string, documentId: string): Promise<SourceDocument & { text: string }> {
    return this.request(`/research/sources/${documentId}?project_id=${projectId}`);
  }

  async createAttestedEvidence(
    projectId: string,
    input: { claim: string; excerpt: string; sourceTier: SourceTier; citation: OfflineCitation; attested: boolean }
  ): Promise<BackendEvidence> {
    return this.request(
      `/research/evidence/attested?project_id=${projectId}`,
      this.json('POST', {
        claim: input.claim,
        excerpt: input.excerpt,
        source_tier: input.sourceTier,
        citation: input.citation,
        attested: input.attested,
      })
    );
  }

  async createEvidence(
    projectId: string,
    input: { claim: string; documentId: string; supportingExcerpt: string; sourceType?: string }
  ): Promise<BackendEvidence> {
    return this.request(
      `/research/evidence?project_id=${projectId}`,
      this.json('POST', {
        claim: input.claim,
        document_id: input.documentId,
        supporting_excerpt: input.supportingExcerpt,
        source_type: input.sourceType ?? 'web',
      })
    );
  }

  // Analytics
  async checkContinuity(projectId: string, artifactId: string, content: string) {
    return this.request(
      `/analytics/${projectId}/continuity-check`,
      this.json('POST', { artifact_id: artifactId, content })
    );
  }

  async analyzeDependencyImpact(projectId: string, artifactId: string) {
    return this.request(`/analytics/${projectId}/dependency-impact/${artifactId}`);
  }

  async vectorSearch(projectId: string, query: string, artifactType?: string) {
    return this.request(
      `/analytics/${projectId}/vector-search`,
      this.json('POST', { query, artifact_type: artifactType, limit: 5 })
    );
  }

  async validateDependencies(projectId: string) {
    return this.request(`/analytics/${projectId}/dependencies/validate`);
  }
}

export const apiClient = new ApiClient();
