import React from 'react';
import { Compass, Film, Sparkles } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { DirectionDecisionCanonLoop } from './DirectionDecisionCanonLoop';

export const ProjectIntelligenceSummary: React.FC = () => {
  const { currentProject, generateProjectInsights, generateProjectDirections, setProjectInsightStatus } = useProject();
  const [working, setWorking] = React.useState<'insights' | 'directions' | null>(null);
  const config = currentProject.projectConfig;

  if (!config) return null;

  const labels: Record<string, string> = {
    MOVIE: 'Movie', DOCUMENTARY: 'Documentary', SERIES: 'Series', VERTICAL_SERIES: 'Vertical Series',
    PODCAST: 'Podcast', EXPLORATION: 'Exploration', INFORMANT: 'Informant', INTERVIEW: 'Interview',
    SHORT_FILM: 'Short Film', OTHER: 'Other', INFORMATIONAL: 'Informational', EDUCATIONAL: 'Educational',
    INFOTAINMENT: 'Infotainment', NARRATIVE: 'Narrative', EXPLORATORY: 'Exploratory', HYBRID: 'Hybrid',
  };

  const intelligence = currentProject.projectIntelligence;
  const insights = intelligence?.insights || [];
  const directions = intelligence?.directions || [];
  const dimensions = intelligence?.researchUniverse.dimensions || [];
  // Knowledge tools stay hidden until the project has something to work with.
  const hasKnowledge = insights.length > 0 || directions.length > 0 || dimensions.length > 0;
  const hasAcceptedInsight = insights.some(i => i.status === 'ACCEPTED');

  return (
    <>
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
            <p className="text-[11px] text-white/50 mt-1">The format, content type and subject area of this project.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5"><Film className="w-3 h-3" /> {labels[config.mediaFormat] || config.mediaFormat}</span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-semibold">{labels[config.contentMode] || config.contentMode}</span>
            {config.primaryDomain && <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5"><Compass className="w-3 h-3" /> {config.primaryDomain}</span>}
          </div>
        </div>

        {(config.subject || config.secondaryDomains.length > 0) && (
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div><span className="text-[9px] uppercase tracking-wider font-bold text-white/35">Subject</span><p className="text-xs text-white/80 mt-1">{config.subject || 'Not yet confirmed'}</p></div>
            <div><span className="text-[9px] uppercase tracking-wider font-bold text-white/35">Connected Domains</span><div className="flex flex-wrap gap-1.5 mt-1">{config.secondaryDomains.length > 0 ? config.secondaryDomains.map(domain => <span key={domain} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/65">{domain}</span>) : <span className="text-[10px] text-white/40">None confirmed yet</span>}</div></div>
          </div>
        )}

        {!hasKnowledge && (
          <p className="mt-4 pt-4 border-t border-white/5 text-xs text-white/50">
            Research topics, insights and story directions will appear here once you have described your idea in Discovery.
          </p>
        )}

        {hasKnowledge && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-black/20 border border-white/5 p-2.5"><p className="text-lg font-bold text-white">{dimensions.length}</p><p className="text-[9px] uppercase tracking-wider text-white/35">Research Topics</p></div>
              <div className="rounded-xl bg-black/20 border border-white/5 p-2.5"><p className="text-lg font-bold text-white">{insights.length}</p><p className="text-[9px] uppercase tracking-wider text-white/35">Insights</p></div>
              <div className="rounded-xl bg-black/20 border border-white/5 p-2.5"><p className="text-lg font-bold text-white">{directions.length}</p><p className="text-[9px] uppercase tracking-wider text-white/35">Directions</p></div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-3">
                <div><p className="text-[10px] uppercase tracking-wider font-bold text-white/40">Insights and directions</p><p className="text-[11px] text-white/45 mt-1">The AI suggests; you decide what becomes part of the story.</p></div>
                <div className="flex gap-2">
                  <button disabled={working !== null} onClick={async () => { setWorking('insights'); try { await generateProjectInsights(); } finally { setWorking(null); } }} className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold disabled:opacity-50">{working === 'insights' ? 'Generating…' : 'Generate insights'}</button>
                  <button disabled={working !== null || !hasAcceptedInsight} onClick={async () => { setWorking('directions'); try { await generateProjectDirections(); } finally { setWorking(null); } }} className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold disabled:opacity-40" title={hasAcceptedInsight ? undefined : 'Accept at least one insight first'}>{working === 'directions' ? 'Generating…' : 'Generate directions'}</button>
                </div>
              </div>
              {insights.slice(0, 4).map(insight => (
                <div key={insight.id} className="rounded-xl bg-black/20 border border-white/5 p-3 mb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2"><span className="text-[10px] uppercase tracking-wider text-cyan-300/70">{insight.type.replace('_', ' ').toLowerCase()}</span><span className="text-[10px] text-white/40">{insight.status === 'ACCEPTED' ? 'Accepted' : insight.status === 'DISMISSED' ? 'Dismissed' : 'Needs your decision'}</span></div>
                      <p className="text-xs font-semibold text-white mt-1">{insight.title}</p>
                      <p className="text-xs text-white/60 mt-1 leading-relaxed">{insight.statement}</p>
                    </div>
                    {insight.status === 'CANDIDATE' ? (
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => setProjectInsightStatus(insight.id, 'ACCEPTED')} className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">Accept</button>
                        <button onClick={() => setProjectInsightStatus(insight.id, 'DISMISSED')} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold">Dismiss</button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
      {hasKnowledge && <DirectionDecisionCanonLoop />}
    </>
  );
};
