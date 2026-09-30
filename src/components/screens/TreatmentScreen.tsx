import React, { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  FileText, Sparkles, CheckCircle2, ArrowRight, 
  BookOpen, Edit3, ShieldCheck, Download, Share2, Eye, ListChecks, Brain,
  RefreshCw, AlertCircle
} from 'lucide-react';
import { PlotBeatItem } from '../../types/project';
import { generateTreatmentData } from '../../services/aiService';

export const TreatmentScreen: React.FC = () => {
  const { currentProject, updateTreatment, nextStep, openContextResolver } = useProject();
  const isSeries = /series/i.test(currentProject.format || currentProject.formats?.find(f => f.isSelected)?.title || '');
  const episodeDuration = currentProject.structure?.episodeDurationMins || (isSeries ? 45 : currentProject.structure?.estimatedDurationMins || 120);
  const episodeCount = currentProject.structure?.episodeCount || (isSeries ? 6 : undefined);
  const activeEpisode = currentProject.structure?.activeEpisodeNumber || 1;
  const configurationFingerprint = (currentProject.format || 'Feature Film') + '|' + (currentProject.template || 'Three-Act Classical Thriller');

  const treatment = currentProject.treatment || {
    version: 'v0.1',
    wordCount: 0,
    logline: currentProject.intent?.premise || '',
    synopsis: '',
    themes: [],
    tone: [],
    status: 'DRAFT',
    plotBeats: [],
    checklist: []
  };

  const plotBeats = treatment.plotBeats || [];
  const tones = treatment.tone || [];
  const checklist = treatment.checklist || [];

  const [activeAct, setActiveAct] = useState<'ALL' | 'ACT I' | 'ACT II' | 'ACT III'>('ALL');
  const [isEditingSynopsis, setIsEditingSynopsis] = useState(false);
  const [synopsisText, setSynopsisText] = useState(treatment.synopsis || '');
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [treatmentError, setTreatmentError] = useState<string | null>(null);

  const handleSaveSynopsis = () => {
    updateTreatment({ synopsis: synopsisText, wordCount: synopsisText.split(/\s+/).filter(Boolean).length });
    setIsEditingSynopsis(false);
  };

  const handleSynthesizeTreatment = async () => {
    setIsSynthesizing(true);
    setTreatmentError(null);
    try {
      const generated = await generateTreatmentData(currentProject);
      updateTreatment({
        synopsis: generated.synopsis,
        wordCount: generated.synopsis.split(/\s+/).filter(Boolean).length,
        tone: generated.tone,
        themes: generated.themes,
        plotBeats: generated.plotBeats,
        status: 'IN_REVIEW',
        configurationFingerprint,
        isSynthesisStale: false
      });
      setSynopsisText(generated.synopsis);
    } catch (err: any) {
      setTreatmentError(err.message || 'AI service error generating treatment.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  useEffect(() => {
    if (treatment.isSynthesisStale && !isSynthesizing) {
      void handleSynthesizeTreatment();
    }
  }, [currentProject.format, currentProject.template, treatment.configurationFingerprint, treatment.isSynthesisStale]);

  const runAiEnhancement = () => {
    setAiEnhancing(true);
    setTimeout(() => {
      setAiEnhancing(false);
    }, 1000);
  };

  const filteredBeats = activeAct === 'ALL'
    ? plotBeats
    : plotBeats.filter(b => b.act === activeAct);

  const wordCount = treatment.wordCount || (treatment.synopsis ? treatment.synopsis.split(/\s+/).filter(Boolean).length : 0);

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Pipeline Step 10
            </span>
            <span className="text-xs text-white/40">• Comprehensive Prose Blueprint</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Narrative Treatment & Prose Dossier
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            Version {treatment.version || 'v0.1'} • {wordCount.toLocaleString()} Words • {isSeries ? `Episode ${activeEpisode}/${episodeCount} • ${episodeDuration} min` : 'Feature'} • Complete Narrative Spine for <strong className="text-white">"{currentProject.title}"</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSynthesizeTreatment}
            disabled={isSynthesizing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
            <span>{isSynthesizing ? 'Synthesizing Treatment...' : 'Synthesize Treatment (AI)'}</span>
          </button>
          <button
            onClick={() => openContextResolver('Treatment Beat', 'Prose Synopsis Draft')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scoped Context</span>
          </button>
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Next: Scene Breakdown</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

{treatment.isSynthesisStale && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold">{isSeries ? 'Format changed: episode treatment needs synthesis' : 'Treatment configuration changed'}</div>
            <div className="mt-1 text-white/50">{isSeries ? `Generating the narrative treatment for Episode ${activeEpisode} of ${episodeCount} at ${episodeDuration} minutes.` : 'The previous treatment belongs to another format/template.'}</div>
          </div>
          <button onClick={handleSynthesizeTreatment} disabled={isSynthesizing} className="shrink-0 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black hover:bg-amber-400 disabled:opacity-50">{isSynthesizing ? 'Synthesizing…' : 'Update Treatment'}</button>
        </div>
      )}

            {treatmentError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{treatmentError}</span>
          </div>
          <button onClick={() => setTreatmentError(null)} className="text-white/40 hover:text-white">✕</button>
        </div>
      )}

      {/* Metadata Pill Bar */}
      <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-white/60">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Word Count: <strong className="text-white">{wordCount.toLocaleString()}</strong></span>
          </span>
          <span className="text-white/20">•</span>
          <span className="text-white/60">
            Reading Time: <strong className="text-white">~{Math.max(1, Math.round(wordCount / 200))} Mins</strong>
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" /> Status: {treatment.status || 'DRAFT'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {tones.length === 0 ? (
            <span className="text-white/40 text-[11px] italic">No tones assigned</span>
          ) : (
            tones.map((t, idx) => (
              <span key={idx} className="px-2.5 py-0.5 rounded bg-white/5 text-white/70 border border-white/10 font-mono text-[11px]">
                {t}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Main Grid: Left Prose Document, Right Plot Beats & Checklist */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Treatment Document Viewer (7 cols) */}
        <div className="xl:col-span-7 bg-[#12141a]/95 rounded-2xl border border-white/10 p-6 space-y-6 flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">Executive Logline</span>
              <h2 className="text-sm font-semibold text-white/90 italic mt-1 leading-relaxed">
                "{treatment.logline || currentProject.intent?.premise || 'No logline defined yet.'}"
              </h2>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                Narrative Synopsis & Thematic Progression
              </span>
              {isEditingSynopsis ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingSynopsis(false)}
                    className="text-xs text-white/40 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSynopsis}
                    className="px-3 py-1 rounded bg-amber-500 text-black text-xs font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingSynopsis(true)}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit Prose
                </button>
              )}
            </div>

            {isEditingSynopsis ? (
              <textarea
                value={synopsisText}
                onChange={(e) => setSynopsisText(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-xl bg-black/60 border border-amber-500 text-white/90 text-sm leading-relaxed focus:outline-none font-serif resize-none"
              />
            ) : !treatment.synopsis ? (
              <div className="p-8 text-center bg-black/40 border border-white/5 rounded-xl space-y-3">
                <p className="text-xs text-white/50">
                  No narrative synopsis drafted yet for "{currentProject.title}".
                </p>
                <button
                  onClick={handleSynthesizeTreatment}
                  disabled={isSynthesizing}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Draft Synopsis with AI</span>
                </button>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-black/40 border border-white/5 text-sm text-white/80 leading-relaxed space-y-4 font-serif">
                <p className="whitespace-pre-line">{treatment.synopsis}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 12 Plot Beats Board & Treatment Quality Checklist (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Plot Beats Board */}
          <div className="bg-[#12141a]/95 rounded-2xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Cardinal Plot Beats ({plotBeats.length})
                </h3>
                <p className="text-[11px] text-white/50">Progression from Opening Image to Final Resolution</p>
              </div>

              {/* Act Filter */}
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-white/10">
                {(['ALL', 'ACT I', 'ACT II', 'ACT III'] as const).map(act => (
                  <button
                    key={act}
                    onClick={() => setActiveAct(act)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      activeAct === act ? 'bg-amber-500 text-black' : 'text-white/50 hover:text-white'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            {plotBeats.length === 0 ? (
              <div className="p-8 text-center bg-black/30 border border-dashed border-white/10 rounded-xl space-y-3">
                <p className="text-xs text-white/50">
                  No cardinal plot beats mapped yet.
                </p>
                <button
                  onClick={handleSynthesizeTreatment}
                  disabled={isSynthesizing}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesize Plot Beats (AI)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {filteredBeats.map(beat => (
                  <div
                    key={beat.id}
                    className="p-3.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-amber-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/10 text-amber-400 text-[10px] font-mono flex items-center justify-center">
                          {beat.number}
                        </span>
                        {beat.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                        {beat.act}
                      </span>
                    </div>
                    <p className="text-xs text-white/60 mt-1.5 pl-7 leading-relaxed">
                      {beat.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quality Audit Checklist */}
          <div className="bg-[#12141a]/95 rounded-2xl border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-400" />
                Treatment Quality Audit
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                {treatment.synopsis && plotBeats.length > 0 ? 'Ready' : 'In Progress'}
              </span>
            </div>

            <div className="space-y-2">
              {(checklist.length === 0 ? [
                { item: 'Logline Approved', completed: !!treatment.logline },
                { item: 'Core Protagonist Flaw Defined', completed: currentProject.characters.length > 0 },
                { item: 'Act I Inciting Incident Established', completed: plotBeats.some(b => b.act === 'ACT I') },
                { item: 'Midpoint Reversal Mapped', completed: plotBeats.some(b => b.act === 'ACT II') },
                { item: 'Climax & Thematic Resolution', completed: plotBeats.some(b => b.act === 'ACT III') }
              ] : checklist).map((chk, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-xs text-white/80">{chk.item}</span>
                  <CheckCircle2 className={`w-4 h-4 shrink-0 ${chk.completed ? 'text-emerald-400' : 'text-white/20'}`} />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

