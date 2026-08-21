@echo off
echo ============================================================
echo IoT Water Intelligence Backend - Windows Launcher
echo ============================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from python.org
    pause
    exit /b 1
)

echo Python found!
echo.

REM Check if we're in the right directory
if not exist "main.py" (
    echo ERROR: main.py not found
    echo Please run this script from the backend_python directory
    pause
    exit /b 1
)

echo Checking setup...
python setup_check.py

if errorlevel 1 (
    echo.
    echo Setup check failed. Please fix the issues above.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo Starting Backend Server...
echo ============================================================
echo.

REM Start the server
python start.py

pause
