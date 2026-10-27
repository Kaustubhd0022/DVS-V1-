import React, { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  GitCommit, Clock, Sparkles, Layers, ArrowRight, 
  ChevronRight, Play, CheckCircle2, TrendingUp, AlertCircle, BarChart3, RefreshCw,
  Tv, Film, BookOpen, Users, Compass, Shield, Award, Check, ExternalLink, Flame
} from 'lucide-react';
import { SeriesEpisode, StructureBeat, CanonicalState } from '../../types/project';
import { generateStructureBeats } from '../../services/aiService';
import { getCanonicalConfiguration } from '../../services/projectConfiguration';

export const StructureScreen: React.FC = () => {
  const { 
    currentProject, 
    updateCurrentProject, 
    fetchSeriesEpisodes, 
    updateSeriesEpisode, 
    nextStep 
  } = useProject();

  const structure = currentProject.structure;
  const isSeries = /series/i.test(currentProject.format || currentProject.formats?.find(f => f.isSelected)?.title || '');
  const parsedFromFormat = currentProject.format?.match(/(\d+)\s*(?:episod(?:e|ic)?|ep|part)/i)?.[1]
    || currentProject.title?.match(/(\d+)\s*(?:episod(?:e|ic)?|ep|part)/i)?.[1];
  const episodeCount = currentProject.dynamicFormat?.episodeCount 
    || structure.episodeCount 
    || (parsedFromFormat ? parseInt(parsedFromFormat, 10) : undefined) 
    || (isSeries ? 10 : undefined);
  const episodeDuration = structure.episodeDurationMins || (isSeries ? 45 : structure.estimatedDurationMins || 120);
  const activeEpisode = structure.activeEpisodeNumber || 1;
  const configuredDuration = isSeries ? episodeDuration : (structure.estimatedDurationMins || 120);

  const episodes = currentProject.episodes || [];
  const hasEpisodes = episodes.length > 0;

  // View mode: 'architecture' (Season Episode Grid) vs 'beats' (Act 1-3 minute beats)
  const [structureMode, setStructureMode] = useState<'architecture' | 'beats'>(
    isSeries && hasEpisodes ? 'architecture' : isSeries ? 'architecture' : 'beats'
  );

  const [activeEpisodeFilter, setActiveEpisodeFilter] = useState<'ALL' | 'ACT_I' | 'ACT_II_A' | 'ACT_II_B' | 'ACT_III'>('ALL');
  const [isGeneratingEpisodes, setIsGeneratingEpisodes] = useState(false);
  const [selectedEpDetail, setSelectedEpDetail] = useState<SeriesEpisode | null>(episodes[0] || null);

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

  const handleSynthesizeEpisodes = async () => {
    setIsGeneratingEpisodes(true);
    setStructureError(null);
    try {
      const targetCount = episodeCount || 10;
      await fetchSeriesEpisodes(targetCount);
    } catch (err: any) {
      setStructureError(err.message || 'Failed to synthesize series episodic architecture.');
    } finally {
      setIsGeneratingEpisodes(false);
    }
  };

  const handlePromoteEpisodeState = (epNumber: number, nextState: CanonicalState) => {
    updateSeriesEpisode(epNumber, {
      candidateState: nextState,
      status: nextState === 'APPROVED' ? 'DEVELOPING' : nextState === 'CANONICAL' ? 'LOCKED' : 'PLANNED'
    });
  };

  const handleSelectActiveEpisodeBeats = (epNumber: number) => {
    updateCurrentProject(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        activeEpisodeNumber: epNumber
      },
      projectConfig: {
        ...prev.projectConfig!,
        activeEpisodeNumber: epNumber
      }
    }));
    setStructureMode('beats');
  };

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
          configurationFingerprint: getCanonicalConfiguration(prev).configurationFingerprint,
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

  useEffect(() => {
    if (structure.isSynthesisStale && !isGenerating && structureMode === 'beats') {
      void handleGenerateStructure();
    }
  }, [currentProject.format, currentProject.template, structure.configurationFingerprint]);

  const runAiPacingTool = async () => {
    setAiOptimizing(true);
    try {
      const generated = await generateStructureBeats(currentProject);
      updateCurrentProject(prev => ({
        ...prev,
        structure: {
          ...prev.structure,
          acts: {
            act1: { title: 'Act I - Setup & Inciting Incident', time: '0-25m', beats: generated.act1 },
            act2: { title: 'Act II - Rising Stakes & Confrontation', time: '25-85m', beats: generated.act2 },
            act3: { title: 'Act III - Climax & Resolution', time: '85-110m', beats: generated.act3 }
          }
        },
        pilotMetrics: {
          ...prev.pilotMetrics,
          totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
        }
      }));
    } catch (err) {
      console.warn('AI Pacing recalculation error:', err);
    } finally {
      setAiOptimizing(false);
    }
  };

  const filteredBeats = activeActFilter === 'ALL'
    ? allBeats
    : allBeats.filter(b => b.act.startsWith(activeActFilter));

  // Dynamically calculate quadrant act boundaries for whatever number of episodes (e.g. 10, 8, 16, 24)
  const totalCount = episodes.length || episodeCount || 10;
  const q1End = Math.max(1, Math.round(totalCount * 0.25));
  const q2End = Math.max(q1End + 1, Math.round(totalCount * 0.5));
  const q3End = Math.max(q2End + 1, Math.round(totalCount * 0.75));

  const filteredEpisodes = episodes.filter(ep => {
    if (activeEpisodeFilter === 'ALL') return true;
    if (activeEpisodeFilter === 'ACT_I') return ep.episodeNumber >= 1 && ep.episodeNumber <= q1End;
    if (activeEpisodeFilter === 'ACT_II_A') return ep.episodeNumber >= q1End + 1 && ep.episodeNumber <= q2End;
    if (activeEpisodeFilter === 'ACT_II_B') return ep.episodeNumber >= q2End + 1 && ep.episodeNumber <= q3End;
    if (activeEpisodeFilter === 'ACT_III') return ep.episodeNumber >= q3End + 1 && ep.episodeNumber <= totalCount;
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header (Linea Bento Style) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
              Pipeline Step 08
            </span>
            <span className="text-xs text-stone-400 font-mono">• Narrative Mechanics & Structural Architecture</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-[#fbf8f3] flex items-center gap-3">
            Story Structure & Dynamic Architecture
          </h1>
          <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
            {structure.templateName || currentProject.template || 'Three-Act Classical Structure'} • {isSeries ? `${episodeDuration} Mins / Episode • ${episodeCount || 10} Episodes` : `${configuredDuration} Mins`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Series Architecture Mode Switcher (Linea Pill Capsule) */}
          {isSeries && (
            <div className="flex items-center p-1.5 rounded-full bg-[#131724] border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => setStructureMode('architecture')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  structureMode === 'architecture'
                    ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Season Architecture ({episodes.length || episodeCount || 10} Ep)</span>
              </button>

              <button
                type="button"
                onClick={() => setStructureMode('beats')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  structureMode === 'beats'
                    ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Episode {activeEpisode} Beat Sheet</span>
              </button>
            </div>
          )}

          {structureMode === 'architecture' ? (
            <button
              onClick={handleSynthesizeEpisodes}
              disabled={isGeneratingEpisodes}
              className="linea-pill-btn linea-pill-primary px-5 py-2.5 text-xs font-bold gap-2 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingEpisodes ? 'animate-spin' : ''}`} />
              <span>{isGeneratingEpisodes ? `Synthesizing ${episodeCount || 10} Episodes...` : `Synthesize ${episodeCount || 10}-Episode Architecture (Groq LPU)`}</span>
              <span className="linea-btn-wave" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          ) : (
            <button
              onClick={handleGenerateStructure}
              disabled={isGenerating}
              className="linea-pill-btn linea-pill-primary px-5 py-2.5 text-xs font-bold gap-2 disabled:opacity-50"
            >
              <span>{isGenerating ? 'Synthesizing Beats...' : (isSeries ? `Synthesize Episode ${activeEpisode} Beats (AI)` : 'Synthesize 3-Act Beats (AI)')}</span>
              <span className="linea-btn-wave" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          )}

          <button
            onClick={nextStep}
            className="linea-pill-btn linea-pill-secondary px-5 py-2.5 text-xs font-semibold gap-2 border border-white/10"
          >
            <span>Next: Narrative Treatment</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Error alert banner */}
      {structureError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{structureError}</span>
          </div>
          <button onClick={() => setStructureError(null)} className="text-white/40 hover:text-white">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 1: DYNAMIC 16-EPISODE SERIES ARCHITECTURE (PHASE 8 ACCEPTANCE)       */}
      {/* ========================================================================= */}
      {structureMode === 'architecture' && isSeries && (
        <div className="space-y-6">
          {/* Season Intelligence Metrics Bar (Linea Bento) */}
          <div className="linea-bento p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-amber-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_2px_12px_rgba(245,158,11,0.2)]">
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">{episodeCount || episodes.length || 10}-Episode Serialized Series Engine</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                    Prestige Narrative Architecture
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#fbf8f3] mt-1">
                  Master Season Arc: <span className="text-amber-300">{currentProject.title}</span>
                </h2>
                <p className="text-xs text-stone-300 mt-1 max-w-3xl leading-relaxed">
                  Sequencing {episodeCount || episodes.length || 10} interconnected episodes with distinct focus, turning points, multi-faction allegiances, and evidence citations.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-xs text-stone-400 font-mono">Canonical Progress</div>
                <div className="text-sm font-mono font-bold text-amber-400">
                  {episodes.filter(e => e.candidateState === 'APPROVED' || e.candidateState === 'CANONICAL').length} / {episodes.length || episodeCount || 10} Approved
                </div>
              </div>
            </div>
          </div>

          {/* Quadrant / Act Filters for Season Arc (Linea Pill Tabs) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-400 uppercase font-mono tracking-wider mr-2">Season Arcs:</span>
              <button
                type="button"
                onClick={() => setActiveEpisodeFilter('ALL')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                  activeEpisodeFilter === 'ALL'
                    ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-[#141824] hover:bg-white/10 text-stone-300 hover:text-white border-white/10'
                }`}
              >
                All {episodes.length || episodeCount || 10} Episodes
              </button>

              <button
                type="button"
                onClick={() => setActiveEpisodeFilter('ACT_I')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                  activeEpisodeFilter === 'ACT_I'
                    ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-[#141824] hover:bg-white/10 text-stone-300 hover:text-white border-white/10'
                }`}
              >
                Act I: The Spark (Ep 1–{q1End})
              </button>

              <button
                type="button"
                onClick={() => setActiveEpisodeFilter('ACT_II_A')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                  activeEpisodeFilter === 'ACT_II_A'
                    ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-[#141824] hover:bg-white/10 text-stone-300 hover:text-white border-white/10'
                }`}
              >
                Act II-A: Escalation (Ep {q1End + 1}–{q2End})
              </button>

              <button
                type="button"
                onClick={() => setActiveEpisodeFilter('ACT_II_B')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                  activeEpisodeFilter === 'ACT_II_B'
                    ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-[#141824] hover:bg-white/10 text-stone-300 hover:text-white border-white/10'
                }`}
              >
                Act II-B: Crisis & Siege (Ep {q2End + 1}–{q3End})
              </button>

              <button
                type="button"
                onClick={() => setActiveEpisodeFilter('ACT_III')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                  activeEpisodeFilter === 'ACT_III'
                    ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-[#141824] hover:bg-white/10 text-stone-300 hover:text-white border-white/10'
                }`}
              >
                Act III: The Reckoning (Ep {q3End + 1}–{totalCount})
              </button>
            </div>

            <div className="text-xs text-white/50 font-mono">
              Displaying {filteredEpisodes.length} Episodes
            </div>
          </div>

          {/* Empty State if Episodes Not Synthesized */}
          {!hasEpisodes ? (
            <div className="linea-bento p-12 text-center space-y-4 border-amber-500/30">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-[0_2px_16px_rgba(245,158,11,0.2)]">
                <Tv className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-lg mx-auto">
                <h3 className="text-lg font-bold text-white">{episodeCount || 10}-Episode Series Architecture Ready to Synthesize</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Tattava Copilot will synthesize all {episodeCount || 10} episodic chapters, establishing the historical focus, narrative engine, character involvements, and unresolved debates per episode.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSynthesizeEpisodes}
                disabled={isGeneratingEpisodes}
                className="linea-pill-btn linea-pill-primary px-6 py-3 text-xs font-bold gap-2"
              >
                <Sparkles className={`w-4 h-4 ${isGeneratingEpisodes ? 'animate-spin' : ''}`} />
                <span>{isGeneratingEpisodes ? 'Synthesizing Season Architecture with Groq LPU...' : `Synthesize ${episodeCount || 10}-Episode Master Architecture`}</span>
                <span className="linea-btn-wave" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </button>
            </div>
          ) : (
            /* Episode Cards Grid (Linea Bento Cards) */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {filteredEpisodes.map(ep => {
                const isSelected = selectedEpDetail?.episodeNumber === ep.episodeNumber;
                const isApproved = ep.candidateState === 'APPROVED' || ep.candidateState === 'CANONICAL';

                return (
                  <div
                    key={ep.episodeNumber}
                    onClick={() => setSelectedEpDetail(ep)}
                    className={`rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between cursor-pointer group shadow-xl ${
                      isSelected
                        ? 'bg-[#151926] border-amber-400 shadow-[0_4px_24px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/60'
                        : 'bg-[#121622]/90 hover:bg-[#161a28] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Card Header */}
                      <div className="flex items-center justify-between">
                        <span className="w-8 h-8 rounded-full bg-black/60 border border-white/15 flex items-center justify-center font-mono font-bold text-xs text-amber-300 shadow-inner">
                          {ep.episodeNumber < 10 ? `0${ep.episodeNumber}` : ep.episodeNumber}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          ep.candidateState === 'CANONICAL'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {ep.candidateState || 'AI_PROPOSAL'}
                        </span>
                      </div>

                      {/* Episode Title & Function */}
                      <div>
                        <h4 className="text-base font-bold text-[#fbf8f3] group-hover:text-amber-300 transition-colors line-clamp-1">
                          {ep.title}
                        </h4>
                        <span className="text-[11px] font-semibold text-amber-400/90 block mt-0.5 line-clamp-1">
                          {ep.narrativeFunction}
                        </span>
                      </div>

                      {/* Historical Focus */}
                      <div className="flex items-start gap-1.5 text-xs text-stone-300/80 bg-black/40 p-2.5 rounded-2xl border border-white/5">
                        <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{ep.historicalFocus}</span>
                      </div>

                      {/* Synopsis */}
                      <p className="text-xs text-stone-300/90 line-clamp-3 leading-relaxed">
                        {ep.synopsis}
                      </p>

                      {/* Character Involvement */}
                      {ep.characterInvolvement && ep.characterInvolvement.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Characters:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {ep.characterInvolvement.map((c, i) => (
                              <span key={i} className="px-2.5 py-0.5 rounded-full bg-white/5 text-[10px] text-stone-200 border border-white/10">
                                {c.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions (Linea Pill Buttons) */}
                    <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePromoteEpisodeState(ep.episodeNumber, isApproved ? 'CANONICAL' : 'APPROVED');
                        }}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                          isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-white/5 hover:bg-amber-500/20 text-stone-300 hover:text-amber-200 border border-white/10'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>{ep.candidateState === 'CANONICAL' ? 'Locked Canon' : isApproved ? 'Approved' : 'Approve'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectActiveEpisodeBeats(ep.episodeNumber);
                        }}
                        className="linea-pill-btn linea-pill-secondary px-3 py-1.5 text-[11px] font-semibold text-amber-300 hover:text-white border border-amber-500/30 gap-1"
                      >
                        <span>Draft Beats</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Episode Inspector Drawer / Detail Card */}
          {selectedEpDetail && hasEpisodes && (
            <div className="p-6 rounded-2xl bg-[#141824] border border-amber-500/30 space-y-4 animate-fadeIn">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-bold flex items-center justify-center text-sm">
                    Ep {selectedEpDetail.episodeNumber}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedEpDetail.title}</h3>
                    <div className="text-xs text-amber-400 font-semibold">{selectedEpDetail.narrativeFunction}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handlePromoteEpisodeState(selectedEpDetail.episodeNumber, 'APPROVED')}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Episode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectActiveEpisodeBeats(selectedEpDetail.episodeNumber)}
                    className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                  >
                    <span>Work on Episode {selectedEpDetail.episodeNumber} Beats</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block">Historical Focus & Turning Point:</span>
                    <p className="text-white/80 mt-1">{selectedEpDetail.historicalFocus}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block">Dramatic Synopsis:</span>
                    <p className="text-white/80 mt-1 leading-relaxed">{selectedEpDetail.synopsis}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-white/40 block">Character Arc Beats:</span>
                    <div className="mt-1 space-y-1.5">
                      {selectedEpDetail.characterInvolvement?.map((c, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/5">
                          <span className="font-bold text-amber-300">{c.name} ({c.role}):</span>{' '}
                          <span className="text-white/70">{c.arcBeat || 'Primary dramatic engagement'}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedEpDetail.unresolvedIssues && selectedEpDetail.unresolvedIssues.length > 0 && (
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400/90 block">Unresolved Scholarly / Narrative Debates:</span>
                      <ul className="mt-1 list-disc list-inside text-white/70 space-y-0.5">
                        {selectedEpDetail.unresolvedIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: ACT BEAT SHEET (EPISODE OR FEATURE BEATS)                        */}
      {/* ========================================================================= */}
      {(structureMode === 'beats' || !isSeries) && (
        <>
          {structure.isSynthesisStale && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold">{isSeries ? `Episode ${activeEpisode} beat structure needs synthesis` : 'Structure configuration changed'}</div>
                <div className="mt-1 text-white/50">
                  {isSeries
                    ? `The project is configured as ${episodeCount} × ${episodeDuration}-minute episodes using “${currentProject.template || structure.templateName}”.`
                    : 'The beat sheet was created under a different format/template. Re-synthesize before treating it as canonical.'}
                </div>
              </div>
              <button onClick={handleGenerateStructure} disabled={isGenerating} className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black hover:bg-amber-400 disabled:opacity-50">
                {isGenerating ? 'Synthesizing…' : 'Update Structure'}
              </button>
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
                  <span className="text-[10px] font-mono text-rose-400 mt-1 whitespace-nowrap">{isSeries ? 'Min 34: Crisis Reversal' : 'Min 90: Crisis Reversal'}</span>
                </div>
                <div className="absolute left-[92%] -translate-x-1/2 flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-mono text-rose-500 mt-1 whitespace-nowrap">{isSeries ? `Min ${episodeDuration}: Climax` : `Min ${configuredDuration}: Climax`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Act Filter Tabs */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              {(['ALL', 'ACT I', 'ACT II', 'ACT III'] as const).map(act => (
                <button
                  key={act}
                  onClick={() => setActiveActFilter(act)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeActFilter === act
                      ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                      : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                  }`}
                >
                  {act === 'ALL' ? (isSeries ? `All Episode ${activeEpisode} Beats (${allBeats.length})` : `All Beats (${allBeats.length})`) : act}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {allBeats.length > 0 && (
                <button
                  onClick={runAiPacingTool}
                  disabled={aiOptimizing}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${aiOptimizing ? 'animate-spin' : ''}`} />
                  <span>{aiOptimizing ? 'Recalculating Tension...' : 'Optimize Pacing & Tension'}</span>
                </button>
              )}

              <span className="text-xs text-white/40 font-mono">
                {filteredBeats.length} of {allBeats.length} Beats Displayed
              </span>
            </div>
          </div>

          {/* Beats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBeats.map(beat => {
              const isSelected = selectedBeat?.id === beat.id;
              return (
                <div
                  key={beat.id}
                  onClick={() => setSelectedBeat(beat)}
                  className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-950/40 to-black/80 border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500'
                      : 'bg-[#12141a]/80 hover:bg-[#161822] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="relative h-28 overflow-hidden bg-black/40">
                    <img
                      src={beat.imageUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80'}
                      alt={beat.title}
                      className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/80 text-amber-400 border border-amber-500/30">
                        {beat.act} • {formatBeatTime(beat.timeRange)}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-xs font-mono font-bold text-white/80">
                        {beat.number}
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
                    {selectedBeat.act} • {formatBeatTime(selectedBeat.timeRange)}
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
