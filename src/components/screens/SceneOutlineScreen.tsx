import React, { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Clapperboard, Play, Pause, Volume2, Sparkles, CheckCircle2, 
  ArrowRight, Clock, MapPin, Users, Eye, AlertCircle, ChevronRight, Activity, Brain, RefreshCw
} from 'lucide-react';
import { SceneItem } from '../../types/project';
import { generateSceneBreakdown } from '../../services/aiService';
import { getCanonicalConfiguration } from '../../services/projectConfiguration';

export const SceneOutlineScreen: React.FC = () => {
  const { currentProject, updateCurrentProject, updateScene, nextStep, openContextResolver } = useProject();
  const scenes = currentProject.scenes || [];

  const [selectedSceneId, setSelectedSceneId] = useState<string>(scenes[0]?.id || '');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeActFilter, setActiveActFilter] = useState<'ALL' | 'ACT I' | 'ACT II' | 'ACT III'>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sceneError, setSceneError] = useState<string | null>(null);

  const selectedScene = scenes.find(s => s.id === selectedSceneId) || scenes[0] || null;
  const canonicalConfig = getCanonicalConfiguration(currentProject);
  const hasStaleScenes = scenes.some(scene => scene.isSynthesisStale || scene.configurationFingerprint !== canonicalConfig.configurationFingerprint);

  useEffect(() => {
    if (!hasStaleScenes || isGenerating) return;
    void handleGenerateScenes();
  }, [canonicalConfig.configurationFingerprint, hasStaleScenes]);

  const handleGenerateScenes = async () => {
    setIsGenerating(true);
    setSceneError(null);
    try {
      const generated = await generateSceneBreakdown(currentProject);
      const stampedScenes = generated.map(scene => ({
        ...scene,
        configurationFingerprint: canonicalConfig.configurationFingerprint,
        isSynthesisStale: false,
        candidateState: scene.candidateState || 'AI_PROPOSAL'
      }));
      updateCurrentProject(prev => ({
        ...prev,
        scenes: stampedScenes,
        selectedSceneId: stampedScenes[0]?.id || prev.selectedSceneId,
        pilotMetrics: {
          ...prev.pilotMetrics,
          totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
        }
      }));
      if (generated.length > 0) {
        setSelectedSceneId(generated[0].id);
      }
    } catch (err: any) {
      setSceneError(err.message || 'Failed to synthesize scene breakdown.');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredScenes = activeActFilter === 'ALL'
    ? scenes
    : scenes.filter(s => s.act.startsWith(activeActFilter));

  const toggleNoteDone = (noteId: string) => {
    if (!selectedScene) return;
    const updatedNotes = (selectedScene.notes || []).map(n => 
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

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateScenes}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing Scenes...' : 'Synthesize Scenes (AI)'}</span>
          </button>

          <button
            onClick={() => openContextResolver('Scene Drafting', 'Scene Breakdown Draft')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Inspect Scoped Context</span>
          </button>

          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Next: Screenplay Editor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error alert banner */}
      {sceneError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{sceneError}</span>
          </div>
          <button onClick={() => setSceneError(null)} className="text-white/40 hover:text-white">✕</button>
        </div>
      )}

      {/* Scenes Grid or Empty State */}
      {scenes.length === 0 ? (
        <div className="p-12 text-center bg-[#141822] border border-dashed border-white/10 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Clapperboard className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">No Scripted Scenes Outlined Yet</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              Synthesize 4 cardinal scripted sequences establishing the opening, turning points, and dramatic confrontation of <span className="text-amber-300">"{currentProject.title}"</span>.
            </p>
          </div>
          <button
            onClick={handleGenerateScenes}
            disabled={isGenerating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{isGenerating ? 'Synthesizing Scenes...' : 'Synthesize Scene Breakdown (AI)'}</span>
          </button>
        </div>
      ) : (
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
                const isSelected = selectedScene ? scn.id === selectedScene.id : false;
                return (
                  <div
                    key={scn.id}
                    onClick={() => setSelectedSceneId(scn.id)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white'
                        : 'bg-black/40 hover:bg-black/60 border-white/5 text-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-amber-400">
                        SCENE {scn.sceneNumber}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/60">
                        {scn.duration}
                      </span>
                    </div>

                    <div className="text-xs font-mono font-bold text-white mt-1 truncate">
                      {scn.slugline}
                    </div>

                    <p className="text-xs text-white/50 mt-2 truncate">
                      {scn.subheading}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-white/40">
                      <span className="truncate">{(scn.characters || []).join(', ')}</span>
                      <span className="font-mono text-amber-400/80">{scn.timeOfDay}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep Scene Dossier (8 cols) */}
          <div className="xl:col-span-8 bg-[#12141a]/95 rounded-2xl border border-white/10 overflow-hidden flex flex-col space-y-6 p-6">
            {selectedScene ? (
              <>
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
                      className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center hover:bg-amber-400 transition-colors cursor-pointer"
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
                      <span className="text-rose-400 font-bold">{selectedScene.insights?.conflictLevel || 'High'} Intensity</span>
                    </div>
                  </div>
                </div>

                {/* Dialogue Highlights & Key Elements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Dialogue Key Exchange</span>
                    <div className="mt-2 p-3 rounded bg-black/60 border border-white/5 text-xs font-mono text-amber-300 italic">
                      "{selectedScene.dialogueHighlights || 'Dramatic subtext dialogue pending production read.'}"
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Key Physical Elements</span>
                    <p className="text-xs text-white/70 mt-2 leading-relaxed">
                      {selectedScene.keyElements || 'Sensory and staging properties.'}
                    </p>
                  </div>
                </div>

                {/* Scene Production Notes Checklist */}
                <div className="pt-2 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                      Scene Departmental Notes ({(selectedScene.notes || []).length})
                    </span>
                    <span className="text-xs text-amber-400 font-mono">Interactive</span>
                  </div>

                  <div className="space-y-2">
                    {(selectedScene.notes || []).map(note => (
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
              </>
            ) : (
              <div className="p-12 text-center text-white/40">Select a scene to view its dossier.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
