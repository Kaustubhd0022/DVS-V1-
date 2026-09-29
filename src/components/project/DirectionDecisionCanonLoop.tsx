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
      <section className="mt-4 rounded-2xl border border-white/10 bg-[#10131a] p-4">
        <p className="text-[10px] uppercase tracking-wider font-bold text-white/40">Decision Loop</p>
        <p className="text-xs text-white/55 mt-1">Generate and accept an insight before generating candidate directions.</p>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-[#10131a] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-amber-300" />
            <h3 className="text-sm font-bold text-white">Direction → Decision → Canon</h3>
          </div>
          <p className="text-[11px] text-white/45 mt-1">
            A selected direction becomes authoritative only after an explicit creator decision.
          </p>
        </div>
        <span className="text-[9px] uppercase tracking-wider px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
          Human Gate
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {directions.map(direction => (
          <div key={direction.id} className={`rounded-xl border p-3 ${direction.status === 'SELECTED' ? 'border-emerald-400/30 bg-emerald-500/5' : 'border-white/5 bg-black/20'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{direction.title}</span>
                  <span className="text-[9px] uppercase tracking-wider text-white/35">{direction.status}</span>
                </div>
                <p className="text-[11px] text-white/60 mt-1">{direction.statement}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {direction.strengths.slice(0, 2).map((x, i) => <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-300/70">{x}</span>)}
                  {direction.risks.slice(0, 1).map((x, i) => <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-red-500/5 text-red-300/70">{x}</span>)}
                </div>
              </div>
              {direction.status !== 'DISMISSED' && direction.status !== 'SELECTED' && (
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => decide(direction.id, 'ACCEPTED')} className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-300 text-[9px] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Accept
                  </button>
                  <button onClick={() => decide(direction.id, 'DISMISSED')} className="px-2 py-1 rounded bg-red-500/10 text-red-300 text-[9px] flex items-center gap-1">
                    <X className="w-3 h-3" /> Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-4 rounded-xl border border-emerald-400/15 bg-emerald-500/5 p-3">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300">Approved direction</span>
          </div>
          <p className="text-xs text-white mt-1">{selected.title}</p>
          <p className="text-[10px] text-white/45 mt-1">Decision and canon record created. Existing canon is never silently overwritten.</p>
        </div>
      )}

      {nextQuestion && (
        <div className="mt-4 rounded-xl border border-cyan-400/15 bg-cyan-500/5 p-3">
          <div className="flex items-center gap-2">
            <MessageCircleQuestion className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-300">Next unresolved question</span>
          </div>
          <p className="text-xs text-white mt-1">{nextQuestion}</p>
          <button onClick={() => setActiveScreen('discovery')} className="mt-2 text-[9px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1">
            Continue in Discovery <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </section>
  );
};
