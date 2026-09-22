import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Calendar, DollarSign, Clock, Users, MapPin, 
  ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck, 
  BarChart2, Layers, Briefcase, FileText
} from 'lucide-react';

export const ProductionPlanningScreen: React.FC = () => {
  const { currentProject, nextStep } = useProject();
  const prod = currentProject.productionPlan || currentProject.production;

  const [activeView, setActiveView] = useState<'gantt' | 'budget' | 'risks'>('gantt');

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Pipeline Step 15
            </span>
            <span className="text-xs text-white/40">• Logistical Feasibility & Resource Allocation</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Production Planning & Budget Envelope
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            45 Principal Shoot Days • ₹{prod.budgetTotalCr} Cr Estimated Expenditure • 140 Crew Members • 8 Core Practical Locations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Next: Package & Delivery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="flex items-center gap-1.5 text-white/40 text-[11px] font-mono">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>SHOOT DAYS</span>
          </div>
          <div className="text-xl font-bold text-white font-mono mt-1">{prod.shootDays} Days</div>
          <div className="text-[10px] text-white/50 mt-0.5">8 Night Schedules</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="flex items-center gap-1.5 text-white/40 text-[11px] font-mono">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>TOTAL BUDGET</span>
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">₹{prod.budgetTotalCr} Cr</div>
          <div className="text-[10px] text-white/50 mt-0.5">Approved Envelope</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="flex items-center gap-1.5 text-white/40 text-[11px] font-mono">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>LOCATIONS</span>
          </div>
          <div className="text-xl font-bold text-white font-mono mt-1">{prod.keyLocationsCount} Venues</div>
          <div className="text-[10px] text-white/50 mt-0.5">4 Studio / 4 Exterior</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="flex items-center gap-1.5 text-white/40 text-[11px] font-mono">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>CREW SIZE</span>
          </div>
          <div className="text-xl font-bold text-white font-mono mt-1">{prod.crewCount} Heads</div>
          <div className="text-[10px] text-white/50 mt-0.5">Specialized SFX Riggers</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="flex items-center gap-1.5 text-white/40 text-[11px] font-mono">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span>START DATE</span>
          </div>
          <div className="text-xl font-bold text-white font-mono mt-1">{prod.tentativeStart}</div>
          <div className="text-[10px] text-white/50 mt-0.5">Post-Monsoon Prep</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="flex items-center gap-1.5 text-white/40 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>READINESS</span>
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">{prod.readinessStatus}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Greenlight Track</div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveView('gantt')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
            activeView === 'gantt'
              ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/10'
              : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          Master Timeline Gantt
        </button>
        <button
          onClick={() => setActiveView('budget')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
            activeView === 'budget'
              ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/10'
              : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          Budget Allocation (₹{prod.budgetTotalCr} Cr)
        </button>
        <button
          onClick={() => setActiveView('risks')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
            activeView === 'risks'
              ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/10'
              : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
          }`}
        >
          Risk Matrix ({prod.risks.length} Items)
        </button>
      </div>

      {/* VIEW 1: Master Timeline Gantt */}
      {activeView === 'gantt' && (
        <div className="p-6 rounded-2xl bg-[#12141a]/95 border border-white/10 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Multi-Phase Production Schedule
              </h3>
              <p className="text-[11px] text-white/50">Oct 2024 to Apr 2025 • End-to-End Turnaround</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Schedule Locked
            </span>
          </div>

          <div className="space-y-4">
            {prod.schedulePhases.map((phase, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{phase.name}</span>
                  <span className="font-mono text-white/50 text-[11px]">{phase.dates}</span>
                </div>
                
                {/* Gantt Bar track */}
                <div className="h-6 rounded-lg bg-black/60 border border-white/5 relative overflow-hidden flex items-center px-1">
                  <div
                    style={{
                      left: `${phase.barStartPercent}%`,
                      width: `${phase.barWidthPercent}%`
                    }}
                    className={`absolute h-4 rounded ${phase.color} opacity-90 shadow-md flex items-center px-2 text-[10px] font-bold text-black font-mono truncate`}
                  >
                    {phase.name}
                  </div>
                </div>

                {/* Sub-phases if available */}
                {phase.subUnits && (
                  <div className="pl-4 pt-1 space-y-1">
                    {phase.subUnits.map((sub, sIdx) => (
                      <div key={sIdx} className="flex items-center justify-between text-[11px] text-white/60">
                        <span>• {sub.name}</span>
                        <span className="font-mono text-white/40">{sub.dates}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: Budget Allocation */}
      {activeView === 'budget' && (
        <div className="p-6 rounded-2xl bg-[#12141a]/95 border border-white/10 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Capital Expenditure by Department
              </h3>
              <p className="text-[11px] text-white/50">Detailed Breakdown across ₹{prod.budgetTotalCr} Cr budget</p>
            </div>
            <span className="text-sm font-mono font-bold text-emerald-400">Total: ₹{prod.budgetTotalCr} Cr</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {prod.budgetCategories.map((cat, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${cat.color}`} />
                      {cat.category}
                    </span>
                    <span className="font-mono font-bold text-white">₹{cat.amountCr} Cr ({cat.percent}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: `${cat.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
                  Budget Governance Note
                </span>
                <p className="text-xs text-white/70 leading-relaxed">
                  Budget includes a 9% contingency reserve allocated specifically to heavy rain machine water consumption, night exterior permit surcharges in South Mumbai, and high-frame-rate underwater camera rigs.
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-white/40">
                <span>Audited By: Ernst & Young Media Services</span>
                <span className="text-emerald-400">Compliant</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Risks & Mitigations */}
      {activeView === 'risks' && (
        <div className="p-6 rounded-2xl bg-[#12141a]/95 border border-white/10 space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white pb-3 border-b border-white/10">
            Production Risk Registry & Disaster Contingency
          </h3>

          <div className="space-y-3">
            {prod.risks.map((risk, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      risk.severity === 'High' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {risk.severity} Risk
                    </span>
                    <span className="text-sm font-bold text-white">{risk.name}</span>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    <strong className="text-amber-400">Mitigation:</strong> {risk.mitigation}
                  </p>
                </div>

                <span className="text-xs font-mono text-emerald-400 shrink-0 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Managed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
