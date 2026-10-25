import React from 'react';
import { ArrowRight, Check, Lock, MessageCircleQuestion, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { ProjectDirection } from '../../domain/tattvacoProject';

const pickNextQuestion = (project: any, direction?: ProjectDirection) => {
  const candidates = [
    ...(direction?.openQuestions || []),
    ...(project.projectIntelligence?.researchUniverse?.unresolvedQuestions || []),
    ...(project.intent?.missingQuestions || []),
    ...(project.intent?.ambiguitiesIdentified || [])
  ].map((q: string) => q?.trim()).filter(Boolean);

  return candidates[0] || 'What is the next creative decision required to move this project into development?';
};

export const DirectionDecisionCanonLoop: React.FC = () => {
  const { currentProject, updateCurrentProject, setActiveScreen } = useProject();
  const intelligence = currentProject.projectIntelligence;
  if (!intelligence) return null;

  const directions = intelligence.directions || [];
  const selected = directions.find(d => d.status === 'SELECTED') || directions.find(d => d.status === 'SHORTLISTED');
  const nextQuestion = intelligence.development.nextUnresolvedQuestion;

  const decide = (directionId: string, outcome: 'ACCEPTED' | 'DISMISSED') => {
    updateCurrentProject(prev => {
      const pi = prev.projectIntelligence;
      if (!pi) return prev;
      const direction = pi.directions.find(d => d.id === directionId);
      if (!direction) return prev;

      if (outcome === 'DISMISSED') {
        const directionsUpdated = pi.directions.map(d => d.id === directionId ? { ...d, status: 'DISMISSED' as const } : d);
        const remaining = directionsUpdated.find(d => d.status === 'CANDIDATE' || d.status === 'SHORTLISTED');
        return {
          ...prev,
          projectIntelligence: {
            ...pi,
            directions: directionsUpdated,
            development: {
              ...pi.development,
              currentStage: remaining ? 'DIRECTION' : 'INSIGHT',
              nextUnresolvedQuestion: pickNextQuestion(prev, remaining)
            }
          }
        };
      }

      const alreadyCanonical = prev.storyBrain.canonFacts.some(f =>
        f.tags?.includes('PROJECT_DIRECTION') && f.statement.includes(direction.title)
      );
      const alreadyDecided = prev.storyBrain.creativeDecisions.some(d =>
        d.title === `Direction Decision: ${direction.title}`
      );

      const now = new Date().toLocaleDateString();
      const decision = alreadyDecided ? null : {
        id: 'cd-direction-' + Date.now(),
        title: `Direction Decision: ${direction.title}`,
        decision: direction.statement,
        rationale: `Accepted by the creator after reviewing the candidate direction, its strengths, risks and open questions.`,
        author: prev.owner || 'Project Creator',
        role: 'Creator / Decision Maker',
        date: now,
        status: 'ACCEPTED' as const,
        impactedAreas: ['Story Spine', 'Research', 'Characters', 'World', 'Structure']
      };

      const canonFact = alreadyCanonical ? null : {
        id: 'cf-direction-' + Date.now(),
        statement: `Approved Story Direction: ${direction.title}. ${direction.statement}`,
        category: 'Plot Anchor' as const,
        entityIds: [],
        source: 'TATTAVACO_DIRECTION_DECISION',
        dateEstablished: now,
        isLocked: true,
        version: `v1.${prev.storyBrain.canonFacts.length + 1}`,
        tags: ['PROJECT_DIRECTION', 'AUTHOR_APPROVED', ...direction.basedOnInsightIds]
      };

      const updatedDirections = pi.directions.map(d =>
        d.id === directionId
          ? { ...d, status: 'SELECTED' as const }
          : d.status === 'SELECTED' ? { ...d, status: 'SHORTLISTED' as const } : d
      );

      const question = pickNextQuestion(prev, direction);

      return {
        ...prev,
        selectedDirectionId: prev.selectedDirectionId,
        storyDirections: prev.storyDirections,
        projectIntelligence: {
          ...pi,
          directions: updatedDirections,
          development: {
            ...pi.development,
            currentStage: 'DECISION',
            decisionCount: pi.development.decisionCount + (decision ? 1 : 0),
            nextUnresolvedQuestion: question
          }
        },
        storyBrain: {
          ...prev.storyBrain,
          canonFacts: canonFact ? [canonFact, ...prev.storyBrain.canonFacts] : prev.storyBrain.canonFacts,
          creativeDecisions: decision ? [decision, ...prev.storyBrain.creativeDecisions] : prev.storyBrain.creativeDecisions,
          decisionLog: decision ? [decision, ...(prev.storyBrain.decisionLog || [])] : prev.storyBrain.decisionLog,
          lastUpdated: 'Just now'
        },
        canonicalVersion: `v${Math.max(1, prev.storyBrain.creativeDecisions.length + 1)}.0`
      };
    });
  };

  if (!directions.length) {
    return (
      <section className="mt-4 rounded-3xl border border-white/[0.08] bg-[#0e1119]/80 p-5 shadow-xl">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">Decision Loop</p>
        <p className="text-xs text-stone-400 mt-1">Generate and accept an insight before generating candidate directions.</p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-3xl border border-white/[0.08] bg-[#0e1119]/85 p-5 lg:p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-[#fbf8f3] tracking-tight">Direction → Decision → Canon</h3>
          </div>
          <p className="text-xs text-stone-400 mt-1 leading-relaxed">
            A candidate direction becomes authoritative only after an explicit human creative gate.
          </p>
        </div>
        <span className="text-[9px] uppercase tracking-[0.18em] font-bold px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
          Human Gate
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {directions.map(direction => (
          <div key={direction.id} className={`rounded-2xl border p-4 transition ${direction.status === 'SELECTED' ? 'border-emerald-400/30 bg-emerald-500/10 shadow-sm' : 'border-white/[0.08] bg-[#141824]/60 hover:bg-[#141824]/90'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#fbf8f3]">{direction.title}</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 bg-white/[0.05] text-stone-400 border border-white/[0.06]">{direction.status}</span>
                </div>
                <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">{direction.statement}</p>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {direction.strengths.slice(0, 2).map((x, i) => <span key={i} className="text-[9px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">{x}</span>)}
                  {direction.risks.slice(0, 1).map((x, i) => <span key={i} className="text-[9px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">{x}</span>)}
                </div>
              </div>
              {direction.status !== 'DISMISSED' && direction.status !== 'SELECTED' && (
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => decide(direction.id, 'ACCEPTED')} className="px-3 py-1.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold text-[10px] flex items-center gap-1 transition shadow-sm">
                    <Check className="w-3 h-3" /> Accept
                  </button>
                  <button onClick={() => decide(direction.id, 'DISMISSED')} className="px-3 py-1.5 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-medium text-[10px] flex items-center gap-1 transition">
                    <X className="w-3 h-3" /> Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-emerald-300">Approved Authoritative Direction</span>
          </div>
          <p className="text-xs text-[#fbf8f3] font-semibold mt-1.5">{selected.title}</p>
          <p className="text-[11px] text-stone-400 mt-1">Decision and canon record created. Existing canon is protected from silent overwrites.</p>
        </div>
      )}
    </section>
  );
};
