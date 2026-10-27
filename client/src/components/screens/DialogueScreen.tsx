import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  MessageSquare, Volume2, Sparkles, CheckCircle2, 
  ArrowRight, Play, Pause, Mic, Sliders, RefreshCw, Zap, Brain,
  AlertCircle, Languages, Globe, Subtitles, Copy, Check
} from 'lucide-react';
import { 
  DialogueSuggestion, 
  MultilingualScriptMode, 
  IndicDialectRegister 
} from '../../types/project';
import { 
  punchUpDialogue, 
  generateMultilingualDialogueVariations 
} from '../../services/aiService';
import { getCanonicalConfiguration } from '../../services/projectConfiguration';

export const DialogueScreen: React.FC = () => {
  const { currentProject, swapDialogueSuggestion, nextStep, openContextResolver, updateCurrentProject, updateScreenplayLine } = useProject();
  const suggestions = currentProject.dialogueSuggestions || [];
  const scenes = currentProject.scenes || [];

  const [selectedSceneNumber, setSelectedSceneNumber] = useState<number>(scenes[0]?.sceneNumber || 1);
  const [selectedLineId, setSelectedLineId] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<string>(suggestions[0]?.id || '');
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);
  const [isPunchingUp, setIsPunchingUp] = useState(false);
  const [punchUpError, setPunchUpError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Multilingual Indic Dialogue Controls
  const [scriptMode, setScriptMode] = useState<MultilingualScriptMode>('ROMAN_HINDI');
  const [dialect, setDialect] = useState<IndicDialectRegister>('MUMBAI_COLLOQUIAL');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [codeSwitching, setCodeSwitching] = useState<number>(45);

  const activeScene = scenes.find(s => s.sceneNumber === selectedSceneNumber) || scenes[0];
  const allScriptLines = currentProject.screenplay?.length ? currentProject.screenplay : (currentProject.screenplayLines || []);
  const sceneScriptLines = allScriptLines.filter(l => !activeScene || l.sceneNumber === activeScene.sceneNumber);
  const dialogueLines = sceneScriptLines.filter(l => l.type === 'dialogue');
  const activeLine = dialogueLines.find(l => l.id === selectedLineId) || dialogueLines[0];

  const protagonist = currentProject.characters[0];
  const speakerName = activeLine?.characterName || protagonist?.name || 'Lead Character';
  const charName = speakerName;

  const activeSuggestion = suggestions.find(s => s.id === selectedVariantId) || suggestions[0];

  const handleApplyVariant = (sug: DialogueSuggestion) => {
    if (activeLine) {
      updateScreenplayLine(activeLine.id, sug.text);
      setAppliedNotification(`Variant "${sug.label}" applied to Scene ${activeScene?.sceneNumber || selectedSceneNumber} (${speakerName}) in Screenplay!`);
    } else {
      swapDialogueSuggestion(sug.id, sug.text);
      setAppliedNotification(`Variant "${sug.label}" applied as Canonical dialogue!`);
    }
    setTimeout(() => {
      setAppliedNotification(null);
    }, 3000);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateDialogue = async () => {
    setIsPunchingUp(true);
    setPunchUpError(null);
    try {
      const canonicalConfig = getCanonicalConfiguration(currentProject);
      const speaker = speakerName;
      const otherChar = currentProject.characters.find(c => c.name !== speaker)?.name || 'Interlocutor';
      
      const sceneCtx = [
        activeScene ? `Scene ${activeScene.sceneNumber}: ${activeScene.slugline}` : 'Key Dramatic Climax',
        activeScene?.summary || currentProject.intent?.premise || 'High stakes confrontation',
        activeScene?.emotionalBeat || `Stakes: ${currentProject.intent?.conflict || 'Ideological survival'}`
      ].filter(Boolean).join(' | ');

      const sourceContent = activeLine?.content || 'We cannot allow this information to leave this room.';

      const response = await generateMultilingualDialogueVariations({
        sourceLine: sourceContent,
        characterName: speaker,
        interlocutorName: otherChar,
        sceneContext: sceneCtx,
        scriptMode,
        dialect,
        codeSwitchingIntensity: codeSwitching
      }, currentProject);

      const mapped: DialogueSuggestion[] = (response.variations || []).map((v, idx) => ({
        id: 'sug-ml-' + Date.now() + '-' + (idx + 1),
        character: speaker,
        text: v.text,
        tone: v.tone || 'Dynamic Register',
        label: v.label || `Option ${String.fromCharCode(65 + idx)}: Voice Modulation`,
        subtext: v.subtext || 'Unspoken subtextual imperative.',
        candidateState: 'AI_PROPOSAL',
        configurationFingerprint: canonicalConfig.configurationFingerprint,
        isSynthesisStale: false,
        scriptMode: v.scriptMode || scriptMode,
        dialect: v.dialect || dialect,
        subtitleTranslation: v.subtitleTranslation,
        phoneticGuide: v.phoneticGuide,
        deliveryCue: v.deliveryCue
      }));

      updateCurrentProject(prev => ({
        ...prev,
        dialogueSuggestions: [...mapped, ...(prev.dialogueSuggestions || [])],
        pilotMetrics: {
          ...prev.pilotMetrics,
          totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
        }
      }));

      if (mapped.length > 0) {
        setSelectedVariantId(mapped[0].id);
      }
    } catch (err: any) {
      setPunchUpError(err.message || 'AI service error generating multilingual dialogue variations.');
    } finally {
      setIsPunchingUp(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="linea-caption-chip">
              Pipeline Step 12
            </span>
            <span className="text-xs text-stone-400">• Acoustic Cadence & Subtext Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-[#fbf8f3] flex items-center gap-3">
            Dialogue Studio & Subtext Modulation
          </h1>
          <p className="text-sm text-stone-400 mt-1 max-w-2xl">
            Audit dialogue registers, tone inflection, and subtext density for <strong className="text-[#fbf8f3]">"{currentProject.title}"</strong> ({speakerName}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateDialogue}
            disabled={isPunchingUp}
            className="linea-pill-btn linea-pill-primary px-4 py-2 text-xs font-bold gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPunchingUp ? 'animate-spin' : ''}`} />
            <span>{isPunchingUp ? 'Generating Variations...' : 'Punch-Up Dialogue (AI)'}</span>
            {isPunchingUp && (
              <span className="linea-btn-wave ml-1" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            )}
          </button>

          <button
            onClick={() => openContextResolver('Dialogue Voice', `${speakerName} Scene Dialogue`)}
            className="linea-pill-btn linea-pill-secondary px-3.5 py-2 text-xs font-semibold text-cyan-300 border-cyan-500/30 gap-2"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inspect Scoped Context</span>
          </button>
          
          <button
            onClick={nextStep}
            className="linea-pill-btn linea-pill-primary px-5 py-2 text-xs font-bold gap-2"
          >
            <span>Next: Continuity QA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {appliedNotification && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{appliedNotification}</span>
        </div>
      )}

      {punchUpError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{punchUpError}</span>
          </div>
          <button onClick={() => setPunchUpError(null)} className="text-stone-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Script Navigation & Targeted Line Selector Bar */}
      <div className="linea-bento p-5 rounded-3xl space-y-4 border border-white/[0.08] bg-[#0c0e15]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3] font-mono flex items-center gap-2">
                <span>Target Dialogue Line & Dramatic Staging</span>
                <span className="text-[10px] text-cyan-400 font-normal">Scene {activeScene?.sceneNumber || selectedSceneNumber}</span>
              </h3>
              <p className="text-[11px] text-stone-400">Select any scene and spoken line from the screenplay to audition alternate vocal registers and subtexts.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Scene Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono text-stone-400 font-bold">Scene:</span>
              <select
                value={selectedSceneNumber}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  setSelectedSceneNumber(num);
                  setSelectedLineId('');
                }}
                className="bg-[#151a24] text-xs font-mono text-white border border-white/10 rounded-xl px-3 py-1.5 focus:border-cyan-400 outline-none"
              >
                {scenes.length > 0 ? (
                  scenes.map(s => (
                    <option key={s.id} value={s.sceneNumber}>
                      Scene {s.sceneNumber}: {s.slugline}
                    </option>
                  ))
                ) : (
                  <option value={1}>Scene 1 (Default)</option>
                )}
              </select>
            </div>

            {/* Line Selector */}
            {dialogueLines.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono text-stone-400 font-bold">Line:</span>
                <select
                  value={activeLine?.id || ''}
                  onChange={(e) => setSelectedLineId(e.target.value)}
                  className="bg-[#151a24] text-xs font-mono text-white border border-white/10 rounded-xl px-3 py-1.5 focus:border-cyan-400 outline-none max-w-[280px] truncate"
                >
                  {dialogueLines.map((l, idx) => (
                    <option key={l.id} value={l.id}>
                      {idx + 1}. [{l.characterName || 'Character'}]: "{l.content.slice(0, 30)}..."
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Currently Selected Spoken Line Card */}
        <div className="p-4 rounded-2xl bg-[#141824] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
                ACTIVE SPEAKER: {speakerName}
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                {activeScene?.slugline || 'INT. LOCATION - NIGHT'}
              </span>
            </div>
            <p className="text-sm font-serif italic text-white pl-3 border-l-2 border-cyan-400">
              "{activeLine?.content || 'No dialogue line drafted in this scene yet. Click Modulate Line to generate.'}"
            </p>
          </div>

          <button
            onClick={handleGenerateDialogue}
            disabled={isPunchingUp}
            className="linea-pill-btn linea-pill-primary px-4 py-2 text-xs font-bold gap-2 shrink-0 self-end md:self-center"
          >
            <Sparkles className="w-3.5 h-3.5 fill-black" />
            <span>{isPunchingUp ? 'Modulating...' : 'Modulate Line (AI)'}</span>
          </button>
        </div>
      </div>

      {/* Multilingual Indic Script & Dialect Control Center */}
      <div className="linea-bento p-5 rounded-3xl space-y-4 border border-white/[0.08] bg-[#0c0e15]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3] font-mono flex items-center gap-2">
                <span>Indic Multilingual & Script Engine</span>
                <span className="text-[10px] text-amber-400 font-normal">Active Register</span>
              </h3>
              <p className="text-[11px] text-stone-400">Generate dialogue in native Roman-script Hindi (Romanagari), Devanagari, or urban Hinglish with parallel English subtitles.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSubtitles(!showSubtitles)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
                showSubtitles 
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' 
                  : 'bg-white/5 border-white/10 text-stone-400'
              }`}
            >
              <Subtitles className="w-3.5 h-3.5" />
              <span>Parallel Subtitles {showSubtitles ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Script Mode & Dialect Pills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-2 font-bold">
              Script Mode
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'ROMAN_HINDI', label: 'Roman-Script Hindi', desc: 'English letters (Tum yahan kyun aaye?)' },
                { id: 'DEVANAGARI', label: 'Devanagari (हिंदी)', desc: 'Standard script (तुम यहाँ क्यों आए?)' },
                { id: 'HINGLISH_URBAN', label: 'Urban Hinglish', desc: 'Mumbai/Bollywood code-switching' },
                { id: 'ENGLISH', label: 'Screenplay English', desc: 'Standard English register' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setScriptMode(opt.id as MultilingualScriptMode)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    scriptMode === opt.id
                      ? 'bg-amber-500/15 border-amber-400/80 text-white shadow-[0_2px_12px_rgba(245,158,11,0.2)]'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{opt.label}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5 truncate">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-2 font-bold">
              Cadence & Dialect Register
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'MUMBAI_COLLOQUIAL', label: 'Mumbai Colloquial', desc: 'Street-smart, fast-paced' },
                { id: 'HISTORICAL_CLASSICAL', label: 'Historical / Dignified', desc: 'Elevated, archaic weight' },
                { id: 'LUCKNOWI_URDU', label: 'Lucknowi Urdu-Infused', desc: 'Courteous, lyrical register' },
                { id: 'REGIONAL_RUSTIC', label: 'Rustic Regional', desc: 'Awadhi/Bhojpuri acoustic texture' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setDialect(opt.id as IndicDialectRegister)}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    dialect === opt.id
                      ? 'bg-cyan-500/15 border-cyan-400/80 text-white shadow-[0_2px_12px_rgba(6,182,212,0.2)]'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <div className="text-xs font-bold font-mono">{opt.label}</div>
                  <div className="text-[10px] text-stone-500 mt-0.5 truncate">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Cadence Bar (Linea Bento Card) */}
      <div className="linea-bento p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPlayingVoice(!isPlayingVoice)}
            className="w-12 h-12 rounded-full bg-amber-400 text-black flex items-center justify-center hover:bg-amber-300 transition-transform active:scale-95 shadow-[0_2px_12px_rgba(245,158,11,0.3)] shrink-0"
          >
            {isPlayingVoice ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
              <span>{charName} Voice Cadence</span>
              <span>•</span>
              <span className="text-stone-400">{protagonist?.voiceStyle || 'Dramatic Naturalism'}</span>
            </div>
            <h3 className="text-base font-bold text-[#fbf8f3] mt-0.5">
              {isPlayingVoice ? "Simulating Vocal Delivery & Acoustic Meter..." : "Audition Vocal Rhythm & Subtext"}
            </h3>
          </div>
        </div>

        {/* Acoustic Meters */}
        <div className="flex items-center gap-4 bg-[#0a0c12] px-5 py-2.5 rounded-full border border-white/[0.08] text-xs font-mono">
          <div>
            <span className="text-stone-500 block text-[9px] uppercase tracking-wider">SCRIPT MODE</span>
            <span className="text-amber-400 font-bold">{scriptMode.replace('_', ' ')}</span>
          </div>
          <div className="w-px h-6 bg-white/10" />
          <div>
            <span className="text-stone-500 block text-[9px] uppercase tracking-wider">DIALECT REGISTER</span>
            <span className="text-cyan-400 font-bold">{dialect.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Variants List, Right Deep Voice Analysis */}
      {suggestions.length === 0 ? (
        <div className="p-12 text-center linea-bento rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_2px_12px_rgba(245,158,11,0.15)]">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-[#fbf8f3]">No Multilingual Dialogue Variations Registered</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Generate character-specific dialogue variations for <strong className="text-white">{charName}</strong> in <strong className="text-amber-400">{scriptMode}</strong> with authentic cadence and parallel English subtitles.
            </p>
          </div>
          <button
            onClick={handleGenerateDialogue}
            disabled={isPunchingUp}
            className="linea-pill-btn linea-pill-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{isPunchingUp ? 'Generating Multilingual Dialogue...' : 'Generate Multilingual Variations (AI)'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: AI Dialogue Variants (7 cols) */}
          <div className="xl:col-span-7 linea-bento rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3] font-mono">
                  Dialogue Variants ({charName})
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">Select a variant to preview acoustic cadence or promote directly to screenplay canon.</p>
              </div>
              <span className="linea-caption-chip">
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
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-[#181d2a] border-amber-400/80 shadow-[0_2px_16px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/40'
                        : 'bg-[#121622] hover:bg-[#151a28] border-white/[0.06] hover:border-white/15'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          {sug.label}
                        </span>
                        {sug.scriptMode && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold uppercase">
                            {sug.scriptMode.replace('_', ' ')}
                          </span>
                        )}
                        {sug.dialect && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-stone-500/10 text-stone-400 border border-white/5 font-bold uppercase">
                            {sug.dialect.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-stone-400 border border-white/5">
                        Tone: {sug.tone}
                      </span>
                    </div>

                    {/* Spoken Dialogue Line */}
                    <div className="mt-3 pl-3 border-l-2 border-amber-400">
                      <p className="text-base font-medium text-[#fbf8f3] leading-relaxed">
                        "{sug.text}"
                      </p>
                      
                      {/* Parallel English Subtitle Translation */}
                      {showSubtitles && sug.subtitleTranslation && (
                        <div className="mt-2 text-xs font-mono text-cyan-300/90 flex items-start gap-1.5 bg-cyan-950/20 px-2.5 py-1.5 rounded-lg border border-cyan-500/20">
                          <Subtitles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>Subtitle: "{sug.subtitleTranslation}"</span>
                        </div>
                      )}

                      {/* Delivery Cue & Phonetic Guide */}
                      {(sug.deliveryCue || sug.phoneticGuide) && (
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-stone-400">
                          {sug.deliveryCue && (
                            <span className="italic text-amber-300/80">
                              Directing cue: {sug.deliveryCue}
                            </span>
                          )}
                          {sug.phoneticGuide && (
                            <span className="font-mono text-stone-500">
                              Stress: {sug.phoneticGuide}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {sug.subtext && (
                      <p className="text-xs text-stone-400 mt-2.5 italic">
                        Subtext: {sug.subtext}
                      </p>
                    )}

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-xs text-stone-500 font-mono">Speaker: {sug.character || charName}</span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(sug.id, sug.text);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 text-xs flex items-center gap-1 border border-white/5"
                        >
                          {copiedId === sug.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === sug.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyVariant(sug);
                          }}
                          className="linea-pill-btn linea-pill-primary px-3.5 py-1 text-xs font-bold gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Promote to Canon</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Character Linguistic Profile (5 cols) */}
          <div className="xl:col-span-5 space-y-6">
            <div className="linea-bento rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3] font-mono">
                {charName} — Linguistic Fingerprint
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#0f121a] border border-white/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">Vocabulary Register</span>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    {protagonist?.voiceStyle || 'Speaks with intentional cadence reflecting internal stakes and dramatic objective.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f121a] border border-white/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">Core Dramatic Flaw</span>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    {protagonist?.flaw || 'Guards vulnerability; projects composure when truth is threatened.'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#0f121a] border border-white/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">Dramaturgical Objective</span>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
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
