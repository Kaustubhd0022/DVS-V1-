import React from 'react';
import { 
  Home, 
  Brain, 
  FolderKanban, 
  Sparkles, 
  LayoutTemplate, 
  BookOpen, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  ShieldAlert,
  Award,
  Package,
  Layers,
  FileText
} from 'lucide-react';
import { useProject, ScreenId } from '../../context/ProjectContext';

export const Sidebar: React.FC = () => {
  const { activeScreen, setActiveScreen, setCopilotOpen, openContextResolver } = useProject();

  const primaryNavItems: { id: ScreenId | 'copilot' | 'resolver'; label: string; icon: React.ReactNode; isAction?: boolean; badge?: string }[] = [
    { id: 'home', label: 'Home Dashboard', icon: <Home className="w-4 h-4" /> },
    { id: 'discovery', label: 'Discovery Studio', icon: <Sparkles className="w-4 h-4 text-amber-400" />, badge: 'Studio' },
    { id: 'story-brain', label: 'Story Brain', icon: <Brain className="w-4 h-4 text-amber-400" />, badge: 'Core' },
    { id: 'intake', label: 'Project Intake', icon: <Layers className="w-4 h-4" /> },
    { id: 'research', label: 'Traceable Research', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'story-exploration', label: 'Story Directions', icon: <FileText className="w-4 h-4" /> },
    { id: 'characters', label: 'Character Intelligence', icon: <Users className="w-4 h-4" /> },
    { id: 'continuity', label: 'Canon & Continuity', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
    { id: 'evaluation', label: 'AI Story Evaluation', icon: <Award className="w-4 h-4 text-emerald-400" />, badge: 'Harness' },
    { id: 'package', label: 'Development Package', icon: <Package className="w-4 h-4" /> }
  ];

  const handleNav = (item: typeof primaryNavItems[0]) => {
    if (item.isAction) {
      if (item.id === 'copilot') setCopilotOpen(true);
      if (item.id === 'resolver') openContextResolver();
      return;
    }
    if (item.id !== 'copilot' && item.id !== 'resolver') {
      setActiveScreen(item.id);
    }
  };

  const isHomeActive = activeScreen === 'home';

  return (
    <aside className="w-64 bg-[#0d0f14] border-r border-[#222834] flex flex-col justify-between flex-shrink-0 min-h-screen select-none z-30">
      {/* Top branding */}
      <div className="p-5">
        <div 
          onClick={() => setActiveScreen('home')}
          className="cursor-pointer group mb-6 px-0.5 transition-transform"
        >
          <div className="flex flex-col">
            <img 
              src="/tattvaCo-logo.png" 
              alt="Tattava Copilot" 
              className="h-8 w-auto max-w-[165px] object-contain object-left brightness-110 group-hover:brightness-125 transition-all drop-shadow-[0_2px_12px_rgba(164,75,50,0.25)]" 
            />
            <span className="block text-[9px] uppercase font-bold tracking-[0.25em] text-amber-500/80 mt-1 pl-0.5">
              V1 Pilot • Narrative Intelligence
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-white/30 px-3 py-1 block">
            V1 Golden Workflow
          </span>

          {primaryNavItems.map((item) => {
            const isSelected = item.id === activeScreen || (item.id === 'continuity' && activeScreen === 'qa');

            return (
              <button
                key={item.label}
                onClick={() => handleNav(item)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#1e2330] text-white shadow-sm border border-amber-500/40 text-amber-400'
                    : 'text-[#8b96a8] hover:text-white hover:bg-[#151922]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isSelected ? 'text-amber-400' : 'text-[#8b96a8]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    item.badge === 'Core'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/30 px-3 py-1 block">
              AI Tools & Governance
            </span>

            <button
              onClick={() => openContextResolver()}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white hover:bg-cyan-500/10 transition-all border border-cyan-500/20"
            >
              <div className="flex items-center gap-2.5">
                <Brain className="w-4 h-4 text-cyan-400" />
                <span>Context Resolver</span>
              </div>
              <span className="text-[9px] font-mono bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-200">
                Inspect
              </span>
            </button>

            <button
              onClick={() => setCopilotOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-white hover:bg-amber-500/10 transition-all border border-amber-500/20"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Narrative Copilot</span>
              </div>
              <span className="text-[9px] font-mono bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-200">
                120B
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom Inspiration Quote & Company Profile */}
      <div className="p-4 border-t border-[#202532] bg-[#0b0d11]/80">
        <div className="mb-3 pl-1">
          <p className="font-serif text-sm text-[#f39c12] italic leading-tight">
            “Better Stories Build a Brighter Tomorrow.”
          </p>
          <p className="text-[10px] text-[#6e7b8f] mt-0.5 font-medium">— Don Vanzara Showbiz LLP</p>
        </div>

        <div className="flex items-center gap-2.5 pt-2.5 border-t border-[#1e2330]">
          <div className="w-7 h-7 rounded-lg bg-[#252c3c] border border-[#374158] flex items-center justify-center text-[10px] font-bold text-white">
            DV
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">Tattava Copilot</p>
            <p className="text-[9px] text-amber-400/80 truncate">V1 Pilot Release</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
