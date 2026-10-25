import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Database, 
  X, 
  Cpu, 
  Layers, 
  Lock, 
  BookOpen
} from 'lucide-react';
import { BentoCard, LineaCaption, LineaButton } from '../common/LineaUI';

export const ContextResolverModal: React.FC = () => {
  const { isContextResolverOpen, closeContextResolver, activeContextPackage } = useProject();

  if (!isContextResolverOpen || !activeContextPackage) return null;
  const pkg = activeContextPackage;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <BentoCard className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-[#0e1119]/95 border-sky-500/30 shadow-2xl">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#fbf8f3]">Context Resolver Inspector</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 font-mono">
                  {pkg.taskType}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Transparent inspection of the minimal scoped context slice assembled for AI reasoning.
              </p>
            </div>
          </div>

          <button
            onClick={closeContextResolver}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-stone-300">
          {/* Diagnostic Rationale Banner */}
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">
              Context Assembly Rationale (Scoped Resolution Protocol):
            </span>
            <p className="text-xs text-sky-100/90 leading-relaxed">
              {pkg.rationale}
            </p>
            <div className="flex items-center gap-4 pt-1.5 text-[11px] text-sky-300/70 font-mono">
              <span>Token Estimate: ~{pkg.tokenEstimate} tokens</span>
              <span>•</span>
              <span>Project Isolation: ENFORCED (Zero Cross-Project Leakage)</span>
            </div>
          </div>

          {/* Section 0: Resolution Scope */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#fbf8f3] flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Resolution Scope
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.projectConfiguration && (
                <div className="p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06]">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Project Configuration</span>
                  <p className="text-stone-200 mt-1 font-medium">{pkg.projectConfiguration.mediaFormat} · {pkg.projectConfiguration.contentMode}</p>
                  <p className="text-stone-500 mt-1">{pkg.projectConfiguration.primaryDomain || 'Domain not confirmed'} · {pkg.projectConfiguration.configurationStatus}</p>
                </div>
              )}
              {pkg.currentIntent && (
                <div className="p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06]">
                  <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Current Intent</span>
                  <p className="text-stone-200 mt-1 line-clamp-3 leading-relaxed">{pkg.currentIntent.premise || 'No premise established'}</p>
                  <p className="text-stone-500 mt-1">Known: {pkg.currentIntent.knownInformation.length} · Unknown: {pkg.currentIntent.unknownInformation.length}</p>
                </div>
              )}
            </div>
            {pkg.selectedDirection && (
              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                <span className="text-[10px] uppercase tracking-wider text-sky-300 font-semibold">Active Direction</span>
                <p className="text-[#fbf8f3] font-bold mt-1">{pkg.selectedDirection.title}</p>
                <p className="text-stone-400 mt-1">{pkg.selectedDirection.statement}</p>
              </div>
            )}
            {(pkg.acceptedInsights?.length || 0) > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06]">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Accepted Insights</span>
                <div className="mt-2 space-y-1">{pkg.acceptedInsights!.map(i => (
                  <div key={i.id} className="text-stone-300"><span className="text-sky-300 font-medium">{i.title}</span> — {i.statement}</div>
                ))}</div>
              </div>
            )}
            {(pkg.relevantDecisions?.length || 0) > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06]">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Decision History</span>
                <div className="mt-2 space-y-1">{pkg.relevantDecisions!.map(d => (
                  <div key={d.id} className="text-stone-300"><span className="text-amber-300 font-medium">{d.title}</span> — {d.decision || 'Approved decision'}</div>
                ))}</div>
              </div>
            )}
            {(pkg.unresolvedQuestions?.length || 0) > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold">Unresolved Questions</span>
                <div className="mt-2 space-y-1">{pkg.unresolvedQuestions!.map((q, i) => <div key={i} className="text-stone-300">• {q}</div>)}</div>
              </div>
            )}
          </div>

          {/* Section 1: Retrieved Canonical Facts */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#fbf8f3] flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Retrieved Immutable Canon Facts ({pkg.retrievedCanonFacts.length})
            </h4>
            <div className="space-y-2">
              {pkg.retrievedCanonFacts.map(fact => (
                <div key={fact.id} className="p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-stone-500">
                    <span className="font-mono text-amber-300 font-bold">{fact.id.toUpperCase()} • {fact.category}</span>
                    <span>Source: {fact.source}</span>
                  </div>
                  <p className="text-[#fbf8f3] text-xs font-medium">"{fact.statement}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Scoped Character Psychometrics */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#fbf8f3] flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              Retrieved Character Motivations & Voice Constraints
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.retrievedCharacterContext.map(char => (
                <div key={char.name} className="p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] space-y-1">
                  <span className="font-bold text-purple-300 text-xs block">{char.name}</span>
                  <div className="text-[11px] space-y-0.5 text-stone-300">
                    <div><span className="text-stone-500">Want:</span> {char.want}</div>
                    <div><span className="text-stone-500">Need:</span> {char.need}</div>
                    <div><span className="text-stone-500">Voice Style:</span> {char.voiceStyle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Traceable Research Injected */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#fbf8f3] flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Verified Research Citations ({pkg.retrievedResearch.length})
            </h4>
            <div className="space-y-2">
              {pkg.retrievedResearch.map(res => (
                <div key={res.id} className="p-3 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-[#fbf8f3] block text-xs">{res.topic}</span>
                    <p className="text-stone-300 text-[11px] mt-0.5">{res.claim}</p>
                    <span className="text-[10px] text-stone-500 block mt-1">
                      Provenance: {res.source} ({res.sourceType}) • {res.confidence}% Confidence
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-xs text-stone-400">
          <span>Target Workspace: <strong className="text-[#fbf8f3]">{pkg.targetArtifact}</strong></span>
          <button
            onClick={closeContextResolver}
            className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#fbf8f3] font-semibold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </BentoCard>
    </div>
  );
};
