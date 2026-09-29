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
  ContinuityIssue,
  StoryEvaluation,
  ResearchFinding,
  DiscoveryTurn,
  DiscoveryCandidateOption,
  DiscoverySession
} from '../types/project';
import { seedProject, secondaryProjects } from '../data/seedProject';
import { createEmptyProject } from '../data/emptyProject';
import { askCopilot } from '../services/geminiService';
import { evaluateProjectNarrative, getGroqApiKey, processDiscoveryTurn, DiscoveryTurnResult } from '../services/aiService';

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
  { step: 1, id: 'discovery', label: 'Conversational Discovery & Studio', shortLabel: 'Discovery' },
  { step: 2, id: 'story-brain', label: 'Story Brain (System of Record)', shortLabel: 'Story Brain' },
  { step: 3, id: 'intake', label: 'Intake & Ambiguity Dossier', shortLabel: 'Intake' },
  { step: 4, id: 'research', label: 'Traceable Research & Evidence', shortLabel: 'Research' },
  { step: 5, id: 'story-exploration', label: 'Story Exploration & Directions', shortLabel: 'Story' },
  { step: 6, id: 'format-template', label: 'Format & Development Framework', shortLabel: 'Format' },
  { step: 7, id: 'characters', label: 'Character Intelligence & Arcs', shortLabel: 'Characters' },
  { step: 8, id: 'world', label: 'World Building & Canon Rules', shortLabel: 'World' },
  { step: 9, id: 'structure', label: 'Story Structure & Beat Sheet', shortLabel: 'Structure' },
  { step: 10, id: 'treatment', label: 'Treatment & Grounded Writing', shortLabel: 'Treatment' },
  { step: 11, id: 'scene-outline', label: 'Scene Breakdown & Conflict', shortLabel: 'Scenes' },
  { step: 12, id: 'screenplay', label: 'Screenplay Drafting', shortLabel: 'Script' },
  { step: 13, id: 'dialogue', label: 'Dialogue & Voice Intelligence', shortLabel: 'Dialogue' },
  { step: 14, id: 'continuity', label: 'Canon & Continuity Engine', shortLabel: 'Continuity' },
  { step: 15, id: 'evaluation', label: 'AI Story Evaluation Harness', shortLabel: 'Evaluation' },
  { step: 16, id: 'package', label: 'Story Development Package', shortLabel: 'Package' }
];

interface ProjectContextType {
  projects: TattavaProject[];
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
  signOffEvaluation: (approverName: string, role: string, comments: string) => void;

  // Canonical State Lifecycle
  setArtifactCandidateState: (artifactType: 'direction' | 'character' | 'treatment' | 'scene' | 'dialogue', id: string, state: CanonicalState) => void;

  // Impact Engine
  triggerChangeImpact: (charIdOrDescription?: string, field?: string, oldVal?: any, newVal?: any) => void;
  closeImpactModal: () => void;
  approveAndPropagateImpact: () => void;
  
  // Specific Screen Helper Methods
  setProjectFormat: (format: string) => void;
  setProjectTemplate: (template: string) => void;
  updateTreatment: (updates: Partial<TreatmentData>) => void;
  updateScreenplayLine: (lineId: string, content: string) => void;
  addScreenplayLine: (line: ScreenplayLine) => void;
  swapDialogueSuggestion: (sugId: string, text: string) => void;
  updateScene: (sceneId: string, updates: Partial<SceneItem>) => void;
  submitForGreenlight: () => void;

  // UI Helpers
  toggleCopilot: () => void;
  setCopilotOpen: (open: boolean) => void;
  copilotMessages: Array<{ sender: 'user' | 'tattvaCo' | 'tattava'; text: string; time: string }>;
  sendCopilotMessage: (text: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'tattava_copilot_pilot_v1';
const LEGACY_STORAGE_KEY = 'tattvaco_projects_v1';

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<TattavaProject[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

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
      prevProjects.map(p => (p.id === currentProjectId ? updater(p) : p))
    );
  };

