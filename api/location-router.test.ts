import { describe, it, expect, vi } from "vitest";
import fc from "fast-check";

// Mock middleware to prevent tRPC + Zod v4 router initialization hang
vi.mock("./middleware", () => ({
  createRouter: (routes: any) => routes,
  publicQuery: {
    input: () => ({ query: (fn: any) => ({ _def: {} }) }),
    query: (fn: any) => ({ _def: {} }),
  },
}));

import { findBestMatch, matchLocationFromAddress } from "./location-router";
import { provinces, getAllDistricts } from "./nepal-locations";

describe("findBestMatch", () => {
  const provinces = [
    "Koshi Pradesh",
    "Madhesh Pradesh",
    "Bagmati Pradesh",
    "Gandaki Pradesh",
    "Lumbini Pradesh",
    "Karnali Pradesh",
    "Sudurpashchim Pradesh",
  ];

  const kathmunduMunicipalities = [
    "Kathmandu Metropolitan City",
    "Kirtipur Municipality",
    "Kageshwari Manohara",
    "Budhanilkantha",
    "Tokha",
    "Tarakeshwar",
    "Gokarneshwar",
    "Chandragiri",
    "Nagarjun",
    "Dakshinkali",
  ];

  it("returns null for empty osmName", () => {
    expect(findBestMatch("", provinces)).toBeNull();
  });

  it("returns null for empty candidates", () => {
    expect(findBestMatch("Bagmati Pradesh", [])).toBeNull();
  });

  it("finds exact match (case-insensitive)", () => {
    expect(findBestMatch("Bagmati Pradesh", provinces)).toBe("Bagmati Pradesh");
    expect(findBestMatch("bagmati pradesh", provinces)).toBe("Bagmati Pradesh");
    expect(findBestMatch("BAGMATI PRADESH", provinces)).toBe("Bagmati Pradesh");
  });

  it("finds match when candidate contains osmName", () => {
    // OSM returns "Kathmandu" and candidate is "Kathmandu Metropolitan City"
    expect(findBestMatch("Kathmandu", kathmunduMunicipalities)).toBe(
      "Kathmandu Metropolitan City"
    );
  });

  it("finds match when osmName contains candidate", () => {
    const districtList = ["Kathmandu", "Lalitpur", "Bhaktapur"];
    expect(findBestMatch("Kathmandu Metropolitan City", districtList)).toBe("Kathmandu");
  });

  it("handles Province vs Pradesh via first-word matching", () => {
    // OSM returns "Bagmati Province" but the app uses "Bagmati Pradesh"
    expect(findBestMatch("Bagmati Province", provinces)).toBe("Bagmati Pradesh");
    expect(findBestMatch("Gandaki Province", provinces)).toBe("Gandaki Pradesh");
    expect(findBestMatch("Koshi Province", provinces)).toBe("Koshi Pradesh");
  });

  it("returns null when no match found", () => {
    expect(findBestMatch("Unknown Province", provinces)).toBeNull();
    expect(findBestMatch("Tokyo", provinces)).toBeNull();
  });

  it("handles district matching", () => {
    const bagmatiDistricts = [
      "Kathmandu", "Lalitpur", "Bhaktapur", "Kavrepalanchok",
      "Dhading", "Nuwakot", "Sindhupalchok", "Makwanpur",
      "Chitwan", "Ramechhap", "Dolakha", "Sindhuli", "Rasuwa",
    ];
    expect(findBestMatch("Kathmandu", bagmatiDistricts)).toBe("Kathmandu");
    expect(findBestMatch("kathmandu", bagmatiDistricts)).toBe("Kathmandu");
  });

  it("handles whitespace trimming", () => {
    expect(findBestMatch("  Bagmati Pradesh  ", provinces)).toBe("Bagmati Pradesh");
  });
});


/**
 * Preservation: Existing Match Behavior Unchanged
 *
 * **Validates: Requirements 3.1, 3.2, 3.5, 3.6, 3.7**
 *
 * These property-based tests verify that existing match strategies (exact,
 * partial/contains, first-word) continue to work correctly. They establish
 * baseline behavior BEFORE implementing the fix, ensuring no regressions.
 */
