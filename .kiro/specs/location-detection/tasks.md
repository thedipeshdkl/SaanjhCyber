# Implementation Plan: Location Detection

## Overview

This plan implements GPS-based location detection for the report submission form's Location step. It adds a tRPC backend endpoint that proxies reverse geocoding via Nominatim, new React components for detection UI, a database migration for coordinate storage, and integrates everything into the existing report flow. Tasks are ordered so each builds on the previous, with property-based tests validating correctness properties from the design.

## Tasks

- [x] 1. Database migration and schema update
  - [x] 1.1 Add latitude and longitude columns to reports table
    - Add `latitude: decimal("latitude", { precision: 10, scale: 7 })` and `longitude: decimal("longitude", { precision: 10, scale: 7 })` to the `reports` table in `db/schema.ts`
    - Run `drizzle-kit generate` to create the migration file
    - _Requirements: 4.1_

  - [x] 1.2 Update report.create mutation to accept coordinates
    - Add `latitude: z.number().min(26.3).max(30.5).nullable().optional()` and `longitude: z.number().min(80.0).max(88.2).nullable().optional()` to the create input schema in `api/report-router.ts`
    - Add coordinate pair validation: if one is provided, both must be provided; reject partial pairs
    - Store coordinates in the insert statement, defaulting to null when not provided
    - If coordinates are outside Nepal bounds, store null for both
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 2. Backend reverse geocoding endpoint
  - [x] 2.1 Create location router with reverseGeocode procedure
    - Create `api/location-router.ts` with a new tRPC router
    - Define input schema: `{ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) }`
    - Implement Nepal boundary validation (lat 26.3–30.5, lng 80.0–88.2), returning `OUTSIDE_NEPAL` error for out-of-bounds
    - Implement precision validation (max 6 decimal places), returning `INVALID_COORDINATES` error
    - Call Nominatim reverse geocoding API: `https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lng}&format=jsonv2&addressdetails=1&zoom=10`
    - Set 5-second timeout on the Nominatim fetch; return `SERVICE_UNAVAILABLE` on timeout
    - _Requirements: 3.1, 3.2, 3.5, 3.6_

  - [x] 2.2 Implement fuzzy name-matching logic
    - Create a `findBestMatch(osmName: string, candidates: string[]): string | null` utility function in `api/location-router.ts`
    - Implement exact match (case-insensitive) as first priority
    - Implement partial/contains match as fallback
    - Map Nominatim `address.state` → Province, `address.state_district`/`address.county` → District, `address.city`/`address.town`/`address.village`/`address.municipality` → Municipality
    - Return `{ province, district, municipality: string | null, latitude, longitude }` on success
    - Return `MATCH_FAILED` error when no province/district can be resolved
    - If municipality cannot be matched, return it as null (partial result)
    - _Requirements: 3.1, 3.4_

  - [x] 2.3 Register location router in the main app router
    - Import `locationRouter` in `api/router.ts`
    - Add `location: locationRouter` to the app router definition
    - _Requirements: 3.1_

  - [ ]* 2.4 Write property test for Nepal boundary validation (Property 3)
    - **Property 3: Nepal boundary validation rejects out-of-bounds coordinates**
    - Use fast-check to generate coordinate pairs outside [26.3, 30.5] × [80.0, 88.2]
    - Verify the endpoint returns an error and does not call Nominatim
    - **Validates: Requirements 3.2, 4.5**

  - [ ]* 2.5 Write property test for invalid coordinate format (Property 4)
    - **Property 4: Invalid coordinate format validation**
    - Use fast-check to generate values with >6 decimal places or non-numeric inputs
    - Verify validation error is returned without any external API call
    - **Validates: Requirements 3.5**

