# ESP32 Firmware - PoleGuardian

This directory contains the ESP32 firmware for the PoleGuardian Smart Water Intelligence System.

## Hardware Configuration

- **Vibration Sensor**: Connected to GPIO 14 (interrupt-driven)
- **Flow Sensor**: Connected to GPIO 34 (analog input)
- **Power Supply**: 3.3V for sensors
- **WiFi Module**: Built-in ESP32 WiFi for cloud connectivity

## Setup Instructions

1. **Install PlatformIO** (recommended) or Arduino IDE
2. **Configure WiFi and Firebase credentials** in `src/main.cpp`:
   ```cpp
   #define WIFI_SSID "YOUR_WIFI_SSID"
   #define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
   #define API_KEY "YOUR_FIREBASE_API_KEY"
   ```

3. **Upload firmware**:
   ```bash
   pio run --target upload
   ```

## Features

- **5-second data collection** from vibration and flow sensors
- **Real-time Firebase transmission** to Singapore region database
- **Interrupt-driven vibration detection** for immediate tamper alerts
- **Connection retry logic** with exponential backoff
- **JSON data formatting** with concise variable names
- **Power-efficient operation** with optimized sleep modes

## Data Format

```json
{
  "timestamp": 1640995200000,
  "deviceId": "esp32_001",
  "vibration": 0,
  "flow": 2.5,
  "status": "normal"
}
```

## Troubleshooting

- **WiFi Connection Issues**: Check SSID and password configuration
- **Firebase Authentication**: Verify API key and database URL
- **Sensor Readings**: Check GPIO pin connections and power supply
- **Serial Monitor**: Use 115200 baud rate for debugging output

## Development Notes

- Code follows simplified variable naming conventions
- All comments removed from production firmware
- Uses Firebase_ESP_Client library for cloud connectivity
- Implements interrupt-driven sensor handling for reliability