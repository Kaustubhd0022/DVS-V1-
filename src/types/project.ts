export type ApprovalStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'LOCKED';

/**
 * 5-Stage Canonical State Machine as defined in Unified AI-Native Product Specification (Section 11)
 * AI_PROPOSAL -> CANDIDATE -> HUMAN_EDITED -> APPROVED -> CANONICAL (with SUPERSEDED for historical versions)
 */
export type CanonicalState = 'AI_PROPOSAL' | 'CANDIDATE' | 'HUMAN_EDITED' | 'APPROVED' | 'CANONICAL' | 'SUPERSEDED';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  initials: string;
}

export interface ProjectIntent {
  premise: string;
  protagonist: string;
  setting: string;
  conflict: string;
  stakes: string;
  themes: string[];
  tone: string;
  contentType: string;
  language: string;
  targetAudience: string;
  status: ApprovalStatus;
  missingQuestions: string[];
  ambiguitiesIdentified?: string[];
  storyBrainProposed?: boolean;
}

export interface ResearchQuestion {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

export interface ResearchFinding {
  id: string;
  topic: string;
  claim: string;
  evidence: string;
  source: string;
  sourceType: 'Primary Source' | 'Academic' | 'Established Publication' | 'Government' | 'Field Report';
  sourceUrl?: string;
  evidenceQuote?: string;
  implicationForPlot?: string;
  date: string;
  confidence: number;
  status: 'Verified' | 'Needs Review' | 'Conflicting' | 'Insufficient Evidence';
  usedIn: string[];
  imageUrl?: string;
  candidateState?: CanonicalState;
}

export interface StoryDirection {
  id: string;
  badgeLetter: 'A' | 'B' | 'C' | 'D';
  title: string;
  logline: string;
  genre: string;
  narrativeEngine: string;
  protagonistArc: string;
  conflict: string;
  stakes: string;
  theme: string;
  tone: string;
  audience: string;
  potential: string;
  risks: string;
  strengths: string;
  tags: string[];
  imageUrl: string;
  isSelected: boolean;
  candidateState?: CanonicalState;
  rationale?: string;
  compTitles?: string;
}

export interface FormatOption {
  id: string;
  title: string;
  duration: string;
  description: string;
  isRecommended: boolean;
  isSelected: boolean;
  imageUrl: string;
}

export interface TemplateOption {
  id: string;
  title: string;
  description: string;
  tags: string[];
  isSelected: boolean;
  imageUrl: string;
}

export interface CharacterRelationship {
  targetCharacterId: string;
  targetCharacterName: string;
  relationType: string;
  dynamic: string;
}

export interface Character {
  id: string;
  name: string;
  role: 'Protagonist' | 'Antagonist' | 'Mentor' | 'Father' | 'Friend' | 'Supporting';
  age: number;
  gender: string;
  occupation: string;
  location: string;
  tags: string[];
  quote: string;
  photoUrl: string;
  status: ApprovalStatus;
  candidateState?: CanonicalState;
  // Deep Schema as required by Character Intelligence Agent
  want: string;
  need: string;
  fear: string;
  flaw: string;
  strength: string;
  secret: string;
  arc: string;
  voiceStyle: string;
  contradictions: string;
  relationships: CharacterRelationship[];
  scenesAppeared: number[];
}

export interface WorldLocation {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  type: 'Urban' | 'Coastal' | 'Mountain' | 'Town';
  coordinates: { x: number; y: number };
  imageUrl: string;
  isPrimary: boolean;
}

export interface StoryWorld {
  title: string;
  era: string;
  primaryLocations: string[];
  settingType: string;
  themes: string[];
  languageNote: string;
  heroQuote: string;
  locations: WorldLocation[];
  socioPolitical: string;
  cultureLifestyle: string;
  institutions: string;
  worldRules?: string[];
}

export interface StructureBeat {
  id: string;
  number: number;
  act: 'ACT I - SETUP' | 'ACT II - CONFRONTATION' | 'ACT III - RESOLUTION';
  timeRange: string;
  title: string;
  description: string;
  imageUrl: string;
  candidateState?: CanonicalState;
}

export interface StoryTimelineMilestone {
  label: string;
  timeMin: number;
  act: string;
}

export interface StoryStructure {
  templateName: string;
  estimatedDurationMins: number;
  totalSequences: number;
  keyTurningPoints: number;
  emotionalPeaks: number;
  acts: {
    act1: { title: string; time: string; beats: StructureBeat[] };
    act2: { title: string; time: string; beats: StructureBeat[] };
    act3: { title: string; time: string; beats: StructureBeat[] };
  };
  timeline: StoryTimelineMilestone[];
}

export interface PlotBeatItem {
  id: string;
  number: number;
  title: string;
  act: 'ACT I' | 'ACT II' | 'ACT III';
  description: string;
  candidateState?: CanonicalState;
}

export interface TreatmentData {
  version: string;
  wordCount: number;
  logline: string;
  synopsis: string;
  themes: string[];
  tone: string[];
  status: ApprovalStatus;
  candidateState?: CanonicalState;
  plotBeats: PlotBeatItem[];
  checklist: { item: string; completed: boolean }[];
}

export interface SceneItem {
  id: string;
  sceneNumber: number;
  act: 'ACT I - SETUP' | 'ACT II - CONFRONTATION' | 'ACT III - RESOLUTION';
  slugline: string;
  duration: string;
  location: string;
  timeOfDay: 'DAY' | 'NIGHT' | 'EVENING' | 'MORNING';
  intExt: 'INT.' | 'EXT.';
  characters: string[];
  characterIds: string[];
  subheading: string;
  summary: string;
  purpose: string;
  emotionalBeat: string;
  keyElements: string;
  dialogueHighlights: string;
  visualNotes: string;
  imageUrl: string;
  candidateState?: CanonicalState;
  insights: {
    storyRole: string;
    emotionalTone: string;
    pacing: string;
    conflictLevel: 'Low' | 'Medium' | 'High';
    characterFocus: string;
    theme: string;
  };
  notes: { id: string; text: string; done: boolean }[];
}

export interface ScreenplayLine {
  id: string;
  sceneNumber: number;
  type: 'scene_heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition';
  characterName?: string;
  content: string;
  candidateState?: CanonicalState;
}

export interface DialogueSuggestion {
  id: string;
  character: string;
  label: string;
  text: string;
  tone: string;
  candidateState?: CanonicalState;
}

// -------------------------------------------------------------
// STORY BRAIN & CANONICAL PROJECT INTELLIGENCE DEFINITIONS
// -------------------------------------------------------------

export interface CanonFact {
  id: string;
  statement: string;
  category: 'World Rule' | 'Character Truth' | 'Timeline' | 'Institutional Reality' | 'Plot Law';
  entityIds: string[];
  source: string;
  dateEstablished: string;
  isLocked: boolean;
  version: string;
  tags: string[];
}

export interface CreativeDecision {
  id: string;
  title: string;
  rationale: string;
  author: string;
  role: string;
  date: string;
  status: 'Approved' | 'Proposed' | 'Reversed';
  impactedAreas: string[];
}

export interface StoryDependency {
  id: string;
  sourceEntityId: string;
  sourceName: string;
  targetEntityId: string;
  targetName: string;
  dependencyType: 'Character -> Scene' | 'Canon -> Motivation' | 'Research -> Plot' | 'Beat -> Dialogue';
  description: string;
  isStale: boolean;
  staleReason?: string;
}

export interface StoryBrain {
  canonFacts: CanonFact[];
  creativeDecisions: CreativeDecision[];
  dependencies: StoryDependency[];
  activeEntitiesCount: number;
  lastUpdated: string;
}

// -------------------------------------------------------------
// CONTEXT RESOLVER MODEL
// -------------------------------------------------------------

export interface ContextResolverPackage {
  taskId: string;
  taskType: 'Story Direction' | 'Treatment Beat' | 'Scene Drafting' | 'Dialogue Voice' | 'Continuity Check' | 'Evaluation';
  targetArtifact: string;
  retrievedCanonFacts: CanonFact[];
  retrievedCharacterContext: { name: string; want: string; need: string; fear: string; voiceStyle: string }[];
  retrievedResearch: ResearchFinding[];
  retrievedWorldRules: string[];
  rationale: string;
  tokenEstimate: number;
  resolvedAt: string;
}

// -------------------------------------------------------------
// CANON & CONTINUITY ENGINE MODEL
// -------------------------------------------------------------

export interface ContinuityIssue {
  id: string;
  sceneNumber: number;
  category: 'Timeline' | 'Character Motivation' | 'World Rule' | 'Physical Prop' | 'Relationship Dynamic';
  severity: 'Critical Blocker' | 'Warning' | 'Advisory';
  title: string;
  description: string;
  establishedCanonEvidence: string;
  canonSource: string;
  conflictingContentEvidence: string;
  contentLocation: string;
  affectedEntities: string[];
  resolutionState: 'Open' | 'Resolved' | 'Exception Granted';
  resolutionNotes?: string;
  fixAction?: string;
}

// Backward-compatible alias for existing code
export type QAInconsistency = ContinuityIssue;

// -------------------------------------------------------------
// AI STORY EVALUATION HARNESS MODEL
// -------------------------------------------------------------

export interface EvaluationDimension {
  id: string;
  name: string;
  score: number; // 0-100
  weight: number;
  diagnostic: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
}

export interface StoryEvaluation {
  overallScore: number;
  readinessStatus: 'Draft' | 'Needs Revisions' | 'Pilot Ready' | 'Greenlight Recommended';
  dimensions: EvaluationDimension[];
  criticalRisks: string[];
  keyStrengths: string[];
  actionItems: string[];
  evaluatorModel: string;
  evaluatedAt: string;
  humanSignOff?: {
    approvedBy: string;
    role: string;
    date: string;
    comments: string;
  };
}

// -------------------------------------------------------------
// PILOT INSTRUMENTATION & TELEMETRY MODEL
// -------------------------------------------------------------

export interface PilotMetrics {
  verificationRate: number; // % research verified by human
  continuityCatchRate: number; // % contradictions surfaced
  candidateAcceptanceRate: number; // % candidates accepted/edited vs rejected
  timeToPackageMins: number; // estimated or elapsed turnaround
  activeEntitiesCount: number;
  canonicalFactsCount: number;
  totalAiRuns: number;
  averageLatencyMs: number;
}

// -------------------------------------------------------------
// CHANGE IMPACT ANALYSIS MODEL
// -------------------------------------------------------------

export interface ImpactChangeItem {
  id: string;
  category: 'Characters' | 'Story' | 'Scenes' | 'Dialogue' | 'Visuals' | 'Production';
  objectName: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  severity: 'High' | 'Medium' | 'Low';
  approved: boolean;
}

export interface ImpactAnalysisState {
  isOpen: boolean;
  sourceTrigger: string;
  totalAffected: number;
  summary: {
    characters: number;
    story: number;
    scenes: number;
    dialogue: number;
    visuals: number;
    production: number;
  };
  items: ImpactChangeItem[];
}

// -------------------------------------------------------------
// VISUAL DEV & PRODUCTION (LEGACY / DEFERRED)
// -------------------------------------------------------------

export interface VisualKeyFrame {
  id: string;
  code: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface VisualDevData {
  colorPalette: { name: string; hex: string }[];
  keyFrames: VisualKeyFrame[];
  artDirectionNotes: { author: string; time: string; text: string }[];
  visualChecklist: { label: string; done: boolean }[];
}

export interface SchedulePhase {
  name: string;
  dates: string;
  color: string;
  barStartPercent: number;
  barWidthPercent: number;
  subUnits?: { name: string; dates: string; barStartPercent: number; barWidthPercent: number; color: string }[];
}

export interface BudgetItem {
  category: string;
  amountCr: number;
  percent: number;
  color: string;
}

export interface ProductionPlanData {
  shootDays: number;
  keyLocationsCount: number;
  crewCount: number;
  budgetTotalCr: number;
  tentativeStart: string;
  readinessStatus: string;
  schedulePhases: SchedulePhase[];
  budgetCategories: BudgetItem[];
  resources: { name: string; role: string; avatar: string }[];
  locations: { name: string; type: string; days: number; imageUrl: string }[];
  milestones: { name: string; date: string; completed: boolean }[];
  risks: { name: string; severity: 'Low' | 'Medium' | 'High'; mitigation: string }[];
  documents: { name: string; format: string; size: string; date: string }[];
}

export interface DeliverableCard {
  id: string;
  title: string;
  type: 'PDF' | 'DOC' | 'XLS' | 'PPT' | 'MP4';
  version: string;
  size: string;
  color: string;
}

export interface StakeholderApproval {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'Approved' | 'In Review' | 'Pending';
  date?: string;
}

export interface PackageData {
  stepsCompleted: number;
  totalSteps: number;
  deliverablesCount: number;
  stakeholdersCount: number;
  deliveryDate: string;
  isGreenlit: boolean;
  checklist: { name: string; completed: boolean }[];
  deliverables: DeliverableCard[];
  stakeholders: StakeholderApproval[];
}

// -------------------------------------------------------------
// CORE PROJECT MODEL (Tattava V1 Pilot)
// -------------------------------------------------------------

export interface TattvaCoProject {
  id: string;
  title: string;
  tagline: string;
  posterUrl: string;
  contentType: string;
  language: string;
  genre: string;
  stage: string;
  progressPercent: number;
  lastUpdated: string;
  owner: string;
  visibility: string;
  tags: string[];
  teamMembers: TeamMember[];
  status: ApprovalStatus;
  canonicalVersion?: string;

