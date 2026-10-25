import { act, renderHook } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TattavaProject } from '../types/project';

vi.mock('../services/apiClient', () => {
  class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  }
  return {
    ApiError,
    apiClient: {
      listProjects: vi.fn(),
      getSnapshot: vi.fn(),
      saveSnapshot: vi.fn(),
      importProject: vi.fn(),
      deleteProject: vi.fn(),
    },
  };
});

import { ApiError, apiClient } from '../services/apiClient';
import { useProjectSync } from './useProjectSync';

const api = apiClient as unknown as Record<string, ReturnType<typeof vi.fn>>;

const ID_A = '11111111-1111-4111-8111-111111111111';
const ID_B = '22222222-2222-4222-8222-222222222222';

const project = (id: string, title = 'Project', extra: Record<string, unknown> = {}) =>
  ({ id, title, contentType: 'Feature', genre: 'Drama', ...extra }) as unknown as TattavaProject;

const backendProject = (id: string) => ({ id, title: 'Project' });
const snapshot = (id: string, version: number, data: unknown) => ({
  project_id: id,
  version,
  schema_version: 1,
  data,
  updated_at: null,
});

function useHarness(initial: TattavaProject[] = [], remote = true) {
  const [projects, setProjects] = useState<TattavaProject[]>(initial);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const sync = useProjectSync({
    remote,
    userId: 'user-1',
    projects,
    setProjects,
    setCurrentProjectId: setCurrentId,
    normalize: p => p,
    localStorageKey: 'local-key',
  });
  return { projects, setProjects, currentId, ...sync };
}

