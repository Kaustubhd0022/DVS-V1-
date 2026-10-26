/**
 * Google Places & Geographic Intelligence Service
 * Powered by Google Places API (New) & Google Maps Platform
 */

export interface GooglePlaceResult {
  id: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  types: string[];
  editorialSummary?: string;
  googleMapsUrl: string;
}

const getGoogleApiKey = (): string => {
  return (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_GOOGLE_MAPS_API_KEY) ||
    'AIzaSyDM-P7dfv8hZ7Tb6Jhe36XtlqeNzUjsuiw'
  );
};

/**
 * Searches real-world locations via Google Places API (New)
 */
export const searchGooglePlaces = async (query: string): Promise<GooglePlaceResult[]> => {
  if (!query || query.trim().length === 0) return [];
  const apiKey = getGoogleApiKey();

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.types,places.editorialSummary'
      },
      body: JSON.stringify({
        textQuery: query,
        maxResultCount: 6
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Google Places] Search failed (${res.status}):`, errText);
      return [];
    }

    const data = await res.json();
    const places = data.places || [];

    return places.map((p: any, idx: number) => {
      const name = p.displayName?.text || query;
      const lat = p.location?.latitude || 0;
      const lng = p.location?.longitude || 0;
      return {
        id: `gp-${Date.now()}-${idx}`,
        name,
        formattedAddress: p.formattedAddress || name,
        latitude: lat,
        longitude: lng,
        types: p.types || [],
        editorialSummary: p.editorialSummary?.text || '',
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}+${lat},${lng}`
      };
    });
  } catch (err) {
    console.warn('[Google Places] Network error:', err);
    return [];
  }
};

/**
 * Geocodes a story location name to get exact real-world GPS coordinates and background
 */
export const geocodeStoryLocation = async (
  locationName: string,
  contextEraOrRegion?: string
): Promise<GooglePlaceResult | null> => {
  const query = contextEraOrRegion ? `${locationName} ${contextEraOrRegion}` : locationName;
  const results = await searchGooglePlaces(query);
  if (results.length > 0) {
    return results[0];
  }
  // Try fallback with just the base name if compounded query had no results
  if (contextEraOrRegion) {
    const fallbackResults = await searchGooglePlaces(locationName);
    return fallbackResults[0] || null;
  }
  return null;
};
