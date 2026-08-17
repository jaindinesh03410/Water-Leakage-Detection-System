# PoleGuardian Smart Water Intelligence System

An industrial-grade AI-powered IoT solution that monitors water infrastructure through ESP32 hardware sensors and provides real-time analytics via a futuristic web dashboard.

## System Overview

The PoleGuardian system combines:
- **ESP32 Hardware**: Vibration and flow sensors for real-time monitoring
- **Firebase Cloud**: Real-time database hosted in Singapore region
- **React Dashboard**: AI-powered web interface with glassmorphism design
- **AI Analytics**: Theft detection, leak prevention, and usage optimization

## Project Structure

```
pole-guardian/
├── firmware/              # ESP32 firmware code
├── dashboard/             # React web application
├── firebase/              # Firebase configuration and rules
├── shared/                # Shared configurations and utilities
└── docs/                  # Documentation and specifications
```

## Quick Start

### Prerequisites
- Arduino IDE or PlatformIO for ESP32 development
- Node.js 18+ for React development
- Firebase CLI for cloud deployment

### ESP32 Firmware
```bash
cd firmware
# Upload to ESP32 device using Arduino IDE or PlatformIO
```

### Web Dashboard
```bash
cd dashboard
npm install
npm run dev
```

### Firebase Setup
```bash
cd firebase
firebase login
firebase deploy
```

## Features

- **Real-time Monitoring**: 5-second sensor data collection and transmission
- **AI-Powered Analytics**: Theft detection and leak prevention algorithms
- **Responsive Design**: Mobile-first glassmorphism UI with dark theme
- **Multi-Node Support**: Monitor multiple pipeline points simultaneously
- **Alert Management**: Animated notifications for critical events
- **Water Quality**: TDS monitoring and quality rating system

## System Requirements

- ESP32 microcontroller with WiFi capability
- Vibration sensor (GPIO 14)
- Flow sensor (GPIO 34)
- Stable internet connection for cloud synchronization
- Modern web browser for dashboard access

## License

This project is proprietary software for industrial water infrastructure monitoring.