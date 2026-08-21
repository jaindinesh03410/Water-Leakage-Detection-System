from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials
import google.auth.transport.requests
import google.oauth2.service_account
import os
import uvicorn
import requests as http_requests
import threading
import time
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="IoT Water Intelligence Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_cache = {
    "sensor_data": {},
    "last_updated": None
}

CRED_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-key.json')
DB_URL = os.getenv('FIREBASE_DATABASE_URL', 'https://iot-bgi-default-rtdb.asia-southeast1.firebasedatabase.app').rstrip('/')
PORT = int(os.getenv('PORT', 8000))

_google_creds = None

SCOPES = [
    'https://www.googleapis.com/auth/firebase.database',
    'https://www.googleapis.com/auth/userinfo.email'
]

def get_access_token():
    """Get a fresh Google OAuth token, refreshing if expired."""
    global _google_creds
    if _google_creds is None:
        _google_creds = google.oauth2.service_account.Credentials.from_service_account_file(
            CRED_PATH, scopes=SCOPES
        )
    if not _google_creds.valid or _google_creds.expiry is None:
        _google_creds.refresh(google.auth.transport.requests.Request())
    return _google_creds.token

def firebase_get(path: str):
    """Read a path from Firebase Realtime DB via REST — works with all regions."""
    url = f"{DB_URL}/{path}.json"
    token = get_access_token()
    resp = http_requests.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=10)
    resp.raise_for_status()
    return resp.json()

def firebase_set(path: str, data: dict):
    """Write to Firebase Realtime DB via REST."""
    url = f"{DB_URL}/{path}.json"
    token = get_access_token()
    resp = http_requests.put(url, json=data, headers={"Authorization": f"Bearer {token}"}, timeout=10)
    resp.raise_for_status()
    return resp.json()

def load_initial_data():
    """Fetch sensor_data once at startup."""
    try:
        data = firebase_get('sensor_data')
        if data and isinstance(data, dict):
            _cache["sensor_data"] = data
            _cache["last_updated"] = datetime.now().isoformat()
            print(f"✓ Initial data loaded | flow_in={data.get('flow_in', 'N/A')} L/min")
        else:
            print("⚠ No data at sensor_data path yet — waiting for ESP32")
    except Exception as e:
        print(f"⚠ Could not load initial data: {e}")

def poll_firebase():
    """Background thread: polls Firebase every second via REST."""
    print("▶ Firebase REST polling started (1s interval)")
    while True:
        try:
            data = firebase_get('sensor_data')
            if data and isinstance(data, dict):
                if data != _cache["sensor_data"]:
                    _cache["sensor_data"] = data
                    _cache["last_updated"] = datetime.now().isoformat()
                    print(f"🔄 Data updated | flow_in={data.get('flow_in', 'N/A')} | ts={data.get('last_updated', '')}")
        except Exception as e:
            print(f"⚠ Poll error: {e}")
        time.sleep(1)

def init_firebase():
    """Validate credentials and start the REST polling thread."""
    if not os.path.exists(CRED_PATH):
        raise FileNotFoundError(f"Firebase credentials not found: {CRED_PATH}")

    print(f"✓ Credentials: {CRED_PATH}")
    print(f"✓ Database URL: {DB_URL}")

    # Validate token fetch works
    token = get_access_token()
    print(f"✓ OAuth token obtained (len={len(token)})")

    # Load existing data right now
    load_initial_data()

    # Start background poll
    t = threading.Thread(target=poll_firebase, daemon=True)
    t.start()
    print("✓ Background REST polling thread active")

@app.on_event("startup")
async def startup():
    print("=" * 60)
    print("IoT Water Intelligence Backend Starting...")
    print("=" * 60)
    try:
        init_firebase()
        print("=" * 60)
        print("Backend ready!")
        print(f"Listening on http://0.0.0.0:{PORT}")
        print("=" * 60)
    except Exception as e:
        print(f"❌ STARTUP FAILED: {e}")
        raise

# ── helpers ──────────────────────────────────────────────────────────────────

def cached():
    return _cache["sensor_data"]

# ── endpoints ────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "ok", "service": "IoT Water Intelligence Backend"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "firebase": "connected" if _google_creds else "disconnected",
        "cache_has_data": len(_cache["sensor_data"]) > 0,
        "cache_updated": _cache["last_updated"],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/debug/cache")
async def debug_cache():
    d = _cache["sensor_data"]
    return {
        "cache_has_data": len(d) > 0,
        "cache_keys": list(d.keys()),
        "last_updated": _cache["last_updated"],
        "sample": {
            "flow_in": d.get("flow_in", "N/A"),
            "flow_out": d.get("flow_out", "N/A"),
            "pressure": d.get("pressure", "N/A"),
            "temperature": d.get("temperature", "N/A"),
        } if d else "empty"
    }