const flush = async (ms = 0) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  Object.values(api).forEach(fn => fn.mockReset());
  api.deleteProject.mockResolvedValue({});
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useProjectSync', () => {
  it('loads the server projects on sign-in and does not re-save them', async () => {
    api.listProjects.mockResolvedValue([backendProject(ID_A)]);
    api.getSnapshot.mockResolvedValue(snapshot(ID_A, 3, project('stale-id-in-doc', 'From server')));

    const { result } = renderHook(() => useHarness());
    await flush();

    expect(result.current.sync.status).toBe('idle');
    expect(result.current.sync.loaded).toBe(true);
    expect(result.current.projects).toHaveLength(1);
    expect(result.current.projects[0].id).toBe(ID_A); // server id wins over the id in the document
    expect(result.current.currentId).toBe(ID_A);

    await flush(5000);
    expect(api.saveSnapshot).not.toHaveBeenCalled();
    expect(api.importProject).not.toHaveBeenCalled();
  });

  it('saves edits after a debounce using the version it loaded', async () => {
    api.listProjects.mockResolvedValue([backendProject(ID_A)]);
    api.getSnapshot.mockResolvedValue(snapshot(ID_A, 3, project(ID_A)));
    api.saveSnapshot.mockResolvedValue(snapshot(ID_A, 4, {}));

    const { result } = renderHook(() => useHarness());
    await flush();

    act(() => result.current.setProjects(prev => prev.map(p => ({ ...p, title: 'Edited' }))));
    await flush(1000);
    expect(api.saveSnapshot).not.toHaveBeenCalled(); // still inside the debounce window

    await flush(1000);
    expect(api.saveSnapshot).toHaveBeenCalledTimes(1);
    expect(api.saveSnapshot.mock.calls[0][0]).toBe(ID_A);
    expect(api.saveSnapshot.mock.calls[0][1]).toBe(3);
    expect((api.saveSnapshot.mock.calls[0][2] as { title: string }).title).toBe('Edited');
    expect(result.current.sync.status).toBe('idle');

    // The next edit builds on the new version.
    api.saveSnapshot.mockResolvedValue(snapshot(ID_A, 5, {}));
    act(() => result.current.setProjects(prev => prev.map(p => ({ ...p, title: 'Edited again' }))));
    await flush(2000);
    expect(api.saveSnapshot.mock.calls[1][1]).toBe(4);
  });

  it('collapses rapid edits into a single save', async () => {
    api.listProjects.mockResolvedValue([backendProject(ID_A)]);
    api.getSnapshot.mockResolvedValue(snapshot(ID_A, 1, project(ID_A)));
    api.saveSnapshot.mockResolvedValue(snapshot(ID_A, 2, {}));

    const { result } = renderHook(() => useHarness());
    await flush();

    for (const title of ['a', 'ab', 'abc']) {
      act(() => result.current.setProjects(prev => prev.map(p => ({ ...p, title }))));
      await flush(500);
    }
    await flush(2000);

    expect(api.saveSnapshot).toHaveBeenCalledTimes(1);
    expect((api.saveSnapshot.mock.calls[0][2] as { title: string }).title).toBe('abc');
  });

  it('stops saving a project on 409 and recovers by loading the latest copy', async () => {
    api.listProjects.mockResolvedValue([backendProject(ID_A)]);
    api.getSnapshot.mockResolvedValue(snapshot(ID_A, 1, project(ID_A, 'Mine')));
    api.saveSnapshot.mockRejectedValue(new ApiError(409, 'Project was changed elsewhere'));

    const { result } = renderHook(() => useHarness());
    await flush();
    act(() => result.current.setProjects(prev => prev.map(p => ({ ...p, title: 'Local edit' }))));
    await flush(2000);

    expect(result.current.sync.status).toBe('conflict');
    expect(result.current.sync.conflictIds).toEqual([ID_A]);

    act(() => result.current.setProjects(prev => prev.map(p => ({ ...p, title: 'More local edits' }))));
    await flush(5000);
    expect(api.saveSnapshot).toHaveBeenCalledTimes(1); // not retried while in conflict

    api.getSnapshot.mockResolvedValue(snapshot(ID_A, 7, project(ID_A, 'Theirs')));
    await act(async () => {
      await result.current.reloadProject(ID_A);
    });
    expect(result.current.projects[0].title).toBe('Theirs');
    expect(result.current.sync.status).toBe('idle');

    api.saveSnapshot.mockResolvedValue(snapshot(ID_A, 8, {}));
    act(() => result.current.setProjects(prev => prev.map(p => ({ ...p, title: 'After reload' }))));
    await flush(2000);
    expect(api.saveSnapshot.mock.calls[1][1]).toBe(7);
  });

  it('gives a local-only project id a real UUID, then creates it on the server', async () => {
    api.listProjects.mockResolvedValue([]);
    api.importProject.mockImplementation(async (input: { id: string }) => ({
      project: backendProject(input.id),
      snapshot: snapshot(input.id, 1, {}),
    }));

    const { result } = renderHook(() => useHarness());
    await flush();

    act(() => result.current.setProjects([project('proj-1699999999', 'New idea')]));
    await flush(2000); // debounce -> remap id
    await flush(2000); // debounce -> create

    expect(api.importProject).toHaveBeenCalledTimes(1);
    const sent = api.importProject.mock.calls[0][0] as { id: string; title: string };
    expect(sent.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(sent.id).not.toBe('proj-1699999999');
    expect(sent.title).toBe('New idea');
    expect(result.current.projects[0].id).toBe(sent.id);
  });

  it('never uploads demo projects', async () => {
    api.listProjects.mockResolvedValue([]);
    const { result } = renderHook(() => useHarness());
    await flush();

    act(() => result.current.setProjects([project('demo-1', 'Demo', { isDemo: true })]));
    await flush(10_000);

    expect(api.importProject).not.toHaveBeenCalled();
    expect(api.saveSnapshot).not.toHaveBeenCalled();
  });

  it('imports browser-only projects on request and keeps the local copy', async () => {
    const local = [project('old-1', 'Old one'), project('old-2', 'Old two'), project('demo', 'Demo', { isDemo: true })];
    localStorage.setItem('local-key', JSON.stringify(local));
    api.listProjects.mockResolvedValue([]);
    api.importProject.mockImplementation(async (input: { id: string }) => ({
      project: backendProject(input.id),
      snapshot: snapshot(input.id, 1, {}),
    }));

    const { result } = renderHook(() => useHarness());
    await flush();
    expect(result.current.sync.pendingLocalImport).toBe(2); // demo excluded

    let count = 0;
    await act(async () => {
      count = await result.current.importLocalProjects();
    });

    expect(count).toBe(2);
    expect(api.importProject).toHaveBeenCalledTimes(2);
    expect(result.current.projects.map(p => p.title).sort()).toEqual(['Old one', 'Old two']);
    expect(result.current.sync.pendingLocalImport).toBe(0);
    expect(JSON.parse(localStorage.getItem('local-key')!)).toHaveLength(3); // untouched

    await flush(5000); // imported projects are already saved: no follow-up writes
    expect(api.saveSnapshot).not.toHaveBeenCalled();
  });

  it('reports a failed save and retries', async () => {
    api.listProjects.mockResolvedValue([backendProject(ID_B)]);
    api.getSnapshot.mockResolvedValue(snapshot(ID_B, 1, project(ID_B)));
    api.saveSnapshot.mockRejectedValueOnce(new ApiError(0, 'Could not reach the server'));
    api.saveSnapshot.mockResolvedValue(snapshot(ID_B, 2, {}));

    const { result } = renderHook(() => useHarness());
    await flush();
    act(() => result.current.setProjects(prev => prev.map(p => ({ ...p, title: 'Offline edit' }))));
    await flush(2000);

    expect(result.current.sync.status).toBe('error');
    expect(result.current.sync.message).toBe('Could not reach the server');

    await flush(10_000);
    expect(api.saveSnapshot).toHaveBeenCalledTimes(2);
    expect(result.current.sync.status).toBe('idle');
  });

  it('deletes on the server when a synced project is removed', async () => {
    api.listProjects.mockResolvedValue([backendProject(ID_A)]);
    api.getSnapshot.mockResolvedValue(snapshot(ID_A, 1, project(ID_A)));

    const { result } = renderHook(() => useHarness());
    await flush();
    act(() => result.current.forgetProject(ID_A));

    expect(api.deleteProject).toHaveBeenCalledWith(ID_A);
  });

  it('does nothing and stays local when not signed in', async () => {
    const { result } = renderHook(() => useHarness([project('p1')], false));
    await flush(10_000);

    expect(result.current.sync.status).toBe('local');
    expect(api.listProjects).not.toHaveBeenCalled();
    expect(api.importProject).not.toHaveBeenCalled();
  });
});
