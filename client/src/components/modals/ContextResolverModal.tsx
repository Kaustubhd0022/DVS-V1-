import React from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Database, 
  ShieldCheck, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Lock, 
  ExternalLink,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const ContextResolverModal: React.FC = () => {
  const { isContextResolverOpen, closeContextResolver, activeContextPackage, currentProject } = useProject();

  if (!isContextResolverOpen) return null;

  if (!activeContextPackage) return null;
  const pkg = activeContextPackage;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#121524] border border-cyan-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-cyan-950/50">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Context Resolver Inspector</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  {pkg.taskType}
                </span>
              </div>
              <p className="text-xs text-white/60">
                Transparent inspection of the minimal scoped context slice assembled for AI reasoning.
              </p>
            </div>
          </div>

          <button
            onClick={closeContextResolver}
            className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-white/80">
          {/* Diagnostic Rationale Banner */}
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
              Context Assembly Rationale (Section 13.1 Specification Rule):
            </span>
            <p className="text-xs text-cyan-100/90 leading-relaxed">
              {pkg.rationale}
            </p>
            <div className="flex items-center gap-4 pt-1.5 text-[11px] text-cyan-300/70 font-mono">
              <span>Token Estimate: ~{pkg.tokenEstimate} tokens</span>
              <span>•</span>
              <span>Project Isolation: ENFORCED (Zero Cross-Project Retrieval)</span>
            </div>
          </div>

          {/* Section 0: Resolution Scope */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Resolution Scope
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pkg.projectConfiguration && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">Project Configuration</span>
                  <p className="text-white mt-1">{pkg.projectConfiguration.mediaFormat} · {pkg.projectConfiguration.contentMode}</p>
                  <p className="text-white/50 mt-1">{pkg.projectConfiguration.primaryDomain || 'Domain not confirmed'} · {pkg.projectConfiguration.configurationStatus}</p>
                </div>
              )}
              {pkg.currentIntent && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-white/40">Current Intent</span>
                  <p className="text-white mt-1 line-clamp-3">{pkg.currentIntent.premise || 'No premise established'}</p>
                  <p className="text-white/50 mt-1">Known {pkg.currentIntent.knownInformation.length} · Unknown {pkg.currentIntent.unknownInformation.length}</p>
                </div>
              )}
            </div>
            {pkg.selectedDirection && (
              <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <span className="text-[10px] uppercase tracking-wider text-cyan-300">Active Direction</span>
                <p className="text-white font-semibold mt-1">{pkg.selectedDirection.title}</p>
                <p className="text-white/60 mt-1">{pkg.selectedDirection.statement}</p>
              </div>
            )}
            {(pkg.acceptedInsights?.length || 0) > 0 && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] uppercase tracking-wider text-white/40">Accepted Insights</span>
                <div className="mt-2 space-y-1">{pkg.acceptedInsights!.map(i => (
                  <div key={i.id} className="text-white/70"><span className="text-cyan-300">{i.title}</span> — {i.statement}</div>
                ))}</div>
              </div>
            )}
            {(pkg.relevantDecisions?.length || 0) > 0 && (
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] uppercase tracking-wider text-white/40">Decision History</span>
                <div className="mt-2 space-y-1">{pkg.relevantDecisions!.map(d => (
                  <div key={d.id} className="text-white/70"><span className="text-amber-300">{d.title}</span> — {d.decision || 'Approved decision'}</div>
                ))}</div>
              </div>
            )}
            {(pkg.unresolvedQuestions?.length || 0) > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <span className="text-[10px] uppercase tracking-wider text-amber-300">Unresolved Questions</span>
                <div className="mt-2 space-y-1">{pkg.unresolvedQuestions!.map((q, i) => <div key={i} className="text-white/70">• {q}</div>)}</div>
              </div>
            )}
          </div>

          {/* Section 1: Retrieved Canonical Facts */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Retrieved Immutable Canon Facts ({pkg.retrievedCanonFacts.length})
            </h4>
            <div className="space-y-1.5">
              {pkg.retrievedCanonFacts.map(fact => (
                <div key={fact.id} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-white/40">
                    <span className="font-mono text-amber-300 font-bold">{fact.id.toUpperCase()} • {fact.category}</span>
                    <span>Source: {fact.source}</span>
                  </div>
                  <p className="text-white text-xs font-medium">"{fact.statement}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Scoped Character Psychometrics */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              Retrieved Character Motivations & Voice Constraints
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.retrievedCharacterContext.map(char => (
                <div key={char.name} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="font-bold text-white text-xs block text-purple-300">{char.name}</span>
                  <div className="text-[11px] space-y-0.5 text-white/70">
                    <div><span className="text-white/40">Want:</span> {char.want}</div>
                    <div><span className="text-white/40">Need:</span> {char.need}</div>
                    <div><span className="text-white/40">Voice Style:</span> {char.voiceStyle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Traceable Research Injected */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              Verified Research Citations ({pkg.retrievedResearch.length})
            </h4>
            <div className="space-y-1.5">
              {pkg.retrievedResearch.map(res => (
                <div key={res.id} className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-white block text-xs">{res.topic}</span>
                    <p className="text-white/70 text-[11px]">{res.claim}</p>
                    <span className="text-[10px] text-white/40 block mt-0.5">
                      Provenance: {res.source} ({res.sourceType}) • {res.confidence}% Confidence
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/30 flex items-center justify-between text-xs text-white/50">
          <span>Target Workspace: <strong className="text-white">{pkg.targetArtifact}</strong></span>
          <button
            onClick={closeContextResolver}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
