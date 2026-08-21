"""
Backend Setup Verification Script
Run this to diagnose any issues with backend setup
"""

import os
import sys
import json

def print_header(text):
    print("\n" + "=" * 60)
    print(text)
    print("=" * 60)

def check_python_version():
    """Check Python version"""
    print_header("1. Python Version Check")
    version = sys.version_info
    print(f"Python Version: {version.major}.{version.minor}.{version.micro}")
    if version.major >= 3 and version.minor >= 8:
        print("✓ Python version is compatible")
        return True
    else:
        print("❌ Python 3.8+ required")
        return False

def check_dependencies():
    """Check if all dependencies are installed"""
    print_header("2. Dependencies Check")
    
    dependencies = {
        'fastapi': 'fastapi',
        'uvicorn': 'uvicorn',
        'firebase_admin': 'firebase-admin',
        'dotenv': 'python-dotenv',
        'requests': 'requests'
    }
    
    all_ok = True
    for module, package in dependencies.items():
        try:
            __import__(module)
            print(f"✓ {package} installed")
        except ImportError:
            print(f"❌ {package} NOT installed")
            all_ok = False
    
    if not all_ok:
        print("\nInstall missing packages:")
        print("pip install -r requirements.txt")
    
    return all_ok

def check_env_file():
    """Check .env file"""
    print_header("3. Environment Configuration Check")
    
    if not os.path.exists('.env'):
        print("❌ .env file not found")
        print("\nCreate .env file:")
        print("copy .env.example .env")
        print("Then edit .env with your Firebase details")
        return False
    
    print("✓ .env file exists")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    firebase_url = os.getenv('FIREBASE_DATABASE_URL')
    cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
    port = os.getenv('PORT')
    
    print(f"\nConfiguration:")
    print(f"  FIREBASE_DATABASE_URL: {firebase_url if firebase_url else '❌ NOT SET'}")
    print(f"  FIREBASE_CREDENTIALS_PATH: {cred_path if cred_path else '❌ NOT SET'}")
    print(f"  PORT: {port if port else '8000 (default)'}")
    
    return bool(firebase_url and cred_path)

def check_firebase_credentials():
    """Check Firebase credentials file"""
    print_header("4. Firebase Credentials Check")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-key.json')
    
    if not os.path.exists(cred_path):
        print(f"❌ Firebase credentials file not found: {cred_path}")
        print("\nTo fix:")
        print("1. Go to Firebase Console")
        print("2. Project Settings > Service Accounts")
        print("3. Click 'Generate new private key'")
        print("4. Save as 'firebase-key.json' in backend_python folder")
        return False
    
    print(f"✓ Credentials file exists: {cred_path}")
    
    # Validate JSON structure
    try:
        with open(cred_path, 'r') as f:
            cred_data = json.load(f)
        
        required_fields = ['type', 'project_id', 'private_key', 'client_email']
        missing = [f for f in required_fields if f not in cred_data]
        
        if missing:
            print(f"❌ Invalid credentials file. Missing: {', '.join(missing)}")
            return False
        
        print(f"✓ Credentials file is valid")
        print(f"  Project ID: {cred_data['project_id']}")
        print(f"  Client Email: {cred_data['client_email']}")
        return True
        
    except json.JSONDecodeError:
        print("❌ Credentials file is not valid JSON")
        return False
    except Exception as e:
        print(f"❌ Error reading credentials: {e}")
        return False

def check_firebase_connection():
    """Test Firebase connection"""
    print_header("5. Firebase Connection Test")
    
    try:
        import firebase_admin
        from firebase_admin import credentials, db
        from dotenv import load_dotenv
        
        load_dotenv()
        
        cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-key.json')
        db_url = os.getenv('FIREBASE_DATABASE_URL')
        
        # Initialize if not already
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred, {'databaseURL': db_url})
        
        # Test reading
        ref = db.reference('sensor_data')
        data = ref.get()
        
        print("✓ Successfully connected to Firebase")
        
        if data:
            print(f"✓ Data exists in sensor_data path")
            print(f"  Data keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
        else:
            print("⚠ No data found in sensor_data path")
            print("  This is OK if ESP32 hasn't sent data yet")
        
        return True
        
    except Exception as e:
        print(f"❌ Firebase connection failed: {e}")
        print("\nCheck:")
        print("1. FIREBASE_DATABASE_URL is correct")
        print("2. Firebase Realtime Database is enabled")
        print("3. Database rules allow read/write access")
        return False

def check_port_available():
    """Check if port is available"""
    print_header("6. Port Availability Check")
    
    import socket
    from dotenv import load_dotenv
    
    load_dotenv()
    port = int(os.getenv('PORT', 8000))
    
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    result = sock.connect_ex(('localhost', port))
    sock.close()
    
    if result == 0:
        print(f"⚠ Port {port} is already in use")
        print(f"  Change PORT in .env or stop the other service")
        return False
    else:
        print(f"✓ Port {port} is available")
        return True

def main():
    print("\n" + "=" * 60)
    print("IoT Water Intelligence Backend - Setup Verification")
    print("=" * 60)
    
    results = {
        'Python Version': check_python_version(),
        'Dependencies': check_dependencies(),
        'Environment Config': check_env_file(),
        'Firebase Credentials': check_firebase_credentials(),
        'Firebase Connection': check_firebase_connection(),
        'Port Availability': check_port_available()
    }
    
    print_header("Summary")
    
    for check, passed in results.items():
        status = "✓ PASS" if passed else "❌ FAIL"
        print(f"{check}: {status}")
    
    all_passed = all(results.values())
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✓ All checks passed! Backend is ready to run.")
        print("\nStart the backend with:")
        print("  python start.py")
        print("or")
        print("  python main.py")
    else:
        print("❌ Some checks failed. Fix the issues above before running.")
    print("=" * 60)
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())
