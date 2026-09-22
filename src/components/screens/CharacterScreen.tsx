import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { Character, CharacterRelationship } from '../../types/project';
import { 
  Users, Sparkles, AlertTriangle, ArrowRight, ShieldCheck, 
  Edit3, GitFork, MessageSquare, Network, Activity, 
  ChevronRight, Heart, Zap, Lock, RefreshCw, CheckCircle2, UserCheck
} from 'lucide-react';

export const CharacterScreen: React.FC = () => {
  const { currentProject, updateCharacter, triggerChangeImpact, nextStep } = useProject();

  const [selectedCharId, setSelectedCharId] = useState<string>(currentProject.characters[0]?.id || 'char-aanya');
  const [activeTab, setActiveTab] = useState<'profile' | 'psychology' | 'relationships' | 'ai-tools'>('profile');
  const [isEditingAge, setIsEditingAge] = useState(false);
  const [tempAge, setTempAge] = useState<number>(24);
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);

  const selectedChar = currentProject.characters.find(c => c.id === selectedCharId) || currentProject.characters[0];

  const handleAgeChangeSubmit = () => {
    if (tempAge !== selectedChar.age) {
      // If changing to 34 or any new age on Aanya, trigger impact analysis engine
      if (selectedChar.id === 'char-aanya' && tempAge === 34) {
        triggerChangeImpact('Protagonist Age Modification (24 → 34)');
      } else {
        updateCharacter(selectedChar.id, { age: tempAge });
      }
    }
    setIsEditingAge(false);
  };

  const handleTriggerAanyaAgeImpactDemo = () => {
    setTempAge(34);
    triggerChangeImpact('Protagonist Age Modification (24 → 34)');
  };

  const runAiCharacterTool = (toolName: string) => {
    setAiGenerating(toolName);
    setTimeout(() => {
      setAiGenerating(null);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Banner / Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Pipeline Step 06
            </span>
            <span className="text-xs text-white/40">• Character Architecture & Psychometrics</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Character Development & Ensemble Matrix
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            Cast of {currentProject.characters.length} principal figures. Every psychometric trait and relationship is reactive to story changes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Flagship Demo Button */}
          <button
            onClick={handleTriggerAanyaAgeImpactDemo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:from-amber-400 hover:to-rose-400 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50 animate-pulse"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>Test Demo: Change Aanya’s Age (24 → 34)</span>
          </button>

          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/10 transition-all"
          >
            <span>Next: World & Setting</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Flagship Notice Bar */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Reactive Engine Active</span>
            <p className="text-xs text-white/80">
              Modifying core character attributes (e.g. Aanya’s age or relationships) triggers the <span className="text-amber-400 font-semibold">Change Impact Engine</span> across Dialogue, Screenplay, Scenes, and Costing.
            </p>
          </div>
        </div>
        <button
          onClick={handleTriggerAanyaAgeImpactDemo}
          className="text-xs font-semibold text-amber-400 underline hover:text-amber-300 shrink-0"
        >
          Simulate Impact Now →
        </button>
      </div>

      {/* Main Grid: Left Characters List, Right Character Detail Canvas */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Character Cards List (4 cols) */}
        <div className="xl:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
              Ensemble Roster ({currentProject.characters.length})
            </h3>
            <button
              onClick={() => runAiCharacterTool('Ensemble Analysis')}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
            >
              <Sparkles className="w-3 h-3" />
              Analyze Ensemble
            </button>
          </div>

          <div className="space-y-3">
            {currentProject.characters.map(char => {
              const isSelected = char.id === selectedChar.id;
              const isAanya = char.id === 'char-aanya';

              return (
                <div
                  key={char.id}
                  onClick={() => {
                    setSelectedCharId(char.id);
                    setTempAge(char.age);
                  }}
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-950/40 via-[#161822] to-[#12141a] border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500'
                      : 'bg-[#12141a]/90 hover:bg-[#161822] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative">
                      <img
                        src={char.photoUrl}
                        alt={char.name}
                        className="w-14 h-14 rounded-xl object-cover border border-white/10"
                      />
                      <span className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        char.role === 'Protagonist' ? 'bg-amber-500 text-black' :
                        char.role === 'Antagonist' ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {char.role}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-sm font-bold truncate ${isSelected ? 'text-amber-400' : 'text-white'}`}>
                          {char.name}
                        </h4>
                        <span className="text-xs font-mono text-white/50">{char.age} yrs</span>
                      </div>

                      <p className="text-xs text-white/50 truncate mt-0.5">
                        {char.occupation}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/60 border border-white/10">
                          {char.scenesAppeared.length} Scenes
                        </span>
                        <span className="text-[10px] text-white/40 italic truncate">
                          "{char.want.slice(0, 30)}..."
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Special CTA on Aanya */}
                  {isAanya && (
                    <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-amber-400/90 flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 fill-amber-400" />
                        Anchor Change Object
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerAanyaAgeImpactDemo();
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40 transition-colors"
                      >
                        Change 24 → 34
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Character Dossier & Reactive Workspace (8 cols) */}
        <div className="xl:col-span-8 bg-[#12141a]/95 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
          
          {/* Dossier Header */}
          <div className="p-6 bg-gradient-to-r from-black/80 via-[#181b26]/60 to-black/80 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={selectedChar.photoUrl}
                alt={selectedChar.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500/40 shadow-2xl shadow-black"
              />
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-bold font-serif text-white">{selectedChar.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {selectedChar.role}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {selectedChar.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-white/60 mt-1.5">
                  <span>{selectedChar.occupation}</span>
                  <span>•</span>
                  <span>Based in {selectedChar.location}</span>
                  <span>•</span>
                  
                  {/* Interactive Age Badge with Quick Edit */}
                  <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                    <span className="text-white/40">Age:</span>
                    {isEditingAge ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={tempAge}
                          onChange={(e) => setTempAge(parseInt(e.target.value) || 0)}
                          className="w-12 px-1 py-0.2 bg-black border border-amber-500 rounded text-amber-400 font-mono text-xs text-center"
                          autoFocus
                        />
                        <button
                          onClick={handleAgeChangeSubmit}
                          className="text-[10px] px-1.5 py-0.5 bg-amber-500 text-black font-bold rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setTempAge(selectedChar.age);
                          setIsEditingAge(true);
                        }}
                        className="font-bold text-amber-400 hover:underline flex items-center gap-1"
                        title="Click to edit age or test change propagation"
                      >
                        <span>{selectedChar.age}</span>
                        <Edit3 className="w-2.5 h-2.5 text-white/40" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-white/80 italic mt-2 border-l-2 border-amber-500/50 pl-3">
                  "{selectedChar.quote}"
                </div>
              </div>
            </div>

            {/* AI Action Chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => runAiCharacterTool('Explore Variations')}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <GitFork className="w-3.5 h-3.5 text-amber-400" />
                <span>Explore Variations</span>
              </button>
              <button
                onClick={() => runAiCharacterTool('Consistency Check')}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Consistency Check</span>
              </button>
            </div>
          </div>

          {/* Dossier Navigation Tabs */}
          <div className="flex items-center gap-6 px-6 border-b border-white/10 bg-black/40 text-xs font-medium">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'border-amber-500 text-amber-400 font-bold'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Dossier & Archetype
            </button>
            <button
              onClick={() => setActiveTab('psychology')}
              className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'psychology'
                  ? 'border-amber-500 text-amber-400 font-bold'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              Psychometric Core & Arc
            </button>
            <button
              onClick={() => setActiveTab('relationships')}
              className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'relationships'
                  ? 'border-amber-500 text-amber-400 font-bold'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Network className="w-4 h-4" />
              Relationship Graph ({selectedChar.relationships.length})
            </button>
            <button
              onClick={() => setActiveTab('ai-tools')}
              className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'ai-tools'
                  ? 'border-amber-500 text-amber-400 font-bold'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Voice Synthesis & Variations
            </button>
          </div>

          {/* Dossier Body Content */}
          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            
            {/* TAB 1: Profile & Dossier */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Dramatic Arc Summary</span>
                    <p className="text-xs text-white/80 mt-2 leading-relaxed">
                      {selectedChar.arc}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Voice & Linguistic Style</span>
                    <p className="text-xs text-white/80 mt-2 leading-relaxed">
                      {selectedChar.voiceStyle}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold uppercase text-white/40 tracking-wider">Internal Contradictions</span>
                  <p className="text-xs text-white/80 mt-2 leading-relaxed">
                    {selectedChar.contradictions}
                  </p>
                </div>

                {/* Scenes breakdown */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-white/50 tracking-wider mb-2">
                    Appears In {selectedChar.scenesAppeared.length} Scheduled Scenes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedChar.scenesAppeared.map(scn => (
                      <span key={scn} className="px-3 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-white/70">
                        Scene {scn}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Psychometrics */}
            {activeTab === 'psychology' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold uppercase text-amber-400/90 tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Conscious Want
                  </span>
                  <p className="text-xs text-white/80 mt-2">{selectedChar.want}</p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold uppercase text-emerald-400/90 tracking-wider flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" /> Unconscious Need
                  </span>
                  <p className="text-xs text-white/80 mt-2">{selectedChar.need}</p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold uppercase text-rose-400/90 tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Core Fear
                  </span>
                  <p className="text-xs text-white/80 mt-2">{selectedChar.fear}</p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold uppercase text-orange-400/90 tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Fatal Flaw
                  </span>
                  <p className="text-xs text-white/80 mt-2">{selectedChar.flaw}</p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold uppercase text-blue-400/90 tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Core Strength
                  </span>
                  <p className="text-xs text-white/80 mt-2">{selectedChar.strength}</p>
                </div>

                <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold uppercase text-purple-400/90 tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Deepest Secret
                  </span>
                  <p className="text-xs text-white/80 mt-2">{selectedChar.secret}</p>
                </div>
              </div>
            )}

            {/* TAB 3: Relationships Graph */}
            {activeTab === 'relationships' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-xs text-white/60">
                  Relational dynamics map. Changes here propagate to subtext in scene dialogues.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedChar.relationships.map((rel, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/10 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{rel.targetCharacterName}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {rel.relationType}
                          </span>
                        </div>
                        <p className="text-xs text-white/70 mt-2 leading-relaxed">
                          {rel.dynamic}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                        <span>Dynamic: Polar Tension</span>
                        <button className="text-amber-400 hover:underline">Edit Tension</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: AI Tools */}
            {activeTab === 'ai-tools' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Generate Backstory Traumas</h4>
                      <p className="text-xs text-white/50 mt-1">Deepen formative childhood events in Pune rainfall season.</p>
                    </div>
                    <button
                      onClick={() => runAiCharacterTool('Backstory')}
                      className="mt-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium"
                    >
                      Synthesize Backstory
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Linguistic Cadence Check</h4>
                      <p className="text-xs text-white/50 mt-1">Audit vocabulary for Hindi-English code-switching realism.</p>
                    </div>
                    <button
                      onClick={() => runAiCharacterTool('Linguistics')}
                      className="mt-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium"
                    >
                      Audit Voice
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Pressure Test Dilemma</h4>
                      <p className="text-xs text-white/50 mt-1">Stress test Aanya’s choices against Kabir’s extortion threats.</p>
                    </div>
                    <button
                      onClick={() => runAiCharacterTool('Pressure Test')}
                      className="mt-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium"
                    >
                      Run Simulation
                    </button>
                  </div>
                </div>

                {aiGenerating && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Running AI character engine for {aiGenerating}...</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
