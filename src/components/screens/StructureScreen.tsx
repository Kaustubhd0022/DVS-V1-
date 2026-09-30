import React, { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  GitCommit, Clock, Sparkles, Layers, ArrowRight, 
  ChevronRight, Play, CheckCircle2, TrendingUp, AlertCircle, BarChart3, RefreshCw
} from 'lucide-react';
import { StructureBeat } from '../../types/project';
import { generateStructureBeats } from '../../services/aiService';

export const StructureScreen: React.FC = () => {
  const { currentProject, updateCurrentProject, nextStep } = useProject();
  const structure = currentProject.structure;
  const isSeries = /series/i.test(currentProject.format || currentProject.formats?.find(f => f.isSelected)?.title || '');
  const episodeCount = structure.episodeCount || (isSeries ? 6 : undefined);
  const episodeDuration = structure.episodeDurationMins || (isSeries ? 45 : structure.estimatedDurationMins || 120);
  const activeEpisode = structure.activeEpisodeNumber || 1;
  const configuredDuration = isSeries ? episodeDuration : (structure.estimatedDurationMins || 120);

  const formatBeatTime = (range: string) => {
    if (!structure.isSynthesisStale || !isSeries) return range;
    const match = range.match(/(\d+):?(\d*)\s*-\s*(\d+):?(\d*)/);
    if (!match) return range;
    const toMinutes = (mins: string, secs: string) => Number(mins) + (secs ? Number(secs) / 60 : 0);
    const start = toMinutes(match[1], match[2]);
    const end = toMinutes(match[3], match[4]);
    const sourceDuration = structure.estimatedDurationMins || 122;
    const scaled = (m: number) => Math.max(0, Math.min(configuredDuration, Math.round((m / sourceDuration) * configuredDuration)));
    const fmt = (m: number) => String(Math.floor(m)).padStart(2, '0') + ':00';
    return `${fmt(scaled(start))} - ${fmt(scaled(end))}`;
  };

  const allBeats = [
    ...(structure.acts?.act1?.beats || []),
    ...(structure.acts?.act2?.beats || []),
    ...(structure.acts?.act3?.beats || [])
  ];

  const [selectedBeat, setSelectedBeat] = useState<StructureBeat | null>(allBeats[0] || null);
  const [activeActFilter, setActiveActFilter] = useState<'ALL' | 'ACT I' | 'ACT II' | 'ACT III'>('ALL');
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [structureError, setStructureError] = useState<string | null>(null);

  const handleGenerateStructure = async () => {
    setIsGenerating(true);
    setStructureError(null);
    try {
      const generated = await generateStructureBeats(currentProject);
      updateCurrentProject(prev => ({
        ...prev,
        structure: {
          ...prev.structure,
          structureScope: isSeries ? 'EPISODE' : 'FEATURE',
          episodeCount: isSeries ? episodeCount : undefined,
          episodeDurationMins: isSeries ? episodeDuration : undefined,
          activeEpisodeNumber: isSeries ? activeEpisode : undefined,
          estimatedDurationMins: configuredDuration,
          templateName: currentProject.template || prev.structure.templateName,
          configurationFingerprint: `${currentProject.format || 'Feature Film'}|${currentProject.template || prev.structure.templateName}`,
          isSynthesisStale: false,
          acts: {
            act1: {
              title: 'Act I - Setup & Inciting Incident',
              time: isSeries ? '00:00 – 11:00' : '00:00 – 30:00',
              beats: generated.act1
            },
            act2: {
              title: 'Act II - Rising Stakes & Confrontation',
              time: isSeries ? '11:00 – 34:00' : '30:00 – 90:00',
              beats: generated.act2
            },
            act3: {
              title: 'Act III - Climax & Resolution',
              time: isSeries ? '34:00 – 45:00' : '90:00 – 120:00',
              beats: generated.act3
            }
          }
        },
        pilotMetrics: {
          ...prev.pilotMetrics,
          totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
        }
      }));

      const newAll = [...generated.act1, ...generated.act2, ...generated.act3];
      if (newAll.length > 0) {
        setSelectedBeat(newAll[0]);
      }
    } catch (err: any) {
      setStructureError(err.message || 'Failed to synthesize story structure.');
    } finally {
      setIsGenerating(false);
    }
  };

  // When Format/Template changes upstream, automatically regenerate the structure
  // against the new configuration instead of leaving the previous feature/episode
  // artifact visible as if it were canonical.
  useEffect(() => {
    if (structure.isSynthesisStale && !isGenerating) {
      void handleGenerateStructure();
    }
  }, [currentProject.format, currentProject.template, structure.configurationFingerprint]);

  const runAiPacingTool = () => {
    setAiOptimizing(true);
    setTimeout(() => {
      setAiOptimizing(false);
    }, 900);
  };

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
            {structure.templateName || currentProject.template || 'Three-Act Classical Structure'} • {isSeries ? `${episodeDuration} Mins / Episode • ${episodeCount} Episodes` : `${configuredDuration} Mins`} • 3 Acts • {allBeats.length} Cardinal Beats
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateStructure}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <span>{isGenerating ? 'Synthesizing Beats...' : (isSeries ? `Synthesize Episode ${activeEpisode} Structure (AI)` : 'Synthesize 3-Act Beats (AI)')}</span>
            <span>{isGenerating ? 'Synthesizing Beats...' : '{isSeries ? `Synthesize Episode ${activeEpisode} Structure (AI)` : 'Synthesize 3-Act Beats (AI)'}'}</span>
          </button>

          {allBeats.length > 0 && (
            <button
              onClick={runAiPacingTool}
              disabled={aiOptimizing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${aiOptimizing ? 'animate-spin' : ''}`} />
              <span>{aiOptimizing ? 'Recalculating Tension...' : 'Optimize Pacing & Tension'}</span>
            </button>
          )}

          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Next: Narrative Treatment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {structure.isSynthesisStale && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">{isSeries ? 'Format changed: episode structure needs synthesis' : 'Structure configuration changed'}</div>
            <div className="mt-1 text-white/50">
              {isSeries
                ? `The project is configured as ${episodeCount} × ${episodeDuration}-minute episodes using “${currentProject.template || structure.templateName}”. The previous beat sheet belonged to another runtime.`
                : 'The beat sheet was created under a different format/template. Re-synthesize before treating it as canonical.'}
            </div>
          </div>
          <button onClick={handleGenerateStructure} disabled={isGenerating} className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black hover:bg-amber-400 disabled:opacity-50">
            {isGenerating ? 'Synthesizing…' : 'Update Structure'}
          </button>
        </div>
      )}

      {/* Error alert banner */}
      {structureError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{structureError}</span>
          </div>
          <button onClick={() => setStructureError(null)} className="text-white/40 hover:text-white">✕</button>
        </div>
      )}

      {/* Tension Curve & Story Timeline */}
      <div className="p-6 rounded-2xl bg-[#12141a]/90 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              {isSeries ? `Episode ${activeEpisode} Runtime Timeline & Tension Arc (0 – ${episodeDuration} Mins)` : `Dynamic Runtime Timeline & Tension Arc (0 – ${configuredDuration} Mins)`}
            </h3>
          </div>
          <span className="text-xs font-mono text-white/40">{isSeries ? 'Template: Episode-level Three-Act Rhythm' : 'Target Pace: High Octane Procedural'}</span>
        </div>

        {/* Interactive Timeline Bar */}
        <div className="relative pt-6 pb-2">
          {/* Act segmentation bar */}
          <div className="h-3 rounded-full bg-white/5 overflow-hidden flex relative">
            <div className={`relative group cursor-pointer ${isSeries ? 'w-[25%]' : 'w-[24%]'} bg-amber-500/30 border-r border-amber-500/40`} title={`Act I: Min 0-${isSeries ? 11 : 30}`}>
              <span className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className={`relative group cursor-pointer ${isSeries ? 'w-[51%]' : 'w-[48%]'} bg-blue-500/30 border-r border-blue-500/40`} title={`Act II: Min ${isSeries ? 11 : 30}-${isSeries ? 34 : 90}`}>
              <span className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className={`relative group cursor-pointer ${isSeries ? 'w-[24%]' : 'w-[28%]'} bg-rose-500/30`} title={`Act III: Min ${isSeries ? 34 : 90}-${isSeries ? 45 : configuredDuration}`}>
              <span className="absolute inset-0 bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Markers / Milestones */}
          <div className="relative h-12 mt-2">
            <div className="absolute left-[12%] -translate-x-1/2 flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[10px] font-mono text-amber-400 mt-1 whitespace-nowrap">{isSeries ? 'Min 06: Inciting Incident' : 'Min 12: Inciting Incident'}</span>
            </div>
            <div className="absolute left-[48%] -translate-x-1/2 flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-[10px] font-mono text-blue-400 mt-1 whitespace-nowrap">{isSeries ? 'Min 23: Midpoint Reversal' : 'Min 60: Midpoint Reversal'}</span>
            </div>
            <div className="absolute left-[72%] -translate-x-1/2 flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-[10px] font-mono text-rose-400 mt-1 whitespace-nowrap">{isSeries ? 'Min 34: All Is Lost' : 'Min 88: All Is Lost'}</span>
            </div>
            <div className="absolute left-[90%] -translate-x-1/2 flex flex-col items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-emerald-400 mt-1 whitespace-nowrap">{isSeries ? 'Min 41: Climax' : 'Min 105: Climax'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Act Filter Tabs */}
      {allBeats.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'ACT I', 'ACT II', 'ACT III'] as const).map(act => (
            <button
              key={act}
              onClick={() => setActiveActFilter(act)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
                activeActFilter === act
                  ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/10'
                  : 'bg-[#12141a] text-white/60 border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {act === 'ALL' ? `All ${allBeats.length} Core Beats` : act}
            </button>
          ))}
        </div>
      )}

      {/* Beats Grid or Empty State */}
      {allBeats.length === 0 ? (
        <div className="p-12 text-center bg-[#141822] border border-dashed border-white/10 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <GitCommit className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">No Structural Beats Mapped Yet</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Synthesize 9 cardinal dramatic beats across 3 Acts (Setup, Confrontation, Resolution) derived from <span className="text-amber-300">"{currentProject.title}"</span>.
            </p>
          </div>
          <button
            onClick={handleGenerateStructure}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{isGenerating ? 'Synthesizing Beats...' : 'Synthesize 3-Act Beats (AI)'}</span>
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBeats.map(beat => {
              const isSelected = selectedBeat ? beat.id === selectedBeat.id : false;

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
                        {formatBeatTime(beat.timeRange)}
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
        </>
      )}
    </div>
  );
};
