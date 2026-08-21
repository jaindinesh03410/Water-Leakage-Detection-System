# IoT Water Intelligence Backend - PowerShell Launcher

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "IoT Water Intelligence Backend - PowerShell Launcher" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from python.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "main.py")) {
    Write-Host "❌ ERROR: main.py not found" -ForegroundColor Red
    Write-Host "Please run this script from the backend_python directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Checking setup..." -ForegroundColor Yellow
Write-Host ""

# Run setup check
$setupCheck = python setup_check.py
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Setup check failed. Please fix the issues above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
python start.py

Read-Host "Press Enter to exit"
