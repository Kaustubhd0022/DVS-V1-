import React, { useState } from 'react';
import { useProject, ScreenId, PIPELINE_STEPS } from './context/ProjectContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { ProjectSubheader } from './components/layout/ProjectSubheader';
import { ContextualCopilot } from './components/copilot/ContextualCopilot';
import { ChangeImpactModal } from './components/modals/ChangeImpactModal';

// All 17 Pipeline Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { CreateProjectScreen } from './components/screens/CreateProjectScreen';
import { IntakeScreen } from './components/screens/IntakeScreen';
import { ResearchScreen } from './components/screens/ResearchScreen';
import { StoryExplorationScreen } from './components/screens/StoryExplorationScreen';
import { FormatTemplateScreen } from './components/screens/FormatTemplateScreen';
import { CharacterScreen } from './components/screens/CharacterScreen';
import { WorldScreen } from './components/screens/WorldScreen';
import { StructureScreen } from './components/screens/StructureScreen';
import { TreatmentScreen } from './components/screens/TreatmentScreen';
import { SceneOutlineScreen } from './components/screens/SceneOutlineScreen';
import { ScreenplayScreen } from './components/screens/ScreenplayScreen';
import { DialogueScreen } from './components/screens/DialogueScreen';
import { ContinuityQAScreen } from './components/screens/ContinuityQAScreen';
import { VisualDevScreen } from './components/screens/VisualDevScreen';
import { ProductionPlanningScreen } from './components/screens/ProductionPlanningScreen';
import { PackageDeliveryScreen } from './components/screens/PackageDeliveryScreen';

import { Image, Layers, Sparkles, X, ChevronRight, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const { activeScreen, setActiveScreen, isCopilotOpen, impactState, closeImpactModal } = useProject();
  const [designOverlayPage, setDesignOverlayPage] = useState<number | null>(null);
  const [quickJumpOpen, setQuickJumpOpen] = useState(false);

  // Map active screen to Figma design page number for reference
  const getDesignPageForScreen = (screen: ScreenId): number => {
    switch (screen) {
      case 'home': return 1;
      case 'create-project': return 2;
      case 'intake': return 3;
      case 'research': return 4;
      case 'story-exploration': return 5;
      case 'format-template': return 6;
      case 'characters': return 7;
      case 'world': return 8;
      case 'structure': return 9;
      case 'treatment': return 10;
      case 'scene-outline': return 11;
      case 'screenplay': return 12;
      case 'dialogue': return 13;
      case 'qa': return 14;
      case 'visual-dev': return 15;
      case 'production': return 16;
      case 'package': return 17;
      default: return 1;
    }
  };

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen />;
      case 'create-project':
        return <CreateProjectScreen />;
      case 'intake':
        return <IntakeScreen />;
      case 'research':
        return <ResearchScreen />;
      case 'story-exploration':
        return <StoryExplorationScreen />;
      case 'format-template':
        return <FormatTemplateScreen />;
      case 'characters':
        return <CharacterScreen />;
      case 'world':
        return <WorldScreen />;
      case 'structure':
        return <StructureScreen />;
      case 'treatment':
        return <TreatmentScreen />;
      case 'scene-outline':
        return <SceneOutlineScreen />;
      case 'screenplay':
        return <ScreenplayScreen />;
      case 'dialogue':
        return <DialogueScreen />;
      case 'qa':
        return <ContinuityQAScreen />;
      case 'visual-dev':
        return <VisualDevScreen />;
      case 'production':
        return <ProductionPlanningScreen />;
      case 'package':
        return <PackageDeliveryScreen />;
      default:
        return <HomeScreen />;
    }
  };

  const currentDesignPage = getDesignPageForScreen(activeScreen);

  return (
    <div className="min-h-screen bg-[#0c0e12] text-white flex overflow-x-hidden font-sans selection:bg-amber-500/30 selection:text-white">
      {/* Left Persistent Dark Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <TopHeader />

        {/* Project Pipeline Stepper (Visible when working inside project steps) */}
        {activeScreen !== 'home' && <ProjectSubheader />}

        {/* Main Dynamic View Canvas */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Right Drawer: Contextual Copilot */}
      <ContextualCopilot />

      {/* Flagship Modal: Downstream Change Impact Analysis Engine */}
      {impactState.isOpen && <ChangeImpactModal />}

      {/* Floating Design Reference & Quick Switcher Widget */}
      <div className="fixed bottom-4 left-20 lg:left-64 z-40 flex items-center gap-2">
        <button
          onClick={() => setDesignOverlayPage(currentDesignPage)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white/70 hover:text-white border border-white/10 hover:border-amber-500/40 text-xs shadow-lg backdrop-blur-md transition-all group"
          title="Compare with original Figma screen design"
        >
          <Image className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="font-mono text-[11px]">Compare Page {currentDesignPage < 10 ? `0${currentDesignPage}` : currentDesignPage} Design</span>
        </button>

        <button
          onClick={() => setQuickJumpOpen(!quickJumpOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs shadow-lg backdrop-blur-md transition-all font-semibold"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Jump to Screen</span>
        </button>
      </div>

      {/* Quick Jump Dropdown Menu */}
      {quickJumpOpen && (
        <div className="fixed bottom-14 left-20 lg:left-64 z-50 w-80 max-h-96 overflow-y-auto bg-[#14161f] border border-amber-500/40 rounded-2xl p-2 shadow-2xl shadow-black backdrop-blur-xl animate-fadeIn">
          <div className="p-2 border-b border-white/10 flex items-center justify-between text-xs font-bold text-white">
            <span>tattvaCo 17-Screen Fast Jump</span>
            <button onClick={() => setQuickJumpOpen(false)} className="text-white/40 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="py-1">
            <button
              onClick={() => {
                setActiveScreen('home');
                setQuickJumpOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                activeScreen === 'home' ? 'bg-amber-500 text-black font-bold' : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <span>01. Home Dashboard</span>
              <span className="font-mono text-[10px] opacity-70">Screen 01</span>
            </button>

            {PIPELINE_STEPS.map((step) => {
              const isSelected = activeScreen === step.id;
              const screenNum = step.step + 1;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveScreen(step.id);
                    setQuickJumpOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between ${
                    isSelected ? 'bg-amber-500 text-black font-bold' : 'text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">
                    {screenNum < 10 ? `0${screenNum}` : screenNum}. {step.label}
                  </span>
                  <span className="font-mono text-[10px] opacity-70">
                    Step {step.step}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fullscreen Design Comparison Modal */}
      {designOverlayPage !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 sm:p-8 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 text-white">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500 text-black">
                ORIGINAL FIGMA SPEC
              </span>
              <h3 className="text-base font-bold">
                Page {designOverlayPage < 10 ? `0${designOverlayPage}` : designOverlayPage} Reference Design
              </h3>
            </div>
            <button
              onClick={() => setDesignOverlayPage(null)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img
              src={`/screens/page_${designOverlayPage < 10 ? `0${designOverlayPage}` : designOverlayPage}.png`}
              alt={`Design Reference Page ${designOverlayPage}`}
              className="max-h-[85vh] w-auto rounded-xl border border-white/20 shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
