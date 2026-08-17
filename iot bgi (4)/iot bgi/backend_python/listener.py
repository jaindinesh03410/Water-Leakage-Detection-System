import firebase_admin
from firebase_admin import credentials, db
import os
import time
from datetime import datetime

class FirebaseListener:
    def __init__(self):
        self.db_ref = None
        self.listeners = {}
        self.init_firebase()
    
    def init_firebase(self):
        try:
            cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebase-key.json')
            db_url = os.getenv('FIREBASE_DATABASE_URL', 'https://iot-bgi-default-rtdb.asia-southeast1.firebasedatabase.app')
            
            if os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
            else:
                cred = credentials.ApplicationDefault()
            
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred, {
                    'databaseURL': db_url
                })
            
            self.db_ref = db.reference()
            print("Firebase listener initialized")
        except Exception as e:
            print(f"Firebase listener init error: {e}")
    
    def on_readings_change(self, event):
        print(f"Readings updated: {event.event_type} at {event.path}")
        if event.data:
            print(f"New data: {event.data}")
    
    def on_alerts_change(self, event):
        print(f"Alerts updated: {event.event_type} at {event.path}")
        if event.data:
            print(f"Alert data: {event.data}")
    
    def start_listening(self):
        if not self.db_ref:
            print("Firebase not initialized")
            return
        
        try:
            self.listeners['readings'] = self.db_ref.child('readings').listen(self.on_readings_change)
            self.listeners['alerts'] = self.db_ref.child('alerts').listen(self.on_alerts_change)
            print("Started listening to Firebase changes")
        except Exception as e:
            print(f"Error starting listeners: {e}")
    
    def stop_listening(self):
        for name, listener in self.listeners.items():
            try:
                listener.close()
                print(f"Stopped {name} listener")
            except Exception as e:
                print(f"Error stopping {name} listener: {e}")
        self.listeners.clear()

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    
    listener = FirebaseListener()
    listener.start_listening()
    
    try:
        print("Listening for Firebase changes. Press Ctrl+C to stop.")
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping listener...")
        listener.stop_listening()