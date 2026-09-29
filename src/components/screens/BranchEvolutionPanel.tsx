import React, { useState } from 'react';
import { GitBranch, GitMerge, Plus, Search, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, FileDiff, ChevronDown } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const BranchEvolutionPanel: React.FC = () => {
  const {
    currentProject,
    createProjectBranch,
    addArtifactToBranch,
    prepareProjectBranchMerge,
    approveProjectBranchMerge,
    rejectProjectBranchMerge,
    resolveBranchMergeConflict,
    abandonProjectBranch
  } = useProject();

  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [createdBy, setCreatedBy] = useState('Story Creator');
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  const branches = currentProject.projectBranches || [];
  const versions = currentProject.artifactVersions || [];
  const preview = currentProject.branchMergePreview || null;
  const activeBranch = branches.find(b => b.id === activeBranchId) || branches.find(b => b.status === 'ACTIVE') || null;
  const canonicalVersions = versions.filter(v => v.state === 'CANONICAL');

  const createBranch = () => {
    if (!name.trim()) return;
    const id = createProjectBranch(name, purpose, createdBy);
    setActiveBranchId(id);
    setName('');
    setPurpose('');
  };

  const prepare = (branchId: string) => {
    setActiveBranchId(branchId);
    prepareProjectBranchMerge(branchId);
  };

  const canApprove = Boolean(preview && preview.branchId === activeBranch?.id && preview.status === 'READY');

  return (
    <section className="bg-[#11151d] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
      <div className="p-5 lg:p-6 border-b border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-cyan-300 font-bold">
            <GitBranch className="w-4 h-4" /> Canon Evolution
          </div>
          <h2 className="text-lg font-bold text-white mt-1">Explore without mutating Canon</h2>
          <p className="text-xs text-white/50 mt-1 max-w-2xl">
            Create a creative branch, attach approved artifact versions, compare it with the current Canon, resolve conflicts, then explicitly approve the merge.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/40 uppercase">Current Canon</div>
          <div className="text-sm font-bold text-emerald-300">{currentProject.canonicalVersion || 'v0.1'}</div>
        </div>
      </div>

      <div className="p-5 lg:p-6 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3">
            <div className="text-xs font-bold text-white">Create Branch</div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Darker ending" className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400/50" />
            <textarea value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="What creative question is this branch exploring?" rows={3} className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400/50 resize-none" />
            <input value={createdBy} onChange={e => setCreatedBy(e.target.value)} placeholder="Created by" className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400/50" />
            <button onClick={createBranch} disabled={!name.trim()} className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black text-xs font-bold flex items-center justify-center gap-2">
              <Plus className="w-3.5 h-3.5" /> Create Branch
            </button>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Branches</div>
            {branches.length === 0 && <div className="text-xs text-white/40 p-4 border border-dashed border-white/10 rounded-xl">No creative branches yet.</div>}
            {branches.map(branch => (
              <button key={branch.id} onClick={() => setActiveBranchId(branch.id)} className={`w-full text-left p-3 rounded-xl border transition ${activeBranch?.id === branch.id ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-white/10 bg-white/[0.02]'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white truncate">{branch.name}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${branch.status === 'ACTIVE' ? 'text-cyan-300 border-cyan-500/30' : branch.status === 'MERGED' ? 'text-emerald-300 border-emerald-500/30' : 'text-white/40 border-white/10'}`}>{branch.status}</span>
                </div>
                <div className="text-[10px] text-white/40 mt-1 truncate">{branch.purpose || 'No purpose recorded'}</div>
                <div className="text-[10px] text-white/30 mt-2">{branch.artifactVersionIds.length} artifact version(s) • base {branch.baseCanonicalVersion}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-5">
          {!activeBranch ? (
            <div className="h-full min-h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-2xl text-center">
              <div><GitBranch className="w-8 h-8 text-cyan-300 mx-auto mb-3" /><div className="text-sm font-bold text-white">Select or create a branch</div><div className="text-xs text-white/40 mt-1">A branch isolates exploration from Canon.</div></div>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div><div className="text-xs font-bold text-white">Branch artifacts</div><div className="text-[10px] text-white/40">Attach canonical artifact versions as the branch starting point.</div></div>
                  <span className="text-[10px] text-cyan-300">{activeBranch.artifactVersionIds.length} attached</span>
                </div>
                <div className="space-y-2 max-h-52 overflow-auto">
                  {canonicalVersions.length === 0 && <div className="text-xs text-white/40">No canonical artifact versions available yet.</div>}
                  {canonicalVersions.map(version => {
                    const attached = activeBranch.artifactVersionIds.includes(version.id);
                    return (
                      <div key={version.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-black/20 border border-white/5">
                        <div className="min-w-0"><div className="text-xs text-white font-semibold">{version.artifactType} · {version.version}</div><div className="text-[10px] text-white/35 truncate">{version.artifactId} · {version.changeSummary}</div></div>
                        <button disabled={attached || activeBranch.status !== 'ACTIVE'} onClick={() => addArtifactToBranch(activeBranch.id, version.id)} className="shrink-0 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-[10px] font-bold text-white">{attached ? 'Attached' : 'Attach'}</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><div className="text-xs font-bold text-white">Compare & Merge</div><div className="text-[10px] text-white/40">Review the branch against the current canonical state before merging.</div></div>
                  <div className="flex gap-2">
                    <button disabled={activeBranch.status !== 'ACTIVE'} onClick={() => prepare(activeBranch.id)} className="px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-200 text-[10px] font-bold flex items-center gap-1.5 disabled:opacity-30"><Search className="w-3.5 h-3.5" /> Prepare Merge Preview</button>
                    {activeBranch.status === 'ACTIVE' && <button onClick={() => abandonProjectBranch(activeBranch.id)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold">Abandon</button>}
                  </div>
                </div>

                {preview && preview.branchId === activeBranch.id && (
                  <div className="mt-4 space-y-4">
                    <div className={`p-3 rounded-xl border ${preview.status === 'CONFLICTS' ? 'border-amber-500/30 bg-amber-500/5' : preview.status === 'READY' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]'}`}>
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        {preview.status === 'CONFLICTS' ? <AlertTriangle className="w-4 h-4 text-amber-300" /> : preview.status === 'READY' ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <FileDiff className="w-4 h-4 text-white/50" />}
                        Merge preview: {preview.status}
                      </div>
                      <div className="text-[10px] text-white/40 mt-1">{preview.diffs.length} artifact comparison(s) • {preview.conflicts.length} conflict(s)</div>
                    </div>

                    <div className="space-y-2">
                      {preview.diffs.map(diff => (
                        <div key={diff.branchVersionId} className="p-3 rounded-xl border border-white/5 bg-black/15">
                          <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-white">{diff.artifactType} · {diff.artifactId}</span><span className="text-[9px] uppercase text-white/40">{diff.changeType}</span></div>
                          <div className="text-[10px] text-white/45 mt-1">{diff.summary}</div>
                          {diff.changedFields.length > 0 && <div className="text-[10px] text-cyan-300/80 mt-1">Changed: {diff.changedFields.join(', ')}</div>}
                        </div>
                      ))}
                    </div>

                    {preview.conflicts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">Conflict Resolution Required</div>
                        {preview.conflicts.map(conflict => (
                          <div key={conflict.id} className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
                            <div className="flex items-start justify-between gap-3">
                              <div><div className="text-xs font-bold text-white">{conflict.artifactType} · {conflict.artifactId}</div><div className="text-[10px] text-white/45 mt-1">{conflict.reason}</div></div>
                              <span className="text-[9px] text-amber-300 border border-amber-500/30 rounded px-1.5 py-0.5">{conflict.resolution || 'UNRESOLVED'}</span>
                            </div>
                            <div className="grid md:grid-cols-3 gap-2 mt-3">
                              {(['USE_BRANCH','KEEP_CANONICAL','MANUAL_EDIT'] as const).map(option => (
                                <button key={option} onClick={() => resolveBranchMergeConflict(activeBranch.id, conflict.id, option)} className={`py-2 rounded-lg border text-[10px] font-bold ${conflict.resolution === option ? 'border-cyan-400/60 bg-cyan-400/10 text-cyan-200' : 'border-white/10 bg-white/5 text-white/60 hover:text-white'}`}>{option.replace('_',' ')}</button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {preview.status === 'READY' && activeBranch.status === 'ACTIVE' && (
                      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-200"><ShieldCheck className="w-4 h-4" /> Human approval required</div>
                        <div className="text-[10px] text-white/45 mt-1">Approving advances Canon. Nothing is canonicalized by the comparison step.</div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => approveProjectBranchMerge(activeBranch.id, createdBy || 'Story Creator', 'Reviewed branch diff and approved the proposed canonical evolution.')} className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold flex items-center gap-1.5"><GitMerge className="w-3.5 h-3.5" /> Approve & Merge</button>
                          <button onClick={() => rejectProjectBranchMerge(activeBranch.id, createdBy || 'Story Creator', 'Rejected after branch comparison.')} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-bold"><XCircle className="w-3.5 h-3.5 inline mr-1" /> Reject Preview</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
