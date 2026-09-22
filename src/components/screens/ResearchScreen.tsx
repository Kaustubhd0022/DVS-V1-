import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Search, 
  Sparkles, 
  ExternalLink, 
  BookOpen, 
  AlertCircle, 
  FileCheck, 
  Video, 
  Link2,
  Users,
  Clapperboard,
  Globe2,
  Filter
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const ResearchScreen: React.FC = () => {
  const { currentProject, updateCurrentProject, nextStep, prevStep } = useProject();

  const [activeTab, setActiveTab] = useState('Research Overview');
  const [filterType, setFilterType] = useState<'All' | 'Verified' | 'Needs Review' | 'Conflicting'>('All');
  const [questions, setQuestions] = useState(currentProject.researchQuestions);
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [showAddQuestion, setShowAddQuestion] = useState(false);

  const handleToggleQuestion = (id: string) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, completed: !q.completed } : q))
    );
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionInput.trim()) return;
    const newQ = {
      id: 'rq-' + Date.now(),
      title: newQuestionInput.trim(),
      category: 'User Added',
      completed: false
    };
    setQuestions([...questions, newQ]);
    setNewQuestionInput('');
    setShowAddQuestion(false);
  };

  const findings = currentProject.researchFindings;
  const filteredFindings = filterType === 'All' 
    ? findings 
    : findings.filter(f => f.status === filterType);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest font-extrabold text-[#f25b2a]">
            STEP 3 OF 16
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            Research
          </h1>
          <p className="text-sm text-[#8b99ac] mt-1">
            Find the truth. Build a believable world. Better stories come from deeper understanding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddQuestion(true)}
            className="flex items-center gap-1.5 bg-[#1a202c] hover:bg-[#222a3a] border border-[#2d374a] text-xs font-semibold text-white px-3.5 py-2 rounded-xl transition-all"
          >
            <Plus className="w-4 h-4 text-[#f25b2a]" />
            <span>Add Research Question</span>
          </button>
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 bg-[#f25b2a] hover:bg-[#e04b1a] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-glow-orange transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Research</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-6 border-b border-[#242c3d] pb-2 text-xs font-semibold">
        {['Research Overview', 'Research Questions', 'Findings', 'Sources', 'Connections', 'Notes'].map(tab => (
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

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-4 flex items-center gap-3.5 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-none">12</h3>
            <p className="text-xs font-semibold text-[#c8d4e4] mt-0.5">Research Questions</p>
            <p className="text-[10px] text-[#718094]">8 completed • 4 in progress</p>
          </div>
        </div>

        <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-4 flex items-center gap-3.5 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-none">48</h3>
            <p className="text-xs font-semibold text-[#c8d4e4] mt-0.5">Findings</p>
            <p className="text-[10px] text-[#718094]">36 verified • 6 need review</p>
          </div>
        </div>

        <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-4 flex items-center gap-3.5 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-none">27</h3>
            <p className="text-xs font-semibold text-[#c8d4e4] mt-0.5">Sources</p>
            <p className="text-[10px] text-[#718094]">Government, academic, media...</p>
          </div>
        </div>

        <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-4 flex items-center gap-3.5 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-none">0</h3>
            <p className="text-xs font-semibold text-[#c8d4e4] mt-0.5">Conflicts</p>
            <p className="text-[10px] text-emerald-400 font-semibold">All clear for now</p>
          </div>
        </div>
      </div>

      {/* Main 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (3.5 cols): Research Questions Checklist */}
        <div className="lg:col-span-4 bg-[#141822] border border-[#242c3d] rounded-2xl p-5 space-y-3.5 shadow-card h-fit">
          <div className="flex items-center justify-between pb-2 border-b border-[#202737]">
            <h3 className="text-sm font-bold text-white">Research Questions</h3>
            <span className="text-[11px] text-[#718094]">
              {questions.filter(q => q.completed).length}/{questions.length} done
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {questions.map((q) => (
              <div
                key={q.id}
                onClick={() => handleToggleQuestion(q.id)}
                className={`cursor-pointer flex items-center gap-3 p-2.5 rounded-xl border text-xs transition-all ${
                  q.completed
                    ? 'bg-[#181d28] border-[#252e40] text-[#8e9eb2]'
                    : 'bg-[#1a202d] border-[#2e394d] text-white hover:border-[#f25b2a]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  q.completed ? 'bg-emerald-500 text-black' : 'border border-[#45536b]'
                }`}>
                  {q.completed && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                </div>
                <span className={`flex-1 ${q.completed ? 'line-through text-[#6e7d91]' : 'font-medium'}`}>
                  {q.title}
                </span>
              </div>
            ))}

            {showAddQuestion && (
              <form onSubmit={handleAddQuestion} className="pt-2">
                <input
                  type="text"
                  autoFocus
                  value={newQuestionInput}
                  onChange={(e) => setNewQuestionInput(e.target.value)}
                  placeholder="Type question and hit enter..."
                  className="w-full bg-[#181d28] border border-[#f25b2a] rounded-xl px-3 py-2 text-xs text-white placeholder-[#68768a] focus:outline-none"
                />
              </form>
            )}

            <button
              onClick={() => setShowAddQuestion(true)}
              className="w-full py-2 flex items-center justify-center gap-1.5 text-xs text-[#f25b2a] hover:text-[#ff8c42] font-semibold border border-dashed border-[#2d374a] rounded-xl hover:border-[#f25b2a] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add a question</span>
            </button>
          </div>
        </div>

        {/* Middle Column (5 cols): Key Findings */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Key Findings</h3>
            <div className="flex items-center gap-1.5 text-xs">
              {(['All', 'Verified', 'Needs Review'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    filterType === filter
                      ? 'bg-[#f25b2a] text-white'
                      : 'bg-[#181d28] text-[#7d8c9e] hover:text-white border border-[#273042]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            {filteredFindings.map((finding) => (
              <div
                key={finding.id}
                className="bg-[#141822] border border-[#242c3d] rounded-2xl p-4 shadow-card hover:border-[#38455e] transition-all space-y-3"
              >
                <div className="flex gap-3">
                  {finding.imageUrl && (
                    <img
                      src={finding.imageUrl}
                      alt={finding.topic}
                      className="w-20 h-20 rounded-xl object-cover border border-[#2b3548] flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {finding.claim}
                    </h4>
                    <p className="text-[11px] text-[#9bb0c7] mt-1 leading-relaxed line-clamp-2">
                      {finding.evidence}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1f2637] text-[10px]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-semibold border border-blue-500/20">
                      {finding.sourceType}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {finding.status}
                    </span>
                    <span className="text-[#6c7c90]">{finding.date}</span>
                  </div>

                  <button 
                    onClick={() => {}} 
                    className="text-[#f25b2a] hover:text-[#ff8c42] font-semibold flex items-center gap-1"
                  >
                    <span>View Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (3 cols): Insights & Connect to Project */}
        <div className="lg:col-span-3 space-y-5">
          {/* Research Insight Card */}
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-4 space-y-2 shadow-card">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Research Insight</span>
            </div>
            <p className="text-xs text-[#a9baca] leading-relaxed">
              Most UPSC aspirants experience a cycle of hope, failure, self-doubt and renewed attempts. This emotional journey can add profound authenticity to your protagonist's arc.
            </p>
          </div>

          {/* Connect to Project */}
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-4 space-y-3 shadow-card">
            <h4 className="text-xs font-bold text-white">Connect to Project</h4>
            <p className="text-[11px] text-[#78889c]">Link this research directly into story entities:</p>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#181d28] border border-[#273142] text-[#cad5e2]">
                <span className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  Characters
                </span>
                <span className="font-bold text-white bg-[#252d3d] px-2 py-0.5 rounded text-[10px]">3 linked</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#181d28] border border-[#273142] text-[#cad5e2]">
                <span className="flex items-center gap-2">
                  <Clapperboard className="w-3.5 h-3.5 text-emerald-400" />
                  Scenes
                </span>
                <span className="font-bold text-white bg-[#252d3d] px-2 py-0.5 rounded text-[10px]">5 linked</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#181d28] border border-[#273142] text-[#cad5e2]">
                <span className="flex items-center gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-purple-400" />
                  World Building
                </span>
                <span className="font-bold text-white bg-[#252d3d] px-2 py-0.5 rounded text-[10px]">2 linked</span>
              </div>
            </div>
          </div>

          {/* Related Media */}
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-4 space-y-3 shadow-card">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white">Related Media</h4>
              <span className="text-[10px] text-[#78889c] hover:text-white cursor-pointer">View All →</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { title: 'UPSC Documentary', source: 'YouTube • 2023', duration: '12:34' },
                { title: 'Aspirants (Series)', source: 'Prime Video', duration: '02:15' },
                { title: 'Article: The UPSC Dream', source: 'The Hindu • 2023', duration: '5 min read' }
              ].map((m, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-[#181d28] border border-[#273142]">
                  <div className="truncate">
                    <p className="font-semibold text-white truncate">{m.title}</p>
                    <p className="text-[10px] text-[#718094]">{m.source}</p>
                  </div>
                  <span className="text-[9px] text-[#8e9eb0] bg-[#222938] px-1.5 py-0.5 rounded">
                    {m.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 border-t border-[#222836] flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-[#8b99ac] hover:text-white hover:bg-[#181d28] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Research foundation is ready. You can now explore story directions.</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[#718094]">Step 3 of 16</span>
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2 bg-[#f25b2a] hover:bg-[#e04b1a] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-glow-orange transition-all active:scale-95"
          >
            <span>Continue to Story Exploration</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
