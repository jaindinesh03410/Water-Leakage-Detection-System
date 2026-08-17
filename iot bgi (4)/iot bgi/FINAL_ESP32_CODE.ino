/*
=============================================================
  SMART WATER MONITORING SYSTEM - FINAL CODE
  ESP32 + BMP180 + 2x Flow Sensors + Vibration + 2x Relays
  Sends data directly to Firebase Realtime Database
=============================================================

REQUIRED LIBRARIES (Arduino IDE → Tools → Manage Libraries):
  1. Adafruit BMP085 Library
  2. Firebase ESP Client  (by Mobizt)
  3. ArduinoJson           (by Benoit Blanchon)

HARDWARE CONNECTIONS:
  BMP180  → SDA=GPIO21, SCL=GPIO22, VCC=3.3V, GND=GND
  Flow 1  → GPIO34 (use 10kΩ pull-up to 3.3V + voltage divider from 5V)
  Flow 2  → GPIO35 (use 10kΩ pull-up to 3.3V + voltage divider from 5V)
  Relay 1 → GPIO23 (Active LOW - LOW=OPEN, HIGH=CLOSED)
  Relay 2 → GPIO19 (Active LOW - LOW=OPEN, HIGH=CLOSED)
  Vibration → GPIO27
=============================================================
*/

#include <Wire.h>
#include <Adafruit_BMP085.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

// =============================================================
// ⚙️  CREDENTIALS - यहाँ अपनी values डालें
// =============================================================
#define WIFI_SSID       "YOUR_WIFI_NAME"       // ← आपका WiFi नाम
#define WIFI_PASSWORD   "YOUR_WIFI_PASSWORD"   // ← आपका WiFi password
#define API_KEY         "AIzaSyApd72oTFdydyVaWEGBfhYT3UTCzbJ_LIU"
#define DATABASE_URL    "https://iot-bgi-default-rtdb.asia-southeast1.firebasedatabase.app/"

// =============================================================
// 📌 PIN DEFINITIONS
// =============================================================
#define FLOW_1_PIN      34   // Flow Sensor 1 (INPUT ONLY, no internal pullup)
#define FLOW_2_PIN      35   // Flow Sensor 2 (INPUT ONLY, no internal pullup)
#define VIBRATION_PIN   27   // Vibration/Tamper sensor
#define RELAY_1_PIN     23   // Solenoid Valve 1 (Active LOW)
#define RELAY_2_PIN     19   // Solenoid Valve 2 (Active LOW)

// =============================================================
// ⚙️  SETTINGS
// =============================================================
#define CALIBRATION_FACTOR   7.5    // YF-S201 calibration
#define LEAK_THRESHOLD       2.0    // L/min difference = leak
#define LEAK_CONFIRM_DELAY   5000   // ms before closing valves
#define MIN_PRESSURE         950.0  // hPa - below this = alert
#define OPEN_THRESHOLD       0.7    // L/min - above this = open valve
#define CLOSE_THRESHOLD      0.3    // L/min - below this = close valve
#define FIREBASE_INTERVAL    2000   // ms between uploads
#define WIFI_CHECK_INTERVAL  30000  // ms between WiFi checks

// =============================================================
// 🔧 OBJECTS
// =============================================================
Adafruit_BMP085 bmp;
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

// =============================================================
// 📊 VARIABLES
// =============================================================
volatile uint32_t pulseCount1 = 0;
volatile uint32_t pulseCount2 = 0;

float flowRate1 = 0.0;
float flowRate2 = 0.0;
float totalLitres1 = 0.0;
float totalLitres2 = 0.0;
float temperature = 0.0;
float pressure_hpa = 0.0;

bool leakDetected    = false;
bool vibDetected     = false;
bool lowPressure     = false;
bool valve1Open      = false;
bool valve2Open      = false;
bool firebaseReady   = false;

unsigned long flowTimer     = 0;
unsigned long leakTimer     = 0;
unsigned long vibTimer      = 0;
unsigned long firebaseTimer = 0;
unsigned long wifiTimer     = 0;

// =============================================================
// ⚡ INTERRUPTS
// =============================================================
void IRAM_ATTR countPulse1() { pulseCount1++; }
void IRAM_ATTR countPulse2() { pulseCount2++; }

// =============================================================
// 📡 WIFI CONNECT
// =============================================================
void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int tries = 0;
  while (WiFi.status() != WL_CONNECTED && tries < 20) {
    delay(500);
    Serial.print(".");
    tries++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n❌ WiFi Failed - will retry");
  }
}

