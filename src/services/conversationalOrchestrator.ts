import { TattavaProject, DiscoveryTurn } from '../types/project';
import { processDiscoveryTurn, DiscoveryTurnResult } from './aiService';

export type OrchestrationMode = 'ASK' | 'RESEARCH' | 'EXPLORE' | 'GENERATE';

export interface OrchestrationDecision {
  mode: OrchestrationMode;
  reason: string;
  unresolvedQuestion: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface OrchestratedTurn {
  decision: OrchestrationDecision;
  result: DiscoveryTurnResult;
}

const unresolved = (project: TattavaProject): string[] => [
  ...(project.intent?.unknownInformation || []),
  ...(project.intent?.missingQuestions || []),
  ...(project.projectIntelligence?.researchUniverse?.unresolvedQuestions || []),
  ...(project.projectIntelligence?.directions?.find(d => d.status === 'SELECTED')?.openQuestions || [])
].map(v => v?.trim()).filter(Boolean);

export const classifyCreatorIntent = (
  project: TattavaProject,
  message: string
): OrchestrationDecision => {
  const text = message.toLowerCase();
  const questions = unresolved(project);
  const selectedDirection = project.projectIntelligence?.directions?.some(d => d.status === 'SELECTED');
  const hasAcceptedInsight = project.projectIntelligence?.insights?.some(i => i.status === 'ACCEPTED');
  const hasVerifiedEvidence = (project.researchFindings || []).some(f => f.status === 'Verified');

  const explicitResearch = /(research|source|evidence|verify|historical|history|fact|authentic|accurate|oldest|earliest|who was|when did|where was)/.test(text);
  const explicitGenerate = /(write|draft|generate|create a treatment|screenplay|scene|episode|outline|develop)/.test(text);
  const explicitExplore = /(explore|alternative|options|directions|what if|compare|possibilit)/.test(text);
  const explicitQuestion = text.includes('?') || /(should i|which|do you want|i am not sure|not sure)/.test(text);

  if (explicitResearch) return { mode: 'RESEARCH', reason: 'Creator message explicitly requests evidence, factual grounding or research.', unresolvedQuestion: questions[0] || message, confidence: 'HIGH' };
  if (explicitGenerate) return { mode: 'GENERATE', reason: 'Creator explicitly requests a content artifact or development output.', unresolvedQuestion: questions[0] || message, confidence: 'HIGH' };
  if (explicitExplore) return { mode: 'EXPLORE', reason: 'Creator explicitly requests alternatives or creative exploration.', unresolvedQuestion: questions[0] || message, confidence: 'HIGH' };
  if (explicitQuestion || (!selectedDirection && !hasAcceptedInsight && !hasVerifiedEvidence)) {
    return { mode: 'ASK', reason: 'Creator intent is unresolved; Tattava should clarify rather than silently choose.', unresolvedQuestion: questions[0] || message, confidence: explicitQuestion ? 'MEDIUM' : 'LOW' };
  }

  if (!hasVerifiedEvidence && questions.length) {
    return { mode: 'RESEARCH', reason: 'The project has unresolved questions without sufficient verified evidence.', unresolvedQuestion: questions[0], confidence: 'MEDIUM' };
  }
  if (!selectedDirection && hasAcceptedInsight) {
    return { mode: 'EXPLORE', reason: 'Accepted insights exist but no direction is authoritative yet.', unresolvedQuestion: questions[0] || 'Which direction should become authoritative?', confidence: 'MEDIUM' };
  }
  if (selectedDirection) {
    return { mode: 'GENERATE', reason: 'An approved direction exists; the project can move into grounded development.', unresolvedQuestion: questions[0] || 'What artifact should be developed next?', confidence: 'MEDIUM' };
  }

  return { mode: 'ASK', reason: 'Insufficient grounded project state for autonomous progression.', unresolvedQuestion: questions[0] || 'What should Tattava resolve next?', confidence: 'LOW' };
};

export const orchestrateCreatorTurn = async (
  project: TattavaProject,
  message: string,
  sourceAttachment?: { name: string; content: string }
): Promise<OrchestratedTurn> => {
  const decision = classifyCreatorIntent(project, message);
  const result = await processDiscoveryTurn(project, message, sourceAttachment);

  // The AI may recommend an action, but the orchestrator owns the workflow mode.
  // This keeps routing deterministic and prevents model output from silently
  // changing the product state machine.
  const mappedMode: OrchestrationMode =
    result.actionType === 'RESEARCH_OPTIONS' ? 'RESEARCH' :
    result.actionType === 'CANDIDATE_OPTIONS' ? 'EXPLORE' :
    result.actionType === 'DEVELOP_PROPOSAL' ? 'GENERATE' :
    result.actionType === 'CLARIFY' ? 'ASK' :
    decision.mode;

  return {
    decision: { ...decision, mode: mappedMode },
    result
  };
};
