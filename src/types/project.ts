export type ApprovalStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'LOCKED';

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
  sourceType: 'Primary Source' | 'Academic' | 'Established Publication' | 'Government';
  date: string;
  confidence: number;
  status: 'Verified' | 'Needs Review' | 'Conflicting';
  usedIn: string[];
  imageUrl?: string;
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
  // Deep Schema
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
}

export interface StructureBeat {
  id: string;
  number: number;
  act: 'ACT I - SETUP' | 'ACT II - CONFRONTATION' | 'ACT III - RESOLUTION';
  timeRange: string;
  title: string;
  description: string;
  imageUrl: string;
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
}

export interface TreatmentData {
  version: string;
  wordCount: number;
  logline: string;
  synopsis: string;
  themes: string[];
  tone: string[];
  status: ApprovalStatus;
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
}

export interface DialogueSuggestion {
  id: string;
  character: string;
  label: string;
  text: string;
  tone: string;
}

export interface QAInconsistency {
  id: string;
  sceneNumber: number;
  type: 'Prop Mismatch' | 'Costume Change' | 'Time Continuity' | 'Dialogue Overlap' | 'Spatial Direction';
  title: string;
  description: string;
  status: 'Open' | 'Resolved';
  referenceShotLabel: string;
  currentShotLabel: string;
  referenceShotImg: string;
  currentShotImg: string;
  fixAction: string;
}

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
  // Sub-modules
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
  qaIssues: QAInconsistency[];
  visualDev: VisualDevData;
  production: ProductionPlanData;
  package: PackageData;
  // Aliases for screen accessibility
  format?: string;
  template?: string;
  screenplayLines?: ScreenplayLine[];
  qaInconsistencies?: QAInconsistency[];
  productionPlan?: ProductionPlanData;
  packageData?: PackageData;
}

export type TattavaProject = TattvaCoProject;
