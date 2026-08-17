# IoT Water Intelligence Python Backend

A FastAPI middleware backend that connects to Firebase Realtime Database and provides REST endpoints for the IoT Smart Water Intelligence System.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend_python
pip install -r requirements.txt
```

### 2. Firebase Configuration

#### Option A: Service Account Key (Recommended)
1. Download your Firebase service account key from Firebase Console
2. Save it as `firebase-key.json` in the backend_python directory
3. Copy `.env.example` to `.env` and update paths if needed

#### Option B: Application Default Credentials
1. Install Google Cloud SDK
2. Run `gcloud auth application-default login`
3. Set `FIREBASE_CREDENTIALS_PATH` to empty or remove the file

### 3. Environment Variables

Copy `.env.example` to `.env` and configure:

```
FIREBASE_CREDENTIALS_PATH=firebase-key.json
FIREBASE_DATABASE_URL=https://iot-bgi-default-rtdb.asia-southeast1.firebasedatabase.app
PORT=8000
```

### 4. Run the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

- `GET /` - Root endpoint with service info
- `GET /health` - Health check endpoint
- `GET /api/readings` - Get sensor readings from Firebase
- `GET /api/alerts` - Get alerts data from Firebase
- `GET /api/nodes` - Get nodes status from Firebase
- `GET /api/analytics` - Get analytics data from Firebase
- `GET /api/quality` - Get water quality data from Firebase

## Testing

Test the API endpoints:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/readings
```

## Firebase Database Structure

The backend connects to these Firebase paths:
- `/readings` - Sensor data from IoT devices
- `/alerts` - System alerts and notifications
- `/nodes` - Device node status information
- `/analytics` - Processed analytics data
- `/quality` - Water quality measurements