import { describe, expect, it } from 'vitest';
import { createEmptyProject } from '../data/emptyProject';
import type { TattavaProject } from '../types/project';
import { buildResearchBrief } from './researchBrief';

const base = createEmptyProject('p1', 'The Sea Forts', 'A mason helps build Sindhudurg', { language: 'Marathi / Hindi' });

const project = {
  ...base,
  genre: 'Historical drama',
  projectConfig: {
    ...base.projectConfig,
    subject: 'Construction of Sindhudurg fort',
    temporalScope: '1664-1667',
    narrativeFreedom: 'FACTUAL',
    evidenceRequirement: 'STRICT',
    secondaryDomains: ['Maratha navy'],
    episodeCount: 8,
  },
  intent: {
    ...base.intent,
    themes: ['sovereignty'],
    missingQuestions: ['How were the stones fixed?'],
    suggestedResearchAreas: ['Coastal trade'],
  },
  world: {
    ...base.world,
    era: '17th century',
    primaryLocations: ['Malvan', 'Sindhudurg Fort'],
    locations: [{ id: 'l1', name: 'Sindhudurg Fort', subtitle: '', description: '', type: 'Coastal', coordinates: { x: 0, y: 0 }, imageUrl: '', isPrimary: true, formattedAddress: 'Malvan, Maharashtra' }],
  },
  characters: [
    { id: 'c1', name: 'Hiroji', role: 'Protagonist', occupation: 'Mason' } as any,
    { id: 'c2', name: 'hiroji', role: 'Protagonist', occupation: 'Mason' } as any,
  ],
  storyBrain: { ...base.storyBrain, canonFacts: [{ id: 'cf', statement: 'The fort is on Kurte island.', category: 'World Rule', entityIds: [] } as any] },
  researchQuestions: [
    { id: 'q1', title: 'Who supplied the stone?', category: 'History', completed: false },
    { id: 'q2', title: 'Already answered question', category: 'History', completed: true },
  ],
} as TattavaProject;

describe('buildResearchBrief', () => {
  const brief = buildResearchBrief(project);

  it('takes what, where, when and how-strict from the project', () => {
    expect(brief.title).toBe('The Sea Forts');
    expect(brief.premise).toBe('A mason helps build Sindhudurg');
    expect(brief.subject).toBe('Construction of Sindhudurg fort');
    expect(brief.setting.era).toBe('17th century');
    expect(brief.setting.time_range).toBe('1664-1667');
    expect(brief.narrative_freedom).toBe('FACTUAL');
    expect(brief.evidence_requirement).toBe('STRICT');
    expect(brief.format.episode_count).toBe(8);
    expect(brief.language).toBe('Marathi / Hindi');
  });

  it('merges places without duplicates, keeping addresses', () => {
    expect(brief.setting.places).toEqual([
      { name: 'Sindhudurg Fort', address: 'Malvan, Maharashtra' },
      { name: 'Malvan' },
    ]);
  });

  it('lists people once each, as fictional until the user marks them historical', () => {
    expect(brief.people).toEqual([{ name: 'Hiroji', role: 'Mason', historical: false }]);
  });

  it('includes known facts, open questions, suggested areas and only unanswered user questions', () => {
    expect(brief.known_facts).toEqual(['The fort is on Kurte island.']);
    expect(brief.open_questions).toEqual(['How were the stones fixed?']);
    expect(brief.suggested_areas).toEqual(['Coastal trade', 'Maratha navy']);
    expect(brief.user_questions).toEqual(['Who supplied the stone?']);
  });
});
