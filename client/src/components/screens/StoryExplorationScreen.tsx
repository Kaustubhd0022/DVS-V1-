import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  Eye, 
  GitMerge, 
  Plus, 
  Compass, 
  Database, 
  Shield, 
  FileCheck, 
  RefreshCw, 
  AlertCircle,
  X
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { generateStoryDirections, fleshOutStoryDirection } from '../../services/aiService';
import { StoryDirection } from '../../types/project';
import { BranchEvolutionPanel } from './BranchEvolutionPanel';
import { RegenerationReviewPanel } from './RegenerationReviewPanel';
import { LineaButton, BentoCard, LineaCaption, LineaEqualizerWave } from '../common/LineaUI';

export const StoryExplorationScreen: React.FC = () => {
  const { 
    currentProject, 
    updateCurrentProject,
    selectStoryDirection, 
    combineDirections, 
    addCustomStoryDirection,
    setArtifactCandidateState,
    openContextResolver,
    nextStep 
  } = useProject();

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
        projectIntelligence: prev.projectIntelligence
          ? { ...prev.projectIntelligence, directions: prev.projectIntelligence.directions.filter(d => d.status === 'SELECTED') }
          : prev.projectIntelligence,
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

    const dir = directions.find(d => d.id === dirId);
    if (!dir) return;
    updateCurrentProject(prev => {
      const title = dir.title;
      const alreadyCanonical = prev.storyBrain.canonFacts.some(f =>
        (f.tags?.includes('PROJECT_DIRECTION') || f.tags?.includes('Story Direction')) && f.statement.includes(title)
      );
      const alreadyDecided = prev.storyBrain.creativeDecisions.some(d =>
        d.title === `Direction Decision: ${title}` || d.title === `Authoritative Direction: ${title}`
      );
      if (alreadyCanonical && alreadyDecided) return prev;

      const now = new Date().toLocaleDateString();
      const canonFact = alreadyCanonical ? null : {
        id: 'cf-direction-' + Date.now(),
        statement: `Approved Story Direction: ${title}. ${dir.logline}`,
        category: 'Plot Anchor' as const,
        entityIds: [],
        source: 'TATTAVACO_DIRECTION_DECISION',
        dateEstablished: now,
        isLocked: true,
        version: `v1.${prev.storyBrain.canonFacts.length + 1}`,
        tags: ['PROJECT_DIRECTION', 'AUTHOR_APPROVED']
      };
      const decision = alreadyDecided ? null : {
        id: 'cd-direction-' + Date.now(),
        title: `Direction Decision: ${title}`,
        decision: dir.logline,
        rationale: 'Approved by the creator after reviewing the candidate direction, its strengths, risks and open questions.',
        author: prev.owner || 'Project Creator',
        role: 'Creator / Decision Maker',
        date: now,
        status: 'ACCEPTED' as const,
        impactedAreas: ['Story Spine', 'Research', 'Characters', 'World', 'Structure']
      };

      return {
        ...prev,
        storyBrain: {
          ...prev.storyBrain,
          canonFacts: canonFact ? [canonFact, ...prev.storyBrain.canonFacts] : prev.storyBrain.canonFacts,
          creativeDecisions: decision ? [decision, ...prev.storyBrain.creativeDecisions] : prev.storyBrain.creativeDecisions,
          decisionLog: decision ? [decision, ...(prev.storyBrain.decisionLog || [])] : prev.storyBrain.decisionLog,
          lastUpdated: 'Just now'
        }
      };
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Top Bento Hero Banner */}
      <BentoCard className="relative overflow-hidden p-6 lg:p-8 border-white/[0.08]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <LineaCaption variant="amber" icon={<Compass className="w-3.5 h-3.5" />}>
                Flow 3 • Story Development & Candidates
              </LineaCaption>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/[0.04] text-stone-400 border border-white/[0.08]">
                Human Approval Boundary
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fbf8f3]">
              Story Directions & Narrative Engines
            </h1>
            
            <p className="text-xs sm:text-sm text-stone-300/80 max-w-3xl leading-relaxed">
              Story alternatives are candidate proposals until explicitly reviewed and approved into authoritative canon. You can synthesize suggestions or specify your own authorial direction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-semibold px-4 py-2.5 rounded-full transition-all cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Specify Your Own Direction</span>
            </button>

            <LineaButton
              variant="primary"
              size="md"
              showWave={isGenerating}
              onClick={handleGenerateDirections}
              disabled={isGenerating}
              icon={<RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />}
            >
              {isGenerating ? 'Synthesizing Directions...' : 'Synthesize Directions (AI)'}
            </LineaButton>

            <button
              onClick={() => openContextResolver()}
              className="px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-sky-200 border border-white/[0.1] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span>Inspect Context</span>
            </button>

            {directions.length >= 2 && (
              <button
                onClick={() => setShowCombineModal(true)}
                className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-stone-300 px-4 py-2.5 rounded-full transition-all cursor-pointer"
              >
                <GitMerge className="w-3.5 h-3.5 text-amber-400" />
                <span>Synthesize Directions</span>
              </button>
            )}

            <LineaButton
              variant="ghost"
              size="md"
              onClick={nextStep}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Next: Format & Template
            </LineaButton>
          </div>
        </div>
      </BentoCard>

      <BranchEvolutionPanel />
      <RegenerationReviewPanel />

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

      {directions.length === 0 ? (
        <BentoCard className="p-12 text-center border-dashed border-white/[0.12] space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-[#fbf8f3]">No Story Directions Synthesized Yet</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Explore alternative narrative engines derived from <span className="text-amber-300">"{currentProject.title}"</span>, or specify your own authorial direction.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <LineaButton
              variant="primary"
              size="md"
              onClick={() => setShowCustomModal(true)}
              icon={<Compass className="w-4 h-4" />}
            >
              Enter Your Own Direction
            </LineaButton>

            <LineaButton
              variant="ghost"
              size="md"
              showWave={isGenerating}
              onClick={handleGenerateDirections}
              disabled={isGenerating}
              icon={<Sparkles className="w-4 h-4 text-amber-400" />}
            >
              {isGenerating ? 'Synthesizing Directions with AI...' : 'Synthesize 3 Story Directions (AI)'}
            </LineaButton>
          </div>
        </BentoCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8.5 cols): Direction Cards */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {directions.map((dir) => {
                const isSelected = dir.isSelected;
                const isCanonical = dir.candidateState === 'CANONICAL';
                const isCustom = dir.badgeLetter === '★' || dir.tags.includes('User Specified');

                return (
                  <BentoCard
                    key={dir.id}
                    className={`overflow-hidden flex flex-col justify-between transition-all duration-300 p-0 ${
                      isSelected
                        ? 'border-amber-500/60 shadow-xl shadow-black/60 ring-1 ring-amber-500/30'
                        : 'hover:border-white/[0.16]'
                    }`}
                  >
                    {/* Visual Header */}
                    <div className="relative h-40 overflow-hidden bg-slate-900">
                      <img
                        src={dir.imageUrl}
                        alt={dir.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0e1119] via-[#0e1119]/40 to-transparent" />

                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full backdrop-blur-sm border flex items-center justify-center font-bold text-xs ${
                          isCustom 
                            ? 'bg-amber-400 text-stone-950 border-amber-300 font-bold'
                            : 'bg-black/70 text-[#fbf8f3] border-white/20'
                        }`}>
                          {dir.badgeLetter}
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-sm ${
                          isCanonical
                            ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40'
                            : isCustom
                            ? 'bg-amber-500/25 text-amber-200 border-amber-500/40'
                            : 'bg-black/60 text-amber-300 border-amber-500/40'
                        }`}>
                          {isCanonical ? 'CANONICAL' : isCustom ? 'USER SPECIFIED' : (dir.candidateState || 'CANDIDATE')}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap gap-1.5">
                        {dir.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[9px] font-semibold text-stone-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                      <div>
                        <h3 className="text-sm font-bold text-[#fbf8f3] leading-snug">
                          {dir.title}
                        </h3>
                        <p className="text-xs text-stone-300 mt-1.5 line-clamp-3 leading-relaxed">
                          {dir.logline}
                        </p>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-white/[0.06] text-xs">
                        <div className="flex items-center justify-between text-stone-400">
                          <span>Tone:</span>
                          <span className="font-semibold text-stone-200 truncate max-w-[120px]">{dir.tone}</span>
                        </div>
                        <div className="flex items-center justify-between text-stone-400">
                          <span>Stakes:</span>
                          <span className="font-semibold text-amber-300 truncate max-w-[120px]">{dir.stakes}</span>
                        </div>
                        <div className="flex items-center justify-between text-stone-400">
                          <span>Potential:</span>
                          <span className="font-semibold text-emerald-400 truncate max-w-[120px]">{dir.potential}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailedDirectionId(dir.id)}
                            className="flex items-center justify-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-stone-300 hover:text-white py-2 rounded-full border border-white/[0.08] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Rationale</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => selectStoryDirection(dir.id)}
                            className={`flex items-center justify-center gap-1 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
                                : 'bg-white/[0.08] hover:bg-white/[0.15] text-[#fbf8f3]'
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
                            className="w-full py-2 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Approve Direction as Canon</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </BentoCard>
                );
              })}

              {/* Enter Custom Direction Tile */}
              <div 
                onClick={() => setShowCustomModal(true)}
                className="rounded-3xl border border-dashed border-amber-500/30 hover:border-amber-500/60 bg-[#12141a]/60 hover:bg-[#141720] p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all group min-h-[360px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#fbf8f3] group-hover:text-amber-300 transition-colors">
                    Specify Your Own Direction
                  </h4>
                  <p className="text-xs text-stone-400 max-w-[200px] leading-relaxed">
                    Define an original narrative engine or specific authorial concept.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
                  + Enter Direction
                </span>
              </div>
            </div>

            {/* Detailed Direction Deep-Dive Drawer */}
            {detailedDirectionId && (
              <BentoCard className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div>
                    <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">AI Rationale & Trade-Off Analysis</span>
                    <h3 className="text-base font-bold text-[#fbf8f3]">
                      {directions.find(d => d.id === detailedDirectionId)?.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setDetailedDirectionId(null)}
                    className="text-xs text-stone-400 hover:text-white transition-colors"
                  >
                    Close
                  </button>
                </div>

                {(() => {
                  const target = directions.find(d => d.id === detailedDirectionId)!;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2 text-stone-300">
                        <p><strong className="text-[#fbf8f3]">Narrative Engine:</strong> {target.narrativeEngine}</p>
                        <p><strong className="text-[#fbf8f3]">Protagonist Arc:</strong> {target.protagonistArc}</p>
                        <p><strong className="text-[#fbf8f3]">Core Conflict:</strong> {target.conflict}</p>
                        {target.rationale && (
                          <div className="p-3 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] text-amber-200/90 leading-relaxed">
                            <strong className="text-amber-300 block mb-0.5">Grounding Rationale:</strong>
                            {target.rationale}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 text-stone-300">
                        <p><strong className="text-[#fbf8f3]">Stakes:</strong> {target.stakes}</p>
                        <p><strong className="text-[#fbf8f3]">Strengths:</strong> <span className="text-emerald-400">{target.strengths}</span></p>
                        <p><strong className="text-[#fbf8f3]">Identified Risk:</strong> <span className="text-amber-300">{target.risks}</span></p>
                        {target.compTitles && (
                          <p><strong className="text-[#fbf8f3]">Commercial Comps:</strong> {target.compTitles}</p>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </BentoCard>
            )}
          </div>

          {/* Right Column (3.5 cols): Governance & Active Story Rationale */}
          <div className="lg:col-span-4 space-y-4">
            {selectedDirection && (
              <BentoCard className="p-5 space-y-3.5 border-amber-500/30">
                <div className="flex items-center gap-2 text-[#fbf8f3] text-xs font-bold">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Active Canonical Selection</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] space-y-2">
                  <span className="text-xs font-bold text-amber-300 block">{selectedDirection.title}</span>
                  <p className="text-xs text-stone-300 leading-relaxed">{selectedDirection.logline}</p>
                  <div className="text-[10px] text-stone-500 pt-1.5 border-t border-white/[0.06]">
                    Stakes: {selectedDirection.stakes}
                  </div>
                </div>

                <div className="text-xs text-stone-300 space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <span>State:</span>
                    <span className="font-semibold text-emerald-400">{selectedDirection.candidateState || 'CANDIDATE'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Engine:</span>
                    <span className="text-stone-200 font-medium truncate max-w-[180px]">{selectedDirection.narrativeEngine}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Downstream Gate:</span>
                    <span className="text-stone-200 font-medium">Screenplay & Treatment Grounded</span>
                  </div>
                </div>
              </BentoCard>
            )}

            <BentoCard className="p-5 space-y-2.5 text-xs text-stone-300 leading-relaxed">
              <h4 className="font-bold text-[#fbf8f3] flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" />
                Story Agent Operating Contract
              </h4>
              <p className="text-stone-400 leading-relaxed">
                The active Story Direction is injected as the authoritative structural spine into all downstream agents (Character Intelligence, Treatment, Scene Breakdown, Screenplay).
              </p>
            </BentoCard>
          </div>
        </div>
      )}

      {/* CUSTOM DIRECTION MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <BentoCard className="w-full max-w-xl p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto bg-[#0e1119]/95 border-amber-500/40 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                  ★
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#fbf8f3]">
                    Specify Your Own Story Direction
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Your specified direction will be treated as the authoritative primary spine.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCustomModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomDirection} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-stone-200 font-semibold block">
                  Direction Title <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Syndicate Broker: Financial Espionage"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#0a0c12] border border-white/[0.1] text-xs text-[#fbf8f3] focus:border-amber-500/60 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-200 font-semibold block">
                  Core Logline / Premise <span className="text-amber-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. A disgraced corporate auditor is forced to infiltrate a black-budget sovereign fund..."
                  value={customLogline}
                  onChange={e => setCustomLogline(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-[#0a0c12] border border-white/[0.1] text-xs text-[#fbf8f3] focus:border-amber-500/60 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-stone-200 font-semibold block">
                    Narrative Engine / Plot Propulsion
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 72-hour countdown across 3 hubs"
                    value={customNarrativeEngine}
                    onChange={e => setCustomNarrativeEngine(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-[#0a0c12] border border-white/[0.1] text-xs text-[#fbf8f3] focus:border-amber-500/60 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-200 font-semibold block">
                    Tone & Stylistic Reference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grounded Neo-Noir"
                    value={customTone}
                    onChange={e => setCustomTone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-[#0a0c12] border border-white/[0.1] text-xs text-[#fbf8f3] focus:border-amber-500/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-stone-200 font-semibold block">
                    Catastrophic Stakes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Collapse of the domestic digital rupee"
                    value={customStakes}
                    onChange={e => setCustomStakes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-[#0a0c12] border border-white/[0.1] text-xs text-[#fbf8f3] focus:border-amber-500/60 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-200 font-semibold block">
                    Primary Conflict / Antagonism
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Deep State syndicate vs conscience"
                    value={customConflict}
                    onChange={e => setCustomConflict(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-[#0a0c12] border border-white/[0.1] text-xs text-[#fbf8f3] focus:border-amber-500/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={handleFleshOutWithAi}
                  disabled={!customTitle.trim() || !customLogline.trim() || isFleshingOut}
                  className="px-4 py-2.5 rounded-full bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-40 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isFleshingOut ? 'Fleshing Out...' : 'Flesh Out Arcs with AI'}</span>
                </button>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="px-4 py-2 rounded-full text-xs text-stone-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <LineaButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!customTitle.trim() || !customLogline.trim()}
                    icon={<Check className="w-4 h-4 stroke-[2.5]" />}
                  >
                    Adopt as Authoritative Canon
                  </LineaButton>
                </div>
              </div>
            </form>
          </BentoCard>
        </div>
      )}

      {/* SYNTHESIS MODAL */}
      {showCombineModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <BentoCard className="w-full max-w-lg p-6 lg:p-8 space-y-5 bg-[#0e1119]/95 border-amber-500/40 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-[#fbf8f3]">
                  Synthesize Story Directions
                </h3>
              </div>
              <button
                onClick={() => setShowCombineModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-xs text-stone-300">
              Combine the narrative engine of one direction with the emotional core of another to produce Direction D.
            </p>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs text-stone-300 font-semibold block">Combined Concept Title</label>
                <input
                  type="text"
                  value={combinedTitle}
                  onChange={e => setCombinedTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#0a0c12] border border-white/[0.1] text-xs text-[#fbf8f3] focus:outline-none focus:border-amber-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-stone-300 font-semibold block">Direction A (Plot Engine)</label>
                  <select
                    value={selectedForCombine[0]}
                    onChange={e => setSelectedForCombine([e.target.value, selectedForCombine[1]])}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0c12] border border-white/[0.1] text-xs text-[#fbf8f3] focus:outline-none"
                  >
                    {directions.map(d => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-stone-300 font-semibold block">Direction B (Emotional Core)</label>
                  <select
                    value={selectedForCombine[1]}
                    onChange={e => setSelectedForCombine([selectedForCombine[0], e.target.value])}
                    className="w-full px-3 py-2 rounded-xl bg-[#0a0c12] border border-white/[0.1] text-xs text-[#fbf8f3] focus:outline-none"
                  >
                    {directions.map(d => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => setShowCombineModal(false)}
                className="px-4 py-2 rounded-full text-xs text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <LineaButton
                variant="primary"
                size="sm"
                onClick={handleExecuteCombine}
              >
                Generate Synthesis Candidate
              </LineaButton>
            </div>
          </BentoCard>
        </div>
      )}
    </div>
  );
};
