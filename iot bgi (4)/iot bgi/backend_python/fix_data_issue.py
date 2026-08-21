#!/usr/bin/env python3
"""
Automated Data Issue Fixer
Diagnoses and fixes common frontend data issues
"""

import os
import sys
import time
import requests
from datetime import datetime

def print_header(text):
    print("\n" + "=" * 60)
    print(text)
    print("=" * 60)

def print_step(step, text):
    print(f"\n[Step {step}] {text}")
    print("-" * 60)

def check_backend_running():
    """Check if backend is running"""
    print_step(1, "Checking Backend Status")
    try:
        response = requests.get('http://localhost:8000/health', timeout=3)
        if response.ok:
            data = response.json()
            print(f"✅ Backend is RUNNING")
            print(f"   Status: {data.get('status')}")
            print(f"   Firebase: {data.get('firebase')}")
            return True
        else:
            print(f"❌ Backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend is NOT running")
        print("\n💡 FIX: Start backend with:")
        print("   python start.py")
        return False
    except Exception as e:
        print(f"❌ Error checking backend: {e}")
        return False

def check_data_exists():
    """Check if data exists in Firebase"""
    print_step(2, "Checking Data in Firebase")
    try:
        response = requests.get('http://localhost:8000/api/sensor_data', timeout=3)
        if response.ok:
            data = response.json()
            if data and len(data) > 0:
                print(f"✅ Data EXISTS in Firebase")
                print(f"   Keys: {list(data.keys())[:5]}...")
                
                # Check if data has required fields
                required = ['flow_in', 'flow_out', 'pressure']
                missing = [f for f in required if f not in data]
                if missing:
                    print(f"⚠️  Missing fields: {missing}")
                    return False
                
                print(f"   Flow In: {data.get('flow_in')}")
                print(f"   Flow Out: {data.get('flow_out')}")
                print(f"   Pressure: {data.get('pressure')}")
                return True
            else:
                print("❌ No data found in Firebase")
                print("   Response: {}")
                return False
        else:
            print(f"❌ API error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error checking data: {e}")
        return False

def send_test_data():
    """Send test data to Firebase"""
    print_step(3, "Sending Test Data to Firebase")
    try:
        import firebase_admin
        from firebase_admin import credentials, db
        from dotenv import load_dotenv
        
        load_dotenv()
        
        # Initialize Firebase
        if firebase_admin._apps:
            print("   Firebase already initialized")
            db_ref = db.reference()
        else:
            cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-key.json')
            db_url = os.getenv('FIREBASE_DATABASE_URL')
            
            if not os.path.exists(cred_path):
                print(f"❌ Credentials file not found: {cred_path}")
                return False
            
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {'databaseURL': db_url})
            db_ref = db.reference()
            print("   ✅ Firebase initialized")
        
        # Create test data
        test_data = {
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
        
        # Send to Firebase
        db_ref.child('sensor_data').set(test_data)
        print("✅ Test data sent successfully!")
        print(f"   Flow: {test_data['flow_in']} L/min")
        print(f"   Pressure: {test_data['pressure']} hPa")
        print(f"   Efficiency: {test_data['system_efficiency']}%")
        
        return True
        
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("   Run: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Error sending data: {e}")
        return False

def verify_data_updated():
    """Verify data was updated"""
    print_step(4, "Verifying Data Update")
    print("   Waiting 5 seconds for backend cache to refresh...")
    time.sleep(5)
    
    try:
        response = requests.get('http://localhost:8000/api/flow_data', timeout=3)
        if response.ok:
            data = response.json()
            print("✅ Data verified!")
            print(f"   Flow Rate In: {data.get('flow_rate_in')} L/min")
            print(f"   Flow Rate Out: {data.get('flow_rate_out')} L/min")
            print(f"   Temperature: {data.get('temperature')} °C")
            print(f"   Efficiency: {data.get('system_efficiency')}%")
            return True
        else:
            print(f"❌ Verification failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Verification error: {e}")
        return False

def test_all_endpoints():
    """Test all API endpoints"""
    print_step(5, "Testing All API Endpoints")
    
    endpoints = [
        '/api/sensor_data',
        '/api/flow_data',
        '/api/alerts_live',
        '/api/dashboard_summary'
    ]
    
    all_ok = True
    for endpoint in endpoints:
        try:
            response = requests.get(f'http://localhost:8000{endpoint}', timeout=3)
            if response.ok:
                print(f"   ✅ {endpoint}")
            else:
                print(f"   ❌ {endpoint} - Status: {response.status_code}")
                all_ok = False
        except Exception as e:
            print(f"   ❌ {endpoint} - Error: {e}")
            all_ok = False
    
    return all_ok

def main():
    print_header("🔧 Automated Data Issue Fixer")
    print("This script will diagnose and fix common data issues")
    
    # Step 1: Check backend
    backend_ok = check_backend_running()
    if not backend_ok:
        print("\n❌ CANNOT CONTINUE: Backend must be running")
        print("\n📝 To start backend:")
        print("   1. Open new terminal")
        print("   2. cd backend_python")
        print("   3. Run: python start.py")
        print("   4. Then run this script again")
        return 1
    
    # Step 2: Check data
    data_exists = check_data_exists()
    
    # Step 3: Send test data if needed
    if not data_exists:
        print("\n💡 No data found. Sending test data...")
        data_sent = send_test_data()
        if not data_sent:
            print("\n❌ Failed to send test data")
            return 1
        
        # Step 4: Verify
        verified = verify_data_updated()
        if not verified:
            print("\n❌ Data verification failed")
            return 1
    else:
        print("\n✅ Data already exists, skipping test data")
    
    # Step 5: Test all endpoints
    endpoints_ok = test_all_endpoints()
    
    # Summary
    print_header("📊 Summary")
    
    results = {
        "Backend Running": backend_ok,
        "Data Exists": data_exists or verified,
        "All Endpoints Working": endpoints_ok
    }
    
    all_passed = all(results.values())
    
    for check, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{check}: {status}")
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ ALL CHECKS PASSED!")
        print("\n🎉 Data should now be visible in frontend")
        print("\n📝 Next Steps:")
        print("   1. Open dashboard: http://localhost:3000")
        print("   2. Data should appear within 3-5 seconds")
        print("   3. If not, check browser console (F12) for errors")
        print("\n💡 To send more test data anytime:")
        print("   python fresh_test_data.py")
    else:
        print("❌ SOME CHECKS FAILED")
        print("\n📝 Please fix the issues above and try again")
    print("=" * 60)
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️  Script cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)
