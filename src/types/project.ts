import { ProjectConfiguration, ProjectIntelligence, ProjectInsight, ProjectDirection } from '../domain/tattvacoProject';

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
  rawConcept?: string;
  uploadedMaterialName?: string;
  uploadedMaterialContent?: string;
  knownInformation?: string[];
  unknownInformation?: string[];
  suggestedResearchAreas?: string[];
  intakeAnalysisStatus?: 'IDLE' | 'ANALYZING' | 'ANALYZED' | 'APPROVED';
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
  badgeLetter: string;
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
  archetype?: string;
  backstory?: string;
  moralDilemma?: string;
  psychometrics?: {
    openness?: number;
    conscientiousness?: number;
    extraversion?: number;
    agreeableness?: number;
    neuroticism?: number;
  };
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
  subtext?: string;
  candidateState?: CanonicalState;
}

// -------------------------------------------------------------
// STORY BRAIN & CANONICAL PROJECT INTELLIGENCE DEFINITIONS
// -------------------------------------------------------------

export interface CanonFact {
  id: string;
  statement: string;
  category: 'World Rule' | 'Character Truth' | 'Timeline' | 'Institutional Reality' | 'Plot Law' | 'Plot Anchor';
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
  decision?: string;
  rationale: string;
  author: string;
  role: string;
  date: string;
  status: 'Approved' | 'Proposed' | 'Reversed' | 'ACCEPTED';
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
  decisionLog?: CreativeDecision[];
  entityNodes?: Array<{ id: string; name: string; type: string; significance?: string; firstAppears?: string; status?: string; connectionCount?: number }>;
  dependencies: StoryDependency[];
  activeEntitiesCount: number;
  lastUpdated: string;
}

// -------------------------------------------------------------
// CONVERSATIONAL DISCOVERY LOOP MODEL
// Understand -> Explore -> Decide -> Remember -> Develop
// -------------------------------------------------------------

export interface DiscoveryCandidateOption {
  id: string;
  title: string;
  source?: string;
  sourceType?: 'Primary Source' | 'Academic' | 'Archaeological' | 'Historical Archive' | 'Literary Canon' | 'Screenplay Hypothesis';
  evidence?: string;
  finding?: string;
  dramaticImplication?: string;
  status: 'CANDIDATE' | 'ACCEPTED' | 'DISMISSED';
  era?: string;
  tags?: string[];
}

export interface DiscoveryTurn {
  id: string;
  timestamp: string;
  role: 'user' | 'tattava';
  userText?: string;
  thought?: string;
  conversationalReply: string;
  actionType: 'CLARIFY' | 'RESEARCH_OPTIONS' | 'CANDIDATE_OPTIONS' | 'DECISION_CONFIRMED' | 'DEVELOP_PROPOSAL';
  knownExtracted: string[];
  unresolvedAmbiguities: string[];
  nextQuestion: string;
  quickReplies?: string[];
  researchObjective?: string;
  candidateOptions?: DiscoveryCandidateOption[];
  appliedDecision?: {
    summary: string;
    rationale: string;
    canonFactCreated?: string;
  };
}

export interface DiscoverySession {
  turns: DiscoveryTurn[];
  ambiguityLevel: number; // 0 to 100
  activeResearchObjective?: string;
  lastUpdated: string;
}

// -------------------------------------------------------------
// CONTEXT RESOLVER MODEL
// -------------------------------------------------------------

