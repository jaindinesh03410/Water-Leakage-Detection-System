import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoints():
    endpoints = [
        "/",
        "/health",
        "/api/readings",
        "/api/alerts", 
        "/api/nodes",
        "/api/analytics",
        "/api/quality"
    ]
    
    print("Testing API endpoints...")
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BASE_URL}{endpoint}")
            print(f"GET {endpoint}: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"  Response: {json.dumps(data, indent=2)[:100]}...")
        except requests.exceptions.ConnectionError:
            print(f"GET {endpoint}: Connection failed (server not running?)")
        except Exception as e:
            print(f"GET {endpoint}: Error - {e}")
        print()

if __name__ == "__main__":
    test_endpoints()