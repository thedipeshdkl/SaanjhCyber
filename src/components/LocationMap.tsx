import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, Loader2 } from "lucide-react";

// Fix leaflet default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface LocationMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (lat: number, lng: number) => void;
  onDetectCurrentLocation: () => void;
  isDetecting: boolean;
}

export default function LocationMap({
  latitude,
  longitude,
  onLocationSelect,
  onDetectCurrentLocation,
  isDetecting,
}: LocationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default center: Nepal
  const defaultCenter: [number, number] = [27.7172, 85.324];

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: latitude && longitude ? [latitude, longitude] : defaultCenter,
      zoom: latitude && longitude ? 14 : 7,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Click handler
    map.on("click", (e: L.LeafletMouseEvent) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Only run once on mount

  // Update marker and fly to location when coordinates change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (latitude && longitude) {
      // Remove existing marker
      if (markerRef.current) {
        markerRef.current.remove();
      }
      // Add new marker
      markerRef.current = L.marker([latitude, longitude]).addTo(map);
      // Fly to location
      map.flyTo([latitude, longitude], 14, { duration: 1.5 });
    } else {
      // Remove marker if no coordinates
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [latitude, longitude]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-200">
      <div ref={containerRef} style={{ height: "280px", width: "100%" }} />

      {/* Locate Me button overlaid on map */}
      <div className="absolute top-2 right-2 z-[1000]">
        <button
          type="button"
          onClick={onDetectCurrentLocation}
          disabled={isDetecting}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg shadow-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Detect my current location"
        >
          {isDetecting ? (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--prayer-crimson)]" />
          ) : (
            <Navigation className="w-4 h-4 text-[var(--prayer-crimson)]" />
          )}
          {isDetecting ? "Detecting..." : "Locate Me"}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center py-1.5 bg-gray-50">
        Click on the map to select location or use &quot;Locate Me&quot;
      </p>
    </div>
  );
}
