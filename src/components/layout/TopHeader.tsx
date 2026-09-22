import React, { useState } from 'react';
import { Search, Plus, Bell, ChevronDown, Sparkles } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const TopHeader: React.FC = () => {
  const { setActiveScreen, toggleCopilot, isCopilotOpen } = useProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      toggleCopilot();
    }
  };

  return (
    <header className="h-16 border-b border-[#222834] bg-[#0f1217]/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#758296] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search projects, characters, scenes, or ask Tattava..."
            className="w-full bg-[#171b24] border border-[#272e3d] rounded-xl pl-10 pr-4 py-2 text-sm text-[#f1f3f7] placeholder-[#6b788e] focus:outline-none focus:border-[#f25b2a] focus:ring-1 focus:ring-[#f25b2a] transition-all"
          />
          <kbd className="hidden sm:inline-block absolute right-3 text-[10px] text-[#6b788e] bg-[#222836] px-1.5 py-0.5 rounded border border-[#2e3648]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 ml-4">
        {/* + New Project Button */}
        <button
          onClick={() => setActiveScreen('create-project')}
          className="flex items-center gap-2 bg-[#1f2533] hover:bg-[#283042] text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#323d54] shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 text-[#f25b2a]" />
          <span>New Project</span>
        </button>

        {/* Contextual AI Copilot Toggle */}
        <button
          onClick={toggleCopilot}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
            isCopilotOpen
              ? 'bg-[#f25b2a]/15 text-[#f25b2a] border-[#f25b2a]/40 shadow-glow-orange'
              : 'bg-[#171b24] text-[#8b96a8] hover:text-white border-[#272e3d]'
          }`}
          title="Toggle Contextual AI Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Copilot</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl bg-[#171b24] hover:bg-[#222836] border border-[#272e3d] text-[#8b96a8] hover:text-white transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f25b2a]" />
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-xl hover:bg-[#181c26] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              KD
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-[#f1f3f7] leading-tight">Kaustubh Deshmukh</p>
              <p className="text-[10px] text-[#7d8b9f]">AI Product Manager</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7d8b9f]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#161a22] border border-[#2a3243] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[#252c3c]">
                <p className="text-xs font-bold text-white">Kaustubh Deshmukh</p>
                <p className="text-[11px] text-[#8b96a8]">kaustubh@donvanzara.film</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => { setActiveScreen('home'); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#cad3e0] hover:bg-[#212735] rounded-lg"
                >
                  Workspace Dashboard
                </button>
                <button 
                  onClick={() => { setActiveScreen('package'); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#cad3e0] hover:bg-[#212735] rounded-lg"
                >
                  Project Governance & Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
