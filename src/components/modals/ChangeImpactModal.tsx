import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Users, 
  BookOpen, 
  Clapperboard, 
  MessageSquare, 
  Palette, 
  Briefcase,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useProject } from '../../context/ProjectContext';

export const ChangeImpactModal: React.FC = () => {
  const { 
    impactState, 
    closeImpactModal, 
    approveAndPropagateImpact 
  } = useProject();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set(impactState.items.map(i => i.id))
  );

  if (!impactState.isOpen) return null;

  const handleToggleItem = (id: string) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePropagate = () => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    approveAndPropagateImpact();
  };

  const categories = [
    { name: 'All', count: impactState.totalAffected, icon: <Layers className="w-3.5 h-3.5" /> },
    { name: 'Characters', count: impactState.summary.characters, icon: <Users className="w-3.5 h-3.5" /> },
    { name: 'Story', count: impactState.summary.story, icon: <BookOpen className="w-3.5 h-3.5" /> },
    { name: 'Scenes', count: impactState.summary.scenes, icon: <Clapperboard className="w-3.5 h-3.5" /> },
    { name: 'Dialogue', count: impactState.summary.dialogue, icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { name: 'Visuals', count: impactState.summary.visuals, icon: <Palette className="w-3.5 h-3.5" /> },
    { name: 'Production', count: impactState.summary.production, icon: <Briefcase className="w-3.5 h-3.5" /> },
  ];

  const filteredItems = activeCategory === 'All'
    ? impactState.items
    : impactState.items.filter(i => i.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#13161f] border border-[#2a3345] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Alert Banner */}
        <div className="bg-gradient-to-r from-amber-500/20 via-[#f25b2a]/15 to-transparent border-b border-amber-500/30 p-5 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[11px] font-bold tracking-wider uppercase border border-amber-500/40">
                  Tattava Intelligence
                </span>
                <span className="text-xs text-[#8a98ac]">Downstream Dependency Engine</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Change Impact Detected: {impactState.totalAffected} Project Elements Potentially Affected
              </h2>
              <p className="text-xs text-[#cad5e4] mt-0.5">
                Trigger: <span className="font-semibold text-amber-300">{impactState.sourceTrigger}</span>
              </p>
            </div>
          </div>

          <button
            onClick={closeImpactModal}
            className="p-2 rounded-xl text-[#7c8b9f] hover:text-white hover:bg-[#202736] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category breakdown pills */}
        <div className="px-6 py-3 bg-[#10131b] border-b border-[#202736] flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                activeCategory === cat.name
                  ? 'bg-[#f25b2a] text-white shadow-glow-orange'
                  : 'bg-[#181c26] text-[#8e9cb0] hover:text-white hover:bg-[#222838] border border-[#262e3f]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                activeCategory === cat.name ? 'bg-white/25 text-white' : 'bg-[#262e3e] text-[#a6b4c6]'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-[#0f1218]">
          <div className="flex items-center justify-between pb-2 border-b border-[#1f2533] text-xs text-[#8594a8]">
            <span>Showing {filteredItems.length} downstream dependencies</span>
            <span>Select items to approve for propagation</span>
          </div>

          {filteredItems.map((item) => {
            const isSelected = selectedItemIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'bg-[#161a24] border-[#364257] shadow-sm'
                    : 'bg-[#12151d]/60 border-[#1f2533] opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 rounded text-[#f25b2a] focus:ring-[#f25b2a] bg-[#1a202c] border-[#333e52]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.objectName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#202738] text-[#8b98ac] font-medium">
                          {item.category} • {item.field}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        item.severity === 'High'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      }`}>
                        {item.severity} Impact
                      </span>
                    </div>

                    {/* Old vs New comparison */}
                    <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#1c222e] rounded-lg p-2.5 border border-[#283244]">
                        <span className="text-[10px] uppercase font-bold text-[#718096] block mb-1">
                          Canonical Baseline
                        </span>
                        <p className="text-[#9cb0c8]">{item.oldValue}</p>
                      </div>
                      <div className="bg-[#212836] rounded-lg p-2.5 border border-[#3b4861]">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                          Proposed Downstream Adaptation
                        </span>
                        <p className="text-white font-medium">{item.newValue}</p>
                      </div>
                    </div>

                    {/* AI rationale */}
                    <div className="mt-2 flex items-start gap-2 text-xs text-[#a3b3c7] bg-[#121620] px-3 py-2 rounded-lg border border-[#1f2635]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p><strong className="text-white">Why Tattava flags this:</strong> {item.reason}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#121620] border-t border-[#222938] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#8090a5]">
            <span>{selectedItemIds.size} of {impactState.items.length} adaptations selected</span>
            <span className="mx-2">•</span>
            <span className="italic">Canonical project history will be preserved as a new version.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={closeImpactModal}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8b9bb2] hover:text-white hover:bg-[#1c2230] transition-colors"
            >
              Do Not Propagate
            </button>

            <button
              onClick={handlePropagate}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Propagate Changes ({selectedItemIds.size})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
