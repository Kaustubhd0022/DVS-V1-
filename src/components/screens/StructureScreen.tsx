import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  GitCommit, Clock, Sparkles, Layers, ArrowRight, 
  ChevronRight, Play, CheckCircle2, TrendingUp, AlertCircle, BarChart3 
} from 'lucide-react';
import { StructureBeat } from '../../types/project';

export const StructureScreen: React.FC = () => {
  const { currentProject, nextStep } = useProject();
  const structure = currentProject.structure;

  const [selectedBeat, setSelectedBeat] = useState<StructureBeat>(structure.acts.act1.beats[0]);
  const [activeActFilter, setActiveActFilter] = useState<'ALL' | 'ACT I' | 'ACT II' | 'ACT III'>('ALL');
  const [aiOptimizing, setAiOptimizing] = useState(false);

  const runAiPacingTool = () => {
    setAiOptimizing(true);
    setTimeout(() => {
      setAiOptimizing(false);
    }, 900);
  };

  const allBeats = [
    ...structure.acts.act1.beats,
    ...structure.acts.act2.beats,
    ...structure.acts.act3.beats
  ];

  const filteredBeats = activeActFilter === 'ALL'
    ? allBeats
    : allBeats.filter(b => b.act.startsWith(activeActFilter));

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Pipeline Step 08
            </span>
            <span className="text-xs text-white/40">• Narrative Mechanics & Turning Points</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Story Structure & Dramatic Beats
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            {structure.templateName} • {structure.estimatedDurationMins} Mins • 3 Acts • 8 Sequences • {allBeats.length} Cardinal Beats
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runAiPacingTool}
            disabled={aiOptimizing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${aiOptimizing ? 'animate-spin' : ''}`} />
            <span>{aiOptimizing ? 'Recalculating Tension...' : 'Optimize Pacing & Tension'}</span>
          </button>
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Next: Narrative Treatment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tension Curve & Story Timeline */}
      <div className="p-6 rounded-2xl bg-[#12141a]/90 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Dynamic Runtime Timeline & Tension Arc (0 – 125 Mins)
            </h3>
          </div>
          <span className="text-xs font-mono text-white/40">Target Pace: High Octane Procedural</span>
        </div>

        {/* Interactive Timeline Bar */}
        <div className="relative pt-6 pb-2">
          {/* Act segmentation bar */}
          <div className="h-3 rounded-full bg-white/5 overflow-hidden flex relative">
            <div className="w-[24%] bg-amber-500/30 border-r border-amber-500/40 relative group cursor-pointer" title="Act I: Min 0-30">
              <span className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="w-[48%] bg-blue-500/30 border-r border-blue-500/40 relative group cursor-pointer" title="Act II: Min 30-90">
              <span className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="w-[28%] bg-rose-500/30 relative group cursor-pointer" title="Act III: Min 90-125">
              <span className="absolute inset-0 bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Markers / Milestones */}
          <div className="relative h-12 mt-2">
            {structure.timeline.map((m, idx) => {
              const leftPercent = (m.timeMin / structure.estimatedDurationMins) * 100;
              return (
                <div
                  key={idx}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute -translate-x-1/2 flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20 group-hover:scale-125 transition-transform" />
                  <span className="text-[10px] font-mono text-white/50 group-hover:text-amber-300 transition-colors mt-1 font-bold whitespace-nowrap">
                    {m.timeMin}m
                  </span>
                  <span className="text-[10px] text-white/70 group-hover:text-white font-medium whitespace-nowrap hidden sm:block">
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Act Label indicators */}
          <div className="flex justify-between text-[11px] font-bold text-white/40 pt-1 border-t border-white/5 font-mono">
            <div className="w-[24%]">ACT I: SETUP (0 – 30m)</div>
            <div className="w-[48%] text-center">ACT II: CONFRONTATION & MIDPOINT (30 – 90m)</div>
            <div className="w-[28%] text-right">ACT III: RESOLUTION (90 – 125m)</div>
          </div>
        </div>
      </div>

      {/* Act Filter Tabs */}
      <div className="flex items-center gap-3">
        {(['ALL', 'ACT I', 'ACT II', 'ACT III'] as const).map(act => (
          <button
            key={act}
            onClick={() => setActiveActFilter(act)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
              activeActFilter === act
                ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/10'
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            {act === 'ALL' ? 'All 10 Core Beats' : act}
          </button>
        ))}
      </div>

      {/* Beats Grid & Detail Modal/Drawer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBeats.map(beat => {
          const isSelected = beat.id === selectedBeat.id;

          return (
            <div
              key={beat.id}
              onClick={() => setSelectedBeat(beat)}
              className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-950/40 via-[#161822] to-[#12141a] border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500'
                  : 'bg-[#12141a]/90 hover:bg-[#161822] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={beat.imageUrl}
                  alt={beat.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-[#12141a]/40 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-black font-mono font-bold text-xs flex items-center justify-center">
                    {beat.number}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/70 text-white/80 border border-white/10">
                    {beat.act.split(' - ')[0]}
                  </span>
                </div>

                <div className="absolute bottom-2.5 right-3">
                  <span className="text-xs font-mono text-amber-300 px-2 py-0.5 rounded bg-black/70 border border-white/10">
                    {beat.timeRange}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className={`text-base font-bold transition-colors ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                    {beat.title}
                  </h4>
                  <p className="text-xs text-white/70 mt-2 leading-relaxed">
                    {beat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <span className="text-white/40">Linked to Scenes</span>
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    Inspect <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Beat Inspection Banner */}
      {selectedBeat && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-black/80 via-[#181b26]/80 to-black/80 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg font-mono shrink-0">
              #{selectedBeat.number}
            </div>
            <div>
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                {selectedBeat.act} • {selectedBeat.timeRange}
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">{selectedBeat.title}</h3>
              <p className="text-xs text-white/70 mt-1 max-w-3xl">{selectedBeat.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Structural Beat Validated
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
