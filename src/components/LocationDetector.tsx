import { useState, useEffect, useCallback } from "react";
import { MapPin, Navigation, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { trpc } from "@/providers/trpc";
import ConfirmationCard from "./ConfirmationCard";

export interface DetectedLocation {
  latitude: number;
  longitude: number;
  province: string;
  district: string;
  municipality: string | null;
}

export interface LocationDetectorProps {
  onLocationDetected: (result: DetectedLocation) => void;
  onModeChange: (mode: "manual" | "detect") => void;
  onClearCoordinates: () => void;
  currentMode: "manual" | "detect";
  detectedLocation: DetectedLocation | null;
}

type GeoError =
  | "PERMISSION_DENIED"
  | "TIMEOUT"
  | "POSITION_UNAVAILABLE"
  | "OUTSIDE_NEPAL"
  | "SERVICE_UNAVAILABLE"
  | "MATCH_FAILED"
  | "UNKNOWN";

function getErrorMessage(error: GeoError): string {
  switch (error) {
    case "PERMISSION_DENIED":
      return "Location access denied. Please allow location access in browser settings or use manual selection.";
    case "TIMEOUT":
      return "Location detection failed. Please try again or use manual selection.";
    case "POSITION_UNAVAILABLE":
      return "Location detection failed. Please try again or use manual selection.";
    case "OUTSIDE_NEPAL":
      return "Detected location is outside Nepal. Please use manual selection.";
    case "SERVICE_UNAVAILABLE":
      return "Location service temporarily unavailable. Please try again or use manual selection.";
    case "MATCH_FAILED":
      return "Could not determine your exact location. Please use manual selection.";
    default:
      return "Location detection failed. Please try again or use manual selection.";
  }
}

export default function LocationDetector({
  onLocationDetected,
  onModeChange,
  onClearCoordinates,
  currentMode,
  detectedLocation,
}: LocationDetectorProps) {
  const [isGeolocationSupported, setIsGeolocationSupported] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<GeoError | null>(null);
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(
    null
  );

  // Check Geolocation API support on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setIsGeolocationSupported(false);
      // If detect mode is active but geolocation not supported, switch to manual
      if (currentMode === "detect") {
        onModeChange("manual");
      }
    }
  }, []);

  // Use tRPC query with enabled flag to trigger only when coordinates are available
  const reverseGeocodeQuery = trpc.location.reverseGeocode.useQuery(
    { latitude: coordinates?.latitude ?? 0, longitude: coordinates?.longitude ?? 0 },
    {
      enabled: !!coordinates,
      retry: false,
    }
  );

  // Handle query success/error via useEffect since react-query v5 removed callbacks
  useEffect(() => {
    if (reverseGeocodeQuery.data && coordinates) {
      setIsDetecting(false);
      onLocationDetected(reverseGeocodeQuery.data);
    }
  }, [reverseGeocodeQuery.data]);

  useEffect(() => {
    if (reverseGeocodeQuery.error && coordinates) {
      setIsDetecting(false);
      setCoordinates(null);
      const errMessage = reverseGeocodeQuery.error.message;
      if (errMessage.includes("outside Nepal")) {
        setError("OUTSIDE_NEPAL");
      } else if (errMessage.includes("temporarily unavailable")) {
        setError("SERVICE_UNAVAILABLE");
      } else if (errMessage.includes("Could not determine")) {
        setError("MATCH_FAILED");
      } else {
        setError("UNKNOWN");
      }
    }
  }, [reverseGeocodeQuery.error]);

  const handleDetectLocation = useCallback(() => {
    // Clear previous errors
    setError(null);
    setCoordinates(null);
    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Store coordinates to trigger the reverse geocode query
        setCoordinates({ latitude, longitude });
      },
      (geoError) => {
        setIsDetecting(false);
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError("PERMISSION_DENIED");
            break;
          case geoError.TIMEOUT:
            setError("TIMEOUT");
            break;
          case geoError.POSITION_UNAVAILABLE:
            setError("POSITION_UNAVAILABLE");
            break;
          default:
            setError("UNKNOWN");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  const handleDetectAgain = useCallback(() => {
    setCoordinates(null);
    onClearCoordinates();
    handleDetectLocation();
  }, [handleDetectLocation, onClearCoordinates]);

  // If Geolocation is not supported, don't render the detect option at all
  if (!isGeolocationSupported) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onModeChange("manual")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
            currentMode === "manual"
              ? "border-[var(--prayer-crimson)] bg-[var(--prayer-crimson)]/5 text-[var(--prayer-crimson)]"
              : "border-gray-200 text-[var(--thamel-gray)]/70 hover:border-gray-300"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Manual Selection
        </button>
        <button
          type="button"
          onClick={() => onModeChange("detect")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
            currentMode === "detect"
              ? "border-[var(--prayer-crimson)] bg-[var(--prayer-crimson)]/5 text-[var(--prayer-crimson)]"
              : "border-gray-200 text-[var(--thamel-gray)]/70 hover:border-gray-300"
          }`}
        >
          <Navigation className="w-4 h-4" />
          Detect My Location
        </button>
      </div>

      {/* Detect Mode Content */}
      {currentMode === "detect" && (
        <div className="space-y-4">
          {/* No location detected yet and not loading — show detect button */}
          {!detectedLocation && !isDetecting && !coordinates && (
            <div className="text-center py-6">
              <button
                type="button"
                onClick={handleDetectLocation}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--prayer-crimson)] text-white rounded-lg font-medium hover:bg-[var(--prayer-crimson)]/90 transition-colors"
              >
                <Navigation className="w-5 h-5" />
                Detect My Location
              </button>
              <p className="text-sm text-[var(--thamel-gray)]/60 mt-3">
                We&apos;ll use your device&apos;s GPS to find your location
              </p>
            </div>
          )}

          {/* Loading state */}
          {isDetecting && (
            <div className="flex flex-col items-center py-6 space-y-3">
              <Loader2 className="w-8 h-8 text-[var(--prayer-crimson)] animate-spin" />
              <p className="text-sm font-medium text-[var(--thamel-gray)]">
                Detecting your location...
              </p>
              {/* Show coordinates while reverse geocoding is in progress */}
              {coordinates && (
                <p className="text-xs text-[var(--thamel-gray)]/60">
                  Coordinates: {coordinates.latitude.toFixed(4)},{" "}
                  {coordinates.longitude.toFixed(4)}
                </p>
              )}
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Detecting...
              </button>
            </div>
          )}

          {/* Error state */}
          {error && !isDetecting && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{getErrorMessage(error)}</p>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--prayer-crimson)] hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Card — detected location */}
          {detectedLocation && !isDetecting && (
            <ConfirmationCard
              location={detectedLocation}
              onEditManually={() => onModeChange("manual")}
              onDetectAgain={handleDetectAgain}
            />
          )}
        </div>
      )}
    </div>
  );
}
