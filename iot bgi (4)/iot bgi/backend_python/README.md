# IoT Water Intelligence Python Backend

A FastAPI middleware backend that connects to Firebase Realtime Database and provides REST endpoints for the IoT Smart Water Intelligence System.

## 🚀 Quick Start (Windows)

### Option 1: Automated Setup (Recommended)
```bash
# Double-click one of these files:
run_backend.bat       # For Command Prompt
run_backend.ps1       # For PowerShell
```

### Option 2: Manual Setup
```bash
# 1. Check setup
python setup_check.py

# 2. Start server
python start.py
```

## 📋 Prerequisites

- Python 3.8 or higher
- Firebase project with Realtime Database enabled
- Firebase service account key file

## 🔧 Setup Instructions

### Step 1: Install Python Dependencies

```bash
cd "iot bgi (4)/iot bgi/backend_python"
pip install -r requirements.txt
```

### Step 2: Firebase Configuration

1. **Get Firebase Credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the downloaded file as `firebase-key.json` in the `backend_python` folder

2. **Configure Environment:**
   - Copy `.env.example` to `.env`:
     ```bash
     copy .env.example .env
     ```
   - Open `.env` and update:
     ```env
     FIREBASE_CREDENTIALS_PATH=firebase-key.json
     FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
     PORT=8000
     ```

### Step 3: Verify Setup

Run the setup verification script:
```bash
python setup_check.py
```

This will check:
- ✓ Python version compatibility
- ✓ All required packages installed
- ✓ Environment configuration
- ✓ Firebase credentials file
- ✓ Firebase database connection
- ✓ Port availability

### Step 4: Start the Backend

```bash
python start.py
```

Or directly:
```bash
python main.py
```

The server will start on `http://localhost:8000`

## 📡 API Endpoints

### Health & Status
- `GET /` - Service information
- `GET /health` - Health check with Firebase status

### Sensor Data
- `GET /api/sensor_data` - Raw sensor data from Firebase
- `GET /api/flow_data` - Processed flow metrics
- `GET /api/readings` - Legacy readings endpoint

### Alerts
- `GET /api/alerts_live` - Real-time active alerts
- `GET /api/alerts` - Legacy alerts endpoint

### System Status
- `GET /api/nodes` - Node status information
- `GET /api/dashboard_summary` - Complete dashboard data
- `GET /api/analytics` - Analytics summary
- `GET /api/quality` - Water quality metrics

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```

### Test Sensor Data
```bash
curl http://localhost:8000/api/sensor_data
```

### Using Python Test Scripts
```bash
python test_api.py              # Test all API endpoints
python firebase_console_test.py # Test Firebase connection
python test_esp32_data.py       # Simulate ESP32 data
```

## 🔍 Troubleshooting

### Issue: "Firebase credentials not found"
**Solution:**
1. Ensure `firebase-key.json` exists in `backend_python` folder
2. Check `.env` file has correct `FIREBASE_CREDENTIALS_PATH`
3. Verify file permissions

### Issue: "Port already in use"
**Solution:**
1. Change `PORT` in `.env` to another port (e.g., 8001)
2. Or stop the other service using port 8000:
   ```bash
   netstat -ano | findstr :8000
   taskkill /PID <PID> /F
   ```

### Issue: "Module not found" errors
**Solution:**
```bash
pip install -r requirements.txt --upgrade
```

### Issue: "Firebase connection failed"
**Solution:**
1. Verify `FIREBASE_DATABASE_URL` in `.env` is correct
2. Check Firebase Realtime Database is enabled in Firebase Console
3. Ensure database rules allow read/write:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

### Issue: "No data found in sensor_data path"
**Solution:**
This is normal if ESP32 hasn't sent data yet. The backend will work once ESP32 starts sending data.

## 📁 Firebase Database Structure

The backend reads from this Firebase structure:
```
/sensor_data
  ├── flow_in: number
  ├── flow_out: number
  ├── temperature: number
  ├── pressure: number
  ├── leakage_detected: boolean
  ├── vibration_alert: boolean
  ├── low_pressure_alert: boolean
  ├── valve1_status: boolean
  ├── valve2_status: boolean
  ├── total_litres_1: number
  ├── total_litres_2: number
  ├── flow_difference: number
  ├── system_efficiency: number
  └── last_updated: timestamp
```

## 🔄 How It Works

1. **Startup:** Backend connects to Firebase and loads initial data
2. **Caching:** Background thread refreshes data from Firebase every 3 seconds
3. **API Serving:** All endpoints serve cached data for fast response
4. **Real-time:** Cache updates automatically as ESP32 sends new data

## 📝 Files Description

- `main.py` - Main FastAPI application with all endpoints
- `start.py` - Startup script with validation
- `setup_check.py` - Comprehensive setup verification
- `listener.py` - Firebase realtime listener (optional)
- `run_backend.bat` - Windows batch launcher
- `run_backend.ps1` - Windows PowerShell launcher
- `requirements.txt` - Python dependencies
- `.env` - Environment configuration (create from .env.example)
- `firebase-key.json` - Firebase service account credentials

## 🛠️ Development

### Running with Auto-reload
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### View API Documentation
Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔐 Security Notes

- Never commit `firebase-key.json` to git
- Never commit `.env` file to git
- Both files are in `.gitignore`
- For production, use proper authentication and HTTPS