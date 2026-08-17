# Firebase Configuration - PoleGuardian

This directory contains Firebase configuration files for the PoleGuardian Smart Water Intelligence System.

## Setup Instructions

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project named "pole-guardian"
   - Enable Realtime Database in Singapore region (asia-southeast1)
   - Enable Authentication with Anonymous sign-in

4. **Configure Project**:
   ```bash
   firebase use --add
   # Select your project and alias it as 'default'
   ```

5. **Deploy Database Rules**:
   ```bash
   firebase deploy --only database
   ```

6. **Deploy Hosting** (after building dashboard):
   ```bash
   cd ../dashboard
   npm run build
   cd ../firebase
   firebase deploy --only hosting
   ```

## Database Structure

The Firebase Realtime Database is structured as follows:

```
/readings/{deviceId}/{timestamp}
  - timestamp: number
  - deviceId: string
  - vibration: 0 or 1
  - flow: number (L/min)
  - status: "normal" | "warning" | "error"

/nodes/{nodeId}
  - status: "normal" | "warning" | "critical"
  - lastUpdate: timestamp
  - location: string

/alerts/{alertId}
  - type: "leak" | "theft" | "pressure" | "tamper" | "quality"
  - severity: "low" | "medium" | "high" | "critical"
  - timestamp: number
  - deviceId: string
  - message: string
  - resolved: boolean

/analytics/daily/{date}
  - totalFlow: number
  - avgPressure: number
  - alertCount: number
  - theftRisk: number (0-100)

/quality/{timestamp}
  - tds: number (ppm)
  - ph: number (0-14)
  - temperature: number (Celsius)
  - rating: "excellent" | "good" | "fair" | "poor"
  - compliance: boolean
```

## Security Rules

The database rules enforce:
- **Authentication Required**: All read/write operations require authentication
- **Data Validation**: Strict validation for all data types and ranges
- **Device Authorization**: Only authorized devices can write sensor data
- **Alert Management**: Proper alert structure and severity levels
- **Quality Control**: Water quality data validation against standards

## Regional Configuration

- **Database Region**: Asia Southeast 1 (Singapore)
- **Hosting Region**: Global CDN with Singapore primary
- **Authentication**: Anonymous authentication for device access
- **Real-time Sync**: Optimized for 5-second data intervals

## Environment Variables

Update the following in your applications:

**ESP32 Firmware** (`firmware/src/main.cpp`):
```cpp
#define DATABASE_URL "https://pole-guardian-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define API_KEY "your-firebase-api-key"
```

**React Dashboard** (`dashboard/src/services/firebase.js`):
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "pole-guardian.firebaseapp.com",
  databaseURL: "https://pole-guardian-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "pole-guardian",
  // ... other config
}
```

## Monitoring and Analytics

- **Real-time Monitoring**: Firebase Console provides real-time database activity
- **Usage Analytics**: Track read/write operations and bandwidth usage
- **Performance Monitoring**: Monitor database response times and connection quality
- **Security Monitoring**: Track authentication attempts and rule violations