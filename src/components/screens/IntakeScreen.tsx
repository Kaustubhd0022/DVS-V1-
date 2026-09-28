import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Edit3, 
  HelpCircle, 
  FileText, 
  Mic, 
  LayoutTemplate, 
  Send, 
  Check, 
  RefreshCw,
  Film,
  Info,
  Brain,
  AlertCircle,
  CheckCircle2,
  Shield
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { analyzeConceptIntake, askCopilot } from '../../services/geminiService';

export const IntakeScreen: React.FC = () => {
  const { currentProject, updateCurrentProject, nextStep, prevStep, setActiveScreen } = useProject();

  const [ideaText, setIdeaText] = useState(
    "A 34-year-old UPSC aspirant on her final attempt uncovers an engineered flood catastrophe in Vidarbha, forcing her to choose between achieving her civil service dream and exposing the state power brokers who bankrupted her family."
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('Describe Your Idea');
  const [inspirationTab, setInspirationTab] = useState('Similar Films');
  const [isEditingUnderstanding, setIsEditingUnderstanding] = useState(false);

  // Editable fields for My Understanding
  const [premise, setPremise] = useState(currentProject.intent.premise);
  const [protagonist, setProtagonist] = useState(currentProject.intent.protagonist);
  const [genre, setGenre] = useState(currentProject.genre);
  const [setting, setSetting] = useState(currentProject.intent.setting);
  const [themes, setThemes] = useState(currentProject.intent.themes.join(', '));
  const [tone, setTone] = useState(currentProject.intent.tone);

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'tattvaCo' | 'user'; text: string; time: string }>>([
    {
      sender: 'tattvaCo',
      text: 'Welcome to Flow 1 (Project Intake & Ambiguity Detection). I examine your initial material, extract structured entities, surface implicit assumptions, and propose the initial Story Brain state before establishing canon.',
      time: '10:24 AM'
    },
    {
      sender: 'user',
      text: 'How does raising Aanya’s age to 34 impact the central conflict?',
      time: '10:25 AM'
    },
    {
      sender: 'tattvaCo',
      text: 'At 34, she reaches the absolute civil service attempt age-ceiling under DoPT regulations. This converts a standard coming-of-age story into an irrevocable existential thriller where failure equals total lifelong disqualification.',
      time: '10:25 AM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleAnalyzeAI = async () => {
    setIsAnalyzing(true);
    try {
      const breakdown = await analyzeConceptIntake(ideaText);
      setPremise(breakdown.premise);
      setProtagonist(breakdown.protagonist);
      setSetting(breakdown.setting);
      setTone(breakdown.tone);
      setThemes(breakdown.themes.join(', '));
      
      updateCurrentProject(prev => ({
        ...prev,
        intent: {
          ...prev.intent,
          premise: breakdown.premise,
          protagonist: breakdown.protagonist,
          setting: breakdown.setting,
          conflict: breakdown.conflict,
          stakes: breakdown.stakes,
          tone: breakdown.tone,
          themes: breakdown.themes,
          missingQuestions: breakdown.missingQuestions,
          storyBrainProposed: true
        }
      }));
    } catch (e) {
      console.warn('AI analysis error', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const query = chatInput;
    setChatInput('');
    const msg = { sender: 'user' as const, text: query, time: 'Just now' };
    setChatMessages(prev => [...prev, msg]);

    try {
      const reply = await askCopilot(query, `Premise: ${ideaText || premise}`);
      setChatMessages(prev => [...prev, { sender: 'tattvaCo', text: reply, time: 'Just now' }]);
    } catch (e) {
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'tattvaCo', 
          text: `Analyzing "${query}": The Story Brain requires grounding this in the Upper Penganga Barrage SCADA records to maintain procedural plausibility.`, 
          time: 'Just now' 
        }
      ]);
    }
  };

  const handleSaveAndInitializeStoryBrain = () => {
    updateCurrentProject(prev => ({
      ...prev,
      intent: {
        ...prev.intent,
        premise,
        protagonist,
        setting,
        themes: themes.split(',').map(t => t.trim()),
        tone,
        status: 'APPROVED',
        storyBrainProposed: true
      }
    }));
    setActiveScreen('story-brain');
  };

  const ambiguities = [
    { text: 'Clarified: Antagonist is non-elected oligarch operating via public relief trust (Resolved #CD-02)', status: 'Resolved' },
    { text: 'Clarified: Protagonist age set to 34 to enforce irrevocable final attempt stakes (Resolved #CD-01)', status: 'Resolved' },
    { text: 'Pending Verification: Flashback timeline calibration between 2018 and current day', status: 'Flagged' }
  ];

  const similarFilms = [
    { title: 'Article 15', genre: 'Social Thriller', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop' },
    { title: 'Raazi', genre: 'Political Drama', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
    { title: 'Talvar', genre: 'Investigative', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
    { title: 'Delhi Crime', genre: 'True Events', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop' },
    { title: '12th Fail', genre: 'Inspirational', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=300&auto=format&fit=crop' }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Flow 1 • Intake & Ambiguity Detection
            </span>
            <span className="text-xs text-white/40">• Story Brain Initialization</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Creative Input & Project Intake
          </h1>
          <p className="text-sm text-white/70 mt-1 max-w-2xl">
            Tattava extracts narrative intent, detects unstated assumptions and ambiguities, and prompts targeted questions before committing initial facts to the Story Brain.
          </p>
        </div>

        <button
          onClick={handleSaveAndInitializeStoryBrain}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
        >
          <Brain className="w-4 h-4" />
          <span>Approve & Initialize Story Brain</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Input & Extracted Elements */}
        <div className="lg:col-span-8 space-y-6">
          {/* Describe Your Idea Card */}
          <div className="bg-[#141822] border border-white/10 rounded-2xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-white/70">Raw Concept Input / Creative Brief</label>
              <span className="text-[11px] font-mono text-white/40">{ideaText.length} / 2000 chars</span>
            </div>

            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              rows={4}
              placeholder="Enter your logline, premise, character dilemmas, or story world context..."
              className="w-full bg-[#181d28] border border-white/10 focus:border-amber-500 rounded-xl p-4 text-xs text-white placeholder-white/40 focus:outline-none leading-relaxed transition-all resize-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white border border-white/10 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Attach Brief</span>
                </button>
                <button 
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/70 hover:text-white border border-white/10 transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice Memo</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleAnalyzeAI}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deconstructing Narrative Pillars...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Deconstruct & Detect Ambiguities</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ambiguity Detection Panel */}
          <div className="bg-[#141822] border border-amber-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Narrative Ambiguity & Assumption Detection (Section 5 / PR-003)
              </h3>
              <span className="text-[10px] text-white/40">Guards against ungrounded canon</span>
            </div>

            <div className="space-y-2">
              {ambiguities.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    {item.status === 'Resolved' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    )}
                    <span className="text-white/80">{item.text}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    item.status === 'Resolved' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Extracted Output Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* My Understanding Card */}
            <div className="bg-[#141822] border border-white/10 rounded-2xl p-5 space-y-3.5 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-400" />
                  Proposed Story Brain State
                </h3>
                <button
                  onClick={() => setIsEditingUnderstanding(!isEditingUnderstanding)}
                  className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingUnderstanding ? 'Lock' : 'Edit'}</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-white/40 block text-[11px] font-semibold">Premise</span>
                  {isEditingUnderstanding ? (
                    <textarea 
                      value={premise} 
                      onChange={(e) => setPremise(e.target.value)} 
                      rows={2}
                      className="w-full bg-[#1b202c] border border-white/20 rounded-lg p-2 text-xs text-white"
                    />
                  ) : (
                    <p className="text-white font-medium leading-relaxed">{premise}</p>
                  )}
                </div>

                <div>
                  <span className="text-white/40 block text-[11px] font-semibold">Protagonist Arc Focus</span>
                  {isEditingUnderstanding ? (
                    <input 
                      type="text" 
                      value={protagonist} 
                      onChange={(e) => setProtagonist(e.target.value)} 
                      className="w-full bg-[#1b202c] border border-white/20 rounded-lg px-2 py-1 text-xs text-white"
                    />
                  ) : (
                    <p className="text-white/80">{protagonist}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-white/40 block text-[11px] font-semibold">Genre</span>
                    <p className="text-white font-medium">{genre}</p>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[11px] font-semibold">Setting</span>
                    <p className="text-white font-medium">{setting}</p>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-white/40 block text-[11px] font-semibold">Thematic Engine</span>
                  <p className="text-amber-200/90">{themes}</p>
                </div>
              </div>
            </div>

            {/* What's Missing? Gap Analysis Card */}
            <div className="bg-[#141822] border border-white/10 rounded-2xl p-5 space-y-3.5 shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h3 className="text-sm font-bold text-white">Targeted Clarifying Questions</h3>
                <span className="text-[10px] text-white/40">Step 3 Input</span>
              </div>

              <div className="space-y-2 text-xs">
                {currentProject.intent.missingQuestions.slice(0, 4).map((q, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-white/80 p-2.5 rounded-lg bg-black/20 border border-white/5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>{q}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-200/90 leading-relaxed">
                <strong className="text-cyan-300 block mb-0.5">Flow 1 Operating Rule:</strong>
                Answering these questions promotes them into explicit Story Brain facts, eliminating downstream generic hallucinations.
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Ask Copilot & Guidance */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#141822] border border-white/10 rounded-2xl p-5 space-y-3 shadow-md flex flex-col h-[400px]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Narrative Intake Copilot</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Story Brain Synced
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 text-xs pr-1">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-black font-medium ml-6'
                      : 'bg-black/40 text-white/90 mr-4 border border-white/10'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="relative pt-2 border-t border-white/10">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about character age, setting, or stakes..."
                className="w-full bg-[#181d28] border border-white/10 rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="absolute right-2 top-3.5 p-1 rounded-lg text-amber-400 hover:text-white"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="bg-[#141822] border border-white/10 rounded-2xl p-5 space-y-3 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Comparative Story References</h3>
            <div className="grid grid-cols-5 gap-2 pt-1">
              {similarFilms.map(film => (
                <div key={film.title} className="text-center group cursor-pointer">
                  <div className="w-full h-16 rounded-lg overflow-hidden border border-white/10 group-hover:border-amber-500 transition-colors">
                    <img src={film.img} alt={film.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-[10px] font-bold text-white mt-1 truncate">{film.title}</p>
                  <p className="text-[8px] text-white/40 truncate">{film.genre}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
