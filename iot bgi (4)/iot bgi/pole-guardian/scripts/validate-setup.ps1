# PoleGuardian Setup Validation Script
# This script validates that the project structure is correctly set up

Write-Host "PoleGuardian Setup Validation" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

$errors = 0
$warnings = 0

# Check project structure
Write-Host "`nValidating project structure..." -ForegroundColor Yellow

$requiredDirs = @(
    "firmware",
    "dashboard",
    "firebase", 
    "shared",
    "docs",
    "scripts"
)

$requiredFiles = @(
    "README.md",
    "package.json",
    ".gitignore",
    "firmware\platformio.ini",
    "firmware\src\main.cpp",
    "dashboard\package.json",
    "dashboard\vite.config.js",
    "dashboard\tailwind.config.js",
    "dashboard\index.html",
    "dashboard\src\main.jsx",
    "dashboard\src\App.jsx",
    "dashboard\src\services\firebase.js",
    "firebase\firebase.json",
    "firebase\database.rules.json",
    "firebase\.firebaserc",
    "shared\config.json",
    "shared\constants.js",
    "docs\SETUP.md"
)

foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✅ Directory: $dir" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing directory: $dir" -ForegroundColor Red
        $errors++
    }
}

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ File: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing file: $file" -ForegroundColor Red
        $errors++
    }
}

# Check configuration files
Write-Host "`nValidating configuration files..." -ForegroundColor Yellow

# Check if Firebase config needs updating
$firebaseConfig = Get-Content "dashboard\src\services\firebase.js" -Raw
if ($firebaseConfig -match "YOUR_API_KEY") {
    Write-Host "⚠️  Firebase configuration needs to be updated in dashboard\src\services\firebase.js" -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "✅ Firebase configuration appears to be updated" -ForegroundColor Green
}

# Check if ESP32 config needs updating
$esp32Config = Get-Content "firmware\src\main.cpp" -Raw
if ($esp32Config -match "YOUR_WIFI_SSID") {
    Write-Host "⚠️  ESP32 configuration needs to be updated in firmware\src\main.cpp" -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "✅ ESP32 configuration appears to be updated" -ForegroundColor Green
}

# Check if environment file exists
if (Test-Path "dashboard\.env.local") {
    Write-Host "✅ Environment file exists: dashboard\.env.local" -ForegroundColor Green
} else {
    Write-Host "⚠️  Environment file not found: dashboard\.env.local" -ForegroundColor Yellow
    Write-Host "   Run the setup script to create a template" -ForegroundColor Gray
    $warnings++
}

# Summary
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "Validation Summary" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "🎉 Perfect! Project structure is complete and ready." -ForegroundColor Green
} elseif ($errors -eq 0) {
    Write-Host "✅ Project structure is complete." -ForegroundColor Green
    Write-Host "⚠️  $warnings configuration items need attention." -ForegroundColor Yellow
} else {
    Write-Host "❌ $errors critical issues found." -ForegroundColor Red
    Write-Host "⚠️  $warnings warnings." -ForegroundColor Yellow
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
if ($errors -gt 0) {
    Write-Host "1. Fix the missing files/directories listed above" -ForegroundColor White
}
if ($warnings -gt 0) {
    Write-Host "2. Update configuration files as indicated" -ForegroundColor White
}
Write-Host "3. Follow the setup guide in docs\SETUP.md" -ForegroundColor White
Write-Host "4. Run scripts\setup.ps1 to install dependencies" -ForegroundColor White