import { TattvaCoProject } from '../types/project';

/**
 * Creates a clean, unpopulated Tattava project derived strictly from user input.
 * No hardcoded characters, no hardcoded canon facts, no pre-filled research, no fake evaluations.
 */
export const createEmptyProject = (
  id: string,
  title: string,
  premise: string,
  options: {
    contentType?: string;
    language?: string;
    genre?: string;
    uploadedMaterialName?: string;
    uploadedMaterialContent?: string;
  } = {}
): TattvaCoProject => {
  const cleanTitle = title?.trim() || 'Untitled Project';
  const cleanPremise = premise?.trim() || '';

  return {
    id,
    title: cleanTitle,
    tagline: cleanPremise ? (cleanPremise.length > 90 ? cleanPremise.slice(0, 87) + '...' : cleanPremise) : 'Project workspace in development.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=900&auto=format&fit=crop',
    contentType: options.contentType || 'Feature Film',
    language: options.language || 'Hindi / English',
    genre: options.genre || 'Drama / Thriller',
    stage: 'Project Intake & Ambiguity Detection',
    progressPercent: 5,
    lastUpdated: 'Just now',
    owner: 'Story Developer',
    visibility: 'Internal Story Team',
    tags: [options.contentType || 'Feature Film', 'Pilot Workspace'],
    teamMembers: [
      {
        id: 'user-1',
        name: 'Lead Story Editor',
        role: 'Story Development Head',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        initials: 'SE'
      }
    ],
    status: 'DRAFT',
    canonicalVersion: 'v0.1-draft',
    isDemo: false,

    // STORY BRAIN — Starts completely EMPTY for new user projects
    storyBrain: {
      lastUpdated: 'Initialized',
      activeEntitiesCount: 0,
      canonFacts: [],
      creativeDecisions: [],
      entityNodes: [],
      decisionLog: [],
      dependencies: []
    },

    // Pilot Instrumentation — Zero baseline
    pilotMetrics: {
      verificationRate: 0,
      continuityCatchRate: 0,
      candidateAcceptanceRate: 0,
      timeToPackageMins: 0,
      activeEntitiesCount: 0,
      canonicalFactsCount: 0,
      totalAiRuns: 0,
      averageLatencyMs: 0
    },

    // Evaluation — Null until user triggers live evaluation
    evaluation: null,

    // Project Intent — Derived solely from user input and uploaded material
    intent: {
      premise: cleanPremise,
      rawConcept: cleanPremise,
      uploadedMaterialName: options.uploadedMaterialName,
      uploadedMaterialContent: options.uploadedMaterialContent,
      protagonist: '',
      setting: '',
      conflict: '',
      stakes: '',
      themes: [],
      tone: '',
      contentType: options.contentType || 'Feature Film',
      language: options.language || 'Hindi / English',
      targetAudience: 'Theatrical & Premium OTT',
      status: 'DRAFT',
      missingQuestions: [],
      ambiguitiesIdentified: [],
      knownInformation: cleanPremise ? ['User-Provided Premise'] : [],
      unknownInformation: ['Protagonist Psychology', 'Antagonistic Force', 'Specific World Rules', 'Timeline Anchor'],
      suggestedResearchAreas: [],
      intakeAnalysisStatus: 'IDLE',
      storyBrainProposed: false
    },

    // Pipeline Modules — Strictly empty until developed
    researchQuestions: [],
    researchFindings: [],
    storyDirections: [],
    selectedDirectionId: '',
    formats: [
      {
        id: 'fmt-feature',
        title: 'Feature Film (110–125 mins)',
        duration: '118 mins',
        description: 'Traditional theatrical pacing with 3 acts and distinct midpoint reversal.',
        isRecommended: true,
        isSelected: true,
        imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop'
      }
    ],
    templates: [
      {
        id: 'tmpl-3act',
        title: 'Three-Act Classical Thriller',
        description: 'Setup, confrontation, and resolution with high-stakes ticking clock.',
        tags: ['Pacing', 'High Stakes', 'Commercial'],
        isSelected: true,
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
      }
    ],
    characters: [],
    selectedCharacterId: '',
    world: {
      title: 'Contemporary Setting',
      era: 'Present Day',
      primaryLocations: [],
      settingType: 'Realistic',
      themes: [],
      languageNote: 'Multilingual',
      heroQuote: '',
      locations: [],
      socioPolitical: '',
      cultureLifestyle: '',
      institutions: '',
      worldRules: []
    },
    structure: {
      templateName: 'Three-Act Classical Structure',
      estimatedDurationMins: 110,
      totalSequences: 8,
      keyTurningPoints: 3,
      emotionalPeaks: 2,
      acts: {
        act1: { title: 'Act I - Setup & Inciting Incident', time: '0-25m', beats: [] },
        act2: { title: 'Act II - Rising Stakes & Confrontation', time: '25-85m', beats: [] },
        act3: { title: 'Act III - Climax & Resolution', time: '85-110m', beats: [] }
      },
      timeline: []
    },
    treatment: {
      version: 'v0.1',
      wordCount: 0,
      logline: cleanPremise,
      synopsis: '',
      themes: [],
      tone: [],
      status: 'DRAFT',
      plotBeats: [],
      checklist: [
        { item: 'Logline Approved', completed: !!cleanPremise },
        { item: 'Core Protagonist Flaw Defined', completed: false },
        { item: 'Act I Inciting Incident Established', completed: false },
        { item: 'Midpoint Reversal Mapped', completed: false },
        { item: 'Climax & Thematic Resolution', completed: false }
      ]
    },
    scenes: [],
    selectedSceneId: '',
    screenplay: [],
    dialogueSuggestions: [],
    continuityIssues: [],
    qaIssues: [],

    // Deferred Modules (preview placeholders)
    visualDev: {
      colorPalette: [],
      keyFrames: [],
      artDirectionNotes: [],
      visualChecklist: []
    },
    production: {
      shootDays: 45,
      keyLocationsCount: 4,
      crewCount: 65,
      budgetTotalCr: 12.5,
      tentativeStart: 'TBD',
      readinessStatus: 'Concept Stage',
      schedulePhases: [],
      budgetCategories: [],
      resources: [],
      locations: [],
      milestones: [],
      risks: [],
      documents: []
    },
    package: {
      stepsCompleted: 1,
      totalSteps: 16,
      deliverablesCount: 0,
      stakeholdersCount: 1,
      deliveryDate: 'Pending Development',
      isGreenlit: false,
      checklist: [
        { name: 'Core Premise & Story Brain Initialized', completed: false },
        { name: 'Protagonist Architecture Established', completed: false },
        { name: 'Traceable Domain Research Verified', completed: false },
        { name: 'Narrative Treatment Finalized', completed: false },
        { name: 'Zero Blocking Continuity Contradictions', completed: false },
        { name: 'AI Narrative Quality Evaluation >= 80%', completed: false }
      ],
      deliverables: [],
      stakeholders: []
    }
  };
};