describe("Preservation: Existing match behavior", () => {
  const allDistricts = getAllDistricts();

  it("property: all canonical province names resolve to themselves via exact match", () => {
    const provinceArb = fc.constantFrom(...provinces);

    fc.assert(
      fc.property(provinceArb, (name) => {
        const result = findBestMatch(name, provinces);
        return result === name;
      }),
      { numRuns: 100 }
    );
  });

  it("property: all canonical district names resolve to themselves via exact match", () => {
    const districtArb = fc.constantFrom(...allDistricts);

    fc.assert(
      fc.property(districtArb, (name) => {
        const result = findBestMatch(name, allDistricts);
        return result === name;
      }),
      { numRuns: 200 }
    );
  });

  it("property: single first-word provinces with 'Province' suffix resolve via first-word match", () => {
    // Provinces where the first word is unique and >= 3 chars (first-word strategy works)
    // Exclude "Sudurpashchim Pradesh" since "Sudur Pashchim Province" is the bug condition
    const singleFirstWordProvinces = provinces.filter((p) => {
      const firstWord = p.split(/\s+/)[0];
      // Ensure the first word is unique among all provinces
      const matches = provinces.filter(
        (other) => other.split(/\s+/)[0] === firstWord
      );
      return matches.length === 1 && firstWord.length >= 3;
    });

    const provinceArb = fc.constantFrom(...singleFirstWordProvinces);

    fc.assert(
      fc.property(provinceArb, (canonicalName) => {
        const firstWord = canonicalName.split(/\s+/)[0];
        const variantWithProvince = `${firstWord} Province`;
        const result = findBestMatch(variantWithProvince, provinces);
        return result === canonicalName;
      }),
      { numRuns: 100 }
    );
  });

  it("property: random non-Nepal strings return null (no false positives)", () => {
    // Use strings composed of characters unlikely to match Nepal locations
    const nonNepalArb = fc
      .array(fc.constantFrom(..."0123456789!@#$%^&*()XYZxyz"), {
        minLength: 4,
        maxLength: 20,
      })
      .map((chars) => chars.join(""));

    fc.assert(
      fc.property(nonNepalArb, (randomStr) => {
        const provinceResult = findBestMatch(randomStr, provinces);
        const districtResult = findBestMatch(randomStr, allDistricts);
        return provinceResult === null && districtResult === null;
      }),
      { numRuns: 200 }
    );
  });

  it("property: empty input always returns null", () => {
    fc.assert(
      fc.property(fc.constant(""), (emptyStr) => {
        return findBestMatch(emptyStr, provinces) === null;
      }),
      { numRuns: 10 }
    );
  });

  it("property: case-insensitive exact matches resolve correctly", () => {
    const districtArb = fc.constantFrom(...allDistricts);
    const caseTransformArb = fc.constantFrom(
      (s: string) => s.toLowerCase(),
      (s: string) => s.toUpperCase(),
      (s: string) => s
    );

    fc.assert(
      fc.property(districtArb, caseTransformArb, (name, transform) => {
        const result = findBestMatch(transform(name), allDistricts);
        return result === name;
      }),
      { numRuns: 200 }
    );
  });
});

/**
 * Bug Condition Exploration: Nominatim Variant Names Fail to Match
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 *
 * These property-based tests demonstrate that `findBestMatch` fails to resolve
 * known Nominatim variant names to their canonical Nepal location equivalents.
 * The test is EXPECTED TO FAIL on unfixed code, confirming the bug exists.
 */
describe("Bug Condition: Nominatim variant matching", () => {
  // Known Nominatim variant → expected canonical name pairs that should match
  // but FAIL on the current unfixed implementation
  const nominatimVariantPairs: Array<{
    variant: string;
    expected: string;
    candidates: string[];
    description: string;
  }> = [
    {
      variant: "Sudur Pashchim Province",
      expected: "Sudurpashchim Pradesh",
      candidates: provinces,
      description: "Multi-word province with 'Province' suffix (Req 1.1)",
    },
    {
      variant: "Kavrepalanchowk",
      expected: "Kavrepalanchok",
      candidates: getAllDistricts(),
      description: "Spelling variant 'owk' vs 'ok' (Req 1.3)",
    },
    {
      variant: "Kavrepalanchowk District",
      expected: "Kavrepalanchok",
      candidates: getAllDistricts(),
      description: "Spelling variant with 'District' suffix (Req 1.2, 1.3)",
    },
    {
      variant: "Sindhupalchowk",
      expected: "Sindhupalchok",
      candidates: getAllDistricts(),
      description: "Spelling variant 'owk' vs 'ok' (Req 1.3)",
    },
    {
      variant: "Bhaktapūr",
      expected: "Bhaktapur",
      candidates: getAllDistricts(),
      description: "Diacritic 'ū' vs 'u' (Req 1.5)",
    },
    {
      variant: "Lalitpūr",
      expected: "Lalitpur",
      candidates: getAllDistricts(),
      description: "Diacritic 'ū' vs 'u' (Req 1.5)",
    },
  ];

  it("property: Nominatim variants resolve to canonical names", () => {
    // Use fast-check to generate random selections from our known failing pairs
    const variantArb = fc.constantFrom(...nominatimVariantPairs);

    fc.assert(
      fc.property(variantArb, ({ variant, expected, candidates }) => {
        const result = findBestMatch(variant, candidates);
        return result === expected;
      }),
      { numRuns: 100 }
    );
  });
});


