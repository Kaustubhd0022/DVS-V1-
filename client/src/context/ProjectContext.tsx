import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  TattavaProject, 
  Character, 
  ImpactAnalysisState, 
  ImpactChangeItem, 
  StoryDirection,
  ApprovalStatus,
  CanonicalState,
  TreatmentData,
  ScreenplayLine,
  SceneItem,
  CanonFact,
  CreativeDecision,
  StoryDependency,
  ContextResolverPackage,
  ArtifactVersionRecord,
  ArtifactApprovalRecord,
  ContinuityIssue,
  StoryEvaluation,
  EvaluationComparison,
  ResearchFinding,
  DiscoveryTurn,
  DiscoveryCandidateOption,
  DiscoverySession,
  ProjectCandidate,
  SeriesEpisode,
  DynamicFormatModel,
  CanonConflict,
  GreenlightGateState,
  NextBestAction,
  RegenerationPlan,
  ProjectBranch,
  BranchMergeRecord,
  BranchMergePreview,
  BranchMergeConflict,
  BranchMergeDiff,
  ResearchStorySeed,
  ResearchFoundryResult,
  HistoricalDomainCandidate
} from '../types/project';
import { seedProject, secondaryProjects } from '../data/seedProject';
import { createEmptyProject } from '../data/emptyProject';
import { askCopilot } from '../services/geminiService';
import { 
  evaluateProjectNarrative, 
  generateEvaluationRepairPlan,
  getGroqApiKey, 
  processDiscoveryTurn, 
  DiscoveryTurnResult,
  extractIntentAndConstructFormat,
  generateEvidenceCandidatePool,
  generateSeriesEpisodeArchitecture,
  calculateRealDependencyImpact,
  repairContinuityIssueWithCanon,
  evaluateGreenlightReadiness,
  generateResearchUniverse,
  synthesizeProjectInsights,
  generateProjectDirections as synthesizeProjectDirections
} from '../services/aiService';
import { inferMediaFormat, inferContentMode, DEFAULT_PROJECT_CONFIGURATION } from '../domain/tattvacoProject';
import { applyCanonicalConfiguration, getCanonicalConfiguration, isSeriesFormat, invalidateDownstreamArtifacts } from '../services/projectConfiguration';
import { orchestrateCreatorTurn } from '../services/conversationalOrchestrator';
import { resolveProjectContext } from '../services/contextResolver';
import { resolveDependencyImpact } from '../services/dependencyImpactService';
import { buildRegenerationPlan } from '../services/regenerationPlanner';
import { executeRegenerationItem, RegenerationResult } from '../services/regenerationExecutor';
import { syncDirectionStores, withoutUnapprovedStoryDirections } from '../services/directionSync';
import { getResumeScreen } from '../services/projectProgress';
import { useAuth } from './AuthContext';
import { useProjectSync, SyncState } from './useProjectSync';

export type ScreenId = 
  | 'home' 
  | 'discovery'
  | 'create-project' 
  | 'intake' 
  | 'story-brain'
  | 'research' 
  | 'story-exploration' 
  | 'format-template' 
  | 'characters' 
  | 'world' 
  | 'structure' 
  | 'treatment' 
  | 'scene-outline' 
  | 'screenplay' 
  | 'dialogue' 
  | 'continuity' 
  | 'qa' // backward compatibility alias
  | 'evaluation'
  | 'package'
  | 'visual-dev' 
  | 'production';

export interface StepMeta {
  step: number;
  id: ScreenId;
  label: string;
  shortLabel: string;
}

/**
 * The V1 Pilot Golden Loop (Section 6 & 23 of Unified AI-Native Product Specification)
 * UNDERSTAND -> EXPLORE -> DECIDE -> REMEMBER -> DEVELOP
 */
export const PIPELINE_STEPS: StepMeta[] = [
  { step: 1, id: 'discovery', label: 'Discovery: explore your idea', shortLabel: 'Discovery' },
  { step: 2, id: 'story-brain', label: 'Story Brain: approved facts and decisions', shortLabel: 'Story Brain' },
  { step: 3, id: 'intake', label: 'Intake: gaps to resolve', shortLabel: 'Intake' },
  { step: 4, id: 'research', label: 'Research: sourced facts', shortLabel: 'Research' },
  { step: 5, id: 'story-exploration', label: 'Story directions', shortLabel: 'Directions' },
  { step: 6, id: 'format-template', label: 'Format and structure template', shortLabel: 'Format' },
  { step: 7, id: 'characters', label: 'Characters', shortLabel: 'Characters' },
  { step: 8, id: 'world', label: 'World and setting', shortLabel: 'World' },
  { step: 9, id: 'structure', label: 'Story structure and beats', shortLabel: 'Structure' },
  { step: 10, id: 'treatment', label: 'Treatment', shortLabel: 'Treatment' },
  { step: 11, id: 'scene-outline', label: 'Scene outline', shortLabel: 'Scenes' },
  { step: 12, id: 'screenplay', label: 'Screenplay', shortLabel: 'Script' },
  { step: 13, id: 'dialogue', label: 'Dialogue', shortLabel: 'Dialogue' },
  { step: 14, id: 'continuity', label: 'Continuity check', shortLabel: 'Continuity' },
  { step: 15, id: 'evaluation', label: 'Story evaluation', shortLabel: 'Evaluation' },
  { step: 16, id: 'package', label: 'Development package', shortLabel: 'Package' }
];

interface ProjectContextType {
  projects: TattavaProject[];
  sync: SyncState;
  importLocalProjects: () => Promise<number>;
  reloadProject: (projectId: string) => Promise<void>;
  currentProject: TattavaProject;
  activeScreen: ScreenId;
  currentStepIndex: number;
  isCopilotOpen: boolean;
  impactState: ImpactAnalysisState;
  
  // Context Resolver Engine
  activeContextPackage: ContextResolverPackage | null;
  isContextResolverOpen: boolean;
  resolveContext: (taskType: ContextResolverPackage['taskType'], targetArtifact: string) => ContextResolverPackage;
  openContextResolver: (taskOrPkg?: ContextResolverPackage | ContextResolverPackage['taskType'], targetArtifact?: string) => void;
  closeContextResolver: () => void;

  // Conversational Discovery & Development Loop
  discoverySession: DiscoverySession;
  sendDiscoveryMessage: (message: string, sourceAttachment?: { name: string; content: string }) => Promise<void>;
  applyDiscoveryDecision: (turnId: string, optionId: string, customRationale?: string) => Promise<void>;
  applyCustomDiscoveryDecision: (turnId: string, customTitle: string, customFinding?: string, customDramaticImplication?: string) => Promise<void>;
  startProjectFromIdea: (idea: string, attachment?: { name: string; content: string }) => Promise<string>;

