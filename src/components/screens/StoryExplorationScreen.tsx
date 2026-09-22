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
  Compass
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const StoryExplorationScreen: React.FC = () => {
  const { 
    currentProject, 
    selectStoryDirection, 
    combineDirections, 
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Step Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest font-extrabold text-[#f25b2a]">
            STEP 4 OF 16
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1 tracking-tight">
            Story Exploration
          </h1>
          <p className="text-sm text-[#8b99ac] mt-1">
            Explore multiple creative directions. Compare, combine, or create a new version. Tattava helps you find the strongest story.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCombineModal(true)}
            className="flex items-center gap-1.5 bg-[#1b212e] hover:bg-[#232b3c] border border-[#2d374a] text-xs font-semibold text-white px-3.5 py-2 rounded-xl transition-all"
          >
            <GitMerge className="w-3.5 h-3.5 text-[#f25b2a]" />
            <span>Combine Directions</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center gap-6 border-b border-[#242c3d] pb-2 text-xs font-semibold">
        {['Story Directions', 'Compare', 'Combine Ideas', 'Saved Concepts (3)', 'Notes'].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'Combine Ideas') setShowCombineModal(true);
            }}
            className={`transition-colors pb-2 ${
              activeTab === tab 
                ? 'text-[#f25b2a] border-b-2 border-[#f25b2a]' 
                : 'text-[#8b99ac] hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8.5 cols): Direction Cards */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {directions.map((dir) => {
              const isSelected = dir.isSelected;

              return (
                <div
                  key={dir.id}
                  className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#161a25] border-[#f25b2a] shadow-glow-orange ring-1 ring-[#f25b2a]/40'
                      : 'bg-[#141822] border-[#242c3d] hover:border-[#354157]'
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

                    {/* Badge Letter */}
                    <div className="absolute top-3 left-3 w-7 h-7 rounded-lg bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                      {dir.badgeLetter}
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
                      <p className="text-xs text-[#9bb0c7] mt-1.5 line-clamp-3 leading-relaxed">
                        {dir.logline}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[#1f2637] text-[11px]">
                      <div className="flex items-center justify-between text-[#7d8c9e]">
                        <span>Tone:</span>
                        <span className="font-semibold text-white truncate max-w-[120px]">{dir.tone}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#7d8c9e]">
                        <span>Audience:</span>
                        <span className="font-semibold text-white truncate max-w-[120px]">{dir.audience}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#7d8c9e]">
                        <span>Potential:</span>
                        <span className="font-semibold text-emerald-400 truncate max-w-[120px]">{dir.potential}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#7d8c9e]">
                        <span>Risks:</span>
                        <span className="text-amber-300 truncate max-w-[120px]">{dir.risks}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setDetailedDirectionId(dir.id)}
                        className="flex items-center justify-center gap-1 bg-[#191f2c] hover:bg-[#222a3b] text-xs font-semibold text-[#a6b6cb] hover:text-white py-2 rounded-xl border border-[#263143] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => selectStoryDirection(dir.id)}
                        className={`flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#f25b2a] text-white shadow-sm'
                            : 'bg-[#202737] hover:bg-[#2b354a] text-white'
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
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Direction Drawer / Modal if clicked */}
          {detailedDirectionId && (
            <div className="bg-[#141822] border border-[#2b3548] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#21293a]">
                <div>
                  <span className="text-[10px] text-[#f25b2a] font-bold uppercase tracking-wider">Direction Deep-Dive</span>
                  <h3 className="text-base font-bold text-white">
                    {directions.find(d => d.id === detailedDirectionId)?.title}
                  </h3>
                </div>
                <button
                  onClick={() => setDetailedDirectionId(null)}
                  className="text-xs text-[#718094] hover:text-white"
                >
                  Close
                </button>
              </div>

              {(() => {
                const target = directions.find(d => d.id === detailedDirectionId)!;
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <p><strong className="text-white">Narrative Engine:</strong> <span className="text-[#a0b0c2]">{target.narrativeEngine}</span></p>
                      <p><strong className="text-white">Protagonist Arc:</strong> <span className="text-[#a0b0c2]">{target.protagonistArc}</span></p>
                      <p><strong className="text-white">Core Conflict:</strong> <span className="text-[#a0b0c2]">{target.conflict}</span></p>
                    </div>
                    <div className="space-y-2">
                      <p><strong className="text-white">Stakes:</strong> <span className="text-[#a0b0c2]">{target.stakes}</span></p>
                      <p><strong className="text-white">Strengths:</strong> <span className="text-emerald-400">{target.strengths}</span></p>
                      <p><strong className="text-white">Identified Risk:</strong> <span className="text-amber-300">{target.risks}</span></p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Right Column (3.5 cols): AI Analysis & Generator */}
        <div className="lg:col-span-4 space-y-5">
          {/* AI Analysis Card */}
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-5 space-y-3.5 shadow-card">
            <div className="flex items-center gap-2 text-white text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Analysis</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Beta
              </span>
            </div>
            <p className="text-xs text-[#a0b2c6] leading-relaxed">
              Based on your project intent, research and themes, these three directions offer distinct creative possibilities.
            </p>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-[#cad5e2]">
              <p className="text-[11px] leading-relaxed text-[#b1becf]">
                <strong>Creative recommendation:</strong> Direction B has the strongest emotional core, while Direction A adds a compelling mystery element. Consider combining both into a hybrid direction.
              </p>
            </div>
          </div>

          {/* Key Themes Across Directions */}
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-5 space-y-3 shadow-card">
            <h4 className="text-xs font-bold text-white">Key Themes Across Directions</h4>
            <div className="space-y-2 text-xs">
              {[
                { title: 'System vs Individual', icon: '⚖️' },
                { title: 'Truth and Consequence', icon: '🔍' },
                { title: 'Identity and Belonging', icon: '🌱' },
                { title: 'Hope amidst Disillusionment', icon: '✨' }
              ].map((theme) => (
                <div key={theme.title} className="flex items-center gap-2.5 p-2 rounded-xl bg-[#181d28] border border-[#273042] text-[#cad5e2]">
                  <span>{theme.icon}</span>
                  <span className="font-medium text-white">{theme.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Generate Alternative Direction CTA */}
          <div className="bg-[#141822] border border-[#242c3d] rounded-2xl p-5 space-y-3 shadow-card text-center">
            <h4 className="text-xs font-bold text-white">Want something different?</h4>
            <p className="text-[11px] text-[#718094]">
              Ask Tattava to create an alternative high-concept direction tailored to your exact notes.
            </p>
            <button
              onClick={() => setShowCombineModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#1f2636] hover:bg-[#273145] text-white border border-[#2e3b52] py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-[#f25b2a]" />
              <span>Generate New Direction</span>
            </button>
          </div>
        </div>
      </div>

      {/* Combine Directions Modal */}
      {showCombineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-[#141822] border border-[#2a3447] rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#21293a]">
              <div className="flex items-center gap-2">
                <GitMerge className="w-4 h-4 text-[#f25b2a]" />
                <h3 className="text-base font-bold text-white">Combine Story Directions</h3>
              </div>
              <button onClick={() => setShowCombineModal(false)} className="text-xs text-[#718094] hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-[#a0b0c2] leading-relaxed">
              Tattava can synthesize elements from multiple directions to create a new, richer Direction D without destroying canonical records.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-white font-semibold mb-1">Combined Concept Title</label>
                <input
                  type="text"
                  value={combinedTitle}
                  onChange={(e) => setCombinedTitle(e.target.value)}
                  className="w-full bg-[#181d28] border border-[#2a3447] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#f25b2a]"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Select Directions to Merge</label>
                <div className="space-y-2">
                  {directions.slice(0, 3).map(dir => (
                    <label
                      key={dir.id}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#181d28] border border-[#273042] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedForCombine.includes(dir.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedForCombine([...selectedForCombine, dir.id]);
                          } else {
                            setSelectedForCombine(selectedForCombine.filter(id => id !== dir.id));
                          }
                        }}
                        className="rounded text-[#f25b2a] focus:ring-[#f25b2a] bg-[#1a202c]"
                      />
                      <span className="font-bold text-white">{dir.title}</span>
                      <span className="text-[#718094]">({dir.genre})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#202737] flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCombineModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#8b99ac] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteCombine}
                className="flex items-center gap-2 bg-[#f25b2a] hover:bg-[#e04b1a] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-glow-orange transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize Direction D</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="pt-4 border-t border-[#222836] flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-[#8b99ac] hover:text-white hover:bg-[#181d28] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-medium">
          <CheckCircle2 className="w-4 h-4" />
          <span>Story direction "{selectedDirection.title}" selected. You can refine or move to format selection.</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-[#718094]">Step 4 of 16</span>
          <button
            type="button"
            onClick={nextStep}
            className="flex items-center gap-2 bg-[#f25b2a] hover:bg-[#e04b1a] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-glow-orange transition-all active:scale-95"
          >
            <span>Continue to Format & Template</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
