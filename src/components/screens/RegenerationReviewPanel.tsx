import React from 'react';
import { CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const RegenerationReviewPanel: React.FC = () => {
  const { currentProject, approveRegenerationProposal } = useProject();
  const proposals = (currentProject.artifactVersions || []).filter(v => v.state === 'AI_PROPOSAL');

  if (!proposals.length) return null;

  return (
    <section className="bg-[#11151d] border border-amber-500/20 rounded-3xl p-5 lg:p-6 shadow-xl">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-amber-300 font-bold">
        <RefreshCw className="w-4 h-4" /> Regeneration Review
      </div>
      <h2 className="text-lg font-bold text-white mt-1">AI proposals awaiting human approval</h2>
      <p className="text-xs text-white/50 mt-1">
        Regeneration never becomes Canon automatically. Review the proposed artifact before approving it.
      </p>
      <div className="mt-4 space-y-2">
        {proposals.slice(0, 10).map(proposal => (
          <div key={proposal.id} className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-bold text-white">{proposal.artifactType} · {proposal.artifactId}</div>
              <div className="text-[10px] text-white/40 mt-1">{proposal.changeSummary}</div>
              <div className="text-[9px] text-amber-300/70 mt-1">AI_PROPOSAL · {new Date(proposal.createdAt).toLocaleString()}</div>
            </div>
            <button
              onClick={() => approveRegenerationProposal(proposal.id, 'Story Creator', 'Creative Lead', 'Reviewed regenerated proposal and approved it as canonical.')}
              className="shrink-0 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-[10px] font-bold flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Approve as Canon
            </button>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[10px] text-white/35 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" /> Approval creates a new canonical version and preserves the AI proposal as history.
      </div>
    </section>
  );
};
