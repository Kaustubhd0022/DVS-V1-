import { TattavaProject, StoryDirection } from '../types/project';
import { ProjectDirection } from '../domain/tattvacoProject';

/**
 * Directions live in two stores: `projectIntelligence.directions` (Discovery) and
 * `storyDirections` (Directions screen). This keeps them describing the same set:
 * candidates are mirrored both ways, and an approval in either store approves the
 * matching direction in the other. Directions are matched by title. Idempotent: returns
 * the same project object when nothing needs to change.
 */

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
const normalize = (title: string) => title.trim().toLowerCase();

const toStoryDirection = (pd: ProjectDirection, project: TattavaProject, index: number): StoryDirection => {
  const approved = pd.status === 'SELECTED';
  return {
    id: `sd-sync-${pd.id}`,
    badgeLetter: String.fromCharCode(65 + (index % 26)),
    title: pd.title,
    logline: pd.statement,
    genre: project.genre || 'Drama / Thriller',
    narrativeEngine: pd.statement,
    protagonistArc: '',
    conflict: '',
    stakes: '',
    theme: '',
    tone: '',
    audience: '',
    potential: '',
    risks: pd.risks.join('; '),
    strengths: pd.strengths.join('; '),
    tags: ['From Discovery'],
    imageUrl: DEFAULT_IMAGE,
    isSelected: false,
    candidateState: approved ? 'CANONICAL' : 'AI_PROPOSAL'
  };
};

const toProjectDirection = (sd: StoryDirection): ProjectDirection => ({
  id: `direction-sync-${sd.id}`,
  title: sd.title,
  statement: sd.logline,
  basedOnInsightIds: [],
  strengths: sd.strengths ? [sd.strengths] : [],
  risks: sd.risks ? [sd.risks] : [],
  openQuestions: [],
  status: sd.candidateState === 'CANONICAL' ? 'SELECTED' : 'CANDIDATE'
});

export const syncDirectionStores = (project: TattavaProject): TattavaProject => {
  const intelligence = project.projectIntelligence;
  if (!intelligence) return project;

  let storyDirections = project.storyDirections || [];
  let directions = intelligence.directions || [];
  let selectedDirectionId = project.selectedDirectionId;
  let changed = false;

  // 1. Mirror candidates both ways.
  const storyKeys = new Set(storyDirections.map(d => normalize(d.title)));
  const intelligenceKeys = new Set(directions.map(d => normalize(d.title)));

  const missingInStory = directions.filter(d => d.status !== 'DISMISSED' && !storyKeys.has(normalize(d.title)));
  const missingInIntelligence = storyDirections.filter(d => !intelligenceKeys.has(normalize(d.title)));

  if (missingInStory.length) {
    const mirrored = missingInStory.map((pd, i) => toStoryDirection(pd, project, storyDirections.length + i));
    const approvedMirror = [...mirrored].reverse().find(d => d.candidateState === 'CANONICAL');
    if (approvedMirror) {
      approvedMirror.isSelected = true;
      selectedDirectionId = approvedMirror.id;
      storyDirections = storyDirections.map(d => (d.isSelected ? { ...d, isSelected: false } : d));
    }
    storyDirections = [...storyDirections, ...mirrored];
    changed = true;
  }
  if (missingInIntelligence.length) {
    directions = [...directions, ...missingInIntelligence.map(toProjectDirection)];
    changed = true;
  }

  // 2. Align approvals: approved in either store means approved in both.
  const approvedKeys = new Set<string>();
  directions.forEach(pd => {
    if (pd.status === 'SELECTED') approvedKeys.add(normalize(pd.title));
  });
  storyDirections.forEach(sd => {
    if (sd.candidateState === 'CANONICAL') approvedKeys.add(normalize(sd.title));
  });

  const newlyApprovedStory = storyDirections.filter(
    sd => approvedKeys.has(normalize(sd.title)) && sd.candidateState !== 'CANONICAL'
  );
  if (newlyApprovedStory.length) {
    const newlyApprovedIds = new Set(newlyApprovedStory.map(d => d.id));
    const focus = newlyApprovedStory[newlyApprovedStory.length - 1];
    storyDirections = storyDirections.map(d => {
      if (newlyApprovedIds.has(d.id)) return { ...d, candidateState: 'CANONICAL', isSelected: d.id === focus.id };
      return d.id !== focus.id && d.isSelected ? { ...d, isSelected: false } : d;
    });
    selectedDirectionId = focus.id;
    changed = true;
  }

  const newlyApprovedIntelligence = directions.filter(
    pd => approvedKeys.has(normalize(pd.title)) && pd.status !== 'SELECTED' && pd.status !== 'DISMISSED'
  );
  if (newlyApprovedIntelligence.length) {
    const ids = new Set(newlyApprovedIntelligence.map(d => d.id));
    directions = directions.map(d => (ids.has(d.id) ? { ...d, status: 'SELECTED' as const } : d));
    changed = true;
  }

  if (!changed) return project;

  return {
    ...project,
    storyDirections,
    selectedDirectionId,
    projectIntelligence: {
      ...intelligence,
      directions,
      development: { ...intelligence.development, directionCount: directions.length }
    }
  };
};

/** Keep only approved directions, so regenerating candidates does not resurrect stale ones. */
export const withoutUnapprovedStoryDirections = (project: TattavaProject): StoryDirection[] =>
  (project.storyDirections || []).filter(d => d.candidateState === 'CANONICAL');

export const withoutUnapprovedIntelligenceDirections = (directions: ProjectDirection[]): ProjectDirection[] =>
  directions.filter(d => d.status === 'SELECTED');
