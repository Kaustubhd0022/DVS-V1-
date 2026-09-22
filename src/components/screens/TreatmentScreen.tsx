import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  FileText, Sparkles, CheckCircle2, ArrowRight, 
  BookOpen, Edit3, ShieldCheck, Download, Share2, Eye, ListChecks
} from 'lucide-react';
import { PlotBeatItem } from '../../types/project';

export const TreatmentScreen: React.FC = () => {
  const { currentProject, updateTreatment, nextStep } = useProject();
  const treatment = currentProject.treatment;

  const [activeAct, setActiveAct] = useState<'ALL' | 'ACT I' | 'ACT II' | 'ACT III'>('ALL');
  const [isEditingSynopsis, setIsEditingSynopsis] = useState(false);
  const [synopsisText, setSynopsisText] = useState(treatment.synopsis);
  const [aiEnhancing, setAiEnhancing] = useState(false);

  const handleSaveSynopsis = () => {
    updateTreatment({ synopsis: synopsisText });
    setIsEditingSynopsis(false);
  };

  const runAiEnhancement = () => {
    setAiEnhancing(true);
    setTimeout(() => {
      setAiEnhancing(false);
    }, 1000);
  };

  const filteredBeats = activeAct === 'ALL'
    ? treatment.plotBeats
    : treatment.plotBeats.filter(b => b.act === activeAct);

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Pipeline Step 09
            </span>
            <span className="text-xs text-white/40">• Comprehensive Prose Blueprint</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Narrative Treatment & Prose Dossier
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            Version {treatment.version} • {treatment.wordCount.toLocaleString()} Words • Complete Scene-by-Scene Narrative Spine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runAiEnhancement}
            disabled={aiEnhancing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${aiEnhancing ? 'animate-spin' : ''}`} />
            <span>{aiEnhancing ? 'Polishing Sensory Prose...' : 'AI Prose Polish'}</span>
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

      {/* Metadata Pill Bar */}
      <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-white/60">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Word Count: <strong className="text-white">{treatment.wordCount.toLocaleString()}</strong></span>
          </span>
          <span className="text-white/20">•</span>
          <span className="text-white/60">
            Reading Time: <strong className="text-white">~42 Mins</strong>
          </span>
          <span className="text-white/20">•</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" /> Status: {treatment.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {treatment.tone.map((t, idx) => (
            <span key={idx} className="px-2.5 py-0.5 rounded bg-white/5 text-white/70 border border-white/10 font-mono text-[11px]">
              {t}
            </span>
          ))}
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
                "{treatment.logline}"
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
            ) : (
              <div className="p-5 rounded-xl bg-black/40 border border-white/5 text-sm text-white/80 leading-relaxed space-y-4 font-serif">
                <p>{treatment.synopsis}</p>
                <p className="text-xs text-white/50 font-sans italic border-l-2 border-amber-500/50 pl-3">
                  "The monsoon is not mere atmospheric backdrop; it is a moral barometer. Every millimeter of rainfall tests the fragile boundaries between institutional preservation and human survival."
                </p>
              </div>
            )}
          </div>

          {/* Visual Moodboard Inset */}
          <div className="pt-4 border-t border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-white/50 block mb-3">
              Treatment Visual Keyframes Inset
            </span>
            <div className="grid grid-cols-3 gap-3">
              <img
                src="https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80"
                alt="Mood 1"
                className="w-full h-24 object-cover rounded-lg border border-white/10"
              />
              <img
                src="https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=600&q=80"
                alt="Mood 2"
                className="w-full h-24 object-cover rounded-lg border border-white/10"
              />
              <img
                src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80"
                alt="Mood 3"
                className="w-full h-24 object-cover rounded-lg border border-white/10"
              />
            </div>
          </div>
        </div>

        {/* Right Column: 12 Plot Beats Board & Treatment Quality Checklist (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Plot Beats Board */}
          <div className="bg-[#12141a]/95 rounded-2xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  12 Cardinal Plot Beats
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
          </div>

          {/* Quality Audit Checklist */}
          <div className="bg-[#12141a]/95 rounded-2xl border border-white/10 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-emerald-400" />
                Treatment Quality Audit
              </span>
              <span className="text-xs text-emerald-400 font-mono font-bold">100% Ready</span>
            </div>

            <div className="space-y-2">
              {treatment.checklist.map((chk, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5">
                  <span className="text-xs text-white/80">{chk.item}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
