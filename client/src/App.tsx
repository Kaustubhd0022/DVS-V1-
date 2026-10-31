import React, { useEffect } from 'react';
import { useProject } from './context/ProjectContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { ProjectSubheader } from './components/layout/ProjectSubheader';
import { ContextualCopilot } from './components/copilot/ContextualCopilot';
import { ChangeImpactModal } from './components/modals/ChangeImpactModal';
import { ContextResolverModal } from './components/modals/ContextResolverModal';
import { AuthScreen } from './components/screens/AuthScreen';
import { SyncBanner } from './components/layout/SyncBanner';
import { useAuth } from './context/AuthContext';

import { LoginScreen } from './components/screens/LoginScreen';

import { HomeScreen } from './components/screens/HomeScreen';
import { ErrorBoundary } from './components/layout/ErrorBoundary';

// Lazy-loaded pipeline screens for optimal bundle splitting and performance
const DiscoveryStudioScreen = React.lazy(() => import('./components/screens/DiscoveryStudioScreen').then(m => ({ default: m.DiscoveryStudioScreen })));
const CreateProjectScreen = React.lazy(() => import('./components/screens/CreateProjectScreen').then(m => ({ default: m.CreateProjectScreen })));
const IntakeScreen = React.lazy(() => import('./components/screens/IntakeScreen').then(m => ({ default: m.IntakeScreen })));
const StoryBrainScreen = React.lazy(() => import('./components/screens/StoryBrainScreen').then(m => ({ default: m.StoryBrainScreen })));
const ResearchScreen = React.lazy(() => import('./components/screens/ResearchScreen').then(m => ({ default: m.ResearchScreen })));
const StoryExplorationScreen = React.lazy(() => import('./components/screens/StoryExplorationScreen').then(m => ({ default: m.StoryExplorationScreen })));
const FormatTemplateScreen = React.lazy(() => import('./components/screens/FormatTemplateScreen').then(m => ({ default: m.FormatTemplateScreen })));
const CharacterScreen = React.lazy(() => import('./components/screens/CharacterScreen').then(m => ({ default: m.CharacterScreen })));
const WorldScreen = React.lazy(() => import('./components/screens/WorldScreen').then(m => ({ default: m.WorldScreen })));
const StructureScreen = React.lazy(() => import('./components/screens/StructureScreen').then(m => ({ default: m.StructureScreen })));
const TreatmentScreen = React.lazy(() => import('./components/screens/TreatmentScreen').then(m => ({ default: m.TreatmentScreen })));
const SceneOutlineScreen = React.lazy(() => import('./components/screens/SceneOutlineScreen').then(m => ({ default: m.SceneOutlineScreen })));
const ScreenplayScreen = React.lazy(() => import('./components/screens/ScreenplayScreen').then(m => ({ default: m.ScreenplayScreen })));
const DialogueScreen = React.lazy(() => import('./components/screens/DialogueScreen').then(m => ({ default: m.DialogueScreen })));
const ContinuityQAScreen = React.lazy(() => import('./components/screens/ContinuityQAScreen').then(m => ({ default: m.ContinuityQAScreen })));
const EvaluationScreen = React.lazy(() => import('./components/screens/EvaluationScreen').then(m => ({ default: m.EvaluationScreen })));
const PackageDeliveryScreen = React.lazy(() => import('./components/screens/PackageDeliveryScreen').then(m => ({ default: m.PackageDeliveryScreen })));
const VisualDevScreen = React.lazy(() => import('./components/screens/VisualDevScreen').then(m => ({ default: m.VisualDevScreen })));
const ProductionPlanningScreen = React.lazy(() => import('./components/screens/ProductionPlanningScreen').then(m => ({ default: m.ProductionPlanningScreen })));

const ScreenLoadingSkeleton: React.FC = () => (
  <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center space-y-4" role="status">
    <div className="w-12 h-12 rounded-xl bg-[#201815] border border-[#ff5533]/30 flex items-center justify-center shadow-lg shadow-[#ff5533]/5">
      <div className="w-5 h-5 rounded-full border-2 border-[#ff5533] border-t-transparent animate-spin" />
    </div>
    <div className="text-xs uppercase tracking-widest text-[#a89687] font-mono animate-pulse">Loading Studio Module…</div>
  </div>
);

export const App: React.FC = () => {
  const { activeScreen, setActiveScreen, impactState, isContextResolverOpen, sync, nextStep, prevStep } = useProject();
  const auth = useAuth();

  // Global Keyboard Shortcuts (Cmd/Ctrl + ArrowRight for Next Step, Cmd/Ctrl + ArrowLeft for Prev Step)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        if (e.key === 'ArrowRight') nextStep();
        if (e.key === 'ArrowLeft') prevStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextStep, prevStep]);

  // The product opens only for a real Supabase identity. Without Supabase configured the
  // login screen explains that and nothing gets in.
  // A first-time Google identity stays on the login screen until the account is created.
  if (auth.status === 'disabled' || auth.status === 'signed-out' || auth.status === 'needs-account') {
    return <LoginScreen />;
  }
  if (auth.status !== 'ready') {
    return <AuthScreen />;
  }
  if (auth.status === 'ready' && sync.status === 'loading') {
    return (
      <div className="min-h-screen bg-[#1b1411] text-[#b8aba3] flex items-center justify-center text-sm" role="status">
        Loading your projects…
      </div>
    );
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
    <div className="min-h-screen bg-[#15100e] text-[#faf5f0] flex overflow-x-hidden font-sans selection:bg-[#33cc7a]/30 selection:text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopHeader />
        <SyncBanner />
        {activeScreen !== 'home' && <ProjectSubheader />}

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <ErrorBoundary
            key={activeScreen}
            fallbackScreen={() => setActiveScreen('discovery')}
          >
            <React.Suspense fallback={<ScreenLoadingSkeleton />}>
              {renderActiveScreen()}
            </React.Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <ContextualCopilot />
      {impactState.isOpen && <ChangeImpactModal />}
      {isContextResolverOpen && <ContextResolverModal />}
    </div>
  );
};