@app.get("/api/sensor_data")
async def get_sensor_data():
    return cached() or {}

@app.get("/api/flow_data")
async def get_flow_data():
    d = cached()
    if not d:
        return {}
    return {
        "flow_rate_in":       d.get("flow_in", 0),
        "flow_rate_out":      d.get("flow_out", 0),
        "temperature":        d.get("temperature", 0),
        "pressure":           d.get("pressure", 0),
        "leakage_detected":   d.get("leakage_detected", False),
        "vibration_alert":    d.get("vibration_alert", False),
        "low_pressure_alert": d.get("low_pressure_alert", False),
        "valve1_status":      d.get("valve1_status", False),
        "valve2_status":      d.get("valve2_status", False),
        "total_litres_1":     d.get("total_litres_1", 0),
        "total_litres_2":     d.get("total_litres_2", 0),
        "flow_difference":    d.get("flow_difference", 0),
        "system_efficiency":  d.get("system_efficiency", 0),
        "last_updated":       d.get("last_updated", ""),
        "calculated_leakage": d.get("flow_in", 0) - d.get("flow_out", 0)
    }

@app.get("/api/alerts_live")
async def get_alerts_live():
    d = cached()
    if not d:
        return {"alerts": [], "count": 0}
    alerts = []
    ts = d.get("last_updated", "")
    if d.get("leakage_detected"):
        alerts.append({"type": "leakage", "severity": "high",
            "message": "Water leakage detected in pipeline",
            "timestamp": ts, "value": d.get("flow_difference", 0)})
    if d.get("vibration_alert"):
        alerts.append({"type": "theft", "severity": "critical",
            "message": "Unauthorized access - vibration sensor triggered",
            "timestamp": ts, "value": True})
    if d.get("low_pressure_alert"):
        alerts.append({"type": "low_pressure", "severity": "critical",
            "message": "System pressure critically low",
            "timestamp": ts, "value": d.get("pressure", 0)})
    return {"alerts": alerts, "count": len(alerts)}

@app.get("/api/dashboard_summary")
async def get_dashboard_summary():
    d = cached()
    if not d:
        return {"status": "no_data"}
    fi = d.get("flow_in", 0)
    fo = d.get("flow_out", 0)
    return {
        "flow_metrics": {
            "flow_rate_in": fi, "flow_rate_out": fo,
            "leakage_rate": d.get("flow_difference", 0),
            "efficiency": d.get("system_efficiency", 0),
            "total_consumption_1": d.get("total_litres_1", 0),
            "total_consumption_2": d.get("total_litres_2", 0)
        },
        "system_status": {
            "pressure": d.get("pressure", 0),
            "temperature": d.get("temperature", 0),
            "valve1_status": d.get("valve1_status", False),
            "valve2_status": d.get("valve2_status", False),
            "vibration_detected": d.get("vibration_alert", False),
            "leakage_detected": d.get("leakage_detected", False),
            "last_updated": d.get("last_updated", "")
        },
        "alerts_summary": {
            "active_alerts": sum([
                bool(d.get("leakage_detected")),
                bool(d.get("vibration_alert")),
                bool(d.get("low_pressure_alert"))
            ]),
            "critical_count": sum([
                bool(d.get("leakage_detected")),
                bool(d.get("vibration_alert"))
            ]),
            "warning_count": int(bool(d.get("low_pressure_alert")))
        }
    }

# Legacy aliases
@app.get("/api/readings")
async def get_readings():
    return await get_sensor_data()

@app.get("/api/alerts")
async def get_alerts():
    return await get_alerts_live()

@app.get("/api/nodes")
async def get_nodes():
    d = cached()
    if not d:
        return {}
    return {"node_1": {
        "status": "normal" if d.get("flow_in", 0) > 0 else "offline",
        "flow_rate": d.get("flow_in", 0),
        "pressure": d.get("pressure", 0),
        "last_seen": d.get("last_updated", "")
    }}

@app.get("/api/analytics")
async def get_analytics():
    return await get_dashboard_summary()

@app.get("/api/quality")
async def get_quality():
    d = cached()
    if not d:
        return {}
    fi = d.get("flow_in", 0)
    fo = d.get("flow_out", 0)
    return {
        "efficiency": (fo / fi * 100) if fi > 0 else 0,
        "leakage_rate": d.get("flow_difference", 0),
        "pressure_status": "normal" if 1000 <= d.get("pressure", 0) <= 1200 else "abnormal",
        "last_updated": d.get("last_updated", "")
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=False)
