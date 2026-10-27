import { useCallback, useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { ApiError, apiClient } from '../services/apiClient';
import type { TattavaProject } from '../types/project';

/**
 * Keeps the user's projects in the backend (one versioned JSON document per project).
 *
 * - On sign-in the project list is loaded from the server.
 * - Edits are saved automatically ~1.5 s after the last change, with optimistic concurrency:
 *   a save names the version it is based on and is refused (409) if someone saved first.
 * - Projects that only exist in this browser's localStorage are imported on request, never
 *   automatically, and the local copy is left in place.
 * - Demo projects are never uploaded.
 */

const SAVE_DEBOUNCE_MS = 1500;
const RETRY_MS = 10_000;
const IMPORTED_KEY = 'tattava_imported_v1';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value: string): boolean => UUID_RE.test(value);

export type SyncStatus = 'local' | 'loading' | 'idle' | 'pending' | 'saving' | 'error' | 'conflict';

export interface SyncState {
  status: SyncStatus;
  message?: string;
  /** True once the server's project list has been loaded. */
  loaded: boolean;
  /** Projects found in this browser's localStorage that have not been imported yet. */
  pendingLocalImport: number;
  /** Projects whose server copy changed since this tab loaded them. */
  conflictIds: string[];
}

interface Options {
  /** Signed in and backend user ready. */
  remote: boolean;
  userId: string | null;
  projects: TattavaProject[];
  setProjects: Dispatch<SetStateAction<TattavaProject[]>>;
  setCurrentProjectId: Dispatch<SetStateAction<string | null>>;
  normalize: (project: TattavaProject) => TattavaProject;
  localStorageKey: string;
}

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const initialState: SyncState = {
  status: 'local',
  loaded: false,
  pendingLocalImport: 0,
  conflictIds: [],
};

