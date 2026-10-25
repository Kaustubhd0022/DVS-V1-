import React, { useState } from 'react';
import { 
  X, 
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
import { BentoCard, LineaCaption, LineaButton } from '../common/LineaUI';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <BentoCard className="w-full max-w-4xl bg-[#0e1119]/95 border-white/[0.12] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] p-0">
        {/* Header Alert Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-[#f25b2a]/10 to-transparent border-b border-white/[0.08] p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-amber-500/30">
                  tattvaCo Intelligence
                </span>
                <span className="text-xs text-stone-400">Downstream Dependency Engine</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#fbf8f3]">
                Change Impact Detected: {impactState.totalAffected} Elements Potentially Affected
              </h2>
              <p className="text-xs text-stone-300">
                Trigger: <span className="font-semibold text-amber-300">{impactState.sourceTrigger}</span>
              </p>
            </div>
          </div>

          <button
            onClick={closeImpactModal}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category breakdown pills */}
        <div className="px-6 py-3 bg-[#0a0c12]/80 border-b border-white/[0.08] flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex-shrink-0 cursor-pointer ${
                activeCategory === cat.name
                  ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-white/[0.04] text-stone-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span className={`px-2 py-0.2 text-[10px] rounded-full font-bold ${
                activeCategory === cat.name ? 'bg-black/20 text-stone-950' : 'bg-white/[0.08] text-stone-300'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-[#0a0c12]/60">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs text-stone-400">
            <span>Showing {filteredItems.length} downstream dependencies</span>
            <span>Select items to approve for propagation</span>
          </div>

          {filteredItems.map((item) => {
            const isSelected = selectedItemIds.has(item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleToggleItem(item.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? 'bg-[#141822] border-amber-500/40 shadow-sm'
                    : 'bg-[#0e1119]/60 border-white/[0.06] opacity-60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-[#0a0c12] border-white/20"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#fbf8f3]">{item.objectName}</span>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-stone-400 font-medium">
                          {item.category} • {item.field}
                        </span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                        item.severity === 'High'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {item.severity} Impact
                      </span>
                    </div>

                    {/* Old vs New comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#0a0c12]/80 rounded-xl p-3 border border-white/[0.06]">
                        <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
                          Canonical Baseline
                        </span>
                        <p className="text-stone-300 leading-relaxed">{item.oldValue}</p>
                      </div>
                      <div className="bg-[#0a0c12]/80 rounded-xl p-3 border border-emerald-500/25">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                          Proposed Downstream Adaptation
                        </span>
                        <p className="text-[#fbf8f3] font-medium leading-relaxed">{item.newValue}</p>
                      </div>
                    </div>

                    {/* AI rationale */}
                    <div className="flex items-start gap-2 text-xs text-stone-300 bg-[#0a0c12]/80 px-3.5 py-2.5 rounded-xl border border-white/[0.06]">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p><strong className="text-[#fbf8f3]">Why tattvaCo flags this:</strong> {item.reason}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 bg-black/40 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-stone-400">
            <span>{selectedItemIds.size} of {impactState.items.length} adaptations selected</span>
            <span className="mx-2">•</span>
            <span className="italic">Canonical project history will be preserved as a new version.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={closeImpactModal}
              className="px-4 py-2 rounded-full text-xs font-semibold text-stone-400 hover:text-white transition-colors cursor-pointer"
            >
              Do Not Propagate
            </button>

            <LineaButton
              variant="mint"
              size="md"
              onClick={handlePropagate}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Approve & Propagate Changes ({selectedItemIds.size})
            </LineaButton>
          </div>
        </div>
      </BentoCard>
    </div>
  );
};
