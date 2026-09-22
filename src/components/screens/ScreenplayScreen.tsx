import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  FileCode2, Sparkles, ArrowRight, Download, Share2, 
  ChevronRight, AlignLeft, Type, Edit3, Plus, CheckCircle2, Sliders
} from 'lucide-react';
import { ScreenplayLine } from '../../types/project';

export const ScreenplayScreen: React.FC = () => {
  const { currentProject, updateScreenplayLine, addScreenplayLine, nextStep } = useProject();
  const scriptLines = currentProject.screenplayLines || currentProject.screenplay || [];

  const [activeSceneNumber, setActiveSceneNumber] = useState<number>(1);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [aiPunchingUp, setAiPunchingUp] = useState(false);

  const filteredLines = scriptLines.filter(l => l.sceneNumber === activeSceneNumber);

  const handleLineContentChange = (id: string, newContent: string) => {
    updateScreenplayLine(id, newContent);
  };

  const handleAddNewLine = (type: ScreenplayLine['type']) => {
    const newLine: ScreenplayLine = {
      id: `scr-user-${Date.now()}`,
      sceneNumber: activeSceneNumber,
      type,
      content: type === 'character' ? 'AANYA' : type === 'parenthetical' ? '(hesitant)' : 'Type line content...',
      characterName: type === 'dialogue' || type === 'parenthetical' ? 'AANYA' : undefined
    };
    addScreenplayLine(newLine);
  };

  const runAiDialoguePunchUp = () => {
    setAiPunchingUp(true);
    setTimeout(() => {
      // Find Aanya's dialogue in Scene 1 and punch up subtext
      const aanyaDialogue = filteredLines.find(l => l.type === 'dialogue');
      if (aanyaDialogue) {
        updateScreenplayLine(
          aanyaDialogue.id,
          "The telemetry isn't glitching, Raghav. Someone in Sector 4 cut the power grid before the rain began."
        );
      }
      setAiPunchingUp(false);
    }, 900);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Pipeline Step 11
            </span>
            <span className="text-xs text-white/40">• Industry Standard Screenplay Formatter</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Screenplay Production Draft
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            Courier Prime standard format • Page 1 of 118 • Estimated Runtime: 118 Mins • Ready for Table Read
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runAiDialoguePunchUp}
            disabled={aiPunchingUp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${aiPunchingUp ? 'animate-spin' : ''}`} />
            <span>{aiPunchingUp ? 'Sharpening Subtext...' : 'AI Subtext Punch-Up'}</span>
          </button>
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Next: Dialogue Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formatting & Scene Bar */}
      <div className="p-3.5 rounded-xl bg-[#12141a]/95 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        {/* Scene Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-white/40">Scene:</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => setActiveSceneNumber(num)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                  activeSceneNumber === num
                    ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-black/50 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                Scene {num}
              </button>
            ))}
          </div>
        </div>

        {/* Element Formatting Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddNewLine('action')}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/80 text-xs border border-white/10 flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-amber-400" /> + Action
          </button>
          <button
            onClick={() => handleAddNewLine('character')}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/80 text-xs border border-white/10 flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-amber-400" /> + Character
          </button>
          <button
            onClick={() => handleAddNewLine('dialogue')}
            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/80 text-xs border border-white/10 flex items-center gap-1"
          >
            <Plus className="w-3 h-3 text-amber-400" /> + Dialogue
          </button>
        </div>
      </div>

      {/* Screenplay Page Container - Cinematic Paper Texture & Courier Prime */}
      <div className="max-w-4xl mx-auto bg-[#181a20] rounded-2xl border border-white/15 p-12 lg:p-16 shadow-2xl shadow-black relative font-mono text-[14px] leading-relaxed text-white/90">
        
        {/* Top Page Header */}
        <div className="flex items-center justify-between text-white/40 text-xs font-mono pb-8 border-b border-white/10 mb-8 select-none">
          <span>THE LAST MONSOON • PROD DRAFT</span>
          <span>PAGE {activeSceneNumber}</span>
        </div>

        {/* Screenplay Lines List */}
        <div className="space-y-4">
          {filteredLines.map(line => {
            const isEditing = editingLineId === line.id;

            if (line.type === 'scene_heading') {
              return (
                <div 
                  key={line.id} 
                  className="font-bold text-amber-300 uppercase tracking-wider pt-4 pb-2 border-b border-white/5 cursor-pointer hover:bg-white/5 rounded px-2"
                  onClick={() => setEditingLineId(line.id)}
                >
                  {isEditing ? (
                    <input
                      type="text"
                      value={line.content}
                      onChange={(e) => handleLineContentChange(line.id, e.target.value)}
                      onBlur={() => setEditingLineId(null)}
                      autoFocus
                      className="w-full bg-black/80 text-amber-300 border border-amber-500 rounded px-2 py-1 font-mono uppercase"
                    />
                  ) : (
                    <span>{line.sceneNumber} {line.content} {line.sceneNumber}</span>
                  )}
                </div>
              );
            }

            if (line.type === 'action') {
              return (
                <div 
                  key={line.id} 
                  className="text-white/80 max-w-2xl px-2 py-1 cursor-pointer hover:bg-white/5 rounded"
                  onClick={() => setEditingLineId(line.id)}
                >
                  {isEditing ? (
                    <textarea
                      value={line.content}
                      onChange={(e) => handleLineContentChange(line.id, e.target.value)}
                      onBlur={() => setEditingLineId(null)}
                      autoFocus
                      className="w-full bg-black/80 text-white/90 border border-amber-500 rounded px-2 py-1 font-mono resize-none"
                    />
                  ) : (
                    <p>{line.content}</p>
                  )}
                </div>
              );
            }

            if (line.type === 'character') {
              return (
                <div key={line.id} className="text-center font-bold text-amber-400 uppercase pt-3 select-none">
                  {line.content}
                </div>
              );
            }

            if (line.type === 'parenthetical') {
              return (
                <div key={line.id} className="text-center text-white/50 italic text-xs">
                  {line.content}
                </div>
              );
            }

            if (line.type === 'dialogue') {
              return (
                <div 
                  key={line.id} 
                  className="max-w-md mx-auto text-center px-4 py-1.5 cursor-pointer hover:bg-amber-500/10 rounded transition-colors group relative border border-transparent hover:border-amber-500/20"
                  onClick={() => setEditingLineId(line.id)}
                >
                  {isEditing ? (
                    <textarea
                      value={line.content}
                      onChange={(e) => handleLineContentChange(line.id, e.target.value)}
                      onBlur={() => setEditingLineId(null)}
                      autoFocus
                      className="w-full bg-black/90 text-white/90 border border-amber-500 rounded px-2 py-1 font-mono text-center resize-none"
                    />
                  ) : (
                    <p className="text-white/90 leading-relaxed font-mono">
                      "{line.content}"
                    </p>
                  )}
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] text-amber-400 absolute right-1 top-1">
                    Click to edit
                  </span>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Page Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-white/40 font-mono">
          <span>(CONTINUED)</span>
          <span>Draft V2.4 • Registered WGA & SWA India</span>
        </div>
      </div>
    </div>
  );
};
