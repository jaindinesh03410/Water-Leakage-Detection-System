#include <Wire.h>
#include <Adafruit_BMP085.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// --- CREDENTIALS ---
#define WIFI_SSID "APNA_WIFI_NAME"
#define WIFI_PASSWORD "APNA_PASSWORD"
#define BACKEND_URL "http://YOUR_BACKEND_IP:8000/api/sensor_data"  // Replace with your backend IP

// --- PINS ---
#define FLOW_1_PIN 25
#define FLOW_2_PIN 26
#define VIBRATION_PIN 14

// Global Objects
Adafruit_BMP085 bmp;
HTTPClient http;

volatile int pulseCount1 = 0;
volatile int pulseCount2 = 0;
float flowRate1 = 0.0, flowRate2 = 0.0;

// Interrupt functions for flow sensors
void IRAM_ATTR pulseCounter1() { pulseCount1++; }
void IRAM_ATTR pulseCounter2() { pulseCount2++; }

void setup() {
  Serial.begin(115200);
  
  // Sensor Setup
  pinMode(FLOW_1_PIN, INPUT_PULLUP);
  pinMode(FLOW_2_PIN, INPUT_PULLUP);
  pinMode(VIBRATION_PIN, INPUT);
  
  attachInterrupt(digitalPinToInterrupt(FLOW_1_PIN), pulseCounter1, FALLING);
  attachInterrupt(digitalPinToInterrupt(FLOW_2_PIN), pulseCounter2, FALLING);
  
  if (!bmp.begin()) {
    Serial.println("BMP180 not found!");
  }
  
  // WiFi Connection
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { 
    delay(500); 
    Serial.print("."); 
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void sendDataToBackend(float flowIn, float flowOut, bool leakage, float pressure, bool vibration) {
  if (WiFi.status() == WL_CONNECTED) {
    http.begin(BACKEND_URL);
    http.addHeader("Content-Type", "application/json");
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["flow_in"] = flowIn;
    doc["flow_out"] = flowOut;
    doc["leakage_detected"] = leakage;
    doc["pressure"] = pressure;
    doc["vibration_alert"] = vibration;
    doc["last_updated"] = ""; // Backend will add timestamp
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Send POST request
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("✅ Data sent successfully!");
      Serial.println("Response: " + response);
    } else {
      Serial.println("❌ Error sending data: " + String(httpResponseCode));
    }
    
    http.end();
  } else {
    Serial.println("❌ WiFi not connected");
  }
}

void loop() {
  // 1. Flow Calculation (Comparison)
  pulseCount1 = 0; 
  pulseCount2 = 0;
  delay(1000); // 1 second measure period
  
  flowRate1 = (pulseCount1 / 7.5); // L/min (approx for YF-S201)
  flowRate2 = (pulseCount2 / 7.5);
  float leakage = flowRate1 - flowRate2;
  
  // 2. Pressure & Vibration
  float pressure = bmp.readPressure() / 100.0; // hPa
  bool isVibrating = digitalRead(VIBRATION_PIN);
  bool leakageDetected = (leakage > 0.5); // Threshold 0.5 L/min
  
  // 3. Print sensor readings
  Serial.println("\n📊 Sensor Readings:");
  Serial.println("Flow In: " + String(flowRate1) + " L/min");
  Serial.println("Flow Out: " + String(flowRate2) + " L/min");
  Serial.println("Leakage: " + String(leakage) + " L/min");
  Serial.println("Pressure: " + String(pressure) + " hPa");
  Serial.println("Vibration: " + String(isVibrating ? "DETECTED" : "Normal"));
  
  // 4. Send to Backend
  sendDataToBackend(flowRate1, flowRate2, leakageDetected, pressure, isVibrating);
  
  delay(2000); // 2 second update cycle
}