// =============================================================
// 🔥 FIREBASE INIT
// =============================================================
void initFirebase() {
  config.api_key      = API_KEY;
  config.database_url = DATABASE_URL;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  int tries = 0;
  while (!Firebase.ready() && tries < 10) {
    delay(1000);
    Serial.print(".");
    tries++;
  }

  if (Firebase.ready()) {
    firebaseReady = true;
    Serial.println("✅ Firebase Ready!");
  } else {
    Serial.println("❌ Firebase Failed!");
  }
}

// =============================================================
// 📤 SEND DATA TO FIREBASE
// =============================================================
void sendToFirebase() {
  if (!firebaseReady || WiFi.status() != WL_CONNECTED) return;

  float flowDiff = abs(flowRate1 - flowRate2);
  float efficiency = (flowRate1 > 0) ? (flowRate2 / flowRate1 * 100.0) : 0.0;

  FirebaseJson json;
  json.set("flow_in",            flowRate1);
  json.set("flow_out",           flowRate2);
  json.set("temperature",        temperature);
  json.set("pressure",           pressure_hpa);
  json.set("leakage_detected",   leakDetected);
  json.set("vibration_alert",    vibDetected);
  json.set("low_pressure_alert", lowPressure);
  json.set("valve1_status",      valve1Open);
  json.set("valve2_status",      valve2Open);
  json.set("total_litres_1",     totalLitres1);
  json.set("total_litres_2",     totalLitres2);
  json.set("flow_difference",    flowDiff);
  json.set("system_efficiency",  efficiency);
  json.set("device_id",          "ESP32_MAIN");
  json.set("location",           "Primary Pipeline");

  if (Firebase.RTDB.setJSON(&fbdo, "/sensor_data", &json)) {
    Serial.println("📤 Firebase: Data sent!");
  } else {
    Serial.println("❌ Firebase Error: " + fbdo.errorReason());
  }
}

// =============================================================
// ⚙️  SETUP
// =============================================================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\n====================================");
  Serial.println("  SMART WATER MONITORING SYSTEM");
  Serial.println("====================================");

  // I2C
  Wire.begin(21, 22);

  // BMP180
  if (!bmp.begin()) {
    Serial.println("❌ BMP180 not found! Check wiring.");
    while (1) delay(1000);
  }
  Serial.println("✅ BMP180 OK");

  // Relays (OFF initially)
  pinMode(RELAY_1_PIN, OUTPUT);
  pinMode(RELAY_2_PIN, OUTPUT);
  digitalWrite(RELAY_1_PIN, HIGH);  // HIGH = OFF (Active LOW)
  digitalWrite(RELAY_2_PIN, HIGH);
  Serial.println("✅ Relays OFF");

  // Vibration
  pinMode(VIBRATION_PIN, INPUT);
  Serial.println("✅ Vibration Sensor OK");

  // Flow Sensors
  pinMode(FLOW_1_PIN, INPUT);
  pinMode(FLOW_2_PIN, INPUT);
  attachInterrupt(digitalPinToInterrupt(FLOW_1_PIN), countPulse1, FALLING);
  attachInterrupt(digitalPinToInterrupt(FLOW_2_PIN), countPulse2, FALLING);
  Serial.println("✅ Flow Sensors OK");

  // WiFi + Firebase
  connectWiFi();
  if (WiFi.status() == WL_CONNECTED) initFirebase();

  flowTimer = millis();
  Serial.println("====================================");
  Serial.println("🚀 SYSTEM RUNNING!");
  Serial.println("====================================\n");
}

