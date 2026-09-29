import React, { useState } from 'react';
import { useProject } from './context/ProjectContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { ProjectSubheader } from './components/layout/ProjectSubheader';
import { ContextualCopilot } from './components/copilot/ContextualCopilot';
import { ChangeImpactModal } from './components/modals/ChangeImpactModal';
import { ContextResolverModal } from './components/modals/ContextResolverModal';

// Marketing / public product showcase
import { LandingScreen } from './components/screens/LandingScreen';

// V1 Pipeline Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { DiscoveryStudioScreen } from './components/screens/DiscoveryStudioScreen';
import { CreateProjectScreen } from './components/screens/CreateProjectScreen';
import { IntakeScreen } from './components/screens/IntakeScreen';
import { StoryBrainScreen } from './components/screens/StoryBrainScreen';
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
import { EvaluationScreen } from './components/screens/EvaluationScreen';
import { PackageDeliveryScreen } from './components/screens/PackageDeliveryScreen';
import { ErrorBoundary } from './components/layout/ErrorBoundary';

// Deferred / roadmap-compatible screens retained for product preview
import { VisualDevScreen } from './components/screens/VisualDevScreen';
import { ProductionPlanningScreen } from './components/screens/ProductionPlanningScreen';

export const App: React.FC = () => {
  const { activeScreen, setActiveScreen, impactState, isContextResolverOpen } = useProject();
  const [showProduct, setShowProduct] = useState(() => new URLSearchParams(window.location.search).get('studio') === '1');

  if (!showProduct) {
    return <LandingScreen onEnterProduct={() => setShowProduct(true)} />;
  }

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen />;
      case 'discovery':
        return <DiscoveryStudioScreen />;
      case 'create-project':
        return <CreateProjectScreen />;
      case 'intake':
        return <IntakeScreen />;
      case 'story-brain':
        return <StoryBrainScreen />;
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
      case 'continuity':
      case 'qa':
        return <ContinuityQAScreen />;
      case 'evaluation':
        return <EvaluationScreen />;
      case 'package':
        return <PackageDeliveryScreen />;
      case 'visual-dev':
        return <VisualDevScreen />;
      case 'production':
        return <ProductionPlanningScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-white flex overflow-x-hidden font-sans selection:bg-amber-500/30 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopHeader />
        {activeScreen !== 'home' && <ProjectSubheader />}

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <ErrorBoundary
            key={activeScreen}
            fallbackScreen={() => setActiveScreen('discovery')}
          >
            {renderActiveScreen()}
          </ErrorBoundary>
        </main>
      </div>

      <ContextualCopilot />
      {impactState.isOpen && <ChangeImpactModal />}
      {isContextResolverOpen && <ContextResolverModal />}
    </div>
  );
};
