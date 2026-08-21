#!/usr/bin/env python3
"""
Complete Data Flow Diagnostic
Tests entire pipeline: Firebase → Backend → API → Frontend
"""

import os
import sys
import time
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def print_section(title):
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)

def check_firebase_connection():
    """Test direct Firebase connection"""
    print_section("1. Testing Firebase Connection")
    
    try:
        import firebase_admin
        from firebase_admin import credentials, db
        
        # Clean slate
        try:
            firebase_admin.delete_app(firebase_admin.get_app())
        except:
            pass
        
        cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-key.json')
        db_url = os.getenv('FIREBASE_DATABASE_URL')
        
        print(f"Credentials: {cred_path}")
        print(f"Database URL: {db_url}")
        
        if not os.path.exists(cred_path):
            print(f"❌ Credentials file NOT found: {cred_path}")
            return None
        
        print(f"✅ Credentials file exists")
        
        # Initialize
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred, {'databaseURL': db_url})
        print("✅ Firebase initialized")
        
        # Get reference
        db_ref = db.reference()
        print("✅ Database reference obtained")
        
        return db_ref
        
    except Exception as e:
        print(f"❌ Firebase connection failed: {e}")
        return None

def check_firebase_data(db_ref):
    """Check if data exists in Firebase"""
    print_section("2. Checking Firebase Data")
    
    if not db_ref:
        print("❌ No database reference (connection failed)")
        return False
    
    try:
        # Try to read sensor_data
        print("Reading from 'sensor_data' path...")
        data = db_ref.child('sensor_data').get()
        
        if data is None:
            print("❌ No data at 'sensor_data' path")
            print("\nTrying alternative paths...")
            
            # Try root
            root_data = db_ref.get()
            if root_data:
                print(f"✅ Root data exists: {list(root_data.keys())}")
            else:
                print("❌ Database is completely empty")
            
            return False
        
        print("✅ Data found in sensor_data!")
        print(f"\nData structure:")
        print(json.dumps(data, indent=2, default=str))
        
        # Validate required fields
        required = ['flow_in', 'flow_out', 'pressure', 'temperature']
        missing = [f for f in required if f not in data]
        
        if missing:
            print(f"\n⚠️  Missing fields: {missing}")
            return False
        
        print(f"\n✅ All required fields present")
        return True
        
    except Exception as e:
        print(f"❌ Error reading data: {e}")
        return False

def write_test_data(db_ref):
    """Write test data to Firebase"""
    print_section("3. Writing Test Data to Firebase")
    
    if not db_ref:
        print("❌ No database reference")
        return False
    
    try:
        test_data = {
            "flow_in": 18.5,
            "flow_out": 18.2,
            "temperature": 24.8,
            "pressure": 1048.5,
            "leakage_detected": False,
            "vibration_alert": False,
            "low_pressure_alert": False,
            "valve1_status": True,
            "valve2_status": True,
            "total_litres_1": 2500.0,
            "total_litres_2": 2482.0,
            "flow_difference": 0.3,
            "system_efficiency": 98.4,
            "timestamp": int(time.time() * 1000),
            "last_updated": datetime.now().isoformat(),
            "device_id": "DIAGNOSTIC_TEST",
            "status": "test_data"
        }
        
        print("Writing test data...")
        db_ref.child('sensor_data').set(test_data)
        print("✅ Test data written successfully!")
        
        # Verify write
        print("\nVerifying write...")
        time.sleep(1)
        verify = db_ref.child('sensor_data').get()
        
        if verify and verify.get('device_id') == 'DIAGNOSTIC_TEST':
            print("✅ Write verified - data readable")
            print(f"   Flow In: {verify.get('flow_in')} L/min")
            print(f"   Flow Out: {verify.get('flow_out')} L/min")
            print(f"   Status: {verify.get('status')}")
            return True
        else:
            print("❌ Write verification failed")
            return False
            
    except Exception as e:
        print(f"❌ Error writing data: {e}")
        return False

