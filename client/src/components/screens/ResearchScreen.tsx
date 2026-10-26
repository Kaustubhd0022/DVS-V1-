import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Sparkles, 
  ExternalLink, 
  BookOpen, 
  AlertCircle, 
  FileCheck, 
  Globe2, 
  Shield, 
  HelpCircle, 
  AlertTriangle, 
  RefreshCw, 
  Cpu 
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { ResearchFinding } from '../../types/project';
import { generateResearchTopics } from '../../services/aiService';
import { LineaButton, BentoCard, LineaCaption, LineaEqualizerWave } from '../common/LineaUI';

export const ResearchScreen: React.FC = () => {
  const { currentProject, addCanonFact, nextStep, openContextResolver, updateCurrentProject, buildResearchUniverse } = useProject();

  const [activeTab, setActiveTab] = useState<'Findings' | 'Questions' | 'Sources'>('Findings');
  const [filterType, setFilterType] = useState<'All' | 'Verified' | 'Conflicting' | 'Insufficient Evidence'>('All');
  const [epistemicFilter, setEpistemicFilter] = useState<'ALL' | 'DOCUMENTED_FACT' | 'SCHOLARLY_DISPUTED' | 'MYTHOLOGY_FOLKLORE' | 'CREATIVE_LICENCE'>('ALL');
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [promotedFindingIds, setPromotedFindingIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isMappingUniverse, setIsMappingUniverse] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<Record<string, string>>({});

  const questions = currentProject.researchQuestions || [];
  const findings = currentProject.researchFindings || [];

  const handleToggleQuestion = (id: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      researchQuestions: prev.researchQuestions.map(q => 
        q.id === id ? { ...q, completed: !q.completed } : q
      )
    }));
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionInput.trim()) return;
    const newQ = {
      id: 'rq-' + Date.now(),
      title: newQuestionInput.trim(),
      category: 'User Added',
      completed: false
    };
    updateCurrentProject(prev => ({
      ...prev,
      researchQuestions: [...(prev.researchQuestions || []), newQ]
    }));
    setNewQuestionInput('');
    setShowAddQuestion(false);
  };

  const handleBuildResearchUniverse = async () => {
    setIsMappingUniverse(true);
    setGenerationError(null);
    try {
      await buildResearchUniverse();
    } catch (err: any) {
      setGenerationError(err.message || 'AI service error mapping the research universe.');
    } finally {
      setIsMappingUniverse(false);
    }
  };

  const handleGenerateResearch = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      if (!currentProject.projectIntelligence?.researchUniverse?.dimensions?.length) {
        await buildResearchUniverse();
      }
      const res = await generateResearchTopics(currentProject, 6);
      updateCurrentProject(prev => {
        const newFindings: ResearchFinding[] = (res.topics || []).map((t, idx) => ({
          id: 'rf-' + ((prev.researchFindings?.length || 0) + idx + 1),
          topic: t.topic || 'Domain Research',
          claim: t.claim || '',
          evidence: t.evidence || '',
          source: t.source || 'Domain Literature',
          sourceType: (t.sourceType as any) || 'Academic',
          exactCitation: t.exactCitation || '',
          evidenceQuote: t.evidenceQuote || t.evidence || '',
          epistemicType: t.epistemicType || 'DOCUMENTED_FACT',
          status: 'Needs Review',
          confidence: t.confidence || 90,
          tags: ['Extracted Finding', t.topic || 'General'],
          date: new Date().toLocaleDateString(),
          implicationForPlot: t.implicationForPlot || '',
          usedIn: []
        }));

        return {
          ...prev,
          researchFindings: [...(prev.researchFindings || []), ...newFindings],
          pilotMetrics: {
            ...prev.pilotMetrics,
            totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
          }
        };
      });
    } catch (err: any) {
      setGenerationError(err.message || 'AI service error generating research findings.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVerifyFinding = (finding: ResearchFinding) => {
    const url = verificationUrl[finding.id]?.trim();
    if (!url) return;
    updateCurrentProject(prev => ({
      ...prev,
      researchFindings: (prev.researchFindings || []).map(item =>
        item.id === finding.id
          ? { ...item, sourceUrl: url, status: 'Verified', date: new Date().toLocaleDateString() }
          : item
      ),
      pilotMetrics: {
        ...prev.pilotMetrics,
        verificationRate: prev.researchFindings?.length
          ? Math.round((((prev.researchFindings || []).filter(f => f.status === 'Verified').length + 1) / prev.researchFindings.length) * 100)
          : 100
      }
    }));
  };

  const handlePromoteToCanon = (finding: ResearchFinding) => {
    addCanonFact({
      statement: finding.claim,
      category: 'Institutional Reality',
      entityIds: [],
      source: `${finding.source} (${finding.sourceType})`,
      isLocked: true,
      tags: ['Research Provenance', finding.topic]
    });
    setPromotedFindingIds(prev => [...prev, finding.id]);
  };

  const filteredFindings = findings.filter(f => {
    const matchesStatus = filterType === 'All' || f.status === filterType;
    const matchesEpistemic = 
      epistemicFilter === 'ALL' || 
      f.epistemicType === epistemicFilter || 
      (epistemicFilter === 'DOCUMENTED_FACT' && (f.epistemicType === 'SOURCE_FACT' || !f.epistemicType));
    return matchesStatus && matchesEpistemic;
  });

  const verifiedCount = findings.filter(f => f.status === 'Verified').length;
  const provenanceRate = findings.length > 0 ? Math.round((verifiedCount / findings.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Top Bento Hero Banner */}
      <BentoCard className="relative overflow-hidden p-6 lg:p-8 border-white/[0.08]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <LineaCaption variant="periwinkle" icon={<BookOpen className="w-3.5 h-3.5" />}>
                Flow 2 • Traceable Research Engine
              </LineaCaption>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/[0.04] text-stone-400 border border-white/[0.08]">
                Grounding & Provenance
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fbf8f3]">
              Traceable Research & Evidence Dossier
            </h1>
            
            <p className="text-xs sm:text-sm text-stone-300/80 max-w-3xl leading-relaxed">
              Derived directly from <strong className="text-[#fbf8f3]">"{currentProject.title}"</strong>.
              All external claims require verified provenance. Where evidence is uncertain, the system flags insufficient evidence rather than hallucinating facts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LineaButton
              variant="primary"
              size="md"
              showWave={isGenerating}
              onClick={handleGenerateResearch}
              disabled={isGenerating}
              icon={<RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />}
            >
              {isGenerating ? 'Synthesizing Dossier...' : 'Generate Research Topics (AI)'}
            </LineaButton>

            <button
              onClick={() => openContextResolver()}
              className="px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-sky-200 border border-white/[0.1] text-xs font-semibold transition-colors cursor-pointer"
            >
              Inspect Context Package
            </button>
            
            <LineaButton
              variant="ghost"
              size="md"
              onClick={nextStep}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Next: Story Exploration
            </LineaButton>
          </div>
        </div>
      </BentoCard>

      {/* Research Universe Bento — Knowledge map before claims */}
      <BentoCard className="p-6 lg:p-8 space-y-5 border-sky-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-[#fbf8f3]">Research Universe</h2>
              <span className="text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 font-semibold font-mono">
                Knowledge Map
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
              Map what must be understood before Tattava turns research into factual findings. Dimensions are research territories, not unverified claims.
            </p>
          </div>
          <LineaButton
            variant="ghost"
            size="sm"
            showWave={isMappingUniverse}
            onClick={handleBuildResearchUniverse}
            disabled={isMappingUniverse}
            icon={<Cpu className={`w-3.5 h-3.5 ${isMappingUniverse ? 'animate-spin' : ''}`} />}
          >
            {isMappingUniverse ? 'Mapping Knowledge Space...' : 'Map Research Universe'}
          </LineaButton>
        </div>

        {currentProject.projectIntelligence?.researchUniverse?.dimensions?.length ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#0a0c12]/60 border border-white/[0.06] p-4">
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Root Subject</p>
                <p className="text-xs font-bold text-[#fbf8f3] mt-1">{currentProject.projectIntelligence.researchUniverse.rootSubject}</p>
              </div>
              <div className="rounded-2xl bg-[#0a0c12]/60 border border-white/[0.06] p-4">
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Research Dimensions</p>
                <p className="text-xl font-bold text-sky-300 mt-1">{currentProject.projectIntelligence.researchUniverse.dimensions.length}</p>
              </div>
              <div className="rounded-2xl bg-[#0a0c12]/60 border border-white/[0.06] p-4">
                <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">Evidence Coverage</p>
                <p className="text-xl font-bold text-[#fbf8f3] mt-1">{currentProject.projectIntelligence.researchUniverse.coveragePercent}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentProject.projectIntelligence.researchUniverse.dimensions.map((dimension) => (
                <div key={dimension.id} className="rounded-2xl bg-[#0a0c12]/60 border border-white/[0.06] p-4 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#fbf8f3]">{dimension.label}</span>
                    <span className="text-[10px] uppercase font-mono text-stone-400">{dimension.status}</span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">{dimension.description}</p>
                </div>
              ))}
            </div>

            {currentProject.projectIntelligence.researchUniverse.unresolvedQuestions.length > 0 && (
              <div className="pt-3 border-t border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-300 mb-2">Unresolved Research Questions</p>
                <div className="space-y-1.5">
                  {currentProject.projectIntelligence.researchUniverse.unresolvedQuestions.map((q, i) => (
                    <div key={i} className="text-xs text-stone-300 flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.1] p-6 text-center space-y-1">
            <p className="text-xs text-stone-300 font-medium">No research universe mapped yet.</p>
            <p className="text-[11px] text-stone-500">Map the knowledge space first to ground downstream AI generation.</p>
          </div>
        )}
      </BentoCard>

      {/* Error alert banner */}
      {generationError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generationError}</span>
          </div>
          <button onClick={() => setGenerationError(null)} className="text-stone-400 hover:text-white transition-colors">✕</button>
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <BentoCard className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#fbf8f3] leading-none">{questions.length}</h3>
            <p className="text-xs font-semibold text-stone-300 mt-1">Research Questions</p>
            <p className="text-[10px] text-stone-500">{questions.filter(q => q.completed).length} completed</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#fbf8f3] leading-none">
              {verifiedCount}
            </h3>
            <p className="text-xs font-semibold text-stone-300 mt-1">Verified Findings</p>
            <p className="text-[10px] text-emerald-400 font-semibold">{provenanceRate}% Provenance Rate</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#fbf8f3] leading-none">
              {findings.filter(f => f.status === 'Conflicting').length}
            </h3>
            <p className="text-xs font-semibold text-stone-300 mt-1">Conflicting Sources</p>
            <p className="text-[10px] text-amber-300">Surfaced for human review</p>
          </div>
        </BentoCard>

        <BentoCard className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#fbf8f3] leading-none">
              {findings.filter(f => f.status === 'Insufficient Evidence').length}
            </h3>
            <p className="text-xs font-semibold text-stone-300 mt-1">Uncertainty Flagged</p>
            <p className="text-[10px] text-purple-300">Zero fabricated claims</p>
          </div>
        </BentoCard>
      </div>

      {/* Main 2 Column Layout or Empty State */}
      {findings.length === 0 && questions.length === 0 ? (
        <BentoCard className="p-12 text-center border-dashed border-white/[0.12] space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-[#fbf8f3]">No Research Dossier Generated Yet</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Every project begins with zero external claims. Tattava will extract key domains from your premise (<span className="text-amber-300">"{currentProject.title}"</span>) and generate traceable research queries.
            </p>
          </div>
          <div className="pt-2">
            <LineaButton
              variant="primary"
              size="md"
              showWave={isGenerating}
              onClick={handleGenerateResearch}
              disabled={isGenerating}
              icon={<Sparkles className="w-4 h-4 fill-black" />}
            >
              {isGenerating ? 'Synthesizing Project Research...' : 'Generate Project-Specific Research Dossier'}
            </LineaButton>
          </div>
        </BentoCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols): Research Questions Queue */}
          <BentoCard className="lg:col-span-4 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-[#fbf8f3]">Targeted Research Questions</h3>
                <p className="text-[11px] text-stone-400">{questions.filter(q => q.completed).length} of {questions.length} answered</p>
              </div>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleToggleQuestion(q.id)}
                  className={`cursor-pointer flex items-center gap-3 p-3 rounded-2xl border text-xs transition-all ${
                    q.completed
                      ? 'bg-[#0a0c12]/40 border-white/[0.04] text-stone-500'
                      : 'bg-[#0a0c12]/80 border-white/[0.08] text-stone-200 hover:border-amber-500/40'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    q.completed ? 'bg-emerald-500 text-stone-950' : 'border border-white/30'
                  }`}>
                    {q.completed && <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />}
                  </div>
                  <span className={`flex-1 ${q.completed ? 'line-through text-stone-500' : 'font-medium'}`}>
                    {q.title}
                  </span>
                </div>
              ))}

              {showAddQuestion && (
                <form onSubmit={handleAddQuestion} className="pt-2">
                  <input
                    type="text"
                    autoFocus
                    value={newQuestionInput}
                    onChange={(e) => setNewQuestionInput(e.target.value)}
                    placeholder="Type question and hit enter..."
                    className="w-full bg-[#0a0c12] border border-amber-500/50 rounded-full px-4 py-2 text-xs text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none"
                  />
                </form>
              )}
            </div>
          </BentoCard>

          {/* Right Column (8 cols): Traceable Findings Dossier */}
          <div className="lg:col-span-8 space-y-4">
            <BentoCard className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                  Evidence Findings ({filteredFindings.length})
                </span>

                <div className="flex items-center gap-1.5 text-xs overflow-x-auto p-1">
                  {(['All', 'Verified', 'Conflicting', 'Insufficient Evidence'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setFilterType(filter)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                        filterType === filter
                          ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
                          : 'bg-white/[0.04] text-stone-400 hover:text-white border border-white/[0.08]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4-Tier Epistemic Historical Taxonomy Filter */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider shrink-0 font-bold">
                  Epistemic Tier:
                </span>
                {[
                  { id: 'ALL', label: 'All Tiers' },
                  { id: 'DOCUMENTED_FACT', label: 'Tier 1: Documented Fact' },
                  { id: 'SCHOLARLY_DISPUTED', label: 'Tier 2: Scholarly Disputed' },
                  { id: 'MYTHOLOGY_FOLKLORE', label: 'Tier 3: Mythology & Lore' },
                  { id: 'CREATIVE_LICENCE', label: 'Tier 4: Creative Licence' }
                ].map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => setEpistemicFilter(tier.id as any)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all whitespace-nowrap border ${
                      epistemicFilter === tier.id
                        ? tier.id === 'DOCUMENTED_FACT'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                          : tier.id === 'SCHOLARLY_DISPUTED'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                          : tier.id === 'MYTHOLOGY_FOLKLORE'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                          : tier.id === 'CREATIVE_LICENCE'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm'
                          : 'bg-white/20 text-white border-white/40 shadow-sm'
                        : 'bg-white/[0.02] text-stone-500 border-white/5 hover:text-stone-300'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </BentoCard>

            <div className="space-y-4">
              {filteredFindings.map((finding) => {
                const isPromoted = promotedFindingIds.includes(finding.id);
                const epistemic = finding.epistemicType || 'DOCUMENTED_FACT';

                return (
                  <BentoCard
                    key={finding.id}
                    className={`p-5 space-y-3.5 transition-all ${
                      finding.status === 'Insufficient Evidence'
                        ? 'border-purple-500/30 bg-purple-950/15'
                        : finding.status === 'Conflicting'
                        ? 'border-amber-500/30 bg-amber-950/15'
                        : 'hover:border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-stone-400">
                          {finding.id.toUpperCase()} • {finding.topic}
                        </span>

                        {/* Epistemic Taxonomy Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          epistemic === 'DOCUMENTED_FACT' || epistemic === 'SOURCE_FACT'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                            : epistemic === 'SCHOLARLY_DISPUTED'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                            : epistemic === 'MYTHOLOGY_FOLKLORE'
                            ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                            : 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                        }`}>
                          {epistemic === 'DOCUMENTED_FACT' || epistemic === 'SOURCE_FACT'
                            ? 'Tier 1: Documented Fact'
                            : epistemic === 'SCHOLARLY_DISPUTED'
                            ? 'Tier 2: Scholarly Disputed'
                            : epistemic === 'MYTHOLOGY_FOLKLORE'
                            ? 'Tier 3: Mythology & Lore'
                            : 'Tier 4: Creative Licence'}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          finding.status === 'Verified'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : finding.status === 'Conflicting'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        }`}>
                          {finding.status}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-stone-400">
                        {finding.confidence}% Confidence
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#fbf8f3] mb-1.5">
                        {finding.claim}
                      </h4>
                      <p className="text-xs text-stone-300 leading-relaxed bg-[#0a0c12]/70 p-3.5 rounded-2xl border border-white/[0.06]">
                        {finding.evidence}
                      </p>
                    </div>

                    {/* Exact Citation Disclosure */}
                    {finding.exactCitation && (
                      <div className="text-[11px] font-mono text-stone-300 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
                        <span className="text-amber-400 font-bold uppercase text-[9px]">Exact Citation:</span>
                        <span>{finding.exactCitation}</span>
                      </div>
                    )}

                    {finding.evidenceQuote && (
                      <blockquote className="text-xs text-amber-200/90 italic pl-3 border-l-2 border-amber-500/50">
                        "{finding.evidenceQuote}"
                      </blockquote>
                    )}

                    {finding.implicationForPlot && (
                      <div className="text-xs text-stone-300 pt-1">
                        <strong className="text-sky-300">Plot Implication:</strong> {finding.implicationForPlot}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.08] text-xs text-stone-400">
                      <div className="flex items-center gap-3">
                        <span>Source: <strong className="text-[#fbf8f3]">{finding.source}</strong> ({finding.sourceType})</span>
                        {finding.sourceUrl && (
                          <a 
                            href={finding.sourceUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View Provenance</span>
                          </a>
                        )}
                      </div>

                      {finding.status === 'Needs Review' && (
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                          <input
                            value={verificationUrl[finding.id] || ''}
                            onChange={(e) => setVerificationUrl(prev => ({ ...prev, [finding.id]: e.target.value }))}
                            placeholder="Paste source URL after human verification"
                            className="w-64 max-w-full bg-[#0a0c12] border border-amber-500/20 rounded-full px-3 py-1.5 text-xs text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50"
                          />
                          <button
                            onClick={() => handleVerifyFinding(finding)}
                            disabled={!verificationUrl[finding.id]?.trim()}
                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-stone-950 disabled:opacity-40 cursor-pointer"
                          >
                            Verify Source
                          </button>
                        </div>
                      )}

                      {finding.status === 'Verified' && (
                        <button
                          onClick={() => handlePromoteToCanon(finding)}
                          disabled={isPromoted}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isPromoted
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-md shadow-amber-500/20'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>{isPromoted ? 'Committed to Canon' : 'Promote to Canon'}</span>
                        </button>
                      )}
                    </div>
                  </BentoCard>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
