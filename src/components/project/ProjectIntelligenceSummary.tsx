import React from 'react';
import { Compass, Database, Film, Sparkles } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const ProjectIntelligenceSummary: React.FC = () => {
  const { currentProject } = useProject();
  const config = currentProject.projectConfig;

  if (!config) return null;

  const labels: Record<string, string> = {
    MOVIE: 'Movie',
    DOCUMENTARY: 'Documentary',
    SERIES: 'Series',
    VERTICAL_SERIES: 'Vertical Series',
    PODCAST: 'Podcast',
    EXPLORATION: 'Exploration',
    INFORMANT: 'Informant',
    INTERVIEW: 'Interview',
    SHORT_FILM: 'Short Film',
    OTHER: 'Other',
    INFORMATIONAL: 'Informational',
    EDUCATIONAL: 'Educational',
    INFOTAINMENT: 'Infotainment',
    NARRATIVE: 'Narrative',
    EXPLORATORY: 'Exploratory',
    HYBRID: 'Hybrid',
  };

  return (
    <section className="bg-[#12151c] border border-white/10 rounded-2xl p-4 lg:p-5 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Project Configuration</h2>
            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              {config.configurationStatus === 'USER_CONFIRMED' ? 'Confirmed' : 'AI Proposed'}
            </span>
          </div>
          <p className="text-[11px] text-white/50 mt-1">
            Tattava separates format, content mode and knowledge domain so hybrid projects such as infotainment movies remain first-class projects.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5">
            <Film className="w-3 h-3" /> {labels[config.mediaFormat] || config.mediaFormat}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-semibold">
            {labels[config.contentMode] || config.contentMode}
          </span>
          {config.primaryDomain && (
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5">
              <Compass className="w-3 h-3" /> {config.primaryDomain}
            </span>
          )}
        </div>
      </div>

      {(config.subject || config.secondaryDomains.length > 0) && (
        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <span className="text-[9px] uppercase tracking-wider font-bold text-white/35">Subject</span>
            <p className="text-xs text-white/80 mt-1">{config.subject || 'Not yet confirmed'}</p>
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-wider font-bold text-white/35">Connected Domains</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {config.secondaryDomains.length > 0
                ? config.secondaryDomains.map(domain => (
                    <span key={domain} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/65">
                      {domain}
                    </span>
                  ))
                : <span className="text-[10px] text-white/40">None confirmed yet</span>}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-black/20 border border-white/5 p-2.5">
          <p className="text-lg font-bold text-white">{currentProject.projectIntelligence?.researchUniverse.dimensions.length || 0}</p>
          <p className="text-[9px] uppercase tracking-wider text-white/35">Research Dimensions</p>
        </div>
        <div className="rounded-xl bg-black/20 border border-white/5 p-2.5">
          <p className="text-lg font-bold text-white">{currentProject.projectIntelligence?.insights.length || 0}</p>
          <p className="text-[9px] uppercase tracking-wider text-white/35">Insights</p>
        </div>
        <div className="rounded-xl bg-black/20 border border-white/5 p-2.5">
          <p className="text-lg font-bold text-white">{currentProject.projectIntelligence?.directions.length || 0}</p>
          <p className="text-[9px] uppercase tracking-wider text-white/35">Directions</p>
        </div>
      </div>
    </section>
  );
};
