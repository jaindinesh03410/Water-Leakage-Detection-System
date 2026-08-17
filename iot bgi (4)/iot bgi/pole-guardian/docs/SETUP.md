# PoleGuardian Setup Guide

Complete setup instructions for the PoleGuardian Smart Water Intelligence System.

## Prerequisites

### Hardware Requirements
- ESP32 development board (ESP32-WROOM-32 recommended)
- Vibration sensor (digital output)
- Flow sensor (analog output)
- Breadboard and jumper wires
- 3.3V power supply for sensors
- Stable WiFi network connection

### Software Requirements
- **Arduino IDE** 2.0+ or **PlatformIO** for ESP32 development
- **Node.js** 18+ for React dashboard development
- **Firebase CLI** for cloud deployment
- **Git** for version control

## Step 1: Hardware Setup

### ESP32 Connections
```
Vibration Sensor:
- VCC → 3.3V
- GND → GND
- OUT → GPIO 14

Flow Sensor:
- VCC → 3.3V
- GND → GND
- OUT → GPIO 34
```

### Wiring Diagram
```
ESP32          Vibration Sensor    Flow Sensor
3.3V    ────── VCC                 VCC
GND     ────── GND                 GND
GPIO14  ────── OUT
GPIO34  ─────────────────────────── OUT
```

## Step 2: Firebase Project Setup

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name: `pole-guardian`
4. Enable Google Analytics (optional)
5. Select Singapore region for better performance

### Enable Services
1. **Realtime Database**:
   - Go to Database → Realtime Database
   - Create database in Singapore region
   - Start in test mode (we'll add security rules later)

2. **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Anonymous authentication

3. **Hosting** (optional):
   - Go to Hosting
   - Get started and follow setup instructions

### Get Configuration
1. Go to Project Settings → General
2. Scroll to "Your apps" section
3. Add web app named "PoleGuardian Dashboard"
4. Copy the Firebase configuration object

## Step 3: ESP32 Firmware Setup

### Install Arduino IDE Libraries
1. Open Arduino IDE
2. Go to Tools → Manage Libraries
3. Install these libraries:
   - `Firebase Arduino Client Library for ESP32 and ESP8266` by Mobizt
   - `ArduinoJson` by Benoit Blanchon

### Configure Firmware
1. Open `firmware/src/main.cpp`
2. Update these constants:
   ```cpp
   #define WIFI_SSID "Your_WiFi_Network"
   #define WIFI_PASSWORD "Your_WiFi_Password"
   #define API_KEY "Your_Firebase_API_Key"
   #define DATABASE_URL "https://pole-guardian-default-rtdb.asia-southeast1.firebasedatabase.app/"
   ```

### Upload Firmware
1. Connect ESP32 to computer via USB
2. Select board: ESP32 Dev Module
3. Select correct COM port
4. Click Upload
5. Open Serial Monitor (115200 baud) to verify connection

## Step 4: React Dashboard Setup

### Install Dependencies
```bash
cd dashboard
npm install
```

### Configure Firebase
1. Open `src/services/firebase.js`
2. Replace the configuration with your Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "pole-guardian.firebaseapp.com",
     databaseURL: "https://pole-guardian-default-rtdb.asia-southeast1.firebasedatabase.app",
     projectId: "pole-guardian",
     storageBucket: "pole-guardian.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   }
   ```

### Start Development Server
```bash
npm run dev
```

The dashboard will be available at `http://localhost:3000`

## Step 5: Firebase Security Rules

### Deploy Database Rules
```bash
cd firebase
firebase login
firebase use --add  # Select your project
firebase deploy --only database
```

### Verify Rules
The security rules ensure:
- Authentication required for all operations
- Data validation for sensor readings
- Proper alert structure enforcement
- Quality control for water parameters

## Step 6: System Testing

### Test ESP32 Connection
1. Check Serial Monitor for WiFi connection success
2. Verify Firebase authentication
3. Confirm sensor data transmission every 5 seconds

### Test Dashboard
1. Open dashboard in browser
2. Verify real-time data updates
3. Check all UI components load correctly
4. Test responsive design on mobile devices

### Test Data Flow
1. Trigger vibration sensor (tap or shake)
2. Verify alert appears in dashboard
3. Check flow sensor readings update
4. Confirm data persistence in Firebase

## Step 7: Production Deployment

### Build Dashboard
```bash
cd dashboard
npm run build
```

### Deploy to Firebase Hosting
```bash
cd firebase
firebase deploy --only hosting
```

### Configure Custom Domain (Optional)
1. Go to Firebase Console → Hosting
2. Add custom domain
3. Follow DNS configuration instructions

## Troubleshooting

### ESP32 Issues
- **WiFi Connection Failed**: Check SSID and password
- **Firebase Authentication Error**: Verify API key and database URL
- **Sensor Not Reading**: Check GPIO pin connections and power supply
- **Upload Failed**: Ensure correct board and port selection

### Dashboard Issues
- **Firebase Connection Error**: Check configuration and network
- **Build Errors**: Run `npm install` to ensure all dependencies
- **Real-time Updates Not Working**: Verify Firebase rules and authentication
- **Styling Issues**: Clear browser cache and check Tailwind CSS build

### Firebase Issues
- **Database Rules Error**: Check rules syntax in Firebase Console
- **Authentication Failed**: Ensure anonymous auth is enabled
- **Region Issues**: Confirm Singapore region selection
- **Quota Exceeded**: Monitor usage in Firebase Console

## Performance Optimization

### ESP32 Optimization
- Use deep sleep between readings for battery operation
- Implement connection pooling for Firebase requests
- Add local data buffering for network outages
- Optimize JSON payload size

### Dashboard Optimization
- Enable code splitting for faster loading
- Implement service worker for offline capability
- Use React.memo for expensive components
- Optimize image assets and use WebP format

### Firebase Optimization
- Use database indexing for faster queries
- Implement data pagination for large datasets
- Set up database triggers for automated processing
- Monitor bandwidth usage and optimize queries

## Security Considerations

### Device Security
- Use secure WiFi networks (WPA2/WPA3)
- Implement device certificate authentication
- Regular firmware updates for security patches
- Physical security for ESP32 devices

### Database Security
- Implement proper authentication rules
- Use HTTPS for all communications
- Regular security rule audits
- Monitor for unauthorized access attempts

### Network Security
- Use VPN for remote access
- Implement network segmentation
- Regular security assessments
- Monitor network traffic for anomalies

## Maintenance

### Regular Tasks
- **Weekly**: Check system status and alerts
- **Monthly**: Review data analytics and patterns
- **Quarterly**: Update firmware and dashboard dependencies
- **Annually**: Security audit and performance review

### Monitoring
- Set up Firebase monitoring alerts
- Implement system health checks
- Monitor sensor calibration drift
- Track system performance metrics

## Support

For technical support and questions:
- Check the troubleshooting section above
- Review Firebase Console for error logs
- Monitor ESP32 Serial output for debugging
- Consult component documentation for specific issues