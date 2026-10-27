import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Shield, 
  Clock, 
  Users, 
  ArrowRight, 
  ArrowUp,
  ArrowDown,
  CheckCircle2, 
  X, 
  Film, 
  Tv, 
  FileText, 
  AlertCircle,
  ExternalLink,
  Flame,
  Award,
  Compass,
  Check,
  Landmark,
  Loader2,
  MapPin,
  Tag,
  ChevronRight,
  RefreshCw,
  Star
} from 'lucide-react';
import { ResearchFoundryResult, ResearchStorySeed, HistoricalDomainCandidate } from '../../types/project';
import { useProject } from '../../context/ProjectContext';
import { deepDiveCandidateResearch } from '../../services/aiService';

interface ResearchFoundryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  researchData: ResearchFoundryResult | null;
  topicQuery: string;
}

export const ResearchFoundryModal: React.FC<ResearchFoundryModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  researchData,
  topicQuery
}) => {
  const { startProjectFromResearchSeed } = useProject();
  
  // Local state for research data allowing dynamic deep-dive updates
  const [currentData, setCurrentData] = useState<ResearchFoundryResult | null>(researchData);
  const [candidateList, setCandidateList] = useState<HistoricalDomainCandidate[]>([]);
  const [priorityCandidateId, setPriorityCandidateId] = useState<string>('');
  const [selectedSeedId, setSelectedSeedId] = useState<string>('seed-1');
  const [activeTab, setActiveTab] = useState<'candidates' | 'seeds' | 'timeline' | 'personae' | 'evidence'>('seeds');
  const [selectedCandidate, setSelectedCandidate] = useState<HistoricalDomainCandidate | null>(null);
  const [isDeepDiving, setIsDeepDiving] = useState(false);
  const [deepDivingCandidateName, setDeepDivingCandidateName] = useState<string>('');
  const [candidateFilter, setCandidateFilter] = useState<string>('');

  // Dynamically initialize format choice based strictly on the user's initial input
  const [formatChoice, setFormatChoice] = useState<'Series' | 'Feature Film' | 'Documentary'>(() => {
    if (/movie|film|feature|cinema/i.test(topicQuery)) return 'Feature Film';
    if (/docu|documentary|chronicle/i.test(topicQuery)) return 'Documentary';
    if (/series|episode|anthology|docuseries|season|rajyam/i.test(topicQuery)) return 'Series';
    return 'Series';
  });

  // Synchronize incoming research data
  useEffect(() => {
    if (researchData) {
      setCurrentData(researchData);
      const cands = researchData.candidates || [];
      setCandidateList(cands);
      if (cands.length > 0) {
        setPriorityCandidateId(cands[0].id);
        setActiveTab('candidates');
      } else {
        setActiveTab('seeds');
      }
      if (researchData.dramaticStorySeeds?.[0]) {
        setSelectedSeedId(researchData.dramaticStorySeeds[0].id);
      }
    }
  }, [researchData]);

  // Robust extraction of user-requested episode count
  const extractRequestedCount = (text: string): number | null => {
    const directMatch = text.match(/(\d+)\s*(?:episod(?:e|ic)|part|chapter|temple|kingdom|dynasty|ruler|empire)/i) ||
                        text.match(/(?:top|best|famous|select)\s*(\d+)/i);
    if (directMatch) return parseInt(directMatch[1], 10);
    const wordNumbers: Record<string, number> = {
      three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
      twelve: 12, fourteen: 14, sixteen: 16, twenty: 20
    };
    for (const [word, num] of Object.entries(wordNumbers)) {
      if (new RegExp(`\\b${word}\\s+(?:episod(?:e|ic)|part|chapter|temple|kingdom)\\b`, 'i').test(text) ||
          new RegExp(`\\b(?:top|best)\\s+${word}\\b`, 'i').test(text)) {
        return num;
      }
    }
    return null;
  };

  const detectedEpCount = extractRequestedCount(topicQuery) || 
                          candidateList.length ||
                          extractRequestedCount(currentData?.rootTopic || '') || 
                          extractRequestedCount(currentData?.historicalContext || '');

  const targetEpisodeCount = candidateList.length > 0 
    ? candidateList.length 
    : (detectedEpCount || (formatChoice === 'Series' ? 10 : undefined));

  if (!isOpen) return null;

  const currentSeed = currentData?.dramaticStorySeeds?.find(s => s.id === selectedSeedId) || currentData?.dramaticStorySeeds?.[0];

  // Reorder candidate in the slate
  const moveCandidate = (index: number, direction: 'up' | 'down') => {
    setCandidateList(prev => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleLaunchSeed = (seed: ResearchStorySeed) => {
    if (!currentData) return;
    startProjectFromResearchSeed(seed, topicQuery, currentData, {
      formatChoice,
      customEpisodeCount: formatChoice === 'Series' ? (targetEpisodeCount || 10) : undefined,
      candidateSlate: candidateList.length > 0 ? candidateList : undefined,
      priorityCandidateId: priorityCandidateId || undefined
    });
    onClose();
  };

  // User chooses a candidate and requests an AI-driven deep-dive
  const handleDeepDiveCandidate = async (candidate: HistoricalDomainCandidate) => {
    setSelectedCandidate(candidate);
    setIsDeepDiving(true);
    setDeepDivingCandidateName(candidate.name);
    try {
      const deepDive = await deepDiveCandidateResearch(
        candidate,
        topicQuery,
        formatChoice,
        formatChoice === 'Series' ? targetEpisodeCount : undefined
      );

      setCurrentData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          rootTopic: candidate.name,
          historicalContext: deepDive.historicalContext || candidate.significance,
          evidenceFindings: deepDive.evidenceFindings && deepDive.evidenceFindings.length > 0 ? deepDive.evidenceFindings : prev.evidenceFindings,
          chronologyTimeline: deepDive.chronologyTimeline && deepDive.chronologyTimeline.length > 0 ? deepDive.chronologyTimeline : prev.chronologyTimeline,
          keyPersonae: deepDive.keyPersonae && deepDive.keyPersonae.length > 0 ? deepDive.keyPersonae : prev.keyPersonae,
          dramaticStorySeeds: deepDive.dramaticStorySeeds && deepDive.dramaticStorySeeds.length > 0 ? deepDive.dramaticStorySeeds : prev.dramaticStorySeeds,
          candidates: prev.candidates
        };
      });

      if (deepDive.dramaticStorySeeds?.[0]) {
        setSelectedSeedId(deepDive.dramaticStorySeeds[0].id);
      }
      setActiveTab('seeds');
    } catch (err) {
      console.error('Failed to deep dive candidate:', err);
    } finally {
      setIsDeepDiving(false);
      setDeepDivingCandidateName('');
    }
  };

  // Launch complete slate prioritizing a specific candidate as Episode 1
  const handleLaunchFullSlate = (candidateToPrioritize?: HistoricalDomainCandidate) => {
    if (!currentData) return;
    const prioritized = candidateToPrioritize || 
                        candidateList.find(c => c.id === priorityCandidateId) || 
                        candidateList[0];
    if (!prioritized) return;

    const provTier: 'Tier 1 (Primary Archive)' | 'Tier 2 (Historiography)' | 'Tier 3 (Tradition / Lore)' = 
      prioritized.provenanceTier?.includes('1') ? 'Tier 1 (Primary Archive)' :
      prioritized.provenanceTier?.includes('3') ? 'Tier 3 (Tradition / Lore)' : 'Tier 2 (Historiography)';

    const prioritySeed: ResearchStorySeed = {
      id: `seed-${prioritized.id}`,
      seedTitle: `${prioritized.name}: ${prioritized.category}`,
      conflictType: 'Empire vs Rebellion',
      logline: `In ${prioritized.locationOrRegion} during ${prioritized.eraOrCentury}, the dramatic struggles of ${prioritized.name} reveal ${prioritized.dramaticCoreConflict.toLowerCase()}`,
      dramaticCore: prioritized.dramaticCoreConflict,
      recommendedFormat: formatChoice === 'Series' ? 'Limited Series (8-10 Episodes)' : 'Feature Film',
      unresolvedDebate: `Historical debates and legends concerning patrons (${prioritized.patronOrOrigin}) and the rulers who anchored ${prioritized.name}.`,
      protagonist: {
        name: prioritized.patronOrOrigin || 'Sovereign Leader / Architect',
        role: 'Central Catalyst',
        want: `Solidify the sovereign destiny and cultural legacy of ${prioritized.name}`,
        need: 'Overcome hubris and factional resistance',
        flaw: 'Imperial ambition clashing with strategic and spiritual realities',
        historicalBasis: `${prioritized.patronOrOrigin || 'Historical ruler'} attested in ${prioritized.primaryProvenance}`
      },
      antagonist: {
        name: 'Imperial Rivals & Time',
        role: 'Opposing Dynasty & Subversive Factions',
        opposingIdeology: 'Dismantle royal legacy and divert imperial sovereignty'
      },
      anchorCanonFacts: [
        {
          statement: prioritized.significance,
          category: 'Historical Fact',
          sourceEvidence: prioritized.primaryProvenance,
          provenanceTier: provTier
        },
        {
          statement: `Primary inscription / chronicle: ${prioritized.primaryProvenance}`,
          category: 'Historical Fact',
          sourceEvidence: prioritized.primaryProvenance,
          provenanceTier: provTier
        }
      ]
    };

    startProjectFromResearchSeed(prioritySeed, topicQuery, currentData, {
      formatChoice,
      customEpisodeCount: candidateList.length > 0 ? candidateList.length : targetEpisodeCount,
      candidateSlate: candidateList.length > 0 ? candidateList : undefined,
      priorityCandidateId: prioritized.id
    });
    onClose();
  };

  const hasCandidates = Boolean(candidateList && candidateList.length > 0);
  const filteredCandidates = candidateList.filter(c => {
    if (!candidateFilter.trim()) return true;
    const term = candidateFilter.toLowerCase();
    return c.name.toLowerCase().includes(term) ||
           c.category.toLowerCase().includes(term) ||
           c.locationOrRegion.toLowerCase().includes(term) ||
           c.eraOrCentury.toLowerCase().includes(term) ||
           c.patronOrOrigin.toLowerCase().includes(term) ||
           c.significance.toLowerCase().includes(term);
  });

  const priorityCandidate = candidateList.find(c => c.id === priorityCandidateId) || candidateList[0];
  const priorityEpisodeIndex = candidateList.findIndex(c => c.id === (priorityCandidate?.id || ''));
  const priorityEpNumber = priorityEpisodeIndex >= 0 ? priorityEpisodeIndex + 1 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#1b1411]/98 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden backdrop-blur-2xl">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/[0.08] bg-gradient-to-r from-[#2e241f] via-[#1b1411] to-[#15100e] flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#33cc7a]/15 text-[#33cc7a] text-[11px] font-mono uppercase tracking-wider font-extrabold border border-[#33cc7a]/30 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Research-First Narrative Foundry</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-[#bacde0]/15 text-[#bacde0] text-[11px] font-mono font-semibold border border-[#bacde0]/25">
                {currentData?.eraDomain || 'Historical & Mythological Domain'}
              </span>
              {hasCandidates && (
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-mono font-semibold border border-amber-500/30 flex items-center gap-1">
                  <Landmark className="w-3 h-3 text-amber-400" />
                  <span>{candidateList.length} Candidates Discovered</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-[#faf5f0] font-serif tracking-tight">
              {currentData?.rootTopic || topicQuery || 'Research Universe Discovery'}
            </h2>

            <p className="text-xs md:text-sm text-[#b8aba3] max-w-3xl leading-relaxed">
              {currentData?.historicalContext || 'Synthesizing historical records, archival evidence, and ancient traditions into production-grade dramatic conflict seeds.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#b8aba3] hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Deep Dive Loading Overlay */}
        {isDeepDiving && (
          <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center space-y-4 p-8 text-center animate-fadeIn">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin" />
              <Compass className="w-6 h-6 text-amber-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-bold text-white font-serif">
                Synthesizing Archival Deep-Dive for "{deepDivingCandidateName}"
              </h3>
              <p className="text-xs text-[#b8aba3]">
                Querying epigraphs, dynasty chronologies, personae, and 3 tailored dramatic conflict seeds without hardcoding...
              </p>
            </div>
          </div>
        )}

        {/* Content Body */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#33cc7a]/20 border-t-[#33cc7a] animate-spin" />
              <Compass className="w-8 h-8 text-[#33cc7a] absolute inset-0 m-auto animate-pulse" />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-bold text-white font-serif">Mapping Historical & Cultural Domain...</h3>
              <p className="text-xs text-[#b8aba3]">
                AI is dynamically discovering authentic historical candidates, primary inscriptions, and dramatic conflicts from your input.
              </p>
            </div>

            <div className="flex flex-col gap-2 text-xs font-mono text-[#33cc7a]/90 pt-4">
              <span className="flex items-center gap-2">✓ Detecting domain candidates & chronological anchors</span>
              <span className="flex items-center gap-2">✓ Validating Tier 1 & Tier 2 primary sources</span>
              <span className="flex items-center gap-2 animate-pulse">⚡ Synthesizing comparative options...</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 pb-3 border-b border-white/[0.08] bg-[#15100e] overflow-x-auto">
              {hasCandidates && (
                <button
                  onClick={() => setActiveTab('candidates')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeTab === 'candidates'
                      ? 'bg-amber-400 text-[#1b1411] shadow-lg shadow-amber-400/20 font-extrabold'
                      : 'text-[#b8aba3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  <span>Candidate Subjects ({candidateList.length})</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('seeds')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'seeds'
                    ? 'bg-[#33cc7a] text-[#1b1411] shadow-lg shadow-[#33cc7a]/20 font-extrabold'
                    : 'text-[#b8aba3] hover:text-white hover:bg-white/5'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Dramatic Story Seeds ({currentData?.dramaticStorySeeds?.length || 3})</span>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-[#33cc7a] text-[#1b1411] shadow-lg shadow-[#33cc7a]/20 font-extrabold'
                    : 'text-[#b8aba3] hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Chronology Timeline ({currentData?.chronologyTimeline?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('personae')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'personae'
                    ? 'bg-[#33cc7a] text-[#1b1411] shadow-lg shadow-[#33cc7a]/20 font-extrabold'
                    : 'text-[#b8aba3] hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Historical Personae ({currentData?.keyPersonae?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('evidence')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'evidence'
                    ? 'bg-[#33cc7a] text-[#1b1411] shadow-lg shadow-[#33cc7a]/20 font-extrabold'
                    : 'text-[#b8aba3] hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Evidence Provenance ({currentData?.evidenceFindings?.length || 0})</span>
              </button>

              <div className="ml-auto flex items-center gap-2">
                {hasCandidates && formatChoice === 'Series' ? (
                  <button
                    type="button"
                    onClick={() => handleLaunchFullSlate()}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-black hover:bg-amber-300 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-md shadow-amber-400/20"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                    <span>Launch {candidateList.length}-Ep Slate</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => currentSeed && handleLaunchSeed(currentSeed)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#33cc7a]/15 text-[#33cc7a] hover:bg-[#33cc7a] hover:text-[#1b1411] border border-[#33cc7a]/40 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Start Project Pipeline</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tab Views */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

              {/* TAB 0: HISTORICAL CANDIDATE SUBJECTS */}
              {activeTab === 'candidates' && hasCandidates && (
                <div className="space-y-6">
                  {/* Anthology Prioritization Bar */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-black/50 to-black/70 border border-amber-500/30 shadow-xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-extrabold px-2.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30">
                          {formatChoice === 'Series' ? `Anthology Slate Architecture (${candidateList.length} Episodes)` : 'Domain Discovery Phase'}
                        </span>
                        <span className="text-xs text-white/60">
                          All {candidateList.length} candidates synthesized dynamically
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Landmark className="w-4.5 h-4.5 text-amber-400" />
                        <span>Define Priority & Episode Order</span>
                      </h3>
                      <p className="text-xs text-[#b8aba3]">
                        {formatChoice === 'Series' 
                          ? `Choose which kingdom to develop first (Pilot / Focus Episode). All remaining ${candidateList.length - 1} kingdoms are sequenced into your series slate for step-by-step development.`
                          : 'Select a candidate to deep-dive into its primary epigraphs and dramatic conflict seeds, or enter the pipeline directly.'}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                      <input
                        type="text"
                        placeholder="Filter candidates..."
                        value={candidateFilter}
                        onChange={(e) => setCandidateFilter(e.target.value)}
                        className="px-3.5 py-2 text-xs rounded-xl bg-black/60 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 w-44"
                      />
                      
                      {formatChoice === 'Series' && (
                        <button
                          type="button"
                          onClick={() => handleLaunchFullSlate()}
                          className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-black" />
                          <span>Launch All {candidateList.length} Episodes (Start with Ep {priorityEpNumber})</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Priority Episode Active Callout */}
                  {formatChoice === 'Series' && priorityCandidate && (
                    <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-emerald-300">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                        <span>
                          <strong>Episode 1 Focus:</strong> <span className="text-white font-bold">{priorityCandidate.name}</span> ({priorityCandidate.eraOrCentury}) will open in Step 1 Discovery.
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400/80">
                        Remaining {candidateList.length - 1} episodes will follow in the slate navigator
                      </span>
                    </div>
                  )}

                  {/* Candidate Cards Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {filteredCandidates.map((candidate, idx) => {
                      const actualIndex = candidateList.findIndex(c => c.id === candidate.id);
                      const epNum = actualIndex + 1;
                      const isPriority = priorityCandidate?.id === candidate.id;
                      const isSelected = selectedCandidate?.id === candidate.id;

                      return (
                        <div
                          key={candidate.id}
                          className={`p-6 rounded-2xl border transition-all flex flex-col justify-between text-left space-y-4 ${
                            isPriority
                              ? 'bg-gradient-to-b from-amber-500/20 via-[#1d1916] to-black/95 border-amber-400 ring-2 ring-amber-400/40 shadow-2xl'
                              : isSelected
                              ? 'bg-gradient-to-b from-amber-500/10 via-[#181513] to-black/90 border-amber-500/60'
                              : 'bg-black/50 hover:bg-black/70 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* Card Top Pill Row: Episode Badge + Reorder Controls */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-[11px] font-mono uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                                  isPriority 
                                    ? 'bg-amber-400 text-black border-amber-300 shadow-sm' 
                                    : 'bg-white/10 text-amber-300 border-white/15'
                                }`}>
                                  {isPriority && <Star className="w-3 h-3 fill-current" />}
                                  <span>Episode {epNum} of {candidateList.length}</span>
                                </span>

                                {isPriority && (
                                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Priority First Focus
                                  </span>
                                )}
                              </div>

                              {/* Slate Reordering Controls */}
                              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10">
                                <button
                                  type="button"
                                  onClick={() => moveCandidate(actualIndex, 'up')}
                                  disabled={actualIndex === 0}
                                  className="w-6 h-6 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                                  title="Move Up in Episode Sequence"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveCandidate(actualIndex, 'down')}
                                  disabled={actualIndex === candidateList.length - 1}
                                  className="w-6 h-6 rounded flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-20 cursor-pointer"
                                  title="Move Down in Episode Sequence"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Candidate Name & Location */}
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-xl font-bold text-white font-serif tracking-tight">
                                  {candidate.name}
                                </h4>
                                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                                  {candidate.provenanceTier}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/60 mt-1 font-mono">
                                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] uppercase font-bold">
                                  {candidate.category}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-amber-200/80">
                                  <MapPin className="w-3 h-3 text-amber-400" />
                                  <span>{candidate.locationOrRegion}</span>
                                </span>
                                <span>•</span>
                                <span className="text-white/70">{candidate.eraOrCentury}</span>
                                {candidate.patronOrOrigin && (
                                  <>
                                    <span>•</span>
                                    <span className="text-white/50">Patron: {candidate.patronOrOrigin}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Architectural & Cultural Significance */}
                            <p className="text-xs text-white/80 leading-relaxed">
                              {candidate.significance}
                            </p>

                            {/* Core Dramatic Conflict Callout */}
                            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 space-y-1">
                              <div className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-amber-400 flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5 text-amber-400" />
                                <span>Episode Core Dramatic Tension</span>
                              </div>
                              <p className="text-xs text-white/90 leading-relaxed font-medium">
                                {candidate.dramaticCoreConflict}
                              </p>
                            </div>

                            {/* Archival Citation */}
                            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono text-white/60 flex items-start gap-2">
                              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <div className="truncate">
                                <span className="text-white/40">Primary Source: </span>
                                <span>{candidate.primaryProvenance}</span>
                              </div>
                            </div>

                            {/* Theme Tags */}
                            {candidate.keyThemes && candidate.keyThemes.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {candidate.keyThemes.map((th, tidx) => (
                                  <span key={tidx} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                                    #{th}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-white/10 text-xs">
                            <button
                              type="button"
                              onClick={() => setPriorityCandidateId(candidate.id)}
                              className={`py-2 px-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isPriority 
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 pointer-events-none' 
                                  : 'bg-white/5 hover:bg-white/10 text-amber-300 border border-white/10'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${isPriority ? 'fill-emerald-400' : ''}`} />
                              <span>{isPriority ? 'Priority Focus' : 'Set as Focus'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeepDiveCandidate(candidate)}
                              disabled={isDeepDiving}
                              className="py-2 px-3 rounded-xl font-bold bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Deep-Dive</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleLaunchFullSlate(candidate)}
                              className="py-2 px-3 rounded-xl font-bold bg-amber-400 hover:bg-amber-300 text-black transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                            >
                              <span>Start Pipeline</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* TAB 1: DRAMATIC STORY SEEDS */}
              {activeTab === 'seeds' && (
                <div className="space-y-6">
                  
                  {/* Selected Candidate Banner if user deep dived */}
                  {selectedCandidate && (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-xs text-white">
                          Currently focused on candidate: <strong className="text-amber-300">{selectedCandidate.name}</strong> ({selectedCandidate.eraOrCentury})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('candidates')}
                        className="text-xs text-amber-400 hover:text-amber-300 underline font-mono flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>Switch Candidate</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#33cc7a] font-bold">Stage 2: Narrative Format Architecture</span>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                        <Sparkles className="w-4 h-4 text-[#33cc7a]" />
                        <span>Choose Format for Verified Historical Universe</span>
                      </h3>
                      <p className="text-xs text-[#b8aba3]">
                        Select how you want to develop this research into story deliverables.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 p-1.5 rounded-full bg-[#15100e] border border-white/10 shrink-0">
                      <button
                        type="button"
                        onClick={() => setFormatChoice('Series')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          formatChoice === 'Series'
                            ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                            : 'text-[#b8aba3] hover:text-white'
                        }`}
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>{targetEpisodeCount || 10}-Ep Series</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormatChoice('Feature Film')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          formatChoice === 'Feature Film'
                            ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                            : 'text-[#b8aba3] hover:text-white'
                        }`}
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span>Feature Film</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormatChoice('Documentary')}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          formatChoice === 'Documentary'
                            ? 'bg-amber-400 text-black shadow-md shadow-amber-500/20'
                            : 'text-[#b8aba3] hover:text-white'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Docuseries</span>
                      </button>
                    </div>
                  </div>

                  {/* Seed Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {currentData?.dramaticStorySeeds?.map((seed) => {
                      const isSelected = selectedSeedId === seed.id;
                      return (
                        <div
                          key={seed.id}
                          onClick={() => setSelectedSeedId(seed.id)}
                          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left space-y-4 ${
                            isSelected
                              ? 'bg-gradient-to-b from-amber-500/15 via-[#1a1f2e] to-black/80 border-amber-500 ring-2 ring-amber-500/30 shadow-xl shadow-amber-500/10'
                              : 'bg-black/40 hover:bg-black/60 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                {seed.conflictType}
                              </span>
                              <span className="text-[10px] text-white/70 flex items-center gap-1 font-mono">
                                {formatChoice === 'Series' ? <Tv className="w-3 h-3 text-amber-400" /> : <Film className="w-3 h-3 text-cyan-400" />}
                                <span>{formatChoice === 'Series' ? `${targetEpisodeCount || 10}-Ep Series` : formatChoice}</span>
                              </span>
                            </div>

                            <h4 className="text-lg font-bold text-white font-serif">{seed.seedTitle}</h4>
                            <p className="text-xs text-white/70 line-clamp-3 leading-relaxed">{seed.logline}</p>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-white/10 text-xs">
                            <div className="bg-black/50 p-2.5 rounded-xl border border-white/5 space-y-1">
                              <div className="text-[10px] uppercase font-mono text-amber-400/90 font-bold">
                                Protagonist: {seed.protagonist.name}
                              </div>
                              <div className="text-[11px] text-white/60 line-clamp-2">
                                <span className="text-white/40">Flaw:</span> {seed.protagonist.flaw}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLaunchSeed(seed);
                              }}
                              className={`linea-pill-btn w-full py-2.5 text-xs font-bold gap-1.5 transition-all ${
                                isSelected
                                  ? 'linea-pill-primary'
                                  : 'linea-pill-secondary'
                              }`}
                            >
                              <span>{formatChoice === 'Series' ? `Select & Enter Pipeline (${targetEpisodeCount || 10}-Ep)` : 'Select & Enter Pipeline'}</span>
                              <span className="linea-btn-wave" aria-hidden="true">
                                <span />
                                <span />
                                <span />
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Seed Deep Dive Inspector */}
                  {currentSeed && (
                    <div className="linea-bento p-6 border-amber-500/30 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                        <div>
                          <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                            Seed Deep Dive & Canonical Anchors
                          </div>
                          <h4 className="text-xl font-bold text-[#fbf8f3] font-serif mt-0.5">{currentSeed.seedTitle}</h4>
                        </div>

                        <button
                          onClick={() => handleLaunchSeed(currentSeed)}
                          className="linea-pill-btn linea-pill-primary px-6 py-2.5 text-xs font-bold gap-2 self-start sm:self-auto cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-black" />
                          <span>{formatChoice === 'Series' ? `Lock Direction & Enter Pipeline (${targetEpisodeCount || 10}-Ep)` : 'Lock Direction & Enter Pipeline'}</span>
                          <span className="linea-btn-wave" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                          </span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-3">
                          <div className="bg-[#141824] p-3.5 rounded-xl border border-white/10 space-y-1">
                            <span className="text-[10px] font-mono uppercase text-white/40 font-bold">The Core Human Dilemma</span>
                            <p className="text-white/90 font-medium">{currentSeed.dramaticCore}</p>
                          </div>

                          <div className="bg-[#141824] p-3.5 rounded-xl border border-white/10 space-y-1">
                            <span className="text-[10px] font-mono uppercase text-white/40 font-bold">Central Historical Mystery / Climax</span>
                            <p className="text-amber-200/90">{currentSeed.unresolvedDebate}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="bg-[#141824] p-3.5 rounded-xl border border-white/10 space-y-2">
                            <span className="text-[10px] font-mono uppercase text-white/40 font-bold">Anchor Historical Canon Facts</span>
                            {currentSeed.anchorCanonFacts?.map((fact, idx) => (
                              <div key={idx} className="flex items-start gap-2 pt-1 border-t border-white/5 text-[11px]">
                                <span className="text-emerald-400 shrink-0 font-bold font-mono">[{fact.provenanceTier.split(' ')[0]}]</span>
                                <span className="text-white/80">{fact.statement}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CHRONOLOGY TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Chronological Sequence & Provenance Tiers</span>
                  </h3>

                  <div className="space-y-3 border-l-2 border-amber-500/30 pl-4 ml-2">
                    {currentData?.chronologyTimeline?.map((item, idx) => (
                      <div key={idx} className="relative group p-4 rounded-xl bg-black/40 border border-white/10 space-y-1">
                        <div className="absolute -left-[23px] top-4 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-black" />
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400">{item.date}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">
                            {item.provenanceTier}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-white">{item.event}</h5>
                        <p className="text-xs text-white/60">{item.significance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: HISTORICAL PERSONAE */}
              {activeTab === 'personae' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Key Figures & Dramaturgical Potential</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentData?.keyPersonae?.map((person, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-white font-serif">{person.name}</h5>
                          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {person.role}
                          </span>
                        </div>
                        <div className="text-xs text-white/70">
                          <span className="text-white/40">Allegiance:</span> {person.allegiance}
                        </div>
                        <div className="text-xs text-amber-300/80 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                          <span className="font-bold text-amber-400">Dramatic Dilemma:</span> {person.dramaticPotential}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: EVIDENCE PROVENANCE */}
              {activeTab === 'evidence' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Verified Evidence Matrix (Research Trust Policy §18)</span>
                  </h3>

                  <div className="space-y-3">
                    {currentData?.evidenceFindings?.map((finding) => (
                      <div key={finding.id} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-white">{finding.topic}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {finding.sourceType} • {finding.confidence}% Confidence
                          </span>
                        </div>
                        <p className="text-xs text-white/80">{finding.claim}</p>
                        <div className="text-[11px] text-white/50 font-mono bg-black/50 p-2 rounded border border-white/5">
                          Citation: {finding.source}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
