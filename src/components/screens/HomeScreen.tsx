import React from 'react';
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
  Package
} from 'lucide-react';
import { useProject, PIPELINE_STEPS } from '../../context/ProjectContext';

export const HomeScreen: React.FC = () => {
  const { 
    projects, 
    openProject, 
    duplicateProject, 
    setActiveScreen, 
    setCopilotOpen, 
    sendCopilotMessage,
    openContextResolver
  } = useProject();

  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  const copilotQuickPrompts = [
    'Inspect active Story Brain facts',
    'Evaluate narrative readiness',
    'Check continuity contradictions',
    'Synthesize story directions',
    'Review research evidence',
    'Assemble final story package'
  ];

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
              <span>Tattava Copilot • V1 Pilot Release</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-display leading-tight">
              Turn ideas into <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">governed narrative intelligence.</span>
            </h1>
            <p className="text-[#a0aec0] text-sm md:text-base leading-relaxed">
              An AI-native story development co-pilot for entertainment teams. Persistent Story Brain, traceable evidence, deep character psychometrics, real-time continuity verification, and rubric-based narrative evaluation.
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
                AI Quality Evaluation
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

      {/* Main Grid: Projects & Side Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Projects & Development Journey */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Active Pilot Workspaces</h2>
              <p className="text-xs text-white/50">Story development projects governed by Story Brain</p>
            </div>
            <button 
              onClick={() => setActiveScreen('create-project')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <span>+ New Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {projects.map((proj) => {
              const factCount = proj.storyBrain?.canonFacts?.length || 8;
              const evalScore = Math.round(proj.evaluation?.overallScore || 87);

              return (
                <div
                  key={proj.id}
                  className="group relative rounded-2xl bg-[#141822] border border-white/10 hover:border-amber-500/40 overflow-hidden flex flex-col shadow-lg transition-all duration-300"
                >
                  {/* Poster Banner */}
                  <div 
                    className="relative h-44 overflow-hidden bg-slate-900 cursor-pointer" 
                    onClick={() => openProject(proj.id, 'story-brain')}
                  >
                    <img
                      src={proj.posterUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-[#141822]/40 to-transparent" />

                    {/* Stage Pill */}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border shadow-sm bg-amber-500/20 text-amber-300 border-amber-500/40">
                      {proj.stage}
                    </span>

                    {/* Readiness Pill */}
                    <span className="absolute top-3 right-10 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      {evalScore}% Ready
                    </span>

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
                            openProject(proj.id, 'evaluation');
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-2.5 py-1.5 text-white hover:bg-white/10 rounded-lg"
                        >
                          Story Evaluation
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
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 
                          onClick={() => openProject(proj.id, 'story-brain')}
                          className="text-base font-bold text-white group-hover:text-amber-400 cursor-pointer transition-colors"
                        >
                          {proj.title}
                        </h3>
                        <span className="text-[10px] font-mono text-white/40">{proj.canonicalVersion || 'v1.2'}</span>
                      </div>

                      <p className="text-[11px] text-white/50 mt-0.5">
                        {proj.contentType} • {proj.language}
                      </p>
                      
                      <p className="text-xs text-white/70 mt-2 line-clamp-2 leading-relaxed">
                        {proj.intent.premise || proj.tagline}
                      </p>
                    </div>

                    {/* Story Brain & Progress Footer */}
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-amber-300/80 font-medium flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5 text-amber-400" />
                          {factCount} Canon Facts Locked
                        </span>
                        <span className="font-bold text-white">{proj.progressPercent}% Developed</span>
                      </div>

                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${proj.progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[10px] text-white/40">
                        <div className="flex -space-x-1.5">
                          {proj.teamMembers.slice(0, 3).map((m) => (
                            <div
                              key={m.id}
                              className="w-5 h-5 rounded-full bg-[#272e3d] border border-[#141822] flex items-center justify-center text-[9px] font-bold text-white"
                              title={`${m.name} (${m.role})`}
                            >
                              {m.initials}
                            </div>
                          ))}
                        </div>
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
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-white/15 hover:border-amber-500 bg-[#12151d]/60 hover:bg-[#151924] p-6 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[280px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1d2330] group-hover:bg-amber-500 border border-white/20 group-hover:border-amber-500 flex items-center justify-center text-white/60 group-hover:text-black shadow-sm transition-all group-hover:scale-110">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mt-4 group-hover:text-amber-400 transition-colors">
                Start New Project
              </h3>
              <p className="text-xs text-white/50 mt-1 max-w-[200px]">
                Initialize Story Brain from a logline, pitch brief, or reference book.
              </p>
            </div>
          </div>

          {/* V1 Golden Loop Workflow Map */}
          <div className="rounded-2xl bg-[#131620] border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">V1 Pilot Golden Loop</h3>
                <p className="text-xs text-white/50">The canonical path from accepted creative input to human-approved package</p>
              </div>
              <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                16 Connected Steps
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5 text-center">
              {[
                { stage: 'Intake', step: 2, icon: '💡' },
                { stage: 'Story Brain', step: 3, icon: '🧠', highlight: true },
                { stage: 'Research', step: 4, icon: '🔍' },
                { stage: 'Story', step: 5, icon: '📖' },
                { stage: 'Characters', step: 7, icon: '👥' },
                { stage: 'Treatment', step: 10, icon: '✍️' },
                { stage: 'Continuity', step: 14, icon: '🛡️' },
                { stage: 'Package', step: 16, icon: '📦' },
              ].map((item) => (
                <div
                  key={item.stage}
                  onClick={() => openProject(projects[0].id, PIPELINE_STEPS.find(s => s.step === item.step)?.id || 'story-brain')}
                  className={`cursor-pointer group p-3 rounded-xl border transition-all flex flex-col items-center justify-between ${
                    item.highlight
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-[#171b25] hover:bg-[#202636] border-white/10 hover:border-amber-500/30'
                  }`}
                >
                  <span className="text-lg mb-1 group-hover:scale-125 transition-transform">{item.icon}</span>
                  <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">{item.stage}</p>
                  <span className="text-[9px] text-white/40 mt-0.5">Step {item.step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Copilot & Pilot Instrumentation */}
        <div className="space-y-6">
          {/* Pilot Instrumentation Box */}
          <div className="rounded-2xl bg-[#141822] border border-cyan-500/30 p-5 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Pilot Telemetry</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                Live
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30">
                <span className="text-white/60">Research Verification Rate</span>
                <span className="font-bold text-emerald-400">{projects[0].pilotMetrics.verificationRate}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30">
                <span className="text-white/60">Continuity Catch Rate</span>
                <span className="font-bold text-cyan-400">{projects[0].pilotMetrics.continuityCatchRate}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30">
                <span className="text-white/60">Candidate Acceptance</span>
                <span className="font-bold text-amber-400">{projects[0].pilotMetrics.candidateAcceptanceRate}%</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-black/30">
                <span className="text-white/60">Average Latency</span>
                <span className="font-mono text-white/90">~{projects[0].pilotMetrics.averageLatencyMs}ms</span>
              </div>
            </div>

            <button
              onClick={() => openContextResolver()}
              className="w-full py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Inspect Scoped Context Package</span>
            </button>
          </div>

          {/* Quick Copilot Prompts */}
          <div className="rounded-2xl bg-[#141822] border border-white/10 p-5 shadow-card">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Narrative Intelligence Copilot</h3>
                <p className="text-[11px] text-white/50">Grounded in Story Brain memory</p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              {copilotQuickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCopilotOpen(true);
                    sendCopilotMessage(prompt);
                  }}
                  className="w-full text-left text-xs text-white/70 hover:text-white bg-[#1a1f2b] hover:bg-white/5 border border-white/5 hover:border-amber-500/30 px-3 py-2 rounded-xl flex items-center justify-between group transition-all"
                >
                  <span>{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/30 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
