# 🚀 Complete Start Guide

## Step 1: Open 2 Terminal Windows

### Windows:
- Press `Windows + R`
- Type `cmd` and press Enter
- Repeat for second terminal

### Or Use:
- PowerShell
- Windows Terminal
- VS Code Terminal

---

## Step 2: Start Backend (Terminal 1)

### Copy-Paste These Commands:

```bash
# Navigate to backend folder
cd "C:\Users\91910\Downloads\iot bgi (4) (1)\iot bgi (4)\iot bgi\backend_python"

# Start backend server
python main.py
```

### Expected Output:
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
Firebase initialized successfully
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### ✅ Backend Success Signs:
- `Firebase initialized successfully` ✅
- `Uvicorn running on http://0.0.0.0:8000` ✅
- No error messages ✅

---

## Step 3: Start Frontend (Terminal 2)

### Copy-Paste These Commands:

```bash
# Navigate to dashboard folder
cd "C:\Users\91910\Downloads\iot bgi (4) (1)\iot bgi (4)\iot bgi\pole-guardian\dashboard"

# Start frontend server
npm run dev
```

### Expected Output:
```
VITE v5.4.21  ready in 1783 ms
➜  Local:   http://localhost:3000/
➜  Network: http://192.168.137.87:3000/
➜  press h + enter to show help
```

### ✅ Frontend Success Signs:
- `VITE ready` ✅
- `Local: http://localhost:3000/` ✅
- No error messages ✅

---

## Step 4: Access Your Dashboard

### Open Browser and Go To:

```
http://localhost:3000/
```

### You Should See:
- 📊 Smart Water Dashboard
- 💧 Flow monitoring cards
- 📈 Real-time charts
- 🚨 Alert system

---

## Step 5: Test API (Optional)

### Open New Browser Tab:

```
http://localhost:8000/health
```

### Expected Response:
```json
{"status":"healthy","firebase":"connected"}
```

### Check Sensor Data:
```
http://localhost:8000/api/sensor_data
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Port already in use"
**Solution:**
```bash
# Stop existing processes
taskkill /f /im python.exe
taskkill /f /im node.exe

# Then restart
```

### Issue 2: "Firebase not initialized"
**Solution:**
- Check `firebase-key.json` exists in backend folder
- Check `.env` file has correct Firebase URL

### Issue 3: "Module not found"
**Solution:**
```bash
# Install Python dependencies
cd backend_python
pip install -r requirements.txt

# Install Node dependencies  
cd ../pole-guardian/dashboard
npm install
```

### Issue 4: "Permission denied"
**Solution:**
- Run terminal as Administrator
- Or use PowerShell instead of CMD

---

## 📱 Access URLs (After Both Started)

| Service | URL | Purpose |
|---------|-----|---------|
| **Dashboard** | `http://localhost:3000/` | Main IoT dashboard |
| **API Health** | `http://localhost:8000/health` | Backend status |
| **Sensor Data** | `http://localhost:8000/api/sensor_data` | Live sensor readings |
| **Flow Data** | `http://localhost:8000/api/flow_data` | Processed flow metrics |
| **Live Alerts** | `http://localhost:8000/api/alerts_live` | Real-time alerts |

---

## 🎯 Success Checklist

- [ ] Terminal 1 shows "Firebase initialized successfully"
- [ ] Terminal 2 shows "Local: http://localhost:3000/"
- [ ] Browser opens dashboard at `localhost:3000`
- [ ] API responds at `localhost:8000/health`
- [ ] No error messages in either terminal

---

## 🔄 To Stop Services

### Backend (Terminal 1):
```
Press Ctrl + C
```

### Frontend (Terminal 2):
```
Press Ctrl + C
```

---

## 📞 Next Steps

1. ✅ **Both services running** → Dashboard accessible
2. 🔧 **Upload ESP32 code** → Real sensor data
3. 📊 **Monitor dashboard** → Live IoT monitoring
4. 🚨 **Test alerts** → Leak detection working

**Your IoT system will be fully operational!** 🎉