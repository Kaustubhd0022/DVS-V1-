import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  ChevronDown, 
  Sparkles, 
  Users, 
  Shield, 
  FileText, 
  Film, 
  X,
  ArrowRight
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const TopHeader: React.FC = () => {
  const { 
    projects, 
    currentProject, 
    openProject, 
    setActiveScreen, 
    toggleCopilot, 
    isCopilotOpen 
  } = useProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: ⌘K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search results calculation
  const query = searchQuery.trim().toLowerCase();
  
  const matchedCharacters = query 
    ? (currentProject.characters || []).filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.role.toLowerCase().includes(query) ||
        (c.want && c.want.toLowerCase().includes(query))
      )
    : [];

  const matchedCanonFacts = query
    ? (currentProject.storyBrain?.canonFacts || []).filter(f =>
        f.statement.toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query) ||
        f.tags.some(t => t.toLowerCase().includes(query))
      )
    : [];

  const matchedScenes = query
    ? (currentProject.scenes || []).filter(s =>
        (s.slugline && s.slugline.toLowerCase().includes(query)) ||
        (s.subheading && s.subheading.toLowerCase().includes(query)) ||
        (s.summary && s.summary.toLowerCase().includes(query))
      )
    : [];

  const matchedProjects = query
    ? projects.filter(p =>
        p.id !== currentProject.id && (
          p.title.toLowerCase().includes(query) ||
          p.genre.toLowerCase().includes(query)
        )
      )
    : [];

  const totalResults = matchedCharacters.length + matchedCanonFacts.length + matchedScenes.length + matchedProjects.length;

  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#1b1411]/90 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Search bar & Dropdown */}
      <div ref={searchContainerRef} className="flex-1 max-w-xl relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            placeholder="Search characters, canon facts, scenes, or projects..."
            className="w-full bg-[#2e241f]/80 border border-white/10 rounded-full pl-11 pr-20 py-2 text-xs text-[#faf5f0] placeholder-stone-400 focus:outline-none focus:border-[#33cc7a] focus:ring-1 focus:ring-[#33cc7a]/50 shadow-inner transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="absolute right-12 text-stone-400 hover:text-white p-1"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block absolute right-3.5 text-[10px] text-stone-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/10 font-mono">
            ⌘K
          </kbd>
        </div>

        {/* Global Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="absolute top-12 left-0 w-full bg-[#1b1411]/95 border border-white/10 rounded-3xl shadow-2xl p-4 z-50 max-h-[460px] overflow-y-auto space-y-3 backdrop-blur-2xl animate-in fade-in zoom-in-95">
            {totalResults === 0 ? (
              <div className="p-6 text-center space-y-2">
                <Search className="w-6 h-6 text-stone-500 mx-auto" />
                <p className="text-sm font-semibold text-white">No story elements found</p>
                <p className="text-xs text-stone-400">
                  No characters, canon facts, or scenes matched <span className="text-amber-400">"{searchQuery}"</span>.
                </p>
              </div>
            ) : (
              <>
                {/* Matched Characters */}
                {matchedCharacters.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-2 py-1 flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-cyan-400" />
                      Characters ({matchedCharacters.length})
                    </span>
                    <div className="space-y-1 mt-1">
                      {matchedCharacters.slice(0, 3).map(c => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setActiveScreen('characters');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-2xl bg-white/5 hover:bg-amber-500/15 hover:border-amber-500/30 border border-transparent flex items-center justify-between text-xs transition-colors group"
                        >
                          <div>
                            <span className="font-bold text-white group-hover:text-amber-300">{c.name}</span>
                            <span className="text-stone-400 ml-2">({c.role}, Age {c.age})</span>
                          </div>
                          <span className="text-[10px] text-stone-400 group-hover:text-amber-400 flex items-center gap-1">
                            View Arc <ArrowRight className="w-3 h-3" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Canon Facts */}
                {matchedCanonFacts.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-2 py-1 flex items-center gap-1.5">
                      <Shield className="w-3 h-3 text-amber-400" />
                      Story Brain Canon Facts ({matchedCanonFacts.length})
                    </span>
                    <div className="space-y-1 mt-1">
                      {matchedCanonFacts.slice(0, 3).map(f => (
                        <button
                          key={f.id}
                          onClick={() => {
                            setActiveScreen('story-brain');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-2xl bg-white/5 hover:bg-amber-500/15 hover:border-amber-500/30 border border-transparent text-xs transition-colors group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {f.category}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono">{f.id}</span>
                          </div>
                          <p className="text-[#fbf8f3] group-hover:text-amber-200 line-clamp-1">{f.statement}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Scenes */}
                {matchedScenes.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-2 py-1 flex items-center gap-1.5">
                      <FileText className="w-3 h-3 text-emerald-400" />
                      Script Outline & Scenes ({matchedScenes.length})
                    </span>
                    <div className="space-y-1 mt-1">
                      {matchedScenes.slice(0, 3).map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setActiveScreen('scene-outline');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-2xl bg-white/5 hover:bg-emerald-500/15 hover:border-emerald-500/30 border border-transparent text-xs transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white group-hover:text-emerald-300">{s.slugline || s.subheading || `Scene ${s.sceneNumber}`}</span>
                            <span className="text-[10px] text-stone-400">Scene {s.sceneNumber}</span>
                          </div>
                          <p className="text-stone-400 line-clamp-1 text-[11px] mt-0.5">{s.summary}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Projects */}
                {matchedProjects.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-2 py-1 flex items-center gap-1.5">
                      <Film className="w-3 h-3 text-purple-400" />
                      Other Workspaces ({matchedProjects.length})
                    </span>
                    <div className="space-y-1 mt-1">
                      {matchedProjects.slice(0, 2).map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            openProject(p.id, 'story-brain');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-2xl bg-white/5 hover:bg-purple-500/15 hover:border-purple-500/30 border border-transparent flex items-center justify-between text-xs transition-colors group"
                        >
                          <span className="font-semibold text-white group-hover:text-purple-300">{p.title}</span>
                          <span className="text-[10px] text-purple-400 font-mono">Switch Workspace →</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 ml-4">
        {/* + New Project Button (Linea Pill) */}
        <button
          onClick={() => setActiveScreen('create-project')}
          className="linea-pill-btn linea-pill-secondary px-4 py-2 text-xs font-semibold gap-2 border border-white/10 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-[#33cc7a]" />
          <span>New Project</span>
        </button>

        {/* Contextual AI Copilot Toggle (Linea Pill with Equalizer Wave) */}
        <button
          onClick={toggleCopilot}
          className={`linea-pill-btn px-4 py-2 text-xs font-semibold gap-2 transition-all ${
            isCopilotOpen
              ? 'bg-[#33cc7a] text-[#1b1411] font-bold shadow-lg shadow-[#33cc7a]/30'
              : 'bg-white/5 border border-white/10 text-stone-300 hover:text-white'
          }`}
          title="Toggle Contextual AI Copilot"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isCopilotOpen ? 'text-[#1b1411]' : 'text-[#33cc7a]'}`} />
          <span className="hidden md:inline">Copilot</span>
          <span className="linea-btn-wave" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        {/* Notifications Pill */}
        <button className="relative w-9 h-9 rounded-full bg-[#2e241f] hover:bg-[#382b25] border border-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#33cc7a] shadow-[0_0_8px_rgba(51,204,122,0.8)]" />
        </button>

        {/* User profile pill */}
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[#2e241f] hover:bg-[#382b25] border border-white/10 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#33cc7a] to-[#24a35e] text-[#1b1411] flex items-center justify-center font-bold text-xs shadow-sm">
              KD
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-[#faf5f0] leading-tight">Kaustubh</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#141824]/95 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-xs font-bold text-white">Kaustubh Deshmukh</p>
                <p className="text-[11px] text-stone-400">kaustubh@donvanzara.film</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={() => { setActiveScreen('home'); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  Workspace Dashboard
                </button>
                <button 
                  onClick={() => { setActiveScreen('package'); setShowUserMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
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

