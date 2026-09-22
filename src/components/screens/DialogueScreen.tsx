import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  MessageSquare, Volume2, Sparkles, CheckCircle2, 
  ArrowRight, Play, Pause, Mic, Sliders, RefreshCw, Zap
} from 'lucide-react';
import { DialogueSuggestion } from '../../types/project';

export const DialogueScreen: React.FC = () => {
  const { currentProject, swapDialogueSuggestion, nextStep } = useProject();
  const suggestions = currentProject.dialogueSuggestions;

  const [selectedVariantId, setSelectedVariantId] = useState<string>(suggestions[0]?.id || 'sug-1');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [activeTab, setActiveTab] = useState<'variants' | 'profile' | 'subtext'>('variants');
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const activeSuggestion = suggestions.find(s => s.id === selectedVariantId) || suggestions[0];

  const handleApplyVariant = (sug: DialogueSuggestion) => {
    swapDialogueSuggestion(sug.id, sug.text);
    setAppliedNotification(`Variant "${sug.label}" applied to Screenplay Scene 1!`);
    setTimeout(() => {
      setAppliedNotification(null);
    }, 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Pipeline Step 12
            </span>
            <span className="text-xs text-white/40">• Acoustic Cadence & Subtext Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Dialogue Studio & Subtext Modulation
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            Audit dialogue registers, tone inflection, and subtext density for Scene 1 (Aanya Verma & Raghav Saxena).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Next: Continuity QA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {appliedNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{appliedNotification}</span>
        </div>
      )}

      {/* Voice Cadence & Acoustic Simulation Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-black/80 via-[#181b26]/70 to-black/80 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlayingVoice(!isPlayingVoice)}
            className="w-12 h-12 rounded-2xl bg-amber-500 text-black flex items-center justify-center hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
          >
            {isPlayingVoice ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
              <span>Aanya Verma Voice Sample</span>
              <span>•</span>
              <span>Hindi-English Procedural Register</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {isPlayingVoice ? "Playing: Procedural Urgency Cadence (Acoustic Model V3)..." : "Simulate Vocal Delivery & Inflection"}
            </h3>
          </div>
        </div>

        {/* Acoustic Meters */}
        <div className="flex items-center gap-4 bg-black/50 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-mono">
          <div>
            <span className="text-white/40 block text-[10px]">URGENCY</span>
            <span className="text-amber-400 font-bold">88% (High)</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <span className="text-white/40 block text-[10px]">SUBTEXT SCORE</span>
            <span className="text-emerald-400 font-bold">92/100</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <span className="text-white/40 block text-[10px]">NATURAL CADENCE</span>
            <span className="text-blue-400 font-bold">Optimal</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Variants List, Right Deep Voice Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: AI Dialogue Variants (7 cols) */}
        <div className="xl:col-span-7 bg-[#12141a]/95 rounded-2xl border border-white/10 p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Scene 1: Key Exchange Variants (Aanya Verma)
              </h3>
              <p className="text-[11px] text-white/50">Hot-swap suggestions directly into the live screenplay draft.</p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {suggestions.length} Registered Variants
            </span>
          </div>

          <div className="space-y-4">
            {suggestions.map(sug => {
              const isSelected = sug.id === selectedVariantId;

              return (
                <div
                  key={sug.id}
                  onClick={() => setSelectedVariantId(sug.id)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-950/40 via-[#181b26] to-[#12141a] border-amber-500 shadow-md ring-1 ring-amber-500'
                      : 'bg-black/40 hover:bg-black/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      {sug.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                      Tone: {sug.tone}
                    </span>
                  </div>

                  <p className="text-sm font-mono text-white/90 mt-2.5 leading-relaxed pl-2 border-l-2 border-amber-500/40">
                    "{sug.text}"
                  </p>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-white/40 font-mono">Character: {sug.character}</span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyVariant(sug);
                      }}
                      className="px-3.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Use This In Screenplay</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Character Linguistic Profile (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-[#12141a]/95 rounded-2xl border border-white/10 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Aanya Verma — Linguistic Fingerprint
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Vocabulary Register</span>
                <p className="text-xs text-white/70 mt-1">
                  Speaks with empirical precision. Avoids adjectives when under pressure; relies on raw data and sensory observation.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Defense Mechanism</span>
                <p className="text-xs text-white/70 mt-1">
                  Masks fear behind clinical analysis. Interrupts superiors only with irrefutable sensor logs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Code-Switching Cadence</span>
                <p className="text-xs text-white/70 mt-1">
                  Fluent English in institutional briefings; lapses into urgent colloquial Hindi during high-stakes emotional confrontation with Raghav.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
