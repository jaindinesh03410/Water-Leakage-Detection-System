# PoleGuardian Setup Script for Windows
# This script helps set up the development environment

Write-Host "PoleGuardian Smart Water Intelligence System Setup" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "`nChecking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    Write-Host "After installing Node.js, run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
Write-Host "`nChecking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "npm not found. Please ensure npm is installed with Node.js" -ForegroundColor Red
    exit 1
}

# Check if Firebase CLI is installed
Write-Host "`nChecking Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version
    Write-Host "Firebase CLI found: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "Firebase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
}

# Install dashboard dependencies
Write-Host "`nInstalling dashboard dependencies..." -ForegroundColor Yellow
Set-Location "dashboard"
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "Dashboard dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to install dashboard dependencies" -ForegroundColor Red
    exit 1
}

Set-Location ".."

# Create environment file template
Write-Host "`nCreating environment file template..." -ForegroundColor Yellow
$envTemplate = @"
# Firebase Configuration
# Replace these values with your actual Firebase project configuration

VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=pole-guardian.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://pole-guardian-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=pole-guardian
VITE_FIREBASE_STORAGE_BUCKET=pole-guardian.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
"@

$envTemplate | Out-File -FilePath "dashboard\.env.local" -Encoding UTF8
Write-Host "Environment template created at dashboard\.env.local" -ForegroundColor Green

# Setup complete
Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Create a Firebase project at https://console.firebase.google.com/" -ForegroundColor White
Write-Host "2. Enable Realtime Database in Singapore region" -ForegroundColor White
Write-Host "3. Enable Anonymous Authentication" -ForegroundColor White
Write-Host "4. Update dashboard\.env.local with your Firebase configuration" -ForegroundColor White
Write-Host "5. Update firmware\src\main.cpp with your WiFi and Firebase credentials" -ForegroundColor White
Write-Host "6. Run 'npm run dev' to start the dashboard" -ForegroundColor White
Write-Host "7. Upload firmware to ESP32 using Arduino IDE or PlatformIO" -ForegroundColor White

Write-Host "`nFor detailed setup instructions, see docs\SETUP.md" -ForegroundColor Yellow