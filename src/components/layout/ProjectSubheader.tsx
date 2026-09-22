import React from 'react';
import { 
  Check, 
  ChevronDown, 
  Sparkles, 
  Download, 
  Layers
} from 'lucide-react';
import { useProject, PIPELINE_STEPS } from '../../context/ProjectContext';

export const ProjectSubheader: React.FC = () => {
  const { 
    currentProject, 
    activeScreen, 
    goToStep, 
    toggleCopilot,
    projects,
    openProject
  } = useProject();

  const [showProjectPicker, setShowProjectPicker] = React.useState(false);

  if (activeScreen === 'home') {
    return null;
  }

  const currentStepIndex = (() => {
    const found = PIPELINE_STEPS.find(s => s.id === activeScreen);
    return found ? found.step : 1;
  })();

  return (
    <div className="bg-[#12151c] border-b border-[#222834] px-6 pt-3.5 pb-2.5 select-none sticky top-16 z-10">
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
            <button 
              onClick={() => setShowProjectPicker(!showProjectPicker)}
              className="flex items-center gap-1.5 text-base font-bold text-white hover:text-[#f25b2a] transition-colors"
            >
              <span>{currentProject.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8b96a8]" />
            </button>
            <div className="flex items-center gap-2 text-xs text-[#8b96a8]">
              <span>{currentProject.contentType}</span>
              <span>•</span>
              <span>{currentProject.language}</span>
              <span>•</span>
              <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {currentProject.stage}
              </span>
            </div>
          </div>

          {/* Project switch dropdown */}
          {showProjectPicker && (
            <div className="absolute top-12 left-0 w-64 bg-[#181c25] border border-[#2d3648] rounded-xl shadow-2xl p-2 z-50">
              <p className="text-[10px] uppercase font-bold text-[#717d91] px-2 py-1">Switch Project</p>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    openProject(p.id, activeScreen);
                    setShowProjectPicker(false);
                  }}
                  className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
                    p.id === currentProject.id ? 'bg-[#222836] text-white font-semibold' : 'text-[#a1adb9] hover:bg-[#1f2430]'
                  }`}
                >
                  <img src={p.posterUrl} alt={p.title} className="w-6 h-8 rounded object-cover" />
                  <div className="truncate">
                    <p className="truncate text-xs">{p.title}</p>
                    <p className="text-[10px] text-[#6e7b8f]">{p.contentType}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons on the right */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#171b24] border border-[#272e3d] rounded-xl px-3 py-1.5 text-xs text-[#cad3e0]">
            <Layers className="w-3.5 h-3.5 text-[#f25b2a]" />
            <span className="font-medium">Project Context</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <button 
            onClick={() => goToStep(16)}
            className="flex items-center gap-1.5 bg-[#171b24] hover:bg-[#202532] border border-[#272e3d] text-xs text-[#cad3e0] px-3 py-1.5 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
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

      {/* Bottom row: The 16-Step Pipeline Stepper */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center min-w-max gap-1 px-1 py-1">
          {PIPELINE_STEPS.map((stepItem, index) => {
            const isCompleted = stepItem.step < currentStepIndex;
            const isCurrent = stepItem.step === currentStepIndex;

            return (
              <React.Fragment key={stepItem.id}>
                <button
                  onClick={() => goToStep(stepItem.step)}
                  className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all text-xs ${
                    isCurrent
                      ? 'bg-[#f25b2a]/15 border border-[#f25b2a]/40 text-[#f25b2a] font-bold'
                      : isCompleted
                      ? 'text-[#8b96a8] hover:text-white hover:bg-[#1a1f2b]'
                      : 'text-[#586375] hover:text-[#8b96a8] hover:bg-[#151922]'
                  }`}
                  title={stepItem.label}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isCurrent
                        ? 'bg-[#f25b2a] text-white shadow-glow-orange scale-110'
                        : isCompleted
                        ? 'bg-[#222938] text-emerald-400 border border-emerald-500/40'
                        : 'bg-[#181d26] text-[#6b788c] border border-[#272e3c]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[2.5]" /> : stepItem.step}
                  </div>
                  <span className="whitespace-nowrap tracking-tight">
                    {stepItem.shortLabel}
                  </span>
                </button>

                {index < PIPELINE_STEPS.length - 1 && (
                  <div 
                    className={`w-3 h-[1px] ${
                      isCompleted ? 'bg-emerald-500/40' : 'bg-[#242b3a]'
                    }`} 
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