def test_backend_api():
    """Test if backend API is running and receiving data"""
    print_section("4. Testing Backend API")
    
    try:
        import requests
        
        # Test health endpoint
        print("Testing health endpoint...")
        try:
            response = requests.get('http://localhost:8000/health', timeout=3)
            if response.ok:
                health = response.json()
                print("✅ Backend is running")
                print(f"   Status: {health.get('status')}")
                print(f"   Firebase: {health.get('firebase')}")
                print(f"   Cache Updated: {health.get('cache_updated')}")
            else:
                print(f"❌ Backend returned {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            print("❌ Backend is NOT running!")
            print("\n💡 Start backend with: python start.py")
            return False
        
        # Wait for cache refresh
        print("\nWaiting 5 seconds for backend cache to refresh...")
        time.sleep(5)
        
        # Test sensor_data endpoint
        print("\nTesting sensor_data endpoint...")
        response = requests.get('http://localhost:8000/api/sensor_data', timeout=3)
        if response.ok:
            data = response.json()
            if data and len(data) > 0:
                print("✅ Backend returning data!")
                print(f"   Flow In: {data.get('flow_in')}")
                print(f"   Flow Out: {data.get('flow_out')}")
                print(f"   Device: {data.get('device_id')}")
                return True
            else:
                print("❌ Backend returned empty data: {}")
                return False
        else:
            print(f"❌ API error: {response.status_code}")
            return False
            
    except ImportError:
        print("❌ 'requests' package not installed")
        print("   Run: pip install requests")
        return False
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

def test_all_endpoints():
    """Test all backend endpoints"""
    print_section("5. Testing All API Endpoints")
    
    try:
        import requests
        
        endpoints = {
            '/health': 'Health check',
            '/api/sensor_data': 'Raw sensor data',
            '/api/flow_data': 'Flow metrics',
            '/api/alerts_live': 'Live alerts',
            '/api/dashboard_summary': 'Dashboard summary'
        }
        
        all_ok = True
        for endpoint, description in endpoints.items():
            try:
                response = requests.get(f'http://localhost:8000{endpoint}', timeout=3)
                if response.ok:
                    data = response.json()
                    print(f"✅ {endpoint:30} - {description}")
                else:
                    print(f"❌ {endpoint:30} - Status {response.status_code}")
                    all_ok = False
            except Exception as e:
                print(f"❌ {endpoint:30} - Error: {e}")
                all_ok = False
        
        return all_ok
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("\n" + "╔" + "=" * 68 + "╗")
    print("║" + " " * 15 + "DATA FLOW DIAGNOSTIC TOOL" + " " * 28 + "║")
    print("╚" + "=" * 68 + "╝")
    
    results = {}
    
    # Step 1: Firebase Connection
    db_ref = check_firebase_connection()
    results['Firebase Connection'] = db_ref is not None
    
    if not db_ref:
        print("\n❌ Cannot continue without Firebase connection")
        print("\n🔧 FIX:")
        print("   1. Check firebase-key.json exists")
        print("   2. Check FIREBASE_DATABASE_URL in .env")
        print("   3. Run: python setup_check.py")
        return 1
    
    # Step 2: Check existing data
    data_exists = check_firebase_data(db_ref)
    results['Existing Data'] = data_exists
    
    # Step 3: Write test data if needed
    if not data_exists:
        print("\n💡 No data found. Writing test data...")
        write_success = write_test_data(db_ref)
        results['Test Data Write'] = write_success
    else:
        results['Test Data Write'] = True  # Not needed
    
    # Step 4: Test backend
    backend_ok = test_backend_api()
    results['Backend API'] = backend_ok
    
    # Step 5: Test all endpoints
    if backend_ok:
        all_endpoints = test_all_endpoints()
        results['All Endpoints'] = all_endpoints
    else:
        results['All Endpoints'] = False
    
    # Summary
    print_section("📊 DIAGNOSTIC SUMMARY")
    
    all_passed = True
    for check, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{check:25} {status}")
        if not passed:
            all_passed = False
    
    print("\n" + "=" * 70)
    if all_passed:
        print("✅ ALL CHECKS PASSED - Data flow is working!")
        print("\n🎉 Your system is ready:")
        print("   • Firebase has data")
        print("   • Backend is receiving data")
        print("   • API is serving data")
        print("   • Frontend should display data")
        
        print("\n📝 Next steps:")
        print("   1. Open dashboard: http://localhost:3000")
        print("   2. Data should appear within 3-5 seconds")
        print("   3. Check browser console (F12) if issues")
        
    else:
        print("❌ SOME CHECKS FAILED")
        print("\n🔧 Fixes needed:")
        
        if not results.get('Firebase Connection'):
            print("   • Fix Firebase connection (check credentials)")
        
        if not results.get('Existing Data') and not results.get('Test Data Write'):
            print("   • Manually run: python fresh_test_data.py")
        
        if not results.get('Backend API'):
            print("   • Start backend: python start.py")
            print("   • Wait 10 seconds and run this script again")
        
        print("\n📖 For detailed help:")
        print("   • Read: TROUBLESHOOTING.md")
        print("   • Run: python setup_check.py")
    
    print("=" * 70 + "\n")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️  Diagnostic cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
