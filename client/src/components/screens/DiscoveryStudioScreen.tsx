import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  BookOpen, 
  Users, 
  RefreshCw, 
  FileText, 
  ArrowRight, 
  Paperclip, 
  Lock, 
  Compass, 
  Award, 
  Check, 
  X,
  History,
  Info,
  ChevronDown,
  Sliders,
  Plus
} from 'lucide-react';
import { useProject, PIPELINE_STEPS } from '../../context/ProjectContext';
import { isOptionalStep, isStepComplete } from '../../services/projectProgress';
import { ProjectIntelligenceSummary } from '../project/ProjectIntelligenceSummary';
import { NextBestActionPanel } from '../project/NextBestActionPanel';
import { LineaButton, BentoCard, LineaCaption, LineaEqualizerWave } from '../common/LineaUI';

export const DiscoveryStudioScreen: React.FC = () => {
  const { 
    currentProject, 
    discoverySession, 
    sendDiscoveryMessage, 
    applyDiscoveryDecision,
    applyCustomDiscoveryDecision,
    setActiveScreen
  } = useProject();

  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [showThoughtMap, setShowThoughtMap] = useState<Record<string, boolean>>({});
  const [activeIntelTab, setActiveIntelTab] = useState<'brain' | 'knowns' | 'research' | 'decisions'>('brain');
  const [customQuestionInput, setCustomQuestionInput] = useState<Record<string, string>>({});
  const [showAlternativeDirection, setShowAlternativeDirection] = useState<Record<string, boolean>>({});
  const [customDirectionInput, setCustomDirectionInput] = useState<Record<string, { title: string; finding: string; dramaticImplication: string }>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const turns = discoverySession?.turns || [];
  const ambiguityLevel = discoverySession?.ambiguityLevel ?? 80;
  const forwardStep = PIPELINE_STEPS.find(s => s.step > 1 && !isOptionalStep(s.id) && !isStepComplete(currentProject, s.id)) || PIPELINE_STEPS[1];
  const isReadyToContinue = turns.length >= 2 && ambiguityLevel <= 40;
  const canonFacts = currentProject.storyBrain?.canonFacts || [];
  const decisions = currentProject.storyBrain?.creativeDecisions || currentProject.storyBrain?.decisionLog || [];
  const researchFindings = currentProject.researchFindings || [];
  const knownInformation = currentProject.intent?.knownInformation || [];
  const unknownInformation = currentProject.intent?.unknownInformation || [];

  // Scroll to bottom on new turn
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns.length, isSubmitting]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() && !attachedFile) return;

    setInputText('');
    const currentAttachment = attachedFile;
    setAttachedFile(null);
    setIsSubmitting(true);

    try {
      await sendDiscoveryMessage(textToSend, currentAttachment || undefined);
    } catch (err) {
      console.error('Discovery message failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        content: text || `[Uploaded file: ${file.name}]`
      });
    };
    reader.readAsText(file);
  };

  const toggleThought = (turnId: string) => {
    setShowThoughtMap(prev => ({ ...prev, [turnId]: !prev[turnId] }));
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn max-w-[1700px] mx-auto pb-16">
      {/* Studio Header & Dynamic Ambiguity Bar */}
      <BentoCard className="p-6 lg:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <LineaCaption variant="amber" icon={<Brain className="w-3.5 h-3.5" />}>
              Creative Discovery Studio
            </LineaCaption>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/[0.04] text-stone-400 border border-white/[0.08]">
              Understand → Explore → Decide → Remember
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#fbf8f3] tracking-tight">
              {currentProject.title}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.05] text-stone-300 border border-white/[0.1]">
              {currentProject.contentType}
            </span>
            {currentProject.genre && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {currentProject.genre}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-stone-300/80 leading-relaxed">
            {currentProject.intent?.premise || 'Explore your story premise conversationally with Tattava. All verified choices are stored persistently in Story Brain.'}
          </p>
        </div>

        {/* Ambiguity Meter & Telemetry */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto relative z-10">
          {/* Ambiguity Gauge Card */}
          <div className="bg-[#0a0c12]/70 border border-white/[0.08] rounded-2xl p-4 px-5 flex flex-col justify-center min-w-[240px] shadow-inner">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-stone-300 font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Creative Ambiguity</span>
              </span>
              <span className={`font-mono font-bold ${
                ambiguityLevel <= 30 ? 'text-emerald-400' : ambiguityLevel <= 60 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {ambiguityLevel}%
              </span>
            </div>
            
            <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-700 rounded-full ${
                  ambiguityLevel <= 30 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                    : ambiguityLevel <= 60 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                    : 'bg-gradient-to-r from-rose-500 to-amber-500'
                }`}
                style={{ width: `${ambiguityLevel}%` }}
              />
            </div>

            <span className="text-[10px] text-stone-500 mt-1.5 font-medium">
              {ambiguityLevel <= 30 
                ? 'Grounded: Core canon and narrative engine established' 
                : ambiguityLevel <= 60 
                ? 'Maturing: World rules and direction taking shape' 
                : 'Formative: Open exploration and research phase'}
            </span>
          </div>

          {/* Forward navigation button */}
          <LineaButton
            variant={isReadyToContinue ? 'primary' : 'ghost'}
            size="md"
            onClick={() => setActiveScreen(forwardStep.id)}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            {isReadyToContinue ? `Continue: ${forwardStep.shortLabel}` : `Skip ahead: ${forwardStep.shortLabel}`}
          </LineaButton>
        </div>
      </BentoCard>

      {/* Intelligence summary and action panel */}
      <div className="order-last">
        <ProjectIntelligenceSummary />
        <NextBestActionPanel />
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Conversational Feed (8 cols) */}
        <div className="xl:col-span-8 space-y-5">
          <BentoCard className="p-5 lg:p-7 min-h-[580px] max-h-[780px] flex flex-col justify-between shadow-2xl relative">
            
            {/* Scrollable Conversation Feed */}
            <div className="overflow-y-auto pr-2 space-y-6 flex-1 scrollbar-thin scrollbar-thumb-white/10">
              
              {/* If no turns yet, show welcome card */}
              {turns.length === 0 && (
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-4 my-8">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="text-lg font-bold text-[#fbf8f3]">
                      Welcome to Tattava Discovery
                    </h3>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Begin with a simple creative spark. Tell me your working title, an era, a protagonist role, or an initial premise.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => handleSendMessage("I want to create a historical series called Rajyam.")}
                      className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-amber-300 font-semibold transition-all hover:scale-105 cursor-pointer"
                    >
                      "I want to create a historical series called Rajyam."
                    </button>
                    <button
                      onClick={() => handleSendMessage("A gritty cyberpunk thriller set in 2048 Mumbai about an illegal memory extractor.")}
                      className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-sky-300 font-semibold transition-all hover:scale-105 cursor-pointer"
                    >
                      "Cyberpunk memory thriller in Mumbai 2048"
                    </button>
                    <button
                      onClick={() => handleSendMessage("A courtroom drama examining the first murder committed by an autonomous vehicle.")}
                      className="px-4 py-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-emerald-300 font-semibold transition-all hover:scale-105 cursor-pointer"
                    >
                      "Courtroom drama on autonomous vehicle liability"
                    </button>
                  </div>
                </div>
              )}

              {/* Render Turns */}
              {turns.map((turn) => {
                const isUser = turn.role === 'user';

                if (isUser) {
                  return (
                    <div key={turn.id} className="flex justify-end animate-fadeIn">
                      <div className="max-w-2xl bg-amber-500/15 border border-amber-500/30 text-[#fbf8f3] rounded-3xl rounded-tr-md p-4 px-5 shadow-lg space-y-1">
                        <div className="flex items-center justify-between gap-3 text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                          <span>Story Creator</span>
                          <span className="font-mono text-stone-400">{turn.timestamp}</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                          {turn.userText}
                        </p>
                      </div>
                    </div>
                  );
                }

                // Tattava Response Turn
                const showThought = showThoughtMap[turn.id];

                return (
                  <div key={turn.id} className="flex flex-col space-y-3 animate-fadeIn">
                    
                    {/* Tattava Header & Thought Pill */}
                    <div className="flex items-center justify-between text-xs text-stone-400">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                          <Brain className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-[#fbf8f3] tracking-wide">Tattava Creative Partner</span>
                        <span className="text-[10px] font-mono text-stone-500">• {turn.timestamp}</span>
                      </div>

                      {turn.thought && (
                        <button
                          onClick={() => toggleThought(turn.id)}
                          className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors font-semibold cursor-pointer"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>{showThought ? 'Hide Diagnostic Reasoning' : 'View Diagnostic Reasoning'}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${showThought ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Diagnostic Thought Card */}
                    {showThought && turn.thought && (
                      <div className="p-4 rounded-2xl bg-[#0a0c12]/90 border border-amber-500/20 text-xs text-amber-200/90 font-mono space-y-1 animate-fadeIn">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                          Tattava Internal Reasoning & Ambiguity Map
                        </span>
                        <p className="leading-relaxed">{turn.thought}</p>
                      </div>
                    )}

                    {/* Conversational Reply Card */}
                    <div className="bg-[#0a0c12]/80 border border-white/[0.08] rounded-3xl rounded-tl-md p-5 space-y-4 shadow-xl">
                      <p className="text-xs sm:text-sm text-stone-200 leading-relaxed whitespace-pre-wrap font-sans">
                        {turn.conversationalReply}
                      </p>

                      {/* Research Objective Was Triggered */}
                      {turn.researchObjective && (
                        <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200 flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-sky-400 shrink-0" />
                          <div>
                            <span className="font-bold uppercase text-[10px] text-sky-400 block tracking-wider">
                              Research Objective Investigated
                            </span>
                            <span>{turn.researchObjective}</span>
                          </div>
                        </div>
                      )}

                      {/* Candidate Options */}
                      {turn.candidateOptions && turn.candidateOptions.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-300 flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5" />
                              <span>Evidence-Backed Candidate Options</span>
                            </span>
                            <span className="text-[10px] font-mono text-stone-500">
                              Uncommitted proposals • Select to establish Canon
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            {turn.candidateOptions.map((opt) => {
                              const isAccepted = opt.status === 'ACCEPTED';
                              const isDismissed = opt.status === 'DISMISSED';

                              return (
                                <div 
                                  key={opt.id}
                                  className={`rounded-2xl border transition-all p-4 space-y-3 ${
                                    isAccepted
                                      ? 'bg-emerald-500/15 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                                      : isDismissed
                                      ? 'bg-black/30 border-white/5 opacity-50'
                                      : 'bg-[#141720] hover:bg-[#181c26] border-white/[0.08] hover:border-amber-500/40 shadow-md'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full tracking-wider ${
                                        isAccepted
                                          ? 'bg-emerald-500 text-stone-950 font-bold'
                                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                      }`}>
                                        {isAccepted ? '✓ Established Canon' : 'AI Candidate'}
                                      </span>
                                      <h4 className="text-xs sm:text-sm font-bold text-[#fbf8f3]">
                                        {opt.title}
                                      </h4>
                                    </div>

                                    {opt.era && (
                                      <span className="text-[11px] font-mono text-stone-400 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/[0.06]">
                                        {opt.era}
                                      </span>
                                    )}
                                  </div>

                                  {/* Epistemic Tiers Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#0a0c12]/70 p-3.5 rounded-2xl border border-white/[0.06]">
                                    {/* Source & Evidence */}
                                    <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-white/[0.08] pb-2 md:pb-0 md:pr-3">
                                      <div>
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-sky-400 block">
                                          Source ({opt.sourceType || 'Historical Record'})
                                        </span>
                                        <p className="text-stone-300 text-[11px]">{opt.source || 'Historical Epigraphy & Literature'}</p>
                                      </div>

                                      {opt.evidence && (
                                        <div>
                                          <span className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 block">
                                            Evidence
                                          </span>
                                          <p className="text-stone-300 text-[11px] leading-relaxed">{opt.evidence}</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Finding & Dramatic Implication */}
                                    <div className="space-y-1.5 md:pl-2">
                                      <div>
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-300 block">
                                          Historical Finding
                                        </span>
                                        <p className="text-stone-300 text-[11px] leading-relaxed">{opt.finding}</p>
                                      </div>

                                      {opt.dramaticImplication && (
                                        <div>
                                          <span className="text-[10px] uppercase tracking-wider font-semibold text-rose-400 block">
                                            Dramatic Implication
                                          </span>
                                          <p className="text-stone-200 text-[11px] font-medium leading-relaxed">{opt.dramaticImplication}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Bar */}
                                  {!isAccepted && !isDismissed && (
                                    <div className="flex items-center justify-end pt-1">
                                      <LineaButton
                                        variant="primary"
                                        size="xs"
                                        onClick={() => applyDiscoveryDecision(turn.id, opt.id)}
                                        icon={<Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                      >
                                        Decide: Adopt this Kingdom & Establish Canon
                                      </LineaButton>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Alternative Direction Input */}
                          {!turn.candidateOptions.some(o => o.status === 'ACCEPTED') && (
                            <div className="pt-2 border-t border-white/[0.08]">
                              {!showAlternativeDirection[turn.id] ? (
                                <button
                                  type="button"
                                  onClick={() => setShowAlternativeDirection(prev => ({ ...prev, [turn.id]: true }))}
                                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-white/[0.03] hover:bg-white/[0.06] text-amber-300 hover:text-amber-200 border border-dashed border-amber-500/30 hover:border-amber-500/60 text-xs font-semibold transition-all group cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                  <span>None of these fit? Propose an alternative direction or kingdom</span>
                                </button>
                              ) : (
                                <div className="p-4 rounded-2xl bg-[#0a0c12]/90 border border-amber-500/40 space-y-3 animate-fadeIn">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                                      <span>Propose Alternative Creative Direction / Kingdom</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setShowAlternativeDirection(prev => ({ ...prev, [turn.id]: false }))}
                                      className="p-1 rounded-full text-stone-400 hover:text-white"
                                    >
                                      ✕
                                    </button>
                                  </div>

                                  <p className="text-[11px] text-stone-400">
                                    Specify your desired setting or historical reality. Tattava will incorporate it directly into Story Brain canon.
                                  </p>

                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      placeholder="Kingdom / Setting / Premise (e.g. Kamarupa Kingdom - Varman Dynasty)"
                                      value={customDirectionInput[turn.id]?.title || ''}
                                      onChange={(e) => setCustomDirectionInput(prev => ({
                                        ...prev,
                                        [turn.id]: { ...(prev[turn.id] || { title: '', finding: '', dramaticImplication: '' }), title: e.target.value }
                                      }))}
                                      className="w-full bg-[#0a0c12] border border-white/[0.1] rounded-full px-4 py-2 text-xs text-[#fbf8f3] placeholder:text-stone-600 focus:border-amber-500 focus:outline-none"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        placeholder="Historical finding / context (optional)"
                                        value={customDirectionInput[turn.id]?.finding || ''}
                                        onChange={(e) => setCustomDirectionInput(prev => ({
                                          ...prev,
                                          [turn.id]: { ...(prev[turn.id] || { title: '', finding: '', dramaticImplication: '' }), finding: e.target.value }
                                        }))}
                                        className="w-full bg-[#0a0c12] border border-white/[0.1] rounded-full px-4 py-2 text-xs text-[#fbf8f3] placeholder:text-stone-600 focus:border-amber-500 focus:outline-none"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Dramatic implication / core conflict (optional)"
                                        value={customDirectionInput[turn.id]?.dramaticImplication || ''}
                                        onChange={(e) => setCustomDirectionInput(prev => ({
                                          ...prev,
                                          [turn.id]: { ...(prev[turn.id] || { title: '', finding: '', dramaticImplication: '' }), dramaticImplication: e.target.value }
                                        }))}
                                        className="w-full bg-[#0a0c12] border border-white/[0.1] rounded-full px-4 py-2 text-xs text-[#fbf8f3] placeholder:text-stone-600 focus:border-amber-500 focus:outline-none"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const data = customDirectionInput[turn.id];
                                        if (!data?.title?.trim()) return;
                                        handleSendMessage(`Alternative Direction: "${data.title.trim()}". ${data.finding ? `Context: ${data.finding}. ` : ''}${data.dramaticImplication ? `Dramatic stakes: ${data.dramaticImplication}. ` : ''}Please acknowledge this direction as valid and provide evidence-backed candidate options around it.`);
                                        setShowAlternativeDirection(prev => ({ ...prev, [turn.id]: false }));
                                      }}
                                      disabled={!customDirectionInput[turn.id]?.title?.trim() || isSubmitting}
                                      className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-stone-300 text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer"
                                    >
                                      Ask AI to Research & Expand
                                    </button>

                                    <LineaButton
                                      type="button"
                                      variant="primary"
                                      size="sm"
                                      onClick={() => {
                                        const data = customDirectionInput[turn.id];
                                        if (!data?.title?.trim()) return;
                                        applyCustomDiscoveryDecision(turn.id, data.title, data.finding, data.dramaticImplication);
                                        setShowAlternativeDirection(prev => ({ ...prev, [turn.id]: false }));
                                      }}
                                      disabled={!customDirectionInput[turn.id]?.title?.trim() || isSubmitting}
                                      icon={<Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                                    >
                                      Establish Canon with My Direction
                                    </LineaButton>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Decision Confirmed Callout */}
                      {turn.appliedDecision && (
                        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs space-y-2 animate-fadeIn">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[11px] tracking-wider">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Story Brain Canon Established</span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-[#fbf8f3]">
                            {turn.appliedDecision.summary}
                          </p>
                          {turn.appliedDecision.canonFactCreated && (
                            <p className="text-xs text-emerald-300/90 font-mono bg-black/40 p-2.5 rounded-xl border border-emerald-500/20">
                              [CANON FACT LOCKED]: {turn.appliedDecision.canonFactCreated}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Next Creative Question Box & Quick Replies */}
                      {turn.nextQuestion && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-amber-400" />
                            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-300">
                              Next Unresolved Creative Question
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-[#fbf8f3] tracking-wide">
                            {turn.nextQuestion}
                          </p>

                          {/* Quick Replies */}
                          {turn.quickReplies && turn.quickReplies.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {turn.quickReplies.map((reply, rIdx) => (
                                <button
                                  key={rIdx}
                                  onClick={() => handleSendMessage(reply)}
                                  className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-amber-400 hover:text-stone-950 border border-white/[0.1] hover:border-amber-400 text-xs font-semibold text-[#fbf8f3] transition-all shadow-sm active:scale-95 text-left cursor-pointer"
                                >
                                  {reply}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* User-Entered Creative Question Input */}
                          <div className="pt-2 border-t border-amber-500/20">
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const q = customQuestionInput[turn.id];
                                if (!q?.trim()) return;
                                handleSendMessage(`Creative Question: ${q.trim()}`);
                                setCustomQuestionInput(prev => ({ ...prev, [turn.id]: '' }));
                              }}
                              className="flex items-center gap-2"
                            >
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  placeholder="Or enter your own creative question..."
                                  value={customQuestionInput[turn.id] || ''}
                                  onChange={(e) => setCustomQuestionInput(prev => ({ ...prev, [turn.id]: e.target.value }))}
                                  className="w-full bg-[#0a0c12] border border-amber-500/30 rounded-full pl-4 pr-8 py-2 text-xs text-[#fbf8f3] placeholder:text-stone-600 focus:border-amber-400 focus:outline-none transition-colors"
                                />
                                {customQuestionInput[turn.id] && (
                                  <button
                                    type="button"
                                    onClick={() => setCustomQuestionInput(prev => ({ ...prev, [turn.id]: '' }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>

                              <LineaButton
                                type="submit"
                                variant="primary"
                                size="xs"
                                disabled={!customQuestionInput[turn.id]?.trim() || isSubmitting}
                                icon={<ArrowRight className="w-3.5 h-3.5" />}
                                iconPosition="right"
                              >
                                Explore
                              </LineaButton>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator with LineaEqualizerWave */}
              {isSubmitting && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#0a0c12]/80 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <LineaEqualizerWave />
                  <span>Tattava is analyzing project intelligence and researching historical options...</span>
                </div>
              )}

              {/* Stage Forward Navigation Banner */}
              {isReadyToContinue && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                      <Brain className="w-4 h-4" />
                      <span>Your idea is taking shape. Ready to continue?</span>
                    </div>
                    <p className="text-[11px] text-stone-400">
                      Decisions you made here are saved to Story Brain. You can return to Discovery at any time.
                    </p>
                  </div>

                  <LineaButton
                    variant="primary"
                    size="sm"
                    onClick={() => setActiveScreen(forwardStep.id)}
                    icon={<ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                    iconPosition="right"
                  >
                    Continue: {forwardStep.shortLabel}
                  </LineaButton>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar with Attachment Support */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2 mt-4">
              {attachedFile && (
                <div className="flex items-center justify-between bg-[#0a0c12] border border-sky-500/30 rounded-full px-4 py-1.5 text-xs text-sky-300">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="truncate">Attached: {attachedFile.name}</span>
                  </div>
                  <button 
                    onClick={() => setAttachedFile(null)}
                    className="p-1 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.pdf,.docx,.doc,.md,.json"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
                  title="Attach source document or pitch notes"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Tell Tattava your idea or answer the next question... (e.g. 'I want the oldest kingdom possible')"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#0a0c12] border border-white/[0.1] focus:border-amber-500/60 rounded-full px-5 py-3 text-xs sm:text-sm text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none transition-all shadow-inner"
                />

                <LineaButton
                  type="submit"
                  variant="primary"
                  size="md"
                  showWave={isSubmitting}
                  disabled={isSubmitting || (!inputText.trim() && !attachedFile)}
                  icon={<Send className="w-3.5 h-3.5" />}
                  iconPosition="right"
                >
                  Explore
                </LineaButton>
              </form>
            </div>
          </BentoCard>
        </div>

        {/* Right Column: Project Intelligence Drawer (4 cols) */}
        <div className="xl:col-span-4 space-y-5">
          <BentoCard className="p-5 shadow-2xl space-y-4">
            
            {/* Header & Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-[#fbf8f3]">
                  Project Intelligence Hub
                </h3>
              </div>

              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Live Sync
              </span>
            </div>

            {/* Sub-tabs Capsule */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#0a0c12]/80 rounded-full border border-white/[0.06] text-[11px] font-semibold">
              <button
                onClick={() => setActiveIntelTab('brain')}
                className={`py-1.5 rounded-full transition-all cursor-pointer ${
                  activeIntelTab === 'brain' ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' : 'text-stone-400 hover:text-white'
                }`}
              >
                Canon ({canonFacts.length})
              </button>
              <button
                onClick={() => setActiveIntelTab('knowns')}
                className={`py-1.5 rounded-full transition-all cursor-pointer ${
                  activeIntelTab === 'knowns' ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' : 'text-stone-400 hover:text-white'
                }`}
              >
                Knowns
              </button>
              <button
                onClick={() => setActiveIntelTab('research')}
                className={`py-1.5 rounded-full transition-all cursor-pointer ${
                  activeIntelTab === 'research' ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' : 'text-stone-400 hover:text-white'
                }`}
              >
                Evidence ({researchFindings.length})
              </button>
              <button
                onClick={() => setActiveIntelTab('decisions')}
                className={`py-1.5 rounded-full transition-all cursor-pointer ${
                  activeIntelTab === 'decisions' ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' : 'text-stone-400 hover:text-white'
                }`}
              >
                Audit ({decisions.length})
              </button>
            </div>

            {/* Tab 1: Established Canon Facts */}
            {activeIntelTab === 'brain' && (
              <div className="space-y-3 min-h-[360px] max-h-[500px] overflow-y-auto pr-1">
                {canonFacts.length === 0 ? (
                  <div className="text-center py-12 space-y-2 text-stone-500">
                    <Lock className="w-8 h-8 mx-auto opacity-30 text-amber-400" />
                    <p className="text-xs font-semibold">No Canon Facts Established Yet</p>
                    <p className="text-[11px] text-stone-600 max-w-xs mx-auto">
                      Explore options in the studio and click "Decide" to lock truths into Story Brain.
                    </p>
                  </div>
                ) : (
                  canonFacts.map((fact, idx) => (
                    <div 
                      key={fact.id || idx}
                      className="p-3.5 rounded-2xl bg-[#0a0c12]/70 border border-amber-500/20 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {fact.category}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Lock className="w-3 h-3" /> Locked Canon
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#fbf8f3] leading-relaxed">
                        {fact.statement}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1 border-t border-white/[0.06]">
                        <span>Source: {fact.source}</span>
                        <span>{fact.dateEstablished}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Knowns vs Unknowns */}
            {activeIntelTab === 'knowns' && (
              <div className="space-y-4 min-h-[360px] max-h-[500px] overflow-y-auto pr-1 text-xs">
                {/* Knowns */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Known & Confirmed Information</span>
                  </span>
                  <div className="space-y-1.5">
                    {knownInformation.length === 0 ? (
                      <p className="text-[11px] text-stone-500 italic">No confirmed facts extracted yet.</p>
                    ) : (
                      knownInformation.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-2xl bg-[#0a0c12]/70 border border-emerald-500/20 text-stone-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{item}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Unknowns / Open Ambiguities */}
                <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                  <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Unresolved Ambiguities</span>
                  </span>
                  <div className="space-y-1.5">
                    {unknownInformation.length === 0 ? (
                      <p className="text-[11px] text-emerald-300">All major ambiguities resolved!</p>
                    ) : (
                      unknownInformation.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-2xl bg-[#0a0c12]/70 border border-amber-500/20 text-stone-300 flex items-start gap-2">
                          <span className="text-amber-400 font-bold">?</span>
                          <span>{item}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Traceable Evidence & Research */}
            {activeIntelTab === 'research' && (
              <div className="space-y-3 min-h-[360px] max-h-[500px] overflow-y-auto pr-1">
                {researchFindings.length === 0 ? (
                  <div className="text-center py-12 space-y-2 text-stone-500">
                    <BookOpen className="w-8 h-8 mx-auto opacity-30 text-sky-400" />
                    <p className="text-xs font-semibold">No Research Evidence Stored Yet</p>
                    <p className="text-[11px] text-stone-600 max-w-xs mx-auto">
                      Ask Tattava for historical research (e.g. "I want the oldest kingdom") to populate verified evidence.
                    </p>
                  </div>
                ) : (
                  researchFindings.map((finding, idx) => (
                    <div 
                      key={finding.id || idx}
                      className="p-3.5 rounded-2xl bg-[#0a0c12]/70 border border-sky-500/20 space-y-2 shadow-sm text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold uppercase tracking-wider text-sky-400">
                          {finding.sourceType || 'Archaeological'}
                        </span>
                        <span className="text-emerald-400 font-semibold">✓ {finding.status}</span>
                      </div>
                      <h4 className="font-bold text-[#fbf8f3] text-xs">{finding.topic}</h4>
                      <p className="text-stone-300 text-[11px] leading-relaxed">{finding.evidence || finding.claim}</p>
                      <span className="text-[10px] text-stone-500 block border-t border-white/[0.06] pt-1">
                        Source: {finding.source}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 4: Decision Audit Log */}
            {activeIntelTab === 'decisions' && (
              <div className="space-y-3 min-h-[360px] max-h-[500px] overflow-y-auto pr-1 text-xs">
                {decisions.length === 0 ? (
                  <div className="text-center py-12 space-y-2 text-stone-500">
                    <History className="w-8 h-8 mx-auto opacity-30 text-purple-400" />
                    <p className="text-xs font-semibold">No Decisions Logged Yet</p>
                    <p className="text-[11px] text-stone-600 max-w-xs mx-auto">
                      Every explicit creator decision is recorded with rationale and date.
                    </p>
                  </div>
                ) : (
                  decisions.map((dec, idx) => (
                    <div 
                      key={dec.id || idx}
                      className="p-3.5 rounded-2xl bg-[#0a0c12]/70 border border-purple-500/20 space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-semibold uppercase tracking-wider text-purple-300">
                          {dec.status}
                        </span>
                        <span className="text-stone-500">{dec.date}</span>
                      </div>
                      <h4 className="font-bold text-[#fbf8f3] text-xs">{dec.title}</h4>
                      <p className="text-stone-300 text-[11px]">{dec.rationale || dec.decision}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Deep Development Modules Quick Links */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <span className="text-[10px] uppercase font-semibold text-stone-500 tracking-wider block">
                Deep Development Modules
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setActiveScreen('story-brain')}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-stone-300 hover:text-white transition-all text-left cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Story Brain Hub</span>
                </button>

                <button
                  onClick={() => setActiveScreen('characters')}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-stone-300 hover:text-white transition-all text-left cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">Character Arcs</span>
                </button>

                <button
                  onClick={() => setActiveScreen('screenplay')}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-stone-300 hover:text-white transition-all text-left cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">Screenplay Draft</span>
                </button>

                <button
                  onClick={() => setActiveScreen('evaluation')}
                  className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-stone-300 hover:text-white transition-all text-left cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Story Evaluation</span>
                </button>
              </div>
            </div>

          </BentoCard>
        </div>

      </div>
    </div>
  );
};
