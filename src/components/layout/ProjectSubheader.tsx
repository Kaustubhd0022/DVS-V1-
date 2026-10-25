import React from 'react';
import { 
  Check, 
  ChevronDown, 
  Sparkles, 
  Download, 
  Database,
  ArrowRight
} from 'lucide-react';
import { useProject, ScreenId } from '../../context/ProjectContext';

export interface Milestone {
  id: 'create' | 'explore' | 'develop' | 'validate' | 'greenlight';
  number: number;
  label: string;
  primaryScreen: ScreenId;
  screens: { id: ScreenId; label: string; shortLabel: string }[];
}

export const CREATIVE_MILESTONES: Milestone[] = [
  {
    id: 'create',
    number: 1,
    label: 'Create',
    primaryScreen: 'discovery',
    screens: [
      { id: 'discovery', label: 'Discovery Studio', shortLabel: 'Discovery' },
      { id: 'intake', label: 'Premise Intake', shortLabel: 'Intake' },
      { id: 'story-brain', label: 'Story Brain (System of Record)', shortLabel: 'Story Brain' }
    ]
  },
  {
    id: 'explore',
    number: 2,
    label: 'Explore',
    primaryScreen: 'research',
    screens: [
      { id: 'research', label: 'Traceable Research', shortLabel: 'Research' },
      { id: 'story-exploration', label: 'Story Directions', shortLabel: 'Directions' },
      { id: 'format-template', label: 'Format Model', shortLabel: 'Format' }
    ]
  },
  {
    id: 'develop',
    number: 3,
    label: 'Develop',
    primaryScreen: 'characters',
    screens: [
      { id: 'characters', label: 'Character Intelligence', shortLabel: 'Characters' },
      { id: 'world', label: 'World Building', shortLabel: 'World' },
      { id: 'structure', label: 'Beat Sheet & Structure', shortLabel: 'Structure' },
      { id: 'treatment', label: 'Narrative Treatment', shortLabel: 'Treatment' },
      { id: 'scene-outline', label: 'Scene Outline', shortLabel: 'Scenes' },
      { id: 'screenplay', label: 'Screenplay Drafting', shortLabel: 'Script' },
      { id: 'dialogue', label: 'Dialogue & Subtext', shortLabel: 'Dialogue' }
    ]
  },
  {
    id: 'validate',
    number: 4,
    label: 'Validate',
    primaryScreen: 'continuity',
    screens: [
      { id: 'continuity', label: 'Canon & Continuity', shortLabel: 'Continuity' },
      { id: 'evaluation', label: 'AI Story Evaluation', shortLabel: 'Evaluation' }
    ]
  },
  {
    id: 'greenlight',
    number: 5,
    label: 'Greenlight',
    primaryScreen: 'package',
    screens: [
      { id: 'package', label: 'Story Development Package', shortLabel: 'Package & Greenlight' }
    ]
  }
];

