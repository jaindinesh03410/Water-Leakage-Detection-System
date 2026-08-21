@echo off
color 0B
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║          Backend Data Flow - Quick Diagnostic                  ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

cd "iot bgi (4)\iot bgi\backend_python"

echo [Step 1] Checking if backend is running...
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend is NOT running
    echo.
    echo Starting backend now...
    start "IoT Backend" cmd /k "python start.py"
    echo ✅ Backend started in new window
    echo.
    echo Waiting 10 seconds for initialization...
    timeout /t 10 /nobreak
) else (
    echo ✅ Backend is running
)

echo.
echo [Step 2] Checking cache status...
echo.
curl -s http://localhost:8000/debug/cache

echo.
echo.
echo [Step 3] Running complete diagnostic...
echo.
python diagnose_data_flow.py

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo Quick Tests:
echo   Backend Health:  curl http://localhost:8000/health
echo   Cache Status:    curl http://localhost:8000/debug/cache
echo   Sensor Data:     curl http://localhost:8000/api/sensor_data
echo.
echo Send Test Data:  python fresh_test_data.py
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
pause
