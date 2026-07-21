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
 * Known suffixes that Nominatim appends to location names but are not part
 * of the canonical Nepal location identifiers.
 * Ordered longest-first so "sub-metropolitan city" is stripped before "metropolitan city",
 * and "rural municipality" before "municipality".
 */
const KNOWN_SUFFIXES = [
  "sub-metropolitan city",
  "metropolitan city",
  "rural municipality",
  "municipality",
  "district",
  "province",
  "pradesh",
  "zone",
];

/**
 * Normalizes a location name for comparison by:
 *  1. Lowercasing and trimming whitespace
 *  2. Stripping Unicode diacritics (NFD decomposition + combining-mark removal)
 *  3. Removing known administrative suffixes
 *  4. Collapsing multiple spaces to a single space
 *  5. Final trim after suffix removal
 *
 * This is used as a fallback comparison when exact/partial/first-word strategies fail.
 */
export function normalize(name: string): string {
  if (!name) return "";

  // 1. Lowercase and trim
  let result = name.toLowerCase().trim();

  // 2. Strip diacritics via NFD decomposition
  result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 3. Strip known suffixes (longest-first to avoid partial removal)
  for (const suffix of KNOWN_SUFFIXES) {
    if (result.endsWith(suffix)) {
      result = result.slice(0, result.length - suffix.length);
      break; // Only strip one suffix
    }
  }

  // 4. Collapse multiple spaces to single space
  result = result.replace(/\s+/g, " ");

  // 5. Final trim
  result = result.trim();

  return result;
}

/**
 * Maps normalized Nominatim spelling variants to canonical Nepal location names.
 * Used as a fallback when exact, partial, and first-word matching strategies all fail.
 * Keys are the normalized form (lowercase, diacritics stripped, suffixes removed).
 * Values are the exact canonical name as it appears in nepal-locations.ts.
 */
export const LOCATION_ALIASES: Record<string, string> = {
  // Province name variants (Nominatim uses "Province", canonical uses "Pradesh")
  "koshi province": "Koshi Pradesh",
  "madhesh province": "Madhesh Pradesh",
  "bagamati province": "Bagmati Pradesh",
  "bagmati province": "Bagmati Pradesh",
  "gandaki province": "Gandaki Pradesh",
  "lumbini province": "Lumbini Pradesh",
  "karnali province": "Karnali Pradesh",
  "sudurpashchim province": "Sudurpashchim Pradesh",
  "sudur pashchim province": "Sudurpashchim Pradesh",
  "sudur pashchim": "Sudurpashchim Pradesh",
  "sudur pashchim pradesh": "Sudurpashchim Pradesh",
  // District spelling variants from Nominatim
  kavrepalanchowk: "Kavrepalanchok",
  sindhupalchowk: "Sindhupalchok",
  "nawalparasi east": "Nawalparasi East",
  "nawalparasi west": "Nawalparasi West",
  "rukum west": "Rukum West",
  "east nawalparasi": "Nawalparasi East",
  "west nawalparasi": "Nawalparasi West",
  "west rukum": "Rukum West",
};

/**
 * Computes the Levenshtein (edit) distance between two strings.
 * Used as a final fallback to catch minor spelling variants (e.g., "Bagamati" vs "Bagmati").
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
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

  // 4. Alias lookup — check known Nominatim spelling variants
  const normalizedOsm = normalize(osmName);
  const aliasMatch = LOCATION_ALIASES[osmLower] || LOCATION_ALIASES[normalizedOsm];
  if (aliasMatch && candidates.includes(aliasMatch)) return aliasMatch;

  // 5. Normalized comparison — compare normalized forms to handle suffixes and diacritics
  const normalizedMatch = candidates.find(c => normalize(osmName) === normalize(c));
  if (normalizedMatch) return normalizedMatch;

  // 6. Province/Pradesh substitution — Nominatim uses "Province" but Nepal canonical uses "Pradesh"
  const swapMatch = candidates.find(c => {
    const candidateLower = c.toLowerCase().trim();
    return candidateLower === osmLower.replace(/\bprovince\b/, "pradesh") ||
           candidateLower === osmLower.replace(/\bpradesh\b/, "province");
  });
  if (swapMatch) return swapMatch;

  // 7. Levenshtein distance fallback — match if edit distance ≤ 2 (handles typos like "Bagamati"/"Bagmati")
  const closeMatch = candidates.find(c => {
    const dist = levenshteinDistance(normalize(osmName), normalize(c));
    return dist > 0 && dist <= 2;
  });
  if (closeMatch) return closeMatch;

  return null;
}

/**
 * Maps Nominatim address response to Nepal administrative divisions.
 * Returns { province, district, municipality, latitude, longitude } on success.
 * Throws MATCH_FAILED when province/district cannot be resolved.
 */
export function matchLocationFromAddress(
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

  // Expanded address field search: when province or district is still unresolved,
  // try additional Nominatim address fields before giving up.
  if (!matchedProvince || !matchedDistrict) {
    const additionalFields: (keyof typeof address)[] = [
      "county",
      "city",
      "town",
      "village",
      "municipality",
      "suburb",
      "neighbourhood",
    ];

    for (const field of additionalFields) {
      const fieldValue = address[field];
      if (!fieldValue) continue;

      // Try matching this field value against all districts
      const districtCandidate = findBestMatch(fieldValue, getAllDistricts());
      if (districtCandidate) {
        matchedDistrict = districtCandidate;
        // Infer province from the matched district
        matchedProvince = getProvinceForDistrict(districtCandidate);
        break;
      }
    }
  }

  // If neither province nor district could be resolved after all attempts, throw MATCH_FAILED
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

      // Nepal boundary validation
      if (!isWithinNepal(latitude, longitude)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Coordinates are outside Nepal boundaries. Please use manual location selection.",
        });
      }

      // Call Nominatim reverse geocoding API with 5-second timeout
      // accept-language=en ensures English names are returned (not Devanagari)
      const url = `${NOMINATIM_BASE_URL}?lat=${latitude}&lon=${longitude}&format=jsonv2&addressdetails=1&zoom=10&accept-language=en`;

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
