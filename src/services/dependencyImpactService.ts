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
  const impacted = dependencies.filter(dep =>
    !sourceId || dep.sourceEntityId === sourceId || dep.targetEntityId === sourceId
  );

  const items: ImpactChangeItem[] = impacted.map((dep, index) => ({
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

  const staleDependencies = dependencies.filter(d => d.isStale);
  const staleItems = staleDependencies
    .filter(d => !items.some(i => i.id.includes(d.id)))
    .map((dep, index) => ({
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

  const allItems = [...items, ...staleItems];
  const summary = {
    characters: allItems.filter(i => i.category === 'Characters').length,
    story: allItems.filter(i => i.category === 'Story').length,
    scenes: allItems.filter(i => i.category === 'Scenes').length,
    dialogue: allItems.filter(i => i.category === 'Dialogue').length,
    visuals: allItems.filter(i => i.category === 'Visuals').length,
    production: allItems.filter(i => i.category === 'Production').length
  };

  return {
    isOpen: allItems.length > 0,
    sourceTrigger: trigger.sourceDescription || (
      (trigger.field ? trigger.field + ': ' : '') +
      String(trigger.oldValue ?? '') + ' → ' + String(trigger.newValue ?? '')
    ),
    totalAffected: allItems.length,
    summary,
    items: allItems
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
