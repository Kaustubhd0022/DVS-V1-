import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  MessageSquare, Volume2, Sparkles, CheckCircle2, 
  ArrowRight, Play, Pause, Mic, Sliders, RefreshCw, Zap, Brain,
  AlertCircle
} from 'lucide-react';
import { DialogueSuggestion } from '../../types/project';
import { punchUpDialogue } from '../../services/aiService';
import { getCanonicalConfiguration } from '../../services/projectConfiguration';

export const DialogueScreen: React.FC = () => {
  const { currentProject, swapDialogueSuggestion, nextStep, openContextResolver, updateCurrentProject } = useProject();
  const suggestions = currentProject.dialogueSuggestions || [];

  const [selectedVariantId, setSelectedVariantId] = useState<string>(suggestions[0]?.id || '');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);
  const [isPunchingUp, setIsPunchingUp] = useState(false);
  const [punchUpError, setPunchUpError] = useState<string | null>(null);

  const protagonist = currentProject.characters[0];
  const charName = protagonist?.name || 'Lead Character';

  const activeSuggestion = suggestions.find(s => s.id === selectedVariantId) || suggestions[0];

  const handleApplyVariant = (sug: DialogueSuggestion) => {
    swapDialogueSuggestion(sug.id, sug.text);
    setAppliedNotification(`Variant "${sug.label}" applied to Screenplay Scene 1 as Canonical dialogue!`);
    setTimeout(() => {
      setAppliedNotification(null);
    }, 2500);
  };

  const handleGenerateDialogue = async () => {
    setIsPunchingUp(true);
    setPunchUpError(null);
    try {
      const canonicalConfig = getCanonicalConfiguration(currentProject);
      const activeScene = currentProject.scenes?.find(s => s.sceneNumber === 1) || currentProject.scenes?.[0];
      const screenplayLines = (currentProject.screenplay || currentProject.screenplayLines || [])
        .filter(line => !activeScene || line.sceneNumber === activeScene.sceneNumber);
      const sourceDialogue = screenplayLines.find(line => line.type === 'dialogue');

      if (!sourceDialogue) {
        throw new Error('DIALOGUE_SOURCE_MISSING: Generate or open a screenplay scene before creating dialogue variations.');
      }

      const speaker = sourceDialogue.characterName || charName;
      const sceneCtx = [
        activeScene ? `Scene ${activeScene.sceneNumber}: ${activeScene.slugline}` : 'Current screenplay scene',
        activeScene?.summary || '',
        activeScene?.emotionalBeat || '',
        `Existing screenplay line: ${sourceDialogue.content}`
      ].filter(Boolean).join(' | ');

      const [alt1, alt2] = await Promise.all([
        punchUpDialogue(sourceDialogue.content, speaker, sceneCtx, currentProject, 'Procedural precision, suppressed fear, clinical tone'),
        punchUpDialogue(sourceDialogue.content, speaker, sceneCtx, currentProject, 'Urgent subtext, veiled threat, moral clarity')
      ]);

      const mapped: DialogueSuggestion[] = [
        {
          id: 'sug-gen-' + (suggestions.length + 1),
          character: speaker,
          text: alt1,
          tone: 'Clinical Procedural',
          label: 'Option A: Procedural Restraint',
          subtext: 'Masks vulnerability behind forensic terminology.',
          candidateState: 'AI_PROPOSAL',
          configurationFingerprint: canonicalConfig.configurationFingerprint,
          isSynthesisStale: false
        },
        {
          id: 'sug-gen-' + (suggestions.length + 2),
          character: speaker,
          text: alt2,
          tone: 'Urgent Direct',
          label: 'Option B: Moral Ultimatum',
          subtext: 'Directly challenges the interlocutor with high emotional velocity.',
          candidateState: 'AI_PROPOSAL',
          configurationFingerprint: canonicalConfig.configurationFingerprint,
          isSynthesisStale: false
        }
      ];

      updateCurrentProject(prev => ({
        ...prev,
        dialogueSuggestions: [...prev.dialogueSuggestions, ...mapped],
        pilotMetrics: {
          ...prev.pilotMetrics,
          totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
        }
      }));

      if (mapped.length > 0) {
        setSelectedVariantId(mapped[0].id);
      }
    } catch (err: any) {
      setPunchUpError(err.message || 'AI service error generating dialogue variations.');
    } finally {
      setIsPunchingUp(false);
    }
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
            Audit dialogue registers, tone inflection, and subtext density for <strong className="text-white">"{currentProject.title}"</strong> ({charName}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateDialogue}
            disabled={isPunchingUp}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPunchingUp ? 'animate-spin' : ''}`} />
            <span>{isPunchingUp ? 'Generating Variations...' : 'Punch-Up Dialogue (AI)'}</span>
          </button>

          <button
            onClick={() => openContextResolver('Dialogue Voice', `${charName} Scene Dialogue`)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inspect Scoped Context</span>
          </button>
          
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

      {punchUpError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{punchUpError}</span>
          </div>
          <button onClick={() => setPunchUpError(null)} className="text-white/40 hover:text-white">✕</button>
        </div>
      )}

      {/* Voice Cadence Bar */}
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
              <span>{charName} Voice Cadence</span>
              <span>•</span>
              <span>{protagonist?.voiceStyle || 'Dramatic Naturalism'}</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {isPlayingVoice ? "Simulating Cadence & Subtext Delivery..." : "Simulate Vocal Delivery & Inflection"}
            </h3>
          </div>
        </div>

        {/* Acoustic Meters */}
        <div className="flex items-center gap-4 bg-black/50 px-4 py-2.5 rounded-xl border border-white/10 text-xs font-mono">
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
      {suggestions.length === 0 ? (
        <div className="p-12 text-center bg-[#141822] border border-dashed border-white/10 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">No Dialogue Variations Registered</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Generate dynamic subtext and tone variations for <strong className="text-white">{charName}</strong> derived from your project's premise.
            </p>
          </div>
          <button
            onClick={handleGenerateDialogue}
            disabled={isPunchingUp}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{isPunchingUp ? 'Generating Dialogue Variations...' : 'Punch-Up Dialogue with AI'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: AI Dialogue Variants (7 cols) */}
          <div className="xl:col-span-7 bg-[#12141a]/95 rounded-2xl border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Key Exchange Variants ({charName})
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
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          {sug.label}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {sug.candidateState || 'CANDIDATE'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                        Tone: {sug.tone}
                      </span>
                    </div>

                    <p className="text-sm font-mono text-white/90 mt-2.5 leading-relaxed pl-2 border-l-2 border-amber-500/40">
                      "{sug.text}"
                    </p>

                    {sug.subtext && (
                      <p className="text-xs text-white/60 mt-2 italic">
                        Subtext: {sug.subtext}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs text-white/40 font-mono">Speaker: {sug.character || charName}</span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyVariant(sug);
                        }}
                        className="px-3.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Promote to Canon</span>
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
                {charName} — Linguistic Fingerprint
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Vocabulary Register</span>
                  <p className="text-xs text-white/70 mt-1">
                    {protagonist?.voiceStyle || 'Speaks with intentional cadence reflecting internal stakes and dramatic objective.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Core Dramatic Flaw</span>
                  <p className="text-xs text-white/70 mt-1">
                    {protagonist?.flaw || 'Guards vulnerability; projects composure when truth is threatened.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Dramaturgical Objective</span>
                  <p className="text-xs text-white/70 mt-1">
                    Want: {protagonist?.want || 'Establish control over circumstances'} • Need: {protagonist?.need || 'Confront emotional reality'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