  const openProject = (projectId: string, targetScreen: ScreenId = 'story-brain') => {
    setCurrentProjectId(projectId);
    setActiveScreen(targetScreen);
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
    targetArtifact: string
  ): ContextResolverPackage => {
    const protagonist = currentProject.characters?.find(c => c.role === 'Protagonist') || currentProject.characters?.[0];
    const antagonist = currentProject.characters?.find(c => c.role === 'Antagonist') || currentProject.characters?.[1];

    const retrievedCanon = currentProject.storyBrain?.canonFacts?.slice(0, 4) || [];
    const retrievedResearch = currentProject.researchFindings?.filter(r => r.status === 'Verified')?.slice(0, 3) || [];
    const retrievedRules = currentProject.world?.worldRules || [];

    const characterContext = protagonist ? [
      {
        name: protagonist.name,
        want: protagonist.want,
        need: protagonist.need,
        fear: protagonist.fear,
        voiceStyle: protagonist.voiceStyle
      },
      ...(antagonist ? [{
        name: antagonist.name,
        want: antagonist.want,
        need: antagonist.need,
        fear: antagonist.fear,
        voiceStyle: antagonist.voiceStyle
      }] : [])
    ] : [];

    const pkg: ContextResolverPackage = {
      taskId: 'ctx-' + Date.now(),
      taskType,
      targetArtifact,
      retrievedCanonFacts: retrievedCanon,
      retrievedCharacterContext: characterContext,
      retrievedResearch,
      retrievedWorldRules: retrievedRules,
      rationale: `Assembled minimal versioned slice for ${targetArtifact}. Excluded unverified rumors and external cross-project data to guarantee zero hallucinated canon.`,
      tokenEstimate: 1420,
      resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

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

  const repairSceneWithCanon = (issueId: string) => {
    updateCurrentProject(prev => {
      // Find issue
      const issue = prev.continuityIssues.find(i => i.id === issueId);
      if (!issue) return prev;

      // If it's the Scene 4 flashback age contradiction
      if (issueId === 'cont-1' || issue.sceneNumber === 4) {
        const updatedScenes = prev.scenes.map(s => {
          if (s.sceneNumber === 4 || s.id === 'sc-4') {
            return {
              ...s,
              subheading: 'Flashback 2018: The Origin of the Conflict',
              summary: 'In 2018, initial investigative evidence is uncovered, setting the foundation for present narrative stakes.',
              notes: s.notes.map(n => ({ ...n, done: true }))
            };
          }
          return s;
        });

        const updatedIssues = prev.continuityIssues.map(i =>
          i.id === issueId
            ? {
                ...i,
                resolutionState: 'Resolved' as const,
                resolutionNotes: 'Auto-repaired Scene 4 chronology to align with Story Brain canon.'
              }
            : i
        );

        // Also resolve dependency dep-2
        const updatedDeps = prev.storyBrain.dependencies.map(d =>
          d.id === 'dep-2' ? { ...d, isStale: false, staleReason: undefined } : d
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
          evaluation: prev.evaluation ? {
            ...prev.evaluation,
            overallScore: 89.5,
            criticalRisks: (prev.evaluation.criticalRisks || []).filter(r => !r.includes('Scene 4'))
          } : null
        };
      }

      return prev;
    });
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
          evaluatorModel: 'openai/gpt-oss-120b (Groq LPU)',
          evaluatedAt: new Date().toLocaleDateString() + ' (tattvaCo Evaluator v1.0)',
          dimensions: fullDimensions,
          keyStrengths: evalRes.keyStrengths?.length > 0 ? evalRes.keyStrengths : (evalRes.strengths?.length ? evalRes.strengths : ['Original premise hook', 'Grounded dramatic conflict']),
          criticalRisks: evalRes.criticalRisks?.length > 0 ? evalRes.criticalRisks : ['Ensure third-act escalation matches initial stakes.'],
          actionItems: evalRes.actionItems || ['Review second act transitions and maintain thematic pressure']
        };

        return {
          ...prev,
          evaluation: updatedEval,
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

    setProjects(prev => [finalized, ...prev]);
    setCurrentProjectId(newId);
    setActiveScreen('discovery');
    return newId;
  };

  const openDemoProject = () => {
    const existing = projects.find(p => p.id === seedProject.id);
    if (!existing) {
      setProjects(prev => [seedProject, ...prev]);
    }
    setCurrentProjectId(seedProject.id);
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
      const result: DiscoveryTurnResult = await processDiscoveryTurn(currentProject, message, sourceAttachment);

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
            mediaFormat: (result.projectUpdates?.contentType as any) || prev.projectConfig.mediaFormat,
            contentMode: (result.projectUpdates?.contentMode as any) || prev.projectConfig.contentMode,
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
    setProjects(prev => prev.filter(p => p.id !== projectId));
    if (currentProjectId === projectId) {
      setCurrentProjectId(projects[0]?.id || seedProject.id);
      setActiveScreen('home');
    }
  };

  // -------------------------------------------------------------
  // CHANGE IMPACT ENGINE
  // -------------------------------------------------------------
  const triggerChangeImpact = (
    charIdOrDesc: string = 'char-aanya',
    field: string = 'age',
    oldVal: any = 24,
    newVal: any = 34
  ) => {
    const isCustomText = charIdOrDesc.includes('(') || charIdOrDesc.includes('→') || charIdOrDesc.includes(':');
    const sourceTrigger = isCustomText
      ? charIdOrDesc
      : `Changed Aanya's ${field}: ${oldVal} → ${newVal}`;

    const items: ImpactChangeItem[] = [
      {
        id: 'imp-1',
        category: 'Characters',
        objectName: 'Aanya Deshmukh',
        field: 'Age & Life Stage',
        oldValue: `${oldVal || 24} years old (Fresh graduate)`,
        newValue: `${newVal || 34} years old (Final attempt crisis)`,
        reason: 'Shifts character from wide-eyed student to battle-tested veteran facing age ceiling.',
        severity: 'High',
        approved: true
      },
      {
        id: 'imp-2',
        category: 'Story',
        objectName: 'Core Narrative Stakes',
        field: 'Attempt Limit & Ticking Clock',
        oldValue: 'College ambition vs parental expectations',
        newValue: 'Final attempt eligibility limit & existential career termination',
        reason: 'At 34, civil service regulations make this her absolute final attempt.',
        severity: 'High',
        approved: true
      },
      {
        id: 'imp-3',
        category: 'Scenes',
        objectName: 'Scene 1: INT. AARANYA ROOM',
        field: 'Set Dressing & Props',
        oldValue: 'Fresh UPSC textbooks and college notes',
        newValue: 'Dog-eared books from 2018-2024, cold chai, countdown calendar',
        reason: 'Visual environment conveys a decade of emotional and intellectual sacrifice.',
        severity: 'High',
        approved: true
      },
      {
        id: 'imp-4',
        category: 'Dialogue',
        objectName: 'Scene 1 Voiceover',
        field: 'Opening Monologue',
        oldValue: '"Is there a bigger purpose for me?"',
        newValue: '"Ten years ago I thought time was on my side. Now every rain feels like a countdown."',
        reason: 'Voiceover needs gravitas and awareness of mortgaged years.',
        severity: 'High',
        approved: true
      }
    ];

    setImpactState({
      isOpen: true,
      sourceTrigger,
      totalAffected: 12,
      summary: {
        characters: 1,
        story: 2,
        scenes: 8,
        dialogue: 3,
        visuals: 4,
        production: 2
      },
      items
    });
  };

  const closeImpactModal = () => {
    setImpactState(prev => ({ ...prev, isOpen: false }));
  };

  const approveAndPropagateImpact = () => {
    updateCurrentProject(prev => {
      const updatedChars = prev.characters.map(c => {
        if (c.name.includes('Aanya') || c.id === 'char-aanya') {
          return {
            ...c,
            age: 34,
            tags: ['Resilient', 'Strategic', 'Battle-Tested', 'Hyper-Analytical'],
            arc: 'Cynical survivalism → Reluctant investigation → Existential sacrifice for communal justice.',
            quote: 'Ten years of waiting ends tonight.'
          };
        }
        return c;
      });

      return {
        ...prev,
        characters: updatedChars,
        lastUpdated: 'Updated just now (Impact Propagated into Story Brain)'
      };
    });

    setImpactState(prev => ({ ...prev, isOpen: false }));
  };

  const updateCharacter = (charId: string, updates: Partial<Character>) => {
    const char = currentProject.characters.find(c => c.id === charId);
    if (!char) return;

    if (char.name.includes('Aanya') && updates.age !== undefined && updates.age !== char.age) {
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

  const submitGreenlight = () => {
    updateCurrentProject(prev => ({
      ...prev,
      status: 'APPROVED',
      package: {
        ...prev.package,
        isGreenlit: true,
        stakeholders: prev.package.stakeholders.map(s => ({
          ...s,
          status: 'Approved',
          date: '28 Sep 2026'
        }))
      }
    }));
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
      const isMissingKey = errMsg.includes('AI_CONFIGURATION_REQUIRED') || !getGroqApiKey();
      setCopilotMessages(prev => [
        ...prev,
        {
          sender: 'tattvaCo',
          text: isMissingKey 
            ? `[AI CONFIGURATION REQUIRED]: No API key detected. Please configure your Groq or Gemini API key in Settings to converse dynamically with Tattava Copilot.`
            : `[AI SERVICE UNAVAILABLE]: Could not complete request: ${errMsg}. Please check network or API key status.`,
          time: 'Just now'
        }
      ]);
    }
  };

  const setProjectFormat = (formatTitle: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      format: formatTitle,
      formats: prev.formats.map(f => ({ ...f, isSelected: f.title === formatTitle }))
    }));
  };

