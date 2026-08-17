#!/usr/bin/env python3
"""
Test script to simulate ESP32 data and verify backend functionality
"""

import firebase_admin
from firebase_admin import credentials, db
import os
import time
import random
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

def simulate_esp32_data():
    """Simulate ESP32 sensor data"""
    # Simulate realistic water flow data
    base_flow = 15.0  # Base flow rate in L/min
    flow_in = base_flow + random.uniform(-2, 2)
    flow_out = flow_in - random.uniform(0, 1.5)  # Some natural loss
    
    # Simulate pressure (normal atmospheric + water pressure)
    pressure = 1013.25 + random.uniform(50, 150)  # hPa
    
    # Simulate occasional alerts
    leakage_detected = (flow_in - flow_out) > 0.5
    vibration_alert = random.random() < 0.1  # 10% chance of vibration
    
    return {
        "flow_in": round(flow_in, 2),
        "flow_out": round(flow_out, 2),
        "leakage_detected": leakage_detected,
        "pressure": round(pressure, 2),
        "vibration_alert": vibration_alert,
        "last_updated": datetime.now().isoformat()
    }

def main():
    print("🔥 Initializing Firebase connection...")
    db_ref = init_firebase()
    
    if not db_ref:
        print("❌ Failed to initialize Firebase")
        return
    
    print("✅ Firebase connected successfully!")
    print("📡 Simulating ESP32 data transmission...")
    
    for i in range(5):
        # Generate simulated sensor data
        sensor_data = simulate_esp32_data()
        
        print(f"\n📊 Sending data batch {i+1}:")
        print(f"   Flow In: {sensor_data['flow_in']} L/min")
        print(f"   Flow Out: {sensor_data['flow_out']} L/min")
        print(f"   Pressure: {sensor_data['pressure']} hPa")
        print(f"   Leakage: {'🚨 DETECTED' if sensor_data['leakage_detected'] else '✅ Normal'}")
        print(f"   Vibration: {'🚨 ALERT' if sensor_data['vibration_alert'] else '✅ Normal'}")
        
        # Send to Firebase (same path as ESP32)
        try:
            db_ref.child('sensor_data').set(sensor_data)
            print(f"   ✅ Data sent successfully")
        except Exception as e:
            print(f"   ❌ Error sending data: {e}")
        
        if i < 4:  # Don't wait after last iteration
            print("   ⏳ Waiting 3 seconds...")
            time.sleep(3)
    
    print(f"\n🎉 Test completed! Check your dashboard at http://localhost:3000")
    print(f"🔗 API endpoints available at http://localhost:8000")

if __name__ == "__main__":
    main()