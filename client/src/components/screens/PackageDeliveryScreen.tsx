import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Package, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  FileText, 
  ArrowRight, 
  ExternalLink, 
  Clock, 
  Share2, 
  Printer, 
  Copy, 
  Brain, 
  BookOpen, 
  Users, 
  Layers, 
  ShieldAlert, 
  UserCheck, 
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeliverableCard, StakeholderApproval } from '../../types/project';

export const PackageDeliveryScreen: React.FC = () => {
  const { currentProject, submitGreenlight, setActiveScreen } = useProject();
  const pkg = currentProject.packageData || currentProject.package || {};

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showGreenlitCelebration, setShowGreenlitCelebration] = useState(false);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic deliverables based on current project state
  const deliverables = [
    {
      id: 'del-treatment',
      title: `${currentProject.title} — Narrative Treatment & Synopsis`,
      type: 'DOC',
      version: currentProject.canonicalVersion || 'v0.1',
      size: `${Math.max(1, Math.round((currentProject.treatment?.synopsis?.length || 500) / 100))} KB`,
      color: '#3b82f6',
      content: currentProject.treatment?.synopsis || currentProject.intent?.premise || 'Synopsis under development.'
    },
    {
      id: 'del-bible',
      title: `${currentProject.title} — Character Bible (${currentProject.characters.length} Cast)`,
      type: 'BBL',
      version: currentProject.canonicalVersion || 'v0.1',
      size: `${Math.max(1, currentProject.characters.length * 2)} KB`,
      color: '#8b5cf6',
      content: currentProject.characters.map(c => `${c.name} (${c.role}, Age ${c.age})\nWant: ${c.want}\nNeed: ${c.need}\nFlaw: ${c.flaw}`).join('\n\n') || 'Characters not yet registered.'
    },
    {
      id: 'del-storybrain',
      title: `Story Brain Canon Matrix (${currentProject.storyBrain?.canonFacts?.length || 0} Facts)`,
      type: 'CAN',
      version: currentProject.canonicalVersion || 'v0.1',
      size: `${Math.max(1, (currentProject.storyBrain?.canonFacts?.length || 1) * 3)} KB`,
      color: '#f59e0b',
      content: currentProject.storyBrain?.canonFacts?.map((f, i) => `#CF-0${i+1} [${f.category}]: ${f.statement} (Source: ${f.source})`).join('\n') || 'No canon facts locked.'
    },
    {
      id: 'del-research',
      title: `Traceable Research Dossier (${currentProject.researchFindings?.length || 0} Citations)`,
      type: 'RES',
      version: currentProject.canonicalVersion || 'v0.1',
      size: `${Math.max(1, (currentProject.researchFindings?.length || 1) * 2)} KB`,
      color: '#10b981',
      content: currentProject.researchFindings?.map(r => `• ${r.topic}: ${r.claim}\n  Evidence: ${r.evidence} [${r.sourceType}: ${r.source}]`).join('\n\n') || 'No research conducted.'
    },
    {
      id: 'del-eval',
      title: `AI Narrative Quality Evaluation Report`,
      type: 'EVL',
      version: 'v1.0',
      size: '4 KB',
      color: '#06b6d4',
      content: currentProject.evaluation 
        ? `Readiness Index: ${Math.round(currentProject.evaluation.overallScore)}%\nStatus: ${currentProject.evaluation.readinessStatus}\nModel: ${currentProject.evaluation.evaluatorModel}\nStrengths: ${currentProject.evaluation.keyStrengths?.join(', ')}\nRisks: ${currentProject.evaluation.criticalRisks?.join(', ')}`
        : 'Evaluation pending execution.'
    }
  ];

  const handleDownload = (id: string, title: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      const element = document.createElement('a');
      const file = new Blob([
`=============================================================
TATTAVA COPILOT — V1 STORY DEVELOPMENT PACKAGE
=============================================================
Title: ${currentProject.title}
Version: ${currentProject.canonicalVersion || 'v0.1'}
Status: APPROVED CANONICAL STATE
Date: ${new Date().toLocaleDateString()}
Deliverable: ${title}

1. EXECUTIVE LOGLINE:
${currentProject.intent?.premise || 'No premise set.'}

2. PROTAGONIST ARC:
${currentProject.characters[0] ? `${currentProject.characters[0].name} (Age: ${currentProject.characters[0].age})\nWant: ${currentProject.characters[0].want}\nNeed: ${currentProject.characters[0].need}\nFlaw: ${currentProject.characters[0].flaw}` : 'No protagonist established.'}

3. CANONICAL STORY BRAIN FACTS (${currentProject.storyBrain?.canonFacts?.length || 0} Locked):
${currentProject.storyBrain?.canonFacts?.map((f, i) => `• [CF-0${i+1}] ${f.statement} (Source: ${f.source})`).join('\n') || 'None'}

4. TRACEABLE RESEARCH DOSSIER (${currentProject.researchFindings?.length || 0} Citations):
${currentProject.researchFindings?.map(r => `• ${r.topic}: ${r.claim} [${r.sourceType}: ${r.source}] (${r.confidence}% confidence)`).join('\n') || 'None'}

5. AI STORY EVALUATION INDEX:
Overall Readiness Score: ${currentProject.evaluation ? Math.round(currentProject.evaluation.overallScore) + '%' : 'Pending'}
Readiness Status: ${currentProject.evaluation?.readinessStatus || 'Not evaluated'}
Key Strengths: ${currentProject.evaluation?.keyStrengths?.join(', ') || 'N/A'}
Critical Risks: ${currentProject.evaluation?.criticalRisks?.join(', ') || 'None identified'}

6. STAKEHOLDER SIGN-OFF:
Sign-Off: ${currentProject.evaluation?.humanSignOff?.approvedBy || 'Pending Producer Review'}
Comments: ${currentProject.evaluation?.humanSignOff?.comments || 'Awaiting sign-off.'}
=============================================================`
      ], { type: 'text/plain' });

      element.href = URL.createObjectURL(file);
      element.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${currentProject.canonicalVersion || 'v0.1'}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 600);
  };

  const handleGreenlightClick = () => {
    submitGreenlight();
    setShowGreenlitCelebration(true);

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 300);
  };

  const copyDossier = () => {
    const text = `TATTAVA COPILOT STORY DEVELOPMENT PACKAGE: ${currentProject.title}\nLogline: ${currentProject.intent?.premise}\nCanon Facts: ${currentProject.storyBrain?.canonFacts?.length || 0}\nEvaluation Readiness: ${currentProject.evaluation ? Math.round(currentProject.evaluation.overallScore) + '%' : 'Pending'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canonCount = currentProject.storyBrain?.canonFacts?.length || 0;
  const researchCount = currentProject.researchFindings?.length || 0;
  const charCount = currentProject.characters?.length || 0;
  const openBlockers = (currentProject.continuityIssues || []).filter(i => i.resolutionState === 'Open').length;

  const checklist = [
    { label: 'Project Intent & Ambiguity Clarified', completed: !!currentProject.intent?.premise, stage: 'Intake' },
    { label: `Story Brain System of Record (${canonCount} Facts Locked)`, completed: canonCount > 0, stage: 'Story Brain' },
    { label: `Traceable Research Dossier (${researchCount} Citations)`, completed: researchCount > 0, stage: 'Research' },
    { label: `Character Architecture (${charCount} Cast Members)`, completed: charCount > 0, stage: 'Characters' },
    { label: 'Three-Act Structure & Treatment Synopsis', completed: !!(currentProject.treatment?.synopsis || currentProject.intent?.premise), stage: 'Treatment' },
    { label: `Canon & Continuity Cleared (${openBlockers} Inconsistencies)`, completed: openBlockers === 0, stage: 'Continuity' },
    { label: 'AI Story Evaluation Harness Executed', completed: !!currentProject.evaluation, stage: 'Evaluation' }
  ];

  const completedSteps = checklist.filter(c => c.completed).length;
  const auditPercent = Math.round((completedSteps / checklist.length) * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fadeIn">
      {/* Top Header Card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-[#121624] via-[#0f121d] to-[#151a2d] border border-amber-500/30 p-6 lg:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                V1 North-Star Deliverable • Final Step 16
              </span>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-white/10 text-white/70 border border-white/10">
                {currentProject.canonicalVersion || 'v0.1'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Story Development Package & Greenlight Sign-Off
            </h1>
            <p className="text-sm text-white/70 max-w-3xl leading-relaxed">
              The synthesized V1 end-product for <strong className="text-white">"{currentProject.title}"</strong>: 
              structured Story Brain, traceable research, character bibles, treatment synopsis, continuity verification, and evaluation clearance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setDossierModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all border border-white/20 shadow-md"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Inspect Master Dossier</span>
            </button>

            {pkg.isGreenlit ? (
              <div className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/20">
                <Award className="w-4 h-4" />
                <span>PROJECT GREENLIT FOR PRODUCTION</span>
              </div>
            ) : (
              <button
                onClick={handleGreenlightClick}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold flex items-center gap-2 shadow-xl shadow-amber-500/30 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Submit for Official Greenlight</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Operational Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Readiness Index</span>
            <span className="text-xl font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              {currentProject.evaluation ? Math.round(currentProject.evaluation.overallScore) + '%' : 'Pending'}
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Story Brain Canon</span>
            <span className="text-xl font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
              <Brain className="w-4 h-4 text-amber-400" />
              {canonCount} Facts Locked
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Verified Research</span>
            <span className="text-xl font-black text-cyan-400 flex items-center gap-1.5 mt-0.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              {researchCount} Citations
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Audit Completion</span>
            <span className="text-xl font-black text-white flex items-center gap-1.5 mt-0.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              {auditPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Greenlit Celebration Banner */}
      {showGreenlitCelebration && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-900/40 to-black/80 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Project Officially Approved for Greenlight</h3>
              <p className="text-xs text-white/70">
                All development stages completed, canon verified, and sign-offs recorded in attributable audit log.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDownload('master-pkg', 'Master_Story_Development_Package')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-2 whitespace-nowrap shadow-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Certified Dossier</span>
          </button>
        </div>
      )}

      {/* Two Column Layout: Completeness Audit vs Deliverables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Completeness Audit (5 cols) */}
        <div className="lg:col-span-5 bg-[#131624] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Story Development Completeness Audit</h3>
              <p className="text-[11px] text-white/60">Verification checklist derived from current project state.</p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              auditPercent >= 80 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {auditPercent}% Passed
            </span>
          </div>

          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${item.completed ? 'text-emerald-400' : 'text-white/20'}`} />
                  <span className={`font-medium ${item.completed ? 'text-white/90' : 'text-white/40'}`}>{item.label}</span>
                </div>
                <span className="text-[10px] font-mono text-white/40 px-2 py-0.5 rounded bg-white/5">
                  {item.stage}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 block mb-0.5">Pilot Governance Note:</strong>
            All narrative materials pass through the 5-stage Canonical State Machine: 
            <span className="font-mono text-[10px] block mt-1 text-white/70">
              AI_PROPOSAL → CANDIDATE → HUMAN_EDITED → APPROVED → CANONICAL
            </span>
          </div>
        </div>

        {/* Right Column: Exportable Deliverables (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#131624] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Exportable Story Deliverables</h3>
                <p className="text-[11px] text-white/60">Structured dossiers assembled from approved Project Intelligence.</p>
              </div>
              <button
                onClick={() => handleDownload('all', `${currentProject.title}_Full_Dossier`)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Master Dossier (.txt)</span>
              </button>
            </div>

            <div className="space-y-3">
              {deliverables.map(del => {
                const isDownloading = downloadingId === del.id;

                return (
                  <div 
                    key={del.id}
                    className="p-4 rounded-xl bg-black/30 border border-white/5 hover:border-amber-500/30 flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white"
                        style={{ backgroundColor: `${del.color}25`, border: `1px solid ${del.color}60` }}
                      >
                        {del.type}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{del.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-white/40 mt-0.5 font-mono">
                          <span>{del.version}</span>
                          <span>•</span>
                          <span>{del.size}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(del.id, del.title)}
                      disabled={isDownloading}
                      className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                      <span>{isDownloading ? 'Exporting...' : 'Download'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Producer Sign-off Status */}
          <div className="bg-[#131624] border border-white/10 rounded-2xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-white">Attributable Stakeholder Sign-Off</h3>
            {currentProject.evaluation?.humanSignOff ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{currentProject.evaluation.humanSignOff.approvedBy}</span>
                  <span className="text-[11px] text-emerald-300">{currentProject.evaluation.humanSignOff.role} • Approved on {currentProject.evaluation.humanSignOff.date}</span>
                  {currentProject.evaluation.humanSignOff.comments && (
                    <p className="text-[11px] text-white/70 mt-1 italic">"{currentProject.evaluation.humanSignOff.comments}"</p>
                  )}
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  APPROVED
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs text-white/50">
                <span>Formal producer sign-off pending in Evaluation module.</span>
                <button
                  onClick={() => setActiveScreen('evaluation')}
                  className="text-amber-400 hover:text-amber-300 font-semibold"
                >
                  Review & Sign Off →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MASTER DOSSIER MODAL */}
      {dossierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#131624] border border-amber-500/40 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Master Story Development Dossier • {currentProject.title}
                </h3>
                <span className="text-xs text-white/50 font-mono">
                  {currentProject.canonicalVersion || 'v0.1'} • Approved Canonical State
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyDossier}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
                </button>
                <button
                  onClick={() => setDossierModalOpen(false)}
                  className="text-white/40 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-white/80 leading-relaxed font-sans">
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">1. Executive Overview</h4>
                <p><strong className="text-white">Premise:</strong> {currentProject.intent?.premise || 'Not specified'}</p>
                <p><strong className="text-white">Content Type:</strong> {currentProject.contentType || 'Feature Film'}</p>
                <p><strong className="text-white">Genre:</strong> {currentProject.genre || 'Drama'}</p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">2. Canonical Story Brain Truths ({canonCount})</h4>
                <div className="space-y-1.5">
                  {currentProject.storyBrain?.canonFacts?.length ? (
                    currentProject.storyBrain.canonFacts.map((fact, idx) => (
                      <div key={fact.id} className="text-xs text-white/80 pl-2 border-l border-amber-500/40">
                        <span className="font-mono text-[10px] text-amber-300 font-bold block">#CF-0{idx+1} • {fact.category}</span>
                        "{fact.statement}"
                      </div>
                    ))
                  ) : (
                    <p className="text-white/40 italic">No canon facts locked yet.</p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">3. Registered Characters ({charCount})</h4>
                {currentProject.characters?.length ? (
                  <div className="space-y-2">
                    {currentProject.characters.map(c => (
                      <div key={c.id} className="p-2.5 rounded-lg bg-black/30 border border-white/5">
                        <span className="font-bold text-white">{c.name} ({c.role}, Age {c.age})</span>
                        <p className="text-[11px] text-white/70 mt-0.5">Want: {c.want} • Need: {c.need} • Flaw: {c.flaw}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/40 italic">No characters registered yet.</p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">4. AI Narrative Evaluation Quality Index</h4>
                {currentProject.evaluation ? (
                  <>
                    <p><strong className="text-white">Readiness Score:</strong> {Math.round(currentProject.evaluation.overallScore)}% ({currentProject.evaluation.readinessStatus})</p>
                    <p><strong className="text-white">Evaluator Model:</strong> {currentProject.evaluation.evaluatorModel}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                      {currentProject.evaluation.dimensions?.map(dim => (
                        <div key={dim.id} className="p-2 rounded bg-black/30 text-[11px]">
                          <span className="text-white/50 block">{dim.name}</span>
                          <span className="text-amber-400 font-bold">{dim.score}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-white/40 italic">Evaluation not yet executed.</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-white/50">
              <span>Ready for Export • Tattava Copilot Certified State</span>
              <button
                onClick={() => handleDownload('master-dossier', `${currentProject.title}_Master_Dossier`)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Certified Text File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