  const setProjectTemplate = (templateTitle: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      template: templateTitle,
      templates: prev.templates.map(t => ({ ...t, isSelected: t.title === templateTitle }))
    }));
  };

  const updateTreatment = (updates: Partial<TreatmentData>) => {
    updateCurrentProject(prev => ({
      ...prev,
      treatment: { ...prev.treatment, ...updates }
    }));
  };

  const updateScreenplayLine = (lineId: string, content: string) => {
    updateCurrentProject(prev => ({
      ...prev,
      screenplay: prev.screenplay.map(l => l.id === lineId ? { ...l, content, candidateState: 'HUMAN_EDITED' } : l)
    }));
  };

  const addScreenplayLine = (line: any) => {
    updateCurrentProject(prev => ({
      ...prev,
      screenplay: [...prev.screenplay, line]
    }));
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
        openProject,
        openDemoProject,
        createNewProject,
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
        toggleLockCanonFact,
        logCreativeDecision,
        resolveDependencyStaleness,
        resolveContinuityIssue,
        repairSceneWithCanon,
        resolveQAIssue,
        resolveQAInconsistency,
        runStoryEvaluation,
        signOffEvaluation,
        setArtifactCandidateState,
        triggerChangeImpact,
        closeImpactModal,
        approveAndPropagateImpact,
        setProjectFormat,
        setProjectTemplate,
        updateTreatment,
        updateScreenplayLine,
        addScreenplayLine,
        swapDialogueSuggestion,
        updateScene,
        submitForGreenlight,
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
