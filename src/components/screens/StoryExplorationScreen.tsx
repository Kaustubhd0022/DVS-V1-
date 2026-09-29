import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  Eye, 
  GitMerge, 
  Layers, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Compass,
  Database,
  Lock,
  Shield,
  FileCheck,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { generateStoryDirections, fleshOutStoryDirection } from '../../services/aiService';
import { StoryDirection } from '../../types/project';
import { BranchEvolutionPanel } from './BranchEvolutionPanel';
import { RegenerationReviewPanel } from './RegenerationReviewPanel';

export const StoryExplorationScreen: React.FC = () => {
  const { 
    currentProject, 
    updateCurrentProject,
    selectStoryDirection, 
    combineDirections, 
    addCustomStoryDirection,
    setArtifactCandidateState,
    openContextResolver,
    nextStep, 
    prevStep 
  } = useProject();

  const [activeTab, setActiveTab] = useState('Story Directions');
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [selectedForCombine, setSelectedForCombine] = useState<string[]>(['', '']);
  const [combinedTitle, setCombinedTitle] = useState('Synthesized Narrative Engine');
  const [detailedDirectionId, setDetailedDirectionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Custom User Direction Modal State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customLogline, setCustomLogline] = useState('');
  const [customNarrativeEngine, setCustomNarrativeEngine] = useState('');
  const [customTone, setCustomTone] = useState('');
  const [customStakes, setCustomStakes] = useState('');
  const [customConflict, setCustomConflict] = useState('');
  const [isFleshingOut, setIsFleshingOut] = useState(false);

  const directions = currentProject.storyDirections || [];
  const selectedDirection = directions.find(d => d.isSelected) || directions[0] || null;

  const resetCustomForm = () => {
    setCustomTitle('');
    setCustomLogline('');
    setCustomNarrativeEngine('');
    setCustomTone('');
    setCustomStakes('');
    setCustomConflict('');
  };

  const handleGenerateDirections = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const guidance = selectedDirection?.title ? `${selectedDirection.title}: ${selectedDirection.logline}` : undefined;
      const candidates = await generateStoryDirections(currentProject, guidance);
      const mapped: StoryDirection[] = candidates.map((c, idx) => ({
        id: `sd-${(c.badgeLetter || 'A').toLowerCase()}-${Date.now()}-${idx}`,
        badgeLetter: (c.badgeLetter as any) || (idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'),
        title: c.title,
        logline: c.logline,
        genre: currentProject.genre || 'Drama / Thriller',
        narrativeEngine: c.narrativeEngine,
        protagonistArc: c.protagonistArc,
        conflict: c.conflict,
        stakes: c.stakes,
        theme: c.theme,
        tone: c.tone,
        audience: 'Theatrical & Premium OTT',
        potential: 'High commercial & critical narrative potential',
        risks: c.risks,
        strengths: c.strengths,
        tags: [c.badgeLetter || 'A', 'AI Candidate', c.tone ? c.tone.split(',')[0].trim() : 'Drama'],
        imageUrl: idx === 0 
          ? 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
          : idx === 1 
          ? 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop'
          : 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop',
        isSelected: idx === 0,
        candidateState: 'AI_PROPOSAL',
        compTitles: c.compTitles
      }));

      updateCurrentProject(prev => ({
        ...prev,
        storyDirections: mapped,
        selectedDirectionId: mapped[0]?.id || '',
        pilotMetrics: {
          ...prev.pilotMetrics,
          totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
        }
      }));

      if (mapped.length >= 2) {
        setSelectedForCombine([mapped[0].id, mapped[1].id]);
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Failed to synthesize story directions via AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCustomDirection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customLogline.trim()) return;

    addCustomStoryDirection({
      title: customTitle.trim(),
      logline: customLogline.trim(),
      narrativeEngine: customNarrativeEngine.trim() || 'Authorial Narrative Spine',
      tone: customTone.trim() || 'Grounded Drama',
      stakes: customStakes.trim() || 'Core Dramatic Stakes',
      conflict: customConflict.trim() || 'Central Antagonism',
      tags: ['User Specified', 'Authoritative']
    }, true);

    setShowCustomModal(false);
    resetCustomForm();
  };

  const handleFleshOutWithAi = async () => {
    if (!customTitle.trim() || !customLogline.trim()) return;
    setIsFleshingOut(true);
    try {
      const candidate = await fleshOutStoryDirection(currentProject, {
        title: customTitle.trim(),
        logline: customLogline.trim(),
        narrativeEngine: customNarrativeEngine.trim(),
        tone: customTone.trim(),
        stakes: customStakes.trim()
      });

      const newDir: StoryDirection = {
        id: `sd-custom-${Date.now()}`,
        badgeLetter: '★',
        title: candidate.title,
        logline: candidate.logline,
        genre: currentProject.genre || 'Drama / Thriller',
        narrativeEngine: candidate.narrativeEngine,
        protagonistArc: candidate.protagonistArc,
        conflict: candidate.conflict,
        stakes: candidate.stakes,
        theme: candidate.theme,
        tone: candidate.tone,
        audience: 'Theatrical & Premium OTT',
        potential: 'High commercial & critical potential (Authoritative)',
        risks: candidate.risks,
        strengths: candidate.strengths,
        compTitles: candidate.compTitles,
        tags: ['★ User Specified', 'AI Enhanced', candidate.tone.split(',')[0].trim()],
        imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
        isSelected: true,
        candidateState: 'CANONICAL'
      };

      updateCurrentProject(prev => {
        const updatedCanon = [...(prev.storyBrain?.canonFacts || [])];
        const updatedDecisions = [...(prev.storyBrain?.creativeDecisions || prev.storyBrain?.decisionLog || [])];

        updatedCanon.push({
          id: 'cf-' + Date.now(),
          statement: `Story Direction Canon: "${newDir.title}". ${newDir.logline}`,
          category: 'World Rule',
          entityIds: [],
          source: 'USER_SPECIFIED_DIRECTION',
          dateEstablished: new Date().toLocaleDateString(),
          isLocked: true,
          version: 'v1.0',
          tags: ['Story Direction', 'Authoritative']
        });

        updatedDecisions.push({
          id: 'dec-' + Date.now(),
          title: `Authoritative Direction: ${newDir.title}`,
          decision: newDir.title,
          rationale: newDir.logline,
          author: 'Story Creator',
          role: 'Author / Director',
          date: new Date().toLocaleDateString(),
          status: 'ACCEPTED',
          impactedAreas: ['Story Spine', 'Characters', 'Scenes', 'Treatment']
        });

        return {
          ...prev,
          selectedDirectionId: newDir.id,
          storyDirections: [
            ...prev.storyDirections.map(d => ({ ...d, isSelected: false })),
            newDir
          ],
          storyBrain: {
            ...prev.storyBrain,
            canonFacts: updatedCanon,
            creativeDecisions: updatedDecisions,
            decisionLog: updatedDecisions,
            lastUpdated: 'Just now'
          }
        };
      });

      setShowCustomModal(false);
      resetCustomForm();
    } catch (err: any) {
      console.error(err);
      setGenerationError(err?.message || 'Failed to flesh out custom direction with AI');
    } finally {
      setIsFleshingOut(false);
    }
  };

  const handleExecuteCombine = () => {
    if (selectedForCombine[0] && selectedForCombine[1]) {
      combineDirections(selectedForCombine[0], selectedForCombine[1], combinedTitle);
      setShowCombineModal(false);
    }
  };

  const handleApproveAsCanon = (dirId: string) => {
    setArtifactCandidateState('direction', dirId, 'CANONICAL');
  };

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Flow 3 • Story Development & Candidates
            </span>
            <span className="text-xs text-white/40">• Human Approval Boundary</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Story Directions & Narrative Engines
          </h1>
          <p className="text-sm text-white/70 mt-1 max-w-2xl">
            In accordance with Section 8 & 11: Story alternatives are candidate proposals until explicitly reviewed and approved into authoritative canon. You can synthesize suggestions or specify your own authorial direction.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* User Input: Specify your own direction */}
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-2 bg-[#1b212e] hover:bg-[#232b3c] border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Specify Your Own Direction</span>
          </button>

          <button
            onClick={handleGenerateDirections}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing Directions...' : 'Synthesize Directions (AI)'}</span>
          </button>

          <button
            onClick={() => openContextResolver()}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inspect Context</span>
          </button>

          {directions.length >= 2 && (
            <button
              onClick={() => setShowCombineModal(true)}
              className="flex items-center gap-1.5 bg-[#1b212e] hover:bg-[#232b3c] border border-white/10 text-xs font-semibold text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <GitMerge className="w-3.5 h-3.5 text-amber-400" />
              <span>Synthesize Directions</span>
            </button>
          )}

          <button
            onClick={nextStep}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>Next: Format & Template</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <BranchEvolutionPanel />
      <RegenerationReviewPanel />

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

      {directions.length === 0 ? (
        <div className="p-12 text-center bg-[#141822] border border-dashed border-white/10 rounded-3xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">No Story Directions Synthesized Yet</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Explore alternative narrative engines derived from <span className="text-amber-300">"{currentProject.title}"</span>, or specify your own authorial direction.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowCustomModal(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Enter Your Own Direction</span>
            </button>

            <button
              onClick={handleGenerateDirections}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl bg-[#1b212e] hover:bg-[#232b3c] border border-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{isGenerating ? 'Synthesizing Directions with AI...' : 'Synthesize 3 Story Directions (AI)'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8.5 cols): Direction Cards */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {directions.map((dir) => {
                const isSelected = dir.isSelected;
                const isCanonical = dir.candidateState === 'CANONICAL';
                const isCustom = dir.badgeLetter === '★' || dir.tags.includes('User Specified');

                return (
                  <div
                    key={dir.id}
                    className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#161a25] border-amber-500 shadow-xl shadow-black/50 ring-1 ring-amber-500/40'
                        : 'bg-[#141822] border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Visual Header */}
                    <div className="relative h-40 overflow-hidden bg-slate-900">
                      <img
                        src={dir.imageUrl}
                        alt={dir.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-[#141822]/40 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg backdrop-blur-sm border flex items-center justify-center font-bold text-xs ${
                          isCustom 
                            ? 'bg-amber-500 text-black border-amber-400 font-black'
                            : 'bg-black/70 text-white border-white/20'
                        }`}>
                          {dir.badgeLetter}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border backdrop-blur-sm ${
                          isCanonical
                            ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50'
                            : isCustom
                            ? 'bg-amber-500/30 text-amber-200 border-amber-500/50'
                            : 'bg-black/60 text-amber-300 border-amber-500/40'
                        }`}>
                          {isCanonical ? 'CANONICAL' : isCustom ? 'USER SPECIFIED' : (dir.candidateState || 'CANDIDATE')}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap gap-1.5">
                        {dir.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-semibold text-white">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                      <div>
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {dir.title}
                        </h3>
                        <p className="text-xs text-white/70 mt-1.5 line-clamp-3 leading-relaxed">
                          {dir.logline}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px]">
                        <div className="flex items-center justify-between text-white/60">
                          <span>Tone:</span>
                          <span className="font-semibold text-white truncate max-w-[120px]">{dir.tone}</span>
                        </div>
                        <div className="flex items-center justify-between text-white/60">
                          <span>Stakes:</span>
                          <span className="font-semibold text-amber-300 truncate max-w-[120px]">{dir.stakes}</span>
                        </div>
                        <div className="flex items-center justify-between text-white/60">
                          <span>Commercial Potential:</span>
                          <span className="font-semibold text-emerald-400 truncate max-w-[120px]">{dir.potential}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailedDirectionId(dir.id)}
                            className="flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white py-2 rounded-xl border border-white/10 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Rationale</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => selectStoryDirection(dir.id)}
                            className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-amber-500 text-black shadow-sm'
                                : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Selected</span>
                              </>
                            ) : (
                              <span>Select</span>
                            )}
                          </button>
                        </div>

                        {isSelected && !isCanonical && (
                          <button
                            onClick={() => handleApproveAsCanon(dir.id)}
                            className="w-full py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Approve Direction as Canon</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Enter Custom Direction Tile */}
              <div 
                onClick={() => setShowCustomModal(true)}
                className="rounded-2xl border border-dashed border-amber-500/30 hover:border-amber-500/70 bg-[#141822]/60 hover:bg-[#161b27] p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all group min-h-[360px]"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Specify Your Own Direction
                  </h4>
                  <p className="text-xs text-white/50 max-w-[200px]">
                    Define an original narrative engine or specific authorial concept.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                  + Enter Direction
                </span>
              </div>
            </div>

            {/* Detailed Direction Deep-Dive Drawer */}
            {detailedDirectionId && (
              <div className="bg-[#141822] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">AI Rationale & Trade-Off Analysis</span>
                    <h3 className="text-base font-bold text-white">
                      {directions.find(d => d.id === detailedDirectionId)?.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setDetailedDirectionId(null)}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                {(() => {
                  const target = directions.find(d => d.id === detailedDirectionId)!;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2 text-white/80">
                        <p><strong className="text-white">Narrative Engine:</strong> {target.narrativeEngine}</p>
                        <p><strong className="text-white">Protagonist Arc:</strong> {target.protagonistArc}</p>
                        <p><strong className="text-white">Core Conflict:</strong> {target.conflict}</p>
                        {target.rationale && (
                          <p className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-amber-200/90">
                            <strong className="text-amber-300 block mb-0.5">Grounding Rationale:</strong>
                            {target.rationale}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2 text-white/80">
                        <p><strong className="text-white">Stakes:</strong> {target.stakes}</p>
                        <p><strong className="text-white">Strengths:</strong> <span className="text-emerald-400">{target.strengths}</span></p>
                        <p><strong className="text-white">Identified Risk:</strong> <span className="text-amber-300">{target.risks}</span></p>
                        {target.compTitles && (
                          <p><strong className="text-white">Commercial Comps:</strong> {target.compTitles}</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Right Column (3.5 cols): Governance & Active Story Rationale */}
          <div className="lg:col-span-4 space-y-5">
            {selectedDirection && (
              <div className="bg-[#141822] border border-amber-500/30 rounded-2xl p-5 space-y-3.5 shadow-md">
                <div className="flex items-center gap-2 text-white text-xs font-bold">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Active Canonical Selection</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <span className="text-xs font-bold text-amber-300 block">{selectedDirection.title}</span>
                  <p className="text-xs text-white/80 leading-relaxed">{selectedDirection.logline}</p>
                  <div className="text-[10px] text-white/50 pt-1 border-t border-white/5">
                    Stakes: {selectedDirection.stakes}
                  </div>
                </div>

                <div className="text-xs text-white/70 space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span>State:</span>
                    <span className="font-bold text-emerald-400">{selectedDirection.candidateState || 'CANDIDATE'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="text-white font-medium truncate max-w-[180px]">{selectedDirection.narrativeEngine}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Downstream Gate:</span>
                    <span className="text-white font-medium">Screenplay & Treatment Grounded</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[#141822] border border-white/10 rounded-2xl p-5 space-y-3 shadow-md text-xs text-white/70 leading-relaxed">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Story Agent Operating Contract
              </h4>
              <p>
                The active Story Direction is injected as the authoritative structural spine into all downstream agents (Character Intelligence, Treatment, Scene Breakdown, Screenplay).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DIRECTION MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#141724] border border-amber-500/40 rounded-2xl w-full max-w-xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                  ★
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Specify Your Own Story Direction
                  </h3>
                  <p className="text-[11px] text-white/50">
                    Your specified direction will be treated as the authoritative primary spine.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCustomModal(false)}
                className="text-white/40 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomDirection} className="space-y-3.5 text-xs">
              <div>
                <label className="text-white/80 font-semibold block mb-1">
                  Direction Title <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Syndicate Broker: Financial Espionage"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-white/80 font-semibold block mb-1">
                  Core Logline / Premise <span className="text-amber-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. A disgraced corporate auditor is forced to infiltrate a black-budget sovereign fund, only to uncover that his own family holds the controlling shares."
                  value={customLogline}
                  onChange={e => setCustomLogline(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/80 font-semibold block mb-1">
                    Narrative Engine / Plot Propulsion
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 72-hour countdown across 3 financial hubs"
                    value={customNarrativeEngine}
                    onChange={e => setCustomNarrativeEngine(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-white/80 font-semibold block mb-1">
                    Tone & Stylistic Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grounded Neo-Noir, Paranoia-Infused"
                    value={customTone}
                    onChange={e => setCustomTone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-white/80 font-semibold block mb-1">
                    Catastrophic Stakes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Collapse of the domestic digital rupee + family execution"
                    value={customStakes}
                    onChange={e => setCustomStakes(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-white/80 font-semibold block mb-1">
                    Primary Conflict / Antagonism
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Deep State syndicate vs whistle-blower conscience"
                    value={customConflict}
                    onChange={e => setCustomConflict(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleFleshOutWithAi}
                  disabled={!customTitle.trim() || !customLogline.trim() || isFleshingOut}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isFleshingOut ? 'Fleshing Out...' : 'Flesh Out Arcs with AI'}</span>
                </button>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="px-3 py-2 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!customTitle.trim() || !customLogline.trim()}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md shadow-amber-500/20 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Adopt as Authoritative Canon</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SYNTHESIS MODAL */}
      {showCombineModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#141724] border border-amber-500/40 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitMerge className="w-4 h-4 text-amber-400" />
              Synthesize Story Directions
            </h3>
            <p className="text-xs text-white/70">
              Combine the narrative engine of one direction with the emotional core of another to produce Direction D.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/60 block mb-1">Combined Concept Title</label>
                <input
                  type="text"
                  value={combinedTitle}
                  onChange={e => setCombinedTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/60 block mb-1">Direction A (Plot Engine)</label>
                  <select
                    value={selectedForCombine[0]}
                    onChange={e => setSelectedForCombine([e.target.value, selectedForCombine[1]])}
                    className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                  >
                    {directions.map(d => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-white/60 block mb-1">Direction B (Emotional Core)</label>
                  <select
                    value={selectedForCombine[1]}
                    onChange={e => setSelectedForCombine([selectedForCombine[0], e.target.value])}
                    className="w-full p-2 rounded-lg bg-black/40 border border-white/10 text-xs text-white"
                  >
                    {directions.map(d => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowCombineModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteCombine}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold cursor-pointer"
              >
                Generate Synthesis Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
