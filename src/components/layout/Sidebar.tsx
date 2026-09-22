import React from 'react';
import { 
  Home, 
  FolderKanban, 
  Sparkles, 
  LayoutTemplate, 
  BookOpen, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Flame
} from 'lucide-react';
import { useProject, ScreenId } from '../../context/ProjectContext';

export const Sidebar: React.FC = () => {
  const { activeScreen, setActiveScreen, setCopilotOpen } = useProject();

  const navItems: { id: ScreenId | 'copilot' | 'external'; label: string; icon: React.ReactNode; isAction?: boolean }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'create-project', label: 'Projects', icon: <FolderKanban className="w-5 h-5" /> },
    { id: 'copilot', label: 'AI Copilot', icon: <Sparkles className="w-5 h-5 text-amber-400" />, isAction: true },
    { id: 'format-template', label: 'Templates', icon: <LayoutTemplate className="w-5 h-5" /> },
    { id: 'research', label: 'Research Library', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'characters', label: 'Team', icon: <Users className="w-5 h-5" /> },
    { id: 'production', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
    { id: 'qa', label: 'Insights', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'package', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleNav = (item: typeof navItems[0]) => {
    if (item.isAction) {
      setCopilotOpen(true);
      return;
    }
    if (item.id === 'create-project') {
      setActiveScreen('intake');
      return;
    }
    if (item.id !== 'copilot' && item.id !== 'external') {
      setActiveScreen(item.id);
    }
  };

  const isHomeActive = activeScreen === 'home';
  const isProjectActive = activeScreen !== 'home';

  return (
    <aside className="w-64 bg-[#0d0f14] border-r border-[#222834] flex flex-col justify-between flex-shrink-0 min-h-screen select-none z-30">
      {/* Top branding */}
      <div className="p-6">
        <div 
          onClick={() => setActiveScreen('home')}
          className="cursor-pointer group flex items-center gap-3 mb-8"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#f25b2a] to-[#ff8c42] flex items-center justify-center shadow-glow-orange group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <span className="font-display font-bold text-2xl tracking-tight text-white group-hover:text-[#f25b2a] transition-colors">
              Tattava
            </span>
            <span className="block text-[10px] uppercase font-semibold tracking-widest text-[#8b96a8]">
              Ideas to Impact
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isSelected = 
              (item.id === 'home' && isHomeActive) ||
              (item.id === 'create-project' && isProjectActive) ||
              (item.id === activeScreen);

            return (
              <button
                key={item.label}
                onClick={() => handleNav(item)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-[#1e2330] text-white shadow-sm border border-[#2e3748]'
                    : 'text-[#8b96a8] hover:text-white hover:bg-[#151922]'
                }`}
              >
                <span className={isSelected ? 'text-[#f25b2a]' : 'text-[#8b96a8]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.id === 'copilot' && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Inspiration Quote & Company Profile */}
      <div className="p-5 border-t border-[#202532] bg-[#0b0d11]/80">
        <div className="mb-4 pl-1">
          <p className="font-script text-xl text-[#f39c12] italic leading-tight">
            “Better Stories Build a Brighter Tomorrow.”
          </p>
          <p className="text-xs text-[#6e7b8f] mt-1 font-medium">— Don Vanzara</p>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-[#1e2330]">
          <div className="w-8 h-8 rounded-lg bg-[#252c3c] border border-[#374158] flex items-center justify-center text-xs font-bold text-white">
            DV
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">Don Vanzara Showbiz</p>
            <p className="text-[10px] text-[#8b96a8] truncate">Stories for a Brighter Tomorrow</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
