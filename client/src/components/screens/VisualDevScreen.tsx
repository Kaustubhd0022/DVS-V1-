import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Palette, Camera, Sparkles, ArrowRight, Download
} from 'lucide-react';
import { VisualKeyFrame } from '../../types/project';
import { BentoCard, LineaCaption, LineaButton } from '../common/LineaUI';

export const VisualDevScreen: React.FC = () => {
  const { currentProject, nextStep } = useProject();
  const visualDev = currentProject.visualDev || {
    colorPalette: [],
    keyFrames: [],
    artDirectionNotes: [],
    visualChecklist: []
  };

  const keyFrames = visualDev.keyFrames || [];
  const colorPalette = visualDev.colorPalette || [];
  const artNotes = visualDev.artDirectionNotes || [];

  const [selectedKeyFrame, setSelectedKeyFrame] = useState<VisualKeyFrame | undefined>(keyFrames[0]);
  const [aiGeneratingFrame, setAiGeneratingFrame] = useState(false);

  const runAiVisualSynthesis = () => {
    setAiGeneratingFrame(true);
    setTimeout(() => {
      setAiGeneratingFrame(false);
    }, 1100);
  };

  const activeFrame = selectedKeyFrame || keyFrames[0];

  return (
    <div className="space-y-6 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <BentoCard className="p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <LineaCaption variant="amber" icon={<Palette className="w-3.5 h-3.5" />}>
              Pipeline Step 14 • Cinematography
            </LineaCaption>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/[0.04] text-stone-400 border border-white/[0.08]">
              Lookbook & Visual Tone
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#fbf8f3] flex items-center gap-3">
            Visual Development & Color Science
          </h1>
          <p className="text-xs sm:text-sm text-stone-300/80 leading-relaxed">
            Cinematography bible: 2.39:1 Anamorphic format, curated color palette, and atmospheric visual grammar for <strong className="text-[#fbf8f3]">"{currentProject.title}"</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <LineaButton
            variant="ghost"
            size="md"
            showWave={aiGeneratingFrame}
            onClick={runAiVisualSynthesis}
            disabled={aiGeneratingFrame}
            icon={<Sparkles className={`w-3.5 h-3.5 text-amber-400 ${aiGeneratingFrame ? 'animate-spin' : ''}`} />}
          >
            {aiGeneratingFrame ? 'Synthesizing Keyframe...' : 'Generate New Keyframe'}
          </LineaButton>

          <LineaButton
            variant="primary"
            size="md"
            onClick={nextStep}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Next: Production Planning
          </LineaButton>
        </div>
      </BentoCard>

      {/* Color Palette Swatches Bar */}
      <BentoCard className="p-5 lg:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3] flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            Core Cinematographic Color Palette (LUT: "Cinematic Mood 800")
          </span>
          <span className="text-xs font-mono text-stone-400">Arri Alexa LF + Cooke Anamorphic /i</span>
        </div>

        {colorPalette.length === 0 ? (
          <div className="p-4 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] text-xs text-stone-400 flex items-center justify-between">
            <span>Color palette under development based on project aesthetic parameters.</span>
            <span className="text-amber-300 font-mono text-[11px]">Dynamic grading active</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {colorPalette.map((color, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0c12]/80 p-3 space-y-2">
                <div 
                  className="h-14 rounded-xl w-full shadow-inner border border-white/[0.08]"
                  style={{ backgroundColor: color.hex }}
                />
                <div>
                  <div className="text-xs font-bold text-[#fbf8f3] truncate">{color.name}</div>
                  <div className="text-[10px] font-mono text-stone-500 uppercase">{color.hex}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </BentoCard>

      {/* Keyframe Gallery & Active Inspection */}
      {keyFrames.length === 0 ? (
        <BentoCard className="p-12 text-center border-dashed border-white/[0.12] space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-[#fbf8f3]">No Visual Keyframes Generated Yet</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Synthesize production concept art and cinematic lighting keyframes for <strong className="text-amber-300">"{currentProject.title}"</strong>.
            </p>
          </div>
          <div className="pt-2">
            <LineaButton
              variant="primary"
              size="md"
              showWave={aiGeneratingFrame}
              onClick={runAiVisualSynthesis}
              disabled={aiGeneratingFrame}
              icon={<Sparkles className="w-4 h-4 fill-black" />}
            >
              {aiGeneratingFrame ? 'Synthesizing Keyframe...' : 'Synthesize Concept Keyframe (AI)'}
            </LineaButton>
          </div>
        </BentoCard>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Active Keyframe Spotlight (7 cols) */}
          <BentoCard className="xl:col-span-7 overflow-hidden p-0 flex flex-col">
            {activeFrame && (
              <>
                <div className="relative h-80 lg:h-96 overflow-hidden group">
                  <img
                    src={activeFrame.imageUrl}
                    alt={activeFrame.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1119] via-transparent to-black/40" />
                  
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-black/80 text-amber-300 border border-white/15">
                      {activeFrame.code}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-5 right-5">
                    <h2 className="text-xl font-bold text-[#fbf8f3]">{activeFrame.title}</h2>
                    <p className="text-xs text-stone-300 mt-1 leading-relaxed max-w-2xl">
                      {activeFrame.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-black/40 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs font-mono text-stone-400">
                    <span>Aspect Ratio: 2.39:1</span>
                    <span>•</span>
                    <span>Lighting: Mixed Practical + Cinematic Key</span>
                  </div>
                  <button className="text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1.5 cursor-pointer">
                    <Download className="w-3.5 h-3.5" /> High-Res Render (4K)
                  </button>
                </div>
              </>
            )}
          </BentoCard>

          {/* Keyframe Selector Grid & Art Notes (5 cols) */}
          <div className="xl:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Keyframe Roster ({keyFrames.length})
              </span>
              <span className="text-xs text-amber-400 font-mono">Select to Inspect</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {keyFrames.map(kf => {
                const isSelected = activeFrame?.id === kf.id;

                return (
                  <div
                    key={kf.id}
                    onClick={() => setSelectedKeyFrame(kf)}
                    className={`rounded-2xl overflow-hidden cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                        : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="relative h-28">
                      <img src={kf.imageUrl} alt={kf.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-black/80 text-amber-300">
                        {kf.code}
                      </span>
                      <span className="absolute bottom-2 left-2 right-2 text-xs font-bold text-white truncate">
                        {kf.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Art Direction Notes */}
            <BentoCard className="p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3] block">
                Supervising Art Director Notes
              </span>
              <div className="space-y-2">
                {artNotes.length === 0 ? (
                  <p className="text-xs text-stone-500 italic p-3 bg-[#0a0c12]/60 rounded-2xl">
                    No visual notes logged yet.
                  </p>
                ) : (
                  artNotes.map((note, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-amber-300 font-bold">{note.author}</span>
                        <span className="text-stone-500">{note.time}</span>
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed">{note.text}</p>
                    </div>
                  ))
                )}
              </div>
            </BentoCard>
          </div>
        </div>
      )}
    </div>
  );
};
