/**
 * TattavaCo Project V1 domain model.
 *
 * This layer is intentionally vertical-aware but platform-agnostic:
 * TattvaCo Project is the first deeply implemented vertical; future
 * verticals (Originals, GeetVerse, etc.) can provide their own packs
 * without changing the shared Project Intelligence runtime.
 */

export type TattavaVertical =
  | 'TATTVACO_PROJECT'
  | 'ORIGINALS'
  | 'GEETVERSE'
  | 'FUTURE';

export type MediaFormat =
  | 'MOVIE'
  | 'DOCUMENTARY'
  | 'SERIES'
  | 'VERTICAL_SERIES'
  | 'PODCAST'
  | 'EXPLORATION'
  | 'INFORMANT'
  | 'INTERVIEW'
  | 'SHORT_FILM'
  | 'OTHER';

export type ContentMode =
  | 'INFORMATIONAL'
  | 'EDUCATIONAL'
  | 'DOCUMENTARY'
  | 'INFOTAINMENT'
  | 'NARRATIVE'
  | 'EXPLORATORY'
  | 'HYBRID';

export interface DomainNode {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  enabled: boolean;
  source: 'SYSTEM' | 'USER' | 'AI_PROPOSED';
}

export interface ProjectConfiguration {
  vertical: TattavaVertical;
  mediaFormat: MediaFormat;
  contentMode: ContentMode;
  /** Canonical creator-facing format label, e.g. Limited Series. */
  formatLabel?: string;
  /** Canonical structural template selected by the creator. */
  templateName?: string;
  /** Series runtime configuration; omitted for non-series formats. */
  episodeCount?: number;
  episodeDurationMins?: number;
  activeEpisodeNumber?: number;
  /** Fingerprint of the configuration that downstream artifacts were generated from. */
  configurationFingerprint?: string;
  primaryDomain: string;
  secondaryDomains: string[];
  subject: string;
  geographicScope?: string;
  temporalScope?: string;
  audience?: string;
  creativeIntent?: string;
  evidenceRequirement: 'STANDARD' | 'HIGH' | 'STRICT';
  narrativeFreedom: 'FACTUAL' | 'GROUNDED_HYBRID' | 'CREATIVE';
  configurationStatus: 'PROPOSED' | 'USER_CONFIRMED' | 'LOCKED';
}

export interface ResearchDimension {
  id: string;
  label: string;
  description: string;
  parentDimensionId?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COVERED' | 'NOT_RELEVANT';
  depth: number;
  childCount?: number;
}

export interface ResearchUniverse {
  rootSubject: string;
  dimensions: ResearchDimension[];
  unresolvedQuestions: string[];
  coveragePercent: number;
  lastExpandedAt?: string;
}

export interface ProjectInsight {
  id: string;
  title: string;
  statement: string;
  basedOnFindingIds: string[];
  type: 'INTERPRETATION' | 'PATTERN' | 'CREATIVE_OPPORTUNITY' | 'HYPOTHESIS';
  status: 'CANDIDATE' | 'ACCEPTED' | 'DISMISSED';
  rationale?: string;
}

export interface ProjectDirection {
  id: string;
  title: string;
  statement: string;
  basedOnInsightIds: string[];
  strengths: string[];
  risks: string[];
  openQuestions: string[];
  status: 'CANDIDATE' | 'SHORTLISTED' | 'SELECTED' | 'DISMISSED';
}

export interface ProjectDevelopmentState {
  knowledgeCount: number;
  insightCount: number;
  directionCount: number;
  decisionCount: number;
  contentArtifactCount: number;
  currentStage: 'KNOWLEDGE' | 'INSIGHT' | 'DIRECTION' | 'DECISION' | 'CONTENT';
  nextUnresolvedQuestion?: string;
}

export interface ProjectIntelligence {
  domainNodes: DomainNode[];
  researchUniverse: ResearchUniverse;
  insights: ProjectInsight[];
  directions: ProjectDirection[];
  development: ProjectDevelopmentState;
}

/**
 * Starter ontology for TattvaCo Project V1.
 * It is deliberately extensible: user/AI proposed nodes can be added without
 * changing the core data model.
 */
