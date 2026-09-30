import { TattavaProject, RegenerationPlan, RegenerationPlanItem, ImpactAnalysisState, ArtifactVersionRecord } from '../types/project';

const artifactTypeFromCategory = (category: string): ArtifactVersionRecord['artifactType'] => {
  if (category === 'Characters') return 'character';
  if (category === 'Dialogue') return 'dialogue';
  if (category === 'Scenes') return 'scene';
  if (category === 'Screenplay') return 'screenplay';
  if (category === 'Story') return 'treatment';
  return 'scene';
};

const priorityFor = (severity: 'High' | 'Medium' | 'Low'): RegenerationPlanItem['priority'] =>
  severity === 'High' ? 'HIGH' : severity === 'Medium' ? 'MEDIUM' : 'LOW';

const resolveArtifact = (project: TattavaProject, category: string, objectName: string, impactId: string) => {
  const type = artifactTypeFromCategory(category);

  if (type === 'character') {
    const found = project.characters.find(c => objectName === c.name || objectName.includes(c.name));
    return { artifactType: type, artifactId: found?.id || impactId, artifactName: found?.name || objectName };
  }
  if (type === 'scene') {
    const found = project.scenes.find(s => objectName.includes('Scene ' + s.sceneNumber) || objectName.includes(s.slugline));
    return { artifactType: type, artifactId: found?.id || impactId, artifactName: found ? 'Scene ' + found.sceneNumber + ': ' + found.slugline : objectName };
  }
  if (type === 'screenplay') {
    const match = objectName.match(/Scene (\\d+)/i);
    return { artifactType: type, artifactId: 'screenplay:scene:' + (match?.[1] || '1'), artifactName: objectName };
  }
  if (type === 'dialogue') {
    const found = project.dialogueSuggestions.find(d => objectName === d.label || objectName === d.character);
    return { artifactType: type, artifactId: found?.id || impactId, artifactName: found?.label || objectName };
  }
  return { artifactType: type, artifactId: impactId, artifactName: objectName };
};

const actionForImpact = (project: TattavaProject, item: ImpactAnalysisState['items'][number]): RegenerationPlanItem['action'] => {
  if (item.category === 'Story' && item.field.toLowerCase().includes('research')) return 'REVERIFY_RESEARCH';
  if (item.category === 'Story') return 'REBUILD_CONTEXT';

  const resolved = resolveArtifact(project, item.category, item.objectName, item.id);
  const version = (project.artifactVersions || []).find(v =>
    v.artifactType === resolved.artifactType && v.artifactId === resolved.artifactId && v.state === 'CANONICAL'
  );

  return version ? 'REGENERATE' : 'REVIEW';
};

export const buildRegenerationPlan = (
  project: TattavaProject,
  impactState: ImpactAnalysisState
): RegenerationPlan => {
  const items: RegenerationPlanItem[] = impactState.items.map(item => {
    const resolved = resolveArtifact(project, item.category, item.objectName, item.id);
    const action = actionForImpact(project, item);

    return {
      id: 'regen-' + item.id,
      artifactType: resolved.artifactType,
      artifactId: resolved.artifactId,
      artifactName: resolved.artifactName,
      reason: item.reason,
      action,
      priority: priorityFor(item.severity),
      stale: true,
      blockedByApproval: !item.approved,
      executionStatus: !item.approved ? 'BLOCKED' : 'PENDING'
    };
  });

  const summary = {
    review: items.filter(i => i.action === 'REVIEW').length,
    regenerate: items.filter(i => i.action === 'REGENERATE').length,
    rebuildContext: items.filter(i => i.action === 'REBUILD_CONTEXT').length,
    reverifyResearch: items.filter(i => i.action === 'REVERIFY_RESEARCH').length
  };

  const status = items.length === 0
    ? 'COMPLETED'
    : items.some(i => i.blockedByApproval)
      ? 'BLOCKED'
      : items.some(i => i.action === 'REVIEW')
        ? 'PARTIAL'
        : 'READY';

  return {
    id: 'regen-plan-' + Date.now(),
    sourceTrigger: impactState.sourceTrigger,
    generatedAt: new Date().toISOString(),
    status,
    items,
    summary
  };
};
