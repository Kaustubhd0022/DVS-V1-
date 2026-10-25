import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  BookOpen, 
  Users, 
  Layers, 
  RefreshCw,
  Send,
  Shield,
  FileText,
  Key,
  Edit3
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { analyzeConceptIntake, askCopilot, IntakeAnalysisResult } from '../../services/aiService';

export const IntakeScreen: React.FC = () => {
  const { 
    currentProject, 
    updateCurrentProject, 
    initializeStoryBrainFromIntake, 
    setActiveScreen, 
    nextStep 
  } = useProject();

  const premise = currentProject.intent?.premise || currentProject.tagline || '';
  const isApproved = currentProject.intent?.intakeAnalysisStatus === 'APPROVED' || currentProject.storyBrain?.canonFacts?.length > 0;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Structured understanding state
  const [understanding, setUnderstanding] = useState<IntakeAnalysisResult>({
    premise: currentProject.intent?.premise || '',
    protagonist: currentProject.intent?.protagonist || '',
    setting: currentProject.intent?.setting || '',
    conflict: currentProject.intent?.conflict || '',
    stakes: currentProject.intent?.stakes || '',
    themes: currentProject.intent?.themes?.length ? currentProject.intent.themes : [],
    tone: currentProject.intent?.tone || '',
    knownInformation: currentProject.intent?.knownInformation?.length ? currentProject.intent.knownInformation : [premise ? 'User Provided Concept' : 'No premise provided yet'],
    unknownInformation: currentProject.intent?.unknownInformation?.length ? currentProject.intent.unknownInformation : ['Specific antagonist identity', 'Timeline limits'],
    missingQuestions: currentProject.intent?.missingQuestions?.length ? currentProject.intent.missingQuestions : ['What is the protagonist’s primary vulnerability?'],
    suggestedResearchAreas: currentProject.intent?.suggestedResearchAreas?.length ? currentProject.intent.suggestedResearchAreas : []
  });

  const [isEditing, setIsEditing] = useState(false);

  // Chat with Tattava Copilot on Intake
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'tattvaCo' | 'user'; text: string; time: string }>>([
    {
      sender: 'tattvaCo',
      text: `Welcome to Project Intake for "${currentProject.title}". I examine your creative input, distinguish known facts from AI inferences, and prepare the foundational Story Brain state before establishing canon.`,
      time: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  // Run dynamic analysis if not yet analyzed
  const runIntakeAnalysis = async () => {
    if (!premise.trim()) {
      setAnalysisError('No concept premise found in this project. Please add a premise to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await analyzeConceptIntake(
        premise,
        currentProject.contentType,
        currentProject.language
      );
      setUnderstanding(result);

      // Save into project draft intent
      updateCurrentProject(prev => ({
        ...prev,
        intent: {
          ...prev.intent,
          premise: result.premise,
          protagonist: result.protagonist,
          setting: result.setting,
          conflict: result.conflict,
          stakes: result.stakes,
          themes: result.themes,
          tone: result.tone,
          knownInformation: result.knownInformation,
          unknownInformation: result.unknownInformation,
          missingQuestions: result.missingQuestions,
          suggestedResearchAreas: result.suggestedResearchAreas,
          intakeAnalysisStatus: 'ANALYZED'
        }
      }));
    } catch (err: any) {
      console.warn('Intake analysis failed:', err);
      const msg = err?.message || 'Could not analyze project concept.';
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-trigger analysis once on first entry if premise exists and hasn't been analyzed
  useEffect(() => {
    if (premise && !understanding.protagonist && currentProject.intent?.intakeAnalysisStatus !== 'APPROVED') {
      runIntakeAnalysis();
    }
  }, [premise]);

  const handleApproveAndInitializeBrain = () => {
    initializeStoryBrainFromIntake({
      premise: understanding.premise,
      protagonist: understanding.protagonist,
      setting: understanding.setting,
      conflict: understanding.conflict,
      stakes: understanding.stakes,
      themes: understanding.themes,
      tone: understanding.tone
    });
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userText, time: 'Just now' }]);
    setIsChatting(true);

    const projectContext = `
Project: "${currentProject.title}" (${currentProject.contentType})
Premise: "${understanding.premise || premise}"
Protagonist: "${understanding.protagonist}"
Conflict: "${understanding.conflict}"
Setting: "${understanding.setting}"
Known Information: ${understanding.knownInformation.join('; ')}
Unknown Information: ${understanding.unknownInformation.join('; ')}
    `.trim();

    try {
      const reply = await askCopilot(userText, projectContext, chatMessages);
      setChatMessages(prev => [...prev, { sender: 'tattvaCo', text: reply, time: 'Just now' }]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        { 
          sender: 'tattvaCo', 
          text: `[AI Alert]: ${err?.message || 'Inference error. Please check your API key in Settings.'}`,
          time: 'Just now'
        }
      ]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="linea-caption-chip">
              Pipeline Step 01
            </span>
            <span className="text-xs text-stone-400">• Project Intake & Ambiguity Detection</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-[#fbf8f3] flex items-center gap-3">
            <span>Project Understanding & Intake</span>
            {isApproved && (
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved Canon
              </span>
            )}
          </h1>
          <p className="text-sm text-stone-400 mt-1 max-w-3xl">
            Deconstructing <strong className="text-[#fbf8f3]">"{currentProject.title}"</strong>. Distinguishing raw user input from AI inferences, surfacing open questions, and establishing verified baseline canon.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={runIntakeAnalysis}
            disabled={isAnalyzing}
            className="linea-pill-btn linea-pill-secondary px-4 py-2 text-xs font-semibold gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing Input...' : 'Re-Analyze with AI'}</span>
            {isAnalyzing && (
              <span className="linea-btn-wave ml-1" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            )}
          </button>

          {!isApproved && (
            <button
              onClick={handleApproveAndInitializeBrain}
              className="linea-pill-btn linea-pill-primary px-4 py-2 text-xs font-bold gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Canon</span>
            </button>
          )}

          <button
            onClick={() => setActiveScreen('research')}
            className="linea-pill-btn linea-pill-primary px-5 py-2 text-xs font-bold gap-2"
            title="Advance to Traceable Research & Evidence"
          >
            <span>Next: Research & Evidence</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Error alert if AI fails */}
      {analysisError && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold text-white mb-0.5">AI Inference Notice</strong>
              <p>{analysisError}</p>
              <p className="mt-1 text-white/60">
                Check the AI status in Settings, or edit the project understanding manually below.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="linea-pill-btn linea-pill-primary px-3 py-1.5 text-xs font-bold shrink-0"
          >
            Edit Manually
          </button>
        </div>
      )}

      {/* Main Grid: Left Understanding Dossier (8 cols), Right Ambiguity / Chat (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Project Understanding Dossier (8 cols) */}
        <div className="xl:col-span-8 space-y-6">

          {/* Section A: User-Provided Input */}
          <div className="linea-bento rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3] font-mono">
                  User-Provided Source Material
                </h3>
              </div>
              <span className="linea-caption-chip">
                USER-PROVIDED (AUTHENTIC)
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-stone-500 block mb-1 font-mono uppercase tracking-wider">RAW STORY PREMISE</span>
                <p className="text-sm text-[#fbf8f3] font-mono bg-[#0a0c12] p-4 rounded-2xl border border-white/5 leading-relaxed">
                  "{premise || 'No premise provided yet. Add an initial idea to start project intelligence.'}"
                </p>
              </div>

              {currentProject.intent?.uploadedMaterialName && (
                <div className="p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between text-xs">
                  <span className="text-cyan-300 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Uploaded Source: <strong>{currentProject.intent.uploadedMaterialName}</strong></span>
                  </span>
                  <span className="text-stone-500 text-[10px] font-mono">Extracted Text Referenced</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-2xl bg-[#0a0c12] border border-white/5">
                  <span className="text-stone-500 block text-[9px] uppercase font-mono tracking-wider">CONTENT FORMAT</span>
                  <span className="font-semibold text-[#fbf8f3] mt-0.5 block">{currentProject.contentType}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0a0c12] border border-white/5">
                  <span className="text-stone-500 block text-[9px] uppercase font-mono tracking-wider">PRIMARY LANGUAGE</span>
                  <span className="font-semibold text-[#fbf8f3] mt-0.5 block">{currentProject.language}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0a0c12] border border-white/5">
                  <span className="text-stone-500 block text-[9px] uppercase font-mono tracking-wider">PRIMARY GENRE</span>
                  <span className="font-semibold text-[#fbf8f3] mt-0.5 block">{currentProject.genre}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section B: AI-Inferred Intelligence (Pending Approval) */}
          <div className="linea-bento rounded-3xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3] font-mono">
                  AI-Inferred Narrative Architecture
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isApproved 
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                {isApproved ? 'USER-APPROVED (CANON)' : 'AI-INFERRED (CANDIDATE)'}
              </span>
            </div>

            {isAnalyzing ? (
              <div className="p-8 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-[#fbf8f3]">
                  Analyzing raw concept with AI...
                </p>
                <p className="text-[11px] text-stone-400">
                  Extracting protagonist psychometrics, world setting, and dramatic conflicts
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Synthesized Logline */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1 font-mono">
                    SYNTHESIZED LOGLINE
                  </span>
                  <p className="text-sm font-serif text-[#fbf8f3] leading-relaxed">
                    {understanding.premise || premise}
                  </p>
                </div>

                {/* 2x2 Grid: Protagonist, Setting, Conflict, Stakes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-[#0a0c12] border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                      POTENTIAL PROTAGONIST
                    </span>
                    <p className="text-stone-300 leading-relaxed">
                      {understanding.protagonist || 'A driven central protagonist to be shaped.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0a0c12] border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                      STORY DOMAIN & WORLD SETTING
                    </span>
                    <p className="text-stone-300 leading-relaxed">
                      {understanding.setting || 'Grounded setting to be defined.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0a0c12] border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                      CORE DRAMATIC CONFLICT
                    </span>
                    <p className="text-stone-300 leading-relaxed">
                      {understanding.conflict || 'Irreconcilable moral or physical obstacle.'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0a0c12] border border-white/5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                      CATASTROPHIC STAKES
                    </span>
                    <p className="text-stone-300 leading-relaxed">
                      {understanding.stakes || 'Severe personal and public consequences upon failure.'}
                    </p>
                  </div>
                </div>

                {/* Known vs Unknown Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-[#0a0c12] border border-cyan-500/20 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      KNOWN INFORMATION (FROM INPUT)
                    </span>
                    <ul className="space-y-1.5 text-xs text-stone-300">
                      {understanding.knownInformation.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-cyan-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0a0c12] border border-amber-500/20 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-mono">
                      <HelpCircle className="w-3.5 h-3.5" />
                      UNKNOWN INFORMATION (GAPS)
                    </span>
                    <ul className="space-y-1.5 text-xs text-stone-300">
                      {understanding.unknownInformation.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Open Clarifying Questions */}
                {understanding.missingQuestions.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#0a0c12] border border-white/5 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">
                      OPEN QUESTIONS TO RESOLVE
                    </span>
                    <div className="space-y-2">
                      {understanding.missingQuestions.map((q, idx) => (
                        <div key={idx} className="text-xs text-stone-300 flex items-start gap-2.5">
                          <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                            {idx + 1}
                          </span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Bar (Linea Bento Capsule) */}
          <div className="p-6 rounded-3xl linea-bento flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-bold text-[#fbf8f3] uppercase tracking-wider font-mono">
                {isApproved ? 'Story Brain Initialized' : 'Ready to Establish Baseline Canon?'}
              </h4>
              <p className="text-[11px] text-stone-400 mt-1">
                {isApproved 
                  ? 'Canonical facts are now locked in Story Brain. Explore directions or develop characters.'
                  : 'Approving converts this AI inference into locked canonical knowledge in Story Brain.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!isApproved ? (
                <button
                  onClick={handleApproveAndInitializeBrain}
                  className="linea-pill-btn linea-pill-primary px-5 py-2.5 text-xs font-bold gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Understanding as Canon</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveScreen('research')}
                  className="linea-pill-btn linea-pill-primary px-5 py-2.5 text-xs font-bold gap-2"
                >
                  <span>Next: Traceable Research</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}

              <button
                onClick={() => setActiveScreen('story-exploration')}
                className="linea-pill-btn linea-pill-secondary px-4 py-2.5 text-xs font-semibold gap-2"
              >
                <span>Explore Story Directions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Copilot Q&A on Intake (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="linea-bento rounded-3xl p-6 flex flex-col h-[680px]">
            <div className="pb-3 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3] flex items-center gap-2 font-mono">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span>Intake Copilot</span>
                </h3>
                <p className="text-[11px] text-stone-400 mt-0.5">Ask questions about this specific project</p>
              </div>
              <span className="linea-caption-chip">
                Project-Scoped
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-100 ml-4'
                      : 'bg-[#0a0c12] border border-white/5 text-stone-200 mr-2'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-500 mb-1 font-mono">
                    <span className="font-bold">{msg.sender === 'user' ? 'You' : 'Tattava Copilot'}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              ))}

              {isChatting && (
                <div className="p-3 rounded-2xl bg-[#0a0c12] border border-white/5 text-xs text-stone-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Reasoning on project context...</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="pt-3 border-t border-white/[0.08] relative flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about protagonist flaw, stakes..."
                className="w-full bg-[#0a0c12] border border-white/10 focus:border-amber-400 rounded-full pl-4 pr-11 py-2.5 text-xs text-[#fbf8f3] placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-400/40 transition-all"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatting}
                className="absolute right-1.5 w-7 h-7 rounded-full bg-amber-400 hover:bg-amber-300 disabled:opacity-30 text-black flex items-center justify-center transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
