import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createEmptyProject } from '../data/emptyProject';

const generate = vi.fn();
vi.mock('./apiClient', () => ({
  ApiError: class ApiError extends Error {},
  apiClient: { generate: (...args: unknown[]) => generate(...args) },
}));

const { generateResearchTopics, RESEARCH_TOPICS_SCHEMA } = await import('./aiService');

const project = createEmptyProject('p1', 'Test Project', 'A premise');
const topics = [
  {
    topic: 'Maratha forts',
    claim: 'Sea forts were supplied by boat during sieges',
    evidence: 'Check: naval histories of the Konkan coast',
    source: 'Check: Maratha naval records',
    sourceType: 'Academic',
    epistemicType: 'SCHOLARLY_DISPUTED',
    implicationForPlot: 'A blockade becomes a race against the monsoon',
  },
];

describe('generateResearchTopics', () => {
  beforeEach(() => {
    generate.mockReset();
  });

  it('asks the server to check the reply against the research schema', async () => {
    generate.mockResolvedValue({ content: '{}', model: 'm', latency_ms: 1, data: { topics } });

    await generateResearchTopics(project, 6);

    expect(generate).toHaveBeenCalledTimes(1);
    const request = generate.mock.calls[0][0];
    expect(request.outputSchema).toEqual(RESEARCH_TOPICS_SCHEMA);
    expect(request.task).toBe('Research Evidence Generation');
  });

  it('returns the data the server parsed and validated', async () => {
    generate.mockResolvedValue({ content: 'ignored', model: 'm', latency_ms: 1, data: { topics } });

    const result = await generateResearchTopics(project, 6);

    expect(result.topics).toEqual(topics);
  });

  it('surfaces a validation failure instead of guessing', async () => {
    generate.mockRejectedValue(new Error("The AI model's reply did not match the expected format."));

    const error = await generateResearchTopics(project, 6).then(
      () => null,
      (e: Error) => e
    );
    expect(error?.message).toContain('expected format');
  });
});
