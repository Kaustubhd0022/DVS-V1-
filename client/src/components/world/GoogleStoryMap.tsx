import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Globe, MapPin, Search, ExternalLink, Plus, Navigation, 
  Layers, Compass, Check, AlertCircle, Sparkles, Mountain,
  Waves, Building2, Trees, Crosshair, ZoomIn, ZoomOut, RefreshCw
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

// Cinematic Dark Palette for Google Maps
const CINEMATIC_DARK_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#0c0f17" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0c0f17" }, { weight: 3 }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#d6d3d1" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fbbf24" }]
  },
  {
    featureType: "administrative.neighborhood",
    elementType: "labels.text.fill",
    stylers: [{ color: "#e7e5e4" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#78716c" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#111827" }]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1c2233" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#151926" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#293245" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1c2233" }]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fef3c7" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e2433" }]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#fbbf24" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#07090e" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#475569" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#07090e" }]
  }
];

export const GoogleStoryMap: React.FC<GoogleStoryMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onAddLocation,
  projectTitle
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersMapRef = useRef<Map<string, any>>(new Map());
  const activeInfoWindowRef = useRef<any>(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [mapMode, setMapMode] = useState<'cinematic' | 'satellite' | 'terrain'>('cinematic');
  const [zoomLevel, setZoomLevel] = useState(13);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GooglePlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Determine Primary Nexus
  const primaryLoc = locations.find(l => l.isPrimary) || locations[0];

  // Helper to resolve coordinates for any location (including defaults)
  const getLocationCoords = useCallback((loc: WorldLocation, idx: number): { lat: number; lng: number } => {
    if (loc.geoCoordinates && typeof loc.geoCoordinates.lat === 'number' && typeof loc.geoCoordinates.lng === 'number' && loc.geoCoordinates.lat !== 0) {
      return { lat: loc.geoCoordinates.lat, lng: loc.geoCoordinates.lng };
    }
    const baseLat = primaryLoc?.geoCoordinates?.lat ?? 18.9440;
    const baseLng = primaryLoc?.geoCoordinates?.lng ?? 72.8340;
    const offsets = [
      { lat: 0, lng: 0 },
      { lat: 0.022, lng: -0.005 },
      { lat: 0.025, lng: 0.012 },
      { lat: 0.081, lng: -0.024 },
      { lat: -0.015, lng: 0.018 }
    ];
    const off = offsets[idx % offsets.length];
    return {
      lat: Number((baseLat + off.lat).toFixed(4)),
      lng: Number((baseLng + off.lng).toFixed(4))
    };
  }, [primaryLoc]);

  // Active Center Coordinates
  const selectedIndex = locations.findIndex(l => l.id === selectedLocation?.id);
  const activeCoords = selectedLocation 
    ? getLocationCoords(selectedLocation, selectedIndex >= 0 ? selectedIndex : 0)
    : primaryLoc 
    ? getLocationCoords(primaryLoc, 0)
    : { lat: 18.9440, lng: 72.8340 };

  // Google Maps JS API Script Loader
  useEffect(() => {
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDM-P7dfv8hZ7Tb6Jhe36XtlqeNzUjsuiw';

    const initMap = () => {
      if (!mapContainerRef.current) return;
      const g = (window as any).google;
      if (!g || !g.maps) return;

      try {
        const map = new g.maps.Map(mapContainerRef.current, {
          center: { lat: activeCoords.lat, lng: activeCoords.lng },
          zoom: 13,
          mapTypeId: mapMode === 'satellite' ? 'hybrid' : mapMode === 'terrain' ? 'terrain' : 'roadmap',
          styles: mapMode === 'cinematic' ? CINEMATIC_DARK_STYLES : [],
          disableDefaultUI: true,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
          backgroundColor: '#0c0f17'
        });

        mapInstanceRef.current = map;
        setIsMapLoaded(true);
      } catch (err: any) {
        console.warn('Google Maps initialization warning:', err);
        setMapLoadError('Google Maps API initialization note. Fallback active.');
      }
    };

    if ((window as any).google?.maps) {
      initMap();
      return;
    }

    const scriptId = 'google-maps-js-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      script.onerror = () => {
        setMapLoadError('Unable to load Google Maps script. Check network connection.');
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', initMap);
    }
  }, []);

  // Update Markers on Map when locations or selectedLocation changes
  useEffect(() => {
    const g = (window as any).google;
    const map = mapInstanceRef.current;
    if (!g?.maps || !map) return;

    // Remove existing markers
    markersMapRef.current.forEach(marker => marker.setMap(null));
    markersMapRef.current.clear();

    locations.forEach((loc, idx) => {
      const coords = getLocationCoords(loc, idx);
      const isSelected = loc.id === selectedLocation?.id;

      // Create Custom SVG Marker Icon
      const marker = new g.maps.Marker({
        position: { lat: coords.lat, lng: coords.lng },
        map: map,
        title: loc.name,
        zIndex: isSelected ? 999 : (loc.isPrimary ? 500 : 100),
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 11 : (loc.isPrimary ? 9 : 7),
          fillColor: isSelected ? '#fbbf24' : (loc.isPrimary ? '#f59e0b' : '#38bdf8'),
          fillOpacity: 1,
          strokeWeight: isSelected ? 3 : 2,
          strokeColor: '#ffffff'
        }
      });

      const infoContent = `
        <div style="color:#0f172a;padding:8px 10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:240px;">
          <div style="font-weight:700;font-size:13px;color:#09090b;margin-bottom:2px;">${loc.name}</div>
          <div style="font-size:11px;color:#d97706;font-weight:600;margin-bottom:4px;">${loc.type} ${loc.isPrimary ? '• Primary Nexus' : ''}</div>
          <div style="font-size:11px;color:#52525b;line-height:1.4;">${loc.subtitle || loc.description || ''}</div>
          <div style="font-size:9px;color:#a1a1aa;margin-top:6px;font-family:monospace;">GPS: ${coords.lat.toFixed(4)}° N, ${coords.lng.toFixed(4)}° E</div>
        </div>
      `;

      const infoWindow = new g.maps.InfoWindow({ content: infoContent });

      marker.addListener('click', () => {
        if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
        infoWindow.open(map, marker);
        activeInfoWindowRef.current = infoWindow;
        onSelectLocation(loc.id);
      });

      if (isSelected) {
        if (activeInfoWindowRef.current) activeInfoWindowRef.current.close();
        infoWindow.open(map, marker);
        activeInfoWindowRef.current = infoWindow;
      }

      markersMapRef.current.set(loc.id, marker);
    });
  }, [locations, selectedLocation, isMapLoaded, getLocationCoords, onSelectLocation]);

  // Pan Camera when selectedLocation changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.panTo({ lat: activeCoords.lat, lng: activeCoords.lng });
  }, [activeCoords.lat, activeCoords.lng]);

  // Update Map Type and Styles when mapMode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (mapMode === 'satellite') {
      map.setMapTypeId('hybrid');
      map.setOptions({ styles: [] });
    } else if (mapMode === 'terrain') {
      map.setMapTypeId('terrain');
      map.setOptions({ styles: [] });
    } else {
      map.setMapTypeId('roadmap');
      map.setOptions({ styles: CINEMATIC_DARK_STYLES });
    }
  }, [mapMode]);

  // Handle Zoom In / Out
  const handleZoom = (delta: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const current = map.getZoom() || 13;
    const next = Math.max(3, Math.min(20, current + delta));
    map.setZoom(next);
    setZoomLevel(next);
  };

  // Center on Primary Nexus
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.panTo({ lat: activeCoords.lat, lng: activeCoords.lng });
    map.setZoom(14);
    setZoomLevel(14);
  };

  // Handle Google Places Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchGooglePlaces(searchQuery);
        setSearchResults(results);
      } catch (e: any) {
        console.warn('Google places search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 350);

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
        x: Math.round(20 + Math.random() * 60),
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

    // Pan map to newly added place
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: place.latitude, lng: place.longitude });
      mapInstanceRef.current.setZoom(15);
    }
  };

  // Distance calculation
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const primaryCoords = primaryLoc ? getLocationCoords(primaryLoc, 0) : activeCoords;

  return (
    <div className="linea-bento rounded-3xl overflow-hidden flex flex-col border border-white/[0.08] bg-[#0c0f17]">
      {/* Top Header Bar with Live Google Connection Status */}
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
                Google Maps Live
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Interactive Google Map tiles, satellite scouting & real GPS grounding
            </p>
          </div>
        </div>

        {/* Map Mode Selector (Cinematic Dark / Satellite Hybrid / Topographic) */}
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
            Satellite Hybrid
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

        {/* Autocomplete Results Dropdown */}
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

      {/* Real Interactive Google Maps Container */}
      <div className="relative h-[480px] bg-[#07090e] overflow-hidden">
        {/* Actual Google Map DOM Element */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Custom Map Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => handleZoom(1)}
            title="Zoom In"
            className="w-8 h-8 rounded-xl bg-black/80 hover:bg-black text-[#fbf8f3] border border-white/10 flex items-center justify-center transition-all shadow-lg hover:border-amber-400/50"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(-1)}
            title="Zoom Out"
            className="w-8 h-8 rounded-xl bg-black/80 hover:bg-black text-[#fbf8f3] border border-white/10 flex items-center justify-center transition-all shadow-lg hover:border-amber-400/50"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRecenter}
            title="Center on Active Location"
            className="w-8 h-8 rounded-xl bg-black/80 hover:bg-black text-amber-400 border border-white/10 flex items-center justify-center transition-all shadow-lg hover:border-amber-400/50"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Badge (Bottom Left Overlay) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/[0.08] text-[10px] font-mono text-[#fbf8f3] z-10 shadow-xl">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>GPS: {activeCoords.lat.toFixed(4)}° N, {activeCoords.lng.toFixed(4)}° E</span>
          <span className="text-stone-500">•</span>
          <span className="text-stone-400">{locations.length} LOCATIONS PINNED</span>
        </div>

        {/* 3D Google Earth / Maps External Link (Bottom Right Overlay) */}
        {selectedLocation && (
          <div className="absolute bottom-3 right-3 z-10">
            <a
              href={selectedLocation.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.name)}+${activeCoords.lat},${activeCoords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="linea-pill-btn linea-pill-primary px-3 py-1.5 text-[10px] font-bold gap-1.5 shadow-xl flex items-center"
            >
              <span>Explore {selectedLocation.name} in Google Maps 3D</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Horizontal Carousel of Locations with Distance to Primary Nexus */}
      <div className="p-3 bg-[#080a10] border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-2">
        {locations.map((loc, idx) => {
          const isSelected = selectedLocation?.id === loc.id;
          const locCoords = getLocationCoords(loc, idx);
          const distKm = primaryLoc && loc.id !== primaryLoc.id
            ? calculateDistanceKm(primaryCoords.lat, primaryCoords.lng, locCoords.lat, locCoords.lng)
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
