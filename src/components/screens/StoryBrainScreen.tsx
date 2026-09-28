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
  BookOpen
} from 'lucide-react';

export const StoryBrainScreen: React.FC = () => {
  const { currentProject, addCanonFact, toggleLockCanonFact, logCreativeDecision, resolveDependencyStaleness, setActiveScreen, openContextResolver } = useProject();
  
  const [activeTab, setActiveTab] = useState<'canon' | 'entities' | 'decisions' | 'dependencies'>('canon');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Form modal state
  const [isAddFactOpen, setIsAddFactOpen] = useState(false);
  const [newStatement, setNewStatement] = useState('');
  const [newCategory, setNewCategory] = useState<CanonFact['category']>('Character Truth');
  const [newSource, setNewSource] = useState('');
  const [newTags, setNewTags] = useState('');

  const [isAddDecisionOpen, setIsAddDecisionOpen] = useState(false);
  const [decisionTitle, setDecisionTitle] = useState('');
  const [decisionRationale, setDecisionRationale] = useState('');
  const [decisionAuthor, setDecisionAuthor] = useState('Kaustubh Deshmukh');
  const [decisionRole, setDecisionRole] = useState('AI Product Manager');
  const [decisionImpacts, setDecisionImpacts] = useState('');

  const canonFacts = currentProject.storyBrain.canonFacts;
  const decisions = currentProject.storyBrain.creativeDecisions;
  const dependencies = currentProject.storyBrain.dependencies;

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

    addCanonFact({
      statement: newStatement.trim(),
      category: newCategory,
      entityIds: ['char-aanya'],
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
      {/* Top Hero: Story Brain System of Record */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#121624] via-[#0f121d] to-[#151a2d] border border-amber-500/30 p-6 lg:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                System of Record • V1 Pilot Baseline
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-white/10 text-white/70 border border-white/10">
                {currentProject.canonicalVersion || 'v1.2-canonical'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Story Brain & Project Intelligence
            </h1>
            <p className="text-sm text-white/70 max-w-3xl leading-relaxed">
              The persistent narrative memory for <strong className="text-white">{currentProject.title}</strong>. 
              Maintains immutable world rules, character truths, and causal dependencies across the development lifecycle.
              No agent may silently mutate approved canon.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openContextResolver()}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-2 transition-all shadow-lg backdrop-blur-md"
            >
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Inspect Context Resolver</span>
            </button>

            <button
              onClick={() => setIsAddFactOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Canon Fact</span>
            </button>
          </div>
        </div>

        {/* Live Operational Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Canonical Facts</span>
            <span className="text-xl font-black text-white flex items-center gap-1.5 mt-0.5">
              <Shield className="w-4 h-4 text-amber-400" />
              {canonFacts.length}
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Approved Decisions</span>
            <span className="text-xl font-black text-white flex items-center gap-1.5 mt-0.5">
              <History className="w-4 h-4 text-blue-400" />
              {decisions.length}
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Active Graph Entities</span>
            <span className="text-xl font-black text-white flex items-center gap-1.5 mt-0.5">
              <Users className="w-4 h-4 text-emerald-400" />
              {currentProject.storyBrain.activeEntitiesCount}
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Dependency Integrity</span>
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

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('canon')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'canon'
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Canon Facts & Truths ({canonFacts.length})</span>
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
          <span>Entity & Relationship Network</span>
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
          <span>Creative Decision Log ({decisions.length})</span>
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
            {filteredFacts.map(fact => (
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

                  <button
                    onClick={() => toggleLockCanonFact(fact.id)}
                    className="p-1.5 rounded-lg text-white/40 hover:text-amber-400 transition-colors"
                    title={fact.isLocked ? 'Locked (Immutable truth)' : 'Unlocked'}
                  >
                    {fact.isLocked ? (
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5 text-white/30" />
                    )}
                  </button>
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
                  onChange={e => setNewStatement(e.target.value)}
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
