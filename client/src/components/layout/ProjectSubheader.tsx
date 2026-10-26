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
    <div className="bg-[#1b1411]/95 border-b border-white/[0.08] px-6 pt-3.5 pb-2.5 select-none sticky top-16 z-20 backdrop-blur-xl transition-colors">
      {/* Top row: Project Identity & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        {/* Project Selector / Info */}
        <div className="relative flex items-center gap-3">
          <img 
            src={currentProject.posterUrl} 
            alt={currentProject.title} 
            className="w-8 h-11 object-cover rounded-xl border border-white/10 shadow-md flex-shrink-0" 
          />
          <div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowProjectPicker(!showProjectPicker)}
                className="flex items-center gap-1.5 text-base font-bold text-[#fbf8f3] hover:text-amber-400 transition-colors"
              >
                <span>{currentProject.title}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {currentProject.canonicalVersion || 'v1.2-canonical'}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span>{currentProject.contentType}</span>
              <span>•</span>
              <span>{currentProject.genre}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {currentProject.stage}
              </span>
            </div>
          </div>

          {/* Project switch dropdown */}
          {showProjectPicker && (
            <div className="absolute top-12 left-0 w-64 bg-[#141824]/95 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-2xl animate-in fade-in zoom-in-95">
              <p className="text-[10px] uppercase font-bold text-stone-400 px-2 py-1 font-mono">Switch Project</p>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    openProject(p.id, activeScreen);
                    setShowProjectPicker(false);
                  }}
                  className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs transition-colors ${
                    p.id === currentProject.id ? 'bg-amber-500/15 text-amber-300 font-semibold' : 'text-stone-300 hover:bg-white/10'
                  }`}
                >
                  <img src={p.posterUrl} alt={p.title} className="w-6 h-8 rounded-lg object-cover" />
                  <div className="truncate">
                    <p className="truncate text-xs text-white">{p.title}</p>
                    <p className="text-[10px] text-stone-400">{p.contentType}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons & Telemetry */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Phase Badge */}
          <div className="hidden md:flex items-center gap-2 bg-[#141824] border border-white/10 rounded-full px-3.5 py-1.5 text-[11px] text-[#fbf8f3]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-amber-300">Phase:</span>
            <span className="text-white/80 font-medium">{activeMilestone.label}</span>
            <span className="text-white/20">•</span>
            <span className="font-mono text-cyan-300">Ambiguity: {currentProject.discovery?.ambiguityLevel ?? 80}%</span>
          </div>

          {/* Pilot Telemetry Quick Tag */}
          <div className="hidden xl:flex items-center gap-2 bg-[#141824] border border-white/10 rounded-full px-3.5 py-1.5 text-[11px] text-stone-300">
            <span className="text-amber-400 font-bold">Readiness: {Math.round(currentProject.evaluation?.overallScore || 87)}%</span>
            <span className="text-white/20">•</span>
            <span className="text-emerald-400 font-semibold">Verified: {currentProject.pilotMetrics.verificationRate}%</span>
          </div>

          {/* Context Resolver Button (Linea Pill) */}
          <button 
            onClick={() => openContextResolver()}
            className="linea-pill-btn linea-pill-secondary px-3.5 py-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 gap-1.5"
            title="Inspect Scoped Context Package"
          >
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Context Resolver</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </button>

          <button 
            onClick={() => setActiveScreen('package')}
            className="linea-pill-btn linea-pill-secondary px-3.5 py-1.5 text-xs text-stone-300 hover:text-white gap-1.5 border border-white/10"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Package</span>
          </button>

          {/* AI Copilot Button with Audio Wave */}
          <button 
            onClick={toggleCopilot}
            className="linea-pill-btn bg-[#33cc7a] text-[#1b1411] hover:bg-[#2eb76e] font-bold px-4 py-1.5 text-xs gap-2 shadow-md shadow-[#33cc7a]/25"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1b1411]" />
            <span>AI Copilot</span>
            <span className="linea-btn-wave text-[#1b1411]" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* Bottom row: 5 Creative Milestones & Contextual Subviews */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pt-2 border-t border-white/[0.06]">
        {/* The 5 Creative Milestones (Linea Pill Chain) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CREATIVE_MILESTONES.map((milestone, idx) => {
            const isMilestoneActive = milestone.id === activeMilestone.id;
            const isMilestoneCompleted = milestone.number < activeMilestone.number;

            return (
              <React.Fragment key={milestone.id}>
                <button
                  onClick={() => setActiveScreen(milestone.primaryScreen)}
                  className={`group flex items-center gap-2 px-3.5 py-1 rounded-full transition-all text-xs cursor-pointer ${
                    isMilestoneActive
                      ? 'bg-[#33cc7a]/20 text-[#33cc7a] border border-[#33cc7a]/50 font-bold shadow-[0_2px_12px_rgba(51,204,122,0.2)]'
                      : isMilestoneCompleted
                      ? 'text-stone-300 hover:text-white hover:bg-white/5 font-semibold'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
                  }`}
                  title={`Stage ${milestone.number}: ${milestone.label}`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isMilestoneActive
                        ? 'bg-[#33cc7a] text-[#1b1411] shadow-md shadow-[#33cc7a]/40'
                        : isMilestoneCompleted
                        ? 'bg-[#33cc7a]/20 text-[#33cc7a] border border-[#33cc7a]/40'
                        : 'bg-white/5 text-stone-400 border border-white/10'
                    }`}
                  >
                    {isMilestoneCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : milestone.number}
                  </div>
                  <span className="tracking-tight uppercase font-mono text-[11px]">
                    {milestone.label}
                  </span>
                </button>

                {idx < CREATIVE_MILESTONES.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-stone-600 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Contextual Subviews for Current Milestone (Linea Bento Pill Capsule) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-[#131724] p-1 rounded-full border border-white/10 shadow-inner">
          <span className="text-[10px] uppercase font-mono font-bold text-stone-400 px-2.5">
            Views:
          </span>
          {activeMilestone.screens.map((subview) => {
            const isCurrentSubview = subview.id === normalizedScreen;

            return (
              <button
                key={subview.id}
                onClick={() => setActiveScreen(subview.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isCurrentSubview
                    ? 'bg-white/15 text-white font-bold border border-white/20 shadow-sm'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
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

