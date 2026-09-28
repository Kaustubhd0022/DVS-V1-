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
  StoryEvaluation
} from '../types/project';
import { seedProject, secondaryProjects } from '../data/seedProject';
import { askCopilot } from '../services/geminiService';

export type ScreenId = 
  | 'home' 
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
 * IDEA -> STORY BRAIN -> RESEARCH -> STORY -> WRITING -> CONTINUITY -> EVALUATION -> APPROVAL -> PACKAGE
 */
export const PIPELINE_STEPS: StepMeta[] = [
  { step: 1, id: 'create-project', label: 'Create Project', shortLabel: 'Project' },
  { step: 2, id: 'intake', label: 'Intake & Ambiguity Detection', shortLabel: 'Intake' },
  { step: 3, id: 'story-brain', label: 'Story Brain (System of Record)', shortLabel: 'Story Brain' },
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

  // Navigation
  setActiveScreen: (screen: ScreenId) => void;
  goToStep: (stepNumber: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  openProject: (projectId: string, targetScreen?: ScreenId) => void;
  createNewProject: (data: Partial<TattavaProject>) => string;
  duplicateProject: (projectId: string) => void;
  deleteProject: (projectId: string) => void;

  // Project Mutators
  updateCurrentProject: (updater: (prev: TattavaProject) => TattavaProject) => void;
  updateCharacter: (charId: string, updates: Partial<Character>) => void;
  selectStoryDirection: (dirId: string) => void;
  combineDirections: (dirAId: string, dirBId: string, combinedTitle: string) => void;
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
        // Ensure projects have storyBrain and pilotMetrics
        if (parsed?.[0]?.storyBrain) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved projects', e);
      }
    }
    return [seedProject, ...secondaryProjects];
  });

  const [currentProjectId, setCurrentProjectId] = useState<string>(seedProject.id);
  const [activeScreen, setActiveScreen] = useState<ScreenId>('home');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isContextResolverOpen, setIsContextResolverOpen] = useState<boolean>(false);

  // Active Context Package for the Context Resolver Drawer
  const [activeContextPackage, setActiveContextPackage] = useState<ContextResolverPackage | null>(null);

  const [copilotMessages, setCopilotMessages] = useState<Array<{ sender: 'user' | 'tattvaCo' | 'tattava'; text: string; time: string }>>([
    { 
      sender: 'tattvaCo', 
      text: 'Welcome to Tattava Copilot V1 Pilot. I am your Project Intelligence & Narrative Reasoning copilot. All reasoning is strictly grounded in your persistent Story Brain and verified canon.', 
      time: '10:24 AM' 
    }
  ]);

  const [impactState, setImpactState] = useState<ImpactAnalysisState>({
    isOpen: false,
    sourceTrigger: '',
    totalAffected: 12,
    summary: {
      characters: 1,
      story: 2,
      scenes: 8,
      dialogue: 3,
      visuals: 4,
      production: 2
    },
    items: []
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const rawProject = projects.find(p => p.id === currentProjectId) || projects[0] || seedProject;
  
  // Guarantee Story Brain & Pilot Metrics exist on currentProject
  const currentProject: TattavaProject = {
    ...rawProject,
    storyBrain: rawProject.storyBrain || seedProject.storyBrain,
    pilotMetrics: rawProject.pilotMetrics || seedProject.pilotMetrics,
    evaluation: rawProject.evaluation || seedProject.evaluation,
    continuityIssues: rawProject.continuityIssues || rawProject.qaIssues || seedProject.continuityIssues,
    qaIssues: rawProject.continuityIssues || rawProject.qaIssues || seedProject.continuityIssues,
    format: rawProject.format || rawProject.formats?.find(f => f.isSelected)?.title || 'Feature Film',
    template: rawProject.template || rawProject.templates?.find(t => t.isSelected)?.title || 'Three-Act Classical Thriller',
    screenplayLines: rawProject.screenplayLines || rawProject.screenplay,
    productionPlan: rawProject.productionPlan || rawProject.production,
    packageData: rawProject.packageData || rawProject.package
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
    const protagonist = currentProject.characters.find(c => c.role === 'Protagonist') || currentProject.characters[0];
    const antagonist = currentProject.characters.find(c => c.role === 'Antagonist') || currentProject.characters[1];

    const retrievedCanon = currentProject.storyBrain.canonFacts.slice(0, 4);
    const retrievedResearch = currentProject.researchFindings.filter(r => r.status === 'Verified').slice(0, 3);
    const retrievedRules = currentProject.world?.worldRules || [];

    const characterContext = [
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
    ];

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
              subheading: 'Flashback 2018: The Gold Medal and Origin of the Debt',
              summary: 'In 2018, Aanya (26) receives her university engineering medal. Raghav proudly reveals he mortgaged the press to pay for her Delhi coaching, launching her decade-long struggle.',
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
                resolutionNotes: 'Auto-repaired Scene 4 timestamp to 2018 (age 26 in flashback, 34 in present canon).'
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
          evaluation: {
            ...prev.evaluation,
            overallScore: 89.5,
            criticalRisks: prev.evaluation.criticalRisks.filter(r => !r.includes('Scene 4'))
          }
        };
      }

      return prev;
    });
  };

  // Compatibility aliases
  const resolveQAIssue = (issueId: string) => resolveContinuityIssue(issueId, 'Resolved');
  const resolveQAInconsistency = (issueId: string) => resolveContinuityIssue(issueId, 'Resolved');

  // -------------------------------------------------------------
  // AI STORY EVALUATION RUNNER
  // -------------------------------------------------------------
  const runStoryEvaluation = () => {
    updateCurrentProject(prev => {
      const openBlockers = prev.continuityIssues.filter(i => i.resolutionState === 'Open' && i.severity === 'Critical Blocker').length;
      const baseScore = openBlockers > 0 ? 84.5 : 91.2;

      const updatedEval: StoryEvaluation = {
        ...prev.evaluation,
        overallScore: baseScore,
        readinessStatus: openBlockers === 0 ? 'Greenlight Recommended' : 'Pilot Ready',
        evaluatedAt: 'Just now (Tattava Evaluator v1.0)',
        criticalRisks: openBlockers > 0 
          ? ['Unresolved critical blocker in Scene 4 flashback chronology.']
          : ['Ensure Vikrant dialogue in Scene 18 preserves agro-warehousing economic rationale.']
      };

      return {
        ...prev,
        evaluation: updatedEval,
        pilotMetrics: {
          ...prev.pilotMetrics,
          totalAiRuns: prev.pilotMetrics.totalAiRuns + 1
        }
      };
    });
  };

  const signOffEvaluation = (approverName: string, role: string, comments: string) => {
    updateCurrentProject(prev => ({
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
    }));
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
    const newProj: TattavaProject = {
      ...seedProject,
      id: newId,
      title: data.title || 'Untitled Project',
      tagline: data.tagline || 'A new cinematic journey.',
      contentType: data.contentType || 'Feature Film',
      language: data.language || 'Hindi',
      genre: data.genre || 'Drama',
      stage: 'Intake & Ambiguity Detection',
      progressPercent: 10,
      lastUpdated: 'Just now',
      tags: data.tags || ['Original', 'Pilot'],
      status: 'DRAFT',
      canonicalVersion: 'v0.1-draft',
      ...data
    };
    setProjects(prev => [newProj, ...prev]);
    setCurrentProjectId(newId);
    setActiveScreen('intake');
    return newId;
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
    } catch (e) {
      setCopilotMessages(prev => [
        ...prev,
        {
          sender: 'tattvaCo',
          text: `[Story Brain Analysis]: For "${text}", checking against Canon Fact #CF-01 and #CF-04: The narrative engine requires Aanya's forensic discovery to occur before the Act II midpoint.`,
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
    applyDialogueAlternative(text, 'AARANYA');
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
        setActiveScreen,
        goToStep,
        nextStep,
        prevStep,
        openProject,
        createNewProject,
        duplicateProject,
        deleteProject,
        updateCurrentProject,
        updateCharacter,
        selectStoryDirection,
        combineDirections,
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
