import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Calendar, DollarSign, Clock, Users, MapPin, 
  ArrowRight, CheckCircle2, ShieldCheck
} from 'lucide-react';
import { BentoCard, LineaCaption, LineaButton } from '../common/LineaUI';

export const ProductionPlanningScreen: React.FC = () => {
  const { currentProject, nextStep } = useProject();
  const prod = currentProject.productionPlan || currentProject.production || {
    shootDays: 45,
    keyLocationsCount: 4,
    crewCount: 65,
    budgetTotalCr: 12.5,
    tentativeStart: 'TBD',
    readinessStatus: 'Concept Stage',
    schedulePhases: [],
    budgetCategories: [],
    resources: [],
    locations: [],
    milestones: [],
    risks: [],
    documents: []
  };

  const schedulePhases = prod.schedulePhases || [];
  const budgetCategories = prod.budgetCategories || [];
  const risks = prod.risks || [];

  const [activeView, setActiveView] = useState<'gantt' | 'budget' | 'risks'>('gantt');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16 animate-fadeIn">
      {/* Top Header */}
      <BentoCard className="p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <LineaCaption variant="amber" icon={<Calendar className="w-3.5 h-3.5" />}>
              Pipeline Step 15 • Production Operations
            </LineaCaption>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-white/[0.04] text-stone-400 border border-white/[0.08]">
              Feasibility & Budget Envelope
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#fbf8f3] flex items-center gap-3">
            Production Planning & Budget Envelope
          </h1>
          <p className="text-xs sm:text-sm text-stone-300/80 leading-relaxed">
            {prod.shootDays || 45} Principal Shoot Days • ₹{prod.budgetTotalCr || 10} Cr Estimated Expenditure • {prod.crewCount || 65} Crew Members • {prod.keyLocationsCount || 4} Core Practical Locations
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <LineaButton
            variant="primary"
            size="md"
            onClick={nextStep}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
          >
            Next: Package & Delivery
          </LineaButton>
        </div>
      </BentoCard>

      {/* 6 Metric Bento KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <BentoCard className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-mono">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>SHOOT DAYS</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#fbf8f3] font-mono mt-1">{prod.shootDays || 45} Days</div>
          <div className="text-[10px] text-stone-500">Estimated Turnaround</div>
        </BentoCard>

        <BentoCard className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-mono">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>TOTAL BUDGET</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400 font-mono mt-1">₹{prod.budgetTotalCr || 10} Cr</div>
          <div className="text-[10px] text-stone-500">Target Envelope</div>
        </BentoCard>

        <BentoCard className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-mono">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>LOCATIONS</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#fbf8f3] font-mono mt-1">{prod.keyLocationsCount || 4} Venues</div>
          <div className="text-[10px] text-stone-500">Primary Stages</div>
        </BentoCard>

        <BentoCard className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-mono">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>CREW SIZE</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#fbf8f3] font-mono mt-1">{prod.crewCount || 65} Heads</div>
          <div className="text-[10px] text-stone-500">Department Leads</div>
        </BentoCard>

        <BentoCard className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-mono">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span>START DATE</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-[#fbf8f3] font-mono mt-1">{prod.tentativeStart || 'TBD'}</div>
          <div className="text-[10px] text-stone-500">Pre-Production Prep</div>
        </BentoCard>

        <BentoCard className="p-4 space-y-1">
          <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>READINESS</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-300 font-mono mt-1">{prod.readinessStatus || 'Concept Stage'}</div>
          <div className="text-[10px] text-emerald-400 font-semibold">Active Track</div>
        </BentoCard>
      </div>

      {/* View Switcher Capsule Tabs */}
      <div className="inline-flex items-center gap-1 p-1 bg-[#0a0c12]/80 rounded-full border border-white/[0.08]">
        <button
          onClick={() => setActiveView('gantt')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeView === 'gantt'
              ? 'bg-amber-400 text-stone-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Master Timeline Gantt
        </button>
        <button
          onClick={() => setActiveView('budget')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeView === 'budget'
              ? 'bg-amber-400 text-stone-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Budget Allocation (₹{prod.budgetTotalCr || 10} Cr)
        </button>
        <button
          onClick={() => setActiveView('risks')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeView === 'risks'
              ? 'bg-amber-400 text-stone-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Risk Matrix ({risks.length} Items)
        </button>
      </div>

      {/* VIEW 1: Master Timeline Gantt */}
      {activeView === 'gantt' && (
        <BentoCard className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3]">
                Multi-Phase Production Schedule
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">End-to-End Turnaround Schedule</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Preliminary Schedule
            </span>
          </div>

          {schedulePhases.length === 0 ? (
            <div className="p-8 text-center bg-[#0a0c12]/60 rounded-2xl border border-white/[0.06] text-xs text-stone-400">
              No custom production schedule phases configured yet. Standard 3-phase production envelope applies.
            </div>
          ) : (
            <div className="space-y-4">
              {schedulePhases.map((phase, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#fbf8f3]">{phase.name}</span>
                    <span className="font-mono text-stone-400 text-[11px]">{phase.dates}</span>
                  </div>
                  
                  {/* Gantt Bar track */}
                  <div className="h-6 rounded-full bg-[#0a0c12] border border-white/[0.06] relative overflow-hidden flex items-center px-1">
                    <div
                      style={{
                        left: `${phase.barStartPercent}%`,
                        width: `${phase.barWidthPercent}%`
                      }}
                      className={`absolute h-4 rounded-full ${phase.color} opacity-90 shadow-md flex items-center px-2 text-[10px] font-bold text-stone-950 font-mono truncate`}
                    >
                      {phase.name}
                    </div>
                  </div>

                  {/* Sub-phases if available */}
                  {phase.subUnits && (
                    <div className="pl-4 pt-1 space-y-1">
                      {phase.subUnits.map((sub, sIdx) => (
                        <div key={sIdx} className="flex items-center justify-between text-[11px] text-stone-400">
                          <span>• {sub.name}</span>
                          <span className="font-mono text-stone-500">{sub.dates}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </BentoCard>
      )}

      {/* VIEW 2: Budget Allocation */}
      {activeView === 'budget' && (
        <BentoCard className="p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3]">
                Capital Expenditure by Department
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">Breakdown across ₹{prod.budgetTotalCr || 10} Cr budget</p>
            </div>
            <span className="text-sm font-mono font-bold text-emerald-400">Total: ₹{prod.budgetTotalCr || 10} Cr</span>
          </div>

          {budgetCategories.length === 0 ? (
            <div className="p-8 text-center bg-[#0a0c12]/60 rounded-2xl border border-white/[0.06] text-xs text-stone-400">
              Departmental budget line-items will be generated upon greenlight package finalization.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {budgetCategories.map((cat, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#fbf8f3] flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${cat.color}`} />
                        {cat.category}
                      </span>
                      <span className="font-mono font-bold text-[#fbf8f3]">₹{cat.amountCr} Cr ({cat.percent}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-3xl bg-[#0a0c12]/80 border border-white/[0.06] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">
                    Budget Governance Note
                  </span>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Preliminary budget envelope modeled for standard theatrical and premium OTT production standards with contingency reserve.
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-stone-400">
                  <span>Governance Track</span>
                  <span className="text-emerald-400 font-semibold">Compliant</span>
                </div>
              </div>
            </div>
          )}
        </BentoCard>
      )}

      {/* VIEW 3: Risks & Mitigations */}
      {activeView === 'risks' && (
        <BentoCard className="p-6 lg:p-8 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3] pb-3 border-b border-white/[0.08]">
            Production Risk Registry & Disaster Contingency
          </h3>

          {risks.length === 0 ? (
            <div className="p-8 text-center bg-[#0a0c12]/60 rounded-2xl border border-white/[0.06] text-xs text-stone-400">
              No active production blockers or high risks logged for this project.
            </div>
          ) : (
            <div className="space-y-3">
              {risks.map((risk, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#0a0c12]/80 border border-white/[0.06] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        risk.severity === 'High' ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {risk.severity} Risk
                      </span>
                      <span className="text-sm font-bold text-[#fbf8f3]">{risk.name}</span>
                    </div>
                    <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                      <strong className="text-amber-300">Mitigation:</strong> {risk.mitigation}
                    </p>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 shrink-0 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Managed
                  </span>
                </div>
              ))}
            </div>
          )}
        </BentoCard>
      )}
    </div>
  );
};
