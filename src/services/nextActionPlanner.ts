import { TattavaProject } from '../types/project';

export type NextActionMode = 'ASK' | 'RESEARCH' | 'EXPLORE' | 'GENERATE' | 'REVIEW' | 'REGENERATE';

export interface NextActionPlan {
  mode: NextActionMode;
  reason: string;
  question?: string;
  targetArtifact?: 'research' | 'direction' | 'character' | 'treatment' | 'scene' | 'dialogue' | 'evaluation';
  sourcePlanId?: string;
  sourceItemId?: string;
  requiresHumanApproval: boolean;
}

const unresolvedQuestions = (project: TattavaProject): string[] => [
  ...(project.projectIntelligence?.development?.nextUnresolvedQuestion ? [project.projectIntelligence.development.nextUnresolvedQuestion] : []),
  ...(project.intent?.missingQuestions || []),
  ...(project.intent?.unknownInformation || []),
  ...(project.projectIntelligence?.researchUniverse?.unresolvedQuestions || [])
].map(q => q?.trim()).filter(Boolean).filter((q, i, all) => all.indexOf(q) === i);

export const planNextCreatorAction = (project: TattavaProject, message?: string): NextActionPlan => {
  const text = (message || '').toLowerCase();

  const evaluationPlan = project.evaluationRepairPlan;
  if (evaluationPlan?.status === 'OPEN' || evaluationPlan?.status === 'PARTIAL') {
    const repair = evaluationPlan.items
      .filter(i => i.status !== 'RESOLVED')
      .sort((a, b) => ({ HIGH: 0, MEDIUM: 1, LOW: 2 } as any)[a.priority] - ({ HIGH: 0, MEDIUM: 1, LOW: 2 } as any)[b.priority])[0];
    if (repair) {
      return {
        mode: repair.action === 'REGENERATE' ? 'REGENERATE' : repair.action === 'RESEARCH' ? 'RESEARCH' : 'REVIEW',
        reason: repair.recommendation,
        question: repair.problem,
        targetArtifact: repair.targetArtifact,
        requiresHumanApproval: true
      };
    }
  }

  const openPlan = [...(project.regenerationPlans || [])].find(p => p.status === 'READY' || p.status === 'PARTIAL');
  if (openPlan) {
    const item = openPlan.items.find(i => !i.blockedByApproval && i.stale) || openPlan.items.find(i => i.blockedByApproval);
    if (item?.blockedByApproval) {
      return {
        mode: 'REVIEW',
        reason: 'A downstream change-impact plan is awaiting human approval before regeneration.',
        sourcePlanId: openPlan.id,
        sourceItemId: item.id,
        requiresHumanApproval: true
      };
    }
    if (item) {
      return {
        mode: item.action === 'REGENERATE' ? 'REGENERATE' : 'REVIEW',
        reason: item.reason,
        targetArtifact: item.artifactType,
        sourcePlanId: openPlan.id,
        sourceItemId: item.id,
        requiresHumanApproval: item.action !== 'REGENERATE'
      };
    }
  }

  const explicitResearch = /(research|source|evidence|verify|fact|historical|history|authentic|accurate)/.test(text);
  const explicitGenerate = /(write|draft|generate|create|scene|treatment|character|dialogue|screenplay|outline)/.test(text);
  const explicitExplore = /(explore|alternative|options|direction|what if|compare)/.test(text);

  const selectedDirection = project.projectIntelligence?.directions?.find(d => d.status === 'SELECTED');
  const acceptedInsight = project.projectIntelligence?.insights?.find(i => i.status === 'ACCEPTED');
  const verifiedEvidence = (project.researchFindings || []).some(f => f.status === 'Verified');
  const question = unresolvedQuestions(project)[0];

  if (explicitResearch) return { mode: 'RESEARCH', reason: 'Creator explicitly requests evidence or verification.', targetArtifact: 'research', question, requiresHumanApproval: true };
  if (explicitGenerate) {
    const targetArtifact = text.includes('dialogue') ? 'dialogue' : text.includes('scene') ? 'scene' : text.includes('character') ? 'character' : text.includes('treatment') ? 'treatment' : 'evaluation';
    return { mode: 'GENERATE', reason: 'Creator explicitly requests a development artifact.', targetArtifact, question, requiresHumanApproval: true };
  }
  if (explicitExplore) return { mode: 'EXPLORE', reason: 'Creator explicitly requests alternatives or creative exploration.', targetArtifact: 'direction', question, requiresHumanApproval: true };
  if (question && !verifiedEvidence && !selectedDirection) return { mode: 'RESEARCH', reason: 'The project has unresolved questions without sufficient verified evidence.', targetArtifact: 'research', question, requiresHumanApproval: true };
  if (acceptedInsight && !selectedDirection) return { mode: 'EXPLORE', reason: 'Accepted insights exist but no direction is authoritative.', targetArtifact: 'direction', question: question || 'Which direction should become authoritative?', requiresHumanApproval: true };
  if (selectedDirection) return { mode: 'GENERATE', reason: 'An approved direction exists and grounded development can proceed.', targetArtifact: 'treatment', question, requiresHumanApproval: true };

  return { mode: 'ASK', reason: 'Tattava needs creator input before making a consequential project decision.', question: question || 'What should Tattava resolve next?', requiresHumanApproval: true };
};
