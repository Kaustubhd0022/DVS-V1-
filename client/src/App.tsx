import React, { useState, useEffect } from 'react';
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
  const { activeScreen, setActiveScreen, impactState, isContextResolverOpen, sync, nextStep, prevStep } = useProject();
  const auth = useAuth();
  // Master user session (Name, Email, Role)
  const [session, setSession] = useState<any>(() => {
    try {
      const raw = localStorage.getItem('tattava_master_session');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // Keep session in sync with updates across the app (e.g. Sign Out or Profile Edit)
  useEffect(() => {
    const handleSessionUpdate = () => {
      try {
        const raw = localStorage.getItem('tattava_master_session');
        setSession(raw ? JSON.parse(raw) : null);
      } catch {
        setSession(null);
      }
    };
    window.addEventListener('tattava_user_session_updated', handleSessionUpdate);
    return () => window.removeEventListener('tattava_user_session_updated', handleSessionUpdate);
  }, []);

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

  // If there is no active session, show the TattvaCo logo splash followed directly by the login screen
  if (!session) {
    return <LoginScreen onLogin={(user) => setSession(user)} />;
  }

  // Sign-in is required whenever Supabase is configured; otherwise the app runs local-only.
  if (auth.status !== 'disabled' && auth.status !== 'ready') {
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