export const ProjectSubheader: React.FC = () => {
  const { 
    currentProject, 
    activeScreen, 
    setActiveScreen,
    toggleCopilot,
    openContextResolver,
    projects,
    openProject
  } = useProject();

  const [showProjectPicker, setShowProjectPicker] = React.useState(false);

  if (activeScreen === 'home') {
    return null;
  }

  const normalizedScreen: ScreenId = activeScreen === 'qa' ? 'continuity' : activeScreen;

  // Identify active milestone
  const activeMilestone = CREATIVE_MILESTONES.find(m => 
    m.screens.some(s => s.id === normalizedScreen)
  ) || CREATIVE_MILESTONES[0];

  return (
    <div className="bg-[#12151c] border-b border-[#222834] px-6 pt-3.5 pb-2.5 select-none sticky top-16 z-20">
      {/* Top row: Project Identity & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        {/* Project Selector / Info */}
        <div className="relative flex items-center gap-3">
          <img 
            src={currentProject.posterUrl} 
            alt={currentProject.title} 
            className="w-8 h-11 object-cover rounded-md border border-[#323b4e] shadow-sm flex-shrink-0" 
          />
          <div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowProjectPicker(!showProjectPicker)}
                className="flex items-center gap-1.5 text-base font-bold text-white hover:text-amber-400 transition-colors"
              >
                <span>{currentProject.title}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {currentProject.canonicalVersion || 'v1.2-canonical'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{currentProject.contentType}</span>
              <span>•</span>
              <span>{currentProject.genre}</span>
              <span>•</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {currentProject.stage}
              </span>
            </div>
          </div>

          {/* Project switch dropdown */}
          {showProjectPicker && (
            <div className="absolute top-12 left-0 w-64 bg-[#181c25] border border-[#2d3648] rounded-xl shadow-2xl p-2 z-50 animate-fadeIn">
              <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1">Switch Project</p>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    openProject(p.id, activeScreen);
                    setShowProjectPicker(false);
                  }}
                  className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                    p.id === currentProject.id ? 'bg-[#222836] text-white font-semibold' : 'text-slate-300 hover:bg-[#1f2430]'
                  }`}
                >
                  <img src={p.posterUrl} alt={p.title} className="w-6 h-8 rounded object-cover" />
                  <div className="truncate">
                    <p className="truncate text-xs text-white">{p.title}</p>
                    <p className="text-[10px] text-slate-400">{p.contentType}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons & Telemetry */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Discovery Loop Status */}
          <div className="hidden md:flex items-center gap-2 bg-black/40 border border-amber-500/25 rounded-xl px-3 py-1 text-[11px] text-white/80">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-amber-300">Phase:</span>
            <span className="text-white/80 font-medium">{activeMilestone.label}</span>
            <span className="text-white/30">•</span>
            <span className="font-mono text-cyan-300">Ambiguity: {currentProject.discovery?.ambiguityLevel ?? 80}%</span>
          </div>

          {/* Pilot Telemetry Quick Tag */}
          <div className="hidden xl:flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-1 text-[11px] text-white/70">
            <span className="text-amber-400 font-bold">Readiness: {Math.round(currentProject.evaluation?.overallScore || 87)}%</span>
            <span className="text-white/30">•</span>
            <span className="text-cyan-300">Verified: {currentProject.pilotMetrics.verificationRate}%</span>
          </div>

          {/* Context Resolver Button */}
          <button 
            onClick={() => openContextResolver()}
            className="flex items-center gap-1.5 bg-[#171b24] hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400/50 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-semibold transition-all shadow-sm"
            title="Inspect Scoped Context Package"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">Context Resolver</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          </button>

          <button 
            onClick={() => setActiveScreen('package')}
            className="flex items-center gap-1.5 bg-[#171b24] hover:bg-[#202532] border border-[#272e3d] text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Package</span>
          </button>

          <button 
            onClick={toggleCopilot}
            className="flex items-center gap-1.5 bg-[#1f2533] hover:bg-[#2a3245] border border-[#37435b] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {/* Bottom row: 5 Creative Milestones & Contextual Subviews */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pt-1 border-t border-white/5">
        {/* The 5 Creative Milestones */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {CREATIVE_MILESTONES.map((milestone, idx) => {
            const isMilestoneActive = milestone.id === activeMilestone.id;
            const isMilestoneCompleted = milestone.number < activeMilestone.number;

            return (
              <React.Fragment key={milestone.id}>
                <button
                  onClick={() => setActiveScreen(milestone.primaryScreen)}
                  className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-xs cursor-pointer ${
                    isMilestoneActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold shadow-sm'
                      : isMilestoneCompleted
                      ? 'text-slate-300 hover:text-white hover:bg-white/5 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                  title={`Stage ${milestone.number}: ${milestone.label}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isMilestoneActive
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                        : isMilestoneCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {isMilestoneCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : milestone.number}
                  </div>
                  <span className="tracking-tight uppercase font-mono text-[11px]">
                    {milestone.label}
                  </span>
                </button>

                {idx < CREATIVE_MILESTONES.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-slate-600 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Contextual Subviews for Current Milestone */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-black/30 p-1 rounded-xl border border-white/5">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 px-2">
            Views:
          </span>
          {activeMilestone.screens.map((subview) => {
            const isCurrentSubview = subview.id === normalizedScreen;

            return (
              <button
                key={subview.id}
                onClick={() => setActiveScreen(subview.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isCurrentSubview
                    ? 'bg-white/15 text-white font-bold border border-white/20 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title={subview.label}
              >
                {subview.shortLabel}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

