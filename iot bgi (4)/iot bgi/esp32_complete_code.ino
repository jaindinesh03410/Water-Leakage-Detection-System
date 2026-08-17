/*=========================================================
FINAL SMART WATER MONITORING SYSTEM WITH FIREBASE
ESP32 + BMP180 + 2x Flow Sensors + Vibration + Relays + WiFi + Firebase
=========================================================

FEATURES:
- Water flow monitoring
- Pressure monitoring  
- Temperature monitoring
- Vibration monitoring
- Automatic solenoid control
- Leak detection with delay
- Low pressure protection
- Stable relay hysteresis
- WiFi connectivity
- Firebase real-time data upload
- Backend API integration

IMPORTANT HARDWARE NOTES:
---------------------------------------------------------
1. FLOW SENSOR OUTPUT IS 5V
   Use voltage divider before ESP32 GPIOs.
2. GPIO 34 & 35 DO NOT SUPPORT INPUT_PULLUP
   Use external 10k pull-up resistors.
3. RELAYS ARE ACTIVE LOW
   LOW  = ON
   HIGH = OFF
4. USE FLYBACK DIODE ACROSS SOLENOID VALVES
=========================================================*/

#include <Wire.h>
#include <Adafruit_BMP085.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
#include <ArduinoJson.h>

// =====================================================
// WIFI & FIREBASE CREDENTIALS
// =====================================================
#define WIFI_SSID "YOUR_WIFI_NAME"           // आपका WiFi नाम
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"   // आपका WiFi पासवर्ड

// Firebase config - आपके actual values डालें
#define API_KEY "AIzaSyDummy-Replace-With-Your-Actual-API-Key"
#define DATABASE_URL "https://iot-bgi-default-rtdb.asia-southeast1.firebasedatabase.app/"

// =====================================================
// BMP180 SENSOR
// =====================================================
Adafruit_BMP085 bmp;

// =====================================================
// FIREBASE OBJECTS
// =====================================================
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
bool firebaseReady = false;

// =====================================================
// PIN DEFINITIONS
// =====================================================
// Relay Pins
const int relay1Pin = 23;
const int relay2Pin = 19;

// Vibration Sensor
const int vibrationPin = 27;

// Flow Sensors
const int flowSensor1Pin = 34;
const int flowSensor2Pin = 35;

// =====================================================
// FLOW SENSOR VARIABLES
// =====================================================
volatile uint32_t pulseCount1 = 0;
volatile uint32_t pulseCount2 = 0;
float flowRate1 = 0.0;
float flowRate2 = 0.0;
float totalLitres1 = 0.0;
float totalLitres2 = 0.0;

// =====================================================
// TIMERS
// =====================================================
unsigned long flowMillis = 0;
unsigned long serialMillis = 0;
unsigned long leakStartTime = 0;
unsigned long vibrationTimer = 0;
unsigned long firebaseMillis = 0;
unsigned long wifiCheckMillis = 0;

// =====================================================
// SETTINGS
// =====================================================
// Flow calibration factor
const float calibrationFactor = 7.5;

// Leak detection
const float leakThreshold = 2.0;
const unsigned long leakDelay = 5000;

// Pressure protection
const float minimumPressure = 950.0;

// Relay hysteresis
const float openThreshold = 0.7;
const float closeThreshold = 0.3;

// Firebase upload interval (milliseconds)
const unsigned long firebaseInterval = 2000; // 2 seconds

// WiFi check interval
const unsigned long wifiCheckInterval = 30000; // 30 seconds

// =====================================================
// SYSTEM STATUS VARIABLES
// =====================================================
bool leakDetected = false;
bool vibrationDetected = false;
bool lowPressureAlert = false;
bool valve1Status = false; // false = closed, true = open
bool valve2Status = false;
float temperature = 0.0;
float pressure = 0.0;

