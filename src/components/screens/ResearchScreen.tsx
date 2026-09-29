import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Search, 
  Sparkles, 
  ExternalLink, 
  BookOpen, 
  AlertCircle, 
  FileCheck, 
  Video, 
  Link2,
  Users,
  Clapperboard,
  Globe2,
  Filter,
  Shield,
  HelpCircle,
  AlertTriangle,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { ResearchFinding } from '../../types/project';
import { generateResearchTopics } from '../../services/aiService';

export const ResearchScreen: React.FC = () => {
  const { currentProject, addCanonFact, nextStep, openContextResolver, updateCurrentProject, buildResearchUniverse } = useProject();

  const [activeTab, setActiveTab] = useState<'Findings' | 'Questions' | 'Sources'>('Findings');
  const [filterType, setFilterType] = useState<'All' | 'Verified' | 'Conflicting' | 'Insufficient Evidence'>('All');
  const [newQuestionInput, setNewQuestionInput] = useState('');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [promotedFindingIds, setPromotedFindingIds] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isMappingUniverse, setIsMappingUniverse] = useState(false);

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
      const res = await generateResearchTopics(currentProject);
      updateCurrentProject(prev => {
        const newFindings: ResearchFinding[] = (res.topics || []).map((t, idx) => ({
          id: 'rf-' + ((prev.researchFindings?.length || 0) + idx + 1),
          topic: t.topic || 'Domain Research',
          claim: t.claim || '',
          evidence: t.evidence || '',
          source: t.source || 'Domain Literature',
          sourceType: (t.sourceType as any) || 'Established Publication',
          status: 'Needs Review',
          confidence: t.confidence || 0,
          implicationForPlot: t.implicationForPlot || '',
          date: new Date().toLocaleDateString(),
          usedIn: ['Story Context', 'World Grounding']
        }));

        const newQuestions = (res.topics || []).map((t, idx) => ({
          id: 'rq-' + ((prev.researchQuestions?.length || 0) + idx + 1),
          title: `Investigate: ${t.topic}`,
          category: 'Domain Inquiry',
          completed: false
        }));

        return {
          ...prev,
          researchFindings: [...(prev.researchFindings || []), ...newFindings],
          researchQuestions: [...(prev.researchQuestions || []), ...newQuestions],
          pilotMetrics: {
            ...prev.pilotMetrics,
            totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
          }
        };
      });
    } catch (err: any) {
      setGenerationError(err.message || 'AI service error generating research dossier.');
    } finally {
      setIsGenerating(false);
    }
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

  const filteredFindings = filterType === 'All' 
    ? findings 
    : findings.filter(f => f.status === filterType);

  const verifiedCount = findings.filter(f => f.status === 'Verified').length;
  const provenanceRate = findings.length > 0 ? Math.round((verifiedCount / findings.length) * 100) : 0;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Flow 2 • Traceable Research Engine
            </span>
            <span className="text-xs text-white/40">• Project-Specific Grounding</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Traceable Research & Evidence Dossier
          </h1>
          <p className="text-sm text-white/70 mt-1 max-w-2xl">
            Derived directly from <strong className="text-white">"{currentProject.title}"</strong>.
            External claims require verified provenance. Where evidence is uncertain, the system flags insufficient evidence rather than hallucinating facts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateResearch}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing Dossier...' : 'Generate Research Topics (AI)'}</span>
          </button>

          <button
            onClick={() => openContextResolver()}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Inspect Context Package</span>
          </button>
          
          <button
            onClick={nextStep}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
          >
            <span>Next: Story Exploration</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Research Universe — knowledge map before claims */}
      <section className="bg-[#111722] border border-cyan-500/20 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Research Universe</h2>
              <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Knowledge Map
              </span>
            </div>
            <p className="text-[11px] text-white/50 mt-1 max-w-2xl">
              Map what must be understood before Tattava turns research into factual findings. Dimensions are research territories, not verified claims.
            </p>
          </div>
          <button
            onClick={handleBuildResearchUniverse}
            disabled={isMappingUniverse}
            className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-2 disabled:opacity-50"
          >
            <Cpu className={`w-3.5 h-3.5 ${isMappingUniverse ? 'animate-spin' : ''}`} />
            {isMappingUniverse ? 'Mapping Knowledge Space...' : 'Map Research Universe'}
          </button>
        </div>

        {currentProject.projectIntelligence?.researchUniverse?.dimensions?.length ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl bg-black/20 border border-white/5 p-3">
                <p className="text-[9px] uppercase tracking-wider text-white/35">Root Subject</p>
                <p className="text-xs text-white/85 mt-1">{currentProject.projectIntelligence.researchUniverse.rootSubject}</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/5 p-3">
                <p className="text-[9px] uppercase tracking-wider text-white/35">Research Dimensions</p>
                <p className="text-xl font-bold text-cyan-300 mt-1">{currentProject.projectIntelligence.researchUniverse.dimensions.length}</p>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/5 p-3">
                <p className="text-[9px] uppercase tracking-wider text-white/35">Evidence Coverage</p>
                <p className="text-xl font-bold text-white mt-1">{currentProject.projectIntelligence.researchUniverse.coveragePercent}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentProject.projectIntelligence.researchUniverse.dimensions.map((dimension) => (
                <div key={dimension.id} className="rounded-xl bg-black/20 border border-white/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white">{dimension.label}</span>
                    <span className="text-[9px] uppercase text-white/35">{dimension.status}</span>
                  </div>
                  <p className="text-[10px] text-white/50 leading-relaxed mt-1">{dimension.description}</p>
                </div>
              ))}
            </div>

            {currentProject.projectIntelligence.researchUniverse.unresolvedQuestions.length > 0 && (
              <div className="pt-3 border-t border-white/5">
                <p className="text-[9px] uppercase tracking-wider font-bold text-amber-400 mb-2">Unresolved Research Questions</p>
                <div className="space-y-1.5">
                  {currentProject.projectIntelligence.researchUniverse.unresolvedQuestions.map((q, i) => (
                    <div key={i} className="text-[11px] text-white/70 flex gap-2">
                      <span className="text-amber-400">•</span><span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 p-5 text-center">
            <p className="text-xs text-white/55">No research universe mapped yet.</p>
            <p className="text-[10px] text-white/35 mt-1">Start here before generating evidence findings.</p>
          </div>
        )}
      </section>

      {/* Error alert banner */}
      {generationError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generationError}</span>
          </div>
          <button onClick={() => setGenerationError(null)} className="text-white/40 hover:text-white">✕</button>
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141822] border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-none">{questions.length}</h3>
            <p className="text-xs font-semibold text-white/80 mt-0.5">Research Questions</p>
            <p className="text-[10px] text-white/40">{questions.filter(q => q.completed).length} completed</p>
          </div>
        </div>

        <div className="bg-[#141822] border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-none">
              {verifiedCount}
            </h3>
            <p className="text-xs font-semibold text-white/80 mt-0.5">Verified Findings</p>
            <p className="text-[10px] text-emerald-400 font-semibold">{provenanceRate}% Provenance Rate</p>
          </div>
        </div>

        <div className="bg-[#141822] border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-none">
              {findings.filter(f => f.status === 'Conflicting').length}
            </h3>
            <p className="text-xs font-semibold text-white/80 mt-0.5">Conflicting Sources</p>
            <p className="text-[10px] text-amber-300">Surfaced for human decision</p>
          </div>
        </div>

        <div className="bg-[#141822] border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white leading-none">
              {findings.filter(f => f.status === 'Insufficient Evidence').length}
            </h3>
            <p className="text-xs font-semibold text-white/80 mt-0.5">Uncertainty Flagged</p>
            <p className="text-[10px] text-purple-300">Zero fabricated claims</p>
          </div>
        </div>
      </div>

      {/* Main 2 Column Layout or Empty State */}
      {findings.length === 0 && questions.length === 0 ? (
        <div className="p-12 text-center bg-[#141822] border border-dashed border-white/10 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">No Research Dossier Generated Yet</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Every project begins with zero external claims. Tattava will extract key domains from your premise (<span className="text-amber-300">"{currentProject.title}"</span>) and generate traceable research queries.
            </p>
          </div>
          <button
            onClick={handleGenerateResearch}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold flex items-center gap-2 mx-auto shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{isGenerating ? 'Synthesizing Project Research...' : 'Generate Project-Specific Research Dossier'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (4 cols): Research Questions Queue */}
          <div className="lg:col-span-4 bg-[#141822] border border-white/10 rounded-2xl p-5 space-y-4 shadow-md">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Targeted Research Questions</h3>
                <p className="text-[11px] text-white/50">{questions.filter(q => q.completed).length} of {questions.length} answered</p>
              </div>
              <button
                onClick={() => setShowAddQuestion(true)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
              >
                <Plus className="w-4 h-4 text-amber-400" />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleToggleQuestion(q.id)}
                  className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border text-xs transition-all ${
                    q.completed
                      ? 'bg-[#181d28] border-white/5 text-white/50'
                      : 'bg-[#1a202d] border-white/10 text-white hover:border-amber-500/40'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                    q.completed ? 'bg-emerald-500 text-black' : 'border border-white/30'
                  }`}>
                    {q.completed && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                  </div>
                  <span className={`flex-1 ${q.completed ? 'line-through text-white/40' : 'font-medium'}`}>
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
                    className="w-full bg-[#181d28] border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none"
                  />
                </form>
              )}
            </div>
          </div>

          {/* Right Column (8 cols): Traceable Findings Dossier */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131622] p-3 rounded-xl border border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
                Evidence Findings with Source Attribution ({filteredFindings.length})
              </h3>

              <div className="flex items-center gap-1.5 text-xs overflow-x-auto">
                {(['All', 'Verified', 'Conflicting', 'Insufficient Evidence'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterType(filter)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap ${
                      filterType === filter
                        ? 'bg-amber-500 text-black'
                        : 'bg-black/30 text-white/60 hover:text-white border border-white/10'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredFindings.map((finding) => {
                const isPromoted = promotedFindingIds.includes(finding.id);

                return (
                  <div
                    key={finding.id}
                    className={`border rounded-2xl p-5 shadow-lg space-y-3.5 transition-all ${
                      finding.status === 'Insufficient Evidence'
                        ? 'bg-purple-950/20 border-purple-500/30'
                        : finding.status === 'Conflicting'
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-[#141822] border-white/10 hover:border-amber-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/60">
                          {finding.id.toUpperCase()} • {finding.topic}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          finding.status === 'Verified'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : finding.status === 'Conflicting'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        }`}>
                          {finding.status}
                        </span>
                      </div>

                      <span className="text-xs font-mono font-bold text-white/60">
                        {finding.confidence}% Confidence
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white mb-1">
                        {finding.claim}
                      </h4>
                      <p className="text-xs text-white/80 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                        {finding.evidence}
                      </p>
                    </div>

                    {finding.evidenceQuote && (
                      <blockquote className="text-[11px] text-amber-200/90 italic pl-3 border-l-2 border-amber-500/50">
                        "{finding.evidenceQuote}"
                      </blockquote>
                    )}

                    {finding.implicationForPlot && (
                      <div className="text-xs text-white/70 pt-1">
                        <strong className="text-cyan-300">Plot Implication:</strong> {finding.implicationForPlot}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5 text-[11px] text-white/50">
                      <div className="flex items-center gap-3">
                        <span>Source: <strong className="text-white/80">{finding.source}</strong> ({finding.sourceType})</span>
                        {finding.sourceUrl && (
                          <a 
                            href={finding.sourceUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>View Provenance</span>
                          </a>
                        )}
                      </div>

                      {finding.status === 'Verified' && (
                        <button
                          onClick={() => handlePromoteToCanon(finding)}
                          disabled={isPromoted}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                            isPromoted
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500 hover:bg-amber-400 text-black shadow-sm'
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>{isPromoted ? 'Committed to Canon' : 'Promote to Canon'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
