# Requirements Document

## Introduction

This feature adds live GPS location detection to the report submission form's Location step (step 3). Currently, users must manually select Province → District → Municipality from cascading dropdowns. This feature provides an alternative "Detect My Location" option that uses the browser's Geolocation API to obtain the user's GPS coordinates, reverse geocodes them to identify the corresponding Nepal administrative divisions, and auto-fills the location form fields. Users can switch between manual selection and auto-detection modes. The detected latitude and longitude are stored alongside existing location data.

## Glossary

- **Location_Detector**: The frontend component responsible for obtaining GPS coordinates via the browser Geolocation API and triggering reverse geocoding
- **Reverse_Geocoder**: The backend API endpoint that accepts latitude/longitude coordinates and returns the matching Province, District, and Municipality within Nepal
- **Report_Form**: The multi-step cybercrime report submission form in the SCR application
- **Location_Step**: Step 3 of the Report_Form where the user provides incident location information
- **Geolocation_API**: The browser's `navigator.geolocation` interface for obtaining device GPS position
- **Coordinates**: A pair of latitude and longitude values representing a geographic position

## Requirements

### Requirement 1: Location Input Mode Toggle

**User Story:** As a reporter, I want to choose between manually selecting my location or auto-detecting it, so that I can quickly fill in location details when I am at or near the incident location.

#### Acceptance Criteria

1. THE Location_Step SHALL provide two location input modes: "Manual Selection" and "Detect My Location"
2. WHEN the user selects "Detect My Location" mode, THE Location_Step SHALL display a location detection button and hide the manual cascading dropdowns
3. WHEN the user selects "Manual Selection" mode, THE Location_Step SHALL display the Province, District, and Municipality cascading dropdowns
4. WHEN the Location_Step is first rendered, THE Location_Step SHALL default to "Manual Selection" mode with the cascading dropdowns visible
5. WHEN the user switches from "Manual Selection" mode to "Detect My Location" mode, THE Location_Step SHALL preserve any manually entered Province, District, and Municipality selections so they are restored if the user switches back to "Manual Selection" mode

### Requirement 2: GPS Coordinate Acquisition

**User Story:** As a reporter, I want the system to detect my current GPS coordinates, so that I do not need to manually determine my administrative location.

#### Acceptance Criteria

1. WHEN the user activates the "Detect My Location" button, THE Location_Detector SHALL request the user's position via the Geolocation_API with a timeout of 10 seconds and high-accuracy mode enabled
2. WHILE the Location_Detector is acquiring coordinates, THE Location_Step SHALL display a loading indicator with the text "Detecting your location..." and disable the "Detect My Location" button to prevent duplicate requests
3. WHEN the Geolocation_API returns coordinates successfully, THE Location_Detector SHALL pass the latitude (decimal degrees, range -90 to 90) and longitude (decimal degrees, range -180 to 180) to the Reverse_Geocoder
4. IF the user denies the geolocation permission, THEN THE Location_Detector SHALL hide the loading indicator and display an error message indicating that location access was denied and instructing the user to allow location access in browser settings or use manual selection
5. IF the Geolocation_API does not respond within 10 seconds or returns a position error, THEN THE Location_Detector SHALL hide the loading indicator and display an error message indicating that location detection failed and instructing the user to try again or use manual selection
6. IF the Geolocation_API is not supported by the browser, THEN THE Location_Detector SHALL hide the "Detect My Location" button and default to manual selection without displaying an error
7. WHEN the Geolocation_API returns coordinates successfully, THE Location_Step SHALL display the acquired latitude and longitude values to the user as confirmation before passing them to the Reverse_Geocoder
8. IF the user activates "Detect My Location" after a previous error, THEN THE Location_Detector SHALL clear the previous error message and re-initiate the geolocation request

### Requirement 3: Reverse Geocoding

**User Story:** As a reporter, I want my GPS coordinates converted to Province, District, and Municipality, so that the location fields are filled with the correct Nepal administrative divisions.

#### Acceptance Criteria

