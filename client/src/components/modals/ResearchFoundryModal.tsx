import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Shield, 
  Clock, 
  Users, 
  ArrowRight, 
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
  Check
} from 'lucide-react';
import { ResearchFoundryResult, ResearchStorySeed } from '../../types/project';
import { useProject } from '../../context/ProjectContext';

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
  const [selectedSeedId, setSelectedSeedId] = useState<string>('seed-conscience');
  const [activeTab, setActiveTab] = useState<'seeds' | 'timeline' | 'personae' | 'evidence'>('seeds');

  if (!isOpen) return null;

  const currentSeed = researchData?.dramaticStorySeeds?.find(s => s.id === selectedSeedId) || researchData?.dramaticStorySeeds?.[0];

  const handleLaunchSeed = (seed: ResearchStorySeed) => {
    if (!researchData) return;
    startProjectFromResearchSeed(seed, topicQuery, researchData);
    onClose();
  };

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
                {researchData?.eraDomain || 'Historical & Mythological Domain'}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-[#faf5f0] font-serif tracking-tight">
              {researchData?.rootTopic || topicQuery || 'Research Universe Discovery'}
            </h2>

            <p className="text-xs md:text-sm text-[#b8aba3] max-w-3xl leading-relaxed">
              {researchData?.historicalContext || 'Synthesizing historical records, archival evidence, and ancient traditions into production-grade dramatic conflict seeds.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-[#b8aba3] hover:text-white flex items-center justify-center transition-all shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#33cc7a]/20 border-t-[#33cc7a] animate-spin" />
              <Compass className="w-8 h-8 text-[#33cc7a] absolute inset-0 m-auto animate-pulse" />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-lg font-bold text-white font-serif">Mapping the Historical & Mythological Universe...</h3>
              <p className="text-xs text-[#b8aba3]">
                Searching primary archives, epigraphs, and historiography to uncover the core human and dramatic conflicts.
              </p>
            </div>

            <div className="flex flex-col gap-2 text-xs font-mono text-[#33cc7a]/90 pt-4">
              <span className="flex items-center gap-2">✓ Querying historical chronology & geopolitical arena</span>
              <span className="flex items-center gap-2">✓ Validating Tier 1 & Tier 2 evidence provenance</span>
              <span className="flex items-center gap-2 animate-pulse">⚡ Synthesizing 3 character-driven Story Seeds...</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Navigation Tabs (Linea Pill Capsule) */}
            <div className="flex items-center gap-2 px-6 pt-3 pb-3 border-b border-white/[0.08] bg-[#15100e] overflow-x-auto">
              <button
                onClick={() => setActiveTab('seeds')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'seeds'
                    ? 'bg-[#33cc7a] text-[#1b1411] shadow-lg shadow-[#33cc7a]/20'
                    : 'text-[#b8aba3] hover:text-white hover:bg-white/5'
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Dramatic Story Seeds ({researchData?.dramaticStorySeeds?.length || 3})</span>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-[#33cc7a] text-[#1b1411] shadow-lg shadow-[#33cc7a]/20'
                    : 'text-[#b8aba3] hover:text-white hover:bg-white/5'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Chronology Timeline ({researchData?.chronologyTimeline?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('personae')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'personae'
                    ? 'bg-[#33cc7a] text-[#1b1411] shadow-lg shadow-[#33cc7a]/20'
                    : 'text-[#b8aba3] hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Historical Personae ({researchData?.keyPersonae?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('evidence')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'evidence'
                    ? 'bg-[#33cc7a] text-[#1b1411] shadow-lg shadow-[#33cc7a]/20'
                    : 'text-[#b8aba3] hover:text-white hover:bg-white/5'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Evidence Provenance ({researchData?.evidenceFindings?.length || 0})</span>
              </button>
            </div>

            {/* Tab Views */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* TAB 1: DRAMATIC STORY SEEDS */}
              {activeTab === 'seeds' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#33cc7a]" />
                        <span>Select a Dramatic Story Seed to Construct Your Screenplay</span>
                      </h3>
                      <p className="text-xs text-white/60">
                        Each seed represents a verified human dilemma extracted directly from the historical evidence.
                      </p>
                    </div>
                  </div>

                  {/* Seed Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {researchData?.dramaticStorySeeds?.map((seed) => {
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
                              <span className="text-[10px] text-white/50 flex items-center gap-1">
                                {seed.recommendedFormat.includes('Series') ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                                <span>{seed.recommendedFormat}</span>
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
                              <span>Authorize & Enter Studio</span>
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
                          <span>Lock Story Spine & Launch Film Studio (L3 Gate)</span>
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
                    {researchData?.chronologyTimeline?.map((item, idx) => (
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
                    {researchData?.keyPersonae?.map((person, idx) => (
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
                    {researchData?.evidenceFindings?.map((finding) => (
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
