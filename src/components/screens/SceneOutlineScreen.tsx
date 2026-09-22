import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Clapperboard, Play, Pause, Volume2, Sparkles, CheckCircle2, 
  ArrowRight, Clock, MapPin, Users, Eye, AlertCircle, ChevronRight, Activity
} from 'lucide-react';
import { SceneItem } from '../../types/project';

export const SceneOutlineScreen: React.FC = () => {
  const { currentProject, updateScene, nextStep } = useProject();
  const scenes = currentProject.scenes;

  const [selectedSceneId, setSelectedSceneId] = useState<string>(scenes[0]?.id || 'scn-1');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeActFilter, setActiveActFilter] = useState<'ALL' | 'ACT I' | 'ACT II' | 'ACT III'>('ALL');

  const selectedScene = scenes.find(s => s.id === selectedSceneId) || scenes[0];

  const filteredScenes = activeActFilter === 'ALL'
    ? scenes
    : scenes.filter(s => s.act.startsWith(activeActFilter));

  const toggleNoteDone = (noteId: string) => {
    const updatedNotes = selectedScene.notes.map(n => 
      n.id === noteId ? { ...n, done: !n.done } : n
    );
    updateScene(selectedScene.id, { notes: updatedNotes });
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Pipeline Step 10
            </span>
            <span className="text-xs text-white/40">• Scene-Level Dramaturgy</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Scene Breakdown & Spatial Mechanics
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            {scenes.length} Scripted Sequences across 3 Acts. Deep inspection of dramatic objectives, conflicts, and sensory notes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Next: Screenplay Editor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Scenes List (4 cols), Right Scene Deep Dossier (8 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Scenes List & Filter (4 cols) */}
        <div className="xl:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/60">
              Script Scenes ({scenes.length})
            </h3>
            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
              {(['ALL', 'ACT I', 'ACT II', 'ACT III'] as const).map(act => (
                <button
                  key={act}
                  onClick={() => setActiveActFilter(act)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    activeActFilter === act ? 'bg-amber-500 text-black font-bold' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {filteredScenes.map(scn => {
              const isSelected = scn.id === selectedScene.id;
              return (
                <div
                  key={scn.id}
                  onClick={() => setSelectedSceneId(scn.id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-950/40 via-[#161822] to-[#12141a] border-amber-500 ring-1 ring-amber-500'
                      : 'bg-[#12141a]/90 hover:bg-[#161822] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-black/60 border border-white/10 font-mono text-xs font-bold flex items-center justify-center text-amber-400">
                        {scn.sceneNumber}
                      </span>
                      <span className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[170px]">
                        {scn.slugline.replace(/INT\.|EXT\./g, '').trim()}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-white/40">{scn.duration}</span>
                  </div>

                  <p className="text-xs text-white/50 mt-2 truncate">
                    {scn.subheading}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-white/40">
                    <span className="truncate">{scn.characters.join(', ')}</span>
                    <span className="font-mono text-amber-400/80">{scn.timeOfDay}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Scene Dossier (8 cols) */}
        <div className="xl:col-span-8 bg-[#12141a]/95 rounded-2xl border border-white/10 overflow-hidden flex flex-col space-y-6 p-6">
          
          {/* Scene Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold mb-1">
                <span>SCENE {selectedScene.sceneNumber}</span>
                <span>•</span>
                <span>{selectedScene.act}</span>
                <span>•</span>
                <span>{selectedScene.duration}</span>
              </div>
              <h2 className="text-xl font-bold font-mono tracking-tight text-white">
                {selectedScene.slugline}
              </h2>
              <p className="text-xs text-white/60 mt-1">{selectedScene.subheading}</p>
            </div>

            {/* Simulated Audio Player: Rain & Dial Tone */}
            <div className="flex items-center gap-3 bg-black/60 px-4 py-2 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center hover:bg-amber-400 transition-colors"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black ml-0.5" />}
              </button>
              <div>
                <div className="text-[10px] font-bold uppercase text-white/40 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-amber-400" />
                  Atmospheric Audio Track
                </div>
                <div className="text-xs font-mono text-white/80">
                  {isPlayingAudio ? 'Monsoon Deluge + Static Hum [PLAYING]' : 'Precipitation Ambience (0:48)'}
                </div>
              </div>
            </div>
          </div>

          {/* Scene Visual & Dramatic Purpose Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative h-48 rounded-xl overflow-hidden border border-white/10">
              <img
                src={selectedScene.imageUrl}
                alt={selectedScene.slugline}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/80 text-black">
                  Key Location: {selectedScene.location}
                </span>
                <span className="text-xs font-mono text-white/80">
                  {selectedScene.intExt} • {selectedScene.timeOfDay}
                </span>
              </div>
            </div>

            {/* Scene Dramatic Radar Cards */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Dramatic Objective</span>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">{selectedScene.purpose}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Emotional Beat</span>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">{selectedScene.emotionalBeat}</p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <span className="text-white/40">Conflict Level:</span>
                <span className="text-rose-400 font-bold">{selectedScene.insights.conflictLevel} Intensity</span>
              </div>
            </div>
          </div>

          {/* Dialogue Highlights & Key Elements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Dialogue Key Exchange</span>
              <div className="mt-2 p-3 rounded bg-black/60 border border-white/5 text-xs font-mono text-amber-300 italic">
                "{selectedScene.dialogueHighlights}"
              </div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Key Physical Elements</span>
              <p className="text-xs text-white/70 mt-2 leading-relaxed">
                {selectedScene.keyElements}
              </p>
            </div>
          </div>

          {/* Scene Production Notes Checklist */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                Scene Departmental Notes ({selectedScene.notes.length})
              </span>
              <span className="text-xs text-amber-400 font-mono">Interactive</span>
            </div>

            <div className="space-y-2">
              {selectedScene.notes.map(note => (
                <div
                  key={note.id}
                  onClick={() => toggleNoteDone(note.id)}
                  className={`p-3 rounded-lg flex items-center justify-between cursor-pointer transition-colors border ${
                    note.done
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-white/50 line-through'
                      : 'bg-black/40 border-white/5 text-white/80 hover:bg-black/60'
                  }`}
                >
                  <span className="text-xs">{note.text}</span>
                  <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                    note.done ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-white/30'
                  }`}>
                    {note.done && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
