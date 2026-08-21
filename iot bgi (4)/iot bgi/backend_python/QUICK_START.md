# 🚀 Quick Start Guide - Backend Setup in 5 Minutes

## Prerequisites
- Windows PC
- Python 3.8+ installed
- Firebase project created

---

## Step 1: Install Dependencies (1 minute)

Open Command Prompt or PowerShell in the `backend_python` folder and run:

```bash
pip install -r requirements.txt
```

**Wait for installation to complete...**

---

## Step 2: Get Firebase Credentials (2 minutes)

### A. Download Credentials File

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Click ⚙️ Settings → Project Settings
4. Click "Service Accounts" tab
5. Click "Generate new private key"
6. Save as `firebase-key.json` in this folder

### B. Get Database URL

1. In Firebase Console, go to "Realtime Database"
2. Copy your database URL (looks like: `https://your-project.firebaseio.com`)

---

## Step 3: Configure Environment (30 seconds)

1. Copy the example file:
   ```bash
   copy .env.example .env
   ```

2. Open `.env` in notepad and paste your database URL:
   ```
   FIREBASE_CREDENTIALS_PATH=firebase-key.json
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   PORT=8000
   ```

3. Save and close

---

## Step 4: Verify Setup (30 seconds)

Run the setup checker:
```bash
python setup_check.py
```

**All checks should pass ✓**

---

## Step 5: Start Backend (10 seconds)

### Option A: Simple Start
```bash
python start.py
```

### Option B: Double-click Launcher
- Double-click `run_backend.bat` (for CMD)
- Or `run_backend.ps1` (for PowerShell)

---

## ✅ Success!

If you see:
```
IoT Water Intelligence Backend - Startup Check
============================================================
✓ All checks passed! Backend is ready to run.
============================================================
...
INFO: Uvicorn running on http://0.0.0.0:8000
```

**Your backend is running! 🎉**

---

## Test It

Open browser and visit:
- http://localhost:8000 - Should show service info
- http://localhost:8000/health - Should show "healthy"
- http://localhost:8000/docs - Interactive API documentation

---

## Next Steps

1. **Upload ESP32 Code** - To start sending sensor data
2. **Run Dashboard** - To visualize the data
3. **Test API** - Use test scripts to verify everything works

---

## 🆘 Something Not Working?

### Quick Fixes:

**"Python not found"**
```bash
# Install from: https://www.python.org/downloads/
# Make sure to check "Add Python to PATH"
```

**"Module not found"**
```bash
pip install -r requirements.txt --force-reinstall
```

**"Port already in use"**
- Change `PORT=8000` to `PORT=8001` in `.env`

**"Firebase error"**
- Verify `firebase-key.json` exists in this folder
- Check database URL in `.env` is correct
- Ensure Realtime Database is enabled in Firebase

**For detailed help:**
- Read `TROUBLESHOOTING.md`
- Run `python setup_check.py` for diagnosis

---

## 🎯 That's It!

You're now ready to use the IoT Water Intelligence System backend.

**Keep this terminal open** - Closing it will stop the backend.

To stop the backend: Press `Ctrl+C`