// =====================================================
// INTERRUPT FUNCTIONS
// =====================================================
void IRAM_ATTR pulseCounter1() {
    pulseCount1++;
}

void IRAM_ATTR pulseCounter2() {
    pulseCount2++;
}

// =====================================================
// WIFI CONNECTION FUNCTION
// =====================================================
void connectToWiFi() {
    Serial.println("🔗 Connecting to WiFi...");
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println();
        Serial.println("✅ WiFi Connected!");
        Serial.print("📡 IP Address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println();
        Serial.println("❌ WiFi Connection Failed!");
    }
}

// =====================================================
// FIREBASE INITIALIZATION
// =====================================================
void initFirebase() {
    Serial.println("🔥 Initializing Firebase...");
    
    config.api_key = API_KEY;
    config.database_url = DATABASE_URL;
    
    // Anonymous authentication
    auth.user.email = "";
    auth.user.password = "";
    
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    
    // Wait for Firebase to be ready
    int attempts = 0;
    while (!Firebase.ready() && attempts < 10) {
        delay(1000);
        Serial.print(".");
        attempts++;
    }
    
    if (Firebase.ready()) {
        firebaseReady = true;
        Serial.println();
        Serial.println("✅ Firebase Connected!");
    } else {
        Serial.println();
        Serial.println("❌ Firebase Connection Failed!");
    }
}

// =====================================================
// SEND DATA TO FIREBASE
// =====================================================
void sendToFirebase() {
    if (!firebaseReady || WiFi.status() != WL_CONNECTED) {
        return;
    }
    
    // Create JSON object
    FirebaseJson json;
    
    // Add sensor data
    json.set("flow_in", flowRate1);
    json.set("flow_out", flowRate2);
    json.set("temperature", temperature);
    json.set("pressure", pressure);
    json.set("leakage_detected", leakDetected);
    json.set("vibration_alert", vibrationDetected);
    json.set("low_pressure_alert", lowPressureAlert);
    json.set("valve1_status", valve1Status);
    json.set("valve2_status", valve2Status);
    json.set("total_litres_1", totalLitres1);
    json.set("total_litres_2", totalLitres2);
    json.set("flow_difference", abs(flowRate1 - flowRate2));
    json.set("system_efficiency", (flowRate2 / flowRate1 * 100.0));
    
    // Add timestamp
    json.set("last_updated", Firebase.RTDB.setTimestamp(&fbdo, "timestamp") ? "sync" : String(millis()));
    
    // Send to Firebase
    if (Firebase.RTDB.setJSON(&fbdo, "/sensor_data", &json)) {
        Serial.println("📤 Data sent to Firebase successfully!");
    } else {
        Serial.print("❌ Firebase Error: ");
        Serial.println(fbdo.errorReason());
    }
}

// =====================================================
// SETUP
// =====================================================
void setup() {
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("=======================================");
    Serial.println("SMART WATER MONITORING SYSTEM STARTED");
    Serial.println("=======================================");
    
    // ---------------------------------------------------
    // I2C SETUP
    // ---------------------------------------------------
    Wire.begin(21, 22);
    
    // ---------------------------------------------------
    // BMP180 INITIALIZATION
    // ---------------------------------------------------
    if (!bmp.begin()) {
        Serial.println("❌ BMP180 SENSOR NOT DETECTED!");
        while (1);
    }
    Serial.println("✅ BMP180 Sensor initialized");
    
    // ---------------------------------------------------
    // RELAYS
    // ---------------------------------------------------
    pinMode(relay1Pin, OUTPUT);
    pinMode(relay2Pin, OUTPUT);
    
    // Relays OFF initially
    digitalWrite(relay1Pin, HIGH);
    digitalWrite(relay2Pin, HIGH);
    Serial.println("✅ Relays initialized (OFF)");
    
    // ---------------------------------------------------
    // VIBRATION SENSOR
    // ---------------------------------------------------
    pinMode(vibrationPin, INPUT);
    Serial.println("✅ Vibration sensor initialized");
    
    // ---------------------------------------------------
    // FLOW SENSORS
    // ---------------------------------------------------
    pinMode(flowSensor1Pin, INPUT);
    pinMode(flowSensor2Pin, INPUT);
    
    attachInterrupt(digitalPinToInterrupt(flowSensor1Pin), 
                   pulseCounter1, FALLING);
    attachInterrupt(digitalPinToInterrupt(flowSensor2Pin), 
                   pulseCounter2, FALLING);
    
    flowMillis = millis();
    Serial.println("✅ Flow sensors initialized");
    
    // ---------------------------------------------------
    // WIFI CONNECTION
    // ---------------------------------------------------
    connectToWiFi();
    
    // ---------------------------------------------------
    // FIREBASE INITIALIZATION
    // ---------------------------------------------------
    if (WiFi.status() == WL_CONNECTED) {
        initFirebase();
    }
    
    Serial.println("=======================================");
    Serial.println("🚀 SYSTEM READY!");
    Serial.println("=======================================");
}

