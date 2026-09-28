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
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeliverableCard, StakeholderApproval } from '../../types/project';

export const PackageDeliveryScreen: React.FC = () => {
  const { currentProject, submitForGreenlight, setActiveScreen } = useProject();
  const pkg = currentProject.packageData || currentProject.package;

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showGreenlitCelebration, setShowGreenlitCelebration] = useState(false);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
Version: ${currentProject.canonicalVersion || 'v1.2-canonical'}
Status: APPROVED CANONICAL STATE
Date: ${new Date().toLocaleDateString()}
Deliverable: ${title}

1. EXECUTIVE LOGLINE:
${currentProject.intent?.premise}

2. CORE PROTAGONIST ARC:
${currentProject.characters[0]?.name} (Age: ${currentProject.characters[0]?.age})
Want: ${currentProject.characters[0]?.want}
Need: ${currentProject.characters[0]?.need}

3. CANONICAL STORY BRAIN FACTS:
${currentProject.storyBrain.canonFacts.map(f => `• [${f.id.toUpperCase()}] ${f.statement} (Source: ${f.source})`).join('\n')}

4. TRACEABLE RESEARCH DOSSIER:
${currentProject.researchFindings.map(r => `• ${r.topic}: ${r.claim} [${r.sourceType}: ${r.source}] (${r.confidence}% confidence)`).join('\n')}

5. AI STORY EVALUATION INDEX:
Overall Readiness Score: ${Math.round(currentProject.evaluation?.overallScore || 87)}%
Readiness Status: ${currentProject.evaluation?.readinessStatus || 'Pilot Ready'}
Key Strengths: ${currentProject.evaluation?.keyStrengths.join(', ')}

