import { TattavaProject, DiscoveryTurn } from '../types/project';
import { processDiscoveryTurn, DiscoveryTurnResult } from './aiService';
import { planNextCreatorAction, NextActionPlan } from './nextActionPlanner';

export type OrchestrationMode = 'ASK' | 'RESEARCH' | 'EXPLORE' | 'GENERATE';

export interface OrchestrationDecision {
  mode: OrchestrationMode;
  reason: string;
  unresolvedQuestion: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  targetArtifact?: NextActionPlan['targetArtifact'];
  requiresHumanApproval: boolean;
}

export interface OrchestratedTurn {
  decision: OrchestrationDecision;
  result: DiscoveryTurnResult;
  nextAction: NextActionPlan;
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
  const plan = planNextCreatorAction(project, message);
  const confidence = plan.mode === 'ASK' ? 'LOW' : plan.mode === 'REVIEW' || plan.mode === 'REGENERATE' ? 'HIGH' : 'MEDIUM';

  return {
    mode: plan.mode === 'REVIEW' || plan.mode === 'REGENERATE' ? 'GENERATE' : plan.mode,
    reason: plan.reason,
    unresolvedQuestion: plan.question || message,
    confidence,
    targetArtifact: plan.targetArtifact,
    requiresHumanApproval: plan.requiresHumanApproval
  };
};

export const orchestrateCreatorTurn = async (
  project: TattavaProject,
  message: string,
  sourceAttachment?: { name: string; content: string }
): Promise<OrchestratedTurn> => {
  const nextAction = planNextCreatorAction(project, message);
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
    result,
    nextAction
  };
};
