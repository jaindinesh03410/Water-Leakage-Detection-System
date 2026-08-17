# 🚀 ESP32 Complete Setup Guide

## 📋 Required Libraries

Arduino IDE में ये libraries install करें:

```
1. Adafruit BMP085 Library
2. Firebase ESP Client by Mobizt
3. ArduinoJson by Benoit Blanchon
4. WiFi (Built-in with ESP32)
```

## ⚙️ Configuration Steps

### 1. WiFi Credentials
```cpp
#define WIFI_SSID "YOUR_WIFI_NAME"           // आपका WiFi नाम
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"   // आपका WiFi पासवर्ड
```

### 2. Firebase Configuration
```cpp
#define API_KEY "AIzaSyDummy-Replace-With-Your-Actual-API-Key"
#define DATABASE_URL "https://iot-bgi-default-rtdb.asia-southeast1.firebasedatabase.app/"
```

## 🔧 Hardware Connections

### BMP180 (I2C)
- VCC → 3.3V
- GND → GND  
- SDA → GPIO 21
- SCL → GPIO 22

### Flow Sensors (with Voltage Dividers)
- Flow Sensor 1 → GPIO 34 (with 10kΩ pull-up)
- Flow Sensor 2 → GPIO 35 (with 10kΩ pull-up)

### Relays (Active LOW)
- Relay 1 → GPIO 23
- Relay 2 → GPIO 19

### Vibration Sensor
- Vibration → GPIO 27

## 📊 Data Flow

```
ESP32 → Firebase → Backend → Frontend Dashboard
```

### Data Structure Sent to Firebase:
```json
{
  "flow_in": 14.22,
  "flow_out": 13.32,
  "temperature": 25.5,
  "pressure": 1013.25,
  "leakage_detected": false,
  "vibration_alert": false,
  "low_pressure_alert": false,
  "valve1_status": true,
  "valve2_status": true,
  "total_litres_1": 150.5,
  "total_litres_2": 148.2,
  "flow_difference": 1.9,
  "system_efficiency": 93.4,
  "last_updated": "timestamp"
}
```

## 🎯 Features

### ✅ Monitoring
- Real-time flow monitoring
- Temperature & pressure sensing
- Vibration detection (theft alert)
- Total water consumption tracking

### ✅ Safety Features
- Automatic leak detection with 5-second delay
- Low pressure protection
- Valve hysteresis control
- Emergency valve shutdown

### ✅ Connectivity
- WiFi auto-reconnection
- Firebase real-time database
- 2-second data upload interval
- Connection status monitoring

### ✅ Smart Controls
- Automatic solenoid valve control
- Relay hysteresis (0.3-0.7 L/min)
- Non-blocking timing
- Stable interrupt handling

## 📱 Dashboard Access

After uploading code:
1. **Frontend**: http://localhost:3000/
2. **Backend API**: http://localhost:8000/
3. **Live Data**: Updates every 2 seconds

## 🔍 Serial Monitor Output

```
=======================================
🌡️  Temperature: 25.5 °C
📊 Pressure: 1013.25 hPa
💧 Flow Sensor 1: 14.22 L/min
💧 Flow Sensor 2: 13.32 L/min
📈 Total Water 1: 150.5 L
📈 Total Water 2: 148.2 L
⚖️  Flow Difference: 0.9 L/min
📳 Vibration: ✅ NORMAL
🔧 Solenoid Valve 1: 🟢 OPEN
🔧 Solenoid Valve 2: 🟢 OPEN
📡 WiFi: ✅ Connected
🔥 Firebase: ✅ Connected
=======================================
📤 Data sent to Firebase successfully!
```

## ⚠️ Important Notes

1. **Flow Sensors**: Use voltage dividers (5V → 3.3V)
2. **GPIO 34/35**: Need external 10kΩ pull-up resistors
3. **Relays**: Active LOW (LOW = ON, HIGH = OFF)
4. **Solenoids**: Use flyback diodes for protection
5. **Power**: Ensure adequate 5V supply for sensors

## 🚨 Alert System

| Alert Type | Condition | Action |
|------------|-----------|---------|
| Leak Detection | Flow difference > 2.0 L/min for 5 seconds | Close both valves |
| Low Pressure | Pressure < 950 hPa | Close both valves |
| Vibration | Motion detected | Send alert to dashboard |
| WiFi Loss | Connection lost | Auto-reconnect every 30 seconds |

## 🎉 Ready to Deploy!

1. ✅ Upload code to ESP32
2. ✅ Check Serial Monitor for connection status
3. ✅ Verify data on dashboard: http://localhost:3000/
4. ✅ Monitor real-time alerts and controls

**Your complete IoT Water Monitoring System is ready!**