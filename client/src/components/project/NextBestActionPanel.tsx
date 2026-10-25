import React from 'react';
import { ArrowRight, Search, Sparkles, MessageCircleQuestion, GitBranch } from 'lucide-react';
import { useProject, PIPELINE_STEPS } from '../../context/ProjectContext';
import { getNextStep } from '../../services/projectProgress';

type ActionKind = 'ASK' | 'RESEARCH' | 'EXPLORE' | 'GENERATE';

interface NextBestAction {
  kind: ActionKind;
  question: string;
  reason: string;
  target: string;
}

const deriveNextBestAction = (project: any): NextBestAction => {
  const pi = project.projectIntelligence;
  const selected = pi?.directions?.find((d: any) => d.status === 'SELECTED');
  const unresolved = [
    ...(selected?.openQuestions || []),
    ...(pi?.researchUniverse?.unresolvedQuestions || []),
    ...(project.intent?.missingQuestions || []),
    ...(project.intent?.ambiguitiesIdentified || [])
  ].map((q: string) => q?.trim()).filter(Boolean);

  if (!selected && (pi?.directions || []).some((d: any) => d.status === 'CANDIDATE' || d.status === 'SHORTLISTED')) {
    return { kind: 'EXPLORE', question: 'Which candidate direction should we examine next?', reason: 'Candidate directions exist but no direction has been selected as authoritative.', target: 'Story Directions' };
  }

  const question = unresolved[0];
  if (question) {
    const q = question.toLowerCase();
    const factual = /(when|where|who|what|history|fact|evidence|source|true|document|origin|data|date)/.test(q);
    const ambiguous = /(which|should|prefer|direction|tone|audience|theme|approach|focus)/.test(q);
    if (factual) return { kind: 'RESEARCH', question, reason: 'The unresolved question appears evidence-seeking, so Tattava should strengthen knowledge before making a creative commitment.', target: 'Research' };
    if (ambiguous) return { kind: 'ASK', question, reason: 'The project needs creator intent rather than an AI assumption.', target: 'Discovery' };
    return { kind: 'EXPLORE', question, reason: 'The project has an unresolved creative space that benefits from alternatives before commitment.', target: 'Discovery' };
  }

  if (selected) return { kind: 'GENERATE', question: 'What content artifact should Tattava develop from the approved direction?', reason: 'The project has an approved direction and no blocking unresolved question.', target: 'Development' };
  if ((pi?.insights || []).some((i: any) => i.status === 'ACCEPTED')) return { kind: 'GENERATE', question: 'Generate candidate directions from the accepted insights?', reason: 'Accepted insights are available for creative direction synthesis.', target: 'Story Directions' };
  if ((project.researchFindings || []).some((r: any) => r.status === 'Verified')) return { kind: 'GENERATE', question: 'Synthesize verified research into project insights?', reason: 'Verified evidence exists but has not yet been converted into accepted insights.', target: 'Insights' };
  return { kind: 'ASK', question: 'What is the most important thing you want Tattava to resolve next?', reason: 'The project does not yet expose enough grounded context for a safe autonomous next action.', target: 'Discovery' };
};

export const NextBestActionPanel: React.FC = () => {
  const { currentProject, activeScreen, setActiveScreen, generateProjectInsights, generateProjectDirections } = useProject();
  const [working, setWorking] = React.useState(false);
  const action = deriveNextBestAction(currentProject);

  // A question for the creator is answered in the Discovery chat; repeating it here would duplicate the prompt.
  if (activeScreen === 'discovery' && action.kind === 'ASK') return null;

  const icon = action.kind === 'RESEARCH' ? Search : action.kind === 'ASK' ? MessageCircleQuestion : action.kind === 'EXPLORE' ? GitBranch : Sparkles;
  const Icon = icon;

  const execute = async () => {
    if (working) return;
    setWorking(true);
    try {
      if (action.kind === 'RESEARCH') setActiveScreen('research');
      else if (action.kind === 'ASK' || action.kind === 'EXPLORE') setActiveScreen('discovery');
      else if (action.target === 'Story Directions') await generateProjectDirections();
      else if (action.target === 'Insights') await generateProjectInsights();
      else setActiveScreen(getNextStep(currentProject, PIPELINE_STEPS)?.id || 'story-brain');
    } finally {
      setWorking(false);
    }
  };

  const kindLabel: Record<ActionKind, string> = {
    RESEARCH: 'Needs research',
    ASK: 'Needs your decision',
    EXPLORE: 'Compare options',
    GENERATE: 'Ready to draft'
  };

  const buttonLabel = working
    ? 'Working…'
    : action.kind === 'ASK' ? 'Decide in Discovery'
    : action.kind === 'RESEARCH' ? 'Open Research'
    : action.kind === 'EXPLORE' ? 'Compare options'
    : 'Continue';

  return (
    <section className="mt-4 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-950/20 via-[#0e1119] to-[#0a0c12] p-5 lg:p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-full bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-cyan-300">
                Suggested Next Step
              </span>
              <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[9px] uppercase tracking-wider text-cyan-200 border border-cyan-400/20 font-semibold">
                {kindLabel[action.kind]}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#fbf8f3] mt-1 tracking-tight">{action.question}</h3>
            <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">{action.reason}</p>
          </div>
        </div>
        <button
          onClick={execute}
          disabled={working}
          className="shrink-0 px-5 py-2.5 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-200 hover:bg-cyan-400/25 transition text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2 self-start sm:self-center shadow-md shadow-cyan-400/10"
        >
          {working ? (
            <>
              <div className="linea-btn-wave h-3 text-cyan-200">
                <span className="h-1.5" />
                <span className="h-3" />
                <span className="h-2" />
              </div>
              <span>Processing…</span>
            </>
          ) : (
            <>
              <span>{buttonLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </section>
  );
};
