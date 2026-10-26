import React, { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  FileCode2, Sparkles, ArrowRight, Download, Share2, 
  ChevronRight, AlignLeft, Type, Edit3, Plus, CheckCircle2, Sliders, Brain,
  RefreshCw, Scissors, Clapperboard, Film, Video, Check
} from 'lucide-react';
import { punchUpDialogue } from '../../services/geminiService';
import { generateScreenplayDraft } from '../../services/aiService';
import { getCanonicalConfiguration } from '../../services/projectConfiguration';
import { ScreenplayLine } from '../../types/project';
import { executeSurgicalScriptEdit, StoryboardFrame, ScriptRevisionResult } from '../../services/scriptDoctorService';

export const ScreenplayScreen: React.FC = () => {
  const { currentProject, updateScreenplayLine, addScreenplayLine, updateCurrentProject, nextStep, openContextResolver } = useProject();
  const scriptLines = currentProject.screenplay?.length ? currentProject.screenplay : (currentProject.screenplayLines || []);

  const [activeSceneNumber, setActiveSceneNumber] = useState<number>(1);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [aiPunchingUp, setAiPunchingUp] = useState(false);
  const [isDraftingScene, setIsDraftingScene] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Surgical Script Doctor state
  const [doctorInstruction, setDoctorInstruction] = useState('');
  const [isDoctorRunning, setIsDoctorRunning] = useState(false);
  const [doctorDiffSummary, setDoctorDiffSummary] = useState<string | null>(null);
  const [storyboardFrames, setStoryboardFrames] = useState<StoryboardFrame[]>([]);
  const [activeTab, setActiveTab] = useState<'screenplay' | 'storyboard'>('screenplay');

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

  const handleExecuteDoctorInstruction = async (instructionToRun?: string) => {
    const instr = instructionToRun || doctorInstruction;
    if (!instr.trim()) return;

    setIsDoctorRunning(true);
    setDraftError(null);
    try {
      const result: ScriptRevisionResult = await executeSurgicalScriptEdit(
        scriptLines,
        currentProject.scenes || [],
        instr,
        currentProject
      );

      if (result.storyboardFrames && result.storyboardFrames.length > 0) {
        setStoryboardFrames(result.storyboardFrames);
        setActiveTab('storyboard');
      }

      if (result.revisedLines && result.revisedLines.length > 0) {
        updateCurrentProject(prev => ({
          ...prev,
          screenplay: result.revisedLines,
          screenplayLines: result.revisedLines
        }));
      }

      setDoctorDiffSummary(result.diffSummary);
      setDoctorInstruction('');
    } catch (err: any) {
      setDraftError(err?.message || 'Surgical script doctor execution failed.');
    } finally {
      setIsDoctorRunning(false);
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="linea-caption-chip">
              Pipeline Step 11
            </span>
            <span className="text-xs text-stone-400">• Industry Standard Screenplay & Storyboard Studio</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-[#fbf8f3] flex items-center gap-3">
            Screenplay Production Draft & Storyboard
          </h1>
          <p className="text-sm text-stone-400 mt-1 max-w-2xl">
            Courier Prime standard format • Page {activeSceneNumber} of {sceneNumbers.length || 1} • Project: <strong className="text-[#fbf8f3]">"{currentProject.title}"</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Tab Switcher */}
          <div className="flex items-center p-1 bg-[#0b0e15] rounded-full border border-white/10 mr-2">
            <button
              onClick={() => setActiveTab('screenplay')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'screenplay'
                  ? 'bg-amber-400 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3)]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Screenplay Draft
            </button>
            <button
              onClick={() => setActiveTab('storyboard')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'storyboard'
                  ? 'bg-amber-400 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3)]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Film className="w-3 h-3" />
              <span>Storyboard</span>
              {storyboardFrames.length > 0 && (
                <span className="px-1.5 py-0.2 bg-black/40 text-[10px] rounded-full font-mono">
                  {storyboardFrames.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => openContextResolver('Scene Drafting', `Screenplay Draft Scene ${activeSceneNumber}`)}
            className="linea-pill-btn linea-pill-secondary px-3.5 py-2 text-xs font-semibold text-cyan-300 border-cyan-500/30 gap-2"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scoped Context</span>
          </button>
          <button
            onClick={runAiDialoguePunchUp}
            disabled={aiPunchingUp || filteredLines.length === 0}
            className="linea-pill-btn linea-pill-secondary px-4 py-2 text-xs font-medium gap-2 disabled:opacity-40"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${aiPunchingUp ? 'animate-spin' : ''}`} />
            <span>{aiPunchingUp ? 'Sharpening Subtext...' : 'Subtext Punch-Up'}</span>
          </button>
          <button
            onClick={nextStep}
            className="linea-pill-btn linea-pill-primary px-5 py-2 text-xs font-bold gap-2"
          >
            <span>Next: Dialogue Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {draftError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>{draftError}</span>
          <button onClick={() => setDraftError(null)} className="text-stone-400 hover:text-white">✕</button>
        </div>
      )}

      {/* SURGICAL SCRIPT DOCTOR PANEL */}
      <div className="linea-bento p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#fbf8f3]">Surgical Script Doctor & Instruction Pipeline</h2>
              <p className="text-xs text-stone-400">Execute targeted modifications without collateral drift or unintended plot revisions</p>
            </div>
          </div>
          {isDoctorRunning && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Applying Surgical Revision…</span>
            </div>
          )}
        </div>

        {/* Preset Instruction Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => handleExecuteDoctorInstruction('Improve the humour without changing the story')}
            disabled={isDoctorRunning}
            className="linea-pill-btn linea-pill-secondary px-3 py-1.5 text-xs hover:border-amber-400/50 gap-1.5 disabled:opacity-40"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Improve Humour (Keep Story)</span>
          </button>
          <button
            onClick={() => handleExecuteDoctorInstruction('Make the dialogue more natural while retaining Hinglish')}
            disabled={isDoctorRunning}
            className="linea-pill-btn linea-pill-secondary px-3 py-1.5 text-xs hover:border-amber-400/50 gap-1.5 disabled:opacity-40"
          >
            <span>🗣️ Natural Hinglish (Retain Syncretism)</span>
          </button>
          <button
            onClick={() => handleExecuteDoctorInstruction('Shorten Segment 3 without changing other segments')}
            disabled={isDoctorRunning}
            className="linea-pill-btn linea-pill-secondary px-3 py-1.5 text-xs hover:border-amber-400/50 gap-1.5 disabled:opacity-40"
          >
            <Scissors className="w-3 h-3 text-cyan-400" />
            <span>Shorten Segment 3 (Others Untouched)</span>
          </button>
          <button
            onClick={() => handleExecuteDoctorInstruction('Rewrite the opening scene while preserving the remaining script')}
            disabled={isDoctorRunning}
            className="linea-pill-btn linea-pill-secondary px-3 py-1.5 text-xs hover:border-amber-400/50 gap-1.5 disabled:opacity-40"
          >
            <Clapperboard className="w-3 h-3 text-emerald-400" />
            <span>Rewrite Opening Hook (Preserve Script)</span>
          </button>
          <button
            onClick={() => handleExecuteDoctorInstruction('Convert the script into a storyboard without inventing missing plot details')}
            disabled={isDoctorRunning}
            className="linea-pill-btn linea-pill-secondary px-3 py-1.5 text-xs hover:border-amber-400/50 gap-1.5 disabled:opacity-40"
          >
            <Film className="w-3 h-3 text-purple-400" />
            <span>Convert to Storyboard (Zero Hallucinations)</span>
          </button>
        </div>

        {/* Custom Instruction Input Bar */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={doctorInstruction}
            onChange={(e) => setDoctorInstruction(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecuteDoctorInstruction()}
            placeholder="Type custom surgical instruction, e.g. 'Punch up Aarav\'s monologue in Scene 1'..."
            className="flex-1 bg-[#0b0e15] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-[#fbf8f3] placeholder:text-stone-500 focus:outline-none focus:border-amber-400/80 transition-colors"
          />
          <button
            onClick={() => handleExecuteDoctorInstruction()}
            disabled={isDoctorRunning || !doctorInstruction.trim()}
            className="linea-pill-btn linea-pill-primary px-4 py-2.5 text-xs font-bold disabled:opacity-40 gap-1.5 shrink-0"
          >
            <span>Run Surgical Edit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Diff Summary Banner */}
        {doctorDiffSummary && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{doctorDiffSummary}</span>
            </div>
            <button onClick={() => setDoctorDiffSummary(null)} className="text-stone-400 hover:text-white ml-2">✕</button>
          </div>
        )}
      </div>

      {screenplayStale && activeSceneArtifact && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <span>Screenplay is stale for current project configuration. Rebuild Scene {activeSceneNumber} from canon facts.</span>
          <button
            onClick={handleDraftSceneWithAi}
            disabled={isDraftingScene}
            className="linea-pill-btn linea-pill-primary px-3.5 py-1.5 text-xs font-bold disabled:opacity-50"
          >
            {isDraftingScene ? 'Drafting…' : 'Draft Now'}
          </button>
        </div>
      )}

      {/* STORYBOARD VIEW */}
      {activeTab === 'storyboard' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif text-[#fbf8f3]">Cinematic Storyboard Grid</h2>
              <p className="text-xs text-stone-400">Derived strictly from script lines with zero external hallucinations</p>
            </div>
            <span className="text-xs font-mono text-stone-400">
              {storyboardFrames.length} Visual Beats
            </span>
          </div>

          {storyboardFrames.length === 0 ? (
            <div className="linea-bento p-12 text-center space-y-4">
              <Film className="w-12 h-12 text-stone-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#fbf8f3]">No Storyboard Frames Extracted Yet</h3>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Click the <strong>"Convert to Storyboard"</strong> button in the Script Doctor above to synthesize authentic cinematic frames derived 100% from your script.
                </p>
              </div>
              <button
                onClick={() => handleExecuteDoctorInstruction('Convert the script into a storyboard without inventing missing plot details')}
                disabled={isDoctorRunning}
                className="linea-pill-btn linea-pill-primary px-5 py-2 text-xs font-bold inline-flex items-center gap-2"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Generate Storyboard from Script</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {storyboardFrames.map((frame, idx) => (
                <div key={idx} className="linea-bento p-5 space-y-3 flex flex-col justify-between hover:border-amber-400/40 transition-all">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono font-bold text-[11px]">
                        Frame {frame.frameNumber} • Scene {frame.sceneNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-stone-300 text-[10px] font-mono">
                        {frame.shotType}
                      </span>
                    </div>

                    <p className="text-xs text-[#fbf8f3] leading-relaxed">
                      {frame.visualDescription}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5 text-[11px]">
                    <div className="bg-[#080a10] rounded-xl p-2.5 text-stone-300 italic border border-white/5">
                      <span className="text-amber-400 font-bold not-italic mr-1.5 font-sans">Script Source:</span>
                      "{frame.sourceDialogueOrAction}"
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-stone-400 font-mono">
                      <span>🎥 {frame.cameraMovement}</span>
                      <span>•</span>
                      <span>🔊 {frame.acousticOrAudioCue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* SCREENPLAY COURIER PRIME VIEW */
        <div className="space-y-6">
          {/* Formatting & Scene Bar (Linea Bento Capsule) */}
          <div className="linea-bento p-3 flex flex-wrap items-center justify-between gap-4">
            {/* Scene Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">Scene:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#0b0e15] rounded-full border border-white/5">
                {sceneNumbers.map(num => {
                  const sc = currentProject.scenes?.find(s => s.sceneNumber === num);
                  const label = sc?.subheading || `Scene ${num}`;
                  return (
                    <button
                      key={num}
                      onClick={() => setActiveSceneNumber(num)}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all whitespace-nowrap ${
                        activeSceneNumber === num
                          ? 'bg-amber-400 text-black shadow-[0_2px_10px_rgba(245,158,11,0.3)]'
                          : 'text-stone-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Element Formatting Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddNewLine('action')}
                className="linea-pill-btn linea-pill-secondary px-3 py-1.5 text-xs gap-1"
              >
                <Plus className="w-3 h-3 text-amber-400" /> Action
              </button>
              <button
                onClick={() => handleAddNewLine('character')}
                className="linea-pill-btn linea-pill-secondary px-3 py-1.5 text-xs gap-1"
              >
                <Plus className="w-3 h-3 text-amber-400" /> Character
              </button>
              <button
                onClick={() => handleAddNewLine('dialogue')}
                className="linea-pill-btn linea-pill-secondary px-3 py-1.5 text-xs gap-1"
              >
                <Plus className="w-3 h-3 text-amber-400" /> Dialogue
              </button>
            </div>
          </div>

          {/* Screenplay Page Container - Cinematic Paper Texture & Linea Warm Contrast */}
          <div className="max-w-4xl mx-auto bg-[#0d1017] rounded-3xl border border-white/[0.08] p-10 lg:p-14 shadow-2xl relative font-mono text-[14px] leading-relaxed text-[#fbf8f3] inset-specular">
            
            {/* Top Page Header */}
            <div className="flex items-center justify-between text-stone-500 text-xs font-mono pb-6 border-b border-white/[0.08] mb-8 select-none">
              <span>{currentProject.title.toUpperCase()} • PRODUCTION DRAFT</span>
              <span>PAGE {activeSceneNumber}</span>
            </div>

            {/* Screenplay Lines List or Empty State */}
            {filteredLines.length === 0 ? (
              <div className="py-16 text-center space-y-5">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_2px_12px_rgba(245,158,11,0.15)]">
                  <FileCode2 className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-base font-bold text-[#fbf8f3] font-sans">No Screenplay Lines Drafted Yet for Scene {activeSceneNumber}</h3>
                  <p className="text-xs text-stone-400 font-sans leading-relaxed">
                    Draft dialogue and action beats manually using the format pills above, or synthesize a formatted scene using AI.
                  </p>
                </div>
                <button
                  onClick={handleDraftSceneWithAi}
                  disabled={isDraftingScene}
                  className="linea-pill-btn linea-pill-primary px-5 py-2.5 text-xs font-bold font-sans inline-flex items-center gap-2 disabled:opacity-50"
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
                        className="text-stone-300 max-w-2xl px-2 py-1 cursor-pointer hover:bg-white/[0.04] rounded-lg transition-colors"
                        onClick={() => setEditingLineId(line.id)}
                      >
                        {isEditing ? (
                          <textarea
                            value={line.content}
                            onChange={(e) => handleLineContentChange(line.id, e.target.value)}
                            onBlur={() => setEditingLineId(null)}
                            autoFocus
                            className="w-full bg-[#080a10] text-[#fbf8f3] border border-amber-400/80 rounded-xl p-2 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                          />
                        ) : (
                          <p>{line.content}</p>
                        )}
                      </div>
                    );
                  }

                  if (line.type === 'character') {
                    return (
                      <div key={line.id} className="text-center font-bold text-amber-400 tracking-wider uppercase pt-3 select-none">
                        {line.content}
                      </div>
                    );
                  }

                  if (line.type === 'parenthetical') {
                    return (
                      <div key={line.id} className="text-center text-stone-400 italic text-xs">
                        {line.content}
                      </div>
                    );
                  }

                  if (line.type === 'dialogue') {
                    return (
                      <div 
                        key={line.id} 
                        className="max-w-md mx-auto text-center px-4 py-2 cursor-pointer hover:bg-amber-500/10 rounded-2xl transition-all group relative border border-transparent hover:border-amber-500/20"
                        onClick={() => setEditingLineId(line.id)}
                      >
                        {isEditing ? (
                          <textarea
                            value={line.content}
                            onChange={(e) => handleLineContentChange(line.id, e.target.value)}
                            onBlur={() => setEditingLineId(null)}
                            autoFocus
                            className="w-full bg-[#080a10] text-[#fbf8f3] border border-amber-400 rounded-xl p-2 font-mono text-center resize-none focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                          />
                        ) : (
                          <p className="text-[#fbf8f3] leading-relaxed font-mono">
                            "{line.content}"
                          </p>
                        )}
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] text-amber-400 absolute right-2 top-2 font-sans font-semibold">
                          Edit
                        </span>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}

            {/* Page Footer */}
            <div className="mt-16 pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs text-stone-500 font-mono">
              <span>(CONTINUED)</span>
              <span>Draft V1.0 • Tattava Standard Screenplay</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