export const TATTVACO_PROJECT_DOMAINS: DomainNode[] = [
  ['history', 'History'],
  ['civilisation', 'Civilisation'],
  ['heritage', 'Heritage'],
  ['food', 'Food'],
  ['mythology', 'Mythology'],
  ['culture-traditions', 'Culture & Traditions'],
  ['entertainment', 'Entertainment'],
  ['art', 'Art'],
  ['literature', 'Literature'],
  ['music', 'Music'],
  ['architecture', 'Architecture'],
  ['society', 'Society'],
  ['people', 'People & Personalities'],
  ['places', 'Places & Geography'],
  ['fashion-textiles', 'Fashion & Textiles'],
  ['performing-arts', 'Performing Arts'],
  ['craft-folk-art', 'Craft & Folk Arts'],
  ['festivals', 'Festivals & Celebrations'],
  ['communities', 'Communities & Tribes'],
  ['travel-exploration', 'Travel & Exploration'],
  ['religion-spirituality', 'Religion & Spirituality'],
  ['philosophy', 'Philosophy'],
  ['language', 'Language & Linguistics'],
  ['environment', 'Environment & Nature'],
  ['science', 'Science'],
  ['technology', 'Technology'],
  ['lifestyle', 'Lifestyle & Everyday Life'],
].map(([id, name]) => ({
  id,
  name,
  enabled: true,
  source: 'SYSTEM' as const,
}));

export const DEFAULT_PROJECT_CONFIGURATION: ProjectConfiguration = {
  vertical: 'TATTVACO_PROJECT',
  mediaFormat: 'OTHER',
  contentMode: 'HYBRID',
  primaryDomain: '',
  secondaryDomains: [],
  subject: '',
  audience: '',
  creativeIntent: '',
  evidenceRequirement: 'HIGH',
  narrativeFreedom: 'GROUNDED_HYBRID',
  configurationStatus: 'PROPOSED',
};

export const createEmptyProjectIntelligence = (): ProjectIntelligence => ({
  domainNodes: [...TATTVACO_PROJECT_DOMAINS],
  researchUniverse: {
    rootSubject: '',
    dimensions: [],
    unresolvedQuestions: [],
    coveragePercent: 0,
  },
  insights: [],
  directions: [],
  development: {
    knowledgeCount: 0,
    insightCount: 0,
    directionCount: 0,
    decisionCount: 0,
    contentArtifactCount: 0,
    currentStage: 'KNOWLEDGE',
  },
});

/**
 * Format-aware behavior. This is intentionally declarative so future vertical
 * packs can replace/extend it without changing the core project model.
 */
export const FORMAT_ARTIFACTS: Record<MediaFormat, string[]> = {
  MOVIE: ['Story Concept', 'Story Structure', 'Treatment', 'Scene Outline', 'Screenplay', 'Dialogue'],
  DOCUMENTARY: ['Thesis', 'Research Structure', 'Chapter Outline', 'Interview Plan', 'Treatment', 'Script'],
  SERIES: ['Series Premise', 'Season Arc', 'Episode Structure', 'Treatment', 'Script'],
  VERTICAL_SERIES: ['Series Premise', 'Episode Beats', 'Segment Structure', 'Script'],
  PODCAST: ['Episode Thesis', 'Episode Structure', 'Guest/Interview Plan', 'Host Narrative', 'Script'],
  EXPLORATION: ['Exploration Thesis', 'Journey Plan', 'Location Plan', 'People/Expert Plan', 'Narrative'],
  INFORMANT: ['Knowledge Question', 'Research Structure', 'Expert Inputs', 'Knowledge Narrative'],
  INTERVIEW: ['Interview Thesis', 'Research Brief', 'Question Plan', 'Interview Structure'],
  SHORT_FILM: ['Story Concept', 'Structure', 'Treatment', 'Screenplay'],
  OTHER: ['Project Brief', 'Structure', 'Content Artifact'],
};

export const inferMediaFormat = (value = ''): MediaFormat => {
  const v = value.toLowerCase();
  if (v.includes('podcast')) return 'PODCAST';
  if (v.includes('documentary')) return 'DOCUMENTARY';
  if (v.includes('exploration')) return 'EXPLORATION';
  if (v.includes('informant')) return 'INFORMANT';
  if (v.includes('short film')) return 'SHORT_FILM';
  if (v.includes('series')) return 'SERIES';
  if (v.includes('movie') || v.includes('film')) return 'MOVIE';
  return 'OTHER';
};

export const inferContentMode = (value = ''): ContentMode => {
  const v = value.toLowerCase();
  if (v.includes('infotainment')) return 'INFOTAINMENT';
  if (v.includes('documentary')) return 'DOCUMENTARY';
  if (v.includes('educational')) return 'EDUCATIONAL';
  if (v.includes('informational')) return 'INFORMATIONAL';
  if (v.includes('explor')) return 'EXPLORATORY';
  if (v.includes('narrative')) return 'NARRATIVE';
  return 'HYBRID';
};
