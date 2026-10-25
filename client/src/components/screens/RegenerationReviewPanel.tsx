import React from 'react';
import { CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const RegenerationReviewPanel: React.FC = () => {
  const { currentProject, approveRegenerationProposal } = useProject();
  const proposals = (currentProject.artifactVersions || []).filter(v => v.state === 'AI_PROPOSAL');
  const repairPlans = currentProject.regenerationPlans || [];
  const planFor = (proposal: typeof proposals[number]) =>
    repairPlans.find(plan => plan.id === proposal.sourcePlanId);

  if (!proposals.length) return null;

  return (
    <section className="bg-[#0e1119]/90 border border-amber-500/30 rounded-3xl p-5 lg:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold">
        <div className="linea-btn-wave h-3 text-amber-400">
          <span className="h-1.5" />
          <span className="h-3" />
          <span className="h-2" />
        </div>
        <RefreshCw className="w-3.5 h-3.5" /> Regeneration Review Gate
      </div>
      <h2 className="text-xl font-bold text-[#fbf8f3] mt-2 tracking-tight">AI proposals awaiting human approval</h2>
      <p className="text-xs text-stone-400 mt-1 max-w-2xl">
        Regeneration never becomes Canon automatically. Creator review and verification is required before any generated state is locked into canonical truth.
      </p>

      <div className="mt-5 space-y-2.5">
        {proposals.slice(0, 10).map(proposal => (
          <div key={proposal.id} className="p-4 rounded-2xl border border-white/[0.08] bg-[#141824]/60 hover:bg-[#141824]/90 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#fbf8f3]">{proposal.artifactType}</span>
                <span className="text-[10px] font-mono text-stone-400">· {proposal.artifactId}</span>
                <span className="rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold">
                  AI Proposal
                </span>
              </div>
              <div className="text-[10px] text-cyan-300/80 mt-1 font-mono">
                Repair cycle: {proposal.repairCycleId || '—'} · Parent: {proposal.parentVersionIds?.[0] || 'new artifact'}
              </div>
              <div className="text-xs text-stone-300 mt-1.5">{proposal.changeSummary}</div>
              {planFor(proposal) && (
                <div className="text-[10px] text-stone-400 mt-1">
                  Plan status: <span className="text-stone-300">{planFor(proposal)?.status}</span> · Source item: <span className="text-stone-300">{proposal.sourcePlanItemId || '—'}</span>
                </div>
              )}
              <div className="text-[10px] text-stone-500 mt-1 font-mono">
                Timestamp: {new Date(proposal.createdAt).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => approveRegenerationProposal(proposal.id, 'Story Creator', 'Creative Lead', 'Reviewed regenerated proposal and approved it as canonical.')}
              className="shrink-0 px-5 py-2.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-stone-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-400/20"
            >
              <ShieldCheck className="w-4 h-4" /> Approve as Canon
            </button>
          </div>
        ))}
      </div>

      {repairPlans.some(plan => plan.status === 'AWAITING_APPROVAL') && (
        <div className="mt-4 p-4 rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.06] text-xs text-cyan-200/90 leading-relaxed">
          Multi-artifact repair is tracked as one coordinated repair cycle. Each artifact proposal maintains independent lineage and approval gating, ensuring one approval never silently accepts another artifact.
        </div>
      )}

      <div className="mt-4 text-[11px] text-stone-400 flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Approval creates a new canonical version and preserves the AI proposal history with full audit provenance.
      </div>
    </section>
  );
};
