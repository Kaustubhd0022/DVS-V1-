import React from 'react';
import { ArrowRight, Search, Sparkles, MessageCircleQuestion, GitBranch } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

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
  const { currentProject, setActiveScreen, generateProjectInsights, generateProjectDirections } = useProject();
  const [working, setWorking] = React.useState(false);
  const action = deriveNextBestAction(currentProject);

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
      else setActiveScreen('story-brain');
    } finally {
      setWorking(false);
    }
  };

  return (
    <section className="mt-4 rounded-2xl border border-cyan-400/15 bg-gradient-to-br from-cyan-500/5 to-transparent p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-400/10 flex items-center justify-center"><Icon className="w-4 h-4 text-cyan-300" /></div>
          <div>
            <p className="text-[9px] uppercase tracking-wider font-bold text-cyan-300">Next Best Action</p>
            <h3 className="text-sm font-semibold text-white mt-1">{action.question}</h3>
            <p className="text-[11px] text-white/50 mt-1 max-w-2xl">{action.reason}</p>
          </div>
        </div>
        <button onClick={execute} disabled={working} className="shrink-0 px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-200 text-[10px] font-semibold disabled:opacity-50">
          {working ? 'Working…' : action.kind === 'ASK' ? 'Resolve in Discovery' : action.kind === 'RESEARCH' ? 'Open Research' : action.kind === 'EXPLORE' ? 'Explore' : 'Develop'}
          {!working && <ArrowRight className="inline w-3 h-3 ml-1" />}
        </button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[9px] text-white/35">
        <span className="uppercase tracking-wider">Decision policy</span>
        <span>•</span>
        <span>Creator intent before assumption</span>
        <span>•</span>
        <span>Evidence before factual confidence</span>
        <span>•</span>
        <span>AI proposes, human approves</span>
      </div>
    </section>
  );
};