export interface ContextResolverPackage {
  taskId: string;
  taskType: 'Story Direction' | 'Character Generation' | 'Treatment Beat' | 'Treatment Generation' | 'Structure Generation' | 'Scene Drafting' | 'Dialogue Voice' | 'Continuity Check' | 'Evaluation';
  targetArtifact: string;
  projectConfiguration?: ProjectConfiguration;
  currentIntent?: {
    premise: string;
    protagonist: string;
    setting: string;
    conflict: string;
    stakes: string;
    themes: string[];
    tone: string;
    knownInformation: string[];
    unknownInformation: string[];
  };
  acceptedInsights?: ProjectInsight[];
  selectedDirection?: ProjectDirection;
  relevantDecisions?: CreativeDecision[];
  relevantDependencies?: StoryDependency[];
  unresolvedQuestions?: string[];
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


export interface EvaluationRepairItem {
  id: string;
  dimension: string;
  targetArtifact: 'research' | 'direction' | 'character' | 'treatment' | 'scene' | 'dialogue' | 'evaluation';
  problem: string;
  recommendation: string;
  action: 'REVIEW' | 'REGENERATE' | 'RESEARCH';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export interface EvaluationRepairPlan {
  id: string;
  evaluationAt: string;
  generatedAt: string;
  status: 'OPEN' | 'PARTIAL' | 'RESOLVED';
  items: EvaluationRepairItem[];
}

export interface EvaluationComparison {
  id: string;
  beforeEvaluationAt: string;
  afterEvaluationAt: string;
  overallScoreDelta: number;
  readinessChanged: boolean;
  dimensionChanges: Array<{
    dimension: string;
    beforeScore: number;
    afterScore: number;
    delta: number;
    interpretation: 'IMPROVED' | 'UNCHANGED' | 'REGRESSED';
  }>;
  resolvedRisks: string[];
  remainingRisks: string[];
  generatedAt: string;
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

export type RegenerationAction = 'REVIEW' | 'REGENERATE' | 'REBUILD_CONTEXT' | 'REVERIFY_RESEARCH';

export interface RegenerationPlanItem {
  id: string;
  artifactType: ArtifactVersionRecord['artifactType'];
  artifactId: string;
  artifactName: string;
  sourceDependencyId?: string;
  reason: string;
  action: RegenerationAction;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  stale: boolean;
  blockedByApproval: boolean;
}

export interface RegenerationPlan {
  id: string;
  sourceTrigger: string;
  generatedAt: string;
  status: 'READY' | 'PARTIAL' | 'BLOCKED' | 'COMPLETED';
  items: RegenerationPlanItem[];
  summary: {
    review: number;
    regenerate: number;
    rebuildContext: number;
    reverifyResearch: number;
  };
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

export interface ArtifactVersionRecord {
  id: string;
  artifactType: 'direction' | 'character' | 'treatment' | 'scene' | 'dialogue';
  artifactId: string;
  version: string;
  state: CanonicalState;
  content: unknown;
  createdAt: string;
  createdBy: string;
  changeSummary: string;
  supersedesVersionId?: string;
  approvalId?: string;
}

export interface ProjectBranch {
  id: string;
  name: string;
  purpose: string;
  baseCanonicalVersion: string;
  createdAt: string;
  createdBy: string;
  status: 'ACTIVE' | 'MERGED' | 'ABANDONED';
  artifactVersionIds: string[];
  mergeDecisionId?: string;
}

export interface BranchMergeConflict {
  id: string;
  artifactType: ArtifactVersionRecord['artifactType'];
  artifactId: string;
  branchVersionId: string;
  canonicalVersionId?: string;
  branchContent: unknown;
  canonicalContent?: unknown;
  reason: string;
  resolution?: 'USE_BRANCH' | 'KEEP_CANONICAL' | 'MANUAL_EDIT';
  /** Required when MANUAL_EDIT is selected; merge is blocked until supplied. */
  manualContent?: unknown;
}

export interface BranchMergeDiff {
  artifactType: ArtifactVersionRecord['artifactType'];
  artifactId: string;
  branchVersionId: string;
  canonicalVersionId?: string;
  changeType: 'ADDED' | 'MODIFIED' | 'UNCHANGED';
  changedFields: string[];
  summary: string;
}

export interface BranchMergePreview {
  id: string;
  branchId: string;
  baseCanonicalVersion: string;
  targetCanonicalVersion: string;
  createdAt: string;
  diffs: BranchMergeDiff[];
  conflicts: BranchMergeConflict[];
  status: 'READY' | 'CONFLICTS' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  rationale?: string;
}

export interface BranchMergeRecord {
  id: string;
  branchId: string;
  sourceVersionIds: string[];
  targetProjectVersion: string;
  mergedAt: string;
  mergedBy: string;
  rationale: string;
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED';
  previewId?: string;
}

export interface ArtifactApprovalRecord {
  id: string;
  artifactType: 'direction' | 'character' | 'treatment' | 'scene' | 'dialogue';
  artifactId: string;
  versionId: string;
  status: 'APPROVED' | 'REJECTED' | 'SUPERSEDED';
  approvedBy: string;
  role: string;
  timestamp: string;
  rationale?: string;
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
  isDemo?: boolean;
  /** V1 vertical-aware configuration and persistent project intelligence. */
  projectConfig?: ProjectConfiguration;
  projectIntelligence?: ProjectIntelligence;

  // The Heart of Tattava: Story Brain System of Record
  storyBrain: StoryBrain;

  // Pilot Instrumentation
  pilotMetrics: PilotMetrics;

  // AI Story Evaluation Harness
  evaluation?: StoryEvaluation | null;
  evaluationHistory?: StoryEvaluation[];
  evaluationRepairPlan?: EvaluationRepairPlan | null;
  evaluationComparisons?: EvaluationComparison[];

  // Context Resolver active cache
  activeContextPackage?: ContextResolverPackage;
  artifactVersions?: ArtifactVersionRecord[];
  artifactApprovals?: ArtifactApprovalRecord[];
  projectBranches?: ProjectBranch[];
  branchMerges?: BranchMergeRecord[];
  branchMergePreview?: BranchMergePreview | null;
  regenerationPlans?: RegenerationPlan[];

  // Conversational Discovery & Development Loop Session
  discovery?: DiscoverySession;

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
