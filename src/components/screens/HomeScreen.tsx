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
  Flame
} from 'lucide-react';
import { useProject, PIPELINE_STEPS } from '../../context/ProjectContext';

export const HomeScreen: React.FC = () => {
  const { 
    projects, 
    openProject, 
    duplicateProject, 
    setActiveScreen, 
    setCopilotOpen, 
    sendCopilotMessage 
  } = useProject();

  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  const copilotQuickPrompts = [
    'Develop a new idea',
    'Research a concept',
    'Suggest story directions',
    'Create a treatment outline',
    'Analyze my script',
    'Help with production planning'
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#2d3545] shadow-2xl bg-gradient-to-r from-[#10131a] via-[#161a24] to-[#121620]">
        {/* Background Atmosphere Image */}
        <div 
          className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-transparent to-transparent pointer-events-none" />

        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f25b2a]/15 text-[#f25b2a] text-xs font-bold uppercase tracking-wider border border-[#f25b2a]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Welcome to tattvaCo</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight font-display leading-tight">
              Turn ideas into <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f25b2a] to-amber-400">impactful stories.</span>
            </h1>
            <p className="text-[#a0aec0] text-sm md:text-base leading-relaxed">
              Your AI-native film development & production operating system. Explore, structure, write, QA, and plan production in one connected intelligence loop.
            </p>

            {/* Feature badges */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1a202c]/80 text-xs text-[#cad5e2] border border-[#2b3548]">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Smarter Development
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1a202c]/80 text-xs text-[#cad5e2] border border-[#2b3548]">
                <Users className="w-3 h-3 text-blue-400" />
                Seamless Collaboration
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1a202c]/80 text-xs text-[#cad5e2] border border-[#2b3548]">
                <Layers className="w-3 h-3 text-emerald-400" />
                Connected Intelligence
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1a202c]/80 text-xs text-[#cad5e2] border border-[#2b3548]">
                <Flame className="w-3 h-3 text-[#f25b2a]" />
                From Idea to Impact
              </span>
            </div>
          </div>

          <div className="hidden lg:block text-right pr-4">
            <p className="font-script text-3xl text-amber-300 -rotate-3 select-none">
              Stories for a<br />Brighter Tomorrow
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects & Side Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Your Projects & Development Journey */}
        <div className="lg:col-span-2 space-y-8">
          {/* Projects Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Your Projects</h2>
              <p className="text-xs text-[#7f8e9f]">Active film development workspaces</p>
            </div>
            <button 
              onClick={() => setActiveScreen('create-project')}
              className="text-xs font-semibold text-[#f25b2a] hover:text-[#ff8c42] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="group relative rounded-2xl bg-[#141822] border border-[#242b3a] hover:border-[#3a465e] overflow-hidden flex flex-col shadow-card hover:shadow-glow-subtle transition-all duration-300"
              >
                {/* Poster Banner */}
                <div className="relative h-44 overflow-hidden bg-slate-900 cursor-pointer" onClick={() => openProject(proj.id, 'intake')}>
                  <img
                    src={proj.posterUrl}
                    alt={proj.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-[#141822]/40 to-transparent" />

                  {/* Stage Pill */}
                  <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border shadow-sm ${
                    proj.stage === 'In Development' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : proj.stage === 'Research' 
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {proj.stage}
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
                    <div className="absolute top-11 right-3 w-36 bg-[#1a202d] border border-[#303a4e] rounded-xl shadow-xl p-1.5 z-20 text-xs">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openProject(proj.id, 'intake');
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-white hover:bg-[#252e40] rounded-lg"
                      >
                        Open Project
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateProject(proj.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 text-[#cad5e2] hover:bg-[#252e40] rounded-lg"
                      >
                        Duplicate
                      </button>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 
                      onClick={() => openProject(proj.id, 'intake')}
                      className="text-base font-bold text-white group-hover:text-[#f25b2a] cursor-pointer transition-colors"
                    >
                      {proj.title}
                    </h3>
                    <p className="text-[11px] text-[#7d8c9e] mt-0.5">
                      {proj.contentType} • {proj.language}
                    </p>
                    <p className="text-xs text-[#a0aec0] mt-2 line-clamp-2 leading-relaxed">
                      {proj.intent.premise || proj.tagline}
                    </p>
                  </div>

                  {/* Progress & Team Footer */}
                  <div className="mt-4 pt-3 border-t border-[#1f2533] space-y-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#7d8c9e] font-medium">Pipeline Progress</span>
                      <span className="font-bold text-white">{proj.progressPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#222836] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#f25b2a] to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${proj.progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-[#6c7a8b]">
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
                        {proj.teamMembers.length > 3 && (
                          <div className="w-5 h-5 rounded-full bg-[#1e2533] border border-[#141822] flex items-center justify-center text-[8px] font-bold text-[#8a98ac]">
                            +{proj.teamMembers.length - 3}
                          </div>
                        )}
                      </div>
                      <span>{proj.lastUpdated}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Project Card */}
            <div
              onClick={() => setActiveScreen('create-project')}
              className="group cursor-pointer rounded-2xl border-2 border-dashed border-[#283142] hover:border-[#f25b2a] bg-[#12151d]/60 hover:bg-[#151924] p-6 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[280px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#1d2330] group-hover:bg-[#f25b2a] border border-[#313c4f] group-hover:border-[#f25b2a] flex items-center justify-center text-[#8e9cb0] group-hover:text-white shadow-sm transition-all group-hover:scale-110">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mt-4 group-hover:text-[#f25b2a] transition-colors">
                Create New Project
              </h3>
              <p className="text-xs text-[#758498] mt-1 max-w-[200px]">
                Start with an idea, concept, reference material or a draft script.
              </p>
            </div>
          </div>

          {/* Your Development Journey Visual Pipeline */}
          <div className="rounded-2xl bg-[#131620] border border-[#222836] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-white">Your Development Journey</h3>
                <p className="text-xs text-[#718094]">The end-to-end connected creative lifecycle</p>
              </div>
              <span className="text-[11px] font-medium text-[#f25b2a] bg-[#f25b2a]/10 px-2.5 py-1 rounded-full border border-[#f25b2a]/20">
                7 Canonical Stages
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
              {[
                { stage: 'Idea', subtitle: 'It starts here', step: 2, icon: '💡', active: true },
                { stage: 'Research', subtitle: 'Find the world', step: 3, icon: '🔍' },
                { stage: 'Story', subtitle: 'Shape the narrative', step: 4, icon: '📖' },
                { stage: 'Characters', subtitle: 'Bring them to life', step: 6, icon: '👥' },
                { stage: 'Script', subtitle: 'Write with purpose', step: 11, icon: '🎬' },
                { stage: 'Production', subtitle: 'Plan for reality', step: 15, icon: '📦' },
                { stage: 'Impact', subtitle: 'Share with the world', step: 16, icon: '🚀' },
              ].map((item, idx) => (
                <div
                  key={item.stage}
                  onClick={() => openProject(projects[0].id, PIPELINE_STEPS.find(s => s.step === item.step)?.id || 'intake')}
                  className="cursor-pointer group p-3 rounded-xl bg-[#171b25] hover:bg-[#202636] border border-[#262e3e] hover:border-[#38435a] transition-all flex flex-col items-center justify-between"
                >
                  <span className="text-xl mb-1 group-hover:scale-125 transition-transform">{item.icon}</span>
                  <p className="text-xs font-bold text-white group-hover:text-[#f25b2a] transition-colors">{item.stage}</p>
                  <p className="text-[10px] text-[#718094] mt-0.5">{item.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: tattvaCo Copilot Card & Activity Feed */}
        <div className="space-y-6">
          {/* tattvaCo Copilot Card */}
          <div className="rounded-2xl bg-[#141822] border border-[#242c3d] p-5 shadow-card">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#f25b2a] to-amber-500 flex items-center justify-center shadow-glow-orange">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">tattvaCo Copilot</h3>
                <p className="text-[11px] text-[#7c8b9f]">Your creative partner, always here.</p>
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
                  className="w-full text-left text-xs text-[#b0bdcf] hover:text-white bg-[#1a1f2b] hover:bg-[#222938] border border-[#262e3f] hover:border-[#3b475f] px-3 py-2 rounded-xl flex items-center justify-between group transition-all"
                >
                  <span>{prompt}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#6c7a8b] group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            {/* Quick Ask Input */}
            <div className="mt-4 pt-3 border-t border-[#202636]">
              <input
                type="text"
                placeholder="Or ask anything..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setCopilotOpen(true);
                    sendCopilotMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="w-full bg-[#181d28] border border-[#2a3344] rounded-xl px-3 py-2 text-xs text-white placeholder-[#68768a] focus:outline-none focus:border-[#f25b2a] transition-all"
              />
            </div>
          </div>

          {/* Today Recent Activity */}
          <div className="rounded-2xl bg-[#141822] border border-[#242c3d] p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Today's Activity</h3>
              <span className="text-[10px] text-[#718094] hover:text-white cursor-pointer">View All →</span>
            </div>

            <div className="space-y-3.5">
              {[
                { title: 'Research completed', sub: 'UPSC ecosystem research', time: '10:24 AM', icon: '📋' },
                { title: 'New comment', sub: 'Mehta commented on Scene 14', time: '09:12 AM', icon: '💬' },
                { title: 'Script updated', sub: 'Scene 12 revised (v3)', time: 'Yesterday', icon: '📝' },
                { title: 'Visual references added', sub: '12 moodboards generated', time: 'Yesterday', icon: '🎨' },
              ].map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-xs">
                  <span className="text-base mt-0.5">{act.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white">{act.title}</p>
                    <p className="text-[11px] text-[#7c8b9f]">{act.sub}</p>
                  </div>
                  <span className="text-[10px] text-[#637182] flex-shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
