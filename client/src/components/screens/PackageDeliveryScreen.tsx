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
  Copy, 
  Brain, 
  BookOpen, 
  ShieldAlert, 
  UserCheck, 
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LineaButton, BentoCard, LineaCaption } from '../common/LineaUI';

export const PackageDeliveryScreen: React.FC = () => {
  const { currentProject, submitGreenlight, setActiveScreen } = useProject();
  const pkg = currentProject.packageData || currentProject.package || {};

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showGreenlitCelebration, setShowGreenlitCelebration] = useState(false);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic deliverables based on current project state
  const isSeries = /series/i.test(currentProject.format || currentProject.contentType || '');
  const screenplayLines = currentProject.screenplay?.length ? currentProject.screenplay : (currentProject.screenplayLines || []);
  const episodes = currentProject.episodes || [];

  const compileFountain = (): string => {
    const header = `Title: ${currentProject.title}
Credit: Written with Tattvaco Narrative Intelligence
Author: ${currentProject.title} Writers Room
Format: ${currentProject.format || (isSeries ? 'Episodic Series' : 'Feature Screenplay')}
Draft date: ${new Date().toLocaleDateString()}

===

`;
    if (!screenplayLines.length) {
      return header + `/* No screenplay lines drafted yet. Complete screenplay drafting in the Screenplay studio. */\n`;
    }

    let body = '';
    screenplayLines.forEach(l => {
      switch (l.type) {
        case 'scene_heading':
          body += `\n${l.content.toUpperCase()}\n\n`;
          break;
        case 'action':
          body += `${l.content}\n\n`;
          break;
        case 'character':
          body += `\n${(l.characterName || l.content).toUpperCase()}\n`;
          break;
        case 'parenthetical':
          body += `${l.content.startsWith('(') ? l.content : `(${l.content})`}\n`;
          break;
        case 'dialogue':
          body += `${l.content}\n\n`;
          break;
        case 'transition':
          body += `\n> ${l.content.toUpperCase()}\n\n`;
          break;
        default:
          body += `${l.content}\n\n`;
      }
    });
    return header + body;
  };

  const compileStandardScript = (): string => {
    let script = `================================================================================\n`;
    script += `${currentProject.title.toUpperCase()}\n`;
    script += `Format: ${currentProject.format || (isSeries ? 'Episodic Series' : 'Feature Film')}\n`;
    script += `Version: ${currentProject.canonicalVersion || 'v1.0'} | Date: ${new Date().toLocaleDateString()}\n`;
    script += `================================================================================\n\n`;

    if (!screenplayLines.length) {
      return script + `[No screenplay scenes currently drafted. Visit the Screenplay Studio to draft scenes.]\n`;
    }

    screenplayLines.forEach(l => {
      switch (l.type) {
        case 'scene_heading':
          script += `\n${l.content.toUpperCase()}\n\n`;
          break;
        case 'action':
          script += `${l.content}\n\n`;
          break;
        case 'character':
          script += `${' '.repeat(22)}${(l.characterName || l.content).toUpperCase()}\n`;
          break;
        case 'parenthetical':
          script += `${' '.repeat(16)}${l.content.startsWith('(') ? l.content : `(${l.content})`}\n`;
          break;
        case 'dialogue':
          script += `${' '.repeat(10)}${l.content}\n\n`;
          break;
        case 'transition':
          script += `${' '.repeat(35)}${l.content.toUpperCase()}\n\n`;
          break;
        default:
          script += `${l.content}\n\n`;
      }
    });
    return script;
  };

  const deliverables = [
    {
      id: 'del-screenplay-fountain',
      title: `${currentProject.title} — Production Screenplay (Fountain .fountain)`,
      type: 'SCR',
      version: currentProject.canonicalVersion || 'v1.0',
      size: `${Math.max(2, Math.round(screenplayLines.length * 0.4))} KB`,
      color: '#10b981',
      fileExt: 'fountain',
      mimeType: 'text/plain',
      content: compileFountain()
    },
    {
      id: 'del-screenplay-script',
      title: `${currentProject.title} — Formatted Hollywood Screenplay (Courier Text)`,
      type: 'SCR',
      version: currentProject.canonicalVersion || 'v1.0',
      size: `${Math.max(2, Math.round(screenplayLines.length * 0.5))} KB`,
      color: '#06b6d4',
      fileExt: 'txt',
      mimeType: 'text/plain',
      content: compileStandardScript()
    },
    {
      id: 'del-treatment',
      title: `${currentProject.title} — Narrative Treatment & Beat Sheet`,
      type: 'DOC',
      version: currentProject.canonicalVersion || 'v0.1',
      size: `${Math.max(1, Math.round((currentProject.treatment?.synopsis?.length || 500) / 100))} KB`,
      color: '#3b82f6',
      fileExt: 'txt',
      mimeType: 'text/plain',
      content: `================================================================================
${currentProject.title.toUpperCase()} — NARRATIVE TREATMENT & DRAMATIC BEATS
================================================================================
LOGLINE:
${currentProject.intent?.premise || 'Logline under development.'}

TONE: ${currentProject.treatment?.tone?.join(', ') || 'Atmospheric, Tense'}
THEMES: ${currentProject.treatment?.themes?.join(', ') || 'Moral Agency, Truth'}

SYNOPSIS:
${currentProject.treatment?.synopsis || currentProject.intent?.premise || 'Synopsis under development.'}

CARDINAL PLOT BEATS:
${currentProject.treatment?.plotBeats?.map(b => `[${b.act}] Beat ${b.number}: ${b.title}\n${b.description}`).join('\n\n') || 'Plot beats pending generation.'}`
    },
    ...(isSeries && episodes.length > 0 ? [{
      id: 'del-series-bible',
      title: `${currentProject.title} — Showrunner Season Arc Bible (${episodes.length} Episodes)`,
      type: 'BBL',
      version: currentProject.canonicalVersion || 'v1.0',
      size: `${Math.max(2, episodes.length * 3)} KB`,
      color: '#ec4899',
      fileExt: 'txt',
      mimeType: 'text/plain',
      content: `================================================================================
${currentProject.title.toUpperCase()} — SEASON 1 SHOWRUNNER BIBLE (${episodes.length} EPISODES)
================================================================================
SERIES OVERVIEW:
${currentProject.intent?.premise || 'Premise pending.'}

EPISODE BREAKDOWN:
${episodes.map(e => `--------------------------------------------------------------------------------
EPISODE ${e.episodeNumber}: ${e.title.toUpperCase()}
Historical / Narrative Focus: ${e.historicalFocus}
Dramatic Function: ${e.narrativeFunction}
Synopsis: ${e.synopsis}
Key Characters: ${e.characterInvolvement?.map(c => `${c.name} (${c.role}): ${c.arcBeat}`).join('; ') || 'Ensemble'}
Unresolved Questions: ${e.unresolvedIssues?.join(' | ') || 'None'}
Status: ${e.candidateState || 'PLANNED'}`).join('\n\n')}`
    }] : []),
    {
      id: 'del-bible',
      title: `${currentProject.title} — Character Bible (${currentProject.characters.length} Cast)`,
      type: 'BBL',
      version: currentProject.canonicalVersion || 'v0.1',
      size: `${Math.max(1, currentProject.characters.length * 2)} KB`,
      color: '#8b5cf6',
      fileExt: 'txt',
      mimeType: 'text/plain',
      content: `================================================================================
${currentProject.title.toUpperCase()} — CHARACTER INTELLIGENCE BIBLE
================================================================================
${currentProject.characters.map((c, i) => `[CHARACTER ${i+1}] ${c.name.toUpperCase()} (${c.role}, Age ${c.age})
Want: ${c.want}
Need: ${c.need}
Flaw: ${c.flaw}
Fear: ${c.fear}
Moral Dilemma: ${c.moralDilemma || 'N/A'}
Voice & Cadence: ${c.voiceStyle || 'Distinct tone'}
Backstory: ${c.backstory || 'N/A'}
Relationships: ${c.relationships?.map(r => `${r.targetCharacterName || 'Ally'} (${r.relationType})`).join(', ') || 'Independent'}`).join('\n\n--------------------------------------------------------------------------------\n') || 'Characters not yet registered.'}`
    },
    {
      id: 'del-storybrain',
      title: `Story Brain Canon Matrix (${currentProject.storyBrain?.canonFacts?.length || 0} Facts)`,
      type: 'CAN',
      version: currentProject.canonicalVersion || 'v0.1',
      size: `${Math.max(1, (currentProject.storyBrain?.canonFacts?.length || 1) * 3)} KB`,
      color: '#f59e0b',
      fileExt: 'txt',
      mimeType: 'text/plain',
      content: `================================================================================
${currentProject.title.toUpperCase()} — STORY BRAIN CANON MATRIX
================================================================================
${currentProject.storyBrain?.canonFacts?.map((f, i) => `#CF-0${i+1} [${f.category.toUpperCase()}]
Statement: ${f.statement}
Source: ${f.source}
Status: LOCKED CANON`).join('\n\n') || 'No canon facts locked.'}`
    },
    {
      id: 'del-research',
      title: `Traceable Research Dossier (${currentProject.researchFindings?.length || 0} Citations)`,
      type: 'RES',
      version: currentProject.canonicalVersion || 'v0.1',
      size: `${Math.max(1, (currentProject.researchFindings?.length || 1) * 2)} KB`,
      color: '#10b981',
      fileExt: 'txt',
      mimeType: 'text/plain',
      content: `================================================================================
${currentProject.title.toUpperCase()} — TRACEABLE RESEARCH DOSSIER
================================================================================
${currentProject.researchFindings?.map((r, i) => `[CITATION 0${i+1}] Topic: ${r.topic}
Claim: ${r.claim}
Evidence: ${r.evidence}
Source: [${r.sourceType}] ${r.source}
Confidence: ${r.confidence}%
Implication for Story: ${r.implicationForPlot}`).join('\n\n') || 'No research conducted.'}`
    },
    {
      id: 'del-eval',
      title: `AI Narrative Quality Evaluation Report`,
      type: 'EVL',
      version: 'v1.0',
      size: '4 KB',
      color: '#06b6d4',
      fileExt: 'txt',
      mimeType: 'text/plain',
      content: `================================================================================
${currentProject.title.toUpperCase()} — AI STORY QUALITY EVALUATION REPORT
================================================================================
Overall Readiness Score: ${currentProject.evaluation ? Math.round(currentProject.evaluation.overallScore) + '%' : 'Pending'}
Readiness Status: ${currentProject.evaluation?.readinessStatus || 'Not evaluated'}
Evaluator Model: ${currentProject.evaluation?.evaluatorModel || 'Groq LPU (gpt-oss-120b)'}

Key Strengths:
${currentProject.evaluation?.keyStrengths?.map(s => `• ${s}`).join('\n') || 'Pending evaluation'}

Critical Risks & Action Items:
${currentProject.evaluation?.criticalRisks?.map(r => `• ${r}`).join('\n') || 'None identified'}

DIMENSION BREAKDOWN:
${currentProject.evaluation?.dimensions?.map(d => `• ${d.name}: ${d.score}/100 — ${d.diagnostic || d.recommendation || 'Normal'}`).join('\n') || 'N/A'}`
    }
  ];

  const handleDownload = (id: string, title: string) => {
    setDownloadingId(id);
    const item = deliverables.find(d => d.id === id);
    const content = item?.content || `TATTAVA COPILOT DELIVERABLE: ${title}`;
    const ext = item?.fileExt || 'txt';
    const mime = item?.mimeType || 'text/plain';

    setTimeout(() => {
      setDownloadingId(null);
      const element = document.createElement('a');
      const file = new Blob([content], { type: mime });

      element.href = URL.createObjectURL(file);
      const sanitizedTitle = currentProject.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      element.download = `${sanitizedTitle}_${id.replace('del-', '')}_${currentProject.canonicalVersion || 'v1.0'}.${ext}`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 400);
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
  const criticalBlockers = (currentProject.continuityIssues || []).filter(
    i => i.resolutionState === 'Open' && i.severity === 'Critical Blocker'
  );
  const hasCriticalBlockers = criticalBlockers.length > 0;
  const hasEvaluation = !!currentProject.evaluation;
  const canGreenlight = !hasCriticalBlockers && hasEvaluation;

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
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Top Bento Hero Banner */}
      <BentoCard className="relative overflow-hidden p-6 lg:p-8 border-white/[0.08]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <LineaCaption variant="mint" icon={<Package className="w-3.5 h-3.5" />}>
                North-Star Deliverable • Final Step 16
              </LineaCaption>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/[0.04] text-stone-400 border border-white/[0.08]">
                {currentProject.canonicalVersion || 'v0.1'}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#fbf8f3]">
              Story Development Package & Greenlight Sign-Off
            </h1>
            
            <p className="text-xs sm:text-sm text-stone-300/80 max-w-3xl leading-relaxed">
              The synthesized production-grade end-product for <strong className="text-[#fbf8f3]">"{currentProject.title}"</strong>: 
              structured Story Brain, traceable research, character bibles, treatment synopsis, continuity verification, and evaluation clearance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LineaButton
              variant="ghost"
              size="md"
              onClick={() => setDossierModalOpen(true)}
              icon={<FileText className="w-4 h-4 text-amber-400" />}
            >
              Inspect Master Dossier
            </LineaButton>

            {pkg.isGreenlit ? (
              <div className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-xl shadow-emerald-500/20">
                <Award className="w-4 h-4" />
                <span>PROJECT GREENLIT FOR PRODUCTION</span>
              </div>
            ) : (
              <LineaButton
                variant="primary"
                size="md"
                onClick={handleGreenlightClick}
                disabled={!canGreenlight}
                title={
                  hasCriticalBlockers 
                    ? `Cannot greenlight: ${criticalBlockers.length} Critical Continuity Blocker(s) open.` 
                    : !hasEvaluation 
                    ? 'Cannot greenlight: Run AI Evaluation in Validation phase first.' 
                    : 'Submit for Official Greenlight'
                }
                icon={<Sparkles className="w-4 h-4 fill-black" />}
              >
                Submit for Official Greenlight
              </LineaButton>
            )}
          </div>
        </div>

        {/* Greenlight Gate Warning if Blocked */}
        {hasCriticalBlockers && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>
                <strong>Greenlight Stage Gate Locked:</strong> {criticalBlockers.length} Critical Continuity Blocker(s) must be reconciled in Canon & Continuity before studio greenlight.
              </span>
            </div>
            <button
              onClick={() => setActiveScreen('continuity')}
              className="text-xs font-semibold text-rose-300 underline hover:text-white shrink-0 ml-3 cursor-pointer"
            >
              Resolve in Continuity →
            </button>
          </div>
        )}

        {/* Live Operational Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
          <div className="bg-[#0a0c12]/60 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm">
            <span className="text-[11px] text-stone-400 block font-medium">Readiness Index</span>
            <span className="text-xl font-bold text-emerald-400 flex items-center gap-2 mt-1">
              <ShieldCheck className="w-4 h-4" />
              {currentProject.evaluation ? Math.round(currentProject.evaluation.overallScore) + '%' : 'Pending'}
            </span>
          </div>

          <div className="bg-[#0a0c12]/60 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm">
            <span className="text-[11px] text-stone-400 block font-medium">Story Brain Canon</span>
            <span className="text-xl font-bold text-amber-400 flex items-center gap-2 mt-1">
              <Brain className="w-4 h-4" />
              {canonCount} Facts Locked
            </span>
          </div>

          <div className="bg-[#0a0c12]/60 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm">
            <span className="text-[11px] text-stone-400 block font-medium">Verified Research</span>
            <span className="text-xl font-bold text-sky-400 flex items-center gap-2 mt-1">
              <BookOpen className="w-4 h-4" />
              {researchCount} Citations
            </span>
          </div>

          <div className="bg-[#0a0c12]/60 rounded-2xl p-4 border border-white/[0.06] backdrop-blur-sm">
            <span className="text-[11px] text-stone-400 block font-medium">Audit Completion</span>
            <span className="text-xl font-bold text-[#fbf8f3] flex items-center gap-2 mt-1">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              {auditPercent}%
            </span>
          </div>
        </div>
      </BentoCard>

      {/* Greenlit Celebration Banner */}
      {showGreenlitCelebration && (
        <BentoCard className="p-6 border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-[#0e1119] to-black/80 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#fbf8f3]">Project Officially Approved for Greenlight</h3>
              <p className="text-xs text-stone-300">
                All development stages completed, canon verified, and sign-offs recorded in attributable audit log.
              </p>
            </div>
          </div>
          <LineaButton
            variant="mint"
            size="md"
            onClick={() => handleDownload('master-pkg', 'Master_Story_Development_Package')}
            icon={<Download className="w-4 h-4" />}
          >
            Download Certified Dossier
          </LineaButton>
        </BentoCard>
      )}

      {/* Two Column Layout: Completeness Audit vs Deliverables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Completeness Audit (5 cols) */}
        <BentoCard className="lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-sm font-bold text-[#fbf8f3]">Story Development Completeness Audit</h3>
              <p className="text-[11px] text-stone-400">Verification checklist derived from current project state.</p>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
              auditPercent >= 80 
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              {auditPercent}% Passed
            </span>
          </div>

          <div className="space-y-2">
            {checklist.map((item, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-2xl bg-[#0a0c12]/60 border border-white/[0.06] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${item.completed ? 'text-emerald-400' : 'text-stone-600'}`} />
                  <span className={`font-medium ${item.completed ? 'text-stone-200' : 'text-stone-500'}`}>{item.label}</span>
                </div>
                <span className="text-[10px] font-mono text-stone-400 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                  {item.stage}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 block mb-0.5">Pilot Governance Note:</strong>
            All narrative materials pass through the 5-stage Canonical State Machine: 
            <span className="font-mono text-[10px] block mt-1 text-stone-300">
              AI_PROPOSAL → CANDIDATE → HUMAN_EDITED → APPROVED → CANONICAL
            </span>
          </div>
        </BentoCard>

        {/* Right Column: Exportable Deliverables (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <BentoCard className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-[#fbf8f3]">Exportable Story Deliverables</h3>
                <p className="text-[11px] text-stone-400">Structured dossiers assembled from approved Project Intelligence.</p>
              </div>
              <button
                onClick={() => handleDownload('all', `${currentProject.title}_Full_Dossier`)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
                    className="p-4 rounded-2xl bg-[#0a0c12]/60 border border-white/[0.06] hover:border-amber-500/30 flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs text-white"
                        style={{ backgroundColor: `${del.color}25`, border: `1px solid ${del.color}60` }}
                      >
                        {del.type}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#fbf8f3]">{del.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5 font-mono">
                          <span>{del.version}</span>
                          <span>•</span>
                          <span>{del.size}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(del.id, del.title)}
                      disabled={isDownloading}
                      className="px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-stone-300 hover:text-white border border-white/[0.1] text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
                      <span>{isDownloading ? 'Exporting...' : 'Download'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </BentoCard>

          {/* Producer Sign-off Status */}
          <BentoCard className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-[#fbf8f3]">Attributable Stakeholder Sign-Off</h3>
            {currentProject.evaluation?.humanSignOff ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#fbf8f3] block">{currentProject.evaluation.humanSignOff.approvedBy}</span>
                  <span className="text-[11px] text-emerald-300">{currentProject.evaluation.humanSignOff.role} • Approved on {currentProject.evaluation.humanSignOff.date}</span>
                  {currentProject.evaluation.humanSignOff.comments && (
                    <p className="text-[11px] text-stone-300 mt-1 italic">"{currentProject.evaluation.humanSignOff.comments}"</p>
                  )}
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30">
                  APPROVED
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#0a0c12]/60 border border-white/[0.06] flex items-center justify-between text-xs text-stone-400">
                <span>Formal producer sign-off pending in Evaluation module.</span>
                <button
                  onClick={() => setActiveScreen('evaluation')}
                  className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  Review & Sign Off →
                </button>
              </div>
            )}
          </BentoCard>
        </div>
      </div>

      {/* MASTER DOSSIER MODAL */}
      {dossierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <BentoCard className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-[#0e1119]/95 border-amber-500/40 shadow-2xl">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-black/40">
              <div>
                <h3 className="text-base font-bold text-[#fbf8f3] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  Master Story Development Dossier • {currentProject.title}
                </h3>
                <span className="text-xs text-stone-400 font-mono">
                  {currentProject.canonicalVersion || 'v0.1'} • Approved Canonical State
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyDossier}
                  className="px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#fbf8f3] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
                </button>
                <button
                  onClick={() => setDossierModalOpen(false)}
                  className="text-stone-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-stone-300 leading-relaxed font-sans">
              <div className="p-4 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">1. Executive Overview</h4>
                <p><strong className="text-[#fbf8f3]">Premise:</strong> {currentProject.intent?.premise || 'Not specified'}</p>
                <p><strong className="text-[#fbf8f3]">Content Type:</strong> {currentProject.contentType || 'Feature Film'}</p>
                <p><strong className="text-[#fbf8f3]">Genre:</strong> {currentProject.genre || 'Drama'}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">2. Canonical Story Brain Truths ({canonCount})</h4>
                <div className="space-y-1.5">
                  {currentProject.storyBrain?.canonFacts?.length ? (
                    currentProject.storyBrain.canonFacts.map((fact, idx) => (
                      <div key={fact.id} className="text-xs text-stone-300 pl-3 border-l-2 border-amber-500/40">
                        <span className="font-mono text-[10px] text-amber-300 font-bold block">#CF-0{idx+1} • {fact.category}</span>
                        "{fact.statement}"
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-500 italic">No canon facts locked yet.</p>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">3. Registered Characters ({charCount})</h4>
                {currentProject.characters?.length ? (
                  <div className="space-y-2">
                    {currentProject.characters.map(c => (
                      <div key={c.id} className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
                        <span className="font-bold text-[#fbf8f3]">{c.name} ({c.role}, Age {c.age})</span>
                        <p className="text-[11px] text-stone-400 mt-0.5">Want: {c.want} • Need: {c.need} • Flaw: {c.flaw}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 italic">No characters registered yet.</p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">4. AI Narrative Evaluation Quality Index</h4>
                {currentProject.evaluation ? (
                  <>
                    <p><strong className="text-[#fbf8f3]">Readiness Score:</strong> {Math.round(currentProject.evaluation.overallScore)}% ({currentProject.evaluation.readinessStatus})</p>
                    <p><strong className="text-[#fbf8f3]">Evaluator Model:</strong> {currentProject.evaluation.evaluatorModel}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                      {currentProject.evaluation.dimensions?.map(dim => (
                        <div key={dim.id} className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-[11px]">
                          <span className="text-stone-400 block">{dim.name}</span>
                          <span className="text-amber-400 font-bold">{dim.score}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-stone-500 italic">Evaluation not yet executed.</p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-white/[0.08] bg-black/40 flex items-center justify-between text-xs text-stone-400">
              <span>Ready for Export • Tattava Copilot Certified State</span>
              <LineaButton
                variant="primary"
                size="sm"
                onClick={() => handleDownload('master-dossier', `${currentProject.title}_Master_Dossier`)}
                icon={<Download className="w-3.5 h-3.5" />}
              >
                Download Certified Text File
              </LineaButton>
            </div>
          </BentoCard>
        </div>
      )}
    </div>
  );
};
