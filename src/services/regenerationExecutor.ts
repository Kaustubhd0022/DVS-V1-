import { TattavaProject, RegenerationPlanItem, Character, TreatmentData, SceneItem, ScreenplayLine, DialogueSuggestion } from '../types/project';
import { generateCharacterCandidate, generateTreatmentData, generateSceneBreakdown, generateScreenplayDraft, punchUpDialogue } from './aiService';

export type RegenerationResult =
  | { ok: true; artifactType: 'character'; artifactId: string; artifact: Character; message: string }
  | { ok: true; artifactType: 'treatment'; artifactId: string; artifact: TreatmentData; message: string }
  | { ok: true; artifactType: 'scene'; artifactId: string; artifact: SceneItem; message: string }
  | { ok: true; artifactType: 'screenplay'; artifactId: string; artifact: ScreenplayLine[]; message: string }
  | { ok: true; artifactType: 'dialogue'; artifactId: string; artifact: DialogueSuggestion[]; message: string }
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
      (existing.role === 'Protagonist' || existing.role === 'Antagonist') ? existing.role : 'Key Supporting',
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

  if (item.artifactType === 'screenplay') {
    const existingLines = project.screenplay || project.screenplayLines || [];
    const sceneNumber = Number(item.artifactId.split(':').pop()) || project.scenes?.[0]?.sceneNumber || 1;
    const generated = await generateScreenplayDraft(project, sceneNumber);
    const artifact = generated.map(line => ({
      ...line,
      configurationFingerprint: project.projectConfig?.configurationFingerprint,
      isSynthesisStale: false
    }));
    return {
      ok: true,
      artifactType: 'screenplay',
      artifactId: item.artifactId,
      artifact,
      message: `Screenplay regenerated from current Scene ${sceneNumber}; canonical state unchanged.`
    };
  }

  if (item.artifactType === 'dialogue') {
    const existing = project.dialogueSuggestions.find(d => d.id === item.artifactId);
    if (!existing) return { ok: false, artifactType: 'dialogue', artifactId: item.artifactId, message: 'Dialogue artifact not found.' };

    const screenplayLine = (project.screenplay || project.screenplayLines || [])
      .find(line => line.type === 'dialogue' && (!existing.character || line.characterName === existing.character));
    if (!screenplayLine) {
      return { ok: false, artifactType: 'dialogue', artifactId: item.artifactId, message: 'No current screenplay dialogue source found.' };
    }

    const scene = project.scenes?.find(s => s.sceneNumber === screenplayLine.sceneNumber);
    const sceneContext = [
      scene ? `Scene ${scene.sceneNumber}: ${scene.slugline}` : '',
      scene?.summary || '',
      scene?.emotionalBeat || '',
      `Current screenplay line: ${screenplayLine.content}`
    ].filter(Boolean).join(' | ');

    const [altA, altB] = await Promise.all([
      punchUpDialogue(screenplayLine.content, screenplayLine.characterName || existing.character, sceneContext, project, 'Preserve character voice while increasing subtext and specificity.'),
      punchUpDialogue(screenplayLine.content, screenplayLine.characterName || existing.character, sceneContext, project, 'Create a materially different emotional strategy without changing canon facts.')
    ]);

    const fingerprint = project.projectConfig?.configurationFingerprint;
    const artifact: DialogueSuggestion[] = [
      { ...existing, id: existing.id + '-regen-a-' + Date.now(), label: 'Regenerated — Subtext', text: altA, candidateState: 'AI_PROPOSAL', configurationFingerprint: fingerprint, isSynthesisStale: false },
      { ...existing, id: existing.id + '-regen-b-' + Date.now(), label: 'Regenerated — Alternate Strategy', text: altB, candidateState: 'AI_PROPOSAL', configurationFingerprint: fingerprint, isSynthesisStale: false }
    ];
    return {
      ok: true,
      artifactType: 'dialogue',
      artifactId: existing.id,
      artifact,
      message: 'Dialogue alternatives regenerated from the current screenplay and scene context; canonical state unchanged.'
    };
  }

  return { ok: false, artifactType: item.artifactType, artifactId: item.artifactId, message: 'No safe automatic generator is wired for this artifact type yet.' };
};
