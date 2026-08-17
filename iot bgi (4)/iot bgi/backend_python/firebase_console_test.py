#!/usr/bin/env python3
"""
Firebase Console Direct Test - Clean data for console viewing
"""

import firebase_admin
from firebase_admin import credentials, db
import os
import time
from datetime import datetime

def init_firebase():
    try:
        # Force reinitialize
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
    print("🔥 Firebase Console Test - Clean Data Upload...")
    db_ref = init_firebase()
    
    if not db_ref:
        print("❌ Failed to initialize Firebase")
        return
    
    print("✅ Firebase connected successfully!")
    
    # Clean, properly formatted data for Firebase Console
    sensor_data = {
        "flow_in": 17.5,
        "flow_out": 16.8,
        "temperature": 28.2,
        "pressure": 1095.3,
        "leakage_detected": True,
        "vibration_alert": True,
        "low_pressure_alert": False,
        "valve1_status": False,
        "valve2_status": False,
        "total_litres_1": 1456.7,
        "total_litres_2": 1445.2,
        "flow_difference": 0.7,
        "system_efficiency": 96.0,
        "timestamp": int(time.time() * 1000),
        "last_updated": datetime.now().isoformat(),
        "device_id": "ESP32_001",
        "location": "Main Pipeline",
        "status": "active"
    }
    
    try:
        # Send to Firebase
        result = db_ref.child('sensor_data').set(sensor_data)
        print(f"✅ Data uploaded to Firebase successfully!")
        
        # Also create structured data for better console viewing
        db_ref.child('readings').child('latest').set({
            "flow_rate_in": sensor_data["flow_in"],
            "flow_rate_out": sensor_data["flow_out"],
            "temperature": sensor_data["temperature"],
            "pressure": sensor_data["pressure"],
            "timestamp": sensor_data["last_updated"]
        })
        
        db_ref.child('alerts').child('active').set({
            "leakage": sensor_data["leakage_detected"],
            "vibration": sensor_data["vibration_alert"],
            "low_pressure": sensor_data["low_pressure_alert"],
            "count": sum([
                sensor_data["leakage_detected"],
                sensor_data["vibration_alert"], 
                sensor_data["low_pressure_alert"]
            ])
        })
        
        print(f"\n📊 Uploaded Data:")
        print(f"   Flow: {sensor_data['flow_in']} → {sensor_data['flow_out']} L/min")
        print(f"   Temperature: {sensor_data['temperature']} °C")
        print(f"   Pressure: {sensor_data['pressure']} hPa")
        print(f"   Leakage: {'🚨 YES' if sensor_data['leakage_detected'] else '✅ NO'}")
        print(f"   Vibration: {'🚨 YES' if sensor_data['vibration_alert'] else '✅ NO'}")
        
        print(f"\n🔗 Firebase Console Links:")
        print(f"   Main: https://console.firebase.google.com/project/iot-bgi/database")
        print(f"   Data: https://iot-bgi-default-rtdb.asia-southeast1.firebasedatabase.app/")
        print(f"   JSON: https://iot-bgi-default-rtdb.asia-southeast1.firebasedatabase.app/sensor_data.json")
        
        print(f"\n✅ Firebase Console में अब data दिखना चाहिए!")
        
    except Exception as e:
        print(f"❌ Error uploading to Firebase: {e}")

if __name__ == "__main__":
    main()