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
  BookOpen, 
  Sliders, 
  Wrench,
  ThumbsUp,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export const EvaluationScreen: React.FC = () => {
  const { currentProject, runStoryEvaluation, signOffEvaluation, repairSceneWithCanon, setActiveScreen } = useProject();
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

  const handleSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    signOffEvaluation(signerName || 'Creative Producer', 'Creative Producer', signOffComments);
    setSignedOff(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    if (score >= 80) return 'text-amber-300 bg-amber-500/20 border-amber-500/40';
    return 'text-rose-400 bg-rose-500/20 border-rose-500/40';
  };

  const openBlockers = (currentProject.continuityIssues || []).filter(
    i => i.resolutionState === 'Open' && i.severity === 'Critical Blocker'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Top Header Card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#121624] via-[#0f1320] to-[#171b30] border border-amber-500/30 p-6 lg:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Flow 6 • AI Story Evaluation Benchmark
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-white/10 text-white/70 border border-white/10">
                Rubric v1.0
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              AI Story Evaluation Harness
            </h1>
            <p className="text-sm text-white/70 max-w-3xl leading-relaxed">
              Autonomous multi-dimensional rubric assessing narrative logic, character flaw coherence, research grounding, 
              and canon adherence for <strong className="text-white">"{currentProject.title}"</strong>.
              Final greenlight authority remains strictly with human producers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunEvaluation}
              disabled={isRunning}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? 'Analyzing Story Brain...' : evaluation ? 'Re-Run Evaluation' : 'Run Story Evaluation (AI)'}</span>
            </button>

            {evaluation && (
              <button
                onClick={() => setActiveScreen('package')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
              >
                <span>Package Delivery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Hero Score Grid (Only if evaluation exists) */}
        {evaluation && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex flex-col items-center justify-center text-amber-400">
                <span className="text-xl font-black">{Math.round(evaluation.overallScore)}</span>
                <span className="text-[9px] uppercase font-bold text-amber-300/70">/ 100</span>
              </div>
              <div>
                <span className="text-[11px] text-white/50 block font-medium">Overall Readiness Index</span>
                <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {evaluation.readinessStatus}
                </span>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <span className="text-[11px] text-white/50 block font-medium">Evaluator Model</span>
              <span className="text-xs font-mono font-bold text-white/90 block mt-1 truncate">
                {evaluation.evaluatorModel}
              </span>
              <span className="text-[10px] text-white/40 block mt-0.5">
                Dynamic LPU inference • Zero cross-project leakage
              </span>
            </div>

            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <span className="text-[11px] text-white/50 block font-medium">Critical Blocker Status</span>
              <div className="mt-1 flex items-center gap-1.5">
                {openBlockers.length > 0 ? (
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {openBlockers.length} Unresolved Contradiction
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All Continuity Cleared
                  </span>
                )}
              </div>
              <span className="text-[10px] text-white/40 block mt-0.5">
                Canon adherence weight: 20%
              </span>
            </div>

            <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <span className="text-[11px] text-white/50 block font-medium">Producer Sign-Off</span>
              <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
                <UserCheck className={`w-3.5 h-3.5 ${signedOff ? 'text-emerald-400' : 'text-amber-400'}`} />
                {signedOff ? 'Signed by Producer' : 'Pending Formal Review'}
              </span>
              <span className="text-[10px] text-white/40 block mt-0.5">
                {evaluation.humanSignOff?.date || 'Awaiting sign-off below'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error alert banner */}
      {evalError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{evalError}</span>
          </div>
          <button onClick={() => setEvalError(null)} className="text-white/40 hover:text-white">✕</button>
        </div>
      )}

      {/* When evaluation is null: Honest Empty State */}
      {!evaluation ? (
        <div className="p-12 text-center bg-[#141822] border border-dashed border-white/10 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">Narrative Evaluation Not Run Yet</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Tattava does not pre-fill evaluation scores. Run the autonomous quality benchmark to evaluate <span className="text-amber-300">"{currentProject.title}"</span> based on its actual canon facts, characters, and dramatic structure.
            </p>
          </div>
          <button
            onClick={handleRunEvaluation}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{isRunning ? 'Evaluating Story Brain...' : 'Run Autonomous Story Evaluation'}</span>
          </button>
        </div>
      ) : (
        <>
          {/* Narrative Blocker Alert if active */}
          {openBlockers.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-rose-300">Active Continuity Blocker Flagged</h4>
                  <p className="text-xs text-white/70">
                    {openBlockers[0]?.title}: {openBlockers[0]?.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => repairSceneWithCanon(openBlockers[0]?.id)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shadow-md transition-colors"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Apply AI Canon Repair</span>
              </button>
            </div>
          )}

          {/* 5/6-Dimension Rubric Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evaluation.dimensions?.map(dim => {
              const badgeClass = getScoreColor(dim.score);
              return (
                <div 
                  key={dim.id}
                  className="bg-[#141724] border border-white/10 hover:border-amber-500/30 rounded-2xl p-5 space-y-3.5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-white">{dim.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeClass}`}>
                        {dim.score}%
                      </span>
                    </div>

                    {/* Score Progress Bar */}
                    <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed">
                      {dim.diagnostic}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-white/5 text-xs">
                    {dim.strengths && dim.strengths.length > 0 && (
                      <div>
                        <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider mb-1">
                          Strengths:
                        </span>
                        <ul className="space-y-0.5 text-white/80">
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
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wider mb-1">
                          Recommendation:
                        </span>
                        <p className="text-xs text-amber-200/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                          {dim.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Critical Risks & Strengths Synthesis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#141724] border border-white/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                Key Strategic Strengths
              </h3>
              <div className="space-y-2">
                {evaluation.keyStrengths?.map((strength, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-white/80 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#141724] border border-white/10 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Active Narrative Risks & Gaps
              </h3>
              <div className="space-y-2">
                {evaluation.criticalRisks?.map((risk, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/30 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Human Producer Review & Evaluation Sign-Off */}
          <div className="bg-[#141724] border border-amber-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  Human Producer Review & Quality Gate Sign-Off
                </h3>
                <p className="text-xs text-white/60">
                  In accordance with the specification: AI evaluation informs, but only a human producer grants greenlight clearance.
                </p>
              </div>

              <button
                onClick={() => setActiveScreen('package')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <span>Proceed to Story Development Package</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSignOff} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/70 block mb-1">Reviewer Name</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={e => setSignerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/70 block mb-1">Sign-Off Date</label>
                  <input
                    type="text"
                    disabled
                    value={new Date().toLocaleDateString()}
                    className="w-full p-2.5 rounded-xl bg-black/20 border border-white/5 text-xs text-white/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/70 block mb-1">Producer Review Notes & Greenlight Assessment</label>
                <textarea
                  value={signOffComments}
                  onChange={e => setSignOffComments(e.target.value)}
                  placeholder="Add notes on market viability, casting alignment, or script amendments..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="text-xs text-white/50">
                  Signatory: <strong className="text-white">{signerName}</strong> • Lead Creative Role Authorized
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{signedOff ? 'Update Producer Sign-Off' : 'Sign Off & Approve Evaluation'}</span>
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
