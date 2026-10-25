import React, { useState } from 'react';
import { GitBranch, GitMerge, Plus, Search, CheckCircle2, AlertTriangle, XCircle, ShieldCheck, FileDiff } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { BentoCard, LineaCaption, LineaButton } from '../common/LineaUI';

export const BranchEvolutionPanel: React.FC = () => {
  const {
    currentProject,
    createProjectBranch,
    addArtifactToBranch,
    prepareProjectBranchMerge,
    approveProjectBranchMerge,
    rejectProjectBranchMerge,
    resolveBranchMergeConflict,
    setBranchMergeManualContent,
    abandonProjectBranch
  } = useProject();

  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [createdBy, setCreatedBy] = useState('Story Creator');
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
  const [manualDrafts, setManualDrafts] = useState<Record<string, string>>({});

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

  return (
    <BentoCard className="p-0 overflow-hidden shadow-2xl">
      <div className="p-5 lg:p-6 border-b border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-black/40">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-sky-400 font-bold">
            <GitBranch className="w-4 h-4" /> Canon Evolution
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#fbf8f3]">Explore without mutating Canon</h2>
          <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
            Create a creative branch, attach approved artifact versions, compare it with the current Canon, resolve conflicts, then explicitly approve the merge.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-stone-500 uppercase font-semibold">Current Canon</div>
          <div className="text-sm font-bold text-emerald-400 font-mono">{currentProject.canonicalVersion || 'v0.1'}</div>
        </div>
      </div>

      <div className="p-5 lg:p-6 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-[#0a0c12]/80 border border-white/[0.08] p-4 space-y-3">
            <div className="text-xs font-bold text-[#fbf8f3]">Create Creative Branch</div>
            <input 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Darker ending, Alternative motive" 
              className="w-full bg-[#0a0c12] border border-white/[0.1] rounded-full px-4 py-2 text-xs text-[#fbf8f3] outline-none focus:border-sky-400/50" 
            />
            <textarea 
              value={purpose} 
              onChange={e => setPurpose(e.target.value)} 
              placeholder="What creative question is this branch exploring?" 
              rows={2} 
              className="w-full bg-[#0a0c12] border border-white/[0.1] rounded-2xl p-3 text-xs text-[#fbf8f3] outline-none focus:border-sky-400/50 resize-none" 
            />
            <input 
              value={createdBy} 
              onChange={e => setCreatedBy(e.target.value)} 
              placeholder="Created by" 
              className="w-full bg-[#0a0c12] border border-white/[0.1] rounded-full px-4 py-2 text-xs text-[#fbf8f3] outline-none focus:border-sky-400/50" 
            />
            <LineaButton 
              variant="mint"
              size="sm"
              onClick={createBranch} 
              disabled={!name.trim()} 
              className="w-full justify-center"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Create Branch
            </LineaButton>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold px-1">Branches</div>
            {branches.length === 0 && <div className="text-xs text-stone-500 p-4 border border-dashed border-white/[0.08] rounded-2xl text-center">No creative branches yet.</div>}
            {branches.map(branch => (
              <button 
                key={branch.id} 
                onClick={() => setActiveBranchId(branch.id)} 
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeBranch?.id === branch.id 
                    ? 'border-sky-400/50 bg-sky-400/10 shadow-sm' 
                    : 'border-white/[0.06] bg-[#0a0c12]/60 hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#fbf8f3] truncate">{branch.name}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    branch.status === 'ACTIVE' 
                      ? 'text-sky-300 border-sky-500/30 bg-sky-500/15' 
                      : branch.status === 'MERGED' 
                      ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/15' 
                      : 'text-stone-400 border-white/10'
                  }`}>
                    {branch.status}
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 mt-1 truncate">{branch.purpose || 'No purpose recorded'}</div>
                <div className="text-[10px] text-stone-500 mt-2 font-mono">{branch.artifactVersionIds.length} artifact version(s) • base {branch.baseCanonicalVersion}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-4">
          {!activeBranch ? (
            <div className="h-full min-h-[300px] flex items-center justify-center border border-dashed border-white/[0.08] rounded-3xl text-center p-8">
              <div>
                <GitBranch className="w-8 h-8 text-sky-400 mx-auto mb-3" />
                <div className="text-sm font-bold text-[#fbf8f3]">Select or create a branch</div>
                <div className="text-xs text-stone-500 mt-1">A branch isolates exploration from Canon.</div>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-3xl border border-white/[0.08] bg-[#0a0c12]/70 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#fbf8f3]">Branch artifacts</div>
                    <div className="text-[11px] text-stone-400">Attach canonical artifact versions as the branch starting point.</div>
                  </div>
                  <span className="text-xs font-mono text-sky-300 font-semibold">{activeBranch.artifactVersionIds.length} attached</span>
                </div>
                <div className="space-y-2 max-h-52 overflow-auto">
                  {canonicalVersions.length === 0 && <div className="text-xs text-stone-500 py-3">No canonical artifact versions available yet.</div>}
                  {canonicalVersions.map(version => {
                    const attached = activeBranch.artifactVersionIds.includes(version.id);
                    return (
                      <div key={version.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-black/30 border border-white/[0.06]">
                        <div className="min-w-0">
                          <div className="text-xs text-[#fbf8f3] font-semibold">{version.artifactType} · {version.version}</div>
                          <div className="text-[11px] text-stone-400 truncate">{version.artifactId} · {version.changeSummary}</div>
                        </div>
                        <button 
                          disabled={attached || activeBranch.status !== 'ACTIVE'} 
                          onClick={() => addArtifactToBranch(activeBranch.id, version.id)} 
                          className="shrink-0 px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] disabled:opacity-30 text-xs font-semibold text-stone-200 cursor-pointer"
                        >
                          {attached ? 'Attached' : 'Attach'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-white/[0.08] bg-[#0a0c12]/70 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#fbf8f3]">Compare & Merge</div>
                    <div className="text-[11px] text-stone-400">Review the branch against current canonical state before merging.</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      disabled={activeBranch.status !== 'ACTIVE'} 
                      onClick={() => prepare(activeBranch.id)} 
                      className="px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-200 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-30 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" /> Prepare Merge Preview
                    </button>
                    {activeBranch.status === 'ACTIVE' && (
                      <button 
                        onClick={() => abandonProjectBranch(activeBranch.id)} 
                        className="px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.1] text-stone-400 hover:text-white text-xs font-semibold cursor-pointer"
                      >
                        Abandon
                      </button>
                    )}
                  </div>
                </div>

                {preview && preview.branchId === activeBranch.id && (
                  <div className="space-y-4 pt-2">
                    <div className={`p-3.5 rounded-2xl border ${
                      preview.status === 'CONFLICTS' 
                        ? 'border-amber-500/30 bg-amber-500/10' 
                        : preview.status === 'READY' 
                        ? 'border-emerald-500/30 bg-emerald-500/10' 
                        : 'border-white/10 bg-white/[0.02]'
                    }`}>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#fbf8f3]">
                        {preview.status === 'CONFLICTS' ? <AlertTriangle className="w-4 h-4 text-amber-300" /> : preview.status === 'READY' ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <FileDiff className="w-4 h-4 text-stone-400" />}
                        Merge preview: {preview.status}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-1">{preview.diffs.length} artifact comparison(s) • {preview.conflicts.length} conflict(s)</div>
                    </div>

                    <div className="space-y-2">
                      {preview.diffs.map(diff => (
                        <div key={diff.branchVersionId} className="p-3.5 rounded-2xl border border-white/[0.06] bg-black/30">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#fbf8f3]">{diff.artifactType} · {diff.artifactId}</span>
                            <span className="text-[10px] uppercase font-mono text-stone-400">{diff.changeType}</span>
                          </div>
                          <div className="text-[11px] text-stone-400 mt-1">{diff.summary}</div>
                          {diff.changedFields.length > 0 && <div className="text-[10px] text-sky-300/80 mt-1">Changed: {diff.changedFields.join(', ')}</div>}
                        </div>
                      ))}
                    </div>

                    {preview.conflicts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] uppercase tracking-wider text-amber-300 font-bold">Conflict Resolution Required</div>
                        {preview.conflicts.map(conflict => (
                          <div key={conflict.id} className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-xs font-bold text-[#fbf8f3]">{conflict.artifactType} · {conflict.artifactId}</div>
                                <div className="text-[11px] text-stone-400 mt-0.5">{conflict.reason}</div>
                              </div>
                              <span className="text-[10px] text-amber-300 border border-amber-500/30 rounded-full px-2 py-0.5 font-semibold">{conflict.resolution || 'UNRESOLVED'}</span>
                            </div>
                            <div className="grid md:grid-cols-3 gap-2">
                              {(['USE_BRANCH','KEEP_CANONICAL','MANUAL_EDIT'] as const).map(option => (
                                <button 
                                  key={option} 
                                  onClick={() => resolveBranchMergeConflict(activeBranch.id, conflict.id, option)} 
                                  className={`py-2 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                                    conflict.resolution === option 
                                      ? 'border-sky-400/60 bg-sky-400/20 text-sky-200' 
                                      : 'border-white/10 bg-white/[0.04] text-stone-300 hover:text-white'
                                  }`}
                                >
                                  {option.replace('_',' ')}
                                </button>
                              ))}
                            </div>
                            {conflict.resolution === 'MANUAL_EDIT' && (
                              <div className="space-y-2 pt-2">
                                <div className="text-[11px] text-stone-400">Edit the branch artifact JSON. Merge remains blocked until valid content is saved.</div>
                                <textarea
                                  value={manualDrafts[conflict.id] ?? JSON.stringify(conflict.manualContent ?? conflict.branchContent, null, 2)}
                                  onChange={e => setManualDrafts(prev => ({ ...prev, [conflict.id]: e.target.value }))}
                                  rows={6}
                                  className="w-full bg-[#0a0c12] border border-white/[0.1] rounded-2xl p-3 text-xs text-[#fbf8f3] font-mono outline-none focus:border-sky-400/50 resize-none"
                                />
                                <button
                                  onClick={() => {
                                    try {
                                      const parsed = JSON.parse(manualDrafts[conflict.id] ?? '');
                                      setBranchMergeManualContent(activeBranch.id, conflict.id, parsed);
                                    } catch {
                                      // Invalid JSON handling
                                    }
                                  }}
                                  className="px-4 py-1.5 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-200 text-xs font-semibold cursor-pointer"
                                >
                                  Save Manual Content
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {preview.status === 'READY' && activeBranch.status === 'ACTIVE' && (
                      <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                          <ShieldCheck className="w-4 h-4" /> Human approval required
                        </div>
                        <div className="text-[11px] text-stone-400">Approving advances Canon. Nothing is canonicalized by the comparison step alone.</div>
                        <div className="flex gap-2 pt-1">
                          <LineaButton 
                            variant="mint"
                            size="sm"
                            onClick={() => approveProjectBranchMerge(activeBranch.id, createdBy || 'Story Creator', 'Reviewed branch diff and approved proposed canonical evolution.')} 
                            icon={<GitMerge className="w-3.5 h-3.5" />}
                          >
                            Approve & Merge
                          </LineaButton>
                          <button 
                            onClick={() => rejectProjectBranchMerge(activeBranch.id, createdBy || 'Story Creator', 'Rejected after branch comparison.')} 
                            className="px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.1] text-stone-300 hover:text-white text-xs font-semibold cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 inline mr-1" /> Reject Preview
                          </button>
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
    </BentoCard>
  );
};
