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
      } bg-[#1b1411] border-r border-white/[0.08] flex flex-col justify-between flex-shrink-0 min-h-screen select-none z-30 transition-[width] duration-300 ease-in-out relative`}
    >
      {/* Top branding & controls */}
      <div className={`${isCollapsed ? 'p-3' : 'p-5'}`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3 mb-6">
            {/* Collapsed Monogram */}
            <button
              onClick={() => setActiveScreen('home')}
              title="TattvaCo • Home"
              className="w-10 h-10 rounded-2xl bg-[#33cc7a]/15 border border-[#33cc7a]/40 flex items-center justify-center font-bold text-[#33cc7a] text-sm shadow-md hover:scale-105 transition-transform"
            >
              T
            </button>
            {/* Expand button */}
            <button
              onClick={toggleCollapse}
              title="Expand Sidebar"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[#33cc7a]" />
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
                  alt="TattvaCo"
                  className="h-8 w-auto max-w-[165px] object-contain object-left transition-all"
                  onError={(e) => {
                    e.currentTarget.src = "https://raw.githubusercontent.com/Kaustubhd0022/DVS-V1-/main/tattvaCo-logo.png";
                  }}
                />
                <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-[0.25em] text-[#33cc7a] mt-1 pl-0.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#33cc7a] shadow-[0_0_6px_rgba(51,204,122,0.8)]" />
                  Film Development OS
                </span>
              </div>
            </div>

            {/* Collapse button */}
            <button
              onClick={toggleCollapse}
              title="Collapse Sidebar"
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors mt-0.5"
            >
              <ChevronLeft className="w-4 h-4 text-white/60 hover:text-[#33cc7a]" />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav className="space-y-4">
          {navGroups.map(group => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <span className="text-[10px] uppercase font-bold tracking-[0.14em] text-stone-400/70 px-3 py-1 block font-mono">
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
                      className={`w-full flex items-center justify-center p-2.5 rounded-full transition-all relative group ${
                        isSelected
                          ? 'bg-[#33cc7a]/20 text-[#33cc7a] shadow-[0_2px_10px_rgba(51,204,122,0.25)] border border-[#33cc7a]/40'
                          : 'text-stone-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className={isSelected ? 'text-[#33cc7a]' : 'text-stone-400 group-hover:text-white'}>
                        {item.icon}
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveScreen(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#33cc7a]/20 text-[#33cc7a] shadow-[0_2px_12px_rgba(51,204,122,0.2)] border border-[#33cc7a]/40'
                        : 'text-stone-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className={isSelected ? 'text-[#33cc7a]' : 'text-stone-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {isOptionalStep(item.id) && (
                      <span className="ml-auto text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-white/5 text-stone-400 border border-white/5">
                        opt
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          <div className="pt-3 border-t border-white/[0.08] space-y-1">
            <button
              onClick={() => setCopilotOpen(true)}
              title="Copilot"
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3.5 py-2'
              } rounded-full text-xs font-semibold text-amber-300 hover:text-white hover:bg-amber-500/15 transition-all border border-amber-500/30 shadow-[0_2px_8px_rgba(245,158,11,0.1)]`}
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                {!isCollapsed && <span>Tattava Copilot</span>}
              </div>
              {!isCollapsed && (
                <span className="linea-btn-wave" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* Footer */}
      <div className={`${isCollapsed ? 'p-2.5 text-center' : 'p-4'} border-t border-white/[0.08] bg-[#080a0f]/80 backdrop-blur-md`}>
        {isCollapsed ? (
          <div
            title="Tattava Copilot • V1 Pilot Release"
            className="w-9 h-9 mx-auto rounded-full bg-[#181d2a] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-sm cursor-pointer"
          >
            DV
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#181d2a] border border-white/10 flex items-center justify-center text-[10px] font-bold text-amber-300 shadow-sm">
              DV
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-[#fbf8f3] truncate">Tattava Copilot</p>
              <p className="text-[10px] text-amber-400/80 font-mono truncate">v1.2 Epistemic Pilot</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
