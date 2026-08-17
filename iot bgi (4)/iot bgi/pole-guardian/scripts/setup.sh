#!/bin/bash

# PoleGuardian Setup Script for Linux/macOS
# This script helps set up the development environment

echo "PoleGuardian Smart Water Intelligence System Setup"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "\n${YELLOW}Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}Node.js found: $NODE_VERSION${NC}"
else
    echo -e "${RED}Node.js not found. Please install Node.js 18+ from https://nodejs.org/${NC}"
    echo -e "${YELLOW}After installing Node.js, run this script again.${NC}"
    exit 1
fi

# Check if npm is available
echo -e "\n${YELLOW}Checking npm installation...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}npm found: $NPM_VERSION${NC}"
else
    echo -e "${RED}npm not found. Please ensure npm is installed with Node.js${NC}"
    exit 1
fi

# Check if Firebase CLI is installed
echo -e "\n${YELLOW}Checking Firebase CLI...${NC}"
if command -v firebase &> /dev/null; then
    FIREBASE_VERSION=$(firebase --version)
    echo -e "${GREEN}Firebase CLI found: $FIREBASE_VERSION${NC}"
else
    echo -e "${YELLOW}Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
fi

# Install dashboard dependencies
echo -e "\n${YELLOW}Installing dashboard dependencies...${NC}"
cd dashboard
if npm install; then
    echo -e "${GREEN}Dashboard dependencies installed successfully!${NC}"
else
    echo -e "${RED}Failed to install dashboard dependencies${NC}"
    exit 1
fi

cd ..

# Create environment file template
echo -e "\n${YELLOW}Creating environment file template...${NC}"
cat > dashboard/.env.local << EOF
# Firebase Configuration
# Replace these values with your actual Firebase project configuration

VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=pole-guardian.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://pole-guardian-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=pole-guardian
VITE_FIREBASE_STORAGE_BUCKET=pole-guardian.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
EOF

echo -e "${GREEN}Environment template created at dashboard/.env.local${NC}"

# Setup complete
echo -e "\n${GREEN}✅ Setup Complete!${NC}"
echo -e "\n${CYAN}Next steps:${NC}"
echo -e "${NC}1. Create a Firebase project at https://console.firebase.google.com/${NC}"
echo -e "${NC}2. Enable Realtime Database in Singapore region${NC}"
echo -e "${NC}3. Enable Anonymous Authentication${NC}"
echo -e "${NC}4. Update dashboard/.env.local with your Firebase configuration${NC}"
echo -e "${NC}5. Update firmware/src/main.cpp with your WiFi and Firebase credentials${NC}"
echo -e "${NC}6. Run 'npm run dev' to start the dashboard${NC}"
echo -e "${NC}7. Upload firmware to ESP32 using Arduino IDE or PlatformIO${NC}"

echo -e "\n${YELLOW}For detailed setup instructions, see docs/SETUP.md${NC}"