  // The Heart of Tattava: Story Brain System of Record
  storyBrain: StoryBrain;

  // Pilot Instrumentation
  pilotMetrics: PilotMetrics;

  // AI Story Evaluation Harness
  evaluation: StoryEvaluation;

  // Context Resolver active cache
  activeContextPackage?: ContextResolverPackage;

  // Pipeline Modules
  intent: ProjectIntent;
  researchQuestions: ResearchQuestion[];
  researchFindings: ResearchFinding[];
  storyDirections: StoryDirection[];
  selectedDirectionId: string;
  formats: FormatOption[];
  templates: TemplateOption[];
  characters: Character[];
  selectedCharacterId: string;
  world: StoryWorld;
  structure: StoryStructure;
  treatment: TreatmentData;
  scenes: SceneItem[];
  selectedSceneId: string;
  screenplay: ScreenplayLine[];
  dialogueSuggestions: DialogueSuggestion[];
  continuityIssues: ContinuityIssue[];
  qaIssues: ContinuityIssue[]; // Alias

  // Deferred / Out of Scope (Retained for preview compatibility)
  visualDev: VisualDevData;
  production: ProductionPlanData;
  package: PackageData;

  // Screen accessibility aliases
  format?: string;
  template?: string;
  screenplayLines?: ScreenplayLine[];
  qaInconsistencies?: ContinuityIssue[];
  productionPlan?: ProductionPlanData;
  packageData?: PackageData;
}

export type TattavaProject = TattvaCoProject;
