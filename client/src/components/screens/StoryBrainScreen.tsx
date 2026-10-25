import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { CanonFact, CreativeDecision, StoryDependency } from '../../types/project';
import { 
  Brain, 
  Shield, 
  Lock, 
  Unlock, 
  GitBranch, 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Users, 
  Layers, 
  History, 
  ArrowRight, 
  Sparkles, 
  Database,
  ExternalLink,
  BookOpen,
  Trash2,
  Check,
  X
} from 'lucide-react';

export const StoryBrainScreen: React.FC = () => {
  const { 
    currentProject, 
    addCanonFact, 
    deleteCanonFact, 
    toggleLockCanonFact, 
    logCreativeDecision, 
    resolveDependencyStaleness, 
    setActiveScreen, 
    openContextResolver,
    fetchCandidatePool,
    adoptCandidateIntoProject,
    updateCandidateStatus,
    resolveCanonConflict
  } = useProject();
  
  const [activeTab, setActiveTab] = useState<'canon' | 'candidates' | 'conflicts' | 'entities' | 'decisions' | 'dependencies'>('canon');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [candidateTypeFilter, setCandidateTypeFilter] = useState<string>('ALL');
  const [candidateSearchQuery, setCandidateSearchQuery] = useState<string>('');
  const [isGeneratingCandidates, setIsGeneratingCandidates] = useState<boolean>(false);

  // Form modal state
  const [isAddFactOpen, setIsAddFactOpen] = useState(false);
  const [newStatement, setNewStatement] = useState('');
  const [newCategory, setNewCategory] = useState<CanonFact['category']>('Character Truth');
  const [newSource, setNewSource] = useState('');
  const [newTags, setNewTags] = useState('');

  const [isAddDecisionOpen, setIsAddDecisionOpen] = useState(false);
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionRationale, setDecisionRationale] = useState('');
  const [decisionAuthor, setDecisionAuthor] = useState('Story Development Lead');
  const [decisionRole, setDecisionRole] = useState('Story Editor');
  const [decisionImpacts, setDecisionImpacts] = useState('');

  const canonFacts = currentProject.storyBrain?.canonFacts || [];
  const decisions = currentProject.storyBrain?.creativeDecisions || currentProject.storyBrain?.decisionLog || [];
  const dependencies = currentProject.storyBrain?.dependencies || [];
  const candidatePool = currentProject.candidatePool || [];
  const canonConflicts = currentProject.canonConflicts || [];

  const filteredCandidates = candidatePool.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
                          c.whatItIs.toLowerCase().includes(candidateSearchQuery.toLowerCase()) ||
                          c.evidence.toLowerCase().includes(candidateSearchQuery.toLowerCase());
    const matchesType = candidateTypeFilter === 'ALL' || c.candidateType === candidateTypeFilter;
    return matchesSearch && matchesType;
  });

  const filteredFacts = canonFacts.filter(fact => {
    const matchesSearch = fact.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fact.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fact.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || fact.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatement.trim()) return;

    const defaultEntityId = currentProject.characters?.[0]?.id || 'entity-core';

    addCanonFact({
      statement: newStatement.trim(),
      category: newCategory,
      entityIds: [defaultEntityId],
      source: newSource.trim() || 'Creative Executive Decision',
      isLocked: true,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean)
    });

    setNewStatement('');
    setNewSource('');
    setNewTags('');
    setIsAddFactOpen(false);
  };

  const handleCreateDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionTitle.trim()) return;

    logCreativeDecision({
      title: decisionTitle.trim(),
      rationale: decisionRationale.trim(),
      author: decisionAuthor,
      role: decisionRole,
      impactedAreas: decisionImpacts.split(',').map(i => i.trim()).filter(Boolean)
    });

    setDecisionTitle('');
    setDecisionRationale('');
    setDecisionImpacts('');
    setIsAddDecisionOpen(false);
  };

  const staleDependenciesCount = dependencies.filter(d => d.isStale).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Top Hero: Story Brain System of Record (Linea Bento Card) */}
      <div className="linea-bento p-6 lg:p-8 relative overflow-hidden border-amber-500/30">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 font-mono">
                <Brain className="w-3.5 h-3.5" />
                System of Record • V1 Pilot Baseline
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/10 text-stone-300 border border-white/10">
                {currentProject.canonicalVersion || 'v1.2-canonical'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#fbf8f3] tracking-tight flex items-center gap-3">
              Story Brain & Project Intelligence
            </h1>
            <p className="text-sm text-stone-300 max-w-3xl leading-relaxed">
              The persistent narrative memory for <strong className="text-white">{currentProject.title}</strong>. 
              Maintains immutable world rules, character truths, and causal dependencies across the development lifecycle.
              No agent may silently mutate approved canon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openContextResolver()}
              className="linea-pill-btn linea-pill-secondary px-4 py-2.5 text-xs font-semibold gap-2 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Inspect Context Resolver</span>
            </button>

            <button
              onClick={() => setIsAddFactOpen(true)}
              className="linea-pill-btn linea-pill-secondary px-4 py-2.5 text-xs font-semibold gap-2 border border-white/10"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Canon Fact</span>
            </button>

            <button
              onClick={() => setActiveScreen('intake')}
              className="linea-pill-btn linea-pill-primary px-5 py-2.5 text-xs font-bold gap-2 whitespace-nowrap cursor-pointer"
              title="Advance to Project Intake & Ambiguity Dossier"
            >
              <span>Next: Project Intake</span>
              <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Live Operational Metrics Ribbon (Linea Bento Chips) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
          <div className="bg-[#121622]/80 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10 shadow-inner">
            <span className="text-[11px] text-stone-400 block font-medium font-mono">Canonical Facts</span>
            <span className="text-xl font-black text-white flex items-center gap-1.5 mt-0.5">
              <Shield className="w-4 h-4 text-amber-400" />
              {canonFacts.length}
            </span>
          </div>

          <div className="bg-[#121622]/80 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10 shadow-inner">
            <span className="text-[11px] text-stone-400 block font-medium font-mono">Approved Decisions</span>
            <span className="text-xl font-black text-white flex items-center gap-1.5 mt-0.5">
              <History className="w-4 h-4 text-blue-400" />
              {decisions.length}
            </span>
          </div>

          <div className="bg-[#121622]/80 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10 shadow-inner">
            <span className="text-[11px] text-stone-400 block font-medium font-mono">Active Graph Entities</span>
            <span className="text-xl font-black text-white flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-emerald-400" />
              {currentProject.storyBrain.activeEntitiesCount}
            </span>
          </div>

          <div className="bg-[#121622]/80 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10 shadow-inner">
            <span className="text-[11px] text-stone-400 block font-medium font-mono">Dependency Integrity</span>
            <span className={`text-xl font-black flex items-center gap-1.5 mt-0.5 ${
              staleDependenciesCount > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {staleDependenciesCount > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  {staleDependenciesCount} Stale Edge
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  100% Synced
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Linea Pill Tabs) */}
      <div className="flex border-b border-white/[0.08] gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('canon')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'canon'
              ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Canon Facts & Truths ({canonFacts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('candidates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'candidates'
              ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/20'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Candidate Pool ({candidatePool.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('conflicts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'conflicts'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Canon Conflicts ({canonConflicts.filter(c => c.status === 'OPEN').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('entities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'entities'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Entity Network</span>
        </button>

        <button
          onClick={() => setActiveTab('decisions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'decisions'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Decision Log ({decisions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('dependencies')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all relative ${
            activeTab === 'dependencies'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Dependencies & Staleness</span>
          {staleDependenciesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-2 right-2 animate-ping" />
          )}
        </button>
      </div>

      {/* TAB 1: CANON FACTS & TRUTHS */}
      {activeTab === 'canon' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#131622] p-3 rounded-xl border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search canonical facts, sources, tags..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <Filter className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
              {['All', 'Character Truth', 'Timeline', 'Institutional Reality', 'Plot Law', 'World Rule'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Facts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {canonFacts.length === 0 ? (
              <div className="col-span-1 md:col-span-2 p-12 rounded-2xl bg-[#141724] border border-white/10 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h3 className="text-base font-bold text-white">No Approved Canon Facts Yet</h3>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Story Brain starts completely clean. Run Project Intake to deconstruct your premise into baseline truths, or manually record a canonical fact below.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveScreen('intake')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                  >
                    <span>Run Project Intake</span>
                  </button>
                  <button
                    onClick={() => setIsAddFactOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all"
                  >
                    <span>+ Add Fact Manually</span>
                  </button>
                </div>
              </div>
            ) : filteredFacts.length === 0 ? (
              <div className="col-span-1 md:col-span-2 p-12 rounded-2xl bg-[#141724] border border-white/10 text-center space-y-3">
                <Search className="w-8 h-8 text-slate-500 mx-auto" />
                <h3 className="text-sm font-bold text-white">No Matching Canon Facts Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No canonical facts matched your search query <span className="text-amber-400">"{searchQuery}"</span>{categoryFilter !== 'All' ? ` in category "${categoryFilter}"` : ''}.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('All');
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-amber-300 border border-amber-500/30 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Reset All Filters</span>
                  </button>
                </div>
              </div>
            ) : filteredFacts.map(fact => (
              <div 
                key={fact.id}
                className="bg-[#141724] border border-white/10 hover:border-amber-500/40 rounded-xl p-5 transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {fact.category}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">
                      {fact.id.toUpperCase()} • {fact.version}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleLockCanonFact(fact.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-amber-400 transition-colors"
                      title={fact.isLocked ? 'Locked (Immutable truth) - Click to unlock' : 'Unlocked - Click to lock'}
                    >
                      {fact.isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Unlock className="w-3.5 h-3.5 text-white/30" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (fact.isLocked) {
                          alert(`Canon fact "${fact.id}" is locked. Please unlock it before deleting.`);
                          return;
                        }
                        if (confirm(`Delete canonical fact "${fact.statement}"?`)) {
                          deleteCanonFact(fact.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-white/30 hover:text-rose-400 transition-colors"
                      title="Delete Canon Fact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-white font-medium leading-relaxed">
                  "{fact.statement}"
                </p>

                <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-white/50">
                    <span className="truncate">Source: <strong className="text-white/80">{fact.source}</strong></span>
                    <span className="font-mono text-[10px]">{fact.dateEstablished}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {fact.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/60">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: EVIDENCE-BACKED CANDIDATE POOL (PHASE 7) */}
      {activeTab === 'candidates' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#131722] to-black/80 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Evidence-Backed Candidate Pool</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    Phase 7 Architecture
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">Multi-Type Historical & Dramatic Candidates</h3>
                <p className="text-xs text-white/70 mt-1 max-w-2xl leading-relaxed">
                  Hold generated historical events, figures, political transitions, and turning points in an evidence-backed candidate pool before human review and promotion into authoritative canon.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                setIsGeneratingCandidates(true);
                try {
                  await fetchCandidatePool();
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsGeneratingCandidates(false);
                }
              }}
              disabled={isGeneratingCandidates}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGeneratingCandidates ? 'animate-spin' : ''}`} />
              <span>{isGeneratingCandidates ? 'Synthesizing Candidates...' : 'Synthesize Candidate Pool (Groq LPU)'}</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#131622] p-3 rounded-xl border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-white/40" />
              <input
                type="text"
                value={candidateSearchQuery}
                onChange={e => setCandidateSearchQuery(e.target.value)}
                placeholder="Search candidates, evidence, or relevance..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-white/40 shrink-0 mr-1" />
              {[
                { id: 'ALL', label: 'All Candidates' },
                { id: 'historical_event', label: 'Historical Events' },
                { id: 'person', label: 'Key Figures' },
                { id: 'conflict', label: 'Core Conflicts' },
                { id: 'turning_point', label: 'Turning Points' },
                { id: 'political_transition', label: 'Political Transitions' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCandidateTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    candidateTypeFilter === tab.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Cards Grid */}
          {filteredCandidates.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#141724] border border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-white">No Candidates Generated Yet</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Synthesize the evidence-backed candidate pool to discover historical events, real figures, and critical turning points ready for adoption into Story Brain.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setIsGeneratingCandidates(true);
                  try {
                    await fetchCandidatePool();
                  } finally {
                    setIsGeneratingCandidates(false);
                  }
                }}
                disabled={isGeneratingCandidates}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20"
              >
                Synthesize Candidate Pool with Groq LPU
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCandidates.map(c => (
                <div
                  key={c.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition-all duration-200 ${
                    c.status === 'ADOPTED'
                      ? 'bg-[#131b24] border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                      : c.status === 'LOCKED'
                      ? 'bg-[#151829] border-blue-500/40 shadow-lg shadow-blue-500/5'
                      : 'bg-[#12141d] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {c.candidateType.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        c.status === 'ADOPTED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : c.status === 'LOCKED'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-white/10 text-white/70'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white leading-tight">{c.title}</h4>
                      <p className="text-xs text-white/80 mt-1 leading-relaxed">{c.whatItIs}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block font-semibold">Supporting Evidence:</span>
                      <p className="text-[11px] text-white/70 italic leading-snug">{c.evidence}</p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Narrative Significance:</span>
                      <p className="text-white/70 leading-relaxed">{c.narrativeRelevance}</p>
                    </div>

                    {c.possibleEpisodeUsage && c.possibleEpisodeUsage.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-white/40 font-mono uppercase">Episode Usage:</span>
                        {c.possibleEpisodeUsage.map(ep => (
                          <span key={ep} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-amber-300 font-mono">
                            Ep {ep}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    {c.status !== 'ADOPTED' && c.status !== 'LOCKED' ? (
                      <button
                        type="button"
                        onClick={() => adoptCandidateIntoProject(c.id)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Adopt into Story Brain</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Adopted in Canon
                      </span>
                    )}

                    {c.status !== 'REJECTED' && (
                      <button
                        type="button"
                        onClick={() => updateCandidateStatus(c.id, 'REJECTED')}
                        className="py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/40 hover:text-rose-300 border border-white/5 text-xs transition-colors"
                        title="Reject Candidate"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: CANON CONFLICT & RECONCILIATION WORKSPACE (PHASE 9) */}
      {activeTab === 'conflicts' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#141724] to-black/80 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Canon Conflict & Diff Reconciliation Engine</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Phase 9 Architecture
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">Authoritative Canon vs. Evidentiary Contradictions</h3>
                <p className="text-xs text-white/70 mt-1 max-w-2xl leading-relaxed">
                  When new historical claims or creative choices contest established canon, reconcile the differences with explicit action: Merge, Override, Preserve Both, or Reject.
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs text-white/40">Total Conflicts</div>
              <div className="text-lg font-mono font-bold text-amber-400">
                {canonConflicts.filter(c => c.status === 'OPEN').length} Open / {canonConflicts.length} Logged
              </div>
            </div>
          </div>

          {/* Conflicts List */}
          {canonConflicts.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#141724] border border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-white">Zero Unresolved Canon Conflicts</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  All active facts in Story Brain, character backstories, and narrative timelines are in full harmony with current evidence.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {canonConflicts.map(conflict => {
                const isResolved = conflict.status !== 'OPEN' && conflict.status !== 'COMPARE';

                return (
                  <div
                    key={conflict.id}
                    className={`rounded-2xl p-6 border transition-all ${
                      isResolved
                        ? 'bg-[#11131a] border-white/10 opacity-75'
                        : 'bg-[#151928] border-amber-500/40 shadow-xl'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {conflict.conflictType.replace(/_/g, ' ')}
                        </span>
                        <h4 className="text-base font-bold text-white">{conflict.title}</h4>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {conflict.status}
                      </span>
                    </div>

                    {/* Side-by-Side Diff */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {/* Left: Existing Canon */}
                      <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold uppercase text-white/40 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-blue-400" />
                            Existing Story Brain Canon
                          </span>
                          <span className="text-[10px] text-blue-300 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            Current Law
                          </span>
                        </div>
                        <p className="text-xs text-white/90 leading-relaxed font-serif">
                          "{conflict.existingCanonText}"
                        </p>
                      </div>

                      {/* Right: New Contradictory Evidence */}
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold uppercase text-amber-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            New Contradictory Evidence
                          </span>
                          <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Source: {conflict.source}
                          </span>
                        </div>
                        <p className="text-xs text-white/90 leading-relaxed font-serif">
                          "{conflict.newEvidenceText}"
                        </p>
                      </div>
                    </div>

                    {/* Difference & Impact Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5 text-xs">
                      <div>
                        <span className="text-[11px] font-mono uppercase text-white/40 block">Contradiction Analysis:</span>
                        <p className="text-white/70 mt-1 leading-relaxed">{conflict.difference}</p>
                      </div>
                      <div>
                        <span className="text-[11px] font-mono uppercase text-white/40 block">Downstream Impact:</span>
                        <p className="text-amber-300/80 mt-1 leading-relaxed">{conflict.impact}</p>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-white/50">
                        {isResolved
                          ? `Resolution Note: ${conflict.resolutionNotes || conflict.status}`
                          : 'Select an authoritative reconciliation action:'}
                      </div>

                      {!isResolved ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => resolveCanonConflict(conflict.id, 'MERGED')}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all"
                            title="Synthesize creative nuance that accommodates both perspectives"
                          >
                            Merge Perspectives
                          </button>

                          <button
                            type="button"
                            onClick={() => resolveCanonConflict(conflict.id, 'OVERRIDE')}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                            title="Replace existing canon with new verified evidence"
                          >
                            Override Existing Canon
                          </button>

                          <button
                            type="button"
                            onClick={() => resolveCanonConflict(conflict.id, 'PRESERVE_BOTH')}
                            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all"
                            title="Frame contradiction as an in-world scholarly mystery or ideological rift"
                          >
                            Preserve Both as Mystery
                          </button>

                          <button
                            type="button"
                            onClick={() => resolveCanonConflict(conflict.id, 'REJECTED')}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all"
                            title="Reject the new evidence and enforce existing canon"
                          >
                            Reject Contradiction
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => resolveCanonConflict(conflict.id, 'OPEN')}
                          className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs border border-white/10"
                        >
                          Reopen Conflict
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ENTITY & RELATIONSHIP NETWORK */}
      {activeTab === 'entities' && (
        <div className="space-y-6">
          <div className="bg-[#141724] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Narrative Entity Graph</h3>
                <p className="text-xs text-white/60">Core characters, organizations, and geographical anchors tracked in Story Brain.</p>
              </div>
              <button 
                onClick={() => setActiveScreen('characters')}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <span>Edit Character Bibles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentProject.characters.map(char => (
                <div key={char.id} className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={char.photoUrl} alt={char.name} className="w-10 h-10 rounded-full object-cover border border-amber-500/40" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{char.name}</h4>
                      <span className="text-[11px] text-amber-400">{char.role} • {char.age} yrs</span>
                    </div>
                  </div>
                  <div className="text-xs space-y-1 text-white/70">
                    <div><span className="text-white/40">Want:</span> {char.want}</div>
                    <div><span className="text-white/40">Need:</span> {char.need}</div>
                    <div><span className="text-white/40">Flaw:</span> {char.flaw}</div>
                  </div>
                  <div className="pt-2 border-t border-white/5 text-[11px] text-white/50">
                    <span className="text-white/40 block">Relationships:</span>
                    {char.relationships.map(r => (
                      <span key={r.targetCharacterId} className="block text-white/80">
                        → {r.targetCharacterName} ({r.dynamic})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* World Locations & Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#141724] border border-white/10 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                World Setting & Physical Laws
              </h4>
              <p className="text-xs text-white/70 leading-relaxed">
                {currentProject.world.socioPolitical}
              </p>
              <div className="space-y-1.5 pt-2">
                {currentProject.world.worldRules?.map((rule, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs text-white/80 flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#141724] border border-white/10 rounded-2xl p-5 space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Institutional Realities & Organizations
              </h4>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-amber-300">Vidarbha Agricultural Relief Trust (VART)</span>
                <p className="text-xs text-white/70">
                  Private non-governmental development vehicle controlled by Vikrant Singhania. Holds exclusive flood rehabilitation concession titles covering 40,000 hectares.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-2">
                <span className="text-xs font-bold text-blue-300">Central Water Commission (CWC) SCADA Grid</span>
                <p className="text-xs text-white/70">
                  Air-gapped telemetry logging system on Upper Penganga Barrage. Manual gate actuations log hexadecimal signatures to immutable local flash storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CREATIVE DECISION LOG */}
      {activeTab === 'decisions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-[#131622] p-4 rounded-xl border border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Chronological Creative Decision Audit</h3>
              <p className="text-xs text-white/60">Every material change to premise, character age, or structural stakes requires attributable logging.</p>
            </div>
            <button
              onClick={() => setIsAddDecisionOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Decision</span>
            </button>
          </div>

          <div className="space-y-3">
            {decisions.map(dec => (
              <div key={dec.id} className="bg-[#141724] border border-white/10 rounded-xl p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{dec.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {dec.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-white/40">{dec.date}</span>
                </div>

                <p className="text-xs text-white/80 leading-relaxed bg-black/20 p-3 rounded-lg border border-white/5">
                  <strong className="text-white/40 block mb-1">Rationale:</strong>
                  {dec.rationale}
                </p>

                <div className="flex items-center justify-between text-[11px] text-white/50 pt-2 border-t border-white/5">
                  <span>Logged by: <strong className="text-white/80">{dec.author} ({dec.role})</strong></span>
                  <div className="flex items-center gap-1">
                    <span className="text-white/40">Impacted:</span>
                    {dec.impactedAreas.map(area => (
                      <span key={area} className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-white/70">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DEPENDENCIES & STALENESS TRACKER */}
      {activeTab === 'dependencies' && (
        <div className="space-y-4">
          <div className="bg-[#131622] p-4 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Cross-Artifact Dependency Graph</h3>
              <p className="text-xs text-white/60">
                When upstream entities (such as character age or dam gate rules) change, downstream scenes and dialogues become stale until reconciled.
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('continuity')}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Go to Canon & Continuity Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {dependencies.map(dep => (
              <div 
                key={dep.id} 
                className={`p-4 rounded-xl border transition-all ${
                  dep.isStale 
                    ? 'bg-amber-500/10 border-amber-500/40' 
                    : 'bg-[#141724] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/70">
                      {dep.dependencyType}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {dep.sourceName} <span className="text-white/40">→</span> {dep.targetName}
                    </span>
                  </div>

                  {dep.isStale ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      STALE DEPENDENCY
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Synced
                    </span>
                  )}
                </div>

                <p className="text-xs text-white/80">{dep.description}</p>

                {dep.isStale && dep.staleReason && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-black/40 border border-amber-500/30 flex items-center justify-between text-xs">
                    <span className="text-amber-300">{dep.staleReason}</span>
                    <button
                      onClick={() => resolveDependencyStaleness(dep.id)}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-bold transition-colors"
                    >
                      Acknowledge & Mark Synced
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Stage Forward Navigation Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141826] via-[#161c2e] to-[#121622] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Story Brain System of Record Locked</span>
          </div>
          <p className="text-xs text-white/70 max-w-xl">
            Authoritative canon facts and creative decisions are preserved. Proceed to Project Intake to examine premise extraction and ambiguity triage.
          </p>
        </div>

        <button
          onClick={() => setActiveScreen('intake')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <span>Next: Project Intake & Dossier</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* MODAL: ADD CANON FACT */}
      {isAddFactOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#141724] border border-amber-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                Add Canonical Truth to Story Brain
              </h3>
              <button onClick={() => setIsAddFactOpen(false)} className="text-white/40 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateFact} className="space-y-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">Statement (Immutable Fact)</label>
                <textarea
                  value={newStatement}
                  onChange={e => setNewStatement(e.target.value)}
                  placeholder="e.g. Aanya Deshmukh's father mortgaged his printing press in 2018..."
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/70 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Character Truth">Character Truth</option>
                    <option value="Timeline">Timeline</option>
                    <option value="Institutional Reality">Institutional Reality</option>
                    <option value="Plot Law">Plot Law</option>
                    <option value="World Rule">World Rule</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-white/70 block mb-1">Source / Provenance</label>
                  <input
                    type="text"
                    value={newSource}
                    onChange={e => setNewSource(e.target.value)}
                    placeholder="e.g. Approved Character Bible v1.2"
                    className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  placeholder="Protagonist, Backstory, Stakes"
                  className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddFactOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold"
                >
                  Commit to Story Brain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DECISION */}
      {isAddDecisionOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#141724] border border-blue-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-blue-400" />
                Log Creative Decision
              </h3>
              <button onClick={() => setIsAddDecisionOpen(false)} className="text-white/40 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateDecision} className="space-y-3">
              <div>
                <label className="text-xs text-white/70 block mb-1">Decision Title</label>
                <input
                  type="text"
                  value={decisionTitle}
                  onChange={e => setDecisionTitle(e.target.value)}
                  placeholder="e.g. Set Climax Setting to Nagpur Heritage Club Gala"
                  className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Creative Rationale</label>
                <textarea
                  value={decisionRationale}
                  onChange={e => setDecisionRationale(e.target.value)}
                  placeholder="Explain why this decision was made and what alternatives were rejected..."
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/70 block mb-1">Decision Maker</label>
                  <input
                    type="text"
                    value={decisionAuthor}
                    onChange={e => setDecisionAuthor(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70 block mb-1">Role</label>
                  <input
                    type="text"
                    value={decisionRole}
                    onChange={e => setDecisionRole(e.target.value)}
                    className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Impacted Story Areas</label>
                <input
                  type="text"
                  value={decisionImpacts}
                  onChange={e => setDecisionImpacts(e.target.value)}
                  placeholder="e.g. Act III, Scene 28, Antagonist Arc"
                  className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddDecisionOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold"
                >
                  Record Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
