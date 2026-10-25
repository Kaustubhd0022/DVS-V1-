import type { ScreenId, StepMeta } from '../context/ProjectContext';
import { TattavaProject } from '../types/project';

/** Steps a project can skip without blocking the main path from idea to script. */
export const OPTIONAL_STEP_IDS: ScreenId[] = ['intake', 'research', 'format-template', 'world', 'dialogue'];

export const isOptionalStep = (id: ScreenId) => OPTIONAL_STEP_IDS.includes(id);

const hasApprovedDirection = (project: TattavaProject) =>
  (project.storyDirections || []).some(d => d.candidateState === 'CANONICAL') ||
  (project.projectIntelligence?.directions || []).some(d => d.status === 'SELECTED');

const beatCount = (project: TattavaProject) => {
  const acts = project.structure?.acts;
  if (!acts) return 0;
  return (acts.act1?.beats?.length || 0) + (acts.act2?.beats?.length || 0) + (acts.act3?.beats?.length || 0);
};

/** Whether a step already has content in this project. */
export const isStepComplete = (project: TattavaProject, id: ScreenId): boolean => {
  switch (id) {
    case 'discovery':
      // Projects that already have approved facts or a direction have clearly been through discovery.
      return (project.discovery?.turns?.length || 0) >= 2 ||
        (project.storyBrain?.canonFacts?.length || 0) > 0 ||
        hasApprovedDirection(project);
    case 'story-brain':
      return (project.storyBrain?.canonFacts?.length || 0) > 0;
    case 'intake':
      return !!project.intent?.protagonist?.trim() || !!project.intent?.storyBrainProposed;
    case 'research':
      return (project.researchFindings?.length || 0) > 0;
    case 'story-exploration':
      return hasApprovedDirection(project);
    case 'format-template':
      return (project.formats || []).some(f => f.isSelected) && (project.templates || []).some(t => t.isSelected);
    case 'characters':
      return (project.characters?.length || 0) > 0;
    case 'world':
      return (project.world?.locations?.length || 0) > 0 || (project.world?.primaryLocations?.length || 0) > 0;
    case 'structure':
      return beatCount(project) > 0;
    case 'treatment':
      return !!project.treatment?.synopsis?.trim();
    case 'scene-outline':
      return (project.scenes?.length || 0) > 0;
    case 'screenplay':
      return (project.screenplay?.length || 0) > 0;
    case 'dialogue':
      return (project.dialogueSuggestions?.length || 0) > 0;
    case 'continuity':
    case 'qa':
      return !!project.evaluation || (project.continuityIssues?.length || 0) > 0;
    case 'evaluation':
      return !!project.evaluation;
    case 'package':
      return !!project.package?.isGreenlit;
    default:
      return true;
  }
};

/**
 * The first required step with no content yet, in pipeline order. Optional steps are
 * skipped. Returns null when every required step is done.
 */
export const getNextStep = (project: TattavaProject, steps: StepMeta[]): StepMeta | null =>
  steps.find(s => !isOptionalStep(s.id) && !isStepComplete(project, s.id)) || null;

/** Where to land when reopening a project: the next step to work on, else the package. */
export const getResumeScreen = (project: TattavaProject, steps: StepMeta[]): ScreenId =>
  getNextStep(project, steps)?.id || 'package';
