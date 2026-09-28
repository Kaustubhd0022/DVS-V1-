import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Wrench, 
  Lock, 
  FileText, 
  Clock, 
  HelpCircle, 
  Layers, 
  Database,
  ArrowLeftRight,
  Check,
  X
} from 'lucide-react';
import { ContinuityIssue } from '../../types/project';

export const ContinuityQAScreen: React.FC = () => {
  const { currentProject, resolveContinuityIssue, repairSceneWithCanon, setActiveScreen } = useProject();
  const issues = currentProject.continuityIssues || currentProject.qaIssues || [];

  const [selectedIssueId, setSelectedIssueId] = useState<string>(issues[0]?.id || 'cont-1');
  const [isRepairing, setIsRepairing] = useState(false);
  const [exceptionModalOpen, setExceptionModalOpen] = useState(false);
  const [exceptionNotes, setExceptionNotes] = useState('');

  const selectedIssue: ContinuityIssue = issues.find(i => i.id === selectedIssueId) || issues[0];

  const handleAutoRepair = () => {
    setIsRepairing(true);
    setTimeout(() => {
      repairSceneWithCanon(selectedIssue.id);
      setIsRepairing(false);
    }, 700);
  };

  const handleGrantException = () => {
    resolveContinuityIssue(selectedIssue.id, 'Exception Granted', exceptionNotes || 'Author verified creative license.');
    setExceptionModalOpen(false);
    setExceptionNotes('');
  };

  const getSeverityBadge = (severity: ContinuityIssue['severity']) => {
    switch (severity) {
      case 'Critical Blocker':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Warning':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Advisory':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const openBlockersCount = issues.filter(i => i.resolutionState === 'Open' && i.severity === 'Critical Blocker').length;
  const totalOpenCount = issues.filter(i => i.resolutionState === 'Open').length;
  const resolvedCount = issues.filter(i => i.resolutionState !== 'Open').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Top Header Card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#121624] via-[#0f121d] to-[#151a2d] border border-amber-500/30 p-6 lg:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Flow 5 • Canon & Continuity Engine
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-white/10 text-white/70 border border-white/10">
                Deterministic + Narrative Rules
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Canon & Continuity Verification Engine
            </h1>
            <p className="text-sm text-white/70 max-w-3xl leading-relaxed">
              Real-time contradiction detection across timeline chronology, character motivations, physical world rules, and institutional laws.
              Contradictions present side-by-side evidence with affected entities. In accordance with Section 11 of the specification: 
              <strong className="text-white"> the system never silently auto-resolves canon conflicts without human decision.</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveScreen('evaluation')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <span>Next: AI Story Evaluation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Status Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Critical Blockers</span>
            <span className="text-xl font-black text-rose-400 flex items-center gap-1.5 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
              {openBlockersCount} Active
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Total Open Inconsistencies</span>
            <span className="text-xl font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
              {totalOpenCount}
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Resolved / Exceptions</span>
            <span className="text-xl font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
              {resolvedCount}
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Continuity Precision Rate</span>
            <span className="text-xl font-black text-cyan-400 flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-4 h-4" />
              {currentProject.pilotMetrics.continuityCatchRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Flagship Layout: List on Left, Deep Evidence Comparison on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Contradiction Queue (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
              Flagged Inconsistencies ({issues.length})
            </h3>
            <span className="text-[11px] text-white/40">Sorted by Severity</span>
          </div>

          {issues.map(issue => {
            const isSelected = issue.id === selectedIssue.id;
            const isResolved = issue.resolutionState !== 'Open';

            return (
              <button
                key={issue.id}
                onClick={() => setSelectedIssueId(issue.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all space-y-2 relative group ${
                  isSelected
                    ? 'bg-[#181d2e] border-amber-500/60 shadow-lg shadow-black/50'
                    : 'bg-[#12141e] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(issue.severity)}`}>
                    {issue.severity}
                  </span>
                  
                  {isResolved ? (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {issue.resolutionState}
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Open
                    </span>
                  )}
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                  {issue.title}
                </h4>

                <p className="text-[11px] text-white/60 line-clamp-2 leading-relaxed">
                  {issue.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-white/40 pt-1 border-t border-white/5">
                  <span>Scene #{issue.sceneNumber}</span>
                  <span className="font-mono">{issue.category}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Deep Side-by-Side Forensic Evidence Inspector (8 cols) */}
        <div className="lg:col-span-8 bg-[#131624] border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl">
          {/* Header of selected issue */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getSeverityBadge(selectedIssue.severity)}`}>
                  {selectedIssue.severity}
                </span>
                <span className="text-xs font-mono text-white/40">
                  {selectedIssue.id.toUpperCase()} • Scene {selectedIssue.sceneNumber} • {selectedIssue.category}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{selectedIssue.title}</h2>
            </div>

            {selectedIssue.resolutionState !== 'Open' ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {selectedIssue.resolutionState}
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Action Required
              </span>
            )}
          </div>

          <p className="text-xs text-white/80 leading-relaxed bg-black/20 p-3.5 rounded-xl border border-white/5">
            <strong className="text-white/40 block mb-1">Diagnostic Context:</strong>
            {selectedIssue.description}
          </p>

          {/* SIDE-BY-SIDE FORENSIC EVIDENCE CANVAS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-white/50 px-1">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Lock className="w-3.5 h-3.5" />
                ESTABLISHED CANON TRUTH (STORY BRAIN)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <FileText className="w-3.5 h-3.5" />
                CONFLICTING DRAFT CONTENT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Box: Established Canon */}
              <div className="bg-[#0f121d] border border-amber-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-amber-300/80">
                  <span className="font-semibold">Source: {selectedIssue.canonSource}</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[10px] font-mono text-amber-300">
                    CANONICAL
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-amber-500/20 text-xs text-amber-100 font-medium leading-relaxed">
                  "{selectedIssue.establishedCanonEvidence}"
                </div>

                <p className="text-[11px] text-white/50">
                  Committed to Story Brain memory. Cannot be silently altered without updating canon.
                </p>
              </div>

              {/* Right Box: Conflicting Draft Content */}
              <div className="bg-[#0f121d] border border-rose-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-rose-300/80">
                  <span className="font-semibold">Location: {selectedIssue.contentLocation}</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[10px] font-mono text-rose-300">
                    DRAFT CONTENT
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-rose-500/20 text-xs text-rose-100 font-medium leading-relaxed">
                  "{selectedIssue.conflictingContentEvidence}"
                </div>

                <p className="text-[11px] text-white/50">
                  Direct contradiction detected during downstream context validation.
                </p>
              </div>
            </div>
          </div>

          {/* Affected Entities */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-white/40 block font-semibold">Affected Story Entities:</span>
            <div className="flex flex-wrap gap-2">
              {selectedIssue.affectedEntities.map(entity => (
                <span key={entity} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80">
                  {entity}
                </span>
              ))}
            </div>
          </div>

          {/* Resolution Info if already resolved */}
          {selectedIssue.resolutionNotes && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
              <span className="font-bold block mb-0.5">Resolution Record:</span>
              {selectedIssue.resolutionNotes}
            </div>
          )}

          {/* Action Resolution Buttons */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-white/50">
              Requires explicit human resolution before story package delivery.
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setExceptionModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-colors"
              >
                Grant Creative License
              </button>

              <button
                onClick={handleAutoRepair}
                disabled={isRepairing || selectedIssue.resolutionState !== 'Open'}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all"
              >
                <Wrench className={`w-4 h-4 ${isRepairing ? 'animate-spin' : ''}`} />
                <span>{isRepairing ? 'Reconciling Scene with Canon...' : 'Auto-Repair Draft with AI'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EXCEPTION MODAL */}
      {exceptionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#141724] border border-amber-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Grant Creative License / Exception</h3>
            <p className="text-xs text-white/70">
              Record why this apparent discrepancy is an intentional creative choice (e.g. character lying, unreliable memory, subjective hallucination).
            </p>

            <textarea
              value={exceptionNotes}
              onChange={e => setExceptionNotes(e.target.value)}
              placeholder="e.g. Raghav is intentionally lying to Aanya in this scene to hide his debt..."
              rows={3}
              className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setExceptionModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleGrantException}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold"
              >
                Record Exception
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
