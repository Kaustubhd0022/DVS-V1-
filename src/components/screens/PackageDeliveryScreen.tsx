import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Package, CheckCircle2, Download, ShieldCheck, 
  Sparkles, Award, FileText, ArrowRight, ExternalLink, 
  Clock, Share2, Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DeliverableCard, StakeholderApproval } from '../../types/project';

export const PackageDeliveryScreen: React.FC = () => {
  const { currentProject, submitForGreenlight } = useProject();
  const pkg = currentProject.packageData || currentProject.package;

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showGreenlitCelebration, setShowGreenlitCelebration] = useState(false);

  const handleDownload = (id: string, title: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      // Simulate file download
      const element = document.createElement('a');
      const file = new Blob([`TATTAVA PROD PACKAGE: ${title}\nProject: The Last Monsoon\nVersion: 2.4 Approved`], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${title.toLowerCase().replace(/\s+/g, '_')}_v2.4.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 600);
  };

  const handleGreenlightClick = () => {
    submitForGreenlight();
    setShowGreenlitCelebration(true);

    // Multi-stage confetti celebration
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

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Pipeline Step 16 • Final Milestone
            </span>
            <span className="text-xs text-white/40">• Studio Greenlight Dossier</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Package Delivery & Studio Greenlight
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            16 of 16 Pipeline Stages Verified • Complete Development Package ready for Executive Committee Sign-off.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {pkg.isGreenlit ? (
            <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm flex items-center gap-2 shadow-xl shadow-emerald-500/20">
              <Award className="w-5 h-5" />
              <span>PROJECT OFFICIALLY GREENLIT</span>
            </div>
          ) : (
            <button
              onClick={handleGreenlightClick}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold text-sm flex items-center gap-2 shadow-2xl shadow-amber-500/30 ring-2 ring-amber-400/50 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 fill-black" />
              <span>Submit for Official Studio Greenlight</span>
            </button>
          )}
        </div>
      </div>

      {/* Greenlit Celebration Banner */}
      {showGreenlitCelebration && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-900/40 to-black/80 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Milestone Complete</span>
              <h2 className="text-lg font-bold text-white">The Last Monsoon has received Executive Greenlight!</h2>
              <p className="text-xs text-white/70 mt-0.5">
                All 16 development stages locked. Pre-production mobilization authorized under Project Code #TLM-2024.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowGreenlitCelebration(false)}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold text-xs shrink-0"
          >
            Dismiss Notice
          </button>
        </div>
      )}

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Pipeline Completion</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">16 / 16 (100%)</div>
          <div className="text-xs text-white/50 mt-0.5">All artifacts approved</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Deliverable Files</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{pkg.deliverables.length} Packages</div>
          <div className="text-xs text-white/50 mt-0.5">Ready for instant download</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Stakeholder Quorum</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {pkg.stakeholders.filter(s => s.status === 'Approved').length} / {pkg.stakeholders.length}
          </div>
          <div className="text-xs text-white/50 mt-0.5">Unanimous consensus</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Delivery Target</div>
          <div className="text-2xl font-bold text-amber-400 font-mono mt-1">{pkg.deliveryDate}</div>
          <div className="text-xs text-white/50 mt-0.5">Q4 Festival Submission</div>
        </div>
      </div>

      {/* Main Grid: Left Deliverables & Checklist, Right Stakeholder Sign-Off Chain */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Deliverable Cards & Checklist (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Deliverables Files Grid */}
          <div className="bg-[#12141a]/95 rounded-2xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Production Deliverable Assets ({pkg.deliverables.length})
                </h3>
                <p className="text-[11px] text-white/50">Export industry-standard packages for department heads.</p>
              </div>
              <span className="text-xs font-mono text-white/40">Total Size: 1.2 GB</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {pkg.deliverables.map(deliv => (
                <div
                  key={deliv.id}
                  className="p-4 rounded-xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-amber-500/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${deliv.color} flex items-center justify-center font-bold text-xs text-white shrink-0`}>
                      {deliv.type}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {deliv.title}
                      </h4>
                      <span className="text-[10px] font-mono text-white/40">
                        {deliv.version} • {deliv.size}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(deliv.id, deliv.title)}
                    disabled={downloadingId === deliv.id}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors shrink-0"
                    title="Download package"
                  >
                    <Download className={`w-4 h-4 ${downloadingId === deliv.id ? 'animate-bounce text-amber-400' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 14-Item Verification Checklist */}
          <div className="bg-[#12141a]/95 rounded-2xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                14-Item Development Master Checklist
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">14 / 14 Verified</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {pkg.checklist.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs">
                  <span className="text-white/80">{item.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Stakeholder Sign-Off Chain (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-[#12141a]/95 rounded-2xl border border-white/10 p-6 space-y-5">
            <div className="pb-3 border-b border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Executive Approval Chain
              </h3>
              <p className="text-[11px] text-white/50">Cryptographic audit trail of all executive sign-offs.</p>
            </div>

            <div className="space-y-4">
              {pkg.stakeholders.map(stakeholder => (
                <div key={stakeholder.id} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={stakeholder.avatar}
                      alt={stakeholder.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{stakeholder.name}</div>
                      <div className="text-[10px] text-white/50 truncate">{stakeholder.role}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {stakeholder.status}
                    </span>
                  </div>

                  {stakeholder.date && (
                    <div className="text-[10px] font-mono text-white/40 pt-1 border-t border-white/5 flex items-center justify-between">
                      <span>Signed:</span>
                      <span>{stakeholder.date}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Studio Greenlight Action */}
            <div className="pt-2">
              {!pkg.isGreenlit ? (
                <button
                  onClick={handleGreenlightClick}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Greenlight Authorization</span>
                </button>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Greenlight Certificate #GL-2024-884
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
