import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Globe, MapPin, Compass, CloudRain, Building, Camera, 
  ArrowRight, ShieldCheck, ChevronRight, Layers, Eye,
  RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import { WorldLocation } from '../../types/project';
import { generateWorldLocations } from '../../services/aiService';

export const WorldScreen: React.FC = () => {
  const { currentProject, updateCurrentProject, nextStep } = useProject();
  const world = currentProject.world;

  const locations = world?.locations || [];
  const [selectedLocId, setSelectedLocId] = useState<string>(locations[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const selectedLocation = locations.find(l => l.id === selectedLocId) || locations[0] || null;

  const handleGenerateLocations = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const generated = await generateWorldLocations(currentProject);
      updateCurrentProject(prev => ({
        ...prev,
        world: {
          ...prev.world,
          locations: generated
        },
        pilotMetrics: {
          ...prev.pilotMetrics,
          totalAiRuns: (prev.pilotMetrics?.totalAiRuns || 0) + 1
        }
      }));
      if (generated.length > 0) {
        setSelectedLocId(generated[0].id);
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Failed to synthesize world locations.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Banner / Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="linea-caption-chip">
              Pipeline Step 07
            </span>
            <span className="text-xs text-stone-400">• Spatial & Environmental Worldbuilding</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-[#fbf8f3] flex items-center gap-3">
            Story World & Geography
          </h1>
          <p className="text-sm text-stone-400 mt-1 max-w-2xl">
            {world.era || 'Era in development'} • {world.settingType || 'Atmospheric setting'}. Physical geography and environmental stakes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateLocations}
            disabled={isGenerating}
            className="linea-pill-btn linea-pill-primary px-4 py-2 text-xs font-bold gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing Locations...' : 'Synthesize Locations (AI)'}</span>
            {isGenerating && (
              <span className="linea-btn-wave ml-1" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            )}
          </button>

          <button
            onClick={nextStep}
            className="linea-pill-btn linea-pill-primary px-5 py-2 text-xs font-bold gap-2"
          >
            <span>Next: Narrative Structure</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error alert banner */}
      {generationError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{generationError}</span>
          </div>
          <button onClick={() => setGenerationError(null)} className="text-stone-400 hover:text-white">✕</button>
        </div>
      )}

      {/* World Identity Summary Cards (Linea Bento Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="linea-bento p-5 rounded-3xl">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-mono">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>ERA & TIMELINE</span>
          </div>
          <div className="text-base font-bold text-[#fbf8f3] mt-1.5">{world.era || 'Present Day'}</div>
          <div className="text-xs text-stone-400 mt-1 leading-relaxed">High-stakes active narrative window</div>
        </div>

        <div className="linea-bento p-5 rounded-3xl">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-mono">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENVIRONMENTAL PRESSURE</span>
          </div>
          <div className="text-base font-bold text-[#fbf8f3] mt-1.5">{world.settingType || 'Atmospheric Realistic'}</div>
          <div className="text-xs text-stone-400 mt-1 leading-relaxed">Environmental forces shape plot friction</div>
        </div>

        <div className="linea-bento p-5 rounded-3xl">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-mono">
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span>INSTITUTIONAL PRESSURE</span>
          </div>
          <div className="text-base font-bold text-[#fbf8f3] mt-1.5">{world.institutions ? 'Institutional Grid' : 'Pending Canon'}</div>
          <div className="text-xs text-stone-400 mt-1 leading-relaxed">{world.institutions || 'Jurisdictions and institutional boundaries'}</div>
        </div>

        <div className="linea-bento p-5 rounded-3xl">
          <div className="flex items-center gap-2 text-stone-500 text-xs font-mono">
            <Camera className="w-3.5 h-3.5 text-purple-400" />
            <span>VISUAL PALETTE</span>
          </div>
          <div className="text-base font-bold text-[#fbf8f3] mt-1.5">Cinematic Lighting</div>
          <div className="text-xs text-stone-400 mt-1 leading-relaxed">Grounded textures and environmental friction</div>
        </div>
      </div>

      {/* World Map & Location Explorer */}
      {locations.length === 0 ? (
        <div className="p-12 text-center linea-bento rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-[0_2px_12px_rgba(245,158,11,0.15)]">
            <Globe className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-[#fbf8f3]">No World Locations Mapped Yet</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Synthesize 4 primary dramatic locations and geographic tension points derived from <span className="text-amber-300">"{currentProject.title}"</span>.
            </p>
          </div>
          <button
            onClick={handleGenerateLocations}
            disabled={isGenerating}
            className="linea-pill-btn linea-pill-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>{isGenerating ? 'Synthesizing Locations...' : 'Synthesize World Locations (AI)'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Interactive Stylized World Map (7 cols) */}
          <div className="xl:col-span-7 linea-bento rounded-3xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#0c0f17]">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3] font-mono">Geographic Tension Matrix</span>
              </div>
              <span className="linea-caption-chip">{locations.length} Mapped Environments</span>
            </div>

            {/* Map Visual with Pins */}
            <div className="relative h-[380px] bg-[#07090e] overflow-hidden flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-[radial-gradient(#27273a_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
              
              {/* Ambient Rain / Grid Graphic */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-[#07090e]/60 pointer-events-none" />

              {/* Stylized Contour Lines SVG */}
              <svg className="absolute inset-0 w-full h-full opacity-20 stroke-amber-400/40 fill-none" viewBox="0 0 600 400">
                <path d="M 50 150 Q 200 80 400 200 T 580 300" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M 80 220 Q 250 180 450 320" strokeWidth="1" />
                <path d="M 30 100 Q 300 50 550 180" strokeWidth="0.8" />
                <circle cx="280" cy="180" r="70" stroke="rgba(245,158,11,0.2)" strokeWidth="1" />
              </svg>

              {/* Interactive Pins */}
              {locations.map(loc => {
                const isSelected = loc.id === selectedLocId;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocId(loc.id)}
                    style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  >
                    <div className="relative flex flex-col items-center">
                      {/* Ripple ring when selected */}
                      {isSelected && (
                        <span className="absolute -inset-2 rounded-full bg-amber-400/30 animate-ping" />
                      )}
                      
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                        isSelected
                          ? 'bg-amber-400 text-black ring-4 ring-amber-400/30 scale-110 shadow-lg'
                          : 'bg-[#1e2230] text-amber-400 border border-white/20 group-hover:scale-105'
                      }`}>
                        <MapPin className="w-4 h-4 fill-current" />
                      </div>

                      <span className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight shadow-lg whitespace-nowrap transition-all font-mono ${
                        isSelected
                          ? 'bg-amber-400 text-black'
                          : 'bg-black/90 text-[#fbf8f3] border border-white/10 group-hover:border-amber-400/40'
                      }`}>
                        {loc.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Location selector horizontal bar */}
            <div className="p-3 bg-[#0a0c12] border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-2">
              {locations.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocId(loc.id)}
                  className={`p-2.5 rounded-2xl text-left transition-all border ${
                    loc.id === selectedLocId
                      ? 'bg-[#181d2a] border-amber-400/80 text-amber-300 shadow-sm'
                      : 'bg-[#121622] border-white/[0.04] text-stone-400 hover:text-white hover:bg-[#161a28]'
                  }`}
                >
                  <div className="text-xs font-bold truncate">{loc.name}</div>
                  <div className="text-[10px] opacity-70 truncate font-mono">{loc.type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Location Deep Dossier (5 cols) */}
          <div className="xl:col-span-5 linea-bento rounded-3xl overflow-hidden flex flex-col">
            {selectedLocation ? (
              <>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={selectedLocation.imageUrl}
                    alt={selectedLocation.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0d1017] via-[#0d1017]/40 to-transparent" />
                  
                  <div className="absolute top-3 left-3">
                    <span className="linea-caption-chip">
                      {selectedLocation.type} Environment
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-bold font-serif text-[#fbf8f3]">{selectedLocation.name}</h3>
                    <p className="text-xs text-stone-300 font-mono mt-0.5">{selectedLocation.subtitle}</p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-mono">Setting Description</span>
                    <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                      {selectedLocation.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                    <div className="p-3.5 rounded-2xl bg-[#0a0c12] border border-white/5">
                      <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider font-mono">Atmospheric & Rigging Note</span>
                      <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                        High visual contrast with environmental lighting and practical camera angles.
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                      <span>Coordinates:</span>
                      <span className="text-[#fbf8f3] font-medium">{selectedLocation.coordinates.x}°N, {selectedLocation.coordinates.y}°E</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
                    <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium font-mono">
                      <ShieldCheck className="w-4 h-4" /> Recce Verified
                    </span>
                    <span className="linea-caption-chip">
                      Primary Narrative Hub
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-stone-500">Select a location to view details.</div>
            )}
          </div>
        </div>
      )}

      {/* World Societal & Institutional Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/[0.08]">
        <div className="linea-bento p-6 rounded-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">Socio-Political Landscape</span>
          <p className="text-xs text-stone-300 leading-relaxed">
            {world.socioPolitical || 'Social hierarchies and political friction established through Story Brain canon.'}
          </p>
        </div>

        <div className="linea-bento p-6 rounded-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">Culture & Everyday Realities</span>
          <p className="text-xs text-stone-300 leading-relaxed">
            {world.cultureLifestyle || 'Everyday life, customs, and survival mechanisms governing character behavior.'}
          </p>
        </div>

        <div className="linea-bento p-6 rounded-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">Institutional Governance</span>
          <p className="text-xs text-stone-300 leading-relaxed">
            {world.institutions || 'Legal, corporate, or ruling bodies exerting power and shaping conflict.'}
          </p>
        </div>
      </div>
    </div>
  );
};
