import os
import sys
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    port = os.getenv('PORT', '8000')
    
    print(f"Starting IoT Water Intelligence Backend on port {port}")
    print("Make sure Firebase credentials are configured!")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    os.system(f"uvicorn main:app --host 0.0.0.0 --port {port} --reload")