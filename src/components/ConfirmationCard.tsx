import { MapPin, RefreshCw } from "lucide-react";
import type { DetectedLocation } from "./LocationDetector";

export interface ConfirmationCardProps {
  location: DetectedLocation;
  onEditManually: () => void;
  onDetectAgain: () => void;
}

export default function ConfirmationCard({
  location,
  onEditManually,
  onDetectAgain,
}: ConfirmationCardProps) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">Location Detected</p>
          <div className="mt-2 space-y-1 text-sm text-green-700">
            <p>
              <span className="font-medium">Province:</span> {location.province}
            </p>
            <p>
              <span className="font-medium">District:</span> {location.district}
            </p>
            <p>
              <span className="font-medium">Municipality:</span>{" "}
              {location.municipality || (
                <span className="text-amber-600 italic">Select manually</span>
              )}
            </p>
          </div>
          <p className="mt-2 text-xs text-green-600">
            Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onEditManually}
          className="flex-1 px-3 py-2 text-sm font-medium text-[var(--thamel-gray)] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Edit Manually
        </button>
        <button
          type="button"
          onClick={onDetectAgain}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-[var(--prayer-crimson)] bg-white border border-[var(--prayer-crimson)]/20 rounded-lg hover:bg-[var(--prayer-crimson)]/5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Detect Again
        </button>
      </div>
    </div>
  );
}
