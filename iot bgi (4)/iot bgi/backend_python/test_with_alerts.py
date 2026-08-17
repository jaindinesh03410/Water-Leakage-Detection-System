#!/usr/bin/env python3
"""
Test script with alerts - vibration + leakage simulation
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
    print("🚨 Simulating ALERT CONDITIONS...")
    
    # Test 1: High leakage + Normal vibration
    print(f"\n📊 Test 1: HIGH LEAKAGE ALERT")
    sensor_data = {
        "flow_in": 18.5,
        "flow_out": 15.2,  # 3.3 L/min difference (above 0.5 threshold)
        "temperature": 26.8,
        "leakage_detected": True,
        "pressure": 1045.5,  # Low pressure
        "vibration_alert": False,
        "low_pressure_alert": True,
        "valve1_status": False,  # Closed due to leak
        "valve2_status": False,  # Closed due to leak
        "total_litres_1": 1250.5,
        "total_litres_2": 1180.2,
        "flow_difference": 3.3,
        "system_efficiency": 82.2,
        "last_updated": datetime.now().isoformat()
    }
    
    db_ref.child('sensor_data').set(sensor_data)
    print(f"   ✅ Data sent: Leakage={sensor_data['leakage_detected']}, Low Pressure={sensor_data['low_pressure_alert']}")
    
    time.sleep(3)
    
    # Test 2: Vibration Alert (Theft Detection)
    print(f"\n📊 Test 2: THEFT/VIBRATION ALERT")
    sensor_data.update({
        "flow_in": 14.2,
        "flow_out": 13.8,
        "leakage_detected": False,
        "pressure": 1089.3,
        "vibration_alert": True,  # THEFT DETECTED!
        "low_pressure_alert": False,
        "valve1_status": True,
        "valve2_status": True,
        "flow_difference": 0.4,
        "system_efficiency": 97.2,
        "last_updated": datetime.now().isoformat()
    })
    
    db_ref.child('sensor_data').set(sensor_data)
    print(f"   ✅ Data sent: Vibration={sensor_data['vibration_alert']}, Pressure={sensor_data['pressure']}")
    
    time.sleep(3)
    
    # Test 3: Multiple Alerts
    print(f"\n📊 Test 3: MULTIPLE ALERTS")
    sensor_data.update({
        "flow_in": 20.1,
        "flow_out": 16.8,  # High leakage
        "leakage_detected": True,
        "pressure": 920.5,  # Very low pressure
        "vibration_alert": True,  # Vibration + Leakage + Low pressure
        "low_pressure_alert": True,
        "valve1_status": False,  # Emergency shutdown
        "valve2_status": False,
        "flow_difference": 3.3,
        "system_efficiency": 83.6,
        "last_updated": datetime.now().isoformat()
    })
    
    db_ref.child('sensor_data').set(sensor_data)
    print(f"   ✅ Data sent: ALL ALERTS ACTIVE!")
    print(f"   🚨 Leakage: {sensor_data['leakage_detected']}")
    print(f"   🚨 Vibration: {sensor_data['vibration_alert']}")
    print(f"   🚨 Low Pressure: {sensor_data['low_pressure_alert']}")
    
    time.sleep(3)
    
    # Test 4: Normal Operation (Clear alerts)
    print(f"\n📊 Test 4: NORMAL OPERATION")
    sensor_data.update({
        "flow_in": 15.2,
        "flow_out": 14.9,
        "leakage_detected": False,
        "pressure": 1055.8,  # Normal pressure
        "vibration_alert": False,
        "low_pressure_alert": False,
        "valve1_status": True,
        "valve2_status": True,
        "flow_difference": 0.3,
        "system_efficiency": 98.0,
        "last_updated": datetime.now().isoformat()
    })
    
    db_ref.child('sensor_data').set(sensor_data)
    print(f"   ✅ Data sent: All systems normal")
    
    print(f"\n🎉 Alert test completed!")
    print(f"🔗 Check dashboard: http://localhost:3000")
    print(f"🔗 Check alerts API: http://localhost:8000/api/alerts_live")

if __name__ == "__main__":
    main()