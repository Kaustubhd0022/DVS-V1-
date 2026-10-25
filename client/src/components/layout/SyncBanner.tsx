import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';

const STATUS_LABEL: Record<string, string> = {
  loading: 'Loading your projects…',
  pending: 'Unsaved changes…',
  saving: 'Saving…',
  idle: 'All changes saved',
  error: 'Save problem',
  conflict: 'Needs attention',
};

/** Save status, one-time import of browser-only projects, conflict recovery and sign-out. */
export const SyncBanner: React.FC = () => {
  const auth = useAuth();
  const { sync, importLocalProjects, reloadProject, projects } = useProject();
  const [importing, setImporting] = useState(false);

  if (auth.status !== 'ready') return null;

  const runImport = async () => {
    setImporting(true);
    try {
      await importLocalProjects();
    } finally {
      setImporting(false);
    }
  };

  const conflictTitles = sync.conflictIds.map(id => projects.find(p => p.id === id)?.title || 'Untitled project');

  return (
    <div className="border-b border-white/10 bg-black/30 px-4 py-2 text-xs text-white/70 space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span role="status" className={sync.status === 'error' ? 'text-red-300' : undefined}>
          {STATUS_LABEL[sync.status] ?? ''}
          {sync.message ? ` — ${sync.message}` : ''}
        </span>
        <span className="flex items-center gap-3">
          <span className="truncate max-w-[16rem]">{auth.email}</span>
          <button onClick={auth.signOut} className="underline hover:text-white">
            Sign out
          </button>
        </span>
      </div>

      {sync.pendingLocalImport > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-md bg-amber-500/10 px-3 py-2 text-amber-200">
          <span>
            {sync.pendingLocalImport} project(s) from this browser are not in your account yet. Importing copies
            them; the browser copy is kept.
          </span>
          <button
            onClick={runImport}
            disabled={importing}
            className="rounded bg-amber-500 px-3 py-1 font-medium text-black disabled:opacity-60"
          >
            {importing ? 'Importing…' : 'Import'}
          </button>
        </div>
      )}

      {sync.conflictIds.length > 0 && (
        <div className="rounded-md bg-red-500/10 px-3 py-2 text-red-200 space-y-1">
          {sync.conflictIds.map((id, index) => (
            <div key={id} className="flex items-center justify-between gap-4">
              <span>"{conflictTitles[index]}" was changed in another tab or device. Your edits here are not saved.</span>
              <button onClick={() => reloadProject(id)} className="rounded bg-red-400 px-3 py-1 font-medium text-black">
                Load latest
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