1. WHEN the Reverse_Geocoder receives valid latitude and longitude within Nepal boundaries (latitude 26.3–30.5, longitude 80.0–88.2), THE Reverse_Geocoder SHALL return the matching Province, District, and Municipality names within 3 seconds of receiving the coordinates
2. IF the coordinates fall outside Nepal boundaries (latitude outside 26.3–30.5 or longitude outside 80.0–88.2), THEN THE Reverse_Geocoder SHALL return an error indicating the location is outside Nepal and SHALL NOT populate any location fields
3. WHEN the Reverse_Geocoder returns a successful result, THE Location_Step SHALL auto-fill the Province, District, and Municipality form fields with the returned values and SHALL disable the auto-filled fields from manual editing until the user clears the coordinates
4. IF the Reverse_Geocoder cannot determine an exact Municipality match, THEN THE Reverse_Geocoder SHALL return the nearest Province and District, leave Municipality empty, and THE Location_Step SHALL present a selectable list of municipalities within the identified District for manual selection
5. IF the latitude or longitude values are missing, non-numeric, or exceed coordinate precision of 6 decimal places, THEN THE Reverse_Geocoder SHALL return a validation error indicating invalid coordinate format and SHALL NOT attempt geocoding
6. IF the Reverse_Geocoder service is unavailable or fails to respond within 5 seconds, THEN THE Location_Step SHALL display an error message indicating the service is temporarily unavailable and SHALL allow the user to manually select Province, District, and Municipality from dropdown fields

### Requirement 4: Coordinates Storage

**User Story:** As a system administrator, I want GPS coordinates stored with reports, so that exact incident locations can be analyzed for geographic crime pattern mapping.

#### Acceptance Criteria

1. THE Report database table SHALL include a `latitude` field (decimal, precision 10, scale 7, nullable) and a `longitude` field (decimal, precision 10, scale 7, nullable)
2. THE system SHALL store latitude and longitude only as a pair: both fields must be either non-null or both null (partial coordinate storage is not permitted)
3. WHEN a report is submitted with detected coordinates that fall within Nepal boundaries (latitude 26.3–30.5, longitude 80.0–88.2), THE system SHALL store the latitude and longitude values in the report record
4. WHEN a report is submitted via manual selection without detection, THE system SHALL store null for both latitude and longitude fields
5. IF a report submission includes coordinates outside Nepal boundaries (latitude outside 26.3–30.5 or longitude outside 80.0–88.2), THEN THE system SHALL reject the coordinate values and store null for both latitude and longitude fields

### Requirement 5: Location Detection Feedback

**User Story:** As a reporter, I want to see confirmation of my detected location before submitting, so that I can verify the auto-detected location is correct.

#### Acceptance Criteria

1. WHEN coordinates are successfully reverse geocoded, THE Location_Step SHALL display the detected Province, District, and Municipality in a confirmation card
2. THE confirmation card SHALL display the detected latitude and longitude coordinates formatted to 4 decimal places
3. THE confirmation card SHALL provide an "Edit Manually" button that, WHEN clicked, switches the Location_Step to manual selection mode with the detected Province, District, and Municipality pre-selected in the cascading dropdowns
4. WHEN the user clicks "Detect Again", THE Location_Detector SHALL clear the current confirmation card, display the loading indicator, re-acquire coordinates via the Geolocation_API, and repeat the reverse geocoding process
5. IF the Reverse_Geocoder returns a result with Municipality empty, THEN THE confirmation card SHALL display the detected Province and District and indicate that Municipality must be selected manually

### Requirement 6: Form Validation with Detected Location

**User Story:** As a reporter, I want the detected location to satisfy the required location fields, so that I can proceed to the next step without additional manual input.

#### Acceptance Criteria

1. WHEN Province, District, and Municipality are filled via location detection, THE Report_Form SHALL enable the "Next" button and display no validation error messages for the Location_Step, allowing the user to proceed to the next step
2. IF the Reverse_Geocoder returns only Province and District without Municipality, THEN THE Location_Step SHALL display the Municipality dropdown pre-filtered to the detected District's municipalities within the detection mode view and SHALL display a validation error message indicating that Municipality selection is required until the user selects a Municipality
3. WHEN switching from detected location back to manual mode, THE Location_Step SHALL set the Province dropdown to the detected Province value, populate the District dropdown with districts for that Province and set it to the detected District value, and populate the Municipality dropdown with municipalities for that District and set it to the detected Municipality value if one was detected
4. IF the user manually changes any location dropdown value after switching from detected mode, THEN THE Location_Step SHALL clear the stored latitude and longitude coordinates for the report
