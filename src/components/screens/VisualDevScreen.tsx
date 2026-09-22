import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Palette, Camera, Sparkles, ArrowRight, CheckCircle2, 
  Layers, Download, Eye, Plus, Maximize2
} from 'lucide-react';
import { VisualKeyFrame } from '../../types/project';

export const VisualDevScreen: React.FC = () => {
  const { currentProject, nextStep } = useProject();
  const visualDev = currentProject.visualDev;

  const [selectedKeyFrame, setSelectedKeyFrame] = useState<VisualKeyFrame>(visualDev.keyFrames[0]);
  const [activeTab, setActiveTab] = useState<'keyframes' | 'palette' | 'lookbook'>('keyframes');
  const [aiGeneratingFrame, setAiGeneratingFrame] = useState(false);

  const runAiVisualSynthesis = () => {
    setAiGeneratingFrame(true);
    setTimeout(() => {
      setAiGeneratingFrame(false);
    }, 1100);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Pipeline Step 14
            </span>
            <span className="text-xs text-white/40">• Cinematographic Lookbook & Keyframe Concept Art</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Visual Development & Color Science
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            Cinematography bible: 2.39:1 Anamorphic format, 6-tone color script, wet surfaces, and high contrast sodium-vapor lighting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runAiVisualSynthesis}
            disabled={aiGeneratingFrame}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${aiGeneratingFrame ? 'animate-spin' : ''}`} />
            <span>{aiGeneratingFrame ? 'Synthesizing Keyframe...' : 'Generate New Keyframe'}</span>
          </button>
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Next: Production Planning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color Palette Swatches Bar */}
      <div className="p-5 rounded-2xl bg-[#12141a]/90 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" />
            Core Cinematographic Color Palette (LUT: "Monsoon Noir 400")
          </span>
          <span className="text-xs font-mono text-white/40">Arri Alexa LF + Cooke Anamorphic /i</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {visualDev.colorPalette.map((color, idx) => (
            <div key={idx} className="rounded-xl overflow-hidden border border-white/10 bg-black/40 p-2.5 space-y-2">
              <div 
                className="h-14 rounded-lg w-full shadow-inner border border-white/10"
                style={{ backgroundColor: color.hex }}
              />
              <div>
                <div className="text-xs font-bold text-white truncate">{color.name}</div>
                <div className="text-[10px] font-mono text-white/50 uppercase">{color.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyframe Gallery & Active Inspection */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Active Keyframe Spotlight (7 cols) */}
        <div className="xl:col-span-7 bg-[#12141a]/95 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
          <div className="relative h-80 lg:h-96 overflow-hidden group">
            <img
              src={selectedKeyFrame.imageUrl}
              alt={selectedKeyFrame.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-transparent to-black/40" />
            
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-black/80 text-amber-400 border border-white/15">
                {selectedKeyFrame.code}
              </span>
            </div>

            <div className="absolute bottom-4 left-5 right-5">
              <h2 className="text-xl font-bold font-serif text-white">{selectedKeyFrame.title}</h2>
              <p className="text-xs text-white/70 mt-1 leading-relaxed max-w-2xl">
                {selectedKeyFrame.description}
              </p>
            </div>
          </div>

          <div className="p-5 border-t border-white/10 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs font-mono text-white/50">
              <span>Aspect Ratio: 2.39:1</span>
              <span>•</span>
              <span>Lighting: Mixed Tungsten + Cool Storm Sky</span>
            </div>
            <button className="text-xs text-amber-400 hover:underline flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> High-Res Render (4K)
            </button>
          </div>
        </div>

        {/* Keyframe Selector Grid & Art Notes (5 cols) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-white/60">
              Keyframe Roster ({visualDev.keyFrames.length})
            </span>
            <span className="text-xs text-amber-400 font-mono">Select to Inspect</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {visualDev.keyFrames.map(kf => {
              const isSelected = kf.id === selectedKeyFrame.id;

              return (
                <div
                  key={kf.id}
                  onClick={() => setSelectedKeyFrame(kf)}
                  className={`rounded-xl overflow-hidden cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                      : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="relative h-28">
                    <img src={kf.imageUrl} alt={kf.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 text-amber-300">
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
          <div className="p-5 rounded-2xl bg-[#12141a]/90 border border-white/10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white block">
              Supervising Art Director Notes
            </span>
            <div className="space-y-2.5">
              {visualDev.artDirectionNotes.map((note, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-amber-400 font-bold">{note.author}</span>
                    <span className="text-white/40">{note.time}</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
