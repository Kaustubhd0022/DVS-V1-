import { describe, expect, it } from 'vitest';
import { createEmptyProject } from '../data/emptyProject';
import type { ResearchFinding } from '../types/project';
import { buildProjectContext } from './aiService';

const finding = (id: string, claim: string, status: ResearchFinding['status']): ResearchFinding => ({
  id,
  topic: `Topic ${id}`,
  claim,
  evidence: 'Evidence',
  source: 'Source',
  sourceType: 'Academic',
  date: '28/10/2026',
  confidence: 50,
  status,
  usedIn: [],
});

const projectWith = (findings: ResearchFinding[]) => ({
  ...createEmptyProject('p1', 'Test Project', 'A premise'),
  researchFindings: findings,
});

/** The text of one `=== HEADING ===` section, up to the next heading. */
const section = (context: string, heading: string): string => {
  const start = context.indexOf(`=== ${heading} ===`);
  if (start === -1) return '';
  const next = context.indexOf('\n===', start + 1);
  return context.slice(start, next === -1 ? undefined : next);
};

describe('buildProjectContext research labelling', () => {
  it('lists only Verified findings under the verified heading', () => {
    const context = buildProjectContext(
      projectWith([
        finding('a', 'Checked claim', 'Verified'),
        finding('b', 'Model-generated claim', 'Needs Review'),
      ]),
      'task',
      { includeResearch: true }
    );

    const verified = section(context, 'VERIFIED RESEARCH EVIDENCE');
    expect(verified).toContain('Checked claim');
    expect(verified).not.toContain('Model-generated claim');
  });

  it('labels unverified findings as leads, not evidence', () => {
    const context = buildProjectContext(
      projectWith([
        finding('b', 'Model-generated claim', 'Needs Review'),
        finding('c', 'Contested claim', 'Conflicting'),
      ]),
      'task',
      { includeResearch: true }
    );

    expect(context).not.toContain('=== VERIFIED RESEARCH EVIDENCE ===');
    const leads = section(context, 'UNVERIFIED RESEARCH LEADS (NOT EVIDENCE)');
    expect(leads).toContain('Model-generated claim');
    expect(leads).toContain('Contested claim');
  });
});

describe('buildProjectContext attested findings', () => {
  it('marks attested offline findings as not machine-checked', () => {
    const attested = { ...finding('d', 'Lead was poured into the foundations', 'Verified'), verificationMethod: 'attested' as const };
    const context = buildProjectContext(projectWith([attested]), 'task', { includeResearch: true });

    expect(section(context, 'VERIFIED RESEARCH EVIDENCE')).toContain('attested offline source, not machine-checked');
  });
});
