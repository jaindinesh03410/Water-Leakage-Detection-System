@echo off
color 0A
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                                                                ║
echo ║              DATA FIX - Automated Solution                     ║
echo ║                                                                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo.

echo [1/3] Checking if backend is running...
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ Backend is NOT running!
    echo.
    echo Starting backend now...
    echo.
    start "IoT Backend" cmd /k "cd backend_python && python start.py"
    echo.
    echo ✅ Backend started in new window
    echo.
    echo Waiting 10 seconds for backend to initialize...
    timeout /t 10 /nobreak
) else (
    echo ✅ Backend is already running
)

echo.
echo [2/3] Sending fresh test data to Firebase...
cd "iot bgi (4)\iot bgi\backend_python"
python fresh_test_data.py

echo.
echo [3/3] Running automated diagnostic and fix...
python fix_data_issue.py

echo.
echo ═══════════════════════════════════════════════════════════════
echo.
echo ✅ FIX COMPLETE!
echo.
echo Next steps:
echo   1. Start frontend if not running:
echo      cd dashboard ^&^& npm start
echo.
echo   2. Open dashboard:
echo      http://localhost:3000
echo.
echo   3. Data should appear within 3-5 seconds
echo.
echo ═══════════════════════════════════════════════════════════════
echo.
pause