export function useProjectSync({
  remote,
  userId,
  projects,
  setProjects,
  setCurrentProjectId,
  normalize,
  localStorageKey,
}: Options) {
  const [sync, setSync] = useState<SyncState>(initialState);

  const versions = useRef(new Map<string, number>());
  const lastSaved = useRef(new Map<string, string>());
  const conflicts = useRef(new Set<string>());
  const projectsRef = useRef(projects);
  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scanning = useRef(false);
  const rescan = useRef(false);
  const wasRemote = useRef(false);
  const loadedRef = useRef(false);
  // Set right before we replace projects with server data, so that update is not shown as "unsaved".
  const skipPending = useRef(false);
  projectsRef.current = projects;

  const patch = useCallback((changes: Partial<SyncState>) => {
    setSync(prev => ({ ...prev, ...changes }));
  }, []);

  const countPendingLocal = useCallback((): number => {
    const imported = readJson<Record<string, string>>(IMPORTED_KEY, {});
    return readJson<TattavaProject[]>(localStorageKey, []).filter(
      p => !p.isDemo && !imported[p.id]
    ).length;
  }, [localStorageKey]);

  // ---- load on sign-in, reset on sign-out -------------------------------------------------
  useEffect(() => {
    if (!remote) {
      if (wasRemote.current) {
        wasRemote.current = false;
        loadedRef.current = false;
        versions.current.clear();
        lastSaved.current.clear();
        conflicts.current.clear();
        setProjects(prev => prev.filter(p => p.isDemo));
        setCurrentProjectId(null);
      }
      setSync(initialState);
      return;
    }

    wasRemote.current = true;
    let cancelled = false;
    setSync({ ...initialState, status: 'loading' });

    (async () => {
      try {
        const list = await apiClient.listProjects();
        const results = await Promise.allSettled(list.map(p => apiClient.getSnapshot(p.id)));
        if (cancelled) return;

        versions.current.clear();
        lastSaved.current.clear();
        conflicts.current.clear();

        const loaded: TattavaProject[] = [];
        let failed = 0;
        results.forEach((result, index) => {
          const id = list[index].id;
          if (result.status === 'fulfilled') {
            const project = normalize({ ...(result.value.data as TattavaProject), id });
            versions.current.set(id, result.value.version);
            lastSaved.current.set(id, JSON.stringify(project));
            loaded.push(project);
          } else if (!(result.reason instanceof ApiError && result.reason.status === 404)) {
            failed += 1;
          }
        });

        loadedRef.current = true;
        skipPending.current = true;
        setProjects(prev => [...prev.filter(p => p.isDemo), ...loaded]);
        setCurrentProjectId(loaded[0]?.id ?? null);
        setSync({
          status: failed ? 'error' : 'idle',
          message: failed ? `${failed} project(s) could not be loaded` : undefined,
          loaded: true,
          pendingLocalImport: countPendingLocal(),
          conflictIds: [],
        });
      } catch (error) {
        if (cancelled) return;
        console.warn('Backend listProjects unreachable, falling back to local storage projects:', error);
        const localProjects = readJson<TattavaProject[]>(localStorageKey, []).map(p => normalize(p));
        loadedRef.current = true;
        skipPending.current = true;
        setProjects(prev => {
          const demos = prev.filter(p => p.isDemo);
          return localProjects.length > 0 ? [...demos, ...localProjects] : prev;
        });
        setSync({
          ...initialState,
          status: 'idle',
          loaded: true,
          message: undefined,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // normalize/setters are stable for the lifetime of the provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remote, userId]);

  // ---- save -------------------------------------------------------------------------------
  const saveOne = async (project: TattavaProject, json: string): Promise<boolean> => {
    const version = versions.current.get(project.id);
    try {
      if (version === undefined) {
        const created = await apiClient.importProject({
          id: project.id,
          title: project.title?.trim() || 'Untitled project',
          format: project.contentType,
          genre: project.genre,
          data: project as unknown as Record<string, unknown>,
        });
        versions.current.set(project.id, created.snapshot.version);
      } else {
        const saved = await apiClient.saveSnapshot(
          project.id,
          version,
          project as unknown as Record<string, unknown>
        );
        versions.current.set(project.id, saved.version);
      }
      lastSaved.current.set(project.id, json);
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        conflicts.current.add(project.id);
        return true; // handled: surfaced as a conflict, not retried
      }
      patch({
        status: 'error',
        message: error instanceof Error ? error.message : 'Could not save',
      });
      return false;
    }
  };

  const scan = useCallback(async () => {
    if (scanning.current) {
      rescan.current = true;
      return;
    }
    scanning.current = true;
    let ok = true;
    try {
      // Give any project that still has a local-only id a real one; the state change re-triggers a scan.
      const needsId = projectsRef.current.filter(p => !p.isDemo && !isUuid(p.id));
      if (needsId.length) {
        const mapping = new Map(needsId.map(p => [p.id, crypto.randomUUID()]));
        setProjects(prev => prev.map(p => (mapping.has(p.id) ? { ...p, id: mapping.get(p.id)! } : p)));
        setCurrentProjectId(current => (current && mapping.has(current) ? mapping.get(current)! : current));
        return;
      }

      patch({ status: 'saving', message: undefined });
      for (const project of projectsRef.current) {
        if (project.isDemo || conflicts.current.has(project.id)) continue;
        const json = JSON.stringify(project);
        if (lastSaved.current.get(project.id) === json) continue;
        if (!(await saveOne(project, json))) {
          ok = false;
          break;
        }
      }

      if (conflicts.current.size) {
        patch({
          status: 'conflict',
          message: 'A project was changed elsewhere. Reload it to continue saving.',
          conflictIds: [...conflicts.current],
        });
      } else if (ok) {
        patch({ status: 'idle', message: undefined, conflictIds: [] });
      } else {
        scanTimer.current = setTimeout(scan, RETRY_MS);
      }
    } finally {
      scanning.current = false;
      if (rescan.current) {
        rescan.current = false;
        scanTimer.current = setTimeout(scan, SAVE_DEBOUNCE_MS);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!remote || !loadedRef.current) return;
    if (scanTimer.current) clearTimeout(scanTimer.current);
    scanTimer.current = setTimeout(scan, SAVE_DEBOUNCE_MS);
    if (skipPending.current) skipPending.current = false;
    else setSync(prev => (prev.status === 'idle' ? { ...prev, status: 'pending' } : prev));
    return () => {
      if (scanTimer.current) clearTimeout(scanTimer.current);
    };
  }, [projects, remote, sync.loaded, scan]);

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (remote && (sync.status === 'pending' || sync.status === 'saving' || sync.status === 'error')) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [remote, sync.status]);

  // ---- actions ----------------------------------------------------------------------------
  /** Upload projects found in this browser's localStorage. Local copies are kept. */
  const importLocalProjects = useCallback(async (): Promise<number> => {
    const imported = readJson<Record<string, string>>(IMPORTED_KEY, {});
    const candidates = readJson<TattavaProject[]>(localStorageKey, []).filter(
      p => !p.isDemo && !imported[p.id]
    );

    const added: TattavaProject[] = [];
    for (const local of candidates) {
      const id = crypto.randomUUID();
      const project = normalize({ ...local, id });
      try {
        const created = await apiClient.importProject({
          id,
          title: project.title?.trim() || 'Untitled project',
          format: project.contentType,
          genre: project.genre,
          data: project as unknown as Record<string, unknown>,
        });
        versions.current.set(id, created.snapshot.version);
        lastSaved.current.set(id, JSON.stringify(project));
        imported[local.id] = id;
        added.push(project);
      } catch (error) {
        patch({
          status: 'error',
          message: `Could not import "${local.title}": ${error instanceof Error ? error.message : 'unknown error'}`,
        });
        break;
      }
    }

    try {
      localStorage.setItem(IMPORTED_KEY, JSON.stringify(imported));
    } catch {
      /* private mode: the import still succeeded on the server */
    }
    if (added.length) {
      skipPending.current = true;
      setProjects(prev => [...added, ...prev]);
    }
    patch({ pendingLocalImport: countPendingLocal() });
    return added.length;
  }, [localStorageKey, normalize, patch, setProjects, countPendingLocal]);

  /** Discard this tab's copy of a project and load the server's version. */
  const reloadProject = useCallback(
    async (projectId: string) => {
      try {
        const snapshot = await apiClient.getSnapshot(projectId);
        const project = normalize({ ...(snapshot.data as TattavaProject), id: projectId });
        versions.current.set(projectId, snapshot.version);
        lastSaved.current.set(projectId, JSON.stringify(project));
        conflicts.current.delete(projectId);
        skipPending.current = true;
        setProjects(prev => prev.map(p => (p.id === projectId ? project : p)));
        patch({
          status: conflicts.current.size ? 'conflict' : 'idle',
          message: undefined,
          conflictIds: [...conflicts.current],
        });
      } catch (error) {
        patch({ status: 'error', message: error instanceof Error ? error.message : 'Could not reload' });
      }
    },
    [normalize, patch, setProjects]
  );

  /** Remove a project on the server (soft delete) and stop tracking it. */
  const forgetProject = useCallback(
    (projectId: string) => {
      const known = versions.current.has(projectId);
      versions.current.delete(projectId);
      lastSaved.current.delete(projectId);
      conflicts.current.delete(projectId);
      if (remote && known) {
        apiClient.deleteProject(projectId).catch(error => {
          patch({
            status: 'error',
            message: error instanceof Error ? error.message : 'Could not delete project',
          });
        });
      }
    },
    [remote, patch]
  );

  return { sync, importLocalProjects, reloadProject, forgetProject };
}
