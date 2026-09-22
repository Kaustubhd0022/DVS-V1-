import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { 
  Globe, MapPin, Compass, CloudRain, Building, Camera, 
  ArrowRight, ShieldCheck, ChevronRight, Layers, Eye
} from 'lucide-react';
import { WorldLocation } from '../../types/project';

export const WorldScreen: React.FC = () => {
  const { currentProject, nextStep } = useProject();
  const world = currentProject.world;

  const [selectedLocId, setSelectedLocId] = useState<string>(world.locations[0]?.id || 'loc-1');
  const selectedLocation = world.locations.find(l => l.id === selectedLocId) || world.locations[0];

  return (
    <div className="space-y-8 animate-fadeIn max-w-[1600px] mx-auto pb-16">
      {/* Top Banner / Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              Pipeline Step 07
            </span>
            <span className="text-xs text-white/40">• Spatial & Environmental Worldbuilding</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white flex items-center gap-3">
            Story World & Geography
          </h1>
          <p className="text-sm text-white/60 mt-1 max-w-2xl">
            {world.era} • {world.settingType}. Atmospheric pressure cooker where weather acts as an unrelenting antagonist.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Next: Narrative Structure</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* World Identity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>ERA & TIMELINE</span>
          </div>
          <div className="text-base font-bold text-white mt-1">{world.era}</div>
          <div className="text-xs text-white/60 mt-1">48-Hour High-Alert Monsoon Window</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span>CLIMATE AS ANTAGONIST</span>
          </div>
          <div className="text-base font-bold text-white mt-1">Category 4 Deluge</div>
          <div className="text-xs text-white/60 mt-1">Sustained 240mm/hr rainfall breach risk</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
            <Building className="w-3.5 h-3.5 text-emerald-400" />
            <span>INSTITUTIONAL PRESSURE</span>
          </div>
          <div className="text-base font-bold text-white mt-1">Dual Corridors</div>
          <div className="text-xs text-white/60 mt-1">Delhi Ministries vs Mumbai Field Grid</div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141a]/90 border border-white/10">
          <div className="flex items-center gap-2 text-white/40 text-xs font-mono">
            <Camera className="w-3.5 h-3.5 text-purple-400" />
            <span>VISUAL PALETTE</span>
          </div>
          <div className="text-base font-bold text-white mt-1">Steel Slate & Neon</div>
          <div className="text-xs text-white/60 mt-1">Wet asphalt, amber emergency flares</div>
        </div>
      </div>

      {/* World Map & Location Explorer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Interactive Stylized World Map (7 cols) */}
        <div className="xl:col-span-7 bg-[#12141a]/95 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Geographic Tension Matrix</span>
            </div>
            <span className="text-[11px] font-mono text-white/40">Western Ghats - Mumbai Axis</span>
          </div>

          {/* Map Visual with Pins */}
          <div className="relative h-[380px] bg-[#0c0e14] overflow-hidden flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-[radial-gradient(#27273a_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />
            
            {/* Ambient Rain / Grid Graphic */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e14] via-transparent to-[#0c0e14]/60 pointer-events-none" />

            {/* Stylized Contour Lines SVG */}
            <svg className="absolute inset-0 w-full h-full opacity-20 stroke-amber-400/40 fill-none" viewBox="0 0 600 400">
              <path d="M 50 150 Q 200 80 400 200 T 580 300" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M 80 220 Q 250 180 450 320" strokeWidth="1" />
              <path d="M 30 100 Q 300 50 550 180" strokeWidth="0.8" />
              <circle cx="280" cy="180" r="70" stroke="rgba(245,158,11,0.2)" strokeWidth="1" />
            </svg>

            {/* Interactive Pins */}
            {world.locations.map(loc => {
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
                      <span className="absolute -inset-2 rounded-full bg-amber-500/30 animate-ping" />
                    )}
                    
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                      isSelected
                        ? 'bg-amber-500 text-black ring-4 ring-amber-500/20 scale-110'
                        : 'bg-[#1e2230] text-amber-400 border border-white/20 group-hover:scale-105'
                    }`}>
                      <MapPin className="w-4 h-4 fill-current" />
                    </div>

                    <span className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-tight shadow-lg whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-black'
                        : 'bg-black/80 text-white/80 border border-white/10 group-hover:text-white'
                    }`}>
                      {loc.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Location selector horizontal bar */}
          <div className="p-4 bg-black/50 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {world.locations.map(loc => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocId(loc.id)}
                className={`p-2.5 rounded-lg text-left transition-all border ${
                  loc.id === selectedLocId
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                    : 'bg-white/5 border-transparent text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="text-xs font-bold truncate">{loc.name}</div>
                <div className="text-[10px] opacity-70 truncate">{loc.type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Location Deep Dossier (5 cols) */}
        <div className="xl:col-span-5 bg-[#12141a]/95 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
          <div className="relative h-48 overflow-hidden">
            <img
              src={selectedLocation.imageUrl}
              alt={selectedLocation.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12141a] via-[#12141a]/30 to-transparent" />
            
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/70 text-amber-400 border border-white/10">
                {selectedLocation.type} Environment
              </span>
            </div>

            <div className="absolute bottom-3 left-4 right-4">
              <h3 className="text-xl font-bold font-serif text-white">{selectedLocation.name}</h3>
              <p className="text-xs text-white/70 font-mono mt-0.5">{selectedLocation.subtitle}</p>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Setting Description</span>
              <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
                {selectedLocation.description}
              </p>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/5">
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">Production Rigging Note</span>
                <p className="text-xs text-white/70 mt-1">
                  Requires 4 continuous rain-towers with 10,000L water recyclers and sound-dampened mobile generator units.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-white/50">
                <span>Associated Scenes:</span>
                <span className="text-white font-mono font-medium">Scenes 1, 4, 12, 28 (14 Shoot Days)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4" /> Recce Verified
              </span>
              <button className="text-xs text-amber-400 hover:underline">
                View Moodboard Assets →
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* World Societal & Institutional Context */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-white/10">
        <div className="p-5 rounded-2xl bg-[#12141a]/80 border border-white/5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400/80">Socio-Political Landscape</span>
          <p className="text-xs text-white/70 leading-relaxed">
            {world.socioPolitical}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141a]/80 border border-white/5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400/80">Culture & Everyday Realities</span>
          <p className="text-xs text-white/70 leading-relaxed">
            {world.cultureLifestyle}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12141a]/80 border border-white/5 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400/80">Institutional Governance</span>
          <p className="text-xs text-white/70 leading-relaxed">
            {world.institutions}
          </p>
        </div>
      </div>
    </div>
  );
};
