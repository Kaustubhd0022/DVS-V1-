import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Plus, 
  Clapperboard, 
  ArrowRight, 
  MoreVertical, 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Layers, 
  FolderPlus,
  Flame,
  Brain,
  Shield,
  Award,
  BookOpen,
  ShieldAlert,
  Package,
  Upload,
  FileText,
  Paperclip,
  Send,
  X
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const HomeScreen: React.FC = () => {
  const { 
    projects, 
    openProject, 
    openDemoProject,
    duplicateProject, 
    deleteProject,
    setActiveScreen,
    startProjectFromIdea
  } = useProject();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [ideaInput, setIdeaInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartIdea = async (customIdea?: string) => {
    const text = customIdea || ideaInput;
    if (!text.trim() && !attachedFile) return;

    setIsStarting(true);
    try {
      await startProjectFromIdea(text, attachedFile || undefined);
    } catch (e) {
      console.error(e);
      setIsStarting(false);
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

  // Separate user projects from demo projects
  const userProjects = projects.filter(p => !p.isDemo);
  const demoProjects = projects.filter(p => p.isDemo);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-gradient-to-r from-[#10131a] via-[#161a24] to-[#121620]">
        <div 
          className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-transparent to-transparent pointer-events-none" />

        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              <Brain className="w-3.5 h-3.5" />
              <span>Tattava Copilot • V1 Pilot</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-display leading-tight">
              Turn ideas into <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">governed narrative intelligence.</span>
            </h1>
            <p className="text-[#a0aec0] text-sm md:text-base leading-relaxed">
              An AI-native story development operating system for entertainment teams. Project intelligence is derived strictly from your input, research, and approved Story Brain canon.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/50 text-xs text-white/90 border border-white/10">
                <Brain className="w-3 h-3 text-amber-400" />
                Persistent Story Brain
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/50 text-xs text-white/90 border border-white/10">
                <Shield className="w-3 h-3 text-blue-400" />
                Traceable Evidence
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/50 text-xs text-white/90 border border-white/10">
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                Continuity Engine
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/50 text-xs text-white/90 border border-white/10">
                <Award className="w-3 h-3 text-emerald-400" />
                Narrative Evaluation
              </span>
            </div>
          </div>

          <div className="hidden lg:block text-right pr-4">
            <p className="font-serif text-3xl text-amber-300 -rotate-3 select-none">
              Stories for a<br />Brighter Tomorrow
            </p>
            <p className="text-[11px] text-white/40 mt-2 font-mono">Don Vanzara Showbiz LLP</p>
          </div>
        </div>
      </div>

      {/* Flagship: Conversational Idea Launcher Studio Bar (Tasks 3, 4, 5) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#141824] via-[#1a1f2e] to-[#161a26] border-2 border-amber-500/40 p-6 md:p-8 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Native Creative Discovery</span>
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-white tracking-tight">
              Begin with an Idea or Source Material
            </h2>
            <p className="text-xs text-white/60">
              No mandatory forms. Tattava parses your creative impulse, identifies what is unresolved, and naturally asks the next useful question.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openDemoProject}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Reference Demo</span>
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="space-y-2 pt-2">
          {attachedFile && (
            <div className="flex items-center justify-between bg-black/40 border border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs text-cyan-300">
              <div className="flex items-center gap-2 truncate">
                <Paperclip className="w-3.5 h-3.5" />
                <span className="truncate">Attached Material: {attachedFile.name}</span>
              </div>
              <button onClick={() => setAttachedFile(null)} className="p-1 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
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
              className="px-4 py-3.5 rounded-2xl bg-black/40 hover:bg-black/60 text-white/70 hover:text-white border border-white/10 hover:border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0"
              title="Upload Pitch Brief, Script Treatment, or Source Notes"
            >
              <Paperclip className="w-4 h-4 text-amber-400" />
              <span>{attachedFile ? 'Replace Document' : 'Attach Material (Optional)'}</span>
            </button>

            <input 
              type="text"
              value={ideaInput}
              onChange={(e) => setIdeaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleStartIdea();
              }}
              placeholder='e.g. "I want to create a historical series called Rajyam."'
              disabled={isStarting}
              className="flex-1 bg-black/60 border border-white/15 focus:border-amber-500 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-white/35 focus:outline-none transition-all shadow-inner"
            />

            <button
              type="button"
              onClick={() => handleStartIdea()}
              disabled={isStarting || (!ideaInput.trim() && !attachedFile)}
              className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/25 cursor-pointer shrink-0"
            >
              <span>{isStarting ? 'Starting Studio...' : 'Start Developing'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] text-white/40 uppercase font-mono tracking-wider">Try an idea:</span>
          <button
            onClick={() => handleStartIdea("I want to create a historical series called Rajyam.")}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:border-amber-500/40 border border-white/10 text-white/80 hover:text-amber-300 text-[11px] font-semibold transition-all text-left"
          >
            "I want to create a historical series called Rajyam."
          </button>
          <button
            onClick={() => handleStartIdea("A high-stakes political thriller set in 2035 New Delhi exploring artificial intelligence in nuclear defense.")}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-white/10 text-white/80 hover:text-cyan-300 text-[11px] font-semibold transition-all text-left"
          >
            "AI nuclear defense thriller in New Delhi 2035"
          </button>
          <button
            onClick={() => handleStartIdea("An intimate family courtroom drama set in Kerala following the disputed inheritance of a centuries-old spice plantation.")}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-white/10 text-white/80 hover:text-emerald-300 text-[11px] font-semibold transition-all text-left"
          >
            "Spice plantation inheritance drama in Kerala"
          </button>
        </div>
      </div>

      {/* SECTION 3: FIRST-TIME USER EXPERIENCE (When no user projects exist) */}
      {projects.length === 0 && (
        <div className="rounded-3xl bg-[#12141a]/95 border-2 border-amber-500/30 p-8 md:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
            <Brain className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              GETTING STARTED
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-white tracking-tight">
              Create Your First Project
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              No project intelligence exists yet. Tattava builds its understanding exclusively from your input, premise, and uploaded material.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto pt-4 text-left">
            {/* Option 1: Create New Project */}
            <div
              onClick={() => setActiveScreen('create-project')}
              className="group cursor-pointer p-6 rounded-2xl bg-[#161922] hover:bg-[#1a1e2a] border border-white/10 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  Create New Project
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Start with a logline, premise, or rough idea. Tattava will deconstruct your input.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <span>Start Fresh</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Option 2: Import Existing Material */}
            <div
              onClick={() => setActiveScreen('create-project')}
              className="group cursor-pointer p-6 rounded-2xl bg-[#161922] hover:bg-[#1a1e2a] border border-white/10 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Import Existing Material
                </h3>
                <p className="text-xs text-white/50 leading-relaxed">
                  Upload a PDF, DOCX, or TXT pitch treatment. The system will extract structured entities.
                </p>
              </div>
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                <span>Upload Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Option 3: Open Demo Project (Section 21) */}
            <div
              onClick={openDemoProject}
              className="group cursor-pointer p-6 rounded-2xl bg-[#161922] hover:bg-[#1a1e2a] border border-white/10 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 shadow-lg relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Open Demo Project
                  </h3>
                </div>
                <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                  DEMO — SAMPLE DATA
                </span>
                <p className="text-xs text-white/50 leading-relaxed">
                  Inspect "The Last Monsoon" reference project with pre-populated Story Brain facts and canon.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span>Explore Reference Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Projects & Side Dashboard (When projects exist) */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Projects & Development Journey */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Active Workspaces ({projects.length})</h2>
                <p className="text-xs text-white/50">Story projects governed by their respective Story Brain</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={openDemoProject}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Open Demo Project</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('create-project')}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1 transition-all shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Project</span>
                </button>
              </div>
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {projects.map((proj) => {
                const factCount = proj.storyBrain?.canonFacts?.length || 0;
                const charCount = proj.characters?.length || 0;
                const evalScore = proj.evaluation?.overallScore ? Math.round(proj.evaluation.overallScore) : null;

                return (
                  <div
                    key={proj.id}
                    className={`group relative rounded-2xl bg-[#141822] border overflow-hidden flex flex-col shadow-lg transition-all duration-300 ${
                      proj.isDemo 
                        ? 'border-amber-500/40 hover:border-amber-400' 
                        : 'border-white/10 hover:border-cyan-500/40'
                    }`}
                  >
                    {/* Poster Banner */}
                    <div 
                      className="relative h-40 overflow-hidden bg-slate-900 cursor-pointer" 
                      onClick={() => openProject(proj.id, 'story-brain')}
                    >
                      <img
                        src={proj.posterUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-[#141822]/40 to-transparent" />

                      {/* Stage Pill */}
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide border shadow-sm bg-black/60 text-white/90 border-white/20">
                        {proj.stage}
                      </span>

                      {/* Demo or Evaluation Badge */}
                      {proj.isDemo ? (
                        <span className="absolute top-3 right-10 px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wide border bg-amber-500/20 text-amber-300 border-amber-500/40 uppercase">
                          DEMO / SAMPLE
                        </span>
                      ) : evalScore ? (
                        <span className="absolute top-3 right-10 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          {evalScore}% Ready
                        </span>
                      ) : (
                        <span className="absolute top-3 right-10 px-2 py-0.5 rounded-full text-[9px] font-mono text-white/50 bg-black/60 border border-white/10">
                          {proj.canonicalVersion || 'v0.1'}
                        </span>
                      )}

                      {/* More Menu button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === proj.id ? null : proj.id);
                        }}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-sm transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Menu dropdown */}
                      {activeMenuId === proj.id && (
                        <div className="absolute top-11 right-3 w-40 bg-[#1a202d] border border-white/20 rounded-xl shadow-xl p-1.5 z-20 text-xs">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openProject(proj.id, 'story-brain');
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-white hover:bg-white/10 rounded-lg font-medium"
                          >
                            Open Story Brain
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateProject(proj.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 text-white/70 hover:bg-white/10 rounded-lg"
                          >
                            Duplicate
                          </button>
                          {!proj.isDemo && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProject(proj.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                            >
                              Delete Project
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 
                            onClick={() => openProject(proj.id, 'story-brain')}
                            className="text-base font-bold text-white group-hover:text-amber-400 cursor-pointer transition-colors truncate"
                          >
                            {proj.title}
                          </h3>
                        </div>

                        <p className="text-[11px] text-white/50 mt-0.5">
                          {proj.contentType} • {proj.genre}
                        </p>
                        
                        <p className="text-xs text-white/70 mt-2 line-clamp-2 leading-relaxed">
                          {proj.intent?.premise || proj.tagline || 'Premise under development.'}
                        </p>
                      </div>

                      {/* Story Brain & Progress Footer */}
                      <div className="mt-4 pt-3 border-t border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-amber-300/90 font-medium flex items-center gap-1 font-mono">
                            <Brain className="w-3.5 h-3.5 text-amber-400" />
                            {factCount} Canon Facts Locked
                          </span>
                          <span className="text-white/60 text-[10px]">
                            {charCount} Characters
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[10px] text-white/40">
                          <span>{proj.lastUpdated}</span>
                          <button
                            onClick={() => openProject(proj.id, 'story-brain')}
                            className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                          >
                            <span>Open Workspace</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Create New Project Card */}
              <div
                onClick={() => setActiveScreen('create-project')}
                className="group cursor-pointer rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-500 bg-[#12151d]/60 hover:bg-[#151924] p-6 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[260px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#1d2330] group-hover:bg-amber-500 border border-white/20 group-hover:border-amber-500 flex items-center justify-center text-white/60 group-hover:text-black shadow-sm transition-all group-hover:scale-110">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mt-4 group-hover:text-amber-400 transition-colors">
                  Start New Project
                </h3>
                <p className="text-xs text-white/50 mt-1 max-w-[200px]">
                  Build Story Brain around your own original premise.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Golden Loop Overview */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#131620] border border-white/10 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">V1 Pilot Golden Workflow</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Tattava enforces human governance across every step of story development:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 font-mono font-bold flex items-center justify-center text-xs">1</span>
                  <div>
                    <strong className="block text-white">Input & Ambiguity Intake</strong>
                    <span className="text-[11px] text-white/50">Analyze premise; distinguish known vs inferred.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 font-mono font-bold flex items-center justify-center text-xs">2</span>
                  <div>
                    <strong className="block text-white">Story Brain System of Record</strong>
                    <span className="text-[11px] text-white/50">Lock approved canonical facts & decision log.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-500/15 text-blue-400 font-mono font-bold flex items-center justify-center text-xs">3</span>
                  <div>
                    <strong className="block text-white">Character & Story Development</strong>
                    <span className="text-[11px] text-white/50">Generate candidate arcs grounded in canon.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-400 font-mono font-bold flex items-center justify-center text-xs">4</span>
                  <div>
                    <strong className="block text-white">Canon & Continuity Engine</strong>
                    <span className="text-[11px] text-white/50">Audit drafts against locked Story Brain truths.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 font-mono font-bold flex items-center justify-center text-xs">5</span>
                  <div>
                    <strong className="block text-white">AI Evaluation & Story Package</strong>
                    <span className="text-[11px] text-white/50">Rubric readiness audit & greenlight delivery.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
