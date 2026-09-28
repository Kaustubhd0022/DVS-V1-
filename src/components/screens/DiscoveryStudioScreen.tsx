import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  BookOpen, 
  Users, 
  Layers, 
  RefreshCw, 
  Shield, 
  FileText, 
  ArrowRight, 
  Upload, 
  Paperclip, 
  ChevronRight, 
  Lock, 
  Compass, 
  Award, 
  Clapperboard, 
  Check, 
  X,
  History,
  Info,
  Flame,
  ChevronDown,
  Eye,
  Sliders
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { DiscoveryCandidateOption, DiscoveryTurn } from '../../types/project';

export const DiscoveryStudioScreen: React.FC = () => {
  const { 
    currentProject, 
    discoverySession, 
    sendDiscoveryMessage, 
    applyDiscoveryDecision,
    setActiveScreen,
    openContextResolver
  } = useProject();

  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [showThoughtMap, setShowThoughtMap] = useState<Record<string, boolean>>({});
  const [activeIntelTab, setActiveIntelTab] = useState<'brain' | 'knowns' | 'research' | 'decisions'>('brain');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const turns = discoverySession?.turns || [];
  const ambiguityLevel = discoverySession?.ambiguityLevel ?? 80;
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
    <div className="space-y-6 animate-fadeIn max-w-[1700px] mx-auto pb-16">
      {/* Studio Header & Dynamic Ambiguity Bar */}
      <div className="bg-gradient-to-r from-[#12151c] via-[#161a24] to-[#141722] border border-white/10 rounded-3xl p-5 lg:p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              Creative Discovery Studio
            </span>
            <span className="text-xs text-white/40">• Loop: Understand → Explore → Decide → Remember → Develop</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold font-serif text-white tracking-tight">
              {currentProject.title}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-white/80 border border-white/10">
              {currentProject.contentType}
            </span>
            {currentProject.genre && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {currentProject.genre}
              </span>
            )}
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            {currentProject.intent?.premise || 'Explore your story premise conversationally with Tattava. All verified choices are stored persistently in Story Brain.'}
          </p>
        </div>

        {/* Ambiguity Meter & Telemetry */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {/* Ambiguity Gauge Card */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5 px-5 flex flex-col justify-center min-w-[240px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-white/60 font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Creative Ambiguity</span>
              </span>
              <span className={`font-mono font-bold ${
                ambiguityLevel <= 30 ? 'text-emerald-400' : ambiguityLevel <= 60 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {ambiguityLevel}%
              </span>
            </div>
            
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
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

            <span className="text-[10px] text-white/40 mt-1">
              {ambiguityLevel <= 30 
                ? 'Grounded: Core canon and narrative engine established' 
                : ambiguityLevel <= 60 
                ? 'Maturing: World rules and direction taking shape' 
                : 'Formative: Open exploration and research phase'}
            </span>
          </div>

          {/* Quick Context Inspector Button */}
          <button
            onClick={() => openContextResolver('Story Direction', 'Conversational Discovery')}
            className="px-4 py-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            title="Inspect Scoped Context Package"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Context Inspector</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Conversational Feed (8 cols) vs Right Project Intelligence Drawer (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Conversational Feed & Discovery Studio (8 cols) */}
        <div className="xl:col-span-8 space-y-5">
          <div className="bg-[#12141a]/95 border border-white/10 rounded-3xl p-5 lg:p-7 min-h-[580px] max-h-[780px] flex flex-col justify-between shadow-2xl backdrop-blur-xl relative">
            
            {/* Scrollable Conversation Feed */}
            <div className="overflow-y-auto pr-2 space-y-6 flex-1 scrollbar-thin scrollbar-thumb-white/10">
              
              {/* If no turns yet, show welcome card */}
              {turns.length === 0 && (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 text-center space-y-4 my-8">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-lg font-bold text-white font-serif">
                      Welcome to Tattava Discovery
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
                      Begin with a simple creative spark. Tell me your working title, an era, a protagonist role, or an initial premise.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => handleSendMessage("I want to create a historical series called Rajyam.")}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-amber-300 font-semibold transition-all hover:scale-105"
                    >
                      "I want to create a historical series called Rajyam."
                    </button>
                    <button
                      onClick={() => handleSendMessage("A gritty cyberpunk thriller set in 2048 Mumbai about an illegal memory extractor.")}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-cyan-300 font-semibold transition-all hover:scale-105"
                    >
                      "Cyberpunk memory thriller in Mumbai 2048"
                    </button>
                    <button
                      onClick={() => handleSendMessage("A courtroom drama examining the first murder committed by an autonomous vehicle.")}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-emerald-300 font-semibold transition-all hover:scale-105"
                    >
                      "Courtroom drama on autonomous vehicle liability"
                    </button>
                  </div>
                </div>
              )}

              {/* Render Turns */}
              {turns.map((turn, tIdx) => {
                const isUser = turn.role === 'user';

                if (isUser) {
                  return (
                    <div key={turn.id} className="flex justify-end animate-fadeIn">
                      <div className="max-w-2xl bg-amber-500/15 border border-amber-500/30 text-white rounded-2xl rounded-tr-sm p-4 px-5 shadow-lg space-y-1">
                        <div className="flex items-center justify-between gap-3 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          <span>Story Creator</span>
                          <span>{turn.timestamp}</span>
                        </div>
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                          {turn.userText}
                        </p>
                      </div>
                    </div>
                  );
                }

                // Tattava Response Turn
                const showThought = showThoughtMap[turn.id];

                return (
                  <div key={turn.id} className="flex flex-col space-y-4 animate-fadeIn">
                    
                    {/* Tattava Header & Thought Pill */}
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                          <Brain className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-white tracking-wide">Tattava Creative Partner</span>
                        <span className="text-[10px] font-mono text-white/40">• {turn.timestamp}</span>
                      </div>

                      {turn.thought && (
                        <button
                          onClick={() => toggleThought(turn.id)}
                          className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors font-semibold"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>{showThought ? 'Hide Diagnostic Reasoning' : 'View Diagnostic Reasoning'}</span>
                          <ChevronDown className={`w-3 h-3 transition-transform ${showThought ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    {/* Diagnostic Thought Card (Progressive Ambiguity Reduction) */}
                    {showThought && turn.thought && (
                      <div className="p-3.5 rounded-xl bg-black/50 border border-amber-500/20 text-xs text-amber-200/90 font-mono space-y-1 animate-fadeIn">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                          Tattava Internal Reasoning & Ambiguity Map
                        </span>
                        <p className="leading-relaxed">{turn.thought}</p>
                      </div>
                    )}

                    {/* Conversational Reply Card */}
                    <div className="bg-[#181c26] border border-white/10 rounded-2xl rounded-tl-sm p-5 space-y-4 shadow-xl">
                      <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap font-sans">
                        {turn.conversationalReply}
                      </p>

                      {/* If Research Objective Was Triggered */}
                      {turn.researchObjective && (
                        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 flex items-center gap-2.5">
                          <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                          <div>
                            <span className="font-bold uppercase text-[10px] text-blue-400 block tracking-wider">
                              Research Objective Investigated
                            </span>
                            <span>{turn.researchObjective}</span>
                          </div>
                        </div>
                      )}

                      {/* Candidate Options (Epistemic Rigor: Source, Evidence, Finding, Dramatic Implication) */}
                      {turn.candidateOptions && turn.candidateOptions.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between pb-1 border-b border-white/10">
                            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5" />
                              <span>Evidence-Backed Candidate Options</span>
                            </span>
                            <span className="text-[10px] font-mono text-white/40">
                              Uncommitted proposals • Select one to establish Canon
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-3.5">
                            {turn.candidateOptions.map((opt) => {
                              const isAccepted = opt.status === 'ACCEPTED';
                              const isDismissed = opt.status === 'DISMISSED';

                              return (
                                <div 
                                  key={opt.id}
                                  className={`rounded-2xl border transition-all p-4 space-y-3 ${
                                    isAccepted
                                      ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                                      : isDismissed
                                      ? 'bg-black/30 border-white/5 opacity-50'
                                      : 'bg-[#1b202c] hover:bg-[#202636] border-white/10 hover:border-amber-500/40 shadow-md'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider ${
                                        isAccepted
                                          ? 'bg-emerald-500 text-black'
                                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      }`}>
                                        {isAccepted ? '✓ Established Canon' : 'AI Candidate'}
                                      </span>
                                      <h4 className="text-sm font-bold text-white">
                                        {opt.title}
                                      </h4>
                                    </div>

                                    {opt.era && (
                                      <span className="text-[11px] font-mono text-white/60 bg-black/40 px-2 py-0.5 rounded">
                                        {opt.era}
                                      </span>
                                    )}
                                  </div>

                                  {/* Epistemic Tiers Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-black/40 p-3 rounded-xl border border-white/5">
                                    {/* Source & Evidence */}
                                    <div className="space-y-1.5 border-b md:border-b-0 md:border-r border-white/10 pb-2 md:pb-0 md:pr-3">
                                      <div>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 block">
                                          Source ({opt.sourceType || 'Historical Record'})
                                        </span>
                                        <p className="text-white/70 text-[11px]">{opt.source || 'Historical Epigraphy & Literature'}</p>
                                      </div>

                                      {opt.evidence && (
                                        <div>
                                          <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 block">
                                            Evidence
                                          </span>
                                          <p className="text-white/80 text-[11px] leading-relaxed">{opt.evidence}</p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Finding & Dramatic Implication */}
                                    <div className="space-y-1.5 md:pl-2">
                                      <div>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block">
                                          Historical Finding
                                        </span>
                                        <p className="text-white/80 text-[11px] leading-relaxed">{opt.finding}</p>
                                      </div>

                                      {opt.dramaticImplication && (
                                        <div>
                                          <span className="text-[10px] uppercase tracking-wider font-bold text-rose-400 block">
                                            Dramatic Implication
                                          </span>
                                          <p className="text-white/90 text-[11px] font-medium leading-relaxed">{opt.dramaticImplication}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action Bar */}
                                  {!isAccepted && !isDismissed && (
                                    <div className="flex items-center justify-end pt-1">
                                      <button
                                        onClick={() => applyDiscoveryDecision(turn.id, opt.id)}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                                      >
                                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                        <span>Decide: Adopt this Kingdom & Establish Canon</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Decision Confirmed Callout */}
                      {turn.appliedDecision && (
                        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs space-y-2 animate-fadeIn">
                          <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-[11px] tracking-wider">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Story Brain Canon Established</span>
                          </div>
                          <p className="text-sm font-semibold text-white">
                            {turn.appliedDecision.summary}
                          </p>
                          {turn.appliedDecision.canonFactCreated && (
                            <p className="text-xs text-emerald-300/90 font-mono bg-black/40 p-2.5 rounded-lg border border-emerald-500/20">
                              [CANON FACT LOCKED]: {turn.appliedDecision.canonFactCreated}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Next Creative Question Box & Quick Replies */}
                      {turn.nextQuestion && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 pt-3">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-amber-400" />
                            <span className="text-[11px] uppercase tracking-wider font-extrabold text-amber-400">
                              Next Unresolved Creative Question
                            </span>
                          </div>

                          <p className="text-sm font-bold text-white tracking-wide">
                            {turn.nextQuestion}
                          </p>

                          {/* Quick Replies */}
                          {turn.quickReplies && turn.quickReplies.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {turn.quickReplies.map((reply, rIdx) => (
                                <button
                                  key={rIdx}
                                  onClick={() => handleSendMessage(reply)}
                                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-black border border-white/10 hover:border-amber-500 text-xs font-semibold text-white transition-all shadow-sm active:scale-95 text-left"
                                >
                                  {reply}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator while Groq LPU infers */}
              {isSubmitting && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#181c26] border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Tattava is analyzing project intelligence and researching historical options...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar with Attachment Support */}
            <div className="pt-4 border-t border-white/10 space-y-2 mt-4">
              {attachedFile && (
                <div className="flex items-center justify-between bg-black/40 border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-cyan-300">
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
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors"
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
                  className="flex-1 bg-black/50 border border-white/10 focus:border-amber-500 rounded-2xl px-5 py-3 text-sm text-white placeholder-white/40 focus:outline-none transition-all shadow-inner"
                />

                <button
                  type="submit"
                  disabled={isSubmitting || (!inputText.trim() && !attachedFile)}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <span>Explore</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Living Story Brain & Project Intelligence Drawer (4 cols) */}
        <div className="xl:col-span-4 space-y-5">
          <div className="bg-[#12141a]/95 border border-white/10 rounded-3xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
            
            {/* Header & Tabs */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-serif">
                  Project Intelligence Hub
                </h3>
              </div>

              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                Live Sync
              </span>
            </div>

            {/* Sub-tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-black/40 rounded-xl border border-white/5 text-[11px] font-semibold">
              <button
                onClick={() => setActiveIntelTab('brain')}
                className={`py-1.5 rounded-lg transition-colors ${
                  activeIntelTab === 'brain' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Canon ({canonFacts.length})
              </button>
              <button
                onClick={() => setActiveIntelTab('knowns')}
                className={`py-1.5 rounded-lg transition-colors ${
                  activeIntelTab === 'knowns' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Knowns
              </button>
              <button
                onClick={() => setActiveIntelTab('research')}
                className={`py-1.5 rounded-lg transition-colors ${
                  activeIntelTab === 'research' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Evidence ({researchFindings.length})
              </button>
              <button
                onClick={() => setActiveIntelTab('decisions')}
                className={`py-1.5 rounded-lg transition-colors ${
                  activeIntelTab === 'decisions' ? 'bg-amber-500 text-black font-bold' : 'text-white/60 hover:text-white'
                }`}
              >
                Audit ({decisions.length})
              </button>
            </div>

            {/* Tab 1: Established Canon Facts */}
            {activeIntelTab === 'brain' && (
              <div className="space-y-3 min-h-[360px] max-h-[500px] overflow-y-auto pr-1">
                {canonFacts.length === 0 ? (
                  <div className="text-center py-12 space-y-2 text-white/40">
                    <Lock className="w-8 h-8 mx-auto opacity-30 text-amber-400" />
                    <p className="text-xs font-semibold">No Canon Facts Established Yet</p>
                    <p className="text-[11px] text-white/30 max-w-xs mx-auto">
                      Explore options in the studio and click "Decide" to lock truths into Story Brain.
                    </p>
                  </div>
                ) : (
                  canonFacts.map((fact, idx) => (
                    <div 
                      key={fact.id || idx}
                      className="p-3.5 rounded-2xl bg-[#161a24] border border-amber-500/20 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {fact.category}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                          <Lock className="w-3 h-3" /> Locked Canon
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white leading-relaxed">
                        {fact.statement}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/5">
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
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Known & Confirmed Information</span>
                  </span>
                  <div className="space-y-1.5">
                    {knownInformation.length === 0 ? (
                      <p className="text-[11px] text-white/40 italic">No confirmed facts extracted yet.</p>
                    ) : (
                      knownInformation.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 text-white/80 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{item}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Unknowns / Open Ambiguities */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Unresolved Ambiguities</span>
                  </span>
                  <div className="space-y-1.5">
                    {unknownInformation.length === 0 ? (
                      <p className="text-[11px] text-emerald-300">All major ambiguities resolved!</p>
                    ) : (
                      unknownInformation.map((item, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 text-white/70 flex items-start gap-2">
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
                  <div className="text-center py-12 space-y-2 text-white/40">
                    <BookOpen className="w-8 h-8 mx-auto opacity-30 text-blue-400" />
                    <p className="text-xs font-semibold">No Research Evidence Stored Yet</p>
                    <p className="text-[11px] text-white/30 max-w-xs mx-auto">
                      Ask Tattava for historical research (e.g. "I want the oldest kingdom") to populate verified evidence.
                    </p>
                  </div>
                ) : (
                  researchFindings.map((finding, idx) => (
                    <div 
                      key={finding.id || idx}
                      className="p-3.5 rounded-2xl bg-[#161a24] border border-blue-500/20 space-y-2 shadow-sm text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase tracking-wider text-blue-400">
                          {finding.sourceType || 'Archaeological'}
                        </span>
                        <span className="text-emerald-400 font-bold">✓ {finding.status}</span>
                      </div>
                      <h4 className="font-bold text-white text-xs">{finding.topic}</h4>
                      <p className="text-white/70 text-[11px] leading-relaxed">{finding.evidence || finding.claim}</p>
                      <span className="text-[10px] text-white/40 block border-t border-white/5 pt-1">
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
                  <div className="text-center py-12 space-y-2 text-white/40">
                    <History className="w-8 h-8 mx-auto opacity-30 text-purple-400" />
                    <p className="text-xs font-semibold">No Decisions Logged Yet</p>
                    <p className="text-[11px] text-white/30 max-w-xs mx-auto">
                      Every explicit creator decision is recorded with rationale and date.
                    </p>
                  </div>
                ) : (
                  decisions.map((dec, idx) => (
                    <div 
                      key={dec.id || idx}
                      className="p-3.5 rounded-2xl bg-[#161a24] border border-purple-500/20 space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold uppercase tracking-wider text-purple-400">
                          {dec.status}
                        </span>
                        <span className="text-white/40">{dec.date}</span>
                      </div>
                      <h4 className="font-bold text-white text-xs">{dec.title}</h4>
                      <p className="text-white/70 text-[11px]">{dec.rationale || dec.decision}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Progressive Disclosure: Deep Module Quick Links */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider block">
                Deep Development Modules
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setActiveScreen('story-brain')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all text-left"
                >
                  <Brain className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Story Brain Hub</span>
                </button>

                <button
                  onClick={() => setActiveScreen('characters')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all text-left"
                >
                  <Users className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">Character Arcs</span>
                </button>

                <button
                  onClick={() => setActiveScreen('screenplay')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">Screenplay Draft</span>
                </button>

                <button
                  onClick={() => setActiveScreen('evaluation')}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-all text-left"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">Story Evaluation</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
