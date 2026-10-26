import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, MapPin, Search, ExternalLink, Plus, Navigation, 
  Layers, Compass, Check, AlertCircle, Sparkles, Mountain,
  Waves, Building2, Trees, Crosshair
} from 'lucide-react';
import { WorldLocation } from '../../types/project';
import { searchGooglePlaces, GooglePlaceResult } from '../../services/googlePlacesService';

interface GoogleStoryMapProps {
  locations: WorldLocation[];
  selectedLocation: WorldLocation | null;
  onSelectLocation: (locId: string) => void;
  onAddLocation: (loc: WorldLocation) => void;
  projectTitle: string;
}

export const GoogleStoryMap: React.FC<GoogleStoryMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onAddLocation,
  projectTitle
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GooglePlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapMode, setMapMode] = useState<'cinematic' | 'satellite' | 'terrain'>('cinematic');
  const [zoomLevel, setZoomLevel] = useState(12);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Default coordinate center (fallback to India or selected location)
  const activeLat = selectedLocation?.geoCoordinates?.lat ?? 18.922;
  const activeLng = selectedLocation?.geoCoordinates?.lng ?? 72.834;

  // Handle Google Places Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchGooglePlaces(searchQuery);
        setSearchResults(results);
      } catch (e: any) {
        setSearchError('Unable to query Google Places API.');
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddPlaceAsLocation = (place: GooglePlaceResult) => {
    const isPrimary = locations.length === 0;
    const newLoc: WorldLocation = {
      id: `loc-google-${Date.now()}`,
      name: place.name,
      subtitle: place.formattedAddress.split(',').slice(0, 2).join(', '),
      description: place.editorialSummary || `Dramatic location anchored to ${place.name} (${place.formattedAddress}).`,
      type: place.types.includes('natural_feature') || place.types.includes('park')
        ? 'Mountain'
        : place.types.includes('coastal') || place.name.toLowerCase().includes('beach') || place.name.toLowerCase().includes('port')
        ? 'Coastal'
        : 'Urban',
      coordinates: {
        x: Math.round(15 + Math.random() * 70),
        y: Math.round(20 + Math.random() * 60)
      },
      imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
      isPrimary,
      geoCoordinates: {
        lat: place.latitude,
        lng: place.longitude
      },
      formattedAddress: place.formattedAddress,
      editorialSummary: place.editorialSummary,
      googleMapsUrl: place.googleMapsUrl
    };

    onAddLocation(newLoc);
    onSelectLocation(newLoc.id);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Calculate distance between two GPS coordinates using Haversine formula
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const primaryLoc = locations.find(l => l.isPrimary) || locations[0];

  return (
    <div className="linea-bento rounded-3xl overflow-hidden flex flex-col border border-white/[0.08] bg-[#0c0f17]">
      {/* Top Header Bar with Google Integration Badge */}
      <div className="p-4 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3 bg-[#080a10]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.15)]">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#fbf8f3] font-mono">
                Google Story World & Geography
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-tight bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Google Places Connected
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Grounded real-world coordinates, terrain scouting & dramatic proximity analysis
            </p>
          </div>
        </div>

        {/* Map Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#121622] rounded-2xl border border-white/[0.06]">
          <button
            onClick={() => setMapMode('cinematic')}
            className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition-all ${
              mapMode === 'cinematic'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Cinematic Dark
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition-all ${
              mapMode === 'satellite'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Satellite Scouting
          </button>
          <button
            onClick={() => setMapMode('terrain')}
            className={`px-3 py-1 rounded-xl text-[10px] font-mono font-bold transition-all ${
              mapMode === 'terrain'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Topographic
          </button>
        </div>
      </div>

      {/* Real-Time Google Places Search Input */}
      <div className="p-3 bg-[#0a0c13] border-b border-white/[0.06] relative">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search real-world cities, landmarks, fortresses, docks via Google Places (e.g. Gateway of India, Colaba, Konkan)..."
            className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-[#141926] border border-white/[0.08] text-xs text-[#fbf8f3] placeholder-stone-500 focus:outline-none focus:border-amber-400/60 transition-all font-mono"
          />
          {isSearching && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Searching Google...
            </div>
          )}
        </div>

        {/* Google Places Autocomplete Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-3 right-3 top-full mt-2 z-50 bg-[#10141f] border border-amber-400/30 rounded-2xl shadow-2xl p-2 space-y-1 max-h-[320px] overflow-y-auto">
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold border-b border-white/[0.06]">
              Google Places Verified Findings ({searchResults.length})
            </div>
            {searchResults.map(result => (
              <div
                key={result.id}
                className="p-2.5 rounded-xl hover:bg-[#1a2133] transition-all flex items-start justify-between gap-3 group"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-bold text-[#fbf8f3] flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="truncate">{result.name}</span>
                  </div>
                  <div className="text-[11px] text-stone-400 truncate pl-5">
                    {result.formattedAddress}
                  </div>
                  {result.editorialSummary && (
                    <div className="text-[10px] text-stone-400 line-clamp-1 italic pl-5">
                      "{result.editorialSummary}"
                    </div>
                  )}
                  <div className="text-[9px] font-mono text-amber-400/80 pl-5">
                    GPS: {result.latitude.toFixed(4)}° N, {result.longitude.toFixed(4)}° E
                  </div>
                </div>

                <button
                  onClick={() => handleAddPlaceAsLocation(result)}
                  className="linea-pill-btn linea-pill-primary px-3 py-1.5 text-[10px] font-bold flex-shrink-0 gap-1.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Location</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative h-[440px] bg-[#07090e] overflow-hidden flex items-center justify-center">
        {/* Layer Background according to Mode */}
        {mapMode === 'cinematic' && (
          <div className="absolute inset-0 bg-[#07090e]">
            {/* Dark Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#27273a_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-[#07090e]/70 pointer-events-none" />
            {/* Atmospheric Contour Vectors */}
            <svg className="absolute inset-0 w-full h-full opacity-25 stroke-amber-400/40 fill-none" viewBox="0 0 800 500">
              <path d="M 50 180 Q 250 90 500 240 T 750 350" strokeWidth="1.5" strokeDasharray="6 4" />
              <path d="M 80 280 Q 320 210 580 390" strokeWidth="1" />
              <path d="M 30 120 Q 380 60 700 210" strokeWidth="0.8" />
              <circle cx="380" cy="240" r="110" stroke="rgba(245,158,11,0.2)" strokeWidth="1.2" strokeDasharray="3 3" />
              <circle cx="380" cy="240" r="180" stroke="rgba(245,158,11,0.1)" strokeWidth="0.8" />
            </svg>
          </div>
        )}

        {mapMode === 'satellite' && (
          <div className="absolute inset-0 bg-[#040810]">
            {/* Deep Satellite Simulation Texture */}
            <div 
              className="absolute inset-0 opacity-60 bg-cover bg-center filter saturate-150 contrast-125"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1600&auto=format&fit=crop")'
              }}
            />
            <div className="absolute inset-0 bg-[#07090e]/60" />
            {/* Radar Sweep Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#07090e_90%)]" />
          </div>
        )}

        {mapMode === 'terrain' && (
          <div className="absolute inset-0 bg-[#0a0d14]">
            {/* Topographic Lines Overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-35 stroke-cyan-400/40 fill-none" viewBox="0 0 800 500">
              <path d="M 0 100 C 150 120, 250 80, 400 120 C 550 160, 650 110, 800 150" strokeWidth="1" />
              <path d="M 0 160 C 150 180, 250 140, 400 180 C 550 220, 650 170, 800 210" strokeWidth="1.2" />
              <path d="M 0 220 C 150 240, 250 200, 400 240 C 550 280, 650 230, 800 270" strokeWidth="1.4" />
              <path d="M 0 280 C 150 300, 250 260, 400 300 C 550 340, 650 290, 800 330" strokeWidth="1" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090e] via-transparent to-[#07090e]/70 pointer-events-none" />
          </div>
        )}

        {/* Real Location Pins Positioned on Matrix */}
        {locations.map((loc, idx) => {
          const isSelected = selectedLocation?.id === loc.id;
          const xPercent = loc.coordinates.x;
          const yPercent = loc.coordinates.y;

          return (
            <div
              key={loc.id}
              onClick={() => onSelectLocation(loc.id)}
              style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            >
              <div className="relative flex flex-col items-center">
                {/* Ripple ring for active selection */}
                {isSelected && (
                  <span className="absolute -inset-3 rounded-full bg-amber-400/30 animate-ping" />
                )}

                {/* Primary Nexus Badge */}
                {loc.isPrimary && (
                  <span className="mb-1 px-1.5 py-0.2 rounded-full text-[8px] font-mono font-bold tracking-tight bg-amber-400 text-black shadow-md">
                    PRIMARY NEXUS
                  </span>
                )}

                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isSelected
                    ? 'bg-amber-400 text-black ring-4 ring-amber-400/30 scale-110 shadow-[0_0_20px_rgba(251,191,36,0.5)] rotate-3'
                    : 'bg-[#151928] text-amber-300 border border-white/20 group-hover:scale-105 group-hover:border-amber-400/50'
                }`}>
                  {loc.type === 'Coastal' ? (
                    <Waves className="w-4 h-4 fill-current" />
                  ) : loc.type === 'Mountain' ? (
                    <Mountain className="w-4 h-4 fill-current" />
                  ) : (
                    <Building2 className="w-4 h-4 fill-current" />
                  )}
                </div>

                <div className={`mt-1.5 px-3 py-1 rounded-xl text-[10px] font-bold tracking-tight shadow-xl whitespace-nowrap transition-all font-mono border ${
                  isSelected
                    ? 'bg-amber-400 text-black border-amber-300 shadow-amber-400/20'
                    : 'bg-black/90 text-[#fbf8f3] border-white/10 group-hover:border-amber-400/50'
                }`}>
                  {loc.name}
                </div>

                {/* GPS Coordinate Tag */}
                {loc.geoCoordinates && (
                  <div className="text-[8px] font-mono text-stone-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-1.5 py-0.5 rounded">
                    {loc.geoCoordinates.lat.toFixed(3)}°, {loc.geoCoordinates.lng.toFixed(3)}°
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Map Telemetry Badges (Bottom Overlay) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/[0.08] text-[10px] font-mono text-[#fbf8f3]">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>CENTER: {activeLat.toFixed(4)}° N, {activeLng.toFixed(4)}° E</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-400">{locations.length} LOCATIONS</span>
          </div>

          {selectedLocation?.googleMapsUrl && (
            <a
              href={selectedLocation.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto linea-pill-btn linea-pill-primary px-3 py-1.5 text-[10px] font-bold gap-1.5 shadow-lg"
            >
              <span>Explore in Google Maps 3D</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Horizontal Carousel of Locations with Distance to Primary Nexus */}
      <div className="p-3 bg-[#080a10] border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-2">
        {locations.map(loc => {
          const isSelected = selectedLocation?.id === loc.id;
          const distKm = primaryLoc && primaryLoc.geoCoordinates && loc.geoCoordinates && primaryLoc.id !== loc.id
            ? calculateDistanceKm(
                primaryLoc.geoCoordinates.lat,
                primaryLoc.geoCoordinates.lng,
                loc.geoCoordinates.lat,
                loc.geoCoordinates.lng
              )
            : null;

          return (
            <button
              key={loc.id}
              onClick={() => onSelectLocation(loc.id)}
              className={`p-2.5 rounded-2xl text-left transition-all border ${
                isSelected
                  ? 'bg-[#181d2a] border-amber-400/80 text-amber-300 shadow-sm'
                  : 'bg-[#121622] border-white/[0.04] text-stone-400 hover:text-white hover:bg-[#161a28]'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold truncate text-[#fbf8f3]">{loc.name}</span>
                {loc.isPrimary && (
                  <span className="text-[8px] font-mono font-bold bg-amber-400/20 text-amber-300 px-1 rounded">
                    NEXUS
                  </span>
                )}
              </div>
              <div className="text-[10px] text-stone-400 truncate font-mono mt-0.5">
                {loc.type} • {loc.subtitle || 'Environment'}
              </div>
              {distKm && (
                <div className="text-[9px] font-mono text-cyan-400/80 mt-1 flex items-center gap-1">
                  <Navigation className="w-2.5 h-2.5" />
                  <span>{distKm} km from Nexus</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