- [x] 3. Checkpoint - Backend verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Frontend LocationDetector component
  - [x] 4.1 Create LocationDetector component
    - Create `src/components/LocationDetector.tsx`
    - Implement mode toggle UI (manual/detect) with two buttons/tabs
    - Implement "Detect My Location" button that calls `navigator.geolocation.getCurrentPosition` with `{ enableHighAccuracy: true, timeout: 10000 }`
    - Show loading state with "Detecting your location..." text and disabled button during acquisition
    - On success: call `trpc.location.reverseGeocode.mutate({ latitude, longitude })`
    - Handle errors: permission denied, timeout, Geolocation API not supported (hide button entirely)
    - Clear previous errors on retry
    - Display acquired latitude/longitude before reverse geocoding completes
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 4.2 Create ConfirmationCard sub-component
    - Create confirmation card within or alongside `LocationDetector.tsx`
    - Display detected Province, District, Municipality (or "Select manually" if municipality is null)
    - Display latitude and longitude formatted to 4 decimal places using `toFixed(4)`
    - Add "Edit Manually" button that switches to manual mode with pre-filled values
    - Add "Detect Again" button that clears card, shows loading, re-initiates detection
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 4.3 Write property test for coordinate display formatting (Property 6)
    - **Property 6: Coordinate display formatting**
    - Use fast-check to generate arbitrary decimal coordinates
    - Verify the ConfirmationCard always displays them with exactly 4 decimal places
    - **Validates: Requirements 5.2**

- [x] 5. Integrate LocationDetector into Report form
  - [x] 5.1 Modify Report.tsx Location step to support dual modes
    - Add `locationMode` state (`"manual" | "detect"`) defaulting to `"manual"`
    - Add `detectedLocation` state to hold the reverse geocoded result
    - Add `latitude` and `longitude` to the form data type
    - Conditionally render either the existing cascading dropdowns (manual mode) or the `LocationDetector` component (detect mode)
    - When switching from detect → manual, pre-fill Province/District/Municipality dropdowns with detected values
    - Preserve manually entered values when switching to detect mode and back
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.3_

  - [x] 5.2 Handle form state when location is detected
    - On successful detection: set Province, District, Municipality form values from the result
    - Disable auto-filled dropdowns from manual editing when in detect mode
    - If municipality is null in result: show Municipality dropdown filtered by detected District within detect mode view, display validation error until selected
    - Enable "Next" button when all three fields are filled (no validation errors)
    - _Requirements: 3.3, 3.4, 6.1, 6.2_

  - [x] 5.3 Clear coordinates on manual override
    - When user switches to manual mode and changes any Province/District/Municipality dropdown value, clear stored latitude and longitude from form data
    - Pass latitude/longitude to the `report.create` mutation on form submit
    - _Requirements: 6.4, 4.3, 4.4_

  - [ ]* 5.4 Write property test for mode switch preserving selections (Property 1)
    - **Property 1: Mode switch preserves manual selections**
    - Use fast-check to generate random Province/District/Municipality tuples
    - Simulate switching to detect mode and back, verify restoration of original values
    - **Validates: Requirements 1.5**

  - [ ]* 5.5 Write property test for coordinate forwarding (Property 2)
    - **Property 2: Valid coordinates forwarded to reverse geocoder**
    - Use fast-check to generate valid lat/lng pairs in [-90, 90] × [-180, 180]
    - Verify the LocationDetector passes them unchanged to the tRPC call
    - **Validates: Requirements 2.3**

  - [ ]* 5.6 Write property test for manual override clearing coordinates (Property 7)
    - **Property 7: Manual override clears stored coordinates**
    - Use fast-check to generate detected location states plus random dropdown changes
    - Verify latitude and longitude are set to null after any dropdown change
    - **Validates: Requirements 6.4**

- [x] 6. Checkpoint - Full integration verification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Coordinate pair integrity validation
  - [x] 7.1 Add coordinate pair invariant enforcement
    - In the `report.create` mutation, add explicit validation: if only one of latitude/longitude is provided (not both), reject or set both to null
    - Add a helper function `validateCoordinatePair(lat, lng)` that returns both or null
    - _Requirements: 4.2_

  - [ ]* 7.2 Write property test for coordinate pair integrity (Property 5)
    - **Property 5: Coordinate pair integrity invariant**
    - Use fast-check to generate various combinations of lat/lng inputs (both present, one missing, both missing)
    - Verify the stored result always has both non-null or both null
    - **Validates: Requirements 4.2**

- [x] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The Nominatim API requires a User-Agent header; use the app name (e.g., `SCR-App/1.0`)
- fast-check is not yet in package.json; install it as a dev dependency before writing property tests

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3"] },
    { "id": 3, "tasks": ["2.4", "2.5", "4.1"] },
    { "id": 4, "tasks": ["4.2"] },
    { "id": 5, "tasks": ["4.3", "5.1"] },
    { "id": 6, "tasks": ["5.2", "5.3"] },
    { "id": 7, "tasks": ["5.4", "5.5", "5.6", "7.1"] },
    { "id": 8, "tasks": ["7.2"] }
  ]
}
```
