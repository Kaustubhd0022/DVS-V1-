import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  CheckCircle, AlertTriangle, ArrowRight, CheckCircle2, 
  Sparkles, RefreshCw, Eye, ShieldAlert, SplitSquareVertical, Sliders
} from 'lucide-react';
import { QAInconsistency } from '../../types/project';

export const ContinuityQAScreen: React.FC = () => {
  const { currentProject, resolveQAInconsistency, nextStep } = useProject();
  const inconsistencies = currentProject.qaInconsistencies || currentProject.qaIssues || [];

  const [selectedIssueId, setSelectedIssueId] = useState<string>(inconsistencies[0]?.id || 'qa-1');
  const [isResolving, setIsResolving] = useState(false);

  const selectedIssue = inconsistencies.find(i => i.id === selectedIssueId) || inconsistencies[0];

  const handleResolve = () => {
    setIsResolving(true);
    setTimeout(() => {
      resolveQAInconsistency(selectedIssue.id);
      setIsResolving(false);
    }, 700);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Pipeline Step 13
            </span>
            <span className="text-xs text-white/40">• Script Continuity & Production Integrity Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Continuity QA & Multimodal Script Auditor
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            Automated verification of props, costume weathering, time progression, and spatial geography across 32 scenes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Next: Visual Development</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Continuity Status Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Audit Pass Rate</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">96.8%</div>
          <div className="text-xs text-white/50 mt-0.5">31 of 32 Scenes Clean</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Active Discrepancies</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {inconsistencies.filter(i => i.status === 'Open').length} Open
          </div>
          <div className="text-xs text-white/50 mt-0.5">1 Prop Mismatch Detected</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Weathering Match</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">100%</div>
          <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Water saturation verified
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Spatial Consistency</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">100%</div>
          <div className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 180° Rule preserved
          </div>
        </div>
      </div>

      {/* Main Flagship Demonstration: Side-by-Side Shot Comparison */}
      <div className="p-6 rounded-2xl bg-[#12141a]/95 border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                selectedIssue.status === 'Open'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {selectedIssue.status === 'Open' ? '⚠️ Open Issue' : '✓ Resolved'}
              </span>
              <span className="text-xs font-bold text-white font-mono">
                {selectedIssue.type} • Scene {selectedIssue.sceneNumber}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{selectedIssue.title}</h3>
            <p className="text-xs text-white/60 mt-0.5 max-w-3xl leading-relaxed">
              {selectedIssue.description}
            </p>
          </div>

          {selectedIssue.status === 'Open' ? (
            <button
              onClick={handleResolve}
              disabled={isResolving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isResolving ? 'animate-spin' : ''}`} />
              <span>{isResolving ? 'Applying Script Action...' : 'Apply Automated Script Fix'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Resolved in Screenplay Draft</span>
            </div>
          )}
        </div>

        {/* Side-by-Side Visual Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reference Shot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white/80">{selectedIssue.referenceShotLabel}</span>
              <span className="text-emerald-400 font-mono text-[11px]">Primary Reference</span>
            </div>
            <div className="relative h-64 rounded-xl overflow-hidden border border-white/10 group">
              <img
                src={selectedIssue.referenceShotImg}
                alt="Reference Shot"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-emerald-300 border border-emerald-500/30">
                  Prop Present: Industrial Lantern (Right Hand)
                </span>
              </div>
            </div>
          </div>

          {/* Current / Conflicting Shot */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white/80">{selectedIssue.currentShotLabel}</span>
              <span className={`font-mono text-[11px] ${selectedIssue.status === 'Open' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}`}>
                {selectedIssue.status === 'Open' ? '⚠️ Missing In Action' : '✓ Beat Injected'}
              </span>
            </div>
            <div className={`relative h-64 rounded-xl overflow-hidden border transition-all ${
              selectedIssue.status === 'Open' ? 'border-rose-500/60 ring-2 ring-rose-500/20' : 'border-emerald-500/60 ring-2 ring-emerald-500/20'
            }`}>
              <img
                src={selectedIssue.currentShotImg}
                alt="Current Shot"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              {/* Highlight bounding box if open */}
              {selectedIssue.status === 'Open' ? (
                <div className="absolute top-1/4 right-1/4 w-28 h-28 border-2 border-dashed border-rose-500 rounded-lg flex items-center justify-center bg-rose-500/10">
                  <span className="px-2 py-1 rounded bg-black/80 text-rose-400 text-[9px] font-bold text-center">
                    Missing Handheld Lantern
                  </span>
                </div>
              ) : (
                <div className="absolute top-1/4 right-1/4 w-28 h-28 border-2 border-emerald-500 rounded-lg flex items-center justify-center bg-emerald-500/10">
                  <span className="px-2 py-1 rounded bg-black/80 text-emerald-400 text-[9px] font-bold text-center">
                    ✓ Bench placement beat added
                  </span>
                </div>
              )}

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white/80 border border-white/10">
                  {selectedIssue.fixAction}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Audit Checklist */}
        <div className="pt-4 border-t border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-white/50 block mb-3">
            Continuous Screenplay Health Rules
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-white/80">Costume Wetness Decay</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-white/80">Vehicle Registration Plates</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-white/80">Clock & Mobile Time Progression</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs">
              <span className="text-white/80">Eye-Line & Axis of Action</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
