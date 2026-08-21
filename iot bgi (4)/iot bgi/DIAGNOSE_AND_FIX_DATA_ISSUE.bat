@echo off
echo ============================================================
echo Data Issue Diagnosis and Fix
echo ============================================================
echo.

echo Step 1: Checking if backend is running...
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo [ISSUE] Backend is NOT running!
    echo.
    echo FIX: Start backend first
    echo   1. Open new terminal
    echo   2. cd "iot bgi (4)\iot bgi\backend_python"
    echo   3. Run: python start.py
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Backend is running
)
echo.

echo Step 2: Testing backend API endpoints...
curl -s http://localhost:8000/api/sensor_data > temp_response.json
if errorlevel 1 (
    echo [ISSUE] Cannot reach backend API
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Backend API is responding
)
echo.

echo Step 3: Checking if data exists in Firebase...
type temp_response.json | find "flow_in" >nul 2>&1
if errorlevel 1 (
    echo [ISSUE] No sensor data found in Firebase!
    echo.
    echo FIX: Send test data to Firebase
    echo   Option 1: Run test script
    cd "iot bgi (4)\iot bgi\backend_python"
    python fresh_test_data.py
    echo.
    echo Test data sent successfully!
) else (
    echo [OK] Sensor data exists
)
echo.

del temp_response.json 2>nul

echo Step 4: Testing dashboard connectivity...
echo Open this URL in browser: http://localhost:3000
echo.
echo If frontend not running:
echo   1. Open new terminal
echo   2. cd "iot bgi (4)\iot bgi\pole-guardian\dashboard"
echo   3. Run: npm start
echo.

echo ============================================================
echo Diagnosis Complete!
echo ============================================================
echo.
echo Next Steps:
echo 1. Ensure backend is running (http://localhost:8000)
echo 2. Ensure frontend is running (http://localhost:3000)
echo 3. Check browser console for errors (F12)
echo.
pause
