#!/usr/bin/env python3
"""
Fresh Test Data - New realistic scenarios
"""

import firebase_admin
from firebase_admin import credentials, db
import os
import time
import random
from datetime import datetime

def init_firebase():
    try:
        try:
            firebase_admin.delete_app(firebase_admin.get_app())
        except:
            pass
            
        cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-key.json')
        db_url = os.getenv('FIREBASE_DATABASE_URL', 'https://iot-bgi-default-rtdb.asia-southeast1.firebasedatabase.app')
        
        cred = credentials.Certificate(cred_path)
        firebase_app = firebase_admin.initialize_app(cred, {
            'databaseURL': db_url
        })
        return db.reference()
    except Exception as e:
        print(f"Firebase initialization error: {e}")
        return None

def main():
    print("🔄 FRESH TEST DATA - New Scenario")
    db_ref = init_firebase()
    
    if not db_ref:
        print("❌ Failed to initialize Firebase")
        return
    
    print("✅ Firebase connected successfully!")
    print("🎯 Sending 3 different scenarios...")
    
    # Scenario 1: Normal Operation
    print(f"\n📊 Scenario 1: NORMAL OPERATION")
    scenario1 = {
        "flow_in": 12.8,
        "flow_out": 12.6,
        "temperature": 24.5,
        "pressure": 1045.2,
        "leakage_detected": False,
        "vibration_alert": False,
        "low_pressure_alert": False,
        "valve1_status": True,
        "valve2_status": True,
        "total_litres_1": 2156.7,
        "total_litres_2": 2148.3,
        "flow_difference": 0.2,
        "system_efficiency": 98.4,
        "timestamp": int(time.time() * 1000),
        "last_updated": datetime.now().isoformat(),
        "device_id": "ESP32_MAIN",
        "location": "Primary Pipeline",
        "status": "normal"
    }
    
    db_ref.child('sensor_data').set(scenario1)
    print(f"   ✅ Flow: {scenario1['flow_in']} → {scenario1['flow_out']} L/min")
    print(f"   ✅ All systems normal")
    
    time.sleep(4)
    
    # Scenario 2: High Flow + Leakage 
    print(f"\n📊 Scenario 2: HIGH FLOW + LEAKAGE ALERT")
    scenario2 = {
        "flow_in": 22.4,
        "flow_out": 18.9,
        "temperature": 26.8,
        "pressure": 1089.1,
        "leakage_detected": True,
        "vibration_alert": False,
        "low_pressure_alert": False,
        "valve1_status": False,  # Auto-closed due to leak
        "valve2_status": False,
        "total_litres_1": 2178.2,
        "total_litres_2": 2165.7,
        "flow_difference": 3.5,  # High leakage
        "system_efficiency": 84.4,
        "timestamp": int(time.time() * 1000),
        "last_updated": datetime.now().isoformat(),
        "device_id": "ESP32_MAIN",
        "location": "Primary Pipeline",
        "status": "leakage_alert"
    }
    
    db_ref.child('sensor_data').set(scenario2)
    print(f"   🚨 Flow: {scenario2['flow_in']} → {scenario2['flow_out']} L/min")
    print(f"   🚨 Leakage: {scenario2['flow_difference']} L/min difference")
    print(f"   🔴 Valves closed for safety")
    
    time.sleep(4)
    
    # Scenario 3: Night Time Theft Detection
    print(f"\n📊 Scenario 3: NIGHT THEFT DETECTION")
    scenario3 = {
        "flow_in": 8.2,
        "flow_out": 7.9,
        "temperature": 23.1,
        "pressure": 1067.5,
        "leakage_detected": False,
        "vibration_alert": True,  # Theft detected!
        "low_pressure_alert": False,
        "valve1_status": True,
        "valve2_status": True,
        "total_litres_1": 2185.4,
        "total_litres_2": 2182.8,
        "flow_difference": 0.3,
        "system_efficiency": 96.3,
        "timestamp": int(time.time() * 1000),
        "last_updated": datetime.now().isoformat(),
        "device_id": "ESP32_MAIN",
        "location": "Primary Pipeline",
        "status": "theft_alert",
        "night_mode": True,
        "theft_risk": 87
    }
    
    db_ref.child('sensor_data').set(scenario3)
    print(f"   🌙 Night time usage: {scenario3['flow_in']} L/min")
    print(f"   🚨 VIBRATION DETECTED - Possible theft!")
    print(f"   ⚠️  Theft risk: {scenario3['theft_risk']}%")
    
    time.sleep(3)
    
    # Final: Return to optimal operation
    print(f"\n📊 Final: OPTIMAL OPERATION")
    final_scenario = {
        "flow_in": 15.6,
        "flow_out": 15.4,
        "temperature": 25.2,
        "pressure": 1052.8,
        "leakage_detected": False,
        "vibration_alert": False,
        "low_pressure_alert": False,
        "valve1_status": True,
        "valve2_status": True,
        "total_litres_1": 2201.0,
        "total_litres_2": 2198.2,
        "flow_difference": 0.2,
        "system_efficiency": 98.7,
        "timestamp": int(time.time() * 1000),
        "last_updated": datetime.now().isoformat(),
        "device_id": "ESP32_MAIN",
        "location": "Primary Pipeline",
        "status": "optimal"
    }
    
    db_ref.child('sensor_data').set(final_scenario)
    print(f"   ✅ Perfect efficiency: {final_scenario['system_efficiency']}%")
    print(f"   ✅ All alerts cleared")
    
    print(f"\n🎉 Fresh test data completed!")
    print(f"🔗 Check updates:")
    print(f"   Dashboard: http://localhost:3000/")
    print(f"   Firebase Console: https://console.firebase.google.com/project/iot-bgi/database")
    print(f"   API: http://localhost:8000/api/flow_data")
    
    print(f"\n📊 Latest Values:")
    print(f"   Flow Rate: {final_scenario['flow_in']} L/min")
    print(f"   Temperature: {final_scenario['temperature']} °C")
    print(f"   Efficiency: {final_scenario['system_efficiency']}%")

if __name__ == "__main__":
    main()