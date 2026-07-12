import { describe, it, expect } from "vitest";
import { findBestMatch } from "./location-router";

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