// =====================================================
// LOOP
// =====================================================
void loop() {
    // ==================================================
    // WIFI CONNECTION CHECK
    // ==================================================
    if (millis() - wifiCheckMillis >= wifiCheckInterval) {
        wifiCheckMillis = millis();
        
        if (WiFi.status() != WL_CONNECTED) {
            Serial.println("🔄 WiFi disconnected, reconnecting...");
            connectToWiFi();
            
            if (WiFi.status() == WL_CONNECTED && !firebaseReady) {
                initFirebase();
            }
        }
    }
    
    // ==================================================
    // READ BMP180
    // ==================================================
    temperature = bmp.readTemperature();
    pressure = bmp.readPressure() / 100.0;
    
    // BMP180 error check
    if (isnan(temperature) || isnan(pressure)) {
        Serial.println("❌ BMP180 READ ERROR");
        return;
    }
    
    // ==================================================
    // VIBRATION SENSOR
    // ==================================================
    int vibrationState = digitalRead(vibrationPin);
    
    // Debounce vibration
    vibrationDetected = false;
    if (vibrationState == HIGH) {
        if (millis() - vibrationTimer > 100) {
            vibrationTimer = millis();
            vibrationDetected = true;
        }
    }
    
    // ==================================================
    // FLOW CALCULATIONS EVERY 1 SECOND
    // ==================================================
    if (millis() - flowMillis >= 1000) {
        unsigned long currentMillis = millis();
        float elapsedTime = (currentMillis - flowMillis);
        flowMillis = currentMillis;
        
        // ----------------------------------------------
        // SAFELY READ PULSE COUNTS
        // ----------------------------------------------
        noInterrupts();
        uint32_t count1 = pulseCount1;
        uint32_t count2 = pulseCount2;
        pulseCount1 = 0;
        pulseCount2 = 0;
        interrupts();
        
        // ----------------------------------------------
        // FLOW RATE CALCULATION
        // ----------------------------------------------
        flowRate1 = ((1000.0 / elapsedTime) * count1) / calibrationFactor;
        flowRate2 = ((1000.0 / elapsedTime) * count2) / calibrationFactor;
        
        // ----------------------------------------------
        // TOTAL WATER CALCULATION
        // ----------------------------------------------
        totalLitres1 += flowRate1 / 60.0;
        totalLitres2 += flowRate2 / 60.0;
        
        // ==================================================
        // SOLENOID VALVE CONTROL WITH HYSTERESIS
        // ==================================================
        // --------------------------------------------------
        // VALVE 1
        // --------------------------------------------------
        if (flowRate1 > openThreshold) {
            digitalWrite(relay1Pin, LOW);
            valve1Status = true;
        } else if (flowRate1 < closeThreshold) {
            digitalWrite(relay1Pin, HIGH);
            valve1Status = false;
        }
        
        // --------------------------------------------------
        // VALVE 2
        // --------------------------------------------------
        if (flowRate2 > openThreshold) {
            digitalWrite(relay2Pin, LOW);
            valve2Status = true;
        } else if (flowRate2 < closeThreshold) {
            digitalWrite(relay2Pin, HIGH);
            valve2Status = false;
        }
        
        // ==================================================
        // LEAK DETECTION
        // ==================================================
        float flowDifference = abs(flowRate1 - flowRate2);
        if (flowDifference > leakThreshold) {
            if (leakStartTime == 0) {
                leakStartTime = millis();
            }
            
            // Leak confirmed after delay
            if (millis() - leakStartTime > leakDelay) {
                leakDetected = true;
                Serial.println("🚨 WARNING: LEAK DETECTED!");
                
                // Close valves
                digitalWrite(relay1Pin, HIGH);
                digitalWrite(relay2Pin, HIGH);
                valve1Status = false;
                valve2Status = false;
            }
        } else {
            leakStartTime = 0;
            leakDetected = false;
        }
        
        // ==================================================
        // LOW PRESSURE PROTECTION
        // ==================================================
        if (pressure < minimumPressure) {
            lowPressureAlert = true;
            Serial.println("🚨 WARNING: LOW PRESSURE!");
            
            // Close both valves
            digitalWrite(relay1Pin, HIGH);
            digitalWrite(relay2Pin, HIGH);
            valve1Status = false;
            valve2Status = false;
        } else {
            lowPressureAlert = false;
        }
        
        // ==================================================
        // SERIAL OUTPUT
        // ==================================================
        Serial.println();
        Serial.println("=======================================");
        
        // Temperature
        Serial.print("🌡️  Temperature: ");
        Serial.print(temperature);
        Serial.println(" °C");
        
        // Pressure
        Serial.print("📊 Pressure: ");
        Serial.print(pressure);
        Serial.println(" hPa");
        
        // Flow Sensor 1
        Serial.print("💧 Flow Sensor 1: ");
        Serial.print(flowRate1);
        Serial.println(" L/min");
        
        // Flow Sensor 2
        Serial.print("💧 Flow Sensor 2: ");
        Serial.print(flowRate2);
        Serial.println(" L/min");
        
        // Total Water
        Serial.print("📈 Total Water 1: ");
        Serial.print(totalLitres1);
        Serial.println(" L");
        
        Serial.print("📈 Total Water 2: ");
        Serial.print(totalLitres2);
        Serial.println(" L");
        
        // Flow Difference
        Serial.print("⚖️  Flow Difference: ");
        Serial.print(flowDifference);
        Serial.println(" L/min");
        
        // Vibration
        Serial.print("📳 Vibration: ");
        if (vibrationDetected) {
            Serial.println("🚨 DETECTED");
        } else {
            Serial.println("✅ NORMAL");
        }
        
        // Valve Status
        Serial.print("🔧 Solenoid Valve 1: ");
        Serial.println(valve1Status ? "🟢 OPEN" : "🔴 CLOSED");
        
        Serial.print("🔧 Solenoid Valve 2: ");
        Serial.println(valve2Status ? "🟢 OPEN" : "🔴 CLOSED");
        
        // System Status
        Serial.print("📡 WiFi: ");
        Serial.println(WiFi.status() == WL_CONNECTED ? "✅ Connected" : "❌ Disconnected");
        
        Serial.print("🔥 Firebase: ");
        Serial.println(firebaseReady ? "✅ Connected" : "❌ Disconnected");
        
        Serial.println("=======================================");
    }
    
    // ==================================================
    // SEND DATA TO FIREBASE
    // ==================================================
    if (millis() - firebaseMillis >= firebaseInterval) {
        firebaseMillis = millis();
        sendToFirebase();
    }
    
    // Small delay to prevent watchdog issues
    delay(10);
}