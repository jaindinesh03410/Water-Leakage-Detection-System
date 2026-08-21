# Backend Testing Guide

Complete guide to test all backend functionality after fixes.

## 🧪 Pre-Startup Tests

### Test 1: Verify Files Exist
```bash
# Check all required files
dir main.py
dir start.py
dir setup_check.py
dir requirements.txt
dir .env
dir firebase-key.json
```

**Expected:** All files should exist

---

### Test 2: Run Setup Check
```bash
python setup_check.py
```

**Expected Output:**
```
============================================================
1. Python Version Check
============================================================
Python Version: 3.x.x
✓ Python version is compatible

============================================================
2. Dependencies Check
============================================================
✓ fastapi installed
✓ uvicorn installed
✓ firebase-admin installed
✓ python-dotenv installed
✓ requests installed

============================================================
3. Environment Configuration Check
============================================================
✓ .env file exists

Configuration:
  FIREBASE_DATABASE_URL: https://...
  FIREBASE_CREDENTIALS_PATH: firebase-key.json
  PORT: 8000

============================================================
4. Firebase Credentials Check
============================================================
✓ Credentials file exists: firebase-key.json
✓ Credentials file is valid
  Project ID: your-project-id
  Client Email: ...

============================================================
5. Firebase Connection Test
============================================================
✓ Successfully connected to Firebase
✓ Data exists in sensor_data path
  Data keys: [...]

============================================================
6. Port Availability Check
============================================================
✓ Port 8000 is available

============================================================
Summary
============================================================
Python Version: ✓ PASS
Dependencies: ✓ PASS
Environment Config: ✓ PASS
Firebase Credentials: ✓ PASS
Firebase Connection: ✓ PASS
Port Availability: ✓ PASS

============================================================
✓ All checks passed! Backend is ready to run.

Start the backend with:
  python start.py
============================================================
```

---

## 🚀 Startup Tests

### Test 3: Start Backend
```bash
python start.py
```

