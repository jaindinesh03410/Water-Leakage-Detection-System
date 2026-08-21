import os
import sys
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

def check_requirements():
    """Check if all required dependencies are installed"""
    try:
        import fastapi
        import uvicorn
        import firebase_admin
        print("✓ All required packages installed")
        return True
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("\nPlease install requirements:")
        print("pip install -r requirements.txt")
        return False

def check_firebase_credentials():
    """Check if Firebase credentials file exists"""
    cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-key.json')
    if not os.path.exists(cred_path):
        print(f"❌ Firebase credentials not found: {cred_path}")
        print("\nPlease ensure:")
        print("1. Download firebase-key.json from Firebase Console")
        print("2. Place it in the backend_python directory")
        print("3. Update FIREBASE_CREDENTIALS_PATH in .env if needed")
        return False
    print(f"✓ Firebase credentials found: {cred_path}")
    return True

def check_env_file():
    """Check if .env file exists"""
    if not os.path.exists('.env'):
        print("⚠ Warning: .env file not found")
        print("Using default configuration")
        return False
    print("✓ .env file found")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("IoT Water Intelligence Backend - Startup Check")
    print("=" * 60)
    
    # Run all checks
    env_ok = check_env_file()
    packages_ok = check_requirements()
    firebase_ok = check_firebase_credentials()
    
    print("=" * 60)
    
    if not packages_ok or not firebase_ok:
        print("❌ Startup aborted due to missing requirements")
        print("=" * 60)
        sys.exit(1)
    
    port = os.getenv('PORT', '8000')
    db_url = os.getenv('FIREBASE_DATABASE_URL', 'Not set')
    
    print(f"Starting IoT Water Intelligence Backend")
    print(f"Port: {port}")
    print(f"Database: {db_url}")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        os.system(f"uvicorn main:app --host 0.0.0.0 --port {port} --reload")
    except KeyboardInterrupt:
        print("\n" + "=" * 60)
        print("Server stopped by user")
        print("=" * 60)