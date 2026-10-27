import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ArrowRight,
  User,
  Edit2,
  Check,
  LogOut
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';

export const TopHeader: React.FC = () => {
  const { 
    projects, 
    currentProject, 
    openProject, 
    setActiveScreen, 
    toggleCopilot, 
    isCopilotOpen 
  } = useProject();

  const { user, email, signOut } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic user profile state derived from session or auth
  const [userName, setUserName] = useState<string>(() => {
    try {
      const raw = localStorage.getItem('tattava_master_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.name) return parsed.name;
      }
    } catch {}
    return user?.name || 'Creator';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    try {
      const raw = localStorage.getItem('tattava_master_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.email) return parsed.email;
      }
    } catch {}
    return user?.email || email || 'creator@tattvaco.film';
  });

  const [editNameInput, setEditNameInput] = useState(userName);
  const [editEmailInput, setEditEmailInput] = useState(userEmail);

  // Synchronize when custom session events fire
  useEffect(() => {
    const handleSessionUpdate = () => {
      try {
        const raw = localStorage.getItem('tattava_master_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.name) {
            setUserName(parsed.name);
            setEditNameInput(parsed.name);
          }
          if (parsed.email) {
            setUserEmail(parsed.email);
            setEditEmailInput(parsed.email);
          }
        }
      } catch {}
    };

    window.addEventListener('tattava_user_session_updated', handleSessionUpdate);
    return () => window.removeEventListener('tattava_user_session_updated', handleSessionUpdate);
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = editNameInput.trim() || 'Creator';
    const finalEmail = editEmailInput.trim() || 'creator@tattvaco.film';
    setUserName(finalName);
    setUserEmail(finalEmail);
    try {
      const existing = localStorage.getItem('tattava_master_session');
      const parsed = existing ? JSON.parse(existing) : {};
      localStorage.setItem('tattava_master_session', JSON.stringify({
        ...parsed,
        name: finalName,
        email: finalEmail,
        updatedAt: new Date().toISOString()
      }));
    } catch {}
    setIsEditingProfile(false);
  };

  const initials = useMemo(() => {
    const words = (userName || 'Creator').trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return (userName || 'TC').slice(0, 2).toUpperCase();
  }, [userName]);

  const firstName = useMemo(() => {
    return (userName || 'Creator').trim().split(/\s+/)[0] || 'Creator';
  }, [userName]);

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
  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    
    const results: Array<{
      type: 'project' | 'screen' | 'character' | 'canon';
      title: string;
      subtitle: string;
      action: () => void;
    }> = [];

    // Search Projects
    projects.forEach(p => {
      if (p.title.toLowerCase().includes(query) || p.genre.toLowerCase().includes(query)) {
        results.push({
          type: 'project',
          title: p.title,
          subtitle: `${p.contentType} • ${p.genre}`,
          action: () => {
            openProject(p.id);
            setIsSearchOpen(false);
            setSearchQuery('');
          }
        });
      }
    });

    // Search Characters
    currentProject.characters.forEach(c => {
      if (c.name.toLowerCase().includes(query) || c.role.toLowerCase().includes(query)) {
        results.push({
          type: 'character',
          title: c.name,
          subtitle: `${c.role} in ${currentProject.title}`,
          action: () => {
            setActiveScreen('characters');
            setIsSearchOpen(false);
            setSearchQuery('');
          }
        });
      }
    });

    // Search Core Screens
    const screens = [
      { id: 'discovery', title: 'Discovery Studio', subtitle: 'Explore initial narrative idea and seed' },
      { id: 'intake', title: 'Premise Intake', subtitle: 'Process logline, tone, and ambiguity' },
      { id: 'story-brain', title: 'Story Brain', subtitle: 'Global project memory, canon, and decisions' },
      { id: 'research', title: 'Research & Evidence', subtitle: 'Traceable historical sources and questions' },
      { id: 'story-exploration', title: 'Story Directions', subtitle: 'Divergent narrative paths and forks' },
      { id: 'format-template', title: 'Format & Model', subtitle: 'Structure template and episode distribution' },
      { id: 'structure', title: 'Beat Sheet & Structure', subtitle: 'Quadrant act pacing and turning points' },
      { id: 'treatment', title: 'Narrative Treatment', subtitle: 'Prose development of the story spine' },
      { id: 'scene-outline', title: 'Scene Outline', subtitle: 'Step-by-step scene architecture' },
      { id: 'screenplay', title: 'Screenplay Drafting', subtitle: 'Full cinematic script development' },
      { id: 'dialogue', title: 'Dialogue & Subtext', subtitle: 'Character linguistic profile and polish' },
      { id: 'continuity', title: 'Canon & Continuity', subtitle: 'Automated fact contradiction checks' },
      { id: 'evaluation', title: 'AI Story Evaluation', subtitle: 'Industry benchmark scoring and metrics' },
      { id: 'package', title: 'Story Package & Greenlight', subtitle: 'Executive export dossier' },
    ];

    screens.forEach(s => {
      if (s.title.toLowerCase().includes(query) || s.subtitle.toLowerCase().includes(query)) {
        results.push({
          type: 'screen',
          title: s.title,
          subtitle: s.subtitle,
          action: () => {
            setActiveScreen(s.id as any);
            setIsSearchOpen(false);
            setSearchQuery('');
          }
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery, projects, currentProject, openProject, setActiveScreen]);

  return (
    <header className="h-16 bg-[#1b1411]/95 border-b border-white/[0.08] px-6 flex items-center justify-between sticky top-0 z-30 select-none backdrop-blur-xl">
      {/* Left: Global Search Command Palette (Linea Pill) */}
      <div className="flex items-center gap-4 flex-1 max-w-xl" ref={searchContainerRef}>
        <div className="relative w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 pointer-events-none" />
            <input 
              ref={searchInputRef}
              type="text" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Search canon, scenes, characters, or jump to screen... (⌘K)"
              className="w-full bg-[#141824]/80 border border-white/10 rounded-full pl-10 pr-12 py-1.5 text-xs text-[#faf5f0] placeholder-stone-500 focus:outline-none focus:border-[#33cc7a] focus:ring-1 focus:ring-[#33cc7a]/40 transition-all shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-9 text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-mono text-stone-400 bg-white/5 border border-white/10 rounded">⌘K</kbd>
          </div>

          {/* Search Dropdown / Palette */}
          {isSearchOpen && (searchQuery.trim().length > 0 || searchResults.length > 0) && (
            <div className="absolute top-11 left-0 w-full bg-[#141824]/98 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95">
              <div className="p-2 border-b border-white/[0.06] flex items-center justify-between text-[11px] text-stone-400 font-mono px-3">
                <span>Quick Navigator</span>
                <span>{searchResults.length} matches</span>
              </div>

              <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-500">
                    No matching canon, characters, or screens found.
                  </div>
                ) : (
                  searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full text-left p-2 rounded-xl hover:bg-white/10 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-stone-400 group-hover:text-amber-400">
                          {item.type === 'project' && <Film className="w-3.5 h-3.5" />}
                          {item.type === 'character' && <Users className="w-3.5 h-3.5" />}
                          {item.type === 'screen' && <FileText className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#faf5f0] group-hover:text-white">{item.title}</p>
                          <p className="text-[10px] text-stone-400">{item.subtitle}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-600 group-hover:text-amber-400 transform group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Create Project Button (Linea Pill) */}
        <button 
          onClick={() => setActiveScreen('discovery')}
          className="linea-pill-btn linea-pill-primary px-3.5 py-1.5 text-xs font-bold gap-1.5 shadow-md shadow-amber-500/15"
        >
          <Plus className="w-3.5 h-3.5 text-black stroke-[3]" />
          <span>New Project</span>
          <span className="linea-btn-wave" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        {/* Notifications Pill */}
        <button className="relative w-9 h-9 rounded-full bg-[#2e241f] hover:bg-[#382b25] border border-white/10 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer">
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
              {initials}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-[#faf5f0] leading-tight truncate max-w-[120px]">{firstName}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-[#141824]/98 border border-white/10 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 space-y-2">
              {!isEditingProfile ? (
                <>
                  <div className="px-2 py-2 border-b border-white/10 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{userName}</p>
                      <p className="text-[11px] text-stone-400 truncate">{userEmail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="p-1 rounded-lg text-stone-400 hover:text-[#33cc7a] hover:bg-white/5 transition cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="py-1 space-y-0.5">
                    <button 
                      onClick={() => { setActiveScreen('home'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    >
                      Workspace Dashboard
                    </button>
                    <button 
                      onClick={() => { setActiveScreen('package'); setShowUserMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                    >
                      Project Governance & Settings
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('tattava_master_session');
                        signOut();
                        window.dispatchEvent(new Event('tattava_user_session_updated'));
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-2 p-1">
                  <div className="flex items-center justify-between pb-1 border-b border-white/10">
                    <span className="text-[10px] font-mono uppercase font-bold text-[#33cc7a]">Edit Profile</span>
                    <button 
                      type="button" 
                      onClick={() => setIsEditingProfile(false)}
                      className="text-stone-400 hover:text-white text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-stone-400 block mb-0.5">Full Name</label>
                    <input
                      type="text"
                      value={editNameInput}
                      onChange={(e) => setEditNameInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-black/50 border border-white/15 text-white outline-none focus:border-[#33cc7a]"
                      placeholder="Your Name"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-stone-400 block mb-0.5">Email</label>
                    <input
                      type="email"
                      value={editEmailInput}
                      onChange={(e) => setEditEmailInput(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-black/50 border border-white/15 text-white outline-none focus:border-[#33cc7a]"
                      placeholder="Your Email"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-2.5 py-1 rounded-lg text-xs text-stone-400 hover:text-white hover:bg-white/5 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-[#33cc7a] text-[#1b1411] hover:bg-[#2eb76e] flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      <span>Save</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