/**
 * Expanded Address Field Search Tests
 *
 * **Validates: Requirements 2.4**
 *
 * Tests that matchLocationFromAddress searches additional address fields
 * (county, city, town, village, municipality, suburb, neighbourhood)
 * before throwing MATCH_FAILED when initial matching attempts fail.
 */
describe("Expanded address field search in matchLocationFromAddress", () => {
  const lat = 27.7;
  const lng = 85.3;

  it("resolves district from county field when state and state_district are missing", () => {
    const address = {
      county: "Kathmandu District",
      state: undefined,
      state_district: undefined,
    };
    const result = matchLocationFromAddress(address, lat, lng);
    expect(result.district).toBe("Kathmandu");
    expect(result.province).toBe("Bagmati Pradesh");
  });

  it("resolves district from city field when state and state_district are missing", () => {
    const address = {
      city: "Lalitpur",
      state: undefined,
      state_district: undefined,
    };
    const result = matchLocationFromAddress(address, lat, lng);
    expect(result.district).toBe("Lalitpur");
    expect(result.province).toBe("Bagmati Pradesh");
  });

  it("resolves district from town field when other fields fail", () => {
    const address = {
      town: "Bhaktapur",
      state: undefined,
      state_district: undefined,
    };
    const result = matchLocationFromAddress(address, lat, lng);
    expect(result.district).toBe("Bhaktapur");
    expect(result.province).toBe("Bagmati Pradesh");
  });

  it("resolves district from village field when other fields fail", () => {
    const address = {
      village: "Kaski",
      state: undefined,
      state_district: undefined,
    };
    const result = matchLocationFromAddress(address, lat, lng);
    expect(result.district).toBe("Kaski");
    expect(result.province).toBe("Gandaki Pradesh");
  });

  it("resolves district from municipality field when other fields fail", () => {
    const address = {
      municipality: "Jhapa",
      state: undefined,
      state_district: undefined,
    };
    const result = matchLocationFromAddress(address, lat, lng);
    expect(result.district).toBe("Jhapa");
    expect(result.province).toBe("Koshi Pradesh");
  });

  it("infers province from district found in expanded field search", () => {
    const address = {
      county: "Kailali",
      state: undefined,
      state_district: undefined,
    };
    const result = matchLocationFromAddress(address, lat, lng);
    expect(result.district).toBe("Kailali");
    expect(result.province).toBe("Sudurpashchim Pradesh");
  });

  it("still throws MATCH_FAILED when no fields contain valid district data", () => {
    const address = {
      county: "Unknown Place",
      city: "Random City",
      state: undefined,
      state_district: undefined,
    };
    expect(() => matchLocationFromAddress(address, lat, lng)).toThrow(
      "Could not determine your exact location"
    );
  });

  it("uses expanded search even when province initially matches but district does not", () => {
    const address = {
      state: "Bagmati Pradesh",
      state_district: "NonexistentDistrict",
      city: "Kathmandu",
    };
    const result = matchLocationFromAddress(address, lat, lng);
    expect(result.district).toBe("Kathmandu");
    expect(result.province).toBe("Bagmati Pradesh");
  });

  it("handles Nominatim spelling variants in expanded fields", () => {
    const address = {
      county: "Kavrepalanchowk District",
      state: undefined,
      state_district: undefined,
    };
    const result = matchLocationFromAddress(address, lat, lng);
    expect(result.district).toBe("Kavrepalanchok");
    expect(result.province).toBe("Bagmati Pradesh");
  });

  it("preserves existing field extraction order - state_district takes priority", () => {
    const address = {
      state: "Gandaki Pradesh",
      state_district: "Kaski",
      city: "Kathmandu",
    };
    const result = matchLocationFromAddress(address, lat, lng);
    // state_district should be used first, not expanded city field
    expect(result.district).toBe("Kaski");
    expect(result.province).toBe("Gandaki Pradesh");
  });
});
