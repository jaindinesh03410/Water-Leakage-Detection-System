# Requirements Document

## Introduction

A Python middleware backend service that integrates with the existing IoT Smart Water Intelligence System to provide data processing and REST API endpoints while maintaining complete isolation from the existing React dashboard and ESP32 firmware.

## Glossary

- **Python_Backend**: The new FastAPI/Flask server component
- **Firebase_Listener**: Component that connects to Firebase Realtime Database
- **REST_API**: HTTP endpoints for data retrieval
- **Sensor_Data**: IoT device readings from water monitoring sensors
- **Firebase_Admin_SDK**: Python library for Firebase server-side operations

## Requirements

### Requirement 1: Backend Directory Isolation

**User Story:** As a system architect, I want the Python backend in an isolated directory, so that existing components remain untouched.

#### Acceptance Criteria

1. THE Python_Backend SHALL be created in a new directory named "backend_python" at the project root level
2. THE Python_Backend SHALL NOT modify any existing files in the pole-guardian/dashboard directory tree
3. THE Python_Backend SHALL NOT modify any existing files in the pole-guardian/dashboard/src directory tree
4. WHERE ESP32 firmware files exist, THE Python_Backend SHALL NOT modify any existing files in the pole-guardian/firmware directory tree
5. WHEN the backend_python directory is created, THE system SHALL verify the directory exists at the project root level

### Requirement 2: Firebase Database Connection

**User Story:** As a backend developer, I want to connect to Firebase Realtime Database, so that I can access sensor data.

#### Acceptance Criteria

1. THE Firebase_Listener SHALL connect to the existing Firebase Realtime Database using firebase_admin SDK within 30 seconds of startup
2. WHEN sensor data is written to Firebase, THE Firebase_Listener SHALL receive the data packets within 5 seconds
3. THE Firebase_Listener SHALL authenticate using Firebase service account credentials
4. THE Firebase_Listener SHALL listen to the "readings" path in the database
5. WHEN Firebase connection fails, THE Firebase_Listener SHALL retry connection every 10 seconds for up to 5 attempts
6. WHEN authentication fails, THE Firebase_Listener SHALL log the error and terminate gracefully

### Requirement 3: REST API Endpoints

**User Story:** As a frontend developer, I want REST endpoints to retrieve sensor data, so that the dashboard can eventually consume this data.

#### Acceptance Criteria

1. THE REST_API SHALL provide a GET endpoint at "/api/readings" for retrieving sensor readings
2. THE REST_API SHALL provide a GET endpoint at "/api/alerts" for retrieving alerts data
3. THE REST_API SHALL provide a GET endpoint at "/api/nodes" for retrieving nodes status
4. THE REST_API SHALL return data in JSON format with Content-Type header "application/json"
5. WHEN no data exists, THE REST_API SHALL return HTTP status 200 with empty JSON object "{}"
6. WHEN Firebase connection is unavailable, THE REST_API SHALL return HTTP status 503 with error message in JSON format
7. WHEN an endpoint receives invalid requests, THE REST_API SHALL return HTTP status 400 with error details in JSON format

### Requirement 4: Python Server Framework

**User Story:** As a backend developer, I want a lightweight Python web framework, so that I can quickly implement REST endpoints.

#### Acceptance Criteria

1. THE Python_Backend SHALL use either FastAPI or Flask framework
2. THE Python_Backend SHALL run on a configurable port between 1024 and 65535 with default value 8000
3. THE Python_Backend SHALL support CORS with allow_origins=["*"], allow_methods=["GET", "POST", "PUT", "DELETE"], and allow_headers=["*"]
4. THE Python_Backend SHALL provide a health check endpoint at "/health" that returns HTTP status 200 with JSON response containing service status
5. WHEN the port is already in use, THE Python_Backend SHALL log an error and exit gracefully

### Requirement 5: Setup and Configuration

**User Story:** As a developer, I want clear setup instructions, so that I can run the Python backend locally.

#### Acceptance Criteria

1. THE Python_Backend SHALL include a requirements.txt file with all dependencies compatible with Python 3.8 or higher
2. THE Python_Backend SHALL include setup instructions in README.md with step-by-step installation, configuration, and startup procedures
3. THE Python_Backend SHALL include environment configuration for Firebase credentials via FIREBASE_CREDENTIALS_PATH and FIREBASE_DATABASE_URL variables
4. THE Python_Backend SHALL provide a .env.example file with all required environment variables and example values
5. WHEN the Python backend starts successfully, THE system SHALL log "Server started successfully" message
6. WHEN Firebase credentials are missing or invalid, THE Python_Backend SHALL log specific error messages and provide troubleshooting guidance