import { TattavaProject, RegenerationPlanItem, Character, TreatmentData, SceneItem } from '../types/project';
import { generateCharacterCandidate, generateTreatmentData, generateSceneBreakdown } from './aiService';

export type RegenerationResult =
  | { ok: true; artifactType: 'character'; artifactId: string; artifact: Character; message: string }
  | { ok: true; artifactType: 'treatment'; artifactId: string; artifact: TreatmentData; message: string }
  | { ok: true; artifactType: 'scene'; artifactId: string; artifact: SceneItem; message: string }
  | { ok: false; artifactType: RegenerationPlanItem['artifactType']; artifactId: string; message: string };

export const executeRegenerationItem = async (
  project: TattavaProject,
  item: RegenerationPlanItem
): Promise<RegenerationResult> => {
  if (item.blockedByApproval) {
    return { ok: false, artifactType: item.artifactType, artifactId: item.artifactId, message: 'Impact approval is required before regeneration.' };
  }

  if (item.action !== 'REGENERATE') {
    return { ok: false, artifactType: item.artifactType, artifactId: item.artifactId, message: 'This item requires ' + item.action + ', not direct regeneration.' };
  }

  if (item.artifactType === 'character') {
    const existing = project.characters.find(c => c.id === item.artifactId);
    if (!existing) return { ok: false, artifactType: 'character', artifactId: item.artifactId, message: 'Character artifact not found.' };

    const candidate = await generateCharacterCandidate(
      project,
      existing.role,
      'Regenerate existing character "' + existing.name + '" while preserving approved identity and resolving the current dependency impact: ' + item.reason
    );

    const artifact: Character = {
      ...existing,
      name: candidate.name || existing.name,
      age: candidate.age || existing.age,
      want: candidate.want || existing.want,
      flaw: candidate.flaw || existing.flaw,
      fear: candidate.fear || existing.fear,
      moralDilemma: candidate.moralDilemma || existing.moralDilemma,
      backstory: candidate.backstory || existing.backstory,
      secret: candidate.secret || existing.secret,
      voiceStyle: candidate.linguisticCadence || existing.voiceStyle,
      candidateState: 'AI_PROPOSAL'
    };
    return { ok: true, artifactType: 'character', artifactId: existing.id, artifact, message: 'Character regenerated as an AI proposal; canonical state unchanged.' };
  }

  if (item.artifactType === 'treatment') {
    const generated = await generateTreatmentData(project);
    const existing = project.treatment;
    const artifact: TreatmentData = {
      ...existing,
      synopsis: generated.synopsis,
      themes: generated.themes,
      tone: generated.tone,
      plotBeats: generated.plotBeats,
      wordCount: generated.synopsis.split(/\s+/).filter(Boolean).length,
      candidateState: 'AI_PROPOSAL'
    };
    return { ok: true, artifactType: 'treatment', artifactId: item.artifactId, artifact, message: 'Treatment regenerated as an AI proposal; canonical state unchanged.' };
  }

  if (item.artifactType === 'scene') {
    const generated = await generateSceneBreakdown(project);
    const existing = project.scenes.find(s => s.id === item.artifactId);
    if (!existing) return { ok: false, artifactType: 'scene', artifactId: item.artifactId, message: 'Scene artifact not found.' };
    const replacement = generated.find(s => s.sceneNumber === existing.sceneNumber) || generated[0];
    if (!replacement) return { ok: false, artifactType: 'scene', artifactId: item.artifactId, message: 'No regenerated scene was returned.' };

    const artifact: SceneItem = {
      ...existing,
      ...replacement,
      id: existing.id,
      sceneNumber: existing.sceneNumber,
      candidateState: 'AI_PROPOSAL'
    };
    return { ok: true, artifactType: 'scene', artifactId: existing.id, artifact, message: 'Scene regenerated as an AI proposal; canonical state unchanged.' };
  }

  return { ok: false, artifactType: item.artifactType, artifactId: item.artifactId, message: 'No safe automatic generator is wired for this artifact type yet.' };
};