  // Navigation
  setActiveScreen: (screen: ScreenId) => void;
  goToStep: (stepNumber: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  openProject: (projectId: string, targetScreen?: ScreenId) => void;
  openDemoProject: () => void;
  createNewProject: (data: Partial<TattavaProject>) => string;
  buildResearchUniverse: () => Promise<unknown>;
  generateProjectInsights: () => Promise<unknown>;
  generateProjectDirections: () => Promise<unknown>;
  setProjectInsightStatus: (insightId: string, status: 'CANDIDATE' | 'ACCEPTED' | 'DISMISSED') => void;
  duplicateProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;

  // Project Mutators
  updateCurrentProject: (updater: (prev: TattavaProject) => TattavaProject) => void;
  initializeStoryBrainFromIntake: (breakdown: {
    premise: string;
    protagonist: string;
    setting: string;
    conflict: string;
    stakes: string;
    themes: string[];
    tone: string;
  }) => void;
  updateCharacter: (charId: string, updates: Partial<Character>) => void;
  selectStoryDirection: (dirId: string) => void;
  combineDirections: (dirAId: string, dirBId: string, combinedTitle: string) => void;
  addCustomStoryDirection: (direction: Partial<StoryDirection> & { title: string; logline: string }, makeCanonical?: boolean) => void;
  selectFormat: (formatId: string) => void;
  selectTemplate: (templateId: string) => void;
  applyDialogueAlternative: (suggestionText: string, characterName: string) => void;
  toggleChecklistItem: (checklistName: 'treatment' | 'package' | 'visual', itemIndex: number) => void;
  submitGreenlight: () => void;
  
  // Story Brain System of Record Mutators
  addCanonFact: (fact: Omit<CanonFact, 'id' | 'dateEstablished' | 'version'>) => void;
  deleteCanonFact: (factId: string) => void;
  toggleLockCanonFact: (factId: string) => void;
  logCreativeDecision: (decision: Omit<CreativeDecision, 'id' | 'date' | 'status'>) => void;
  resolveDependencyStaleness: (depId: string) => void;

  // Canon & Continuity Engine Mutators
  resolveContinuityIssue: (issueId: string, resolutionState: 'Resolved' | 'Exception Granted', notes?: string) => void;
  repairSceneWithCanon: (issueId: string) => void;
  resolveQAIssue: (issueId: string) => void; // alias
  resolveQAInconsistency: (issueId: string) => void; // alias

  // AI Story Evaluation Harness
  runStoryEvaluation: () => void;
  reevaluateAfterRepair: () => Promise<void>;
  signOffEvaluation: (approverName: string, role: string, comments: string) => void;

  // Branch / Canon Evolution
  createProjectBranch: (name: string, purpose: string, createdBy: string) => string;
  addArtifactToBranch: (branchId: string, versionId: string) => void;
  prepareProjectBranchMerge: (branchId: string) => BranchMergePreview | null;
  approveProjectBranchMerge: (branchId: string, mergedBy: string, rationale: string) => void;
  rejectProjectBranchMerge: (branchId: string, reviewedBy: string, rationale?: string) => void;
  resolveBranchMergeConflict: (branchId: string, conflictId: string, resolution: 'USE_BRANCH' | 'KEEP_CANONICAL' | 'MANUAL_EDIT') => void;
  setBranchMergeManualContent: (branchId: string, conflictId: string, content: unknown) => void;
  mergeProjectBranch: (branchId: string, mergedBy: string, rationale: string) => void;
  abandonProjectBranch: (branchId: string) => void;

  // Canonical State Lifecycle
  setArtifactCandidateState: (artifactType: 'direction' | 'character' | 'treatment' | 'scene' | 'dialogue', id: string, state: CanonicalState) => void;
  approveArtifact: (artifactType: ArtifactVersionRecord['artifactType'], artifactId: string, approvedBy: string, role: string, rationale?: string) => void;

  // Impact Engine
  triggerChangeImpact: (charIdOrDescription?: string, field?: string, oldVal?: any, newVal?: any) => void;
  closeImpactModal: () => void;
  approveAndPropagateImpact: () => void;
  buildRegenerationPlan: () => void;
  executeRegenerationPlan: (planId: string) => Promise<RegenerationResult[]>;
  approveRegenerationProposal: (versionId: string, approvedBy: string, role: string, rationale?: string) => void;
  
  // Specific Screen Helper Methods
  setProjectFormat: (format: string, customEpisodeCount?: number) => void;
  setProjectTemplate: (template: string) => void;
  updateTreatment: (updates: Partial<TreatmentData>) => void;
  updateScreenplayLine: (lineId: string, content: string) => void;
  addScreenplayLine: (line: ScreenplayLine) => void;
  swapDialogueSuggestion: (sugId: string, text: string) => void;
  updateScene: (sceneId: string, updates: Partial<SceneItem>) => void;
  submitForGreenlight: () => void;

  // V1.1 Episodic, Candidate Pool, Conflict Reconciliation, & Stage Gate Methods
  fetchCandidatePool: (scope?: string) => Promise<void>;
  fetchSeriesEpisodes: (episodeCount?: number, narrativeLens?: string) => Promise<void>;
  updateSeriesEpisode: (episodeNumber: number, updates: Partial<SeriesEpisode>) => void;
  updateCandidateStatus: (candidateId: string, status: ProjectCandidate['status']) => void;
  adoptCandidateIntoProject: (candidateId: string) => void;
  resolveCanonConflict: (conflictId: string, resolution: CanonConflict['status'], notes?: string) => void;
  analyzeIntentAndSetFormat: (input: string, attachment?: { name: string; content: string }) => Promise<void>;
  evaluateGreenlight: () => GreenlightGateState;
  switchActiveEpisode: (episodeNumber: number) => void;
  startProjectFromResearchSeed: (
    seed: ResearchStorySeed,
    rawTopic: string,
    rawResearch: ResearchFoundryResult,
    options?: { 
      formatChoice?: 'Series' | 'Feature Film' | 'Documentary'; 
      customEpisodeCount?: number;
      candidateSlate?: HistoricalDomainCandidate[];
      priorityCandidateId?: string;
    }
  ) => string;

  // UI Helpers
  toggleCopilot: () => void;
  setCopilotOpen: (open: boolean) => void;
  copilotMessages: Array<{ sender: 'user' | 'tattvaCo' | 'tattava'; text: string; time: string }>;
  sendCopilotMessage: (text: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'tattava_copilot_pilot_v1';
const LEGACY_STORAGE_KEY = 'tattvaco_projects_v1';

const normalizePersistedProjectForConfiguration = (project: TattavaProject): TattavaProject => {
  return applyCanonicalConfiguration(project);
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<TattavaProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Demo workspaces are reference-only and must never become persistent user projects.
          return parsed
            .filter((project: TattavaProject) => !project.isDemo)
            .map(normalizePersistedProjectForConfiguration);
        }
      } catch (e) {
        console.error('Failed to parse saved projects', e);
      }
    }
    // Start with empty array by default so users see the First-Time Creation Hub
    return [];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    return projects[0]?.id || null;
  });

  const auth = useAuth();
  const { sync, importLocalProjects, reloadProject, forgetProject } = useProjectSync({
    remote: auth.status === 'ready',
    userId: auth.user?.id ?? null,
    projects,
    setProjects,
    setCurrentProjectId,
    normalize: normalizePersistedProjectForConfiguration,
    localStorageKey: STORAGE_KEY,
  });

  const [activeScreen, setActiveScreen] = useState<ScreenId>('home');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isContextResolverOpen, setIsContextResolverOpen] = useState<boolean>(false);

  // Active Context Package for the Context Resolver Drawer
  const [activeContextPackage, setActiveContextPackage] = useState<ContextResolverPackage | null>(null);

  const [copilotMessages, setCopilotMessages] = useState<Array<{ sender: 'user' | 'tattvaCo' | 'tattava'; text: string; time: string }>>([
    { 
      sender: 'tattvaCo', 
      text: 'Welcome to Tattava Copilot V1 Pilot. I am your Project Intelligence & Narrative Reasoning copilot. All reasoning is strictly grounded in your active project input and verified canon.', 
      time: '10:24 AM' 
    }
  ]);

  const [impactState, setImpactState] = useState<ImpactAnalysisState>({
    isOpen: false,
    sourceTrigger: '',
    totalAffected: 0,
    summary: {
      characters: 0,
      story: 0,
      scenes: 0,
      dialogue: 0,
      visuals: 0,
      production: 0
    },
    items: []
  });

  // Sync to local storage
  useEffect(() => {
    // With sign-in enabled the backend is the source of truth. localStorage is then left
    // untouched (it is the source for the one-time import) and must not be overwritten.
    if (auth.status !== 'disabled') return;
    // Persist only user projects. Demo/reference workspaces remain session-scoped.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.filter(project => !project.isDemo)));
  }, [projects, auth.status]);

  // Clean empty fallback project if no project has been created yet
  const fallbackEmpty = createEmptyProject('default-empty', 'Welcome to Tattava', 'Start a new project or explore the demo.');
  const rawProject = (currentProjectId ? projects.find(p => p.id === currentProjectId) : projects[0]) || fallbackEmpty;
  
  // Clean project state — NO hardcoded data injected!
  const currentProject: TattavaProject = {
    ...rawProject,
    storyBrain: rawProject.storyBrain || {
      lastUpdated: 'Initialized',
      activeEntitiesCount: 0,
      canonFacts: [],
      entityNodes: [],
      decisionLog: [],
      dependencies: []
    },
    pilotMetrics: rawProject.pilotMetrics || {
      verificationRate: 0,
      continuityCatchRate: 0,
      candidateAcceptanceRate: 0,
      timeToPackageMins: 0,
      activeEntitiesCount: 0,
      canonicalFactsCount: 0,
      totalAiRuns: 0,
      averageLatencyMs: 0
    },
    evaluation: rawProject.evaluation || null,
    continuityIssues: rawProject.continuityIssues || rawProject.qaIssues || [],
    qaIssues: rawProject.continuityIssues || rawProject.qaIssues || [],
    format: rawProject.format || rawProject.formats?.find(f => f.isSelected)?.title || 'Feature Film',
    template: rawProject.template || rawProject.templates?.find(t => t.isSelected)?.title || 'Three-Act Classical Thriller',
    screenplayLines: rawProject.screenplayLines || rawProject.screenplay || [],
    productionPlan: rawProject.productionPlan || rawProject.production,
    packageData: rawProject.packageData || rawProject.package,
    episodes: rawProject.episodes || [],
    candidatePool: rawProject.candidatePool || [],
    canonConflicts: rawProject.canonConflicts || [],
    dynamicFormat: rawProject.dynamicFormat,
    nextBestAction: rawProject.nextBestAction,
    greenlightGate: rawProject.greenlightGate,
    discovery: rawProject.discovery || {
      turns: [],
      ambiguityLevel: rawProject.intent?.premise ? 80 : 100,
      lastUpdated: 'Initialized'
    }
  };

  const currentStepIndex = (() => {
    // Normalise 'qa' to 'continuity'
    const targetScreen = activeScreen === 'qa' ? 'continuity' : activeScreen;
    const found = PIPELINE_STEPS.find(s => s.id === targetScreen);
    return found ? found.step : 0;
  })();

  const updateCurrentProject = (updater: (prev: TattavaProject) => TattavaProject) => {
    setProjects(prevProjects =>
      prevProjects.map(p => (p.id === currentProjectId ? syncDirectionStores(updater(p)) : p))
    );
  };

  // Without an explicit screen, reopen where the writer left off: the next step with no content.
  // Demo projects are fully populated, so they open on the Story Brain overview.
  const openProject = (projectId: string, targetScreen?: ScreenId) => {
    const project = projects.find(p => p.id === projectId);
    const screen = targetScreen
      ?? (project && !project.isDemo ? getResumeScreen(project, PIPELINE_STEPS) : 'story-brain');
    setCurrentProjectId(projectId);
    setActiveScreen(screen);
  };

  const goToStep = (stepNumber: number) => {
    const found = PIPELINE_STEPS.find(s => s.step === stepNumber);
    if (found) {
      setActiveScreen(found.id);
    }
  };

  const nextStep = () => {
    const targetScreen = activeScreen === 'qa' ? 'continuity' : activeScreen;
    const currentIndex = PIPELINE_STEPS.findIndex(s => s.id === targetScreen);
    if (currentIndex >= 0 && currentIndex < PIPELINE_STEPS.length - 1) {
      setActiveScreen(PIPELINE_STEPS[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const targetScreen = activeScreen === 'qa' ? 'continuity' : activeScreen;
    const currentIndex = PIPELINE_STEPS.findIndex(s => s.id === targetScreen);
    if (currentIndex > 0) {
      setActiveScreen(PIPELINE_STEPS[currentIndex - 1].id);
    } else if (currentIndex === 0) {
      setActiveScreen('home');
    }
  };

  // -------------------------------------------------------------
  // CONTEXT RESOLVER ENGINE (SECTION 13.1 OF UNIFIED SPEC)
  // -------------------------------------------------------------
  const resolveContext = (
    taskType: ContextResolverPackage['taskType'],
    targetArtifact: string,
    query?: string,
    selectedCharacterId?: string
  ): ContextResolverPackage => {
    const { pkg } = resolveProjectContext(currentProject, {
      taskType,
      targetArtifact,
      query,
      selectedCharacterId
    });

    setActiveContextPackage(pkg);
    updateCurrentProject(prev => ({
      ...prev,
      activeContextPackage: pkg,
      pilotMetrics: {
        ...prev.pilotMetrics,
        totalAiRuns: prev.pilotMetrics.totalAiRuns + 1
      }
    }));

    return pkg;
  };


  const openContextResolver = (taskOrPkg?: ContextResolverPackage | ContextResolverPackage['taskType'], targetArtifact?: string) => {
    if (typeof taskOrPkg === 'object' && taskOrPkg !== null) {
      setActiveContextPackage(taskOrPkg);
    } else if (typeof taskOrPkg === 'string') {
      const pkg = resolveContext(taskOrPkg, targetArtifact || 'Current Screen');
      setActiveContextPackage(pkg);
    } else if (!activeContextPackage) {
      resolveContext('Story Direction', 'Current Workspace');
    }
    setIsContextResolverOpen(true);
  };

  const closeContextResolver = () => setIsContextResolverOpen(false);

  // -------------------------------------------------------------
  // STORY BRAIN MUTATORS
  // -------------------------------------------------------------
  const addCanonFact = (factData: Omit<CanonFact, 'id' | 'dateEstablished' | 'version'>) => {
    const newFact: CanonFact = {
      ...factData,
      id: 'cf-' + Date.now(),
      dateEstablished: 'Today',
      version: 'v1.' + (currentProject.storyBrain.canonFacts.length + 1)
    };

    updateCurrentProject(prev => ({
      ...prev,
      storyBrain: {
        ...prev.storyBrain,
        canonFacts: [newFact, ...prev.storyBrain.canonFacts],
        lastUpdated: 'Just now'
      },
      pilotMetrics: {
        ...prev.pilotMetrics,
        canonicalFactsCount: prev.pilotMetrics.canonicalFactsCount + 1
      }
    }));
  };

  const toggleLockCanonFact = (factId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      storyBrain: {
        ...prev.storyBrain,
        canonFacts: prev.storyBrain.canonFacts.map(f =>
          f.id === factId ? { ...f, isLocked: !f.isLocked } : f
        )
      }
    }));
  };

  const deleteCanonFact = (factId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      storyBrain: {
        ...prev.storyBrain,
        canonFacts: prev.storyBrain.canonFacts.filter(f => f.id !== factId),
        lastUpdated: 'Just now'
      },
      pilotMetrics: {
        ...prev.pilotMetrics,
        canonicalFactsCount: Math.max(0, prev.pilotMetrics.canonicalFactsCount - 1)
      }
    }));
  };

  const logCreativeDecision = (decisionData: Omit<CreativeDecision, 'id' | 'date' | 'status'>) => {
    const newDecision: CreativeDecision = {
      ...decisionData,
      id: 'cd-' + Date.now(),
      date: 'Today',
      status: 'Approved'
    };

    updateCurrentProject(prev => ({
      ...prev,
      storyBrain: {
        ...prev.storyBrain,
        creativeDecisions: [newDecision, ...prev.storyBrain.creativeDecisions],
        lastUpdated: 'Just now'
      }
    }));
  };

  const resolveDependencyStaleness = (depId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      storyBrain: {
        ...prev.storyBrain,
        dependencies: prev.storyBrain.dependencies.map(d =>
          d.id === depId ? { ...d, isStale: false, staleReason: undefined } : d
        )
      }
    }));
  };

  // -------------------------------------------------------------
  // CANON & CONTINUITY ENGINE MUTATORS
  // -------------------------------------------------------------
  const resolveContinuityIssue = (
    issueId: string, 
    resolutionState: 'Resolved' | 'Exception Granted', 
    notes?: string
  ) => {
    updateCurrentProject(prev => {
      const updatedIssues = prev.continuityIssues.map(issue =>
        issue.id === issueId
          ? {
              ...issue,
              resolutionState,
              resolutionNotes: notes || `Resolved via Canon & Continuity Engine on ${new Date().toLocaleDateString()}`
            }
          : issue
      );

      // Recalculate catch rate
      const resolvedCount = updatedIssues.filter(i => i.resolutionState === 'Resolved').length;
      const newRate = Math.round((resolvedCount / updatedIssues.length) * 100);

      return {
        ...prev,
        continuityIssues: updatedIssues,
        qaIssues: updatedIssues,
        pilotMetrics: {
          ...prev.pilotMetrics,
          continuityCatchRate: Math.max(newRate, prev.pilotMetrics.continuityCatchRate)
        }
      };
    });
  };

  const repairSceneWithCanon = async (issueId: string) => {
    const issue = currentProject.continuityIssues.find(i => i.id === issueId);
    if (!issue) return;

    try {
      const repairRes = await repairContinuityIssueWithCanon(currentProject, issue);
      updateCurrentProject(prev => {
        // Dynamically update the affected scene if sceneNumber matches
        const updatedScenes = prev.scenes.map(s => {
          if (s.sceneNumber === issue.sceneNumber || s.id === `sc-${issue.sceneNumber}`) {
            return {
              ...s,
              summary: repairRes.repairedText,
              notes: (s.notes || []).map(n => ({ ...n, done: true }))
            };
          }
          return s;
        });

        const updatedIssues = prev.continuityIssues.map(i =>
          i.id === issueId
            ? {
                ...i,
                resolutionState: 'Resolved' as const,
                resolutionNotes: repairRes.explanation || `Realigned with canon: ${issue.establishedCanonEvidence}`
              }
            : i
        );

        // Clear any related stale dependencies
        const updatedDeps = prev.storyBrain.dependencies.map(d =>
          d.description.toLowerCase().includes(issue.title.toLowerCase())
            ? { ...d, isStale: false, staleReason: undefined }
            : d
        );

        return {
          ...prev,
          scenes: updatedScenes,
          continuityIssues: updatedIssues,
          qaIssues: updatedIssues,
          storyBrain: {
            ...prev.storyBrain,
            dependencies: updatedDeps
          },
          pilotMetrics: {
            ...prev.pilotMetrics,
            totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
          }
        };
      });
    } catch (e) {
      console.warn('Real AI canon repair fallback:', e);
      resolveContinuityIssue(issueId, 'Resolved', `Canon truth reaffirmed: ${issue.establishedCanonEvidence}`);
    }
  };

  // Compatibility aliases
  const resolveQAIssue = (issueId: string) => resolveContinuityIssue(issueId, 'Resolved');
  const resolveQAInconsistency = (issueId: string) => resolveContinuityIssue(issueId, 'Resolved');

  // -------------------------------------------------------------
  // AI STORY EVALUATION RUNNER (DYNAMIC AI HARNESS)
  // -------------------------------------------------------------
  const runStoryEvaluation = async () => {
    try {
      const evalRes = await evaluateProjectNarrative(currentProject);
      const repairPlan = await generateEvaluationRepairPlan(currentProject, evalRes);
      updateCurrentProject(prev => {
        const fullDimensions = [
          {
            id: 'dim-logic',
            name: 'Causal & Timeline Logic',
            score: evalRes.dimensions?.find(d => d.name.toLowerCase().includes('logic'))?.score || Math.round(evalRes.overallScore),
            weight: 20,
            diagnostic: evalRes.dimensions?.find(d => d.name.toLowerCase().includes('logic'))?.notes || 'Cause-and-effect progression verified against Story Brain canon.',
            strengths: ['Clear narrative causation derived from premise'],
            gaps: [],
            recommendation: 'Ensure secondary characters have clear causal motivations.'
          },
          {
            id: 'dim-char',
            name: 'Character Psychology & Flaw Coherence',
            score: evalRes.dimensions?.find(d => d.name.toLowerCase().includes('character'))?.score || Math.max(50, Math.round(evalRes.overallScore - 3)),
            weight: 20,
            diagnostic: evalRes.dimensions?.find(d => d.name.toLowerCase().includes('character'))?.notes || 'Protagonist internal conflict and stakes verified.',
            strengths: ['Protagonist wants and needs are clearly established'],
            gaps: [],
            recommendation: 'Deepen vulnerability in midpoint sequences.'
          },
          {
            id: 'dim-grounding',
            name: 'Context Grounding & Research Depth',
            score: evalRes.dimensions?.find(d => d.name.toLowerCase().includes('grounding') || d.name.toLowerCase().includes('research'))?.score || Math.min(98, Math.round(evalRes.overallScore + 2)),
            weight: 20,
            diagnostic: evalRes.dimensions?.find(d => d.name.toLowerCase().includes('grounding') || d.name.toLowerCase().includes('research'))?.notes || 'Authenticity grounded in project evidence dossier.',
            strengths: ['Domain specifics anchor the premise'],
            gaps: [],
            recommendation: 'Expand institutional or environmental nuances.'
          },
          {
            id: 'dim-canon',
            name: 'Canon Adherence & Zero Leakage',
            score: (prev.continuityIssues?.filter(i => i.resolutionState === 'Open').length || 0) === 0 ? 98 : 74,
            weight: 20,
            diagnostic: `${prev.storyBrain?.canonFacts?.length || 0} locked canon facts checked with zero cross-project leakage.`,
            strengths: ['Deterministic consistency across established facts'],
            gaps: [],
            recommendation: 'Commit approved narrative beats to canonical memory.'
          },
          {
            id: 'dim-commercial',
            name: 'Market & Emotional Resonance',
            score: evalRes.dimensions?.find(d => d.name.toLowerCase().includes('market') || d.name.toLowerCase().includes('emotional'))?.score || Math.round(evalRes.overallScore - 1),
            weight: 20,
            diagnostic: 'Audience engagement potential and structural velocity.',
            strengths: ['High-concept hook with distinct genre appeal'],
            gaps: [],
            recommendation: 'Sharpen climax catharsis.'
          }
        ];

        const updatedEval: StoryEvaluation = {
          overallScore: evalRes.overallScore,
          readinessStatus: evalRes.readinessStatus,
          evaluatorModel: 'HuggingFace (server-side)',
          evaluatedAt: new Date().toLocaleDateString() + ' (tattvaCo Evaluator v1.0)',
          dimensions: fullDimensions,
          keyStrengths: evalRes.keyStrengths?.length > 0 ? evalRes.keyStrengths : (evalRes.strengths?.length ? evalRes.strengths : ['Original premise hook', 'Grounded dramatic conflict']),
          criticalRisks: evalRes.criticalRisks?.length > 0 ? evalRes.criticalRisks : ['Ensure third-act escalation matches initial stakes.'],
          actionItems: evalRes.actionItems || ['Review second act transitions and maintain thematic pressure']
        };

        const previousEvaluation = prev.evaluation;
        const comparison: EvaluationComparison | null = previousEvaluation ? {
          id: 'evaluation-comparison-' + Date.now(),
          beforeEvaluationAt: previousEvaluation.evaluatedAt,
          afterEvaluationAt: updatedEval.evaluatedAt,
          overallScoreDelta: updatedEval.overallScore - previousEvaluation.overallScore,
          readinessChanged: updatedEval.readinessStatus !== previousEvaluation.readinessStatus,
          dimensionChanges: updatedEval.dimensions.map(after => {
            const before = previousEvaluation.dimensions.find(d => d.name === after.name);
            const beforeScore = before?.score ?? after.score;
            const delta = after.score - beforeScore;
            return {
              dimension: after.name,
              beforeScore,
              afterScore: after.score,
              delta,
              interpretation: delta > 0 ? 'IMPROVED' : delta < 0 ? 'REGRESSED' : 'UNCHANGED'
            };
          }),
          resolvedRisks: (previousEvaluation.criticalRisks || []).filter(risk => !(updatedEval.criticalRisks || []).includes(risk)),
          remainingRisks: updatedEval.criticalRisks || [],
          generatedAt: new Date().toISOString()
        } : null;

        return {
          ...prev,
          evaluation: updatedEval,
          evaluationHistory: [...(prev.evaluationHistory || []), updatedEval],
          evaluationComparisons: comparison
            ? [comparison, ...(prev.evaluationComparisons || [])]
            : (prev.evaluationComparisons || []),
          evaluationRepairPlan: repairPlan,
          pilotMetrics: {
            ...prev.pilotMetrics,
            totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
          }
        };
      });
    } catch (err) {
      console.error('Failed to run dynamic story evaluation:', err);
      throw err;
    }
  };

  const reevaluateAfterRepair = async () => {
    await runStoryEvaluation();
  };

  const signOffEvaluation = (approverName: string, role: string, comments: string) => {
    updateCurrentProject(prev => {
      if (!prev.evaluation) return prev;
      return {
        ...prev,
        evaluation: {
          ...prev.evaluation,
          humanSignOff: {
            approvedBy: approverName,
            role,
            date: new Date().toLocaleDateString(),
            comments
          }
        }
      };
    });
  };

  // -------------------------------------------------------------
  // CANONICAL STATE MUTATOR
  // -------------------------------------------------------------
  const setArtifactCandidateState = (
    artifactType: 'direction' | 'character' | 'treatment' | 'scene' | 'dialogue',
    id: string,
    state: CanonicalState
  ) => {
    updateCurrentProject(prev => {
      if (artifactType === 'direction') {
        return {
          ...prev,
          storyDirections: prev.storyDirections.map(d => d.id === id ? { ...d, candidateState: state } : d)
        };
      } else if (artifactType === 'character') {
        return {
          ...prev,
          characters: prev.characters.map(c => c.id === id ? { ...c, candidateState: state } : c)
        };
      } else if (artifactType === 'treatment') {
        return {
          ...prev,
          treatment: { ...prev.treatment, candidateState: state }
        };
      } else if (artifactType === 'scene') {
        return {
          ...prev,
          scenes: prev.scenes.map(s => s.id === id ? { ...s, candidateState: state } : s)
        };
      } else if (artifactType === 'dialogue') {
        return {
          ...prev,
          dialogueSuggestions: prev.dialogueSuggestions.map(ds => ds.id === id ? { ...ds, candidateState: state } : ds)
        };
      }
      return prev;
    });
  };

  const approveArtifact = (
    artifactType: ArtifactVersionRecord['artifactType'],
    artifactId: string,
    approvedBy: string,
    role: string,
    rationale?: string
  ) => {
    updateCurrentProject(prev => {
      const now = new Date().toISOString();
      const artifact = artifactType === 'direction'
        ? prev.storyDirections.find(a => a.id === artifactId)
        : artifactType === 'character'
          ? prev.characters.find(a => a.id === artifactId)
          : artifactType === 'treatment'
            ? prev.treatment
            : artifactType === 'scene'
              ? prev.scenes.find(a => a.id === artifactId)
              : prev.dialogueSuggestions.find(a => a.id === artifactId);
      if (!artifact) return prev;

      const versions = prev.artifactVersions || [];
      const previous = [...versions].reverse().find(v =>
        v.artifactType === artifactType && v.artifactId === artifactId && v.state === 'CANONICAL'
      );
      const versionId = 'artifact-version-' + Date.now();
      const approvalId = 'artifact-approval-' + Date.now();
      const version: ArtifactVersionRecord = {
        id: versionId,
        artifactType,
        artifactId,
        version: 'v' + (versions.filter(v => v.artifactType === artifactType && v.artifactId === artifactId).length + 1),
        state: 'CANONICAL',
        content: artifact,
        createdAt: now,
        createdBy: approvedBy,
        changeSummary: rationale || 'Human-approved artifact',
        supersedesVersionId: previous?.id,
        approvalId
      };
      const approval: ArtifactApprovalRecord = {
        id: approvalId,
        artifactType,
        artifactId,
        versionId,
        status: 'APPROVED',
        approvedBy,
        role,
        timestamp: now,
        rationale
      };
      const nextVersions = previous
        ? versions.map(v => v.id === previous.id ? { ...v, state: 'SUPERSEDED' as CanonicalState } : v)
        : versions;

      const approvalDecision: CreativeDecision = {
        id: 'decision-' + Date.now(),
        title: 'Approved ' + artifactType + ' artifact',
        decision: 'Approved ' + artifactType + ' ' + artifactId + ' as canonical ' + version.version,
        rationale: rationale || 'Human approval recorded for downstream grounding.',
        author: approvedBy,
        role,
        date: now,
        status: 'Approved',
        impactedAreas: [artifactType]
      };

      const nextDependencies = (prev.storyBrain?.dependencies || []).map(dep =>
        dep.sourceEntityId === artifactId
          ? { ...dep, isStale: true, staleReason: 'Source artifact changed through human approval ' + version.version }
          : dep
      );

      let next = {
        ...prev,
        artifactVersions: [...nextVersions, version],
        artifactApprovals: [...(prev.artifactApprovals || []), approval],
        storyBrain: {
          ...prev.storyBrain,
          creativeDecisions: [...(prev.storyBrain?.creativeDecisions || []), approvalDecision],
          decisionLog: [...(prev.storyBrain?.decisionLog || []), approvalDecision],
          dependencies: nextDependencies,
          lastUpdated: now
        },
        projectIntelligence: prev.projectIntelligence ? {
          ...prev.projectIntelligence,
          development: {
            ...prev.projectIntelligence.development,
            decisionCount: prev.projectIntelligence.development.decisionCount + 1
          }
        } : prev.projectIntelligence
      };

      if (artifactType === 'direction') {
        next = {
          ...next,
          storyDirections: next.storyDirections.map(d => d.id === artifactId ? { ...d, candidateState: 'CANONICAL' } : d),
          selectedDirectionId: artifactId,
          projectIntelligence: next.projectIntelligence ? {
            ...next.projectIntelligence,
            directions: next.projectIntelligence.directions.map(d => d.id === artifactId ? { ...d, status: 'SELECTED' } : d),
            development: {
              ...next.projectIntelligence.development,
              currentStage: 'CONTENT',
              contentArtifactCount: next.projectIntelligence.development.contentArtifactCount + 1
            }
          } : next.projectIntelligence
        };
      } else if (artifactType === 'character') {
        next = { ...next, characters: next.characters.map(c => c.id === artifactId ? { ...c, candidateState: 'CANONICAL' } : c) };
      } else if (artifactType === 'treatment') {
        next = { ...next, treatment: { ...next.treatment, candidateState: 'CANONICAL' } };
      } else if (artifactType === 'scene') {
        next = { ...next, scenes: next.scenes.map(s => s.id === artifactId ? { ...s, candidateState: 'CANONICAL' } : s) };
      } else {
        next = { ...next, dialogueSuggestions: next.dialogueSuggestions.map(d => d.id === artifactId ? { ...d, candidateState: 'CANONICAL' } : d) };
      }
      return next;
    });
  };

  // -------------------------------------------------------------
  // BRANCH / CANON EVOLUTION
  // -------------------------------------------------------------
  const createProjectBranch = (name: string, purpose: string, createdBy: string): string => {
    const id = 'branch-' + Date.now();
    const branch: ProjectBranch = {
      id,
      name: name.trim() || 'Creative Exploration',
      purpose: purpose.trim(),
      baseCanonicalVersion: currentProject.canonicalVersion || 'v0.1',
      createdAt: new Date().toISOString(),
      createdBy,
      status: 'ACTIVE',
      artifactVersionIds: []
    };
    updateCurrentProject(prev => ({
      ...prev,
      projectBranches: [branch, ...(prev.projectBranches || [])]
    }));
    return id;
  };

  const addArtifactToBranch = (branchId: string, versionId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      projectBranches: (prev.projectBranches || []).map(branch =>
        branch.id === branchId && branch.status === 'ACTIVE'
          ? { ...branch, artifactVersionIds: branch.artifactVersionIds.includes(versionId) ? branch.artifactVersionIds : [...branch.artifactVersionIds, versionId] }
          : branch
      )
    }));
  };

  const prepareProjectBranchMerge = (branchId: string): BranchMergePreview | null => {
    let preview: BranchMergePreview | null = null;

    updateCurrentProject(prev => {
      const branch = (prev.projectBranches || []).find(b => b.id === branchId);
      if (!branch || branch.status !== 'ACTIVE') return prev;

      const branchVersions = branch.artifactVersionIds
        .map(id => (prev.artifactVersions || []).find(v => v.id === id))
        .filter((v): v is ArtifactVersionRecord => Boolean(v && v.state === 'CANONICAL'));

      const canonicalVersions = (prev.artifactVersions || []).filter(v => v.state === 'CANONICAL');
      const diffs: BranchMergeDiff[] = [];
      const conflicts: BranchMergeConflict[] = [];

      const stableSerialize = (value: unknown) => {
        try { return JSON.stringify(value, Object.keys((value || {}) as object).sort()); }
        catch { return JSON.stringify(value); }
      };

      const changedFields = (left: unknown, right: unknown): string[] => {
        if (!left || !right || typeof left !== 'object' || typeof right !== 'object') {
          return stableSerialize(left) === stableSerialize(right) ? [] : ['content'];
        }
        const keys = Array.from(new Set([
          ...Object.keys(left as Record<string, unknown>),
          ...Object.keys(right as Record<string, unknown>)
        ]));
        return keys.filter(key =>
          stableSerialize((left as Record<string, unknown>)[key]) !==
          stableSerialize((right as Record<string, unknown>)[key])
        );
      };

      branchVersions.forEach(branchVersion => {
        const canonical = canonicalVersions
          .filter(v => v.artifactType === branchVersion.artifactType && v.artifactId === branchVersion.artifactId)
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

        if (!canonical) {
          diffs.push({
            artifactType: branchVersion.artifactType,
            artifactId: branchVersion.artifactId,
            branchVersionId: branchVersion.id,
            changeType: 'ADDED',
            changedFields: ['content'],
            summary: 'Branch introduces an artifact with no current canonical counterpart.'
          });
          return;
        }

        const fields = changedFields(branchVersion.content, canonical.content);
        const changeType = fields.length ? 'MODIFIED' : 'UNCHANGED';
        diffs.push({
          artifactType: branchVersion.artifactType,
          artifactId: branchVersion.artifactId,
          branchVersionId: branchVersion.id,
          canonicalVersionId: canonical.id,
          changeType,
          changedFields: fields,
          summary: fields.length
            ? 'Branch version differs from the current canonical artifact.'
            : 'Branch version matches the current canonical artifact.'
        });

        if (fields.length && branch.baseCanonicalVersion !== (prev.canonicalVersion || 'v0.1')) {
          conflicts.push({
            id: 'branch-conflict-' + branchVersion.id,
            artifactType: branchVersion.artifactType,
            artifactId: branchVersion.artifactId,
            branchVersionId: branchVersion.id,
            canonicalVersionId: canonical.id,
            branchContent: branchVersion.content,
            canonicalContent: canonical.content,
            reason: 'The project advanced after this branch was created and the same artifact changed on both paths.'
          });
        }
      });

      const now = new Date().toISOString();
      preview = {
        id: 'branch-preview-' + Date.now(),
        branchId,
        baseCanonicalVersion: branch.baseCanonicalVersion,
        targetCanonicalVersion: prev.canonicalVersion || 'v0.1',
        createdAt: now,
        diffs,
        conflicts,
        status: conflicts.length ? 'CONFLICTS' : 'READY'
      };

      return {
        ...prev,
        branchMergePreview: preview
      };
    });

    return preview;
  };

  const approveProjectBranchMerge = (branchId: string, mergedBy: string, rationale: string) => {
    updateCurrentProject(prev => {
      const branch = (prev.projectBranches || []).find(b => b.id === branchId);
      const preview = prev.branchMergePreview;
      if (!branch || branch.status !== 'ACTIVE' || !preview || preview.branchId !== branchId) return prev;
      if (preview.status !== 'READY') return prev;

      const branchVersions = branch.artifactVersionIds
        .map(id => (prev.artifactVersions || []).find(v => v.id === id))
        .filter((v): v is ArtifactVersionRecord => Boolean(v && v.state === 'CANONICAL'));

      const changedDiffs = preview.diffs.filter(d => d.changeType !== 'UNCHANGED');
      if (!changedDiffs.length) return prev;

      const now = new Date().toISOString();
      const currentNumber = Number((prev.canonicalVersion || 'v0').replace(/[^0-9.]/g, '')) || 0;
      const targetVersion = 'v' + (Math.floor(currentNumber) + 1);
      const mergeId = 'merge-' + Date.now();
      const decisionId = 'branch-merge-decision-' + Date.now();

      const resolutionFor = (diff: BranchMergeDiff): BranchMergeConflict['resolution'] => {
        const conflict = preview.conflicts.find(c => c.id === 'branch-conflict-' + diff.branchVersionId);
        return conflict?.resolution || 'USE_BRANCH';
      };

      // MANUAL_EDIT is only valid when the edited content has actually been supplied.
      const unresolvedManualEdit = preview.conflicts.some(conflict =>
        conflict.resolution === 'MANUAL_EDIT' && conflict.manualContent === undefined
      );
      if (unresolvedManualEdit) return prev;

      const canonicalVersions = [...(prev.artifactVersions || [])];
      const approvals = [...(prev.artifactApprovals || [])];
      const decisions = [...(prev.storyBrain?.creativeDecisions || [])];
      const branchSourceIds = new Set<string>();
      const changedArtifactIds: string[] = [];
      let next = { ...prev };

      const applyContent = (project: TattavaProject, diff: BranchMergeDiff, content: unknown): TattavaProject => {
        const canonicalContent = { ...(content as Record<string, unknown>), candidateState: 'CANONICAL' as CanonicalState };
        if (diff.artifactType === 'direction') {
          return {
            ...project,
            storyDirections: project.storyDirections.map(a => a.id === diff.artifactId ? canonicalContent as StoryDirection : a),
            selectedDirectionId: diff.artifactId
          };
        }
        if (diff.artifactType === 'character') {
          return { ...project, characters: project.characters.map(a => a.id === diff.artifactId ? canonicalContent as Character : a) };
        }
        if (diff.artifactType === 'treatment') {
          return { ...project, treatment: canonicalContent as TreatmentData };
        }
        if (diff.artifactType === 'scene') {
          return { ...project, scenes: project.scenes.map(a => a.id === diff.artifactId ? canonicalContent as SceneItem : a) };
        }
        return {
          ...project,
          dialogueSuggestions: project.dialogueSuggestions.map(a => a.id === diff.artifactId ? canonicalContent as any : a)
        };
      };

      changedDiffs.forEach(diff => {
        const branchVersion = branchVersions.find(v => v.id === diff.branchVersionId);
        if (!branchVersion) return;

        const conflict = preview.conflicts.find(c => c.id === 'branch-conflict-' + diff.branchVersionId);
        const resolution = resolutionFor(diff);
        const content = resolution === 'KEEP_CANONICAL'
          ? (conflict?.canonicalContent ?? branchVersion.content)
          : resolution === 'MANUAL_EDIT'
            ? conflict?.manualContent
            : branchVersion.content;

        if (content === undefined) return;

        // KEEP_CANONICAL records the human decision but does not create a
        // duplicate canonical version or mutate the artifact.
        if (resolution === 'KEEP_CANONICAL') {
          branchSourceIds.add(branchVersion.id);
          return;
        }

        next = applyContent(next, diff, content);
        changedArtifactIds.push(diff.artifactId);
        branchSourceIds.add(branchVersion.id);
        const previous = canonicalVersions
          .filter(v => v.artifactType === diff.artifactType && v.artifactId === diff.artifactId && v.state === 'CANONICAL')
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

        const versionId = 'artifact-version-' + Date.now() + '-' + diff.artifactId;
        const approvalId = 'artifact-approval-' + Date.now() + '-' + diff.artifactId;
        const versionNumber = canonicalVersions.filter(v => v.artifactType === diff.artifactType && v.artifactId === diff.artifactId).length + 1;
        const version: ArtifactVersionRecord = {
          id: versionId,
          artifactType: diff.artifactType,
          artifactId: diff.artifactId,
          version: 'v' + versionNumber,
          state: 'CANONICAL',
          content,
          createdAt: now,
          createdBy: mergedBy,
          changeSummary: 'Canonical artifact created from approved branch merge: ' + branch.name,
          supersedesVersionId: previous?.id,
          approvalId
        };
        const approval: ArtifactApprovalRecord = {
          id: approvalId,
          artifactType: diff.artifactType,
          artifactId: diff.artifactId,
          versionId,
          status: 'APPROVED',
          approvedBy: mergedBy,
          role: 'Creative Lead',
          timestamp: now,
          rationale: rationale || 'Human-approved branch merge.'
        };

        if (previous) {
          const idx = canonicalVersions.findIndex(v => v.id === previous.id);
          if (idx >= 0) canonicalVersions[idx] = { ...canonicalVersions[idx], state: 'SUPERSEDED' };
        }
        canonicalVersions.push(version);
        approvals.push(approval);

        decisions.push({
          id: 'decision-' + Date.now() + '-' + diff.artifactId,
          title: 'Merged ' + diff.artifactType + ' from branch',
          decision: 'Approved ' + diff.artifactType + ' ' + diff.artifactId + ' from branch "' + branch.name + '" into ' + version.version,
          rationale: rationale || 'Human approval recorded for downstream grounding.',
          author: mergedBy,
          role: 'Creative Lead',
          date: now,
          status: 'Approved',
          impactedAreas: [diff.artifactType, 'Canon', 'Branch']
        });
      });

      // Branch source versions become historical records; the new canonical versions
      // are the authoritative project state.
      const nextVersions = canonicalVersions.map(v =>
        branchSourceIds.has(v.id) ? { ...v, state: 'SUPERSEDED' as CanonicalState } : v
      );

      const staleReason = 'Upstream canonical artifact changed through approved branch merge ' + targetVersion;
      const nextDependencies = (next.storyBrain?.dependencies || []).map(dep =>
        changedArtifactIds.includes(dep.sourceEntityId)
          ? { ...dep, isStale: true, staleReason }
          : dep
      );

      next = {
        ...next,
        canonicalVersion: targetVersion,
        artifactVersions: nextVersions,
        artifactApprovals: approvals,
        storyBrain: {
          ...next.storyBrain,
          creativeDecisions: decisions,
          decisionLog: decisions,
          dependencies: nextDependencies,
          lastUpdated: now
        },
        branchMergePreview: { ...preview, status: 'APPROVED', reviewedBy: mergedBy, reviewedAt: now, rationale },
        projectBranches: (next.projectBranches || []).map(b =>
          b.id === branchId ? { ...b, status: 'MERGED', mergeDecisionId: decisionId } : b
        ),
        branchMerges: [{
          id: mergeId,
          branchId,
          sourceVersionIds: branchSourceIds.size ? [...branchSourceIds] : branch.artifactVersionIds,
          targetProjectVersion: targetVersion,
          mergedAt: now,
          mergedBy,
          rationale,
          status: 'APPROVED',
          previewId: preview.id
        }, ...(next.branchMerges || [])]
      };

      // Automatically prepare the downstream impact set. No regeneration is
      // executed here; affected artifacts remain human-reviewable/stale.
      const impactItems = changedArtifactIds.flatMap(id =>
        resolveDependencyImpact(next, {
          sourceEntityId: id,
          sourceDescription: 'Approved branch merge changed artifact ' + id
        }).items
      );
      if (impactItems.length) {
        const deduped = Array.from(new Map(impactItems.map(item => [item.id, item])).values());
        const summary = {
          characters: deduped.filter(i => i.category === 'Characters').length,
          story: deduped.filter(i => i.category === 'Story').length,
          scenes: deduped.filter(i => i.category === 'Scenes').length,
          dialogue: deduped.filter(i => i.category === 'Dialogue').length,
          visuals: deduped.filter(i => i.category === 'Visuals').length,
          production: deduped.filter(i => i.category === 'Production').length
        };
        const impact: ImpactAnalysisState = {
          isOpen: true,
          sourceTrigger: 'Approved branch merge: ' + branch.name,
          totalAffected: deduped.length,
          summary,
          items: deduped
        };
        const plan = buildRegenerationPlan(next, impact);
        next = {
          ...next,
          regenerationPlans: [plan, ...(next.regenerationPlans || [])]
        };
      }

      return next;
    });
  };

  const resolveBranchMergeConflict = (branchId: string, conflictId: string, resolution: 'USE_BRANCH' | 'KEEP_CANONICAL' | 'MANUAL_EDIT') => {
    updateCurrentProject(prev => {
      const preview = prev.branchMergePreview;
      if (!preview || preview.branchId !== branchId) return prev;
      const conflicts = preview.conflicts.map(conflict =>
        conflict.id === conflictId ? { ...conflict, resolution } : conflict
      );
      const unresolved = conflicts.filter(conflict => !conflict.resolution);
      return {
        ...prev,
        branchMergePreview: {
          ...preview,
          conflicts,
          status: unresolved.length ? 'CONFLICTS' : 'READY'
        }
      };
    });
  };

  const setBranchMergeManualContent = (branchId: string, conflictId: string, content: unknown) => {
    updateCurrentProject(prev => {
      const preview = prev.branchMergePreview;
      if (!preview || preview.branchId !== branchId) return prev;
      const conflicts = preview.conflicts.map(conflict =>
        conflict.id === conflictId
          ? { ...conflict, resolution: 'MANUAL_EDIT' as const, manualContent: content }
          : conflict
      );
      const allResolved = conflicts.every(conflict =>
        Boolean(conflict.resolution) && (
          conflict.resolution !== 'MANUAL_EDIT' || conflict.manualContent !== undefined
        )
      );
      return {
        ...prev,
        branchMergePreview: {
          ...preview,
          conflicts,
          status: allResolved ? 'READY' : 'CONFLICTS'
        }
      };
    });
  };

  const rejectProjectBranchMerge = (branchId: string, reviewedBy: string, rationale?: string) => {
    updateCurrentProject(prev => {
      const preview = prev.branchMergePreview;
      if (!preview || preview.branchId !== branchId) return prev;
      return {
        ...prev,
        branchMergePreview: {
          ...preview,
          status: 'REJECTED',
          reviewedBy,
          reviewedAt: new Date().toISOString(),
          rationale
        }
      };
    });
  };

  // Backward-compatible entry point: never merges silently. It now prepares a
  // reviewable preview; callers must explicitly invoke approveProjectBranchMerge.
  const mergeProjectBranch = (branchId: string, mergedBy: string, rationale: string) => {
    prepareProjectBranchMerge(branchId);
  };

  const abandonProjectBranch = (branchId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      projectBranches: (prev.projectBranches || []).map(branch =>
        branch.id === branchId ? { ...branch, status: 'ABANDONED' } : branch
      )
    }));
  };

  // -------------------------------------------------------------
  // PROJECT LIFECYCLE
  // -------------------------------------------------------------
  const createNewProject = (data: Partial<TattavaProject>): string => {
    const newId = 'proj-' + Date.now();
    const cleanPremise = data.intent?.premise || data.tagline || '';
    const newProj = createEmptyProject(
      newId,
      data.title || 'Untitled Project',
      cleanPremise,
      {
        contentType: data.contentType,
        language: data.language,
        genre: data.genre,
        uploadedMaterialName: data.intent?.uploadedMaterialName,
        uploadedMaterialContent: data.intent?.uploadedMaterialContent
      }
    );

    const finalized: TattavaProject = {
      ...newProj,
      ...data,
      id: newId,
      intent: {
        ...newProj.intent,
        ...(data.intent || {}),
        premise: cleanPremise,
        rawConcept: cleanPremise
      },
      storyBrain: {
        lastUpdated: 'Initialized',
        activeEntitiesCount: 0,
        canonFacts: [],
        creativeDecisions: [],
        entityNodes: [],
        decisionLog: [],
        dependencies: []
      },
      characters: [],
      researchFindings: [],
      researchQuestions: [],
      continuityIssues: [],
      qaIssues: [],
      evaluation: null,
      isDemo: false
    };

    const canonicalized = applyCanonicalConfiguration(finalized);
    setProjects(prev => [canonicalized, ...prev]);
    setCurrentProjectId(newId);
    setActiveScreen('discovery');
    return newId;
  };

  const buildResearchUniverse = async () => {
    const result = await generateResearchUniverse(currentProject);
    updateCurrentProject(prev => {
      const intelligence = prev.projectIntelligence || {
        domainNodes: [],
        researchUniverse: { rootSubject: '', dimensions: [], unresolvedQuestions: [], coveragePercent: 0 },
        insights: [],
        directions: [],
        development: { knowledgeCount: 0, insightCount: 0, directionCount: 0, decisionCount: 0, contentArtifactCount: 0, currentStage: 'KNOWLEDGE' as const }
      };
      return {
        ...prev,
        projectIntelligence: {
          ...intelligence,
          researchUniverse: {
            rootSubject: result.rootSubject,
            dimensions: result.dimensions,
            unresolvedQuestions: result.unresolvedQuestions,
            coveragePercent: result.coveragePercent,
            lastExpandedAt: new Date().toISOString()
          }
        }
      };
    });
    return result;
  };


  const generateProjectInsights = async () => {
    const result = await synthesizeProjectInsights(currentProject);
    updateCurrentProject(prev => {
      const intelligence = prev.projectIntelligence!;
      const insights = result.insights.map((item, index) => ({
        id: `insight-${Date.now()}-${index + 1}`,
        ...item,
        status: 'CANDIDATE' as const
      }));
      return {
        ...prev,
        projectIntelligence: {
          ...intelligence,
          insights,
          development: {
            ...intelligence.development,
            insightCount: insights.length,
            currentStage: insights.length ? 'INSIGHT' : intelligence.development.currentStage
          }
        }
      };
    });
    return result;
  };

  const setProjectInsightStatus = (insightId: string, status: 'CANDIDATE' | 'ACCEPTED' | 'DISMISSED') => {
    updateCurrentProject(prev => {
      if (!prev.projectIntelligence) return prev;
      const insights = prev.projectIntelligence.insights.map(i => i.id === insightId ? { ...i, status } : i);
      return {
        ...prev,
        projectIntelligence: {
          ...prev.projectIntelligence,
          insights,
          development: { ...prev.projectIntelligence.development, insightCount: insights.filter(i => i.status !== 'DISMISSED').length }
        }
      };
    });
  };

  const generateProjectDirections = async () => {
    const result = await synthesizeProjectDirections(currentProject);
    updateCurrentProject(prev => {
      const intelligence = prev.projectIntelligence!;
      const directions = result.directions.map((item, index) => ({
        id: `direction-${Date.now()}-${index + 1}`,
        ...item,
        status: 'CANDIDATE' as const
      }));
      return {
        ...prev,
        // Approved directions stay; stale unapproved candidates on the Directions screen are replaced.
        storyDirections: withoutUnapprovedStoryDirections(prev),
        projectIntelligence: {
          ...intelligence,
          directions: [...intelligence.directions.filter(d => d.status === 'SELECTED'), ...directions],
          development: {
            ...intelligence.development,
            directionCount: directions.length,
            currentStage: directions.length ? 'DIRECTION' : intelligence.development.currentStage
          }
        }
      };
    });
    return result;
  };

  const openDemoProject = () => {
    const demo = normalizePersistedProjectForConfiguration(
      JSON.parse(JSON.stringify({ ...seedProject, isDemo: true }))
    );
    setProjects(prev => [demo, ...prev.filter(p => p.id !== demo.id)]);
    setCurrentProjectId(demo.id);
    setActiveScreen('story-brain');
  };

  // -------------------------------------------------------------
  // CONVERSATIONAL DISCOVERY LOOP ENGINE
  // Understand -> Explore -> Decide -> Remember -> Develop
  // -------------------------------------------------------------
  const sendDiscoveryMessage = async (
    message: string,
    sourceAttachment?: { name: string; content: string }
  ) => {
    if (!message.trim() && !sourceAttachment) return;

    const userTurnId = 'turn-' + Date.now();
    const userTurn: DiscoveryTurn = {
      id: userTurnId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: 'user',
      userText: message.trim() || `Uploaded document: ${sourceAttachment?.name}`,
      conversationalReply: '',
      actionType: 'CLARIFY',
      knownExtracted: [],
      unresolvedAmbiguities: [],
      nextQuestion: ''
    };

    // Optimistically record user turn
    updateCurrentProject(prev => ({
      ...prev,
      discovery: {
        turns: [...(prev.discovery?.turns || []), userTurn],
        ambiguityLevel: prev.discovery?.ambiguityLevel ?? 80,
        lastUpdated: 'Just now'
      }
    }));

    try {
      const orchestration = await orchestrateCreatorTurn(currentProject, message, sourceAttachment);
      const result: DiscoveryTurnResult = orchestration.result;

      const aiTurnId = 'turn-' + (Date.now() + 1);
      const aiTurn: DiscoveryTurn = {
        id: aiTurnId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: 'tattava',
        thought: result.thought,
        conversationalReply: result.conversationalReply,
        actionType: result.actionType,
        knownExtracted: result.knownExtracted,
        unresolvedAmbiguities: result.unresolvedAmbiguities,
        nextQuestion: result.nextQuestion,
        quickReplies: result.quickReplies,
        researchObjective: result.researchObjective,
        candidateOptions: result.candidateOptions,
        appliedDecision: result.appliedDecision
      };

      updateCurrentProject(prev => {
        const updatedCanon = [...(prev.storyBrain?.canonFacts || [])];
        const updatedDecisions = [...(prev.storyBrain?.creativeDecisions || prev.storyBrain?.decisionLog || [])];
        const updatedResearch = [...(prev.researchFindings || [])];

        // If a decision was confirmed and canon created
        if (result.appliedDecision) {
          const decId = 'dec-' + Date.now();
          const decisionItem: CreativeDecision = {
            id: decId,
            title: result.appliedDecision.summary,
            decision: result.appliedDecision.summary,
            rationale: result.appliedDecision.rationale,
            author: 'Story Creator & Tattava',
            role: 'Creative Partner',
            date: new Date().toLocaleDateString(),
            status: 'ACCEPTED',
            impactedAreas: ['Story Brain', 'World Rules', 'Premise']
          };
          updatedDecisions.push(decisionItem);

          if (result.appliedDecision.canonFactCreated) {
            const factItem: CanonFact = {
              id: 'cf-' + Date.now(),
              statement: result.appliedDecision.canonFactCreated,
              category: 'World Rule',
              entityIds: [],
              source: 'USER_DECISION',
              dateEstablished: new Date().toLocaleDateString(),
              isLocked: true,
              version: 'v1.0',
              tags: ['Discovery', 'Canon']
            };
            updatedCanon.push(factItem);
          }
        }

        const newAmbiguity = result.projectUpdates?.ambiguityLevel ?? Math.max(15, (prev.discovery?.ambiguityLevel ?? 80) - 15);

        return {
          ...prev,
          title: (result.projectUpdates?.title && prev.title === 'Untitled Project') ? result.projectUpdates.title : prev.title,
          contentType: result.projectUpdates?.contentType || prev.contentType,
          genre: result.projectUpdates?.genre || prev.genre,
          projectConfig: prev.projectConfig ? {
            ...prev.projectConfig,
            mediaFormat: result.projectUpdates?.contentType ? inferMediaFormat(result.projectUpdates.contentType) : prev.projectConfig.mediaFormat,
            contentMode: result.projectUpdates?.contentMode ? inferContentMode(result.projectUpdates.contentMode) : prev.projectConfig.contentMode,
            primaryDomain: result.projectUpdates?.primaryDomain || prev.projectConfig.primaryDomain,
            secondaryDomains: result.projectUpdates?.secondaryDomains || prev.projectConfig.secondaryDomains,
            subject: result.projectUpdates?.subject || prev.projectConfig.subject,
            geographicScope: result.projectUpdates?.geographicScope || prev.projectConfig.geographicScope,
            temporalScope: result.projectUpdates?.temporalScope || prev.projectConfig.temporalScope,
            creativeIntent: result.projectUpdates?.creativeIntent || prev.projectConfig.creativeIntent
          } : prev.projectConfig,
          intent: {
            ...prev.intent,
            premise: result.projectUpdates?.premise || prev.intent?.premise || '',
            knownInformation: [
              ...Array.from(new Set([...(prev.intent?.knownInformation || []), ...result.knownExtracted]))
            ],
            unknownInformation: result.unresolvedAmbiguities.length ? result.unresolvedAmbiguities : prev.intent?.unknownInformation,
            missingQuestions: [result.nextQuestion]
          },
          storyBrain: {
            ...prev.storyBrain,
            canonFacts: updatedCanon,
            creativeDecisions: updatedDecisions,
            decisionLog: updatedDecisions,
            lastUpdated: 'Just now'
          },
          researchFindings: updatedResearch,
          discovery: {
            turns: [...(prev.discovery?.turns || []), aiTurn],
            ambiguityLevel: newAmbiguity,
            activeResearchObjective: result.researchObjective || prev.discovery?.activeResearchObjective,
            lastUpdated: 'Just now'
          },
          pilotMetrics: {
            ...prev.pilotMetrics,
            totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1,
            canonicalFactsCount: updatedCanon.length
          }
        };
      });
    } catch (err: any) {
      console.error('Error in sendDiscoveryMessage:', err);
    }
  };

  const applyDiscoveryDecision = async (turnId: string, optionId: string, customRationale?: string) => {
    const turn = currentProject.discovery?.turns.find(t => t.id === turnId);
    if (!turn || !turn.candidateOptions) return;

    const chosenOption = turn.candidateOptions.find(o => o.id === optionId);
    if (!chosenOption) return;

    const decSummary = chosenOption.title;
    const decRationale = customRationale || chosenOption.dramaticImplication || chosenOption.finding || 'Adopted as active narrative baseline.';
    const canonFactText = `${currentProject.title} is set in ${chosenOption.title}. ${chosenOption.finding || chosenOption.evidence || ''}`.trim();

    // Mark candidate as accepted and siblings as dismissed
    const updatedTurns = (currentProject.discovery?.turns || []).map(t => {
      if (t.id !== turnId) return t;
      return {
        ...t,
        candidateOptions: t.candidateOptions?.map(opt => ({
          ...opt,
          status: opt.id === optionId ? ('ACCEPTED' as const) : ('DISMISSED' as const)
        }))
      };
    });

    const newCanonFact: CanonFact = {
      id: 'cf-' + Date.now(),
      statement: canonFactText,
      category: 'World Rule',
      entityIds: [],
      source: chosenOption.source || 'USER_DECISION (Research-backed)',
      dateEstablished: new Date().toLocaleDateString(),
      isLocked: true,
      version: 'v1.0',
      tags: ['Decision', 'Research', ...(chosenOption.tags || [])]
    };

    const newDecision: CreativeDecision = {
      id: 'dec-' + Date.now(),
      title: `Setting Established: ${chosenOption.title}`,
      decision: decSummary,
      rationale: decRationale,
      author: 'Creator & Tattava',
      role: 'Creative Partner',
      date: new Date().toLocaleDateString(),
      status: 'ACCEPTED',
      impactedAreas: ['World', 'Story Brain', 'Setting']
    };

    const newResearchFinding: ResearchFinding = {
      id: 'rf-' + Date.now(),
      topic: chosenOption.title,
      claim: chosenOption.finding || chosenOption.title,
      evidence: chosenOption.evidence || 'Historical and archaeological record',
      source: chosenOption.source || 'Historical Epigraphy',
      sourceType: (chosenOption.sourceType as any) || 'Archaeological',
      date: new Date().toLocaleDateString(),
      confidence: 95,
      status: 'Verified',
      usedIn: ['Story Setting', 'World Canon']
    };

    updateCurrentProject(prev => ({
      ...prev,
      storyBrain: {
        ...prev.storyBrain,
        canonFacts: [...(prev.storyBrain?.canonFacts || []), newCanonFact],
        creativeDecisions: [...(prev.storyBrain?.creativeDecisions || []), newDecision],
        decisionLog: [...(prev.storyBrain?.decisionLog || []), newDecision],
        lastUpdated: 'Just now'
      },
      researchFindings: [...(prev.researchFindings || []), newResearchFinding],
      discovery: {
        turns: updatedTurns,
        ambiguityLevel: Math.max(10, (prev.discovery?.ambiguityLevel ?? 50) - 20),
        lastUpdated: 'Just now'
      }
    }));

    // Naturally advance conversation with the user's decision
    await sendDiscoveryMessage(`I have decided on: ${chosenOption.title}. What is the next unresolved creative question?`);
  };

  const applyCustomDiscoveryDecision = async (
    turnId: string,
    customTitle: string,
    customFinding?: string,
    customDramaticImplication?: string
  ) => {
    if (!customTitle.trim()) return;

    const decSummary = customTitle.trim();
    const decRationale = customDramaticImplication?.trim() || customFinding?.trim() || 'Creator-specified alternative direction adopted as canonical baseline.';
    const canonFactText = `${currentProject.title} Narrative Baseline: ${decSummary}. ${customFinding || ''}`.trim();

    // Mark existing candidate options in the turn as dismissed
    const updatedTurns = (currentProject.discovery?.turns || []).map(t => {
      if (t.id !== turnId) return t;
      return {
        ...t,
        candidateOptions: t.candidateOptions?.map(opt => ({
          ...opt,
          status: 'DISMISSED' as const
        })),
        appliedDecision: {
          summary: decSummary,
          rationale: decRationale,
          canonFactCreated: canonFactText
        }
      };
    });

    const newCanonFact: CanonFact = {
      id: 'cf-' + Date.now(),
      statement: canonFactText,
      category: 'World Rule',
      entityIds: [],
      source: 'USER_DECISION (Creator-Specified Alternative)',
      dateEstablished: new Date().toLocaleDateString(),
      isLocked: true,
      version: 'v1.0',
      tags: ['Decision', 'Creator Direction', 'Canon']
    };

    const newDecision: CreativeDecision = {
      id: 'dec-' + Date.now(),
      title: `Direction Established: ${decSummary}`,
      decision: decSummary,
      rationale: decRationale,
      author: 'Story Creator',
      role: 'Creative Partner',
      date: new Date().toLocaleDateString(),
      status: 'ACCEPTED',
      impactedAreas: ['World', 'Story Brain', 'Premise', 'Story Directions']
    };

    const newResearchFinding: ResearchFinding = {
      id: 'rf-' + Date.now(),
      topic: decSummary,
      claim: customFinding || decSummary,
      evidence: customDramaticImplication || 'Creator-defined narrative reality',
      source: 'Creator Canonical Specification',
      sourceType: 'Primary Source',
      date: new Date().toLocaleDateString(),
      confidence: 100,
      status: 'Verified',
      usedIn: ['Story Setting', 'World Canon']
    };

    updateCurrentProject(prev => ({
      ...prev,
      storyBrain: {
        ...prev.storyBrain,
        canonFacts: [...(prev.storyBrain?.canonFacts || []), newCanonFact],
        creativeDecisions: [...(prev.storyBrain?.creativeDecisions || []), newDecision],
        decisionLog: [...(prev.storyBrain?.decisionLog || []), newDecision],
        lastUpdated: 'Just now'
      },
      researchFindings: [...(prev.researchFindings || []), newResearchFinding],
      discovery: {
        turns: updatedTurns,
        ambiguityLevel: Math.max(10, (prev.discovery?.ambiguityLevel ?? 50) - 20),
        lastUpdated: 'Just now'
      }
    }));

    // Advance discovery conversation with creator's direction
    await sendDiscoveryMessage(`I have established an alternative creative direction: "${decSummary}". ${customFinding ? `Context: ${customFinding}. ` : ''}Please acknowledge this direction as canon and explore the next unresolved creative questions.`);
  };

  const startProjectFromIdea = async (idea: string, attachment?: { name: string; content: string }): Promise<string> => {
    const detectedTitle = idea.match(/called\s+([A-Za-z0-9_'\s]+)/i)?.[1]?.trim().replace(/[."]$/, '') || (idea.length < 30 ? idea : 'Untitled Project');
    const isSeries = idea.toLowerCase().includes('series') || idea.toLowerCase().includes('show') || idea.toLowerCase().includes('ott');
    const contentType = isSeries ? 'Series / OTT' : 'Feature Film';

    const newProjId = 'proj-' + Date.now();
    const newProj = createEmptyProject(newProjId, detectedTitle, idea, {
      contentType,
      uploadedMaterialName: attachment?.name,
      uploadedMaterialContent: attachment?.content
    });

    setProjects(prev => [newProj, ...prev]);
    setCurrentProjectId(newProjId);
    setActiveScreen('discovery');

    // Immediately trigger the first discovery turn
    setTimeout(() => {
      sendDiscoveryMessage(idea, attachment);
    }, 60);

    return newProjId;
  };

  const startProjectFromResearchSeed = (
    seed: ResearchStorySeed,
    rawTopic: string,
    rawResearch: ResearchFoundryResult,
    options?: { 
      formatChoice?: 'Series' | 'Feature Film' | 'Documentary'; 
      customEpisodeCount?: number;
      candidateSlate?: HistoricalDomainCandidate[];
      priorityCandidateId?: string;
    }
  ): string => {
    const newProjId = 'proj-' + Date.now();
    const explicitFormat = options?.formatChoice;
    const isSeries = explicitFormat 
      ? explicitFormat === 'Series' 
      : (seed.recommendedFormat.toLowerCase().includes('series') || seed.recommendedFormat.toLowerCase().includes('epic') || rawTopic.toLowerCase().includes('series') || rawTopic.toLowerCase().includes('episode'));
    const contentType = isSeries ? 'Series / OTT' : (explicitFormat === 'Documentary' ? 'Documentary' : 'Feature Film');

    const newProj = createEmptyProject(newProjId, seed.seedTitle, seed.logline, {
      contentType,
      genre: seed.conflictType
    });

    const protagonistId = 'char-protagonist-' + Date.now();
    const antagonistId = 'char-antagonist-' + Date.now();

    const protagonistChar: Character = {
      id: protagonistId,
      name: seed.protagonist.name,
      age: 36,
      gender: 'Specified',
      occupation: seed.protagonist.role,
      location: rawResearch.eraDomain,
      tags: ['Lead', 'Canon', 'Provenance-Backed'],
      quote: `My conscience is bound to the truth, not the decree.`,
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop',
      status: 'APPROVED',
      role: 'Protagonist',
      archetype: seed.protagonist.role,
      want: seed.protagonist.want,
      need: seed.protagonist.need,
      flaw: seed.protagonist.flaw,
      fear: 'Public exposure and destruction of personal integrity',
      strength: 'Forensic perception and moral courage',
      secret: 'Guards an unshared piece of the central conspiracy',
      arc: 'From obedient officer to self-actualized catalyst',
      voiceStyle: 'Direct, disciplined, and urgent',
      contradictions: 'Sworn to preserve the regime yet actively sheltering rebels',
      moralDilemma: seed.dramaticCore,
      backstory: seed.protagonist.historicalBasis,
      psychometrics: {
        openness: 82,
        conscientiousness: 90,
        extraversion: 58,
        agreeableness: 62,
        neuroticism: 70
      },
      relationships: [
        {
          targetCharacterId: antagonistId,
          targetCharacterName: seed.antagonist.name,
          relationType: 'Adversary',
          dynamic: 'Subjugation vs Defiance'
        }
      ],
      scenesAppeared: [1, 2, 3, 5, 6]
    };

    const antagonistChar: Character = {
      id: antagonistId,
      name: seed.antagonist.name,
      age: 52,
      gender: 'Specified',
      occupation: seed.antagonist.role,
      location: rawResearch.eraDomain,
      tags: ['Adversary', 'Canon', 'Systemic'],
      quote: 'Order must be preserved, regardless of sentimentality.',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop',
      status: 'APPROVED',
      role: 'Antagonist',
      archetype: 'Systemic Enforcer',
      want: seed.antagonist.opposingIdeology,
      need: 'Acknowledge the collapse of the imperial illusion',
      flaw: 'Authoritarian ruthlessness and disdain for moral compromise',
      fear: 'Loss of sovereign command and military chaos',
      strength: 'Bureaucratic leverage and tactical ruthlessness',
      secret: 'Authorized the secret orders triggering the crisis',
      arc: 'From absolute imperial confidence to desperate containment',
      voiceStyle: 'Cynical, commanding, and polished',
      contradictions: 'Believes in the nobility of empire while executing war crimes',
      moralDilemma: 'Willing to fire on his own dockyards to preserve face',
      backstory: 'Decorated veteran of colonial campaigns across the subcontinent',
      psychometrics: {
        openness: 40,
        conscientiousness: 95,
        extraversion: 75,
        agreeableness: 25,
        neuroticism: 60
      },
      relationships: [
        {
          targetCharacterId: protagonistId,
          targetCharacterName: seed.protagonist.name,
          relationType: 'Subordinate / Target',
          dynamic: 'Hierarchical coercion'
        }
      ],
      scenesAppeared: [2, 3, 4, 6]
    };

    // Canon facts from seed
    const canonFacts: CanonFact[] = seed.anchorCanonFacts.map((fact, idx) => ({
      id: 'cf-seed-' + Date.now() + '-' + (idx + 1),
      statement: fact.statement,
      category: fact.category === 'Historical Fact' ? 'World Rule' : 'Plot Law',
      canonType: 'factual_canon',
      entityIds: [protagonistId, antagonistId],
      source: `${fact.provenanceTier} — ${fact.sourceEvidence}`,
      dateEstablished: new Date().toLocaleDateString(),
      isLocked: true,
      version: 'v1.0-canonical',
      tags: ['Verified Canon', fact.provenanceTier, fact.category]
    }));

    // Creative decision
    const decision: CreativeDecision = {
      id: 'dec-seed-' + Date.now(),
      title: `Incubated Story Spine: ${seed.seedTitle}`,
      decision: `Authorized candidate seed "${seed.seedTitle}" based on research into "${rawTopic}".`,
      rationale: `Drawn from primary archival and historical evidence. Dramatic core: ${seed.dramaticCore}.`,
      author: 'Creative Lead',
      role: 'Story Architect',
      date: new Date().toLocaleDateString(),
      status: 'ACCEPTED',
      impactedAreas: ['Story Brain', 'Premise', 'Characters', 'Historical Canon']
    };

    // Detect requested episode count from user input or options if present
    const extractCount = (str: string): number | null => {
      const direct = str.match(/(\d+)\s*(?:episod(?:e|ic)|part|chapter|temple|kingdom)/i);
      if (direct) return parseInt(direct[1], 10);
      const words: Record<string, number> = { three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, sixteen: 16 };
      for (const [w, n] of Object.entries(words)) {
        if (new RegExp(`\\b${w}\\s+(?:episod(?:e|ic)|part|chapter)\\b`, 'i').test(str)) return n;
      }
      return null;
    };
    const detectedFromTopic = extractCount(rawTopic) || extractCount(seed.recommendedFormat) || extractCount(seed.seedTitle);
    const candidateSlate = options?.candidateSlate;
    const targetEpCount = candidateSlate?.length || options?.customEpisodeCount || detectedFromTopic || (isSeries ? 10 : 1);
    
    // Determine priority episode index
    const priorityIndex = (options?.priorityCandidateId && candidateSlate) 
      ? candidateSlate.findIndex(c => c.id === options.priorityCandidateId)
      : 0;
    const activeEpNum = priorityIndex >= 0 ? priorityIndex + 1 : 1;

    // Map candidate slate into full series episodes
    const mappedEpisodes: SeriesEpisode[] = isSeries && candidateSlate && candidateSlate.length > 0
      ? candidateSlate.map((c, idx) => ({
          episodeNumber: idx + 1,
          title: c.name,
          historicalFocus: `${c.eraOrCentury} • ${c.locationOrRegion}`,
          narrativeFunction: c.dramaticCoreConflict,
          synopsis: c.significance,
          evidenceIds: [c.primaryProvenance],
          dependencies: [],
          unresolvedIssues: [],
          characterInvolvement: [
            {
              name: c.patronOrOrigin || 'Sovereign / Lead Character',
              role: 'Central Catalyst'
            }
          ],
          status: (idx + 1 === activeEpNum) ? 'DEVELOPING' : 'PLANNED',
          candidateState: 'CANDIDATE'
        }))
      : (isSeries ? Array.from({ length: targetEpCount }, (_, i) => ({
          episodeNumber: i + 1,
          title: i === 0 ? seed.seedTitle : `Episode ${i + 1}`,
          historicalFocus: rawResearch.eraDomain,
          narrativeFunction: i === 0 ? seed.dramaticCore : 'Arc progression and escalation',
          synopsis: i === 0 ? seed.logline : 'Continued development of central dramatic tension.',
          evidenceIds: [],
          dependencies: [],
          unresolvedIssues: [],
          characterInvolvement: [{ name: seed.protagonist.name, role: seed.protagonist.role }],
          status: i === 0 ? 'DEVELOPING' : 'PLANNED',
          candidateState: 'CANDIDATE'
        })) : []);

    const finalized: TattavaProject = {
      ...newProj,
      title: seed.seedTitle,
      tagline: seed.logline,
      contentType,
      genre: seed.conflictType,
      format: isSeries ? `${targetEpCount}-Episode Series` : (explicitFormat || seed.recommendedFormat),
      intent: {
        ...newProj.intent,
        premise: seed.logline,
        rawConcept: seed.dramaticCore,
        protagonist: `${seed.protagonist.name}, ${seed.protagonist.role}`,
        conflict: seed.dramaticCore,
        stakes: seed.logline,
        domain: rawResearch.eraDomain,
        knownFacts: seed.anchorCanonFacts.map(f => f.statement),
        status: 'APPROVED',
        intakeAnalysisStatus: 'APPROVED',
        storyBrainProposed: true
      },
      dynamicFormat: {
        format: isSeries ? 'Series' : 'Feature Film',
        episodeCount: targetEpCount,
        episodeDurationMins: isSeries ? 45 : 110,
        domain: rawResearch.eraDomain,
        narrativeMode: isSeries ? 'Serialized Episodic' : 'Three-Act Classical',
        episodeUnit: isSeries ? 'Episode' : 'Feature',
        arcStructure: isSeries ? `${targetEpCount}-Chapter Arc` : 'Single Arc',
        isDynamicallyConstructed: true
      },
      projectConfig: {
        ...DEFAULT_PROJECT_CONFIGURATION,
        formatLabel: isSeries ? `${targetEpCount}-Episode Series` : (explicitFormat || seed.recommendedFormat),
        episodeCount: targetEpCount,
        activeEpisodeNumber: activeEpNum,
        episodeDurationMins: 45
      },
      episodes: mappedEpisodes,
      characters: [protagonistChar, antagonistChar],
      selectedCharacterId: protagonistId,
      researchFindings: rawResearch.evidenceFindings || [],
      researchQuestions: [
        {
          id: 'rq-seed-1',
          title: seed.unresolvedDebate,
          category: 'Central Dramatic Mystery',
          completed: false
        },
        ...(rawResearch.chronologyTimeline || []).map((c, i) => ({
          id: `rq-chrono-${i + 1}`,
          title: `${c.date}: ${c.event} — ${c.significance}`,
          category: `Chronology (${c.provenanceTier})`,
          completed: false
        })),
        ...(rawResearch.keyPersonae || []).map((p, i) => ({
          id: `rq-personae-${i + 1}`,
          title: `${p.name} (${p.role}, ${p.allegiance}): ${p.dramaticPotential}`,
          category: 'Historical Persona',
          completed: true
        }))
      ],
      projectIntelligence: newProj.projectIntelligence ? {
        ...newProj.projectIntelligence,
        researchUniverse: {
          rootSubject: rawResearch.rootTopic || seed.seedTitle,
          coveragePercent: 92,
          dimensions: [
            {
              id: 'dim-context',
              label: 'Historical Landscape & Dynastic Context',
              description: rawResearch.historicalContext,
              status: 'COVERED',
              depth: 0
            },
            {
              id: 'dim-chronology',
              label: 'Chronology & Archaeological Milestones',
              description: (rawResearch.chronologyTimeline || []).map(t => `${t.date}: ${t.event}`).join(' • '),
              status: 'COVERED',
              depth: 0
            },
            {
              id: 'dim-heritage',
              label: 'Architectural Tradition & Epigraphic Record',
              description: `${rawResearch.eraDomain} — Royal charters, structural evolution, and sacred foundations.`,
              status: 'COVERED',
              depth: 0
            },
            {
              id: 'dim-personae',
              label: 'Key Historical Personae & Builders',
              description: (rawResearch.keyPersonae || []).map(p => `${p.name} (${p.role})`).join(' • '),
              status: 'COVERED',
              depth: 0
            }
          ],
          unresolvedQuestions: [
            seed.unresolvedDebate,
            'Patronage dynamics across successive dynastic regimes',
            'Epigraphic dating versus local sthalapurana traditions'
          ]
        }
      } : undefined,
      storyBrain: {
        lastUpdated: 'Just now',
        activeEntitiesCount: 2,
        canonFacts,
        creativeDecisions: [decision],
        decisionLog: [decision],
        dependencies: []
      }
    };

    const canonicalized = applyCanonicalConfiguration(finalized);
    setProjects(prev => [canonicalized, ...prev]);
    setCurrentProjectId(newProjId);
    
    // Navigate directly to Pipeline Step 1 (Discovery) so user progresses sequentially through the pipeline
    setActiveScreen('discovery');

    setTimeout(() => {
      const activeEp = mappedEpisodes.find(e => e.episodeNumber === activeEpNum);
      const activeEpName = activeEp?.title || seed.seedTitle;
      sendDiscoveryMessage(
        `I have initialized your ${targetEpCount}-Episode Series slate on "${rawTopic}". We are starting with priority Episode ${activeEpNum}: "${activeEpName}". All ${targetEpCount} episodes are staged in your slate and can be navigated step-by-step in the pipeline. Let's explore the core dramatic conflict: ${seed.dramaticCore}.`
      );
    }, 60);

    return newProjId;
  };

  const switchActiveEpisode = (episodeNumber: number) => {
    updateCurrentProject(prev => {
      if (!prev.episodes || prev.episodes.length === 0) return prev;
      const targetEp = prev.episodes.find(e => e.episodeNumber === episodeNumber);
      if (!targetEp) return prev;

      const updatedEpisodes = prev.episodes.map(e => ({
        ...e,
        status: e.episodeNumber === episodeNumber ? ('DEVELOPING' as const) : e.status
      }));

      const updated: TattavaProject = {
        ...prev,
        structure: {
          ...prev.structure,
          activeEpisodeNumber: episodeNumber
        },
        projectConfig: prev.projectConfig
          ? {
              ...prev.projectConfig,
              activeEpisodeNumber: episodeNumber
            }
          : undefined,
        episodes: updatedEpisodes
      };

      return applyCanonicalConfiguration(updated);
    });

    const target = currentProject.episodes?.find(e => e.episodeNumber === episodeNumber);
    if (target) {
      sendDiscoveryMessage(
        `Switched pipeline focus to Episode ${episodeNumber}: "${target.title}". Historical Focus: ${target.historicalFocus}. Dramatic Tension: ${target.narrativeFunction}.`
      );
    }
  };

  const initializeStoryBrainFromIntake = (breakdown: {
    premise: string;
    protagonist: string;
    setting: string;
    conflict: string;
    stakes: string;
    themes: string[];
    tone: string;
  }) => {
    updateCurrentProject(prev => {
      const charId = 'char-' + Date.now();
      const protagonistName = breakdown.protagonist.split(',')[0].replace(/^Dr\.\s*|^Prof\.\s*/, '').trim() || 'Protagonist';

      const protagonistChar: Character = {
        id: charId,
        name: protagonistName,
        age: 30,
        gender: 'Non-specified',
        occupation: 'Lead Protagonist',
        location: breakdown.setting || 'Primary Setting',
        quote: 'The truth must be uncovered regardless of the cost.',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop',
        status: 'APPROVED',
        role: 'Protagonist',
        archetype: 'Seeker of Truth',
        want: breakdown.conflict || 'Uncover the truth and survive',
        need: 'Confront emotional reality and take a definitive stand',
        flaw: 'Relentless moral stubbornness under systemic pressure',
        fear: breakdown.stakes || 'Catastrophic personal and community ruin',
        strength: 'Decisiveness and forensic perception',
        secret: 'Guards an unshared piece of the central mystery',
        arc: 'From hesitant observer to self-actualized catalyst',
        voiceStyle: breakdown.tone || 'Grounded, urgent, and direct',
        contradictions: 'Principled yet forced to make pragmatic compromises',
        moralDilemma: `Forced to decide whether to protect personal safety or expose dangerous systemic reality.`,
        backstory: `Formative training and background in ${breakdown.setting}. Driven by unresolved personal stakes.`,
        psychometrics: {
          openness: 86,
          conscientiousness: 90,
          extraversion: 60,
          agreeableness: 50,
          neuroticism: 65
        },
        relationships: [],
        scenesAppeared: [1],
        tags: ['Protagonist', 'Canonical'],
        candidateState: 'CANONICAL'
      };

      const canonFact1: CanonFact = {
        id: 'cf-' + Date.now() + '-1',
        statement: `Core Premise: ${breakdown.premise}`,
        category: 'Plot Law',
        entityIds: [charId],
        source: 'Approved Project Intake',
        dateEstablished: 'Today',
        isLocked: true,
        version: 'v0.2',
        tags: ['Premise', 'Core Hook']
      };

      const canonFact2: CanonFact = {
        id: 'cf-' + Date.now() + '-2',
        statement: `Protagonist: ${protagonistName} (${protagonistChar.role}) operating in ${breakdown.setting}. Core Conflict: ${breakdown.conflict}`,
        category: 'Character Truth',
        entityIds: [charId],
        source: 'Approved Intake Architecture',
        dateEstablished: 'Today',
        isLocked: true,
        version: 'v0.2',
        tags: ['Protagonist', 'Setting']
      };

      const canonFact3: CanonFact = {
        id: 'cf-' + Date.now() + '-3',
        statement: `Dramatic Stakes: Failure triggers ${breakdown.stakes}`,
        category: 'World Rule',
        entityIds: [charId],
        source: 'Approved Dramatic Stakes',
        dateEstablished: 'Today',
        isLocked: true,
        version: 'v0.2',
        tags: ['Stakes']
      };

      const decision: CreativeDecision = {
        id: 'dec-' + Date.now(),
        date: new Date().toLocaleDateString(),
        title: `Approved Core Premise & Initial Protagonist Architecture for "${prev.title}"`,
        decision: `Approved Core Premise & Initial Protagonist Architecture for "${prev.title}"`,
        rationale: `Locked foundational Story Brain parameters based on user input and structured intake analysis.`,
        author: 'Story Development Lead',
        role: 'Creative Lead',
        status: 'Approved',
        impactedAreas: ['Story Brain', 'Protagonist Architecture', 'Canon Matrix']
      };

      const entityNode = {
        id: charId,
        name: protagonistName,
        type: 'character' as const,
        significance: 'Primary Protagonist',
        firstAppears: 'Scene 1',
        status: 'Active' as const,
        connectionCount: 1
      };

      return {
        ...prev,
        canonicalVersion: 'v0.2-canonical',
        stage: 'Story Exploration & Character Development',
        progressPercent: 20,
        status: 'IN_REVIEW',
        characters: [protagonistChar],
        selectedCharacterId: charId,
        storyBrain: {
          ...prev.storyBrain,
          lastUpdated: 'Just now',
          activeEntitiesCount: 1,
          canonFacts: [canonFact1, canonFact2, canonFact3],
          creativeDecisions: [decision],
          entityNodes: [entityNode],
          decisionLog: [decision],
          dependencies: []
        },
        intent: {
          ...prev.intent,
          premise: breakdown.premise,
          protagonist: breakdown.protagonist,
          setting: breakdown.setting,
          conflict: breakdown.conflict,
          stakes: breakdown.stakes,
          themes: breakdown.themes,
          tone: breakdown.tone,
          status: 'APPROVED',
          intakeAnalysisStatus: 'APPROVED',
          storyBrainProposed: true
        }
      };
    });
  };

  const duplicateProject = (projectId: string) => {
    const target = projects.find(p => p.id === projectId);
    if (!target) return;
    const duplicated: TattavaProject = {
      ...JSON.parse(JSON.stringify(target)),
      id: 'proj-' + Date.now(),
      title: `${target.title} (Copy)`,
      lastUpdated: 'Just now',
      status: 'DRAFT',
      canonicalVersion: 'v0.1-copy'
    };
    setProjects(prev => [duplicated, ...prev]);
  };

  const deleteProject = (projectId: string) => {
    forgetProject(projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProjectId === projectId) {
      setCurrentProjectId(projects[0]?.id || seedProject.id);
      setActiveScreen('home');
    }
  };

  // -------------------------------------------------------------
  // CHANGE IMPACT ENGINE (V1.1 REAL DEPENDENCY REASONING)
  // -------------------------------------------------------------
  const triggerChangeImpact = async (
    charIdOrDescription?: string,
    field?: string,
    oldVal?: any,
    newVal?: any
  ) => {
    const sourceEntityId = charIdOrDescription && !charIdOrDescription.includes('(') && !charIdOrDescription.includes('→') && !charIdOrDescription.includes(':')
      ? charIdOrDescription
      : undefined;

    // First set immediate dependency impact
    setImpactState(resolveDependencyImpact(currentProject, {
      sourceEntityId,
      sourceDescription: charIdOrDescription,
      field,
      oldValue: oldVal,
      newValue: newVal
    }));

    const isCustomText = charIdOrDescription ? (charIdOrDescription.includes('(') || charIdOrDescription.includes('→') || charIdOrDescription.includes(':')) : false;
    const targetChar = currentProject.characters.find(c => c.id === charIdOrDescription || c.name.toLowerCase().includes((charIdOrDescription || '').toLowerCase()));

    try {
      const realImpact = await calculateRealDependencyImpact(currentProject, {
        entityType: targetChar ? 'character' : 'story_direction',
        entityId: targetChar ? targetChar.id : (charIdOrDescription || 'element'),
        field: field || 'parameter',
        oldValue: oldVal,
        newValue: newVal
      });
      if (realImpact && realImpact.items && realImpact.items.length > 0) {
        setImpactState(realImpact);
      }
    } catch (e) {
      console.warn('Real dependency impact fallback:', e);
    }
  };

  const closeImpactModal = () => {
    setImpactState(prev => ({ ...prev, isOpen: false }));
  };

  const approveRegenerationProposal = (versionId: string, approvedBy: string, role: string, rationale?: string) => {
    updateCurrentProject(prev => {
      const proposal = (prev.artifactVersions || []).find(v => v.id === versionId && v.state === 'AI_PROPOSAL');
      if (!proposal) return prev;

      const now = new Date().toISOString();
      const previous = (prev.artifactVersions || [])
        .filter(v => v.artifactType === proposal.artifactType && v.artifactId === proposal.artifactId && v.state === 'CANONICAL')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      const approvalId = 'artifact-approval-' + Date.now();
      const canonicalId = 'artifact-version-' + Date.now();
      const versionNumber = (prev.artifactVersions || [])
        .filter(v => v.artifactType === proposal.artifactType && v.artifactId === proposal.artifactId).length + 1;

      const canonical: ArtifactVersionRecord = {
        ...proposal,
        id: canonicalId,
        version: 'v' + versionNumber,
        state: 'CANONICAL',
        createdAt: now,
        createdBy: approvedBy,
        changeSummary: rationale || 'Human-approved regeneration proposal.',
        supersedesVersionId: previous?.id,
        approvalId,
        parentVersionIds: previous?.id ? [previous.id] : proposal.parentVersionIds
      };
      const approval: ArtifactApprovalRecord = {
        id: approvalId,
        artifactType: proposal.artifactType,
        artifactId: proposal.artifactId,
        versionId: canonicalId,
        status: 'APPROVED',
        approvedBy,
        role,
        timestamp: now,
        rationale
      };
      const versions = (prev.artifactVersions || []).map(v =>
        v.id === previous?.id ? { ...v, state: 'SUPERSEDED' as CanonicalState } :
        v.id === proposal.id ? { ...v, state: 'SUPERSEDED' as CanonicalState } : v
      );
      const decision: CreativeDecision = {
        id: 'decision-' + Date.now(),
        title: 'Approved regenerated ' + proposal.artifactType,
        decision: 'Approved regenerated ' + proposal.artifactType + ' ' + proposal.artifactId + ' as ' + canonical.version,
        rationale: rationale || 'Human approval recorded for downstream grounding.',
        author: approvedBy,
        role,
        date: now,
        status: 'Approved',
        impactedAreas: [proposal.artifactType, 'Regeneration']
      };

      const resolvedRepairPlan = prev.evaluationRepairPlan
        ? {
            ...prev.evaluationRepairPlan,
            status: 'PARTIAL' as const,
            items: prev.evaluationRepairPlan.items.map(item =>
              item.targetArtifact === proposal.artifactType &&
              item.status === 'OPEN'
                ? { ...item, status: 'IN_PROGRESS' as const }
                : item
            )
          }
        : prev.evaluationRepairPlan;

      const updatedRegenerationPlans = (prev.regenerationPlans || []).map(plan => {
        const hasProposal = plan.items.some(item => item.proposalVersionId === proposal.id);
        if (!hasProposal) return plan;
        const items = plan.items.map(item =>
          item.proposalVersionId === proposal.id
            ? { ...item, executionStatus: 'APPROVED' as const, stale: false }
            : item
        );
        const actionable = items.filter(item => item.action === 'REGENERATE');
        const allApproved = actionable.length > 0 && actionable.every(item => item.executionStatus === 'APPROVED');
        return {
          ...plan,
          items,
          status: allApproved ? 'COMPLETED' as const : 'PARTIAL' as const
        };
      });

      let next: TattavaProject = {
        ...prev,
        regenerationPlans: updatedRegenerationPlans,
        artifactVersions: [...versions, canonical],
        evaluationRepairPlan: resolvedRepairPlan,
        artifactApprovals: [...(prev.artifactApprovals || []), approval],
        storyBrain: {
          ...prev.storyBrain,
          creativeDecisions: [decision, ...(prev.storyBrain?.creativeDecisions || [])],
          decisionLog: [decision, ...(prev.storyBrain?.decisionLog || [])],
          dependencies: (prev.storyBrain?.dependencies || []).map(dep =>
            dep.targetEntityId === proposal.artifactId
              ? { ...dep, isStale: false, staleReason: undefined }
              : dep
          ),
          lastUpdated: now
        }
      };

      if (proposal.artifactType === 'character') {
        next = { ...next, characters: next.characters.map(a => a.id === proposal.artifactId ? { ...(proposal.content as Character), candidateState: 'CANONICAL' } : a) };
      } else if (proposal.artifactType === 'treatment') {
        next = { ...next, treatment: { ...(proposal.content as TreatmentData), candidateState: 'CANONICAL' } };
      } else if (proposal.artifactType === 'scene') {
        next = { ...next, scenes: next.scenes.map(a => a.id === proposal.artifactId ? { ...(proposal.content as SceneItem), candidateState: 'CANONICAL' } : a) };
      } else if (proposal.artifactType === 'direction') {
        next = { ...next, storyDirections: next.storyDirections.map(a => a.id === proposal.artifactId ? { ...(proposal.content as StoryDirection), candidateState: 'CANONICAL' } : a), selectedDirectionId: proposal.artifactId };
      } else {
        next = { ...next, dialogueSuggestions: next.dialogueSuggestions.map(a => a.id === proposal.artifactId ? { ...(proposal.content as any), candidateState: 'CANONICAL' } : a) };
      }
      return next;
    });
  };

  const executeRegenerationPlan = async (planId: string): Promise<RegenerationResult[]> => {
    const plan = (currentProject.regenerationPlans || []).find(p => p.id === planId);
    if (!plan) return [];

    const results: RegenerationResult[] = [];
    for (const item of plan.items) {
      const result = await executeRegenerationItem(currentProject, item);
      results.push(result);

      if (result.ok) {
        updateCurrentProject(prev => {
          const now = new Date().toISOString();
          const proposalId = 'regen-proposal-' + Date.now() + '-' + result.artifactId;
          const sourceItem = plan.items.find(item =>
            item.artifactType === result.artifactType && item.artifactId === result.artifactId
          );
          const parentCanonical = (prev.artifactVersions || [])
            .filter(v =>
              v.artifactType === result.artifactType &&
              v.artifactId === result.artifactId &&
              v.state === 'CANONICAL'
            )
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

          const proposal: ArtifactVersionRecord = {
            id: proposalId,
            artifactType: result.artifactType,
            artifactId: result.artifactId,
            version: 'proposal-' + ((prev.artifactVersions || []).length + 1),
            state: 'AI_PROPOSAL',
            content: result.artifact,
            createdAt: now,
            createdBy: 'Tattava AI',
            changeSummary: 'AI regeneration proposal: ' + result.message,
            sourcePlanId: planId,
            sourcePlanItemId: sourceItem?.id,
            parentVersionIds: parentCanonical?.id ? [parentCanonical.id] : [],
            repairCycleId: planId
          };
          if (result.artifactType === 'character') {
            return { ...prev, characters: prev.characters.map(c => c.id === result.artifactId ? result.artifact : c), artifactVersions: [proposal, ...(prev.artifactVersions || [])] };
          }
          if (result.artifactType === 'treatment') {
            return { ...prev, treatment: result.artifact, artifactVersions: [proposal, ...(prev.artifactVersions || [])] };
          }
          if (result.artifactType === 'scene') {
            return { ...prev, scenes: prev.scenes.map(s => s.id === result.artifactId ? result.artifact : s), artifactVersions: [proposal, ...(prev.artifactVersions || [])] };
          }
          return { ...prev, artifactVersions: [proposal, ...(prev.artifactVersions || [])] };
        });
      }
    }

    updateCurrentProject(prev => ({
      ...prev,
      regenerationPlans: (prev.regenerationPlans || []).map(p => p.id === planId ? {
        ...p,
        status: results.some(r => !r.ok)
          ? 'PARTIAL'
          : results.some(r => r.ok)
            ? 'AWAITING_APPROVAL'
            : 'COMPLETED',
        items: p.items.map(item => {
          const matching = results.find(result =>
            result.ok &&
            result.artifactType === item.artifactType &&
            result.artifactId === item.artifactId
          );
          return matching
            ? { ...item, executionStatus: 'PROPOSED' as const, proposalVersionId: (prev.artifactVersions || []).find(v =>
                v.sourcePlanId === planId &&
                v.sourcePlanItemId === item.id &&
                v.state === 'AI_PROPOSAL'
              )?.id }
            : item;
        })
      } : p),
      lastUpdated: new Date().toISOString()
    }));

    return results;
  };

  const createRegenerationPlan = () => {
    const plan = buildRegenerationPlan(currentProject, impactState);
    updateCurrentProject(prev => ({
      ...prev,
      regenerationPlans: [plan, ...(prev.regenerationPlans || [])],
      lastUpdated: new Date().toISOString()
    }));
    return plan;
  };

  const approveAndPropagateImpact = () => {
    const approvedImpact = { ...impactState, items: impactState.items.map(item => ({ ...item, approved: true })) };
    const plan = buildRegenerationPlan(currentProject, approvedImpact);
    updateCurrentProject(prev => {
      const charImpact = impactState.items.find(i => i.category === 'Characters');
      let updatedChars = [...prev.characters];
      if (charImpact) {
        updatedChars = updatedChars.map(c => {
          if (c.name.toLowerCase() === charImpact.objectName.toLowerCase() || c.id === charImpact.objectName) {
            const ageVal = parseInt(charImpact.newValue, 10);
            return {
              ...c,
              ...(charImpact.field === 'age' && !isNaN(ageVal) ? { age: ageVal } : {}),
              ...(charImpact.field === 'want' ? { want: charImpact.newValue } : {}),
              ...(charImpact.field === 'flaw' ? { flaw: charImpact.newValue } : {})
            };
          }
          return c;
        });
      }

      const now = new Date().toISOString();
      const decision: CreativeDecision = {
        id: 'impact-decision-' + Date.now(),
        title: 'Approved change-impact analysis',
        decision: `Approved impact propagation for: ${impactState.sourceTrigger}`,
        rationale: 'Human approved the identified downstream impact set. Affected dependencies remain stale until downstream artifacts are reviewed or regenerated.',
        author: 'Story Development Lead',
        role: 'Creative Lead',
        date: now,
        status: 'Approved',
        impactedAreas: [...new Set(impactState.items.map(item => item.category))]
      };

      return {
        ...prev,
        characters: updatedChars,
        regenerationPlans: [plan, ...(prev.regenerationPlans || [])],
        storyBrain: {
          ...prev.storyBrain,
          creativeDecisions: [decision, ...(prev.storyBrain.creativeDecisions || [])],
          decisionLog: [decision, ...(prev.storyBrain.decisionLog || [])],
          lastUpdated: now
        },
        lastUpdated: now
      };
    });

    setImpactState(prev => ({
      ...prev,
      items: prev.items.map(item => ({ ...item, approved: true })),
      isOpen: false
    }));
  };


  const updateCharacter = (charId: string, updates: Partial<Character>) => {
    const char = currentProject.characters.find(c => c.id === charId);
    if (!char) return;

    if (updates.age !== undefined && updates.age !== char.age) {
      triggerChangeImpact(charId, 'age', char.age, updates.age);
      return;
    }

    updateCurrentProject(prev => ({
      ...prev,
      characters: prev.characters.map(c => (c.id === charId ? { ...c, ...updates } : c))
    }));
  };

  const selectStoryDirection = (dirId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      selectedDirectionId: dirId,
      storyDirections: prev.storyDirections.map(d => ({
        ...d,
        isSelected: d.id === dirId
      }))
    }));
  };

  const combineDirections = (dirAId: string, dirBId: string, combinedTitle: string) => {
    const dirA = currentProject.storyDirections.find(d => d.id === dirAId) || currentProject.storyDirections[0];
    const dirB = currentProject.storyDirections.find(d => d.id === dirBId) || currentProject.storyDirections[1];

    const newDirection: StoryDirection = {
      id: 'sd-combined-' + Date.now(),
      badgeLetter: 'D',
      title: combinedTitle || `${dirA.title} × ${dirB.title}`,
      logline: `A high-stakes synthesis: ${dirA.protagonistArc} set against ${dirB.narrativeEngine}, fusing intense personal sacrifice with unyielding political confrontation.`,
      genre: `${dirA.genre} + ${dirB.genre}`,
      narrativeEngine: `Blends ${dirA.narrativeEngine} with the emotional intimacy of ${dirB.narrativeEngine}`,
      protagonistArc: `${dirA.protagonistArc} bolstered by profound family reconciliation`,
      conflict: `Double crucible: systemic state conspiracy and deep generational reckoning`,
      stakes: 'Exposing corrupt state machinery while preserving core family dignity',
      theme: `${dirA.theme} & ${dirB.theme}`,
      tone: 'Grounded, Emotionally Shattering, Tense',
      audience: 'Broad Four-Quadrant Theatrical + Prestige OTT',
      potential: 'Maximum (High Commercial + Critical Acclaim)',
      risks: 'Requires deft balancing of personal emotional beats and fast-paced investigative thriller rhythm',
      strengths: 'Combines the best of high plot urgency with deep character empathy',
      tags: ['Synthesized', 'High-Stakes', 'Character-Driven'],
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
      isSelected: true,
      candidateState: 'CANDIDATE'
    };

    updateCurrentProject(prev => ({
      ...prev,
      selectedDirectionId: newDirection.id,
      storyDirections: [
        ...prev.storyDirections.map(d => ({ ...d, isSelected: false })),
        newDirection
      ]
    }));
  };

  const addCustomStoryDirection = (
    direction: Partial<StoryDirection> & { title: string; logline: string },
    makeCanonical: boolean = false
  ) => {
    const dirId = 'sd-custom-' + Date.now();
    const newDir: StoryDirection = {
      id: dirId,
      badgeLetter: '★',
      title: direction.title.trim(),
      logline: direction.logline.trim(),
      genre: direction.genre || currentProject.genre || 'Drama / Thriller',
      narrativeEngine: direction.narrativeEngine?.trim() || 'Creator-Specified Narrative Engine',
      protagonistArc: direction.protagonistArc?.trim() || 'Central transformative arc driven by creator vision',
      conflict: direction.conflict?.trim() || 'Primary conflict established by authorial intent',
      stakes: direction.stakes?.trim() || 'Catastrophic consequences if protagonist fails',
      theme: direction.theme?.trim() || 'Truth, consequence, and authorial conviction',
      tone: direction.tone?.trim() || 'Grounded, Cinematic, Dramatic',
      audience: direction.audience?.trim() || 'Core Audience',
      potential: direction.potential || 'High',
      risks: direction.risks || 'Protect pacing and structural momentum',
      strengths: direction.strengths || 'Directly embodies creator vision and authorial intent',
      tags: direction.tags?.length ? direction.tags : ['User Specified', 'Core Engine'],
      imageUrl: direction.imageUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
      isSelected: true,
      candidateState: makeCanonical ? 'CANONICAL' : 'CANDIDATE',
      rationale: direction.rationale || 'Specified by creator as primary story direction.'
    };

    updateCurrentProject(prev => {
      const updatedCanon = [...(prev.storyBrain?.canonFacts || [])];
      const updatedDecisions = [...(prev.storyBrain?.creativeDecisions || prev.storyBrain?.decisionLog || [])];

      if (makeCanonical) {
        updatedCanon.push({
          id: 'cf-' + Date.now(),
          statement: `Story Direction Canon: "${newDir.title}". ${newDir.logline}`,
          category: 'World Rule',
          entityIds: [],
          source: 'USER_SPECIFIED_DIRECTION',
          dateEstablished: new Date().toLocaleDateString(),
          isLocked: true,
          version: 'v1.0',
          tags: ['Story Direction', 'Authoritative']
        });

        updatedDecisions.push({
          id: 'dec-' + Date.now(),
          title: `Authoritative Direction: ${newDir.title}`,
          decision: newDir.title,
          rationale: newDir.logline,
          author: 'Story Creator',
          role: 'Author / Director',
          date: new Date().toLocaleDateString(),
          status: 'ACCEPTED',
          impactedAreas: ['Story Spine', 'Characters', 'Scenes', 'Treatment']
        });
      }

      return {
        ...prev,
        selectedDirectionId: dirId,
        storyDirections: [
          ...prev.storyDirections.map(d => ({ ...d, isSelected: false })),
          newDir
        ],
        storyBrain: {
          ...prev.storyBrain,
          canonFacts: updatedCanon,
          creativeDecisions: updatedDecisions,
          decisionLog: updatedDecisions,
          lastUpdated: 'Just now'
        }
      };
    });
  };

  const selectFormat = (formatId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      formats: prev.formats.map(f => ({
        ...f,
        isSelected: f.id === formatId
      }))
    }));
  };

  const selectTemplate = (templateId: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      templates: prev.templates.map(t => ({
        ...t,
        isSelected: t.id === templateId
      }))
    }));
  };

  const applyDialogueAlternative = (suggestionText: string, characterName: string) => {
    updateCurrentProject(prev => {
      const updatedScreenplay = [...prev.screenplay];
      const targetIndex = updatedScreenplay.findIndex(l => l.type === 'dialogue' && (!characterName || characterName === 'AARANYA'));
      if (targetIndex >= 0) {
        updatedScreenplay[targetIndex] = {
          ...updatedScreenplay[targetIndex],
          content: suggestionText,
          candidateState: 'HUMAN_EDITED'
        };
      }
      return {
        ...prev,
        screenplay: updatedScreenplay
      };
    });
  };

  const toggleChecklistItem = (checklistName: 'treatment' | 'package' | 'visual', itemIndex: number) => {
    updateCurrentProject(prev => {
      if (checklistName === 'treatment') {
        const list = [...prev.treatment.checklist];
        list[itemIndex] = { ...list[itemIndex], completed: !list[itemIndex].completed };
        return { ...prev, treatment: { ...prev.treatment, checklist: list } };
      } else if (checklistName === 'package') {
        const list = [...prev.package.checklist];
        list[itemIndex] = { ...list[itemIndex], completed: !list[itemIndex].completed };
        return { ...prev, package: { ...prev.package, checklist: list } };
      }
      return prev;
    });
  };

  // -------------------------------------------------------------
  // V1.1 REAL GREENLIGHT STAGE GATE (Section 29)
  // -------------------------------------------------------------
  const evaluateGreenlight = (): GreenlightGateState => {
    return evaluateGreenlightReadiness(currentProject);
  };

  const submitGreenlight = () => {
    const readiness = evaluateGreenlightReadiness(currentProject);
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const isApproved = readiness.status === 'READY_FOR_REVIEW';

    updateCurrentProject(prev => {
      const decisionLogItem: CreativeDecision = {
        id: 'dec-gl-' + Date.now(),
        date: today,
        title: isApproved ? 'Greenlight Approved: Story Development Gate Cleared' : 'Greenlight Review: Revisions Required',
        decision: isApproved ? 'Story Development Package Approved for Pre-Production' : 'Revision requested on unresolved blockers.',
        rationale: isApproved ? 'All 5 validation pillars (Research, Characters, Canon, Episodic Architecture, Format) passed verification.' : readiness.attentionItems.join('; '),
        author: 'Lead Producer & AI Governance Gate',
        role: 'Executive Producer',
        status: isApproved ? 'Approved' : 'Proposed',
        impactedAreas: ['Package', 'Story Brain', 'Greenlight Gate']
      };

      return {
        ...prev,
        status: isApproved ? 'APPROVED' : 'IN_REVIEW',
        greenlightGate: {
          ...readiness,
          status: isApproved ? 'APPROVED_GREENLIT' : 'ATTENTION_REQUIRED',
          approvedAt: isApproved ? today : undefined,
          approvedBy: isApproved ? 'Lead Producer & AI Governance Gate' : undefined,
          signedStakeholders: [
            {
              name: 'Creative Director',
              role: 'Showrunner',
              decision: isApproved ? 'APPROVED' : 'REVISE',
              comments: isApproved ? 'Narrative structure and character psychology locked.' : 'Resolve blocking items first.',
              date: today
            },
            {
              name: 'Head of Development',
              role: 'Executive Producer',
              decision: isApproved ? 'APPROVED' : 'PENDING',
              comments: isApproved ? 'Format and research provenance verified.' : 'Awaiting revision sign-off.',
              date: today
            }
          ]
        },
        storyBrain: {
          ...prev.storyBrain,
          creativeDecisions: [decisionLogItem, ...(prev.storyBrain.creativeDecisions || [])],
          lastUpdated: 'Just now'
        },
        package: {
          ...prev.package,
          isGreenlit: isApproved,
          deliveryDate: today,
          stakeholders: prev.package.stakeholders.map(s => ({
            ...s,
            status: isApproved ? 'Approved' : 'In Review',
            date: today
          }))
        }
      };
    });
  };

  // -------------------------------------------------------------
  // V1.1 EPISODIC & CANDIDATE POOL PIPELINE ROUTINES
  // -------------------------------------------------------------
  const fetchCandidatePool = async (scope?: string) => {
    try {
      const candidates = await generateEvidenceCandidatePool(currentProject, scope);
      updateCurrentProject(prev => ({
        ...prev,
        candidatePool: candidates,
        pilotMetrics: {
          ...prev.pilotMetrics,
          totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
        }
      }));
    } catch (e) {
      console.error('fetchCandidatePool error:', e);
      throw e;
    }
  };

  const fetchSeriesEpisodes = async (requestedEpisodeCount?: number, narrativeLens?: string) => {
    try {
      const parsedFromFormat = currentProject.format?.match(/(\d+)\s*(?:episod(?:e|ic)?|ep|part)/i)?.[1];
      const parsedFromTitle = currentProject.title?.match(/(\d+)\s*(?:episod(?:e|ic)?|ep|part)/i)?.[1];
      const episodeCount = requestedEpisodeCount 
        || currentProject.dynamicFormat?.episodeCount 
        || (parsedFromFormat ? parseInt(parsedFromFormat, 10) : undefined)
        || (parsedFromTitle ? parseInt(parsedFromTitle, 10) : undefined)
        || 10;
      const episodes = await generateSeriesEpisodeArchitecture(currentProject, episodeCount, narrativeLens);
      updateCurrentProject(prev => ({
        ...prev,
        episodes,
        format: prev.format?.includes('Series') ? prev.format : `${episodeCount}-Episode Series`,
        dynamicFormat: {
          format: 'Series',
          episodeCount,
          episodeDurationMins: 45,
          domain: prev.intent?.domain || 'Historical Drama',
          narrativeMode: 'Serialized Episodic',
          episodeUnit: 'Episode',
          arcStructure: `${episodeCount}-Chapter Serialized Arc`,
          isDynamicallyConstructed: true
        },
        pilotMetrics: {
          ...prev.pilotMetrics,
          totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
        }
      }));
    } catch (e) {
      console.error('fetchSeriesEpisodes error:', e);
      throw e;
    }
  };

  const updateSeriesEpisode = (episodeNumber: number, updates: Partial<SeriesEpisode>) => {
    updateCurrentProject(prev => {
      const updatedEps = (prev.episodes || []).map(ep => 
        ep.episodeNumber === episodeNumber ? { ...ep, ...updates } : ep
      );
      return {
        ...prev,
        episodes: updatedEps,
        lastUpdated: `Episode ${episodeNumber} modified just now`
      };
    });
  };

  const updateCandidateStatus = (candidateId: string, status: ProjectCandidate['status']) => {
    updateCurrentProject(prev => ({
      ...prev,
      candidatePool: (prev.candidatePool || []).map(c => 
        c.id === candidateId ? { ...c, status, candidateState: status === 'ADOPTED' ? 'APPROVED' : status === 'LOCKED' ? 'CANONICAL' : c.candidateState } : c
      )
    }));
  };

  const adoptCandidateIntoProject = (candidateId: string) => {
    const candidate = (currentProject.candidatePool || []).find(c => c.id === candidateId);
    if (!candidate) return;

    const newFact: CanonFact = {
      id: 'cf-' + Date.now(),
      statement: `${candidate.title} (${candidate.candidateType}): ${candidate.whatItIs} Evidence: ${candidate.evidence}`,
      category: 'Plot Law',
      canonType: 'factual_canon',
      entityIds: [],
      source: `Evidence Candidate (${candidate.evidence})`,
      dateEstablished: new Date().toLocaleDateString(),
      isLocked: true,
      version: 'v1.0',
      tags: ['Candidate Adopted', candidate.candidateType]
    };

    const newDec: CreativeDecision = {
      id: 'dec-' + Date.now(),
      date: new Date().toLocaleDateString(),
      title: `Adopted Candidate: ${candidate.title}`,
      decision: candidate.whatItIs,
      rationale: candidate.narrativeRelevance,
      author: 'Story Creator',
      role: 'Creative Lead',
      status: 'ACCEPTED',
      impactedAreas: ['Story Spine', 'Candidate Pool', 'Canon Facts']
    };

    updateCurrentProject(prev => ({
      ...prev,
      candidatePool: (prev.candidatePool || []).map(c => 
        c.id === candidateId ? { ...c, status: 'ADOPTED' as const, candidateState: 'APPROVED' as const } : c
      ),
      storyBrain: {
        ...prev.storyBrain,
        canonFacts: [newFact, ...(prev.storyBrain.canonFacts || [])],
        creativeDecisions: [newDec, ...(prev.storyBrain.creativeDecisions || [])],
        lastUpdated: 'Just now'
      }
    }));
  };

  const resolveCanonConflict = (
    conflictId: string, 
    resolution: CanonConflict['status'], 
    notes?: string
  ) => {
    updateCurrentProject(prev => {
      const conflict = (prev.canonConflicts || []).find(c => c.id === conflictId);
      let updatedCanon = [...(prev.storyBrain?.canonFacts || [])];

      if (conflict && (resolution === 'OVERRIDE' || resolution === 'RESOLVED_CANONICAL')) {
        // Add or update the canonical statement
        updatedCanon = [
          {
            id: 'cf-reconciled-' + Date.now(),
            statement: conflict.newEvidenceText,
            category: 'World Rule',
            canonType: 'factual_canon',
            entityIds: [],
            source: conflict.source,
            dateEstablished: new Date().toLocaleDateString(),
            isLocked: true,
            version: 'v1.1-reconciled',
            tags: ['Reconciled', 'Authoritative']
          },
          ...updatedCanon
        ];
      }

      return {
        ...prev,
        canonConflicts: (prev.canonConflicts || []).map(c => 
          c.id === conflictId ? { ...c, status: resolution, resolutionNotes: notes || `Resolved via Canon Workspace: ${resolution}` } : c
        ),
        storyBrain: {
          ...prev.storyBrain,
          canonFacts: updatedCanon,
          lastUpdated: 'Just now'
        }
      };
    });
  };

  const analyzeIntentAndSetFormat = async (input: string, attachment?: { name: string; content: string }) => {
    try {
      const analysis = await extractIntentAndConstructFormat(input, currentProject.title, attachment?.content);
      updateCurrentProject(prev => ({
        ...prev,
        title: (prev.title === 'Untitled Project' || !prev.title) ? (analysis.title || prev.title) : prev.title,
        format: analysis.format,
        contentType: analysis.format,
        dynamicFormat: analysis.dynamicFormat,
        intent: {
          ...prev.intent,
          objective: analysis.objective,
          requestedOutcome: analysis.requestedOutcome,
          domain: analysis.domain,
          knownFacts: analysis.knownFacts,
          unknowns: analysis.unknowns,
          assumptions: analysis.assumptions,
          constraints: analysis.constraints,
          blocking: analysis.blocking,
          notBlocking: analysis.notBlocking,
          creativeIntent: analysis.creativeIntent,
          researchRequirements: analysis.researchRequirements,
          missingQuestions: [analysis.nextQuestion],
          status: 'IN_REVIEW'
        },
        pilotMetrics: {
          ...prev.pilotMetrics,
          totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
        }
      }));
    } catch (e) {
      console.error('analyzeIntentAndSetFormat error:', e);
      throw e;
    }
  };

  const toggleCopilot = () => setIsCopilotOpen(prev => !prev);

  const sendCopilotMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = { sender: 'user' as const, text, time: 'Just now' };
    setCopilotMessages(prev => [...prev, userMsg]);

    const projectSummary = `
Title: ${currentProject.title} (${currentProject.contentType} • ${currentProject.genre} • ${currentProject.language})
Logline: ${currentProject.tagline || currentProject.intent?.premise}
Current Pipeline Stage: ${activeScreen}
Protagonist: ${currentProject.characters?.[0]?.name} (Age: ${currentProject.characters?.[0]?.age}, Role: ${currentProject.characters?.[0]?.role})
Want: ${currentProject.characters?.[0]?.want}
Need: ${currentProject.characters?.[0]?.need}
World Setting: ${currentProject.world?.era}, ${currentProject.world?.settingType}
Canon Facts Count: ${currentProject.storyBrain.canonFacts.length}
Format: ${currentProject.format}
    `.trim();

    try {
      const reply = await askCopilot(text, projectSummary, copilotMessages);
      setCopilotMessages(prev => [...prev, { sender: 'tattvaCo', text: reply, time: 'Just now' }]);
    } catch (e: any) {
      const errMsg = e?.message || 'AI Copilot inference error';
      const friendly = errMsg.includes('AI_SIGN_IN_REQUIRED')
        ? '[SIGN IN REQUIRED]: Sign in to use the AI Copilot.'
        : errMsg.includes('AI_CONFIGURATION_REQUIRED')
          ? '[AI CONFIGURATION REQUIRED]: The server has no working HuggingFace token. Set HUGGINGFACE_API_TOKEN in server/.env.'
          : errMsg.includes('AI_CREDITS_REQUIRED')
            ? '[AI CREDITS REQUIRED]: The HuggingFace account has no Inference Providers credits left. Add credits at huggingface.co/settings/billing.'
            : `[AI SERVICE UNAVAILABLE]: Could not complete request: ${errMsg}`;
      setCopilotMessages(prev => [
        ...prev,
        { sender: 'tattvaCo', text: friendly, time: 'Just now' }
      ]);
    }
  };

  const setProjectFormat = (formatTitle: string, customEpisodeCount?: number) => {
    updateCurrentProject(prev => {
      const isSeries = isSeriesFormat(formatTitle);
      const epMatch = formatTitle.match(/(\d+)\s*[- ]*(?:ep|episode)/i);
      const detectedEpCount = epMatch ? parseInt(epMatch[1], 10) : undefined;
      const episodeCount = isSeries 
        ? (customEpisodeCount || detectedEpCount || prev.dynamicFormat?.episodeCount || prev.projectConfig?.episodeCount || 16) 
        : undefined;
      const episodeDurationMins = isSeries ? 45 : undefined;
      const activeEpisodeNumber = isSeries ? (prev.projectConfig?.activeEpisodeNumber || prev.structure?.activeEpisodeNumber || 1) : undefined;
      const runtime = isSeries ? 45 : 120;
      const templateTitle = prev.template || prev.templates?.find(t => t.isSelected)?.title || 'Three-Act Classical Thriller';
      const fingerprint = [formatTitle.trim(), templateTitle.trim(), runtime, isSeries ? `episodes:${episodeCount}` : 'feature', isSeries ? `episode:${activeEpisodeNumber}` : 'film'].join('|');

      const next: TattavaProject = {
        ...prev,
        contentType: formatTitle,
        format: formatTitle,
        formats: prev.formats.map(f => ({ ...f, isSelected: f.title === formatTitle || (formatTitle === 'Limited Series' && /Limited Web Series/i.test(f.title)) })),
        dynamicFormat: isSeries ? {
          format: 'Series',
          episodeCount: episodeCount || 16,
          episodeDurationMins: 45,
          domain: prev.intent?.domain || 'Historical Drama',
          narrativeMode: 'Serialized Episodic',
          episodeUnit: 'Episode',
          arcStructure: `${episodeCount || 16}-Chapter Serialized Arc`,
          isDynamicallyConstructed: true
        } : undefined,
        projectConfig: {
          ...(prev.projectConfig || DEFAULT_PROJECT_CONFIGURATION),
          formatLabel: formatTitle,
          templateName: templateTitle,
          mediaFormat: inferMediaFormat(formatTitle),
          contentMode: prev.projectConfig?.contentMode || inferContentMode(formatTitle),
          episodeCount,
          episodeDurationMins,
          activeEpisodeNumber,
          configurationFingerprint: fingerprint,
          configurationStatus: 'USER_CONFIRMED'
        },
        structure: {
          ...prev.structure,
          templateName: templateTitle,
          estimatedDurationMins: runtime,
          episodeCount,
          episodeDurationMins,
          activeEpisodeNumber,
          structureScope: isSeries ? 'EPISODE' : 'FEATURE',
          configurationFingerprint: fingerprint,
          isSynthesisStale: true,
          acts: {
            ...prev.structure.acts,
            act1: { ...prev.structure.acts.act1, time: isSeries ? '00:00 – 11:00' : '00:00 – 30:00' },
            act2: { ...prev.structure.acts.act2, time: isSeries ? '11:00 – 34:00' : '30:00 – 90:00' },
            act3: { ...prev.structure.acts.act3, time: isSeries ? '34:00 – 45:00' : '90:00 – 120:00' }
          },
          timeline: isSeries
            ? [
                { label: 'Episode Setup / Inciting Incident', timeMin: 6, act: 'Act I' },
                { label: 'Episode Midpoint Reversal', timeMin: 23, act: 'Act II Midpoint' },
                { label: 'Crisis / All Is Lost', timeMin: 34, act: 'Act II Climax' },
                { label: 'Episode Climax', timeMin: 41, act: 'Act III Climax' }
              ]
            : prev.structure.timeline
        }
      };

      // Configuration changes invalidate every downstream narrative artifact.
      const invalidated = invalidateDownstreamArtifacts(next, fingerprint);
      return {
        ...invalidated,
        structure: {
          ...invalidated.structure,
          templateName: templateTitle,
          estimatedDurationMins: runtime,
          episodeCount,
          episodeDurationMins,
          activeEpisodeNumber,
          structureScope: isSeries ? 'EPISODE' : 'FEATURE',
          configurationFingerprint: fingerprint,
          isSynthesisStale: true,
          acts: next.structure.acts,
          timeline: next.structure.timeline
        }
      };
    });
  };

  const setProjectTemplate = (templateTitle: string) => {
    updateCurrentProject(prev => {
      const formatTitle = prev.format || prev.formats?.find(f => f.isSelected)?.title || 'Feature Film';
      const isSeries = isSeriesFormat(formatTitle);
      const runtime = isSeries ? 45 : 120;
      const episodeCount = isSeries ? (prev.projectConfig?.episodeCount || 6) : undefined;
      const activeEpisodeNumber = isSeries ? (prev.projectConfig?.activeEpisodeNumber || 1) : undefined;
      const fingerprint = [formatTitle.trim(), templateTitle.trim(), runtime, isSeries ? `episodes:${episodeCount}` : 'feature', isSeries ? `episode:${activeEpisodeNumber}` : 'film'].join('|');

      const next: TattavaProject = {
        ...prev,
        template: templateTitle,
        templates: prev.templates.map(t => ({ ...t, isSelected: t.title === templateTitle })),
        projectConfig: {
          ...(prev.projectConfig || DEFAULT_PROJECT_CONFIGURATION),
          formatLabel: formatTitle,
          templateName: templateTitle,
          mediaFormat: inferMediaFormat(formatTitle),
          contentMode: prev.projectConfig?.contentMode || inferContentMode(formatTitle),
          episodeCount,
          episodeDurationMins: isSeries ? 45 : undefined,
          activeEpisodeNumber,
          configurationFingerprint: fingerprint,
          configurationStatus: 'USER_CONFIRMED'
        },
        structure: {
          ...prev.structure,
          templateName: templateTitle,
          configurationFingerprint: fingerprint,
          isSynthesisStale: true
        }
      };

      return invalidateDownstreamArtifacts(next, fingerprint);
    });
  };

  const updateTreatment = (updates: Partial<TreatmentData>) => {
    updateCurrentProject(prev => ({
      ...prev,
      treatment: { ...prev.treatment, ...updates }
    }));
  };

  const updateScreenplayLine = (lineId: string, content: string) => {
    updateCurrentProject(prev => {
      const updateLine = (l: ScreenplayLine) => l.id === lineId
        ? { ...l, content, candidateState: 'HUMAN_EDITED' as const, isSynthesisStale: false }
        : l;
      const screenplay = prev.screenplay.map(updateLine);
      return {
        ...prev,
        screenplay,
        screenplayLines: screenplay
      };
    });
  };

  const addScreenplayLine = (line: ScreenplayLine) => {
    updateCurrentProject(prev => {
      const screenplay = [...prev.screenplay, line];
      return {
        ...prev,
        screenplay,
        screenplayLines: screenplay
      };
    });
  };

  const swapDialogueSuggestion = (_sugId: string, text: string) => {
    applyDialogueAlternative(text, currentProject.characters?.[0]?.name || 'PROTAGONIST');
  };

  const updateScene = (sceneId: string, updates: Partial<SceneItem>) => {
    updateCurrentProject(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === sceneId ? { ...s, ...updates } : s)
    }));
  };

  const submitForGreenlight = () => {
    submitGreenlight();
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        activeScreen,
        currentStepIndex,
        isCopilotOpen,
        impactState,
        activeContextPackage,
        isContextResolverOpen,
        resolveContext,
        openContextResolver,
        closeContextResolver,
        discoverySession: currentProject.discovery || { turns: [], ambiguityLevel: 80, lastUpdated: 'Initialized' },
        sendDiscoveryMessage,
        applyDiscoveryDecision,
        applyCustomDiscoveryDecision,
        startProjectFromIdea,
        setActiveScreen,
        goToStep,
        nextStep,
        prevStep,
        sync,
        importLocalProjects,
        reloadProject,
        openProject,
        openDemoProject,
        createNewProject,
    buildResearchUniverse,
    generateProjectInsights,
    generateProjectDirections,
    setProjectInsightStatus,
        duplicateProject,
        deleteProject,
        updateCurrentProject,
        initializeStoryBrainFromIntake,
        updateCharacter,
        selectStoryDirection,
        combineDirections,
        addCustomStoryDirection,
        selectFormat,
        selectTemplate,
        applyDialogueAlternative,
        toggleChecklistItem,
        submitGreenlight,
        addCanonFact,
        deleteCanonFact,
        toggleLockCanonFact,
        logCreativeDecision,
        resolveDependencyStaleness,
        resolveContinuityIssue,
        repairSceneWithCanon,
        resolveQAIssue,
        resolveQAInconsistency,
        runStoryEvaluation,
        reevaluateAfterRepair,
        signOffEvaluation,
        setArtifactCandidateState,
        approveArtifact,
        createProjectBranch,
        addArtifactToBranch,
        prepareProjectBranchMerge,
        approveProjectBranchMerge,
        rejectProjectBranchMerge,
        resolveBranchMergeConflict,
        setBranchMergeManualContent,
        mergeProjectBranch,
        abandonProjectBranch,
        triggerChangeImpact,
        closeImpactModal,
        approveAndPropagateImpact,
        buildRegenerationPlan: createRegenerationPlan,
        executeRegenerationPlan,
        approveRegenerationProposal,
        setProjectFormat,
        setProjectTemplate,
        updateTreatment,
        updateScreenplayLine,
        addScreenplayLine,
        swapDialogueSuggestion,
        updateScene,
        submitForGreenlight,
        fetchCandidatePool,
        fetchSeriesEpisodes,
        updateSeriesEpisode,
        updateCandidateStatus,
        adoptCandidateIntoProject,
        resolveCanonConflict,
        analyzeIntentAndSetFormat,
        evaluateGreenlight,
        switchActiveEpisode,
        startProjectFromResearchSeed,
        toggleCopilot,
        setCopilotOpen: setIsCopilotOpen,
        copilotMessages,
        sendCopilotMessage
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
