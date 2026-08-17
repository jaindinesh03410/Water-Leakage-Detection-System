#!/usr/bin/env python3
"""
Vibration Alert Test - Focus on theft detection
"""

import firebase_admin
from firebase_admin import credentials, db
import os
import time
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
    print("🔥 Initializing Firebase connection...")
    db_ref = init_firebase()
    
    if not db_ref:
        print("❌ Failed to initialize Firebase")
        return
    
    print("✅ Firebase connected successfully!")
    print("📳 VIBRATION ALERT TEST STARTING...")
    
    # Test 1: ONLY Vibration Alert (Normal everything else)
    print(f"\n📊 Test 1: VIBRATION ALERT ONLY")
    sensor_data = {
        "flow_in": 14.5,
        "flow_out": 14.2,
        "temperature": 25.3,
        "leakage_detected": False,        # Normal
        "pressure": 1075.5,              # Normal  
        "vibration_alert": True,         # 🚨 THEFT DETECTED!
        "low_pressure_alert": False,     # Normal
        "valve1_status": True,           # Open
        "valve2_status": True,           # Open
        "total_litres_1": 1250.5,
        "total_litres_2": 1247.2,
        "flow_difference": 0.3,
        "system_efficiency": 97.9,
        "last_updated": datetime.now().isoformat()
    }
    
    db_ref.child('sensor_data').set(sensor_data)
    print(f"   🚨 VIBRATION DETECTED!")
    print(f"   ✅ Flow: Normal ({sensor_data['flow_in']} L/min)")
    print(f"   ✅ Pressure: Normal ({sensor_data['pressure']} hPa)")
    print(f"   🚨 Vibration: ALERT!")
    
    time.sleep(5)
    
    # Test 2: Vibration + slight flow increase (tampering)
    print(f"\n📊 Test 2: VIBRATION + TAMPERING PATTERN")
    sensor_data.update({
        "flow_in": 18.2,                # Higher flow (suspicious)
        "flow_out": 17.8,
        "vibration_alert": True,        # Still vibrating
        "flow_difference": 0.4,
        "system_efficiency": 97.8,
        "last_updated": datetime.now().isoformat()
    })
    
    db_ref.child('sensor_data').set(sensor_data)
    print(f"   🚨 THEFT PATTERN: Vibration + High Flow!")
    print(f"   📊 Flow increased to: {sensor_data['flow_in']} L/min")
    print(f"   🚨 Vibration: STILL ACTIVE!")
    
    time.sleep(5)
    
    # Test 3: Clear vibration, return to normal
    print(f"\n📊 Test 3: VIBRATION CLEARED")
    sensor_data.update({
        "flow_in": 15.1,
        "flow_out": 14.8,
        "vibration_alert": False,       # 🟢 Vibration cleared
        "flow_difference": 0.3,
        "system_efficiency": 98.0,
        "last_updated": datetime.now().isoformat()
    })
    
    db_ref.child('sensor_data').set(sensor_data)
    print(f"   ✅ Vibration Alert Cleared")
    print(f"   ✅ System back to normal operation")
    
    print(f"\n🎉 Vibration test completed!")
    print(f"🔗 Check dashboard: http://localhost:3000")
    print(f"🔗 Check alerts API: http://localhost:8000/api/alerts_live")
    print(f"\n📱 Dashboard should show:")
    print(f"   - Vibration Status: NORMAL")
    print(f"   - Theft Risk: Low")
    print(f"   - All systems operational")

if __name__ == "__main__":
    main()