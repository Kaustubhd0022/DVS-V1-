import React, { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  FileCode2, Sparkles, ArrowRight, Download, Share2, 
  ChevronRight, AlignLeft, Type, Edit3, Plus, CheckCircle2, Sliders, Brain,
  RefreshCw
} from 'lucide-react';
import { ScreenplayLine } from '../../types/project';
import { punchUpDialogue } from '../../services/geminiService';
import { generateScreenplayDraft } from '../../services/aiService';
import { getCanonicalConfiguration } from '../../services/projectConfiguration';

export const ScreenplayScreen: React.FC = () => {
  const { currentProject, updateScreenplayLine, addScreenplayLine, updateCurrentProject, nextStep, openContextResolver } = useProject();
  const scriptLines = currentProject.screenplay?.length ? currentProject.screenplay : (currentProject.screenplayLines || []);

  const [activeSceneNumber, setActiveSceneNumber] = useState<number>(1);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [aiPunchingUp, setAiPunchingUp] = useState(false);
  const [isDraftingScene, setIsDraftingScene] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const filteredLines = scriptLines.filter(l => l.sceneNumber === activeSceneNumber);

  const handleLineContentChange = (id: string, newContent: string) => {
    updateScreenplayLine(id, newContent);
  };

  const leadName = (currentProject.characters[0]?.name || 'PROTAGONIST').toUpperCase();
  const secondCharName = (currentProject.characters[1]?.name || 'INTERLOCUTOR').toUpperCase();

  const handleAddNewLine = (type: ScreenplayLine['type']) => {
    const newLine: ScreenplayLine = {
      id: `scr-user-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sceneNumber: activeSceneNumber,
      type,
      content: type === 'character' ? leadName : type === 'parenthetical' ? '(hesitant)' : 'Type line content...',
      characterName: type === 'dialogue' || type === 'parenthetical' ? leadName : undefined
    };
    addScreenplayLine(newLine);
  };

  const handleDraftSceneWithAi = async () => {
    setIsDraftingScene(true);
    setDraftError(null);
    try {
      const generated = await generateScreenplayDraft(currentProject, activeSceneNumber);
      if (!generated.length) throw new Error('AI returned no screenplay lines.');

      const remaining = (currentProject.screenplay || []).filter(
        line => line.sceneNumber !== activeSceneNumber
      );
      const merged = [...remaining, ...generated].sort((a, b) =>
        a.sceneNumber - b.sceneNumber
      );

      updateCurrentProject(prev => ({
        ...prev,
        screenplay: merged,
        screenplayLines: merged
      }));
    } catch (err: any) {
      setDraftError(err?.message || 'Failed to generate a project-grounded screenplay draft.');
    } finally {
      setIsDraftingScene(false);
    }
  };

  const runAiDialoguePunchUp = async () => {
    setAiPunchingUp(true);
    const leadDialogue = filteredLines.find(l => l.type === 'dialogue');
    if (leadDialogue) {
      try {
        const punched = await punchUpDialogue(
          leadDialogue.content,
          leadDialogue.characterName || leadName,
          `Scene ${activeSceneNumber}: ${currentProject.intent?.setting || 'Dramatic Setting'}. High stakes confrontation.`,
          currentProject,
          'Inject acute subtext, procedural coldness, and urgent dramatic weight.'
        );
        updateScreenplayLine(leadDialogue.id, punched);
      } catch (e: any) {
        console.error('AI Dialogue punch-up failed:', e);
      }
    }
    setAiPunchingUp(false);
  };

  // Determine available scene numbers (from project scenes or default 1..4)
  const sceneNumbers = currentProject.scenes && currentProject.scenes.length > 0
    ? currentProject.scenes.map(s => s.sceneNumber)
    : [1, 2, 3, 4];

  const canonicalConfig = getCanonicalConfiguration(currentProject);
  const activeSceneArtifact = currentProject.scenes?.find(s => s.sceneNumber === activeSceneNumber);
  const activeSceneLines = scriptLines.filter(line => line.sceneNumber === activeSceneNumber);
  const screenplayStale = activeSceneArtifact
    ? activeSceneLines.some(line => line.isSynthesisStale || line.configurationFingerprint !== canonicalConfig.configurationFingerprint)
      || activeSceneLines.length === 0
    : false;

  useEffect(() => {
    if (!screenplayStale || isDraftingScene || !activeSceneArtifact) return;
    void handleDraftSceneWithAi();
  }, [canonicalConfig.configurationFingerprint, activeSceneNumber, screenplayStale]);

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
            Courier Prime standard format • Page {activeSceneNumber} of 118 • Project: <strong className="text-white">"{currentProject.title}"</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openContextResolver('Scene Drafting', `Screenplay Draft Scene ${activeSceneNumber}`)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scoped Context</span>
          </button>
          <button
            onClick={runAiDialoguePunchUp}
            disabled={aiPunchingUp || filteredLines.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium transition-all disabled:opacity-40"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${aiPunchingUp ? 'animate-spin' : ''}`} />
            <span>{aiPunchingUp ? 'Sharpening Subtext...' : 'Subtext Punch-Up'}</span>
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

      {draftError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <span>{draftError}</span>
          <button onClick={() => setDraftError(null)} className="text-white/40 hover:text-white">✕</button>
        </div>
      )}

      {screenplayStale && activeSceneArtifact && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <span>Screenplay is stale for the current project configuration. Tattava is rebuilding Scene {activeSceneNumber} from the current scene, canon, and project configuration.</span>
          <button
            onClick={handleDraftSceneWithAi}
            disabled={isDraftingScene}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-bold disabled:opacity-50"
          >
            {isDraftingScene ? 'Drafting…' : 'Draft Now'}
          </button>
        </div>
      )}

      {/* Formatting & Scene Bar */}
      <div className="p-3.5 rounded-xl bg-[#12141a]/95 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        {/* Scene Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-white/40">Scene:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {sceneNumbers.slice(0, 8).map(num => (
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
          <span>{currentProject.title.toUpperCase()} • PRODUCTION DRAFT</span>
          <span>PAGE {activeSceneNumber}</span>
        </div>

        {/* Screenplay Lines List or Empty State */}
        {filteredLines.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <FileCode2 className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-white font-sans">No Screenplay Lines Drafted Yet for Scene {activeSceneNumber}</h3>
              <p className="text-xs text-white/50 font-sans">
                Draft dialogue and action beats manually using the format bar above, or synthesize a formatted scene using AI.
              </p>
            </div>
            <button
              onClick={handleDraftSceneWithAi}
              disabled={isDraftingScene}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-sans inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isDraftingScene ? 'Drafting Scene...' : `Draft Scene ${activeSceneNumber} with AI`}</span>
            </button>
          </div>
        ) : (
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
        )}

        {/* Page Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-white/40 font-mono">
          <span>(CONTINUED)</span>
          <span>Draft V1.0 • Tattava Standard Screenplay</span>
        </div>
      </div>
    </div>
  );
};

