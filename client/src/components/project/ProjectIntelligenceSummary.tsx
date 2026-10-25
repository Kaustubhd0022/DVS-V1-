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
      <section className="bg-[#0e1119]/85 border border-white/[0.08] rounded-3xl p-5 lg:p-6 shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-[#fbf8f3] tracking-tight">Project Configuration</h2>
              <span className="text-[9px] uppercase tracking-[0.18em] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                {config.configurationStatus === 'USER_CONFIRMED' ? 'Confirmed' : 'AI Proposed'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">The format, narrative mode, and subject area of this project.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <Film className="w-3.5 h-3.5" /> {labels[config.mediaFormat] || config.mediaFormat}
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-400/10 border border-purple-400/20 text-purple-300 text-xs font-semibold">
              {labels[config.contentMode] || config.contentMode}
            </span>
            {config.primaryDomain && (
              <span className="px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" /> {config.primaryDomain}
              </span>
            )}
          </div>
        </div>

        {(config.subject || config.secondaryDomains.length > 0) && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-stone-400">Subject</span>
              <p className="text-xs text-[#fbf8f3] mt-1">{config.subject || 'Not yet confirmed'}</p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-[0.18em] font-bold text-stone-400">Connected Domains</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {config.secondaryDomains.length > 0 ? (
                  config.secondaryDomains.map(domain => (
                    <span key={domain} className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-stone-300">
                      {domain}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-stone-500">None confirmed yet</span>
                )}
              </div>
            </div>
          </div>
        )}

        {!hasKnowledge && (
          <p className="mt-4 pt-4 border-t border-white/[0.06] text-xs text-stone-400">
            Research topics, insights and story directions will appear here once you have described your idea in Discovery.
          </p>
        )}

        {hasKnowledge && (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl bg-[#141824]/60 border border-white/[0.06] p-3 text-center">
                <p className="text-xl font-bold text-[#fbf8f3]">{dimensions.length}</p>
                <p className="text-[9px] uppercase tracking-[0.18em] text-stone-400 mt-0.5">Research Topics</p>
              </div>
              <div className="rounded-2xl bg-[#141824]/60 border border-white/[0.06] p-3 text-center">
                <p className="text-xl font-bold text-[#fbf8f3]">{insights.length}</p>
                <p className="text-[9px] uppercase tracking-[0.18em] text-stone-400 mt-0.5">Insights</p>
              </div>
              <div className="rounded-2xl bg-[#141824]/60 border border-white/[0.06] p-3 text-center">
                <p className="text-xl font-bold text-[#fbf8f3]">{directions.length}</p>
                <p className="text-[9px] uppercase tracking-[0.18em] text-stone-400 mt-0.5">Directions</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06]">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-3.5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-stone-400">Insights and directions</p>
                  <p className="text-xs text-stone-400 mt-0.5">The AI proposes; you decide what becomes part of the canon.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={working !== null}
                    onClick={async () => {
                      setWorking('insights');
                      try { await generateProjectInsights(); } finally { setWorking(null); }
                    }}
                    className="px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/25 text-cyan-300 hover:bg-cyan-400/20 text-xs font-semibold disabled:opacity-50 transition flex items-center gap-1.5"
                  >
                    {working === 'insights' ? (
                      <>
                        <div className="linea-btn-wave h-2.5 text-cyan-300">
                          <span className="h-1" />
                          <span className="h-2.5" />
                          <span className="h-1.5" />
                        </div>
                        <span>Generating…</span>
                      </>
                    ) : (
                      'Generate insights'
                    )}
                  </button>
                  <button
                    disabled={working !== null || !hasAcceptedInsight}
                    onClick={async () => {
                      setWorking('directions');
                      try { await generateProjectDirections(); } finally { setWorking(null); }
                    }}
                    className="px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 hover:bg-amber-400/20 text-xs font-semibold disabled:opacity-40 transition flex items-center gap-1.5"
                    title={hasAcceptedInsight ? undefined : 'Accept at least one insight first'}
                  >
                    {working === 'directions' ? (
                      <>
                        <div className="linea-btn-wave h-2.5 text-amber-300">
                          <span className="h-1" />
                          <span className="h-2.5" />
                          <span className="h-1.5" />
                        </div>
                        <span>Generating…</span>
                      </>
                    ) : (
                      'Generate directions'
                    )}
                  </button>
                </div>
              </div>
              {insights.slice(0, 4).map(insight => (
                <div key={insight.id} className="rounded-2xl bg-[#141824]/60 border border-white/[0.06] p-3.5 mb-2.5 hover:bg-[#141824]/90 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                          {insight.type.replace('_', ' ').toLowerCase()}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {insight.status === 'ACCEPTED' ? 'Accepted' : insight.status === 'DISMISSED' ? 'Dismissed' : 'Needs your decision'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#fbf8f3] mt-1.5">{insight.title}</p>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">{insight.statement}</p>
                    </div>
                    {insight.status === 'CANDIDATE' ? (
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => setProjectInsightStatus(insight.id, 'ACCEPTED')}
                          className="px-3 py-1.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-stone-950 text-xs font-bold transition shadow-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => setProjectInsightStatus(insight.id, 'DISMISSED')}
                          className="px-3 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-medium transition"
                        >
                          Dismiss
                        </button>
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
