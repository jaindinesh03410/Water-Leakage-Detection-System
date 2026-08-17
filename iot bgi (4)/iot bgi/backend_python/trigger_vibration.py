#!/usr/bin/env python3
"""
Active Vibration Alert Trigger
"""

import firebase_admin
from firebase_admin import credentials, db
import os
from datetime import datetime

def init_firebase():
    try:
        cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-key.json')
        db_url = os.getenv('FIREBASE_DATABASE_URL', 'https://iot-bgi-default-rtdb.asia-southeast1.firebasedatabase.app')
        
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            cred = credentials.ApplicationDefault()
        
        firebase_app = firebase_admin.initialize_app(cred, {
            'databaseURL': db_url
        })
        return db.reference()
    except Exception as e:
        print(f"Firebase initialization error: {e}")
        return None

def main():
    print("🚨 TRIGGERING ACTIVE VIBRATION ALERT...")
    db_ref = init_firebase()
    
    if not db_ref:
        print("❌ Failed to initialize Firebase")
        return
    
    # ACTIVE VIBRATION ALERT
    sensor_data = {
        "flow_in": 16.8,
        "flow_out": 16.3,
        "temperature": 27.1,
        "leakage_detected": False,
        "pressure": 1089.3,
        "vibration_alert": True,         # 🚨 ACTIVE THEFT ALERT!
        "low_pressure_alert": False,
        "valve1_status": True,
        "valve2_status": True,
        "total_litres_1": 1350.8,
        "total_litres_2": 1345.2,
        "flow_difference": 0.5,
        "system_efficiency": 97.0,
        "last_updated": datetime.now().isoformat()
    }
    
    db_ref.child('sensor_data').set(sensor_data)
    
    print(f"🚨 VIBRATION ALERT ACTIVE!")
    print(f"📊 Current Data:")
    print(f"   Flow: {sensor_data['flow_in']} L/min")
    print(f"   Vibration: {'🚨 DETECTED!' if sensor_data['vibration_alert'] else '✅ Normal'}")
    print(f"   Pressure: {sensor_data['pressure']} hPa")
    print(f"   Temperature: {sensor_data['temperature']} °C")
    
    print(f"\n🔗 Check NOW:")
    print(f"   Dashboard: http://localhost:3000/")
    print(f"   Alerts API: http://localhost:8000/api/alerts_live")
    print(f"\n📱 You should see VIBRATION ALERT on dashboard!")

if __name__ == "__main__":
    main()