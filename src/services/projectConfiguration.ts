import { TattavaProject } from '../types/project';
import {
  ProjectConfiguration,
  DEFAULT_PROJECT_CONFIGURATION,
  inferMediaFormat,
  inferContentMode
} from '../domain/tattvacoProject';

export interface CanonicalConfiguration extends ProjectConfiguration {
  formatLabel: string;
  templateName: string;
  episodeCount?: number;
  episodeDurationMins?: number;
  activeEpisodeNumber?: number;
  configurationFingerprint: string;
}

export const isSeriesFormat = (formatLabel = '') => /series/i.test(formatLabel);

export const getCanonicalConfiguration = (project: TattavaProject): CanonicalConfiguration => {
  const formatLabel =
    project.format ||
    project.formats?.find(f => f.isSelected)?.title ||
    project.projectConfig?.formatLabel ||
    project.contentType ||
    'Feature Film';

  const templateName =
    project.template ||
    project.templates?.find(t => t.isSelected)?.title ||
    project.projectConfig?.templateName ||
    project.structure?.templateName ||
    'Three-Act Classical Thriller';

  const series = isSeriesFormat(formatLabel);
  const episodeCount = series ? (project.projectConfig?.episodeCount || project.structure?.episodeCount || 6) : undefined;
  const episodeDurationMins = series ? (project.projectConfig?.episodeDurationMins || project.structure?.episodeDurationMins || 45) : undefined;
  const activeEpisodeNumber = series ? (project.projectConfig?.activeEpisodeNumber || project.structure?.activeEpisodeNumber || 1) : undefined;
  const runtime = series ? episodeDurationMins! : (project.structure?.estimatedDurationMins || 120);

  const fingerprint = [
    formatLabel.trim(),
    templateName.trim(),
    runtime,
    series ? `episodes:${episodeCount}` : 'feature',
    series ? `episode:${activeEpisodeNumber}` : 'film'
  ].join('|');

  const base = project.projectConfig || DEFAULT_PROJECT_CONFIGURATION;

  return {
    ...base,
    formatLabel,
    templateName,
    mediaFormat: inferMediaFormat(formatLabel),
    contentMode: base.contentMode || inferContentMode(project.contentType || formatLabel),
    subject: base.subject || project.intent?.premise || '',
    episodeCount,
    episodeDurationMins,
    activeEpisodeNumber,
    configurationFingerprint: fingerprint,
    configurationStatus: base.configurationStatus || 'PROPOSED'
  };
};

export const applyCanonicalConfiguration = (project: TattavaProject): TattavaProject => {
  const config = getCanonicalConfiguration(project);
  const previousFingerprint = project.projectConfig?.configurationFingerprint;
  const changed = Boolean(previousFingerprint && previousFingerprint !== config.configurationFingerprint);
  const demoWorkspace = Boolean(project.isDemo);

  return {
    ...project,
    contentType: config.formatLabel,
    format: config.formatLabel,
    template: config.templateName,
    projectConfig: config,
    structure: {
      ...project.structure,
      templateName: config.templateName,
      estimatedDurationMins: config.episodeDurationMins || project.structure?.estimatedDurationMins || 120,
      structureScope: isSeriesFormat(config.formatLabel) ? 'EPISODE' : 'FEATURE',
      episodeCount: config.episodeCount,
      episodeDurationMins: config.episodeDurationMins,
      activeEpisodeNumber: config.activeEpisodeNumber,
      configurationFingerprint: config.configurationFingerprint,
      isSynthesisStale: demoWorkspace ? false : changed || project.structure?.configurationFingerprint !== config.configurationFingerprint
    },
    treatment: {
      ...project.treatment,
      configurationFingerprint: config.configurationFingerprint,
      isSynthesisStale: demoWorkspace ? false : changed || project.treatment?.configurationFingerprint !== config.configurationFingerprint
    },
    scenes: (project.scenes || []).map(scene => ({
      ...scene,
      configurationFingerprint: scene.configurationFingerprint || previousFingerprint,
      isSynthesisStale: demoWorkspace ? false : changed || scene.configurationFingerprint !== config.configurationFingerprint
    })),
    screenplay: (project.screenplay || []).map(line => ({
      ...line,
      isSynthesisStale: demoWorkspace ? false : changed || line.configurationFingerprint !== config.configurationFingerprint
    })),
    screenplayLines: (project.screenplayLines || project.screenplay || []).map(line => ({
      ...line,
      isSynthesisStale: demoWorkspace ? false : changed || line.configurationFingerprint !== config.configurationFingerprint
    })),
    dialogueSuggestions: (project.dialogueSuggestions || []).map(dialogue => ({
      ...dialogue,
      isSynthesisStale: changed || dialogue.configurationFingerprint !== config.configurationFingerprint
    }))
  };
};

export const invalidateDownstreamArtifacts = (
  project: TattavaProject,
  configurationFingerprint: string
): TattavaProject => ({
  ...project,
  structure: {
    ...project.structure,
    configurationFingerprint,
    isSynthesisStale: true
  },
  treatment: {
    ...project.treatment,
    configurationFingerprint,
    isSynthesisStale: true
  },
  scenes: (project.scenes || []).map(scene => ({
    ...scene,
    configurationFingerprint: scene.configurationFingerprint,
    isSynthesisStale: true
  })),
  screenplay: (project.screenplay || []).map(line => ({
    ...line,
    configurationFingerprint: line.configurationFingerprint,
    isSynthesisStale: true
  })),
  screenplayLines: (project.screenplayLines || project.screenplay || []).map(line => ({
    ...line,
    configurationFingerprint: line.configurationFingerprint,
    isSynthesisStale: true
  })),
  dialogueSuggestions: (project.dialogueSuggestions || []).map(dialogue => ({
    ...dialogue,
    configurationFingerprint: dialogue.configurationFingerprint,
    isSynthesisStale: true
  })),
  evaluation: null,
  evaluationHistory: [],
  evaluationRepairPlan: null,
  evaluationComparisons: [],
  package: {
    ...project.package,
    configurationFingerprint,
    isSynthesisStale: true,
    isGreenlit: false,
    checklist: project.package.checklist.map(item => ({
      ...item,
      completed: item.name === 'Core Premise & Story Brain Initialized' ? item.completed : false
    }))
  }
});
