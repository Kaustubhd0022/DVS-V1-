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
  ArrowLeftRight,
  Check,
  X,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ContinuityIssue } from '../../types/project';
import { checkProjectContinuity, repairContinuityIssueWithCanon } from '../../services/aiService';
import { LineaButton, BentoCard, LineaCaption, LineaEqualizerWave } from '../common/LineaUI';

export const ContinuityQAScreen: React.FC = () => {
  const { currentProject, resolveContinuityIssue, repairSceneWithCanon, setActiveScreen, updateCurrentProject } = useProject();
  const issues = currentProject.continuityIssues || currentProject.qaIssues || [];

  const [selectedIssueId, setSelectedIssueId] = useState<string>(issues[0]?.id || '');
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [exceptionModalOpen, setExceptionModalOpen] = useState(false);
  const [exceptionNotes, setExceptionNotes] = useState('');
  const [checkStatusMessage, setCheckStatusMessage] = useState<string | null>(null);
  const [diffModalOpen, setDiffModalOpen] = useState(false);
  const [proposedRepairText, setProposedRepairText] = useState('');

  const selectedIssue: ContinuityIssue | undefined = issues.find(i => i.id === selectedIssueId) || issues[0];

  const handleRunContinuityCheck = async () => {
    setIsRunningCheck(true);
    setCheckError(null);
    setCheckStatusMessage(null);
    try {
      const res = await checkProjectContinuity(currentProject);
      if (res.issues && res.issues.length > 0) {
        const mappedIssues: ContinuityIssue[] = res.issues.map((iss, idx) => ({
          id: 'cont-' + ((issues.length) + idx + 1),
          title: iss.title || 'Continuity Discrepancy',
          description: iss.fixRecommendation || 'Possible conflict with canon.',
          severity: iss.severity === 'High' ? 'Critical Blocker' : iss.severity === 'Medium' ? 'Warning' : 'Advisory',
          resolutionState: 'Open',
          category: 'Character Motivation',
          canonSource: 'Story Brain Canon Fact',
          establishedCanonEvidence: iss.canonTruth || 'Approved Canon Fact',
          contentLocation: 'Draft Treatment / Scene',
          conflictingContentEvidence: iss.draftConflict || 'Draft beat discrepancy',
          affectedEntities: iss.affectedEntities || [currentProject.characters[0]?.name || 'Protagonist'],
          sceneNumber: 1
        }));

        updateCurrentProject(prev => ({
          ...prev,
          continuityIssues: [...mappedIssues],
          pilotMetrics: {
            ...prev.pilotMetrics,
            totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
          }
        }));
        setSelectedIssueId(mappedIssues[0].id);
        setCheckStatusMessage(`Continuity Engine identified ${mappedIssues.length} potential narrative discrepancies.`);
      } else {
        updateCurrentProject(prev => ({
          ...prev,
          continuityIssues: [],
          pilotMetrics: {
            ...prev.pilotMetrics,
            totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
          }
        }));
        setCheckStatusMessage('Zero contradictions detected! Current draft fully aligns with approved Story Brain canon.');
      }
    } catch (err: any) {
      setCheckError(err.message || 'AI service error running continuity check.');
    } finally {
      setIsRunningCheck(false);
    }
  };

  const handleOpenRepairDiff = async () => {
    if (!selectedIssue) return;
    setIsRepairing(true);
    setCheckError(null);
    try {
      const res = await repairContinuityIssueWithCanon(currentProject, selectedIssue);
      setProposedRepairText(res.repairedText);
      setDiffModalOpen(true);
    } catch (e: any) {
      setCheckError(e.message || 'Failed to generate repair preview.');
    } finally {
      setIsRepairing(false);
    }
  };

  const handleAcceptRepair = async () => {
    if (!selectedIssue) return;
    try {
      await repairSceneWithCanon(selectedIssue.id);
      setDiffModalOpen(false);
      setCheckStatusMessage(`Contradiction "${selectedIssue.title}" successfully reconciled with Story Brain canon.`);
    } catch (e: any) {
      setCheckError(e.message || 'Failed to apply repair.');
    }
  };

  const handleGrantException = () => {
    if (!selectedIssue) return;
    resolveContinuityIssue(selectedIssue.id, 'Exception Granted', exceptionNotes || 'Author verified creative license.');
    setExceptionModalOpen(false);
    setExceptionNotes('');
  };

  const getSeverityBadge = (severity?: ContinuityIssue['severity']) => {
    switch (severity) {
      case 'Critical Blocker':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Warning':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Advisory':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      default:
        return 'bg-white/5 text-stone-300 border-white/10';
    }
  };

  const openBlockersCount = issues.filter(i => i.resolutionState === 'Open' && i.severity === 'Critical Blocker').length;
  const totalOpenCount = issues.filter(i => i.resolutionState === 'Open').length;
  const resolvedCount = issues.filter(i => i.resolutionState !== 'Open').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Top Bento Hero Banner */}
      <BentoCard className="relative overflow-hidden p-6 lg:p-8 border-white/[0.08]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <LineaCaption variant="rose" icon={<ShieldAlert className="w-3.5 h-3.5" />}>
                Flow 5 • Canon & Continuity
              </LineaCaption>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/[0.04] text-stone-400 border border-white/[0.08]">
                Story Brain Cross-Verification
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fbf8f3]">
              Canon & Continuity Verification Engine
            </h1>
            
            <p className="text-xs sm:text-sm text-stone-300/80 max-w-3xl leading-relaxed">
              Real-time contradiction detection comparing <strong className="text-[#fbf8f3]">"{currentProject.title}"</strong> approved canon truths against screenplay drafts and character actions.
              In accordance with core principles: <strong className="text-amber-300/90">the engine never silently auto-resolves canon conflicts without explicit creative review.</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LineaButton
              variant="primary"
              size="md"
              showWave={isRunningCheck}
              onClick={handleRunContinuityCheck}
              disabled={isRunningCheck}
              icon={<RefreshCw className={`w-4 h-4 ${isRunningCheck ? 'animate-spin' : ''}`} />}
            >
              {isRunningCheck ? 'Checking Story Brain...' : 'Run Continuity Check (AI)'}
            </LineaButton>

            <LineaButton
              variant="ghost"
              size="md"
              onClick={() => setActiveScreen('evaluation')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Next: AI Evaluation
            </LineaButton>
          </div>
        </div>

        {/* Live Status Bento Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
          <div className="bg-[#0a0c12]/60 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm">
            <span className="text-[11px] text-stone-400 block font-medium">Critical Blockers</span>
            <span className="text-xl font-bold text-rose-400 flex items-center gap-2 mt-1">
              <ShieldAlert className="w-4 h-4" />
              {openBlockersCount} Active
            </span>
          </div>

          <div className="bg-[#0a0c12]/60 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm">
            <span className="text-[11px] text-stone-400 block font-medium">Total Inconsistencies</span>
            <span className="text-xl font-bold text-amber-400 flex items-center gap-2 mt-1">
              <AlertTriangle className="w-4 h-4" />
              {totalOpenCount}
            </span>
          </div>

          <div className="bg-[#0a0c12]/60 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm">
            <span className="text-[11px] text-stone-400 block font-medium">Resolved / Exceptions</span>
            <span className="text-xl font-bold text-emerald-400 flex items-center gap-2 mt-1">
              <CheckCircle2 className="w-4 h-4" />
              {resolvedCount}
            </span>
          </div>

          <div className="bg-[#0a0c12]/60 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm">
            <span className="text-[11px] text-stone-400 block font-medium">Canon Facts Guarded</span>
            <span className="text-xl font-bold text-sky-400 flex items-center gap-2 mt-1">
              <Sparkles className="w-4 h-4" />
              {currentProject.storyBrain?.canonFacts?.length || 0} Facts
            </span>
          </div>
        </div>
      </BentoCard>

      {/* Check Status Message */}
      {checkStatusMessage && (
        <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-sky-200 text-xs flex items-center justify-between backdrop-blur-md">
          <span className="font-medium">{checkStatusMessage}</span>
          <button onClick={() => setCheckStatusMessage(null)} className="text-stone-400 hover:text-white transition-colors">✕</button>
        </div>
      )}

      {/* Error alert banner */}
      {checkError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{checkError}</span>
          </div>
          <button onClick={() => setCheckError(null)} className="text-stone-400 hover:text-white transition-colors">✕</button>
        </div>
      )}

      {/* Main Flagship Layout */}
      {issues.length === 0 ? (
        <BentoCard className="p-12 text-center border-dashed border-white/[0.12] space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-[#fbf8f3]">No Continuity Discrepancies Detected</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              No contradictions have been flagged for <span className="text-amber-300">"{currentProject.title}"</span>. Run an epistemic scan whenever you draft new scenes or evolve character arcs.
            </p>
          </div>
          <div className="pt-2">
            <LineaButton
              variant="primary"
              size="md"
              showWave={isRunningCheck}
              onClick={handleRunContinuityCheck}
              disabled={isRunningCheck}
              icon={<RefreshCw className={`w-4 h-4 ${isRunningCheck ? 'animate-spin' : ''}`} />}
            >
              {isRunningCheck ? 'Verifying Canon...' : 'Run Live Continuity Verification'}
            </LineaButton>
          </div>
        </BentoCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Contradiction Queue (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                Flagged Discrepancies ({issues.length})
              </span>
              <span className="text-[11px] text-stone-500">Sorted by Severity</span>
            </div>

            {issues.map(issue => {
              const isSelected = issue.id === selectedIssue?.id;
              const isResolved = issue.resolutionState !== 'Open';

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all space-y-2.5 relative group cursor-pointer ${
                    isSelected
                      ? 'bg-[#181b26] border-amber-500/50 shadow-xl shadow-black/60 ring-1 ring-amber-500/20'
                      : 'bg-[#12141a]/90 border-white/[0.08] hover:border-white/[0.16] hover:bg-[#141720]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityBadge(issue.severity)}`}>
                      {issue.severity}
                    </span>
                    
                    {isResolved ? (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {issue.resolutionState}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Open
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold text-[#fbf8f3] group-hover:text-amber-300 transition-colors">
                    {issue.title}
                  </h4>

                  <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1.5 border-t border-white/[0.06]">
                    <span>Scene #{issue.sceneNumber || 1}</span>
                    <span className="font-mono text-stone-400">{issue.category}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep Forensic Evidence Inspector (8 cols) */}
          {selectedIssue && (
            <BentoCard className="lg:col-span-8 p-6 lg:p-8 space-y-6">
              {/* Header of selected issue */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadge(selectedIssue.severity)}`}>
                      {selectedIssue.severity}
                    </span>
                    <span className="text-xs font-mono text-stone-500">
                      {selectedIssue.id.toUpperCase()} • Scene {selectedIssue.sceneNumber || 1} • {selectedIssue.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-[#fbf8f3]">{selectedIssue.title}</h2>
                </div>

                {selectedIssue.resolutionState !== 'Open' ? (
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {selectedIssue.resolutionState}
                  </span>
                ) : (
                  <span className="px-3.5 py-1.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Action Required
                  </span>
                )}
              </div>

              {/* Diagnostic Context */}
              <div className="text-xs text-stone-300 leading-relaxed bg-[#0a0c12]/70 p-4 rounded-2xl border border-white/[0.06]">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 block mb-1">
                  Diagnostic Context
                </span>
                {selectedIssue.description}
              </div>

              {/* Side-by-Side Forensic Evidence Canvas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold px-1">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <Lock className="w-3.5 h-3.5" />
                    ESTABLISHED CANON TRUTH (STORY BRAIN)
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-300">
                    <FileText className="w-3.5 h-3.5" />
                    CONFLICTING DRAFT CONTENT
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Box: Established Canon */}
                  <div className="bg-[#0a0c12]/80 border border-amber-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-amber-300/80">
                      <span className="font-semibold">Source: {selectedIssue.canonSource}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-[10px] font-mono font-semibold text-amber-300 border border-amber-500/20">
                        CANONICAL
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-amber-500/20 text-xs text-amber-100 font-medium leading-relaxed">
                      "{selectedIssue.establishedCanonEvidence}"
                    </div>

                    <p className="text-[11px] text-stone-400">
                      Committed to Story Brain memory. Cannot be silently altered without updating canon.
                    </p>
                  </div>

                  {/* Right Box: Conflicting Draft Content */}
                  <div className="bg-[#0a0c12]/80 border border-rose-500/30 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-rose-300/80">
                      <span className="font-semibold">Location: {selectedIssue.contentLocation}</span>
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-[10px] font-mono font-semibold text-rose-300 border border-rose-500/20">
                        DRAFT CONTENT
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-rose-500/20 text-xs text-rose-100 font-medium leading-relaxed">
                      "{selectedIssue.conflictingContentEvidence}"
                    </div>

                    <p className="text-[11px] text-stone-400">
                      Direct contradiction detected during downstream context validation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Affected Entities */}
              {selectedIssue.affectedEntities && selectedIssue.affectedEntities.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] text-stone-500 block font-semibold uppercase tracking-wider">
                    Affected Story Entities:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedIssue.affectedEntities.map(entity => (
                      <span key={entity} className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-stone-300 font-medium">
                        {entity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Resolution Info if already resolved */}
              {selectedIssue.resolutionNotes && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200">
                  <span className="font-bold block mb-1">Resolution Audit Record:</span>
                  {selectedIssue.resolutionNotes}
                </div>
              )}

              {/* Action Resolution Buttons */}
              <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-stone-400">
                  Requires explicit creative approval before package delivery lock.
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setExceptionModalOpen(true)}
                    className="px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white border border-white/[0.1] text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Grant Creative License
                  </button>

                  <LineaButton
                    variant="primary"
                    size="sm"
                    showWave={isRepairing}
                    onClick={handleOpenRepairDiff}
                    disabled={isRepairing || selectedIssue.resolutionState !== 'Open'}
                    icon={<Wrench className={`w-3.5 h-3.5 ${isRepairing ? 'animate-spin' : ''}`} />}
                  >
                    {isRepairing ? 'Synthesizing Canon Fix...' : 'Inspect & Auto-Repair with AI'}
                  </LineaButton>
                </div>
              </div>
            </BentoCard>
          )}
        </div>
      )}

      {/* CREATIVE LICENSE EXCEPTION MODAL */}
      {exceptionModalOpen && selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 lg:p-8 animate-fadeIn">
          <BentoCard className="w-full max-w-lg p-6 lg:p-8 space-y-5 bg-[#0e1119]/95 border-white/[0.12] shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#fbf8f3]">Grant Creative License</h3>
                  <p className="text-[11px] text-stone-400">Document rationale for canon deviation</p>
                </div>
              </div>
              <button
                onClick={() => setExceptionModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300">Author Notes & Creative Justification</label>
              <textarea
                value={exceptionNotes}
                onChange={e => setExceptionNotes(e.target.value)}
                placeholder="e.g. Deliberate misdirection in Act I; the protagonist conceals true motivation until Act III revelation."
                rows={4}
                className="w-full rounded-2xl bg-[#0a0c12] border border-white/[0.1] p-3 text-xs text-[#fbf8f3] placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setExceptionModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-stone-400 hover:text-white bg-white/[0.04] border border-white/[0.08] transition-colors"
              >
                Cancel
              </button>
              <LineaButton
                variant="primary"
                size="sm"
                onClick={handleGrantException}
                icon={<Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              >
                Confirm Exception
              </LineaButton>
            </div>
          </BentoCard>
        </div>
      )}

      {/* SIDE-BY-SIDE DIFF RECONCILIATION MODAL */}
      {diffModalOpen && selectedIssue && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 lg:p-8 animate-fadeIn">
          <BentoCard className="w-full max-w-4xl p-6 lg:p-8 space-y-6 bg-[#0e1119]/95 border-amber-500/40 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#fbf8f3]">Canon Reconciliation & Diff Inspector</h3>
                  <p className="text-xs text-stone-400">
                    Compare conflicting draft against proposed canon-aligned rewrite for <strong className="text-white">{selectedIssue.contentLocation}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDiffModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Side by side comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Original Conflicting Content */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Current Draft (Inconsistent)
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">BEFORE</span>
                </div>
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-xs text-rose-200 leading-relaxed font-mono min-h-[140px]">
                  "{selectedIssue.conflictingContentEvidence}"
                </div>
                <p className="text-[11px] text-stone-400">
                  Contradicts locked Canon Truth: <span className="text-amber-300">"{selectedIssue.establishedCanonEvidence}"</span>
                </p>
              </div>

              {/* Right: Proposed AI Canon Repair */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Proposed Canon-Aligned Draft
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">AFTER (AI REWRITTEN)</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 text-xs text-emerald-100 leading-relaxed font-mono min-h-[140px]">
                  "{proposedRepairText || selectedIssue.description}"
                </div>
                <p className="text-[11px] text-stone-400">
                  Fully honors Story Brain canon rule without breaking dramatic stakes.
                </p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-stone-400">
                Approving will automatically update Scene {selectedIssue.sceneNumber} in your Outline & mark this contradiction as Resolved.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDiffModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-xs font-semibold text-stone-300 transition-colors cursor-pointer"
                >
                  Cancel & Keep Draft
                </button>
                <LineaButton
                  variant="mint"
                  size="md"
                  onClick={handleAcceptRepair}
                  icon={<Check className="w-4 h-4 stroke-[2.5]" />}
                >
                  Accept & Apply to Draft
                </LineaButton>
              </div>
            </div>
          </BentoCard>
        </div>
      )}
    </div>
  );
};
