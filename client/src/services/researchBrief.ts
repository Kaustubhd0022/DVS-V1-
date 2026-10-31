import type { TattavaProject } from '../types/project';
import type { CoverageArea, ResearchBrief } from './apiClient';

/** Coverage areas the plan can propose tasks in (server/app/services/research_planner.py). */
export const COVERAGE_AREAS: Array<{ id: CoverageArea; label: string; group: string }> = [
  { id: 'history_chronology', label: 'History and chronology', group: 'History, people, places' },
  { id: 'people', label: 'People', group: 'History, people, places' },
  { id: 'places_architecture', label: 'Places and architecture', group: 'History, people, places' },
  { id: 'art_craft_material', label: 'Art, craft and material culture', group: 'Culture and daily life' },
  { id: 'ritual_festival_folklore', label: 'Rituals, festivals and folklore', group: 'Culture and daily life' },
  { id: 'daily_life', label: 'Daily life (food, costume, livelihoods)', group: 'Culture and daily life' },
  { id: 'language_dialect', label: 'Language and dialect', group: 'Language and present day' },
  { id: 'present_day_tourism', label: 'Present day and tourism', group: 'Language and present day' },
  { id: 'disputed_accounts', label: 'Contested accounts', group: 'Disputes and sensitivities' },
  { id: 'sensitivities', label: 'Sensitivities (communities, religion, law)', group: 'Disputes and sensitivities' },
];

/** What each brief parameter is called in the UI, for "why this task" chips. */
export const PARAMETER_LABELS: Record<string, string> = {
  premise: 'Premise', subject: 'Subject', themes: 'Themes', genre: 'Genre', tone: 'Tone',
  setting: 'Setting', era: 'Era', places: 'Places', people: 'People', format: 'Format',
  audience: 'Audience', language: 'Language', narrative_freedom: 'Creative freedom',
  evidence_requirement: 'Evidence level', known_facts: 'Known facts', open_questions: 'Open questions',
  suggested_areas: 'Suggested areas', user_questions: 'Your questions', uploaded_material: 'Uploaded material',
};

const clean = (values: Array<string | undefined | null>, limit: number): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const text = (value ?? '').trim();
    const key = text.toLowerCase();
    if (text && !seen.has(key)) {
      seen.add(key);
      out.push(text);
    }
  }
  return out.slice(0, limit);
};

const text = (value: string | undefined | null, max: number): string | undefined => {
  const trimmed = (value ?? '').trim();
  return trimmed ? trimmed.slice(0, max) : undefined;
};

/**
 * Assemble the research brief from everything the user has put into the project. The user reviews
 * and edits it (notably which people are historical) before a plan is generated.
 */
export const buildResearchBrief = (project: TattavaProject): ResearchBrief => {
  const config = project.projectConfig;
  const intent = project.intent;
  const world = project.world;
  const canon = project.storyBrain?.canonFacts ?? [];
  const selectedDirection = project.storyDirections?.find(d => d.id === project.selectedDirectionId);

  const places = [
    ...(world?.locations ?? []).map(l => ({ name: l.name, address: l.formattedAddress || l.subtitle || undefined })),
    ...(world?.primaryLocations ?? []).map(name => ({ name, address: undefined })),
  ];
  const placeNames = new Set<string>();
  const uniquePlaces = places
    .filter(p => p.name?.trim() && !placeNames.has(p.name.trim().toLowerCase()) && placeNames.add(p.name.trim().toLowerCase()))
    .slice(0, 40)
    .map(p => ({ name: p.name.trim().slice(0, 200), ...(p.address ? { address: p.address.slice(0, 300) } : {}) }));

  const people = [
    ...(project.characters ?? []).map(c => ({ name: c.name, role: c.occupation || c.role })),
    ...(intent?.protagonist ? [{ name: intent.protagonist, role: 'protagonist' }] : []),
  ];
  const peopleNames = new Set<string>();
  const uniquePeople = people
    .filter(p => p.name?.trim() && !peopleNames.has(p.name.trim().toLowerCase()) && peopleNames.add(p.name.trim().toLowerCase()))
    .slice(0, 40)
    .map(p => ({ name: p.name.trim().slice(0, 200), role: p.role?.slice(0, 200), historical: false }));

  const verifiedClaims = (project.researchFindings ?? []).filter(f => f.status === 'Verified').map(f => f.claim);

  return {
    title: (project.title || 'Untitled project').slice(0, 300),
    premise: text(intent?.premise || intent?.rawConcept || selectedDirection?.logline || project.tagline, 4000),
    subject: text(config?.subject || config?.primaryDomain, 1000),
    genre: text(project.genre, 200),
    themes: clean([...(intent?.themes ?? []), ...(world?.themes ?? [])], 20),
    tone: text(intent?.tone, 200),
    format: {
      media: text(config?.formatLabel || config?.mediaFormat || project.contentType, 100),
      episode_count: config?.episodeCount,
      audience: text(config?.audience || intent?.targetAudience, 300),
    },
    setting: {
      description: text(intent?.setting || config?.geographicScope || world?.settingType, 1000),
      era: text(world?.era, 200),
      time_range: text(config?.temporalScope, 200),
      places: uniquePlaces,
    },
    people: uniquePeople,
    language: text(intent?.language || project.language, 200),
    narrative_freedom: config?.narrativeFreedom ?? 'GROUNDED_HYBRID',
    evidence_requirement: config?.evidenceRequirement ?? 'HIGH',
    known_facts: clean([...canon.map(c => c.statement), ...verifiedClaims], 50),
    // unknownInformation holds story-craft gaps ("Protagonist Psychology"), not research questions.
    open_questions: clean([...(intent?.missingQuestions ?? []), ...(intent?.ambiguitiesIdentified ?? [])], 30),
    suggested_areas: clean([...(intent?.suggestedResearchAreas ?? []), ...(config?.secondaryDomains ?? [])], 30),
    user_questions: clean((project.researchQuestions ?? []).filter(q => !q.completed).map(q => q.title), 30),
    uploaded_material: text(intent?.uploadedMaterialContent, 6000),
  };
};
