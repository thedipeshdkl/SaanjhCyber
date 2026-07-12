import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { TRPCError } from "@trpc/server";
import {
  provinces,
  districts,
  municipalities,
  getAllDistricts,
  getProvinceForDistrict,
} from "./nepal-locations";

// Nepal boundary constants
const NEPAL_BOUNDS = {
  lat: { min: 26.3, max: 30.5 },
  lng: { min: 80.0, max: 88.2 },
};

// Nominatim API configuration
const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org/reverse";
const NOMINATIM_TIMEOUT_MS = 5000;
const USER_AGENT = "SCR-App/1.0 (cybercrime-reporting-nepal)";

/**
 * Checks if a number has more than the allowed decimal places.
 */
function exceedsDecimalPlaces(value: number, maxPlaces: number): boolean {
  const str = value.toString();
  const decimalIndex = str.indexOf(".");
  if (decimalIndex === -1) return false;
  // Handle scientific notation
  if (str.includes("e") || str.includes("E")) {
    const fixed = value.toFixed(maxPlaces + 1);
    const fixedDecimalIndex = fixed.indexOf(".");
    if (fixedDecimalIndex === -1) return false;
    const decimalPart = fixed.slice(fixedDecimalIndex + 1);
    // Check if digits beyond maxPlaces are non-zero
    return decimalPart.length > maxPlaces && decimalPart.slice(maxPlaces).split("").some(c => c !== "0");
  }
  const decimalPart = str.slice(decimalIndex + 1);
  return decimalPart.length > maxPlaces;
}

/**
 * Validates that coordinates are within Nepal boundaries.
 */
function isWithinNepal(latitude: number, longitude: number): boolean {
  return (
    latitude >= NEPAL_BOUNDS.lat.min &&
    latitude <= NEPAL_BOUNDS.lat.max &&
    longitude >= NEPAL_BOUNDS.lng.min &&
    longitude <= NEPAL_BOUNDS.lng.max
  );
}

/**
 * Finds the best match for an OSM name in a list of candidates.
 * Priority:
 *  1. Exact match (case-insensitive)
 *  2. Partial/contains match (one string contains the other)
 *  3. First-word match (handles "Bagmati Province" → "Bagmati Pradesh")
 */
export function findBestMatch(osmName: string, candidates: string[]): string | null {
  if (!osmName || candidates.length === 0) return null;

  const osmLower = osmName.toLowerCase().trim();

  // 1. Exact match (case-insensitive)
  const exact = candidates.find(c => c.toLowerCase().trim() === osmLower);
  if (exact) return exact;

  // 2. Partial/contains match: either the candidate contains the OSM name
  // or the OSM name contains the candidate
  const partial = candidates.find(c => {
    const candidateLower = c.toLowerCase().trim();
    return candidateLower.includes(osmLower) || osmLower.includes(candidateLower);
  });
  if (partial) return partial;

  // 3. First significant word match — handles cases like
  // "Bagmati Province" → "Bagmati Pradesh" where the key identifier word matches
  const osmFirstWord = osmLower.split(/\s+/)[0];
  if (osmFirstWord && osmFirstWord.length >= 3) {
    const firstWordMatch = candidates.find(c =>
      c.toLowerCase().trim().split(/\s+/)[0] === osmFirstWord
    );
    if (firstWordMatch) return firstWordMatch;
  }

  return null;
}

/**
 * Maps Nominatim address response to Nepal administrative divisions.
 * Returns { province, district, municipality, latitude, longitude } on success.
 * Throws MATCH_FAILED when province/district cannot be resolved.
 */
function matchLocationFromAddress(
  address: Record<string, string | undefined>,
  latitude: number,
  longitude: number
): { province: string; district: string; municipality: string | null; latitude: number; longitude: number } {
  // Extract relevant fields from Nominatim response
  const osmProvince = address.state || null;
  const osmDistrict = address.state_district || address.county || null;
  const osmMunicipality =
    address.city || address.town || address.village || address.municipality || null;

  // Match province
  let matchedProvince: string | null = null;
  if (osmProvince) {
    matchedProvince = findBestMatch(osmProvince, provinces);
  }

  // Match district - search across all districts
  let matchedDistrict: string | null = null;
  if (osmDistrict) {
    matchedDistrict = findBestMatch(osmDistrict, getAllDistricts());
  }

  // If we matched a district but not a province, infer province from district
  if (matchedDistrict && !matchedProvince) {
    matchedProvince = getProvinceForDistrict(matchedDistrict);
  }

  // If we matched a province but not a district, try matching osmMunicipality against districts
  // (sometimes OSM puts district-level info in city/town fields)
  if (matchedProvince && !matchedDistrict && osmMunicipality) {
    const provinceDistricts = districts[matchedProvince];
    if (provinceDistricts) {
      matchedDistrict = findBestMatch(osmMunicipality, provinceDistricts);
    }
  }

  // If neither province nor district could be resolved, throw MATCH_FAILED
  if (!matchedProvince || !matchedDistrict) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Could not determine your exact location. Please use manual selection.",
    });
  }

  // Match municipality within the matched district
  let matchedMunicipality: string | null = null;
  if (osmMunicipality) {
    const districtMunicipalities = municipalities[matchedDistrict];
    if (districtMunicipalities) {
      matchedMunicipality = findBestMatch(osmMunicipality, districtMunicipalities);
    }
  }

  // If municipality cannot be matched, return null (partial result per spec)
  return {
    province: matchedProvince,
    district: matchedDistrict,
    municipality: matchedMunicipality,
    latitude,
    longitude,
  };
}

export const locationRouter = createRouter({
  reverseGeocode: publicQuery
    .input(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
      })
    )
    .query(async ({ input }) => {
      const { latitude, longitude } = input;

      // Precision validation: max 6 decimal places
      if (exceedsDecimalPlaces(latitude, 6) || exceedsDecimalPlaces(longitude, 6)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid coordinate format. Coordinates must not exceed 6 decimal places.",
        });
      }

      // Nepal boundary validation
      if (!isWithinNepal(latitude, longitude)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Coordinates are outside Nepal boundaries. Please use manual location selection.",
        });
      }

      // Call Nominatim reverse geocoding API with 5-second timeout
      const url = `${NOMINATIM_BASE_URL}?lat=${latitude}&lon=${longitude}&format=jsonv2&addressdetails=1&zoom=10`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), NOMINATIM_TIMEOUT_MS);

      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": USER_AGENT,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Location service is temporarily unavailable. Please try again or use manual selection.",
          });
        }

        const data = await response.json();
        const address = data.address || {};

        // Use fuzzy matching to resolve OSM names to our canonical location data
        return matchLocationFromAddress(address, latitude, longitude);
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error instanceof TRPCError) {
          throw error;
        }

        // Handle abort/timeout errors
        if (error.name === "AbortError" || error.code === "ABORT_ERR") {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Location service is temporarily unavailable. Please try again or use manual selection.",
          });
        }

        // Handle network errors
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Location service is temporarily unavailable. Please try again or use manual selection.",
        });
      }
    }),
});
