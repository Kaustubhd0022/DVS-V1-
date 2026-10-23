import { TattavaProject, ContextResolverPackage, CanonFact, ResearchFinding, StoryDependency } from '../types/project';
import { ProjectConfiguration, ProjectInsight, ProjectDirection } from '../domain/tattvacoProject';

export interface ContextResolutionRequest {
  taskType: ContextResolverPackage['taskType'];
  targetArtifact: string;
  query?: string;
  selectedCharacterId?: string;
  includeDrafts?: boolean;
}

export interface ResolvedContext {
  pkg: ContextResolverPackage;
  retrievalTrace: string[];
}

const normalize = (value = '') => value.toLowerCase().trim();

const relevance = (text: string, queryTerms: string[]) => {
  if (!text || queryTerms.length === 0) return 0;
  const haystack = normalize(text);
  return queryTerms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
};

const topRelevant = <T>(items: T[], textOf: (item: T) => string, query: string, limit: number) => {
  const terms = normalize(query).split(/\s+/).filter(t => t.length > 2);
  return [...items]
    .map((item, index) => ({ item, score: relevance(textOf(item), terms), index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(x => x.item);
};

const taskTerms = (request: ContextResolutionRequest) =>
  [request.taskType, request.targetArtifact, request.query || ''].join(' ');

const selectCanon = (project: TattavaProject, request: ContextResolutionRequest): CanonFact[] => {
  const facts = project.storyBrain?.canonFacts || [];
  if (!facts.length) return [];
  const terms = taskTerms(request);
  return topRelevant(facts, f => [f.statement, f.category, f.tags.join(' ')].join(' '), terms, 8)
    .filter(f => f.isLocked || request.taskType !== 'Continuity Check');
};

const selectResearch = (project: TattavaProject, request: ContextResolutionRequest): ResearchFinding[] => {
  const verified = (project.researchFindings || []).filter(r => r.status === 'Verified');
  if (!verified.length) return [];
  const terms = taskTerms(request);
  const limit = request.taskType === 'Continuity Check' ? 4 : 8;
  return topRelevant(verified, r => [r.topic, r.claim, r.evidence, r.implicationForPlot].join(' '), terms, limit);
};

const selectCharacters = (project: TattavaProject, request: ContextResolutionRequest) => {
  const characters = project.characters || [];
  if (request.selectedCharacterId) {
    const selected = characters.find(c => c.id === request.selectedCharacterId);
    return selected ? [selected] : [];
  }

  const terms = taskTerms(request);
  const selected = topRelevant(
    characters,
    c => [c.name, c.role, c.want, c.need, c.fear, c.flaw, c.arc, c.voiceStyle, c.relationships.map(r => r.relationType).join(' ')].join(' '),
    terms,
    request.taskType === 'Dialogue Voice' ? 3 : 4
  );

  if (selected.length) return selected;
  return characters.filter(c => c.role === 'Protagonist' || c.role === 'Antagonist').slice(0, 2);
};

const selectInsights = (project: TattavaProject, request: ContextResolutionRequest): ProjectInsight[] => {
  const insights = (project.projectIntelligence?.insights || []).filter(i => i.status === 'ACCEPTED');
  return topRelevant(insights, i => [i.title, i.statement, i.rationale, i.type].join(' '), taskTerms(request), 6);
};

const selectDirection = (project: TattavaProject, request: ContextResolutionRequest): ProjectDirection | undefined => {
  const directions = project.projectIntelligence?.directions || [];
  const selected = directions.find(d => d.status === 'SELECTED');
  if (selected) return selected;
  return topRelevant(directions.filter(d => d.status === 'SHORTLISTED' || d.status === 'CANDIDATE'), d => [d.title, d.statement, d.strengths.join(' '), d.risks.join(' ')].join(' '), taskTerms(request), 1)[0];
};

const selectDecisions = (project: TattavaProject, request: ContextResolutionRequest) => {
  const decisions = project.storyBrain?.decisionLog || project.storyBrain?.creativeDecisions || [];
  return topRelevant(decisions, d => [d.title, d.decision || '', d.rationale, d.impactedAreas.join(' ')].join(' '), taskTerms(request), 6);
};

const selectDependencies = (project: TattavaProject, request: ContextResolutionRequest): StoryDependency[] => {
  const deps = project.storyBrain?.dependencies || [];
  const active = deps.filter(d => !d.isStale);
  return topRelevant(active, d => [d.sourceName, d.targetName, d.description, d.dependencyType].join(' '), taskTerms(request), 6);
};

const unresolvedQuestions = (project: TattavaProject, direction?: ProjectDirection) => {
  const questions = [
    project.projectIntelligence?.development?.nextUnresolvedQuestion,
    ...(direction?.openQuestions || []),
    ...(project.projectIntelligence?.researchUniverse?.unresolvedQuestions || []),
    ...(project.intent?.missingQuestions || []),
    ...(project.intent?.ambiguitiesIdentified || [])
  ].filter(Boolean) as string[];

  return [...new Set(questions.map(q => q.trim()).filter(Boolean))].slice(0, 8);
};

const rationaleFor = (
  request: ContextResolutionRequest,
  projectConfig: ProjectConfiguration | undefined,
  canonCount: number,
  researchCount: number,
  characterCount: number,
  insightCount: number,
  decisionCount: number,
  dependencyCount: number
) => {
  const reasons = [
    'Project-scoped retrieval only',
    projectConfig?.configurationStatus === 'LOCKED' || projectConfig?.configurationStatus === 'USER_CONFIRMED'
      ? 'confirmed project configuration'
      : 'project configuration remains provisional',
    canonCount ? `${canonCount} relevant canonical facts` : 'no relevant canonical facts',
    researchCount ? `${researchCount} human-verified research findings` : 'no verified research selected',
    characterCount ? `${characterCount} task-relevant characters` : 'no character context required',
    insightCount ? `${insightCount} accepted insights` : 'no accepted insights selected',
    decisionCount ? `${decisionCount} relevant creative decisions` : 'no relevant decision history',
    dependencyCount ? `${dependencyCount} active dependencies` : 'no active dependencies selected'
  ];

  if (request.query) reasons.push(`query relevance: "${request.query.slice(0, 100)}"`);
  return reasons.join('; ') + '.';
};

export const resolveProjectContext = (project: TattavaProject, request: ContextResolutionRequest): ResolvedContext => {
  const config = project.projectConfig;
  const direction = selectDirection(project, request);
  const characters = selectCharacters(project, request);
  const canonFacts = selectCanon(project, request);
  const research = selectResearch(project, request);
  const insights = selectInsights(project, request);
  const decisions = selectDecisions(project, request);
  const dependencies = selectDependencies(project, request);
  const questions = unresolvedQuestions(project, direction);

  const characterContext = characters.map(c => ({
    name: c.name,
    want: c.want,
    need: c.need,
    fear: c.fear,
    voiceStyle: c.voiceStyle
  }));

  const target = normalize(request.targetArtifact);
  const worldRules = project.world?.worldRules || [];
  const relevantRules = target.includes('dialogue') || request.taskType === 'Dialogue Voice'
    ? worldRules.slice(0, 6)
    : worldRules.slice(0, 4);

  const tokenEstimate = Math.max(
    450,
    canonFacts.length * 70 +
    research.length * 95 +
    characterContext.length * 90 +
    insights.length * 80 +
    decisions.length * 75 +
    dependencies.length * 65 +
    questions.length * 45 +
    250
  );

  const pkg: ContextResolverPackage = {
    taskId: 'ctx-' + Date.now(),
    taskType: request.taskType,
    targetArtifact: request.targetArtifact,
    projectConfiguration: config,
    currentIntent: project.intent ? {
      premise: project.intent.premise,
      protagonist: project.intent.protagonist,
      setting: project.intent.setting,
      conflict: project.intent.conflict,
      stakes: project.intent.stakes,
      themes: project.intent.themes,
      tone: project.intent.tone,
      knownInformation: project.intent.knownInformation || [],
      unknownInformation: project.intent.unknownInformation || []
    } : undefined,
    retrievedCanonFacts: canonFacts,
    retrievedCharacterContext: characterContext,
    retrievedResearch: research,
    retrievedWorldRules: relevantRules,
    acceptedInsights: insights,
    selectedDirection: direction,
    relevantDecisions: decisions,
    relevantDependencies: dependencies,
    unresolvedQuestions: questions,
    rationale: rationaleFor(request, config, canonFacts.length, research.length, characterContext.length, insights.length, decisions.length, dependencies.length),
    tokenEstimate,
    resolvedAt: new Date().toISOString()
  };

  const retrievalTrace = [
    '1. Authorization boundary: current project only',
    '2. Project configuration resolved',
    '3. Current intent resolved',
    direction ? '4. Selected/shortlisted direction resolved' : '4. No direction resolved',
    `5. Canon retrieval: ${canonFacts.length} relevant facts`,
    `6. Evidence retrieval: ${research.length} human-verified findings`,
    `7. Character retrieval: ${characterContext.length} relevant characters`,
    `8. Accepted insight retrieval: ${insights.length}`,
    `9. Decision history retrieval: ${decisions.length}`,
    `10. Dependency retrieval: ${dependencies.length} active dependencies`,
    `11. Unresolved-question retrieval: ${questions.length}`,
    '12. Historical/unverified content excluded unless explicitly requested'
  ];

  return { pkg, retrievalTrace };
};
