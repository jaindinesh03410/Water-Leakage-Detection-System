# Backend Troubleshooting Guide

This guide covers common issues and solutions for running the IoT Water Intelligence Backend.

## 🔍 Quick Diagnosis

Run this command first to diagnose issues:
```bash
python setup_check.py
```

This will automatically check:
- Python version
- Installed dependencies
- Environment configuration
- Firebase credentials
- Firebase connection
- Port availability

---

## ❌ Common Issues & Solutions

### Issue 1: "Python is not recognized"

**Error:**
```
'python' is not recognized as an internal or external command
```

**Solution:**
1. Install Python 3.8+ from [python.org](https://www.python.org/downloads/)
2. During installation, check "Add Python to PATH"
3. Restart your terminal/command prompt
4. Verify: `python --version`

---

### Issue 2: "No module named 'fastapi'"

**Error:**
```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```bash
# Install all dependencies
pip install -r requirements.txt

# Or install individually
pip install fastapi uvicorn firebase-admin python-dotenv requests
```

**If still failing:**
```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Then install again
pip install -r requirements.txt
```

---

### Issue 3: "Firebase credentials not found"

**Error:**
```
FileNotFoundError: Firebase credentials not found: firebase-key.json
```

**Solution:**

**Step 1:** Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ (Settings) > Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate new private key"
6. Click "Generate key" button
7. Save the downloaded file

**Step 2:** Place the File
1. Rename the downloaded file to `firebase-key.json`
2. Place it in the `backend_python` folder
3. Verify the path matches `.env` setting

**Step 3:** Verify
```bash
# Check if file exists
dir firebase-key.json    # Windows CMD
ls firebase-key.json     # PowerShell/Linux
```

---

### Issue 4: "Address already in use" / Port Conflict

**Error:**
```
ERROR:    [Errno 10048] error while attempting to bind on address ('0.0.0.0', 8000)
```

**Solution 1:** Change Port
1. Open `.env` file
2. Change `PORT=8000` to `PORT=8001` (or any other free port)
3. Save and restart

**Solution 2:** Kill Process Using Port
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

---

### Issue 5: "Firebase connection failed"

**Error:**
```
Firebase initialization error: [error details]
```

**Possible Causes & Solutions:**

**A. Invalid Database URL**
- Check `.env` file
- Ensure `FIREBASE_DATABASE_URL` is correct
- Format: `https://your-project-id.firebaseio.com` or `https://your-project-id.region.firebasedatabase.app`
- Get correct URL from Firebase Console > Realtime Database

**B. Database Not Enabled**
1. Go to Firebase Console
2. Navigate to Realtime Database
3. Click "Create Database" if not exists
4. Choose location
5. Start in test mode (for development)

**C. Invalid Credentials**
1. Verify `firebase-key.json` is valid JSON
2. Re-download if corrupted
3. Check file permissions

**D. Database Rules**
Ensure your database allows read/write:
1. Go to Firebase Console > Realtime Database > Rules
2. For development, use:
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
3. For production, use proper security rules

---

### Issue 6: "No data found in sensor_data path"

**Warning:**
```
⚠ No data found in Firebase sensor_data path
```

**This is NOT an error if:**
- ESP32 hasn't sent data yet
- First time setup
- Database is empty

**Solution:**
1. Backend will work fine, just waiting for data
2. Upload and run ESP32 code to start sending data
3. Use test scripts to populate sample data:
   ```bash
   python test_esp32_data.py
   ```

---

### Issue 7: ".env file not found"

**Warning:**
```
⚠ Warning: .env file not found
```

**Solution:**
```bash
# Copy template
copy .env.example .env

# Edit .env file with your details:
# FIREBASE_CREDENTIALS_PATH=firebase-key.json
# FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
# PORT=8000
```

---

### Issue 8: CORS Errors from Dashboard

**Error in browser console:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
Backend already has CORS enabled for all origins. If still failing:

1. Check backend is running: `http://localhost:8000/health`
2. Verify dashboard is using correct backend URL
3. Check browser console for actual error
4. Try clearing browser cache

---

### Issue 9: Slow Response / Timeouts

**Symptoms:**
- API calls take too long
- Timeout errors
- Slow dashboard loading

**Solutions:**

**A. Check Firebase Connection**
```bash
python firebase_console_test.py
```

**B. Check Internet Connection**
- Firebase requires internet access
- Check firewall settings

**C. Reduce Refresh Rate**
In `main.py`, change cache refresh interval:
```python
time.sleep(5)  # Change from 3 to 5 seconds
```

---

### Issue 10: Import Errors After Installation

**Error:**
```
ImportError: cannot import name 'FastAPI' from 'fastapi'
```

**Solution:**
```bash
# Uninstall all packages
pip uninstall fastapi uvicorn firebase-admin python-dotenv requests -y

# Reinstall with specific versions
pip install -r requirements.txt --force-reinstall
```

---

## 🔧 Advanced Troubleshooting

### Enable Debug Logging

**In main.py, line 68:**
Uncomment the debug line:
```python
print(f"Cache refreshed at {_cache['last_updated']}")
```

### Test Individual Components

**1. Test Python Installation:**
```bash
python --version
pip --version
```

**2. Test Package Imports:**
```bash
python -c "import fastapi; print('FastAPI OK')"
python -c "import firebase_admin; print('Firebase OK')"
python -c "import uvicorn; print('Uvicorn OK')"
```

**3. Test Firebase Connection:**
```bash
python firebase_console_test.py
```

**4. Test API Endpoints:**
```bash
python test_api.py
```

### Check File Permissions

Ensure backend has read access:
```bash
# Check firebase-key.json permissions
icacls firebase-key.json
```

### Check Windows Firewall

If backend runs but can't be accessed:
1. Windows Defender Firewall > Allow an app
2. Add Python to allowed apps
3. Or temporarily disable firewall to test

---

## 📞 Still Having Issues?

### Collect Diagnostic Information

Run and save output:
```bash
python setup_check.py > diagnostic.txt
```

### Check These:
1. Python version: `python --version`
2. Installed packages: `pip list`
3. Environment variables: `type .env`
4. File existence: `dir`
5. Port status: `netstat -ano | findstr :8000`

### Common Solutions Summary

1. **Can't start:** Run `python setup_check.py`
2. **Import errors:** Run `pip install -r requirements.txt`
3. **Firebase errors:** Check credentials file and database URL
4. **Port errors:** Change PORT in .env
5. **No data:** Wait for ESP32 or run test scripts
6. **Slow:** Check internet and Firebase connection

---

## ✅ Verification Checklist

Before reporting issues, verify:

- [ ] Python 3.8+ installed
- [ ] All packages installed: `pip list`
- [ ] `.env` file exists with correct values
- [ ] `firebase-key.json` exists and is valid JSON
- [ ] Firebase Realtime Database is enabled
- [ ] Database rules allow access
- [ ] Port is available
- [ ] Internet connection is working
- [ ] Firewall allows Python
- [ ] Running from correct directory

---

## 🚀 Quick Reset

If everything is broken, start fresh:

```bash
# 1. Delete virtual environment (if using)
rmdir /s venv

# 2. Reinstall packages
pip install -r requirements.txt --force-reinstall

# 3. Recreate .env
copy .env.example .env

# 4. Verify setup
python setup_check.py

# 5. Start fresh
python start.py
```
