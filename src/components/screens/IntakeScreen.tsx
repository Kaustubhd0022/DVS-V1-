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
  Info
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { analyzeConceptIntake, askCopilot } from '../../services/geminiService';

export const IntakeScreen: React.FC = () => {
  const { currentProject, updateCurrentProject, nextStep, prevStep } = useProject();

  const [ideaText, setIdeaText] = useState(
    "A 24-year-old UPSC aspirant from a small town discovers a political conspiracy that changes her life. It's a story about ambition, truth and the cost of integrity in today's India."
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

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'tattava' | 'user'; text: string; time: string }>>([
    {
      sender: 'tattava',
      text: 'I can help you refine your idea. You can ask me anything, for example:\n• Is this a strong premise?\n• What are some potential angles?\n• Which genres could work?\n• What are similar films for reference?',
      time: '10:24 AM'
    },
    {
      sender: 'user',
      text: 'Can you suggest 3 different ways to approach this story?',
      time: '10:25 AM'
    },
    {
      sender: 'tattava',
      text: '1. Political Thriller (Institutional cover-up & whistleblowing)\n2. Character Drama (Family sacrifice & moral dilemma)\n3. Psychological Mystery (Paranoia & unreliable state records)',
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
          missingQuestions: breakdown.missingQuestions
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
      setChatMessages(prev => [...prev, { sender: 'tattava', text: reply, time: 'Just now' }]);
    } catch (e) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'tattava',
          text: `Great angle. Connecting this back to your premise for "${currentProject.title}": this will heighten the stakes and provide organic conflict in Act II.`,
          time: 'Just now'
        }
      ]);
    }
  };

  const handleSaveAndContinue = () => {
    updateCurrentProject(prev => ({
      ...prev,
      intent: {
        ...prev.intent,
        premise,
        protagonist,
        setting,
        themes: themes.split(',').map(t => t.trim()),
        tone,
        status: 'APPROVED'
      }
    }));
    nextStep();
  };

  const similarFilms = [
    { title: 'Article 15', genre: 'Social Thriller', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=300&auto=format&fit=crop' },
    { title: 'Raazi', genre: 'Political Drama', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' },
    { title: 'Talvar', genre: 'Investigative', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop' },
    { title: 'Delhi Crime', genre: 'True Events', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300&auto=format&fit=crop' },
    { title: '12th Fail', genre: 'Inspirational', img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=300&auto=format&fit=crop' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="text-[11px] uppercase tracking-widest font-extrabold text-[#f25b2a]">
          STEP 2 OF 16
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
          Project Intake
        </h1>
        <p className="text-sm text-[#8b99ac] mt-1">
          Tell Tattava about your idea. The more context you share, the better it understands and can guide you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Intake & My Understanding */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sub-tabs */}
          <div className="flex items-center gap-6 border-b border-[#242c3d] pb-2 text-xs font-semibold">
            {['Describe Your Idea', 'Key Details', 'References', 'Team Notes'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`transition-colors pb-2 ${
                  activeTab === tab 
                    ? 'text-[#f25b2a] border-b-2 border-[#f25b2a]' 
                    : 'text-[#8b99ac] hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Describe Your Idea Card */}
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-6 space-y-4 shadow-card">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white">Describe your idea</label>
              <span className="text-[11px] text-[#6e7d91]">{ideaText.length} / 2000</span>
            </div>

            <textarea
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              rows={4}
              placeholder="Enter your logline, premise, character dilemmas, or story world context..."
              className="w-full bg-[#181d28] border border-[#283244] focus:border-[#f25b2a] rounded-xl p-4 text-xs text-white placeholder-[#68768a] focus:outline-none leading-relaxed transition-all resize-none"
            />

            {/* Helper buttons and Analyze Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a202c] hover:bg-[#222938] text-xs text-[#a0aec0] hover:text-white border border-[#273042] transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Add File</span>
                </button>
                <button 
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a202c] hover:bg-[#222938] text-xs text-[#a0aec0] hover:text-white border border-[#273042] transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Add Voice Note</span>
                </button>
                <button 
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a202c] hover:bg-[#222938] text-xs text-[#a0aec0] hover:text-white border border-[#273042] transition-colors"
                >
                  <LayoutTemplate className="w-3.5 h-3.5" />
                  <span>Use Template</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleAnalyzeAI}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-[#f25b2a] hover:bg-[#e04b1a] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-glow-orange transition-all active:scale-95"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze with AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Extracted Output Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold bg-amber-500/10 border border-amber-500/20 px-3.5 py-2 rounded-xl">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Tattava has analyzed your input and extracted the key creative elements.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* My Understanding Card */}
              <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-5 space-y-3.5 shadow-card">
                <div className="flex items-center justify-between pb-2 border-b border-[#1f2533]">
                  <h3 className="text-sm font-bold text-white">My Understanding</h3>
                  <button
                    onClick={() => setIsEditingUnderstanding(!isEditingUnderstanding)}
                    className="flex items-center gap-1 text-xs font-semibold text-[#f25b2a] hover:text-[#ff8c42]"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingUnderstanding ? 'Done' : 'Edit'}</span>
                  </button>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[#7d8c9e] block text-[11px] font-semibold">Premise</span>
                    {isEditingUnderstanding ? (
                      <input 
                        type="text" 
                        value={premise} 
                        onChange={(e) => setPremise(e.target.value)} 
                        className="w-full bg-[#1b202c] border border-[#2a3447] rounded-lg px-2 py-1 text-xs text-white"
                      />
                    ) : (
                      <p className="text-[#cad5e2] font-medium">{premise}</p>
                    )}
                  </div>

                  <div>
                    <span className="text-[#7d8c9e] block text-[11px] font-semibold">Protagonist</span>
                    {isEditingUnderstanding ? (
                      <input 
                        type="text" 
                        value={protagonist} 
                        onChange={(e) => setProtagonist(e.target.value)} 
                        className="w-full bg-[#1b202c] border border-[#2a3447] rounded-lg px-2 py-1 text-xs text-white"
                      />
                    ) : (
                      <p className="text-[#cad5e2]">{protagonist}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[#7d8c9e] block text-[11px] font-semibold">Genre</span>
                      <p className="text-[#cad5e2]">{genre}</p>
                    </div>
                    <div>
                      <span className="text-[#7d8c9e] block text-[11px] font-semibold">Setting</span>
                      <p className="text-[#cad5e2]">{setting}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#7d8c9e] block text-[11px] font-semibold">Themes</span>
                    <p className="text-[#cad5e2]">{themes}</p>
                  </div>

                  <div>
                    <span className="text-[#7d8c9e] block text-[11px] font-semibold">Tone</span>
                    <p className="text-[#cad5e2]">{tone}</p>
                  </div>
                </div>
              </div>

              {/* What's Missing? Gap Analysis Card */}
              <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-5 space-y-3.5 shadow-card">
                <div className="flex items-center justify-between pb-2 border-b border-[#1f2533]">
                  <h3 className="text-sm font-bold text-white">What's Missing?</h3>
                  <span className="text-[11px] text-[#718094] hover:text-white cursor-pointer flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>Why this matters?</span>
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {currentProject.intent.missingQuestions.slice(0, 5).map((q, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[#9bb0c7]">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 rounded-xl bg-[#1b202c] border border-[#283244] text-[11px] text-[#8e9eb0]">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Pro Tip</span>
                  </div>
                  <span>
                    Answering these questions now helps Tattava generate richer, more cohesive story directions in Step 4.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Ask Tattava & Quick Inspiration */}
        <div className="space-y-6">
          {/* Ask Tattava Box */}
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-5 space-y-3 shadow-card flex flex-col h-[350px]">
            <div className="flex items-center justify-between pb-2 border-b border-[#202737]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f25b2a]" />
                <h3 className="text-sm font-bold text-white">Ask Tattava</h3>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Project Context ON
              </span>
            </div>

            {/* Chat message stream */}
            <div className="flex-1 overflow-y-auto space-y-2.5 text-xs pr-1">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#f25b2a] text-white ml-6'
                      : 'bg-[#1b202c] text-[#cad5e2] mr-4 border border-[#273142]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendChat} className="relative pt-2 border-t border-[#1f2533]">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="w-full bg-[#181d28] border border-[#2a3447] rounded-xl pl-3 pr-9 py-2 text-xs text-white placeholder-[#68768a] focus:outline-none focus:border-[#f25b2a]"
              />
              <button
                type="submit"
                className="absolute right-2 top-3.5 p-1 rounded-lg text-[#f25b2a] hover:text-white"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Quick Inspiration Card */}
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-5 space-y-3 shadow-card">
            <div className="flex items-center justify-between pb-2 border-b border-[#202737]">
              <h3 className="text-sm font-bold text-white">Quick Inspiration</h3>
              <span className="text-[10px] text-[#718094] hover:text-white cursor-pointer">View All →</span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-3 text-xs border-b border-[#202737] pb-1.5">
              {['Similar Films', 'Themes', 'Characters', 'Settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setInspirationTab(tab)}
                  className={`text-[11px] font-semibold transition-colors ${
                    inspirationTab === tab ? 'text-[#f25b2a]' : 'text-[#7d8c9e] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Film Cards Grid */}
            <div className="grid grid-cols-5 gap-2 pt-1">
              {similarFilms.map(film => (
                <div key={film.title} className="text-center group cursor-pointer">
                  <div className="w-full h-16 rounded-lg overflow-hidden border border-[#2b3548] group-hover:border-[#f25b2a] transition-colors">
                    <img src={film.img} alt={film.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-[10px] font-bold text-white mt-1 truncate">{film.title}</p>
                  <p className="text-[8px] text-[#718094] truncate">{film.genre}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 border-t border-[#222836] flex items-center justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-[#8b99ac] hover:text-white hover:bg-[#181d28] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[#718094]">Step 2 of 16</span>
          <button
            type="button"
            onClick={handleSaveAndContinue}
            className="flex items-center gap-2 bg-[#f25b2a] hover:bg-[#e04b1a] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-glow-orange transition-all active:scale-95"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
