from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, db
import os
import uvicorn
from datetime import datetime

app = FastAPI(title="IoT Water Intelligence Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

firebase_app = None
db_ref = None

def init_firebase():
    global firebase_app, db_ref
    try:
        cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-key.json')
        db_url = os.getenv('FIREBASE_DATABASE_URL', 'https://iot-bgi-default-rtdb.asia-southeast1.firebasedatabase.app')
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            cred = credentials.ApplicationDefault()
        firebase_app = firebase_admin.initialize_app(cred, {'databaseURL': db_url})
        db_ref = db.reference()
        print("Firebase initialized successfully")
    except Exception as e:
        print(f"Firebase initialization error: {e}")

@app.on_event("startup")
async def startup():
    init_firebase()

@app.get("/")
async def root():
    return {"status": "ok", "service": "IoT Water Intelligence Backend"}

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "firebase": "connected" if firebase_app else "disconnected",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/sensor_data")
async def get_sensor_data():
    try:
        if not db_ref:
            return {"error": "Firebase not initialized"}
        data = db_ref.child('sensor_data').get()
        return data if data else {}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/flow_data")
async def get_flow_data():
    try:
        if not db_ref:
            return {"error": "Firebase not initialized"}
        d = db_ref.child('sensor_data').get()
        if not d:
            return {}
        return {
            "flow_rate_in":      d.get("flow_in", 0),
            "flow_rate_out":     d.get("flow_out", 0),
            "temperature":       d.get("temperature", 0),
            "pressure":          d.get("pressure", 0),
            "leakage_detected":  d.get("leakage_detected", False),
            "vibration_alert":   d.get("vibration_alert", False),
            "low_pressure_alert":d.get("low_pressure_alert", False),
            "valve1_status":     d.get("valve1_status", False),
            "valve2_status":     d.get("valve2_status", False),
            "total_litres_1":    d.get("total_litres_1", 0),
            "total_litres_2":    d.get("total_litres_2", 0),
            "flow_difference":   d.get("flow_difference", 0),
            "system_efficiency": d.get("system_efficiency", 0),
            "last_updated":      d.get("last_updated", ""),
            "calculated_leakage":d.get("flow_in", 0) - d.get("flow_out", 0)
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/alerts_live")
async def get_alerts_live():
    try:
        if not db_ref:
            return {"alerts": [], "count": 0}
        d = db_ref.child('sensor_data').get()
        if not d:
            return {"alerts": [], "count": 0}
        alerts = []
        ts = d.get("last_updated", "")
        if d.get("leakage_detected", False):
            alerts.append({"type": "leakage", "severity": "high",
                "message": "Water leakage detected in pipeline",
                "timestamp": ts, "value": d.get("flow_difference", 0)})
        if d.get("vibration_alert", False):
            alerts.append({"type": "theft", "severity": "critical",
                "message": "Unauthorized access detected - vibration sensor triggered",
                "timestamp": ts, "value": True})
        if d.get("low_pressure_alert", False):
            alerts.append({"type": "low_pressure", "severity": "critical",
                "message": "System pressure critically low",
                "timestamp": ts, "value": d.get("pressure", 0)})
        pressure = d.get("pressure", 0)
        if pressure > 0 and (pressure < 1000 or pressure > 1200):
            alerts.append({"type": "pressure", "severity": "medium",
                "message": f"Abnormal pressure: {pressure} hPa",
                "timestamp": ts, "value": pressure})
        return {"alerts": alerts, "count": len(alerts)}
    except Exception as e:
        return {"alerts": [], "count": 0, "error": str(e)}

@app.get("/api/dashboard_summary")
async def get_dashboard_summary():
    try:
        if not db_ref:
            return {"error": "Firebase not initialized"}
        d = db_ref.child('sensor_data').get()
        if not d:
            return {"status": "no_data"}
        flow_in  = d.get("flow_in", 0)
        flow_out = d.get("flow_out", 0)
        return {
            "flow_metrics": {
                "flow_rate_in":       flow_in,
                "flow_rate_out":      flow_out,
                "leakage_rate":       d.get("flow_difference", 0),
                "efficiency":         d.get("system_efficiency", 0),
                "total_consumption_1":d.get("total_litres_1", 0),
                "total_consumption_2":d.get("total_litres_2", 0)
            },
            "system_status": {
                "pressure":           d.get("pressure", 0),
                "temperature":        d.get("temperature", 0),
                "valve1_status":      d.get("valve1_status", False),
                "valve2_status":      d.get("valve2_status", False),
                "vibration_detected": d.get("vibration_alert", False),
                "leakage_detected":   d.get("leakage_detected", False),
                "last_updated":       d.get("last_updated", "")
            },
            "alerts_summary": {
                "active_alerts":  sum([d.get("leakage_detected", False),
                                       d.get("vibration_alert", False),
                                       d.get("low_pressure_alert", False)]),
                "critical_count": sum([d.get("leakage_detected", False),
                                       d.get("vibration_alert", False)]),
                "warning_count":  int(d.get("low_pressure_alert", False))
            }
        }
    except Exception as e:
        return {"error": str(e)}

# Legacy endpoints
@app.get("/api/readings")
async def get_readings():
    return await get_sensor_data()

@app.get("/api/alerts")
async def get_alerts():
    return await get_alerts_live()

@app.get("/api/nodes")
async def get_nodes():
    try:
        if not db_ref:
            return {}
        d = db_ref.child('sensor_data').get()
        if not d:
            return {}
        return {"node_1": {"status": "normal" if d.get("flow_in", 0) > 0 else "offline",
                           "flow_rate": d.get("flow_in", 0),
                           "pressure": d.get("pressure", 0),
                           "last_seen": d.get("last_updated", "")}}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/analytics")
async def get_analytics():
    return await get_dashboard_summary()

@app.get("/api/quality")
async def get_quality():
    try:
        if not db_ref:
            return {}
        d = db_ref.child('sensor_data').get()
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
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    port = int(os.getenv('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