**Expected Output:**
```
============================================================
IoT Water Intelligence Backend - Startup Check
============================================================
✓ .env file found
✓ All required packages installed
✓ Firebase credentials found: firebase-key.json
============================================================

Starting IoT Water Intelligence Backend
Port: 8000
Database: https://...

Press Ctrl+C to stop the server
============================================================
============================================================
IoT Water Intelligence Backend Starting...
============================================================
Loading Firebase credentials from: firebase-key.json
✓ Firebase initialized successfully
✓ Connected to database: https://...
✓ Initial data loaded from Firebase
Cache refresh thread started
✓ Background cache refresh started
============================================================
Backend ready! Server is running...
============================================================
INFO:     Started server process [PID]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## 🌐 API Endpoint Tests

Once backend is running, test all endpoints:

### Test 4: Root Endpoint
```bash
curl http://localhost:8000/
```

**Expected:**
```json
{
  "status": "ok",
  "service": "IoT Water Intelligence Backend"
}
```

---

### Test 5: Health Check
```bash
curl http://localhost:8000/health
```

**Expected:**
```json
{
  "status": "healthy",
  "firebase": "connected",
  "cache_updated": "2024-01-01T12:00:00.000000",
  "timestamp": "2024-01-01T12:00:00.000000"
}
```

---

### Test 6: Sensor Data
```bash
curl http://localhost:8000/api/sensor_data
```

**Expected:** JSON object with sensor data
```json
{
  "flow_in": 45.5,
  "flow_out": 43.2,
  "temperature": 25.3,
  "pressure": 1050,
  ...
}
```

---

### Test 7: Flow Data
```bash
curl http://localhost:8000/api/flow_data
```

**Expected:** Processed flow metrics
```json
{
  "flow_rate_in": 45.5,
  "flow_rate_out": 43.2,
  "temperature": 25.3,
  "leakage_detected": false,
  "calculated_leakage": 2.3,
  ...
}
```

---

### Test 8: Alerts
```bash
curl http://localhost:8000/api/alerts_live
```

**Expected:** Active alerts array
```json
{
  "alerts": [],
  "count": 0
}
```

Or with active alerts:
```json
{
  "alerts": [
    {
      "type": "leakage",
      "severity": "high",
      "message": "Water leakage detected in pipeline",
      "timestamp": "...",
      "value": 5.2
    }
  ],
  "count": 1
}
```

---

### Test 9: Dashboard Summary
```bash
curl http://localhost:8000/api/dashboard_summary
```

**Expected:** Complete dashboard data
```json
{
  "flow_metrics": {
    "flow_rate_in": 45.5,
    "flow_rate_out": 43.2,
    ...
  },
  "system_status": {
    "pressure": 1050,
    "temperature": 25.3,
    ...
  },
  "alerts_summary": {
    "active_alerts": 0,
    "critical_count": 0,
    "warning_count": 0
  }
}
```

---

### Test 10: API Documentation
Open browser and visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

**Expected:** Interactive API documentation loads

---

## 🧩 Integration Tests

### Test 11: Test with Python Script
```bash
python test_api.py
```

**Expected:** All endpoints return 200 OK

---

### Test 12: Test ESP32 Data Simulation
```bash
python test_esp32_data.py
```

**Expected:** Sample data written to Firebase

---

### Test 13: Firebase Console Test
```bash
python firebase_console_test.py
```

**Expected:** Shows Firebase connection status and data

---

## 🔄 Continuous Operation Tests

### Test 14: Cache Refresh
1. Start backend
2. Watch console output
3. Data should refresh every 3 seconds

**Expected:** No errors in cache refresh

---

### Test 15: Multiple Requests
```bash
# Windows PowerShell
for ($i=1; $i -le 10; $i++) {
    curl http://localhost:8000/health
}
```

**Expected:** All requests return quickly (< 100ms)

---

### Test 16: Dashboard Connection
1. Start backend
2. Start dashboard (separate terminal)
3. Dashboard should display data

**Expected:** Dashboard shows live data from backend

---

## 🛑 Shutdown Tests

### Test 17: Graceful Shutdown
1. Press `Ctrl+C` in backend terminal

**Expected Output:**
```
^C
INFO:     Shutting down
INFO:     Finished server process [PID]
```

---

## ❌ Error Handling Tests

### Test 18: Missing Firebase Credentials
1. Rename `firebase-key.json` temporarily
2. Try to start backend

**Expected:**
```
❌ Firebase credentials file not found: firebase-key.json
Please ensure firebase-key.json exists in the backend_python directory
```

---

### Test 19: Invalid Database URL
1. Edit `.env` and set invalid URL
2. Try to start backend

**Expected:** Clear error message about Firebase connection

---

### Test 20: Port Already in Use
1. Start backend on port 8000
2. Try to start another instance

**Expected:** Error about port already in use

---

## ✅ Test Results Checklist

Mark each test as you complete it:

### Pre-Startup
- [ ] Test 1: Files exist
- [ ] Test 2: Setup check passes

### Startup
- [ ] Test 3: Backend starts successfully

### API Endpoints
- [ ] Test 4: Root endpoint works
- [ ] Test 5: Health check works
- [ ] Test 6: Sensor data works
- [ ] Test 7: Flow data works
- [ ] Test 8: Alerts work
- [ ] Test 9: Dashboard summary works
- [ ] Test 10: API docs load

### Integration
- [ ] Test 11: Test script passes
- [ ] Test 12: ESP32 simulation works
- [ ] Test 13: Firebase console test works

### Operation
- [ ] Test 14: Cache refreshes automatically
- [ ] Test 15: Multiple requests handled
- [ ] Test 16: Dashboard connects

### Shutdown
- [ ] Test 17: Graceful shutdown works

### Error Handling
- [ ] Test 18: Missing credentials detected
- [ ] Test 19: Invalid URL detected
- [ ] Test 20: Port conflict detected

---

## 📊 Performance Benchmarks

### Response Times (Expected)
- `/health` - < 50ms
- `/api/sensor_data` - < 50ms
- `/api/dashboard_summary` - < 100ms

### Memory Usage (Expected)
- Initial: ~50-80 MB
- Running: ~80-120 MB

### CPU Usage (Expected)
- Idle: < 1%
- Active requests: 5-10%

---

## 🎯 Success Criteria

**All tests should:**
1. ✅ Pass without errors
2. ✅ Return expected data format
3. ✅ Complete within expected time
4. ✅ Show clear error messages if failing

---

## 🆘 If Tests Fail

### Common Fixes:

**Setup check fails:**
```bash
pip install -r requirements.txt --force-reinstall
```

**Firebase connection fails:**
- Check `.env` database URL
- Verify `firebase-key.json` is valid
- Ensure Realtime Database is enabled

**API endpoints return empty data:**
- Check if ESP32 has sent data
- Run `python test_esp32_data.py` to populate test data
- Check Firebase Console for data

**Slow responses:**
- Check internet connection
- Verify Firebase connection
- Check system resources

---

## 📝 Test Log Template

Document your test results:

```
Test Date: _______________
Tester: __________________

Pre-Startup Tests: PASS / FAIL
Startup Tests: PASS / FAIL
API Endpoint Tests: PASS / FAIL
Integration Tests: PASS / FAIL
Operation Tests: PASS / FAIL
Shutdown Tests: PASS / FAIL
Error Handling Tests: PASS / FAIL

Issues Found:
1. _____________________
2. _____________________

Resolution:
1. _____________________
2. _____________________

Overall Status: PASS / FAIL
```

---

## 🚀 Quick Test Command

Run all automated tests at once:

```bash
# 1. Setup check
python setup_check.py

# 2. Start backend (in background)
start /B python start.py

# Wait 5 seconds for startup
timeout /t 5

# 3. Test all endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/sensor_data
curl http://localhost:8000/api/flow_data
curl http://localhost:8000/api/alerts_live
curl http://localhost:8000/api/dashboard_summary

# 4. Stop backend
taskkill /F /IM python.exe
```

---

**All tests passing = Backend is fully functional! ✅**
