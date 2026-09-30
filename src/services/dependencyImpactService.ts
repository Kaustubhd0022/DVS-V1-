import { TattavaProject, ImpactChangeItem, ImpactAnalysisState, StoryDependency } from '../types/project';

export interface ChangeTrigger {
  sourceEntityId?: string;
  sourceDescription?: string;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

const categoryForDependency = (dep: StoryDependency): ImpactChangeItem['category'] => {
  if (dep.dependencyType === 'Character -> Scene' || dep.dependencyType === 'Treatment -> Scene') return 'Scenes';
  if (dep.dependencyType === 'Scene -> Screenplay' || dep.dependencyType === 'Character -> Screenplay' || dep.dependencyType === 'Canon -> Screenplay') return 'Screenplay';
  if (dep.dependencyType === 'Canon -> Motivation') return 'Characters';
  if (dep.dependencyType === 'Research -> Plot' || dep.dependencyType === 'Structure -> Treatment' || dep.dependencyType === 'Research -> Treatment') return 'Story';
  if (dep.dependencyType === 'Beat -> Dialogue' || dep.dependencyType === 'Screenplay -> Dialogue') return 'Dialogue';
  return 'Story';
};

const severityForDependency = (dep: StoryDependency): ImpactChangeItem['severity'] =>
  dep.dependencyType === 'Canon -> Motivation' ||
  dep.dependencyType === 'Research -> Plot' ||
  dep.dependencyType === 'Scene -> Screenplay' ||
  dep.dependencyType === 'Character -> Screenplay'
    ? 'High'
    : 'Medium';

export const deriveArtifactDependencies = (project: TattavaProject): StoryDependency[] => {
  const edges: StoryDependency[] = [];

  project.characters.forEach(character => {
    project.scenes
      .filter(scene => scene.characterIds.includes(character.id) || scene.characters.includes(character.name))
      .forEach(scene => edges.push({
        id: `derived-character-scene-${character.id}-${scene.id}`,
        sourceEntityId: character.id,
        sourceName: character.name,
        targetEntityId: scene.id,
        targetName: `Scene ${scene.sceneNumber}: ${scene.slugline}`,
        dependencyType: 'Character -> Scene',
        description: 'Scene directly references this character.',
        isStale: Boolean(scene.isSynthesisStale)
      }));
  });

  project.scenes.forEach(scene => {
    const screenplayId = `screenplay:scene:${scene.sceneNumber}`;
    edges.push({
      id: `derived-scene-screenplay-${scene.id}`,
      sourceEntityId: scene.id,
      sourceName: `Scene ${scene.sceneNumber}`,
      targetEntityId: screenplayId,
      targetName: `Screenplay Scene ${scene.sceneNumber}`,
      dependencyType: 'Scene -> Screenplay',
      description: 'Screenplay is generated from the current scene breakdown.',
      isStale: Boolean(scene.isSynthesisStale || project.screenplay.some(line => line.sceneNumber === scene.sceneNumber && line.isSynthesisStale))
    });
  });

  project.screenplay.forEach(line => {
    if (line.type !== 'dialogue') return;
    const dialogueTargets = project.dialogueSuggestions.filter(d => !line.characterName || d.character === line.characterName);
    dialogueTargets.forEach(dialogue => edges.push({
      id: `derived-screenplay-dialogue-${line.id}-${dialogue.id}`,
      sourceEntityId: `screenplay:scene:${line.sceneNumber}`,
      sourceName: `Screenplay Scene ${line.sceneNumber}`,
      targetEntityId: dialogue.id,
      targetName: dialogue.label || dialogue.character,
      dependencyType: 'Screenplay -> Dialogue',
      description: 'Dialogue suggestion is derived from the current screenplay voice and scene context.',
      isStale: Boolean(dialogue.isSynthesisStale)
    }));
  });

  project.treatment?.plotBeats?.forEach(beat => {
    project.scenes
      .filter(scene => scene.act.replace('ACT ', '').startsWith(beat.act.replace('ACT ', '').charAt(0)))
      .forEach(scene => edges.push({
        id: `derived-treatment-scene-${beat.id}-${scene.id}`,
        sourceEntityId: `treatment-beat:${beat.id}`,
        sourceName: beat.title,
        targetEntityId: scene.id,
        targetName: `Scene ${scene.sceneNumber}: ${scene.slugline}`,
        dependencyType: 'Treatment -> Scene',
        description: 'Scene is downstream of the treatment beat covering its act.',
        isStale: Boolean(beat.isSynthesisStale || scene.isSynthesisStale)
      }));
  });

  if (project.treatment) {
    edges.push({
      id: 'derived-structure-treatment',
      sourceEntityId: 'structure',
      sourceName: 'Story Structure',
      targetEntityId: 'treatment',
      targetName: 'Narrative Treatment',
      dependencyType: 'Structure -> Treatment',
      description: 'Treatment is generated from the active story structure.',
      isStale: Boolean(project.structure.isSynthesisStale || project.treatment.isSynthesisStale)
    });
  }

  project.storyBrain?.canonFacts?.forEach(fact => {
    fact.entityIds.forEach(entityId => {
      const character = project.characters.find(c => c.id === entityId);
      if (character) {
        edges.push({
          id: `derived-canon-character-${fact.id}-${character.id}`,
          sourceEntityId: fact.id,
          sourceName: fact.statement,
          targetEntityId: character.id,
          targetName: character.name,
          dependencyType: 'Canon -> Motivation',
          description: 'Character intelligence depends on this approved canon fact.',
          isStale: false
        });
      }
    });
  });

  return edges;
};

export const resolveDependencyImpact = (
  project: TattavaProject,
  trigger: ChangeTrigger
): ImpactAnalysisState => {
  const dependencies = [
    ...(project.storyBrain?.dependencies || []),
    ...deriveArtifactDependencies(project)
  ].filter((dep, index, all) => all.findIndex(existing => existing.id === dep.id) === index);
  const sourceId = trigger.sourceEntityId;

  // Walk the dependency graph transitively. A changed upstream entity must
  // surface not only its direct consumers but every downstream consumer.
  const reachable = new Set<string>(sourceId ? [sourceId] : []);
  const impactedDependencies: typeof dependencies = [];
  let frontier = sourceId ? [sourceId] : [];

  while (frontier.length) {
    const next: string[] = [];
    for (const id of frontier) {
      dependencies
        .filter(dep => dep.sourceEntityId === id)
        .forEach(dep => {
          if (!impactedDependencies.some(existing => existing.id === dep.id)) {
            impactedDependencies.push(dep);
          }
          if (!reachable.has(dep.targetEntityId)) {
            reachable.add(dep.targetEntityId);
            next.push(dep.targetEntityId);
          }
        });
    }
    frontier = next;
  }

  const directlyRelevant = sourceId
    ? dependencies.filter(dep => dep.targetEntityId === sourceId && !impactedDependencies.some(i => i.id === dep.id))
    : dependencies;

  const allDependencies = [...impactedDependencies, ...directlyRelevant];

  const items: ImpactChangeItem[] = allDependencies.map((dep, index) => ({
    id: 'impact-' + dep.id + '-' + index,
    category: categoryForDependency(dep),
    objectName: dep.targetName,
    field: dep.dependencyType,
    oldValue: String(trigger.oldValue ?? 'Current approved state'),
    newValue: String(trigger.newValue ?? 'Requires review/regeneration'),
    reason: dep.staleReason || dep.description,
    severity: severityForDependency(dep),
    approved: false
  }));

  // Artifact-level downstream edges are inferred where the persisted graph
  // has not yet been explicitly materialized.
  if (sourceId) {
    const character = project.characters.find(c => c.id === sourceId);
    if (character) {
      project.scenes
        .filter(scene => scene.characterIds.includes(sourceId) || scene.characters.includes(character.name))
        .forEach((scene, index) => items.push({
          id: 'inferred-scene-' + scene.id + '-' + index,
          category: 'Scenes',
          objectName: 'Scene ' + scene.sceneNumber + ': ' + scene.slugline,
          field: trigger.field || 'Character dependency',
          oldValue: String(trigger.oldValue ?? 'Current approved character state'),
          newValue: String(trigger.newValue ?? 'Requires review/regeneration'),
          reason: 'Scene references the changed character and may depend on the changed state.',
          severity: 'High',
          approved: false
        }));

      project.screenplay
        .filter(line => project.scenes.some(scene => scene.sceneNumber === line.sceneNumber && (scene.characterIds.includes(character.id) || scene.characters.includes(character.name))))
        .forEach((line, index) => items.push({
          id: 'inferred-screenplay-' + line.id + '-' + index,
          category: 'Screenplay',
          objectName: 'Screenplay Scene ' + line.sceneNumber,
          field: trigger.field || 'Character dependency',
          oldValue: String(trigger.oldValue ?? 'Current approved screenplay'),
          newValue: String(trigger.newValue ?? 'Requires regeneration'),
          reason: 'Screenplay line belongs to a scene affected by the changed character.',
          severity: 'High',
          approved: false
        }));

      project.dialogueSuggestions
        .filter(dialogue => dialogue.character === character.name)
        .forEach((dialogue, index) => items.push({
          id: 'inferred-dialogue-' + dialogue.id + '-' + index,
          category: 'Dialogue',
          objectName: dialogue.label || dialogue.character,
          field: trigger.field || 'Character dependency',
          oldValue: String(trigger.oldValue ?? 'Current approved character state'),
          newValue: String(trigger.newValue ?? 'Requires review/regeneration'),
          reason: 'Dialogue is authored for the changed character and may require voice/subtext review.',
          severity: 'Medium',
          approved: false
        }));
    }
  }

  const staleDependencies = dependencies.filter(d => d.isStale);
  staleDependencies
    .filter(d => !items.some(i => i.id.includes(d.id)))
    .forEach((dep, index) => items.push({
      id: 'stale-' + dep.id + '-' + index,
      category: categoryForDependency(dep),
      objectName: dep.targetName,
      field: dep.dependencyType,
      oldValue: 'Previously grounded',
      newValue: 'Stale — review required',
      reason: dep.staleReason || 'Upstream canonical state changed.',
      severity: severityForDependency(dep),
      approved: false
    }));

  const deduped = items.filter((item, index, arr) =>
    arr.findIndex(other => other.objectName === item.objectName && other.category === item.category && other.field === item.field) === index
  );

  return {
    isOpen: deduped.length > 0,
    sourceEntityId: sourceId,
    sourceTrigger: trigger.sourceDescription || (
      (trigger.field ? trigger.field + ': ' : '') +
      String(trigger.oldValue ?? '') + ' → ' + String(trigger.newValue ?? '')
    ),
    totalAffected: deduped.length,
    summary: {
      characters: deduped.filter(i => i.category === 'Characters').length,
      story: deduped.filter(i => i.category === 'Story').length,
      scenes: deduped.filter(i => i.category === 'Scenes').length,
      screenplay: deduped.filter(i => i.category === 'Screenplay').length,
      dialogue: deduped.filter(i => i.category === 'Dialogue').length,
      visuals: deduped.filter(i => i.category === 'Visuals').length,
      production: deduped.filter(i => i.category === 'Production').length
    },
    items: deduped
  };
};


export const markImpactedDependenciesStale = (
  dependencies: StoryDependency[],
  sourceEntityId: string,
  reason: string
): StoryDependency[] =>
  dependencies.map(dep =>
    dep.sourceEntityId === sourceEntityId
      ? { ...dep, isStale: true, staleReason: reason }
      : dep
  );