// =============================================================
// 🔁 MAIN LOOP
// =============================================================
void loop() {

  // ----------------------------------------------------------
  // WiFi Reconnect Check
  // ----------------------------------------------------------
  if (millis() - wifiTimer >= WIFI_CHECK_INTERVAL) {
    wifiTimer = millis();
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("🔄 Reconnecting WiFi...");
      connectWiFi();
      if (WiFi.status() == WL_CONNECTED && !firebaseReady) {
        initFirebase();
      }
    }
  }

  // ----------------------------------------------------------
  // BMP180 Read
  // ----------------------------------------------------------
  temperature  = bmp.readTemperature();
  pressure_hpa = bmp.readPressure() / 100.0;

  // ----------------------------------------------------------
  // Vibration Sensor (with 100ms debounce)
  // ----------------------------------------------------------
  if (digitalRead(VIBRATION_PIN) == HIGH) {
    if (millis() - vibTimer > 100) {
      vibTimer    = millis();
      vibDetected = true;
    }
  } else {
    vibDetected = false;
  }

  // ----------------------------------------------------------
  // Flow Calculation (every 1 second)
  // ----------------------------------------------------------
  if (millis() - flowTimer >= 1000) {
    float elapsed = millis() - flowTimer;
    flowTimer = millis();

    // Safely read pulse counts
    noInterrupts();
    uint32_t c1 = pulseCount1;
    uint32_t c2 = pulseCount2;
    pulseCount1 = 0;
    pulseCount2 = 0;
    interrupts();

    // Calculate flow rates
    flowRate1 = ((1000.0 / elapsed) * c1) / CALIBRATION_FACTOR;
    flowRate2 = ((1000.0 / elapsed) * c2) / CALIBRATION_FACTOR;

    // Total volume
    totalLitres1 += flowRate1 / 60.0;
    totalLitres2 += flowRate2 / 60.0;

    // --------------------------------------------------------
    // Valve Control with Hysteresis
    // --------------------------------------------------------
    if (flowRate1 > OPEN_THRESHOLD)  { digitalWrite(RELAY_1_PIN, LOW);  valve1Open = true;  }
    if (flowRate1 < CLOSE_THRESHOLD) { digitalWrite(RELAY_1_PIN, HIGH); valve1Open = false; }
    if (flowRate2 > OPEN_THRESHOLD)  { digitalWrite(RELAY_2_PIN, LOW);  valve2Open = true;  }
    if (flowRate2 < CLOSE_THRESHOLD) { digitalWrite(RELAY_2_PIN, HIGH); valve2Open = false; }

    // --------------------------------------------------------
    // Leak Detection (confirm after 5 seconds)
    // --------------------------------------------------------
    float diff = abs(flowRate1 - flowRate2);
    if (diff > LEAK_THRESHOLD) {
      if (leakTimer == 0) leakTimer = millis();
      if (millis() - leakTimer > LEAK_CONFIRM_DELAY) {
        leakDetected = true;
        // Emergency close valves
        digitalWrite(RELAY_1_PIN, HIGH); valve1Open = false;
        digitalWrite(RELAY_2_PIN, HIGH); valve2Open = false;
        Serial.println("🚨 LEAK DETECTED - Valves CLOSED!");
      }
    } else {
      leakTimer    = 0;
      leakDetected = false;
    }

    // --------------------------------------------------------
    // Low Pressure Protection
    // --------------------------------------------------------
    if (pressure_hpa < MIN_PRESSURE) {
      lowPressure = true;
      digitalWrite(RELAY_1_PIN, HIGH); valve1Open = false;
      digitalWrite(RELAY_2_PIN, HIGH); valve2Open = false;
      Serial.println("🚨 LOW PRESSURE - Valves CLOSED!");
    } else {
      lowPressure = false;
    }

    // --------------------------------------------------------
    // Serial Monitor Output
    // --------------------------------------------------------
    Serial.println("------------------------------------");
    Serial.printf("🌡  Temp     : %.1f °C\n",      temperature);
    Serial.printf("📊 Pressure : %.1f hPa\n",      pressure_hpa);
    Serial.printf("💧 Flow 1   : %.2f L/min\n",    flowRate1);
    Serial.printf("💧 Flow 2   : %.2f L/min\n",    flowRate2);
    Serial.printf("📦 Total 1  : %.2f L\n",        totalLitres1);
    Serial.printf("📦 Total 2  : %.2f L\n",        totalLitres2);
    Serial.printf("⚖  Diff     : %.2f L/min\n",   abs(flowRate1 - flowRate2));
    Serial.printf("📳 Vibration: %s\n",            vibDetected  ? "🚨 DETECTED" : "✅ Normal");
    Serial.printf("🚰 Valve 1  : %s\n",            valve1Open   ? "🟢 OPEN"     : "🔴 CLOSED");
    Serial.printf("🚰 Valve 2  : %s\n",            valve2Open   ? "🟢 OPEN"     : "🔴 CLOSED");
    Serial.printf("🌊 Leak     : %s\n",            leakDetected ? "🚨 YES"      : "✅ No");
    Serial.printf("📡 WiFi     : %s\n",            WiFi.status() == WL_CONNECTED ? "✅ Connected" : "❌ Off");
    Serial.printf("🔥 Firebase : %s\n",            firebaseReady ? "✅ Ready"    : "❌ Off");
    Serial.println("------------------------------------");
  }

  // ----------------------------------------------------------
  // Firebase Upload (every 2 seconds)
  // ----------------------------------------------------------
  if (millis() - firebaseTimer >= FIREBASE_INTERVAL) {
    firebaseTimer = millis();
    sendToFirebase();
  }

  delay(10);
}