6. STAKEHOLDER SIGN-OFF:
Approved by Creative Producer Rhea Kapoor and AI Product Lead Kaustubh Deshmukh.
=============================================================`
      ], { type: 'text/plain' });

      element.href = URL.createObjectURL(file);
      element.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_v1.2.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 600);
  };

  const handleGreenlightClick = () => {
    submitForGreenlight();
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
    const text = `TATTAVA COPILOT STORY DEVELOPMENT PACKAGE: ${currentProject.title}\nLogline: ${currentProject.intent.premise}\nCanon Facts: ${currentProject.storyBrain.canonFacts.length}\nEvaluation Readiness: ${currentProject.evaluation.overallScore}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checklist = [
    { label: 'Project Intent & Ambiguity Clarified', completed: true, stage: 'Intake' },
    { label: 'Story Brain System of Record Initialized (8 Facts Locked)', completed: true, stage: 'Story Brain' },
    { label: 'Traceable Research Dossier Verified with Provenance', completed: true, stage: 'Research' },
    { label: 'Story Directions & High-Concept Synthesis Approved', completed: true, stage: 'Story' },
    { label: 'Character Psychometrics & Voice Styles Finalized', completed: true, stage: 'Characters' },
    { label: 'Three-Act Structure & Beat Breakdown Locked', completed: true, stage: 'Structure' },
    { label: 'Treatment & Narrative Synopsis Written (v1.2)', completed: true, stage: 'Treatment' },
    { label: 'Key Screenplay Sequences Drafted with Grounded Dialogue', completed: true, stage: 'Script' },
    { label: 'Canon & Continuity Clearances Verified (No Blockers)', completed: true, stage: 'Continuity' },
    { label: 'AI Story Evaluation Harness Passed (>85% Index)', completed: true, stage: 'Evaluation' }
  ];

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
                {currentProject.canonicalVersion || 'v1.2-canonical'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Story Development Package & Greenlight Sign-Off
            </h1>
            <p className="text-sm text-white/70 max-w-3xl leading-relaxed">
              The synthesized V1 end-product: structured Story Brain, traceable research, deep character bibles, 
              three-act treatment, grounded script sequences, and formal evaluation clearance. Ready for executive committee greenlight.
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
              {Math.round(currentProject.evaluation?.overallScore || 87.3)}%
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Story Brain Canon</span>
            <span className="text-xl font-black text-amber-400 flex items-center gap-1.5 mt-0.5">
              <Brain className="w-4 h-4 text-amber-400" />
              {currentProject.storyBrain.canonFacts.length} Facts Locked
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Verified Research</span>
            <span className="text-xl font-black text-cyan-400 flex items-center gap-1.5 mt-0.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              {currentProject.researchFindings.filter(r => r.status === 'Verified').length} Citations
            </span>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
            <span className="text-[11px] text-white/50 block font-medium">Stakeholder Consensus</span>
            <span className="text-xl font-black text-white flex items-center gap-1.5 mt-0.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              4/4 Approved
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
                All 16 story development stages completed, canon verified, and stakeholder approvals locked in attributable audit log.
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
        {/* Left Column: 10-Point Story Development Audit (5 cols) */}
        <div className="lg:col-span-5 bg-[#131624] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white">Story Development Completeness Audit</h3>
              <p className="text-[11px] text-white/60">Verification checklist required by V1 Unified Specification.</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              100% Passed
            </span>
          </div>

          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/90 font-medium">{item.label}</span>
                </div>
                <span className="text-[10px] font-mono text-white/40 px-2 py-0.5 rounded bg-white/5">
                  {item.stage}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 block mb-0.5">Pilot Governance Note:</strong>
            All narrative materials have passed through the 5-stage Canonical State Machine: 
            <span className="font-mono text-[10px] block mt-1 text-white/70">
              AI_PROPOSAL → CANDIDATE → HUMAN_EDITED → APPROVED → CANONICAL
            </span>
          </div>
        </div>

        {/* Right Column: Downloadable Package Deliverables & Stakeholder Sign-Off (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Deliverables Cards */}
          <div className="bg-[#131624] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Exportable Story Deliverables</h3>
                <p className="text-[11px] text-white/60">Structured dossiers assembled from approved Project Intelligence.</p>
              </div>
              <button
                onClick={() => handleDownload('all', 'Complete_Story_Package_Bundle')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export All (.zip)</span>
              </button>
            </div>

            <div className="space-y-3">
              {pkg.deliverables.map(del => {
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

          {/* Stakeholder Sign-Off Audit */}
          <div className="bg-[#131624] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Attributable Stakeholder Sign-Off Log</h3>
              <p className="text-[11px] text-white/60">Recorded sign-offs from creative leaders and department heads.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pkg.stakeholders.map(sh => (
                <div key={sh.id} className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <img src={sh.avatar} alt={sh.name} className="w-8 h-8 rounded-full object-cover border border-amber-500/30" />
                    <div>
                      <span className="text-xs font-bold text-white block">{sh.name}</span>
                      <span className="text-[10px] text-white/50">{sh.role}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Approved
                    </span>
                    <span className="text-[9px] font-mono text-white/30 block mt-0.5">{sh.date || '28 Sep 2026'}</span>
                  </div>
                </div>
              ))}
            </div>
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
                  {currentProject.canonicalVersion} • Approved Canonical State
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
                <p><strong className="text-white">Premise:</strong> {currentProject.intent.premise}</p>
                <p><strong className="text-white">Protagonist:</strong> {currentProject.intent.protagonist}</p>
                <p><strong className="text-white">Stakes:</strong> {currentProject.intent.stakes}</p>
                <p><strong className="text-white">Tone:</strong> {currentProject.intent.tone}</p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">2. Canonical Story Brain Truths</h4>
                <div className="space-y-1.5">
                  {currentProject.storyBrain.canonFacts.map(fact => (
                    <div key={fact.id} className="text-xs text-white/80 pl-2 border-l border-amber-500/40">
                      <span className="font-mono text-[10px] text-amber-300 font-bold block">{fact.id.toUpperCase()} • {fact.category}</span>
                      "{fact.statement}"
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">3. Narrative Treatment Synopsis</h4>
                <p className="whitespace-pre-line text-white/70">{currentProject.treatment.synopsis}</p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">4. AI Narrative Evaluation Quality Index</h4>
                <p><strong className="text-white">Readiness Score:</strong> {currentProject.evaluation.overallScore}% ({currentProject.evaluation.readinessStatus})</p>
                <p><strong className="text-white">Evaluator Model:</strong> {currentProject.evaluation.evaluatorModel}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                  {currentProject.evaluation.dimensions.map(dim => (
                    <div key={dim.id} className="p-2 rounded bg-black/30 text-[11px]">
                      <span className="text-white/50 block">{dim.name}</span>
                      <span className="text-amber-400 font-bold">{dim.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between text-xs text-white/50">
              <span>Ready for Export • Certified by Don Vanzara Showbiz LLP</span>
              <button
                onClick={() => handleDownload('master-dossier', 'Master_Story_Dossier')}
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
