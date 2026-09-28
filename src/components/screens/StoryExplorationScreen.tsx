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
  FileCheck
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const StoryExplorationScreen: React.FC = () => {
  const { 
    currentProject, 
    selectStoryDirection, 
    combineDirections, 
    setArtifactCandidateState,
    openContextResolver,
    nextStep, 
    prevStep 
  } = useProject();

  const [activeTab, setActiveTab] = useState('Story Directions');
  const [showCombineModal, setShowCombineModal] = useState(false);
  const [selectedForCombine, setSelectedForCombine] = useState<string[]>(['sd-a', 'sd-b']);
  const [combinedTitle, setCombinedTitle] = useState('Political Thriller × Character Drama');
  const [detailedDirectionId, setDetailedDirectionId] = useState<string | null>(null);

  const directions = currentProject.storyDirections;
  const selectedDirection = directions.find(d => d.isSelected) || directions[0];

  const handleExecuteCombine = () => {
    combineDirections(selectedForCombine[0], selectedForCombine[1], combinedTitle);
    setShowCombineModal(false);
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
            In accordance with Section 8 & 11: Story alternatives are candidate proposals until explicitly reviewed and approved into authoritative canon.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => openContextResolver()}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inspect Injected Context</span>
          </button>

          <button
            onClick={() => setShowCombineModal(true)}
            className="flex items-center gap-1.5 bg-[#1b212e] hover:bg-[#232b3c] border border-white/10 text-xs font-semibold text-white px-3.5 py-2 rounded-xl transition-all"
          >
            <GitMerge className="w-3.5 h-3.5 text-amber-400" />
            <span>Synthesize Directions</span>
          </button>

          <button
            onClick={nextStep}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
          >
            <span>Next: Format & Template</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8.5 cols): Direction Cards */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {directions.map((dir) => {
              const isSelected = dir.isSelected;
              const isCanonical = dir.candidateState === 'CANONICAL';

              return (
                <div
                  key={dir.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#161a25] border-amber-500 shadow-lg shadow-black/50 ring-1 ring-amber-500/40'
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
                      <div className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                        {dir.badgeLetter}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border backdrop-blur-sm ${
                        isCanonical
                          ? 'bg-emerald-500/30 text-emerald-300 border-emerald-500/50'
                          : 'bg-black/60 text-amber-300 border-amber-500/40'
                      }`}>
                        {dir.candidateState || 'CANDIDATE'}
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
                        <span>Audience:</span>
                        <span className="font-semibold text-white truncate max-w-[120px]">{dir.audience}</span>
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
                <span>Downstream Gate:</span>
                <span className="text-white font-medium">Screenplay & Treatment Unlocked</span>
              </div>
            </div>
          </div>

          <div className="bg-[#141822] border border-white/10 rounded-2xl p-5 space-y-3 shadow-md text-xs text-white/70 leading-relaxed">
            <h4 className="font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Story Agent Operating Contract
            </h4>
            <p>
              Story alternatives are produced by the Story Agent resolving context from Story Brain + verified research. 
              The selected direction becomes the structural spine for downstream scenes and beat sheets.
            </p>
          </div>
        </div>
      </div>

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
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold"
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
