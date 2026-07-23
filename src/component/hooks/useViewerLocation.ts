import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001/api/locations';

interface Viewer {
  lat: number;
  lon: number;
  id: string;
}

/**
 * Custom hook that immediately collects the visitor's location on mount
 * using multiple strategies for maximum accuracy:
 *
 * 1. Browser Geolocation API (most accurate — GPS/WiFi-based)
 * 2. Fallback: ip-api.com (free, no key, good accuracy)
 * 3. Fallback: ipapi.co (secondary IP fallback)
 * 4. Last resort: hardcoded Kolkata coords
 *
 * Also fetches & saves all viewer locations from the Express DB.
 */
export function useViewerLocation() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationReady, setLocationReady] = useState(false);

  // ─── Save location to local DB ───
  const saveLocation = useCallback(async (lat: number, lon: number) => {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon }),
      });
      const data = await res.json();
      if (data.success && data.viewers) {
        setViewers(data.viewers);
      }
    } catch (err) {
      console.warn('[LocationHook] Could not save to DB:', err);
    }
  }, []);

  // ─── Fetch existing viewers from DB ───
  const fetchViewers = useCallback(async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      if (Array.isArray(data)) setViewers(data);
    } catch (err) {
      console.warn('[LocationHook] Could not fetch viewers:', err);
    }
  }, []);

  // ─── IP-based geolocation fallbacks ───
  const ipFallback = useCallback(async (): Promise<{ lat: number; lon: number } | null> => {
    // Strategy 1: ip-api.com (very reliable, good accuracy)
    try {
      const res = await fetch('http://ip-api.com/json/?fields=lat,lon,status');
      const data = await res.json();
      if (data.status === 'success' && data.lat && data.lon) {
        console.log('[LocationHook] Got location from ip-api.com');
        return { lat: data.lat, lon: data.lon };
      }
    } catch { /* try next */ }

    // Strategy 2: ipapi.co
    try {
      const res = await fetch('https://ipapi.co/json/');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        console.log('[LocationHook] Got location from ipapi.co');
        return { lat: data.latitude, lon: data.longitude };
      }
    } catch { /* try next */ }

    // Strategy 3: geojs.io
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      const data = await res.json();
      if (data.latitude && data.longitude) {
        console.log('[LocationHook] Got location from geojs.io');
        return { lat: parseFloat(data.latitude), lon: parseFloat(data.longitude) };
      }
    } catch { /* give up */ }

    return null;
  }, []);

  // ─── Main location collection — runs ONCE on mount ───
  useEffect(() => {
    let cancelled = false;

    const collectLocation = async () => {
      // First, fetch existing viewers immediately
      await fetchViewers();

      let resolved = false;

      // Try browser geolocation first (most accurate)
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            });
          });

          if (!cancelled) {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            console.log(`[LocationHook] Browser geolocation: ${lat}, ${lon}`);
            setUserLocation({ lat, lon });
            setLocationError(null);
            setLocationReady(true);
            await saveLocation(lat, lon);
            resolved = true;
          }
        } catch (err) {
          console.warn('[LocationHook] Browser geolocation denied/failed:', err);
        }
      }

      // If browser geolocation failed, try IP-based fallbacks
      if (!resolved && !cancelled) {
        const ipLoc = await ipFallback();
        if (ipLoc && !cancelled) {
          setUserLocation(ipLoc);
          setLocationError(null);
          setLocationReady(true);
          await saveLocation(ipLoc.lat, ipLoc.lon);
          resolved = true;
        }
      }

      // Last resort hardcoded fallback
      if (!resolved && !cancelled) {
        console.warn('[LocationHook] All location methods failed, using Kolkata fallback');
        setUserLocation({ lat: 22.5726, lon: 88.3639 });
        setLocationError('Using approximate location');
        setLocationReady(true);
        await saveLocation(22.5726, 88.3639);
      }
    };

    collectLocation();

    return () => {
      cancelled = true;
    };
  }, [fetchViewers, saveLocation, ipFallback]);

  return { userLocation, viewers, locationError, locationReady };
}
