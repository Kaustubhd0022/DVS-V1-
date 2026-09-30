import { TattavaProject, ImpactChangeItem, ImpactAnalysisState, StoryDependency } from '../types/project';

export interface ChangeTrigger {
  sourceEntityId?: string;
  sourceDescription?: string;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

const categoryForDependency = (dep: StoryDependency): ImpactChangeItem['category'] => {
  if (dep.dependencyType === 'Character -> Scene') return 'Scenes';
  if (dep.dependencyType === 'Canon -> Motivation') return 'Characters';
  if (dep.dependencyType === 'Research -> Plot') return 'Story';
  if (dep.dependencyType === 'Beat -> Dialogue') return 'Dialogue';
  return 'Story';
};

const severityForDependency = (dep: StoryDependency): ImpactChangeItem['severity'] =>
  dep.dependencyType === 'Canon -> Motivation' || dep.dependencyType === 'Research -> Plot' ? 'High' : 'Medium';

export const resolveDependencyImpact = (
  project: TattavaProject,
  trigger: ChangeTrigger
): ImpactAnalysisState => {
  const dependencies = project.storyBrain?.dependencies || [];
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
