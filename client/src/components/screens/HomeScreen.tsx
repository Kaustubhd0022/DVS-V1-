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
  X,
  AlertTriangle,
  Compass,
  Landmark,
  Scroll,
  Library
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { ResearchFoundryModal } from '../modals/ResearchFoundryModal';
import { synthesizeResearchFoundryUniverse } from '../../services/aiService';
import { ResearchFoundryResult } from '../../types/project';
import { extractTextFromFile } from '../../services/documentExtractor';

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
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; title: string } | null>(null);
  const [ideaInput, setIdeaInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Universal Launchpad State (Curiosity / Research / Premise)
  const [launchpadMode, setLaunchpadMode] = useState<'curiosity' | 'archive' | 'premise'>('curiosity');
  const [isFoundryOpen, setIsFoundryOpen] = useState(false);
  const [isFoundryLoading, setIsFoundryLoading] = useState(false);
  const [foundryData, setFoundryData] = useState<ResearchFoundryResult | null>(null);
  const [foundryTopicQuery, setFoundryTopicQuery] = useState('');

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

  const handleStartResearchFoundry = async (customTopic?: string) => {
    const topic = customTopic || ideaInput || (attachedFile ? attachedFile.name : '1946 Royal Indian Navy Mutiny');
    setFoundryTopicQuery(topic);
    setIsFoundryOpen(true);
    setIsFoundryLoading(true);
    try {
      const data = await synthesizeResearchFoundryUniverse(topic, 'History & Mythology', attachedFile?.content);
      setFoundryData(data);
    } catch (e) {
      console.error('Research foundry error:', e);
    } finally {
      setIsFoundryLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await extractTextFromFile(file);
      setAttachedFile({
        name: file.name,
        content: text || `[Uploaded file: ${file.name}]`
      });
    } catch (err) {
      console.error('File extraction error:', err);
    }
  };

  // Separate user projects from demo projects
  const userProjects = projects.filter(p => !p.isDemo);
  const demoProjects = projects.filter(p => p.isDemo);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn pb-16">
      {/* Hero Welcome Banner (Linea Bento Style) */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-r from-[#0d1017] via-[#141824] to-[#10141f]">
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-luminosity pointer-events-none"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1411] via-transparent to-transparent pointer-events-none" />

        <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#33cc7a]/15 text-[#33cc7a] text-xs font-bold uppercase tracking-wider border border-[#33cc7a]/30 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#33cc7a] animate-pulse shadow-[0_0_8px_rgba(51,204,122,0.8)]" />
              <span>Tattava Copilot • V1 Pilot</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#faf5f0] tracking-tight font-display leading-tight">
              Start with your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#33cc7a] via-[#4ade80] to-emerald-200">story idea.</span>
            </h1>
            <p className="text-[#b8aba3] text-sm md:text-base leading-relaxed">
              Describe a film, series or documentary in your own words. Tattava helps you develop it step by step, and only uses facts you have approved or sourced.
            </p>
          </div>
        </div>
      </div>

      {/* Flagship: Universal Entry Point & Narrative Foundry Launcher (Linea Bento) */}
      <div className="linea-bento p-6 md:p-8 space-y-6 relative overflow-hidden border-[#33cc7a]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#33cc7a] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Universal Creative Launchpad • Provenance-First</span>
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-serif text-[#faf5f0] tracking-tight">
              {launchpadMode === 'curiosity' && "Start from an Era, Figure, or Ancient Topic"}
              {launchpadMode === 'archive' && "Incubate from Historical Archives & Research Notes"}
              {launchpadMode === 'premise' && "Begin with a Ready Story Premise or Logline"}
            </h2>
            <p className="text-xs text-[#b8aba3]">
              {launchpadMode === 'curiosity' && "No need to invent a plot upfront. Select an era, mythological lore, or historical event to explore dramatic conflict seeds and primary chronologies."}
              {launchpadMode === 'archive' && "Upload field notes, thesis excerpts, gazetteers, or research transcripts to ground your project in verified provenance."}
              {launchpadMode === 'premise' && "Have a logline or project pitch ready? Tattava parses your creative impulse and identifies what requires worldbuilding."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openDemoProject}
              className="linea-pill-btn linea-pill-secondary px-4 py-2 text-xs font-semibold gap-2 border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#33cc7a]" />
              <span>Open Reference Demo</span>
            </button>
          </div>
        </div>

        {/* 3 Entry Mode Tabs (Linea Pill Caps) */}
        <div className="flex items-center gap-2 p-1.5 bg-[#15100e] rounded-full border border-white/10 w-full sm:w-fit overflow-x-auto shadow-inner">
          <button
            type="button"
            onClick={() => setLaunchpadMode('curiosity')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              launchpadMode === 'curiosity'
                ? 'bg-[#33cc7a] text-[#1b1411] shadow-lg shadow-[#33cc7a]/25'
                : 'text-[#b8aba3] hover:text-white hover:bg-white/5'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>1. Topic / Era Incubation</span>
          </button>

          <button
            type="button"
            onClick={() => setLaunchpadMode('archive')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              launchpadMode === 'archive'
                ? 'bg-[#33cc7a] text-[#1b1411] shadow-lg shadow-[#33cc7a]/25'
                : 'text-[#b8aba3] hover:text-white hover:bg-white/5'
            }`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>2. Archival Material & PDFs</span>
          </button>

          <button
            type="button"
            onClick={() => setLaunchpadMode('premise')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              launchpadMode === 'premise'
                ? 'bg-[#33cc7a] text-[#1b1411] shadow-lg shadow-[#33cc7a]/25'
                : 'text-[#b8aba3] hover:text-white hover:bg-white/5'
            }`}
          >
            <Clapperboard className="w-3.5 h-3.5" />
            <span>3. Direct Story Premise</span>
          </button>
        </div>

        {/* Input Bar & Actions */}
        <div className="space-y-3">
          {attachedFile && (
            <div className="flex items-center justify-between bg-[#111624] border border-cyan-500/40 rounded-2xl px-4 py-2.5 text-xs text-cyan-300">
              <div className="flex items-center gap-2 truncate">
                <Paperclip className="w-4 h-4 text-cyan-400" />
                <span className="truncate font-mono">Attached Research: {attachedFile.name}</span>
              </div>
              <button 
                onClick={() => setAttachedFile(null)} 
                className="w-6 h-6 rounded-full flex items-center justify-center hover:text-white hover:bg-white/10 transition-colors"
                title="Remove attached file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mode 1: Topic & Era Incubation */}
          {launchpadMode === 'curiosity' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#33cc7a]/70 pointer-events-none" />
                  <input 
                    type="text"
                    value={ideaInput}
                    onChange={(e) => setIdeaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleStartResearchFoundry();
                    }}
                    placeholder="Enter an idea, series concept, kingdom, or research question (e.g. 10-episode series on Maharashtra temples, Chola Navy, Lost Saraswati)..."
                    disabled={isFoundryLoading}
                    className="w-full bg-[#2e241f] border border-white/15 focus:border-[#33cc7a] rounded-full pl-11 pr-5 py-3 text-xs md:text-sm text-[#faf5f0] placeholder-[#b8aba3] focus:outline-none transition-all shadow-inner"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleStartResearchFoundry()}
                  disabled={isFoundryLoading || !ideaInput.trim()}
                  className="linea-pill-btn linea-pill-primary px-6 py-3 text-xs font-bold gap-2 shrink-0"
                >
                  <Compass className="w-4 h-4" />
                  <span>{isFoundryLoading ? 'Synthesizing Canon...' : 'Explore in Research Foundry'}</span>
                  <span className="linea-btn-wave" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              </div>

              {/* Curated Historical & Mythological Topic Sparks */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] text-[#33cc7a] uppercase font-mono tracking-wider font-semibold flex items-center gap-1.5">
                  <Library className="w-3 h-3" />
                  <span>Curated Domains & Narrative Seeds:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <button
                    onClick={() => handleStartResearchFoundry("1946 Royal Indian Navy Mutiny (The Forgotten Revolt)")}
                    className="p-3.5 rounded-2xl bg-[#2e241f] hover:bg-[#382c26] border border-white/10 hover:border-[#33cc7a]/40 text-left transition-all group cursor-pointer shadow-sm"
                  >
                    <div className="font-semibold text-white group-hover:text-[#33cc7a] text-xs">1946 Royal Indian Navy Mutiny</div>
                    <div className="text-[10px] text-[#b8aba3] line-clamp-1 mt-0.5">Ratings revolt in Bombay harbor that triggered British exit</div>
                  </button>

                  <button
                    onClick={() => handleStartResearchFoundry("Kurukshetra Day 14: Abhimanyu & The Chakravyuha")}
                    className="p-3.5 rounded-2xl bg-[#2e241f] hover:bg-[#382c26] border border-white/10 hover:border-[#33cc7a]/40 text-left transition-all group cursor-pointer shadow-sm"
                  >
                    <div className="font-semibold text-white group-hover:text-[#33cc7a] text-xs">Kurukshetra: The Chakravyuha</div>
                    <div className="text-[10px] text-[#b8aba3] line-clamp-1 mt-0.5">Military strategy, tragic sacrifice, ethical collapse of warfare</div>
                  </button>

                  <button
                    onClick={() => handleStartResearchFoundry("Shivaji's Sindhudurg: Origins of Maratha Naval Warfare")}
                    className="p-3.5 rounded-2xl bg-[#2e241f] hover:bg-[#382c26] border border-white/10 hover:border-[#33cc7a]/40 text-left transition-all group cursor-pointer shadow-sm"
                  >
                    <div className="font-semibold text-white group-hover:text-[#33cc7a] text-xs">Shivaji: Maratha Naval Hegemony</div>
                    <div className="text-[10px] text-[#b8aba3] line-clamp-1 mt-0.5">Sea fortress engineering against Siddis, Portuguese & English</div>
                  </button>

                  <button
                    onClick={() => handleStartResearchFoundry("Ahilyabai Holkar: The Philosopher Queen & Rebuilding of Kashi")}
                    className="p-3.5 rounded-2xl bg-[#2e241f] hover:bg-[#382c26] border border-white/10 hover:border-[#33cc7a]/40 text-left transition-all group cursor-pointer shadow-sm"
                  >
                    <div className="font-semibold text-white group-hover:text-[#33cc7a] text-xs">Ahilyabai Holkar of Malwa</div>
                    <div className="text-[10px] text-[#b8aba3] line-clamp-1 mt-0.5">Stateswoman who rebuilt sacred shrines and reformed justice</div>
                  </button>

                  <button
                    onClick={() => handleStartResearchFoundry("The Lost Saraswati River & Vedic Metallurgy")}
                    className="p-3.5 rounded-2xl bg-[#2e241f] hover:bg-[#382c26] border border-white/10 hover:border-[#33cc7a]/40 text-left transition-all group cursor-pointer shadow-sm"
                  >
                    <div className="font-semibold text-white group-hover:text-[#33cc7a] text-xs">The Lost Saraswati & Harappan Bronze</div>
                    <div className="text-[10px] text-[#b8aba3] line-clamp-1 mt-0.5">Archaeometallurgy and ancient climatic shifts in Northwestern India</div>
                  </button>

                  <button
                    onClick={() => handleStartResearchFoundry("Rajendra Chola's 1025 CE Maritime Expedition to Srivijaya")}
                    className="p-3.5 rounded-2xl bg-[#2e241f] hover:bg-[#382c26] border border-white/10 hover:border-[#33cc7a]/40 text-left transition-all group cursor-pointer shadow-sm"
                  >
                    <div className="font-semibold text-white group-hover:text-[#33cc7a] text-xs">Rajendra Chola: Expedition to Srivijaya</div>
                    <div className="text-[10px] text-[#b8aba3] line-clamp-1 mt-0.5">Trans-oceanic armada across Malacca Strait to Sumatra</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mode 2: Archival Material & Research Drop */}
          {launchpadMode === 'archive' && (
            <div className="space-y-3">
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.pdf,.docx,.doc,.md,.json"
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-amber-500/30 hover:border-amber-400 bg-[#121622]/80 hover:bg-amber-500/5 rounded-3xl p-6 text-center cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {attachedFile ? `Attached: ${attachedFile.name}` : 'Drop Archival Document, Thesis Chapter, or Field Notes'}
                  </p>
                  <p className="text-xs text-stone-400">
                    Supports PDF, DOCX, TXT, Markdown, or JSON research corpora.
                  </p>
                </div>
                {attachedFile && (
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono border border-emerald-500/40">
                    Ready for Ingestion
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input 
                  type="text"
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  placeholder="Optional: Specify focus angle or research question for this document..."
                  className="flex-1 bg-[#121622] border border-white/15 focus:border-amber-400 rounded-full px-5 py-3 text-xs md:text-sm text-[#fbf8f3] placeholder-stone-400 focus:outline-none transition-all shadow-inner"
                />

                <button
                  type="button"
                  onClick={() => handleStartResearchFoundry()}
                  disabled={isFoundryLoading || (!attachedFile && !ideaInput.trim())}
                  className="linea-pill-btn linea-pill-primary px-6 py-3 text-xs font-bold gap-2 shrink-0"
                >
                  <Scroll className="w-4 h-4" />
                  <span>{isFoundryLoading ? 'Extracting Provenance...' : 'Ingest to Research Foundry'}</span>
                  <span className="linea-btn-wave" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Mode 3: Direct Story Premise */}
          {launchpadMode === 'premise' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input 
                  type="text"
                  value={ideaInput}
                  onChange={(e) => setIdeaInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleStartIdea();
                  }}
                  placeholder='e.g. "A historical espionage thriller about an undercover Indian wireless operator in 1944 Berlin."'
                  disabled={isStarting}
                  className="flex-1 bg-[#121622] border border-white/15 focus:border-amber-400 rounded-full px-5 py-3 text-xs md:text-sm text-[#fbf8f3] placeholder-stone-400 focus:outline-none transition-all shadow-inner"
                />

                <button
                  type="button"
                  onClick={() => handleStartIdea()}
                  disabled={isStarting || (!ideaInput.trim() && !attachedFile)}
                  className="linea-pill-btn linea-pill-primary px-6 py-3 text-xs font-bold gap-2 shrink-0"
                >
                  <span>{isStarting ? 'Starting Studio...' : 'Start Developing'}</span>
                  <span className="linea-btn-wave" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              </div>

              {/* Quick Premise Prompts */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-[11px] text-stone-400 uppercase font-mono tracking-wider">Example Premises:</span>
                <button
                  onClick={() => handleStartIdea("I want to create a historical series called Rajyam about contested royal succession.")}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-amber-500/20 hover:border-amber-500/40 border border-white/10 text-stone-300 hover:text-amber-200 text-[11px] font-semibold transition-all text-left"
                >
                  "Rajyam: Contested royal succession series"
                </button>
                <button
                  onClick={() => handleStartIdea("A high-stakes political thriller set in 2035 New Delhi exploring artificial intelligence in nuclear defense.")}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-white/10 text-stone-300 hover:text-cyan-200 text-[11px] font-semibold transition-all text-left"
                >
                  "AI nuclear defense thriller in New Delhi 2035"
                </button>
                <button
                  onClick={() => handleStartIdea("An intimate courtroom drama set in Kerala following the disputed inheritance of a centuries-old spice plantation.")}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 border border-white/10 text-stone-300 hover:text-emerald-200 text-[11px] font-semibold transition-all text-left"
                >
                  "Spice plantation inheritance drama in Kerala"
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: FIRST-TIME USER EXPERIENCE (When no user projects exist) */}
      {projects.length === 0 && (
        <div className="rounded-3xl bg-[#2e241f]/95 border-2 border-[#33cc7a]/30 p-8 md:p-12 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#33cc7a]/10 border border-[#33cc7a]/30 flex items-center justify-center mx-auto text-[#33cc7a] shadow-lg shadow-[#33cc7a]/10">
            <Brain className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#33cc7a] font-bold">
              GETTING STARTED
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-white tracking-tight">
              Create Your First Project
            </h2>
            <p className="text-sm text-[#b8aba3] leading-relaxed">
              No project intelligence exists yet. Tattava builds its understanding exclusively from your input, premise, and uploaded material.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto pt-4 text-left">
            {/* Option 1: Create New Project */}
            <div
              onClick={() => setActiveScreen('create-project')}
              className="group cursor-pointer p-6 rounded-2xl bg-[#1b1411] hover:bg-[#382c26] border border-white/10 hover:border-[#33cc7a]/50 transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#33cc7a]/10 text-[#33cc7a] flex items-center justify-center border border-[#33cc7a]/20 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#33cc7a] transition-colors">
                  Create New Project
                </h3>
                <p className="text-xs text-[#b8aba3] leading-relaxed">
                  Start with a logline, premise, or rough idea. Tattava will deconstruct your input.
                </p>
              </div>
              <span className="text-xs font-bold text-[#33cc7a] flex items-center gap-1">
                <span>Start Fresh</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Option 2: Import Existing Material */}
            <div
              onClick={() => setActiveScreen('create-project')}
              className="group cursor-pointer p-6 rounded-2xl bg-[#1b1411] hover:bg-[#382c26] border border-white/10 hover:border-[#bacde0]/50 transition-all flex flex-col justify-between space-y-4 shadow-lg"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#bacde0]/10 text-[#bacde0] flex items-center justify-center border border-[#bacde0]/20 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#bacde0] transition-colors">
                  Import Existing Material
                </h3>
                <p className="text-xs text-[#b8aba3] leading-relaxed">
                  Upload a PDF, DOCX, or TXT pitch treatment. The system will extract structured entities.
                </p>
              </div>
              <span className="text-xs font-bold text-[#bacde0] flex items-center gap-1">
                <span>Upload Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Option 3: Open Demo Project (Section 21) */}
            <div
              onClick={openDemoProject}
              className="group cursor-pointer p-6 rounded-2xl bg-[#1b1411] hover:bg-[#382c26] border border-white/10 hover:border-[#33cc7a]/50 transition-all flex flex-col justify-between space-y-4 shadow-lg relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#33cc7a]/10 text-[#33cc7a] flex items-center justify-center border border-[#33cc7a]/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-white group-hover:text-[#33cc7a] transition-colors">
                    Open Demo Project
                  </h3>
                </div>
                <span className="inline-block text-[9px] font-mono px-2 py-0.5 rounded bg-[#33cc7a]/20 text-[#33cc7a] border border-[#33cc7a]/30 font-bold uppercase">
                  DEMO — SAMPLE DATA
                </span>
                <p className="text-xs text-[#b8aba3] leading-relaxed">
                  Inspect "The Last Monsoon" reference project with pre-populated Story Brain facts and canon.
                </p>
              </div>
              <span className="text-xs font-bold text-[#33cc7a] flex items-center gap-1">
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
                <h2 className="text-xl font-bold text-[#fbf8f3] tracking-tight">Active Workspaces ({projects.length})</h2>
                <p className="text-xs text-stone-400">Story projects governed by their respective Story Brain</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={openDemoProject}
                  className="linea-pill-btn linea-pill-secondary px-3.5 py-1.5 text-xs font-semibold gap-1.5 border border-white/10"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#33cc7a]" />
                  <span>Open Demo Project</span>
                </button>
                <button 
                  onClick={() => setActiveScreen('create-project')}
                  className="linea-pill-btn linea-pill-primary px-4 py-1.5 text-xs font-bold gap-1.5 shadow-md shadow-[#33cc7a]/20"
                >
                  <Plus className="w-3.5 h-3.5 text-[#1b1411]" />
                  <span>New Project</span>
                </button>
              </div>
            </div>

            {/* Project Cards Grid (Linea Bento Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {projects.map((proj) => {
                const factCount = proj.storyBrain?.canonFacts?.length || 0;
                const charCount = proj.characters?.length || 0;
                const evalScore = proj.evaluation?.overallScore ? Math.round(proj.evaluation.overallScore) : null;

                return (
                  <div
                    key={proj.id}
                    className={`group relative rounded-3xl bg-[#2e241f]/90 border overflow-hidden flex flex-col shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                      proj.isDemo 
                        ? 'border-[#33cc7a]/40 hover:border-[#33cc7a] shadow-[0_4px_24px_rgba(51,204,122,0.1)]' 
                        : 'border-white/10 hover:border-[#33cc7a]/40'
                    }`}
                  >
                    {/* Poster Banner */}
                    <div 
                      className="relative h-44 overflow-hidden bg-slate-900 cursor-pointer" 
                      onClick={() => openProject(proj.id)}
                    >
                      <img
                        src={proj.posterUrl}
                        alt={proj.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2e241f] via-[#2e241f]/50 to-transparent" />

                      {/* Stage Pill */}
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border shadow-sm bg-black/70 text-white/90 border-white/20 backdrop-blur-md">
                        {proj.stage}
                      </span>

                      {/* Demo or Evaluation Badge */}
                      {proj.isDemo ? (
                        <span className="absolute top-3 right-10 px-3 py-1 rounded-full text-[9px] font-bold font-mono tracking-wide border bg-[#33cc7a]/20 text-[#33cc7a] border-[#33cc7a]/40 uppercase backdrop-blur-md">
                          DEMO / SAMPLE
                        </span>
                      ) : evalScore ? (
                        <span className="absolute top-3 right-10 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide border bg-[#33cc7a]/20 text-[#33cc7a] border-[#33cc7a]/30 backdrop-blur-md flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#33cc7a] animate-pulse" />
                          {evalScore}% Ready
                        </span>
                      ) : (
                        <span className="absolute top-3 right-10 px-3 py-1 rounded-full text-[9px] font-mono text-white/60 bg-black/70 border border-white/10 backdrop-blur-md">
                          {proj.canonicalVersion || 'v0.1'}
                        </span>
                      )}

                      {/* More Menu button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === proj.id ? null : proj.id);
                        }}
                        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Menu dropdown */}
                      {activeMenuId === proj.id && (
                        <div className="absolute top-11 right-3 w-44 bg-[#1a202e]/95 border border-white/15 rounded-2xl shadow-2xl p-2 z-20 text-xs backdrop-blur-2xl animate-in fade-in zoom-in-95">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openProject(proj.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-white hover:bg-white/10 rounded-xl font-medium"
                          >
                            Open Story Brain
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateProject(proj.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-stone-300 hover:bg-white/10 rounded-xl"
                          >
                            Duplicate
                          </button>
                          {!proj.isDemo && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setProjectToDelete({ id: proj.id, title: proj.title });
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 rounded-xl flex items-center justify-between"
                            >
                              <span>Delete Project</span>
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 
                            onClick={() => openProject(proj.id)}
                            className="text-base font-bold text-[#faf5f0] group-hover:text-[#33cc7a] cursor-pointer transition-colors truncate"
                          >
                            {proj.title}
                          </h3>
                        </div>

                        <p className="text-[11px] text-[#b8aba3] mt-1">
                          {proj.contentType} • {proj.genre}
                        </p>
                        
                        <p className="text-xs text-[#eee5dc]/80 mt-2.5 line-clamp-2 leading-relaxed">
                          {proj.intent?.premise || proj.tagline || 'Premise under development.'}
                        </p>
                      </div>

                      {/* Story Brain & Progress Footer */}
                      <div className="pt-3.5 border-t border-white/[0.08] space-y-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#33cc7a] font-medium flex items-center gap-1.5 font-mono">
                            <Brain className="w-3.5 h-3.5 text-[#33cc7a]" />
                            {factCount} Canon Facts Locked
                          </span>
                          <span className="text-[#b8aba3] text-[10px]">
                            {charCount} Characters
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[10px] text-[#b8aba3]">
                          <span>{proj.lastUpdated}</span>
                          <button
                            onClick={() => openProject(proj.id)}
                            className="linea-pill-btn linea-pill-secondary px-3 py-1 text-[11px] font-bold text-[#33cc7a] hover:text-white gap-1"
                          >
                            <span>Open</span>
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
                className="group cursor-pointer rounded-3xl border-2 border-dashed border-white/15 hover:border-[#33cc7a]/60 bg-[#1b1411]/60 hover:bg-[#2e241f] p-6 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[260px] shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-[#2e241f] group-hover:bg-[#33cc7a] border border-white/20 group-hover:border-[#33cc7a] flex items-center justify-center text-[#b8aba3] group-hover:text-[#1b1411] shadow-sm transition-all group-hover:scale-110">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mt-4 group-hover:text-[#33cc7a] transition-colors">
                  Start New Project
                </h3>
                <p className="text-xs text-[#b8aba3] mt-1 max-w-[200px]">
                  Build Story Brain around your own original premise.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Golden Loop Overview (Linea Bento Card) */}
          <div className="space-y-6">
            <div className="linea-bento p-6 space-y-4">
              <h3 className="text-sm font-bold text-white">V1 Pilot Golden Workflow</h3>
              <p className="text-xs text-[#b8aba3] leading-relaxed">
                Tattava enforces human governance across every step of story development:
              </p>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#1b1411] border border-white/5 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#33cc7a]/15 text-[#33cc7a] font-mono font-bold flex items-center justify-center text-xs shrink-0 border border-[#33cc7a]/30">1</span>
                  <div>
                    <strong className="block text-white">Input & Ambiguity Intake</strong>
                    <span className="text-[11px] text-[#b8aba3]">Analyze premise; distinguish known vs inferred.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1b1411] border border-white/5 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#bacde0]/15 text-[#bacde0] font-mono font-bold flex items-center justify-center text-xs shrink-0 border border-[#bacde0]/30">2</span>
                  <div>
                    <strong className="block text-white">Story Brain System of Record</strong>
                    <span className="text-[11px] text-[#b8aba3]">Lock approved canonical facts & decision log.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1b1411] border border-white/5 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-500/15 text-blue-400 font-mono font-bold flex items-center justify-center text-xs shrink-0 border border-blue-500/30">3</span>
                  <div>
                    <strong className="block text-white">Character & Story Development</strong>
                    <span className="text-[11px] text-[#b8aba3]">Generate candidate arcs grounded in canon.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1b1411] border border-white/5 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-rose-500/15 text-rose-400 font-mono font-bold flex items-center justify-center text-xs shrink-0 border border-rose-500/30">4</span>
                  <div>
                    <strong className="block text-white">Canon & Continuity Engine</strong>
                    <span className="text-[11px] text-[#b8aba3]">Audit drafts against locked Story Brain truths.</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#1b1411] border border-white/5 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#33cc7a]/15 text-[#33cc7a] font-mono font-bold flex items-center justify-center text-xs shrink-0 border border-[#33cc7a]/30">5</span>
                  <div>
                    <strong className="block text-white">AI Evaluation & Story Package</strong>
                    <span className="text-[11px] text-[#b8aba3]">Rubric readiness audit & greenlight delivery.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Deletion Confirmation Dialog */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161a24] border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Story Project?</h3>
                <span className="text-[11px] text-rose-400 font-mono uppercase tracking-wider">Permanent Action</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-white">"{projectToDelete.title}"</strong>? 
              All locked Story Brain canon, character graphs, research citations, and scenes will be permanently erased.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-lg shadow-rose-500/25 transition-all active:scale-95 cursor-pointer"
              >
                Yes, Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Research-First Narrative Foundry Modal */}
      <ResearchFoundryModal
        isOpen={isFoundryOpen}
        onClose={() => setIsFoundryOpen(false)}
        isLoading={isFoundryLoading}
        researchData={foundryData}
        topicQuery={foundryTopicQuery}
      />
    </div>
  );
};
