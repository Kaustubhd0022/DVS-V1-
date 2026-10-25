import React, { useState } from 'react';
import {
  Home,
  Brain,
  Sparkles,
  BookOpen,
  Users,
  ShieldAlert,
  Award,
  Package,
  Layers,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useProject, ScreenId } from '../../context/ProjectContext';
import { isOptionalStep } from '../../services/projectProgress';

export const Sidebar: React.FC = () => {
  const { activeScreen, setActiveScreen, setCopilotOpen } = useProject();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tattva_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('tattva_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Nav mirrors the 16-step pipeline in ProjectSubheader, grouped by the writer's job.
  const navGroups: { title: string; items: { id: ScreenId; label: string; icon: React.ReactNode }[] }[] = [
    {
      title: 'Start',
      items: [
        { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
        { id: 'discovery', label: 'Discovery', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
        { id: 'story-brain', label: 'Story Brain', icon: <Brain className="w-4 h-4 text-amber-400" /> },
        { id: 'intake', label: 'Intake', icon: <Layers className="w-4 h-4" /> },
        { id: 'research', label: 'Research', icon: <BookOpen className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Develop',
      items: [
        { id: 'story-exploration', label: 'Directions', icon: <FileText className="w-4 h-4" /> },
        { id: 'format-template', label: 'Format', icon: <Layers className="w-4 h-4" /> },
        { id: 'characters', label: 'Characters', icon: <Users className="w-4 h-4" /> },
        { id: 'world', label: 'World', icon: <Layers className="w-4 h-4" /> },
        { id: 'structure', label: 'Structure', icon: <Layers className="w-4 h-4" /> },
        { id: 'treatment', label: 'Treatment', icon: <FileText className="w-4 h-4" /> },
        { id: 'scene-outline', label: 'Scenes', icon: <FileText className="w-4 h-4" /> },
        { id: 'screenplay', label: 'Screenplay', icon: <FileText className="w-4 h-4" /> },
        { id: 'dialogue', label: 'Dialogue', icon: <FileText className="w-4 h-4" /> }
      ]
    },
    {
      title: 'Check & deliver',
      items: [
        { id: 'continuity', label: 'Continuity', icon: <ShieldAlert className="w-4 h-4 text-rose-400" /> },
        { id: 'evaluation', label: 'Evaluation', icon: <Award className="w-4 h-4 text-emerald-400" /> },
        { id: 'package', label: 'Package', icon: <Package className="w-4 h-4" /> }
      ]
    }
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-[72px]' : 'w-64'
      } bg-[#0d0f14] border-r border-[#222834] flex flex-col justify-between flex-shrink-0 min-h-screen select-none z-30 transition-[width] duration-300 ease-in-out relative`}
    >
      {/* Top branding & controls */}
      <div className={`${isCollapsed ? 'p-3' : 'p-5'}`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3 mb-6">
            {/* Collapsed Monogram */}
            <button
              onClick={() => setActiveScreen('home')}
              title="Tattava Copilot • Home"
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 text-sm shadow-md hover:scale-105 transition-transform"
            >
              T
            </button>
            {/* Expand button */}
            <button
              onClick={toggleCollapse}
              title="Expand Sidebar"
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        ) : (
          <div className="flex items-start justify-between mb-6">
            <div
              onClick={() => setActiveScreen('home')}
              className="cursor-pointer group px-0.5 transition-transform"
            >
              <div className="flex flex-col">
                <img
                  src="/tattvaCo-logo.png"
                  alt="Tattava Copilot"
                  className="h-8 w-auto max-w-[165px] object-contain object-left brightness-110 group-hover:brightness-125 transition-all drop-shadow-[0_2px_12px_rgba(164,75,50,0.25)]"
                />
                <span className="block text-[9px] uppercase font-bold tracking-[0.25em] text-amber-500/80 mt-1 pl-0.5">
                  V1 Pilot
                </span>
              </div>
            </div>

            {/* Collapse button */}
            <button
              onClick={toggleCollapse}
              title="Collapse Sidebar"
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors mt-0.5"
            >
              <ChevronLeft className="w-4 h-4 text-white/60 hover:text-amber-400" />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav className="space-y-4">
          {navGroups.map(group => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-white/30 px-3 py-1 block">
                  {group.title}
                </span>
              )}

              {group.items.map((item) => {
                const isSelected = item.id === activeScreen || (item.id === 'continuity' && activeScreen === 'qa');

                if (isCollapsed) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveScreen(item.id)}
                      title={item.label}
                      className={`w-full flex items-center justify-center p-2.5 rounded-xl transition-all relative group ${
                        isSelected
                          ? 'bg-[#1e2330] text-amber-400 shadow-sm border border-amber-500/40'
                          : 'text-[#8b96a8] hover:text-white hover:bg-[#151922]'
                      }`}
                    >
                      <span className={isSelected ? 'text-amber-400' : 'text-[#8b96a8] group-hover:text-white'}>
                        {item.icon}
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveScreen(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#1e2330] text-amber-400 shadow-sm border border-amber-500/40'
                        : 'text-[#8b96a8] hover:text-white hover:bg-[#151922]'
                    }`}
                  >
                    <span className={isSelected ? 'text-amber-400' : 'text-[#8b96a8]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {isOptionalStep(item.id) && <span className="ml-auto text-[9px] font-normal text-white/30">optional</span>}
                  </button>
                );
              })}
            </div>
          ))}

          <div className="pt-3 border-t border-white/5 space-y-1">
            <button
              onClick={() => setCopilotOpen(true)}
              title="Copilot"
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2'} rounded-xl text-xs font-semibold text-amber-300 hover:text-white hover:bg-amber-500/10 transition-all border border-amber-500/20`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {!isCollapsed && <span>Copilot</span>}
              </div>
            </button>
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className={`${isCollapsed ? 'p-2.5 text-center' : 'p-4'} border-t border-[#202532] bg-[#0b0d11]/80`}>
        {isCollapsed ? (
          <div
            title="Tattava Copilot • V1 Pilot Release"
            className="w-9 h-9 mx-auto rounded-lg bg-[#252c3c] border border-[#374158] flex items-center justify-center text-[10px] font-bold text-white shadow-sm cursor-pointer"
          >
            DV
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#252c3c] border border-[#374158] flex items-center justify-center text-[10px] font-bold text-white">
              DV
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">Tattava Copilot</p>
              <p className="text-[9px] text-amber-400/80 truncate">V1 Pilot Release</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
