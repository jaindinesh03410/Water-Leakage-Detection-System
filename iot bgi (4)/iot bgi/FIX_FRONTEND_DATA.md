# 🔧 Frontend Data Issue - Complete Fix Guide

## Problem: Data nahi aa raha frontend me

Yeh issue kai reasons se ho sakta hai. Niche sabhi solutions diye gaye hain:

---

## 🔍 Quick Diagnosis

### 1. Check Backend Status
```bash
curl http://localhost:8000/health
```

**Expected:** `{"status":"healthy","firebase":"connected",...}`

**If fails:** Backend nahi chal raha → [Go to Solution 1](#solution-1-start-backend)

---

### 2. Check Data in Firebase
```bash
curl http://localhost:8000/api/sensor_data
```

**Expected:** Data with flow_in, flow_out, pressure, etc.

**If empty {}:** Firebase me data nahi hai → [Go to Solution 2](#solution-2-send-test-data)

---

### 3. Check Frontend is Running
Open: http://localhost:3000

**If fails:** Frontend nahi chal raha → [Go to Solution 3](#solution-3-start-frontend)

---

### 4. Check Browser Console
Press F12 in browser → Console tab

**If CORS errors:** CORS issue hai → [Go to Solution 4](#solution-4-fix-cors)

**If network errors:** API endpoint issue → [Go to Solution 5](#solution-5-fix-api-endpoint)

---

## ✅ SOLUTION 1: Start Backend

### Quick Start:
```bash
cd "iot bgi (4)\iot bgi\backend_python"
python start.py
```

### Or double-click:
```
backend_python/run_backend.bat
```

### Verify:
```bash
curl http://localhost:8000/health
```

Should show: `"status": "healthy"`

---

## ✅ SOLUTION 2: Send Test Data

Backend chal raha hai but Firebase me data nahi hai.

### Method 1: Fresh Test Data (Recommended)
```bash
cd "iot bgi (4)\iot bgi\backend_python"
python fresh_test_data.py
```

**This will:**
- ✅ Send realistic sensor data
- ✅ Create 3 different scenarios
- ✅ Update Firebase instantly
- ✅ Data immediately visible in dashboard

### Method 2: Continuous Simulation
```bash
python test_esp32_data.py
```

Sends 5 batches of data with 3-second intervals.

### Method 3: Specific Scenarios
```bash
# Normal operation
python test_api.py

# Vibration alert
python test_vibration_only.py

# With alerts
python test_with_alerts.py
```

### Verify Data Sent:
```bash
curl http://localhost:8000/api/sensor_data
```

Should show data like:
```json
{
  "flow_in": 15.6,
  "flow_out": 15.4,
  "temperature": 25.2,
  "pressure": 1052.8,
  ...
}
```

---

## ✅ SOLUTION 3: Start Frontend

### Start Dashboard:
```bash
cd "iot bgi (4)\iot bgi\pole-guardian\dashboard"
npm start
```

### Verify:
- Opens browser automatically at http://localhost:3000
- Should see dashboard loading
- Check console for errors (F12)

---

## ✅ SOLUTION 4: Fix CORS Issue

Agar browser console me yeh error aa raha hai:
```
Access to XMLHttpRequest blocked by CORS policy
```

### Fix 1: Backend Already Has CORS Enabled
Backend code me CORS already enabled hai:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # All origins allowed
    ...
)
```

### Fix 2: Clear Browser Cache
1. Press Ctrl+Shift+Delete
2. Clear cached images and files
3. Reload page (Ctrl+F5)

### Fix 3: Restart Backend
```bash
# Stop backend (Ctrl+C)
# Start again
python start.py
```

---

## ✅ SOLUTION 5: Fix API Endpoint

### Check Frontend API Configuration:

**File:** `dashboard/src/services/firebase.js`

Ensure this line is correct:
```javascript
const API_BASE = 'http://localhost:8000'
```

### If backend is on different port:
Change to:
```javascript
const API_BASE = 'http://localhost:8001'  // Your backend port
```

### Verify Endpoints:
```bash
# Test all endpoints
curl http://localhost:8000/api/sensor_data
curl http://localhost:8000/api/flow_data
curl http://localhost:8000/api/alerts_live
curl http://localhost:8000/api/dashboard_summary
```

---

## 🚀 Complete Step-by-Step Fix

### Step 1: Start Backend
```bash
cd "iot bgi (4)\iot bgi\backend_python"
python start.py
```

**Wait for:** "Backend ready! Server is running..."

---

### Step 2: Send Test Data
**In NEW terminal:**
```bash
cd "iot bgi (4)\iot bgi\backend_python"
python fresh_test_data.py
```

**Wait for:** "🎉 Fresh test data completed!"

---

### Step 3: Verify Backend Has Data
```bash
curl http://localhost:8000/api/flow_data
```

**Should see:** JSON with sensor values

---

### Step 4: Start Frontend
**In NEW terminal:**
```bash
cd "iot bgi (4)\iot bgi\pole-guardian\dashboard"
npm start
```

**Wait for:** Browser opens at http://localhost:3000

---

### Step 5: Check Dashboard
1. Dashboard should load
2. Data should appear within 3-5 seconds
3. Values should update automatically

---

## 🧪 Verify Everything Works

### Test 1: Backend Health
```bash
curl http://localhost:8000/health
```

✅ Expected:
```json
{"status": "healthy", "firebase": "connected"}
```

---

### Test 2: Sensor Data
```bash
curl http://localhost:8000/api/sensor_data
```

✅ Expected: Object with flow_in, flow_out, pressure, etc.

---

### Test 3: Flow Data
```bash
curl http://localhost:8000/api/flow_data
```

✅ Expected: Processed flow metrics

---

### Test 4: Alerts
```bash
curl http://localhost:8000/api/alerts_live
```

✅ Expected: `{"alerts": [], "count": 0}` or active alerts

---

### Test 5: Dashboard Summary
```bash
curl http://localhost:8000/api/dashboard_summary
```

✅ Expected: Complete dashboard data

---

### Test 6: Frontend Console
1. Open dashboard: http://localhost:3000
2. Press F12 → Console tab
3. Should see: No errors
4. Should see: API calls succeeding

---

## 📊 Data Flow Check

```
ESP32/Test Script → Firebase → Backend Cache → API → Frontend
     ✅               ✅          ✅           ✅      ✅
```

### Check Each Step:

**1. Data in Firebase?**
```bash
python fresh_test_data.py
```

**2. Backend reading Firebase?**
```bash
curl http://localhost:8000/api/sensor_data
```

**3. Frontend calling API?**
- Open browser console (F12)
- Check Network tab
- Should see calls to localhost:8000

**4. Frontend receiving data?**
- Check Console tab
- Should not have errors
- Check Elements tab → Components → State should have data

---

## 🐛 Common Issues & Fixes

### Issue: "Backend not running"
**Fix:**
```bash
cd "iot bgi (4)\iot bgi\backend_python"
python start.py
```

---

### Issue: "Firebase not connected"
**Fix:**
1. Check firebase-key.json exists
2. Check .env has correct FIREBASE_DATABASE_URL
3. Run: `python setup_check.py`

---

### Issue: "No data in Firebase"
**Fix:**
```bash
python fresh_test_data.py
```

---

### Issue: "Frontend not starting"
**Fix:**
```bash
cd dashboard
npm install
npm start
```

---

### Issue: "Port 8000 already in use"
**Fix:**
```bash
# Option 1: Kill process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Option 2: Change port in .env
PORT=8001
```

---

### Issue: "Data shows 0 or null"
**Fix:**
```bash
# Send fresh data
python fresh_test_data.py

# Wait 3 seconds for cache refresh
# Reload dashboard
```

---

## 🎯 One-Command Fix

Run all fixes at once:

```bash
# Terminal 1: Backend + Data
cd "iot bgi (4)\iot bgi\backend_python"
python start.py
# Wait for "Backend ready!"
# Then in NEW terminal:
python fresh_test_data.py

# Terminal 2: Frontend
cd "iot bgi (4)\iot bgi\pole-guardian\dashboard"
npm start
```

---

## 🆘 Still Not Working?

### Diagnostic Script:
```bash
cd "iot bgi (4)\iot bgi\backend_python"
python setup_check.py
```

### Check Logs:
1. Backend terminal: Any errors?
2. Frontend terminal: Any errors?
3. Browser console: Any errors?

### Manual Debug:
```bash
# 1. Test backend
curl http://localhost:8000/health

# 2. Test data endpoint
curl http://localhost:8000/api/sensor_data

# 3. Send test data
python fresh_test_data.py

# 4. Test again
curl http://localhost:8000/api/sensor_data

# 5. Check if values changed
```

---

## ✅ Success Checklist

- [ ] Backend running (check: http://localhost:8000/health)
- [ ] Firebase has data (check: curl API endpoint)
- [ ] Frontend running (check: http://localhost:3000)
- [ ] No CORS errors (check: browser console)
- [ ] API calls successful (check: browser Network tab)
- [ ] Data visible in dashboard
- [ ] Values updating automatically

**All checked? Data should be flowing! 🎉**

---

## 💡 Pro Tips

1. **Keep 3 terminals open:**
   - Terminal 1: Backend (`python start.py`)
   - Terminal 2: Frontend (`npm start`)
   - Terminal 3: For testing (`python fresh_test_data.py`)

2. **Auto-refresh data:**
   - Dashboard auto-refreshes every 3 seconds
   - Backend cache refreshes every 3 seconds
   - No manual refresh needed

3. **Quick data reset:**
   ```bash
   python fresh_test_data.py
   ```
   Instantly updates all data

4. **Monitor in real-time:**
   - Backend terminal: Shows cache updates
   - Browser console: Shows API calls
   - Network tab: Shows data being received

---

## 🎉 Quick Summary

**Problem:** Data nahi aa raha frontend me

**Main Reasons:**
1. Backend not running
2. No data in Firebase
3. Frontend not running
4. API endpoint issues

**Quick Fix:**
```bash
# Start backend
cd backend_python && python start.py

# Send data (new terminal)
python fresh_test_data.py

# Start frontend (new terminal)
cd dashboard && npm start
```

**Result:** Data flowing in 30 seconds! 🚀
