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
    if (options.body !== undefined && !headers.has('Content-Type')) {
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
    task?: string;
  }): Promise<{ content: string; model: string; latency_ms: number }> {
    return this.request(
      '/ai/generate',
      this.json('POST', {
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.maxTokens,
        json_mode: input.jsonMode ?? false,
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
