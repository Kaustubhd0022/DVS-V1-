import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles, 
  ArrowRight, 
  UserCheck, 
  BarChart3, 
  Flame, 
  Wrench, 
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { LineaButton, BentoCard, LineaCaption, LineaEqualizerWave } from '../common/LineaUI';

export const EvaluationScreen: React.FC = () => {
  const { currentProject, runStoryEvaluation, reevaluateAfterRepair, signOffEvaluation, repairSceneWithCanon, setActiveScreen } = useProject();
  const evaluation = currentProject.evaluation;

  const [isRunning, setIsRunning] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);
  const [signOffComments, setSignOffComments] = useState(evaluation?.humanSignOff?.comments || '');
  const [signerName, setSignerName] = useState(evaluation?.humanSignOff?.approvedBy || 'Lead Creative Producer');
  const [signedOff, setSignedOff] = useState(!!evaluation?.humanSignOff);

  const handleRunEvaluation = async () => {
    setIsRunning(true);
    setEvalError(null);
    try {
      await runStoryEvaluation();
    } catch (err: any) {
      setEvalError(err.message || 'AI service error running narrative evaluation.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReevaluateAfterRepair = async () => {
    setIsRunning(true);
    setEvalError(null);
    try {
      await reevaluateAfterRepair();
    } catch (err: any) {
      setEvalError(err.message || 'AI service error during post-repair re-evaluation.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    signOffEvaluation(signerName || 'Creative Producer', 'Creative Producer', signOffComments);
    setSignedOff(true);
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30';
    if (score >= 80) return 'text-amber-300 bg-amber-500/15 border-amber-500/30';
    return 'text-rose-300 bg-rose-500/15 border-rose-500/30';
  };

  const openBlockers = (currentProject.continuityIssues || []).filter(
    i => i.resolutionState === 'Open' && i.severity === 'Critical Blocker'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Top Bento Hero Banner */}
      <BentoCard className="relative overflow-hidden p-6 lg:p-8 border-white/[0.08]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <LineaCaption variant="mint" icon={<Award className="w-3.5 h-3.5" />}>
                Flow 6 • Quality Benchmark
              </LineaCaption>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/[0.04] text-stone-400 border border-white/[0.08]">
                Rubric Engine v1.0
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fbf8f3]">
              AI Story Evaluation Harness
            </h1>
            
            <p className="text-xs sm:text-sm text-stone-300/80 max-w-3xl leading-relaxed">
              Autonomous multi-dimensional rubric assessing narrative structure, character flaw cohesion, research grounding, 
              and canon adherence for <strong className="text-[#fbf8f3]">"{currentProject.title}"</strong>.
              Final greenlight authority remains strictly with human creators.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LineaButton
              variant="primary"
              size="md"
              showWave={isRunning}
              onClick={handleRunEvaluation}
              disabled={isRunning}
              icon={<RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />}
            >
              {isRunning ? 'Analyzing Story Brain...' : evaluation ? 'Re-Run Evaluation' : 'Run Story Evaluation (AI)'}
            </LineaButton>

            {evaluation && (
              <LineaButton
                variant="ghost"
                size="md"
                onClick={() => setActiveScreen('package')}
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Package Delivery
              </LineaButton>
            )}
          </div>
        </div>

        {/* Live Score Bento Grid */}
        {evaluation && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
            <div className="bg-[#0a0c12]/60 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex flex-col items-center justify-center text-amber-300 shadow-inner">
                <span className="text-xl font-bold">{Math.round(evaluation.overallScore)}</span>
                <span className="text-[9px] uppercase font-semibold text-amber-400/70">/ 100</span>
              </div>
              <div>
                <span className="text-[11px] text-stone-400 block font-medium">Overall Readiness</span>
                <span className="text-xs font-bold text-[#fbf8f3] flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {evaluation.readinessStatus}
                </span>
              </div>
            </div>

            <div className="bg-[#0a0c12]/60 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm">
              <span className="text-[11px] text-stone-400 block font-medium">Evaluator Model</span>
              <span className="text-xs font-mono font-semibold text-stone-200 block mt-1 truncate">
                {evaluation.evaluatorModel}
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                Dynamic LPU • Zero leakage
              </span>
            </div>

            <div className="bg-[#0a0c12]/60 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm">
              <span className="text-[11px] text-stone-400 block font-medium">Critical Blocker Status</span>
              <div className="mt-1 flex items-center gap-1.5">
                {openBlockers.length > 0 ? (
                  <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {openBlockers.length} Discrepancies
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All Cleared
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                Canon adherence weight: 20%
              </span>
            </div>

            <div className="bg-[#0a0c12]/60 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm">
              <span className="text-[11px] text-stone-400 block font-medium">Producer Sign-Off</span>
              <span className="text-xs font-semibold text-[#fbf8f3] flex items-center gap-1.5 mt-1">
                <UserCheck className={`w-3.5 h-3.5 ${signedOff ? 'text-emerald-400' : 'text-amber-400'}`} />
                {signedOff ? 'Signed by Producer' : 'Pending Formal Review'}
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                {evaluation.humanSignOff?.date || 'Awaiting sign-off below'}
              </span>
            </div>
          </div>
        )}
      </BentoCard>

      {/* Error alert banner */}
      {evalError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{evalError}</span>
          </div>
          <button onClick={() => setEvalError(null)} className="text-stone-400 hover:text-white transition-colors">✕</button>
        </div>
      )}

      {/* Empty State */}
      {!evaluation ? (
        <BentoCard className="p-12 text-center border-dashed border-white/[0.12] space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-[#fbf8f3]">Narrative Evaluation Not Run Yet</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Tattava does not generate superficial mock scores. Run the quality benchmark to evaluate <span className="text-amber-300">"{currentProject.title}"</span> based on its actual canon facts, characters, and screenplay structure.
            </p>
          </div>
          <div className="pt-2">
            <LineaButton
              variant="primary"
              size="md"
              showWave={isRunning}
              onClick={handleRunEvaluation}
              disabled={isRunning}
              icon={<Sparkles className="w-4 h-4" />}
            >
              {isRunning ? 'Evaluating Story Brain...' : 'Run Autonomous Story Evaluation'}
            </LineaButton>
          </div>
        </BentoCard>
      ) : (
        <>
          {/* Narrative Blocker Alert if active */}
          {openBlockers.length > 0 && (
            <BentoCard className="p-4 border-rose-500/30 bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-rose-300">Active Continuity Blocker Flagged</h4>
                  <p className="text-xs text-stone-300">
                    {openBlockers[0]?.title}: {openBlockers[0]?.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => repairSceneWithCanon(openBlockers[0]?.id)}
                className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-400 text-white text-xs font-semibold flex items-center gap-2 whitespace-nowrap shadow-md transition-colors cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Apply AI Canon Repair</span>
              </button>
            </BentoCard>
          )}

          {/* 5/6-Dimension Rubric Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evaluation.dimensions?.map(dim => {
              const badgeClass = getScoreBadge(dim.score);
              return (
                <BentoCard 
                  key={dim.id}
                  className="p-5 space-y-4 flex flex-col justify-between hover:border-amber-500/30 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#fbf8f3]">{dim.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
                        {dim.score}%
                      </span>
                    </div>

                    {/* Score Progress Bar */}
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>

                    <p className="text-xs text-stone-300 leading-relaxed">
                      {dim.diagnostic}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-white/[0.06] text-xs">
                    {dim.strengths && dim.strengths.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-emerald-400 block uppercase tracking-wider">
                          Strengths:
                        </span>
                        <ul className="space-y-1 text-stone-300">
                          {dim.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span>{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {dim.recommendation && (
                      <div className="pt-2 border-t border-white/[0.06]">
                        <span className="text-[10px] font-semibold text-amber-400 block uppercase tracking-wider mb-1">
                          Recommendation:
                        </span>
                        <p className="text-xs text-amber-200/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 leading-relaxed">
                          {dim.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </BentoCard>
              );
            })}
          </div>

          {/* Critical Risks & Strengths Synthesis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BentoCard className="p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#fbf8f3] flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                Key Strategic Strengths
              </h3>
              <div className="space-y-2">
                {evaluation.keyStrengths?.map((strength, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0a0c12]/60 border border-white/[0.06] text-xs text-stone-300 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-5 space-y-3">
              <h3 className="text-sm font-bold text-[#fbf8f3] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Active Narrative Risks & Gaps
              </h3>
              <div className="space-y-2">
                {evaluation.criticalRisks?.map((risk, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0a0c12]/60 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Repair -> Re-evaluation Loop */}
          {currentProject.evaluationRepairPlan && currentProject.evaluationRepairPlan.items.length > 0 && (
            <BentoCard className="p-6 space-y-4 border-sky-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#fbf8f3] flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-sky-400" />
                    Evaluation → Repair → Re-evaluation
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Approved repairs remain non-canonical until re-evaluation confirms whether the underlying risk improved.
                  </p>
                </div>
                <LineaButton
                  variant="primary"
                  size="sm"
                  showWave={isRunning}
                  onClick={handleReevaluateAfterRepair}
                  disabled={isRunning}
                  icon={<RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />}
                >
                  {isRunning ? 'Re-evaluating...' : 'Re-evaluate After Repair'}
                </LineaButton>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#0a0c12]/60 border border-white/[0.06]">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Repair Plan</span>
                  <div className="text-xs font-bold text-[#fbf8f3] mt-1">{currentProject.evaluationRepairPlan.status}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0a0c12]/60 border border-white/[0.06]">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Items</span>
                  <div className="text-xs font-bold text-[#fbf8f3] mt-1">{currentProject.evaluationRepairPlan.items.length}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0a0c12]/60 border border-white/[0.06]">
                  <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">Comparison History</span>
                  <div className="text-xs font-bold text-[#fbf8f3] mt-1">{currentProject.evaluationComparisons?.length || 0} run(s)</div>
                </div>
              </div>
            </BentoCard>
          )}

          {currentProject.evaluationComparisons && currentProject.evaluationComparisons.length > 0 && (
            <BentoCard className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#fbf8f3]">Before vs After Evaluation Comparisons</h3>
              {currentProject.evaluationComparisons.slice(0, 3).map(comparison => (
                <div key={comparison.id} className="p-4 rounded-2xl bg-[#0a0c12]/60 border border-white/[0.06] space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-stone-400">Overall score delta:</span>
                    <span className={`text-sm font-bold ${comparison.overallScoreDelta > 0 ? 'text-emerald-400' : comparison.overallScoreDelta < 0 ? 'text-rose-400' : 'text-stone-300'}`}>
                      {comparison.overallScoreDelta > 0 ? '+' : ''}{comparison.overallScoreDelta.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {comparison.readinessChanged ? 'Readiness status updated' : 'Readiness status unchanged'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {comparison.dimensionChanges.map(change => (
                      <div key={change.dimension} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03]">
                        <span className="text-[11px] text-stone-300">{change.dimension}</span>
                        <span className={`text-[11px] font-semibold ${change.delta > 0 ? 'text-emerald-400' : change.delta < 0 ? 'text-rose-400' : 'text-stone-500'}`}>
                          {change.delta > 0 ? '+' : ''}{change.delta.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {comparison.remainingRisks.length > 0 && (
                    <div className="text-xs text-amber-200/80">
                      Remaining risks: {comparison.remainingRisks.join(' • ')}
                    </div>
                  )}
                  {comparison.resolvedRisks.length > 0 && (
                    <div className="text-xs text-emerald-300/80">
                      Risks no longer present: {comparison.resolvedRisks.join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </BentoCard>
          )}

          {/* Human Producer Review & Evaluation Sign-Off */}
          <BentoCard className="p-6 lg:p-8 space-y-5 border-amber-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <h3 className="text-base font-bold text-[#fbf8f3] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  Human Producer Review & Quality Gate Sign-Off
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  In accordance with studio governance: AI evaluation informs, but only a human producer grants greenlight clearance.
                </p>
              </div>

              <LineaButton
                variant="ghost"
                size="sm"
                onClick={() => setActiveScreen('package')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                iconPosition="right"
              >
                Proceed to Package Delivery
              </LineaButton>
            </div>

            <form onSubmit={handleSignOff} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">Reviewer Name & Title</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={e => setSignerName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full bg-[#0a0c12] border border-white/[0.1] text-xs text-[#fbf8f3] focus:outline-none focus:border-amber-500/60 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">Sign-Off Date</label>
                  <input
                    type="text"
                    disabled
                    value={new Date().toLocaleDateString()}
                    className="w-full px-4 py-2.5 rounded-full bg-[#0a0c12]/50 border border-white/[0.06] text-xs text-stone-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Producer Review Notes & Greenlight Assessment</label>
                <textarea
                  value={signOffComments}
                  onChange={e => setSignOffComments(e.target.value)}
                  placeholder="Add notes on market viability, casting alignment, or script amendments..."
                  rows={3}
                  className="w-full p-3.5 rounded-2xl bg-[#0a0c12] border border-white/[0.1] text-xs text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="text-xs text-stone-400">
                  Signatory: <strong className="text-[#fbf8f3]">{signerName}</strong> • Lead Creative Role Authorized
                </div>

                <LineaButton
                  type="submit"
                  variant="mint"
                  size="md"
                  icon={<FileCheck className="w-4 h-4" />}
                >
                  {signedOff ? 'Update Producer Sign-Off' : 'Sign Off & Approve Evaluation'}
                </LineaButton>
              </div>
            </form>
          </BentoCard>
        </>
      )}
    </div>
  );
};
