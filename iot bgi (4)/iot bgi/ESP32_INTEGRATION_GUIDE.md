# ESP32 Integration Guide

## ✅ Backend Compatibility Status

**Your ESP32 code is fully compatible with the current backend!**

### ESP32 Data Structure (Your Code)
```json
{
  "flow_in": 14.22,
  "flow_out": 13.32,
  "leakage_detected": true,
  "pressure": 1137.18,
  "vibration_alert": false,
  "last_updated": "2026-05-14T10:47:16.347587"
}
```

### Backend Endpoints Available

| Endpoint | Description | ESP32 Compatible |
|----------|-------------|------------------|
| `/api/sensor_data` | Raw ESP32 sensor data | ✅ Direct match |
| `/api/flow_data` | Processed flow metrics | ✅ Enhanced |
| `/api/alerts_live` | Real-time alerts | ✅ Auto-generated |
| `/api/dashboard_summary` | Complete dashboard data | ✅ Calculated |

### What Your ESP32 Code Does

1. **Flow Monitoring**: Measures inlet and outlet flow rates
2. **Leak Detection**: Compares flow rates to detect leakage
3. **Pressure Monitoring**: Reads atmospheric + water pressure
4. **Vibration Detection**: Detects unauthorized access/theft
5. **Firebase Upload**: Sends data to `/sensor_data` path

### Backend Processing

The backend automatically:
- ✅ Stores raw ESP32 data
- ✅ Calculates leakage rates
- ✅ Generates alerts for anomalies
- ✅ Provides dashboard-ready data
- ✅ Monitors system health

### Configuration Required

1. **Update ESP32 Firebase URL**:
   ```cpp
   #define DATABASE_URL "https://iot-bgi-default-rtdb.asia-southeast1.firebasedatabase.app/"
   ```

2. **Update WiFi Credentials**:
   ```cpp
   #define WIFI_SSID "YOUR_ACTUAL_WIFI_NAME"
   #define WIFI_PASSWORD "YOUR_ACTUAL_PASSWORD"
   ```

3. **Update Firebase API Key**:
   ```cpp
   #define API_KEY "YOUR_ACTUAL_API_KEY"
   ```

### Real-time Dashboard Features

Your ESP32 data will automatically appear in:
- 📊 **Flow Rate Charts**: Real-time inlet/outlet monitoring
- 🚨 **Alert System**: Automatic leak and theft detection
- 📈 **Analytics**: Efficiency calculations and trends
- 💧 **Pressure Monitoring**: System health indicators

### Testing

1. **Simulate Data**: Run `python test_esp32_data.py` in backend folder
2. **View Dashboard**: Open http://localhost:3000
3. **Check API**: Visit http://localhost:8000/api/sensor_data

### Alert Thresholds

| Alert Type | Condition | Severity |
|------------|-----------|----------|
| Leakage | Flow difference > 0.5 L/min | High |
| Theft | Vibration sensor triggered | Critical |
| Pressure | < 1000 or > 1200 hPa | Medium |

### Next Steps

1. ✅ Backend is ready
2. ✅ Frontend is compatible
3. ✅ Database is configured
4. 🔧 Update ESP32 credentials
5. 🚀 Deploy ESP32 code
6. 📱 Monitor dashboard

**Your system is ready for ESP32 integration!**