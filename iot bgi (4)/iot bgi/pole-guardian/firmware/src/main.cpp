#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <ArduinoJson.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include "config.h"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

volatile bool vibDetected = false;
volatile unsigned long vibTime = 0;
unsigned long lastRead = 0;

RetryConfig wifiRetry;
RetryConfig firebaseRetry;
bool isConnected = false;

void IRAM_ATTR vibISR() {
  vibDetected = true;
  vibTime = millis();
}

unsigned long calculateBackoffDelay(RetryConfig* retry) {
  unsigned long delay = retry->baseDelay * (1 << retry->currentRetry);
  return min(delay, retry->maxDelay);
}

bool connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    wifiRetry.currentRetry = 0;
    return true;
  }
  
  if (millis() - wifiRetry.lastAttempt < calculateBackoffDelay(&wifiRetry)) {
    return false;
  }
  
  if (wifiRetry.currentRetry >= wifiRetry.maxRetries) {
    Serial.println("WiFi max retries exceeded");
    wifiRetry.currentRetry = 0;
    wifiRetry.lastAttempt = millis();
    return false;
  }
  
  Serial.printf("WiFi attempt %d/%d\n", wifiRetry.currentRetry + 1, wifiRetry.maxRetries);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startTime < WIFI_TIMEOUT) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.printf("WiFi connected: %s\n", WiFi.localIP().toString().c_str());
    wifiRetry.currentRetry = 0;
    return true;
  } else {
    Serial.println("\nWiFi connection failed");
    wifiRetry.currentRetry++;
    wifiRetry.lastAttempt = millis();
    return false;
  }
}

bool initFirebase() {
  if (Firebase.ready()) {
    firebaseRetry.currentRetry = 0;
    isConnected = true;
    return true;
  }
  
  if (millis() - firebaseRetry.lastAttempt < calculateBackoffDelay(&firebaseRetry)) {
    return false;
  }
  
  if (firebaseRetry.currentRetry >= firebaseRetry.maxRetries) {
    Serial.println("Firebase max retries exceeded");
    firebaseRetry.currentRetry = 0;
    firebaseRetry.lastAttempt = millis();
    return false;
  }
  
  Serial.printf("Firebase attempt %d/%d\n", firebaseRetry.currentRetry + 1, firebaseRetry.maxRetries);
  
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  config.token_status_callback = tokenStatusCallback;
  
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Firebase auth successful");
    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
    firebaseRetry.currentRetry = 0;
    isConnected = true;
    return true;
  } else {
    Serial.printf("Firebase auth failed: %s\n", config.signer.signupError.message.c_str());
    firebaseRetry.currentRetry++;
    firebaseRetry.lastAttempt = millis();
    isConnected = false;
    return false;
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("PoleGuardian ESP32 starting...");
  
  pinMode(VIB_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(VIB_PIN), vibISR, FALLING);
  
  connectWiFi();
  initFirebase();
}

void loop() {
  if (!connectWiFi()) {
    delay(1000);
    return;
  }
  
  if (!initFirebase()) {
    delay(1000);
    return;
  }
  
  if (millis() - lastRead >= READ_INTERVAL) {
    readSensorsAndSend();
    lastRead = millis();
  }
  
  if (vibDetected) {
    vibDetected = false;
    Serial.println("Vibration detected!");
  }
  
  delay(100);
}

bool sendDataWithRetry(const String& path, DynamicJsonDocument& doc, const String& jsonStr) {
  int attempts = 0;
  unsigned long retryDelay = BASE_RETRY_DELAY;
  
  while (attempts < SEND_MAX_ATTEMPTS) {
    if (Firebase.RTDB.setJSON(&fbdo, path.c_str(), &doc)) {
      Serial.println("Data sent successfully");
      Serial.println("Path: " + path);
      Serial.println("Data: " + jsonStr);
      return true;
    }
    
    attempts++;
    Serial.printf("Send attempt %d failed: %s\n", attempts, fbdo.errorReason().c_str());
    
    if (attempts < SEND_MAX_ATTEMPTS) {
      Serial.printf("Retrying in %lu ms...\n", retryDelay);
      delay(retryDelay);
      retryDelay *= 2;
    }
  }
  
  Serial.println("Failed to send data after all retries");
  return false;
}

void readSensorsAndSend() {
  if (!isConnected) {
    Serial.println("Not connected to Firebase, skipping data send");
    return;
  }
  
  int flowRaw = analogRead(FLOW_PIN);
  float flowRate = (flowRaw * 3.3 / 4095.0) * 10.0;
  int vibStatus = (vibDetected || (millis() - vibTime < 1000)) ? 1 : 0;
  
  DynamicJsonDocument doc(512);
  doc["ts"] = millis();
  doc["id"] = DEV_ID;
  doc["vib"] = vibStatus;
  doc["flow"] = round(flowRate * 100) / 100.0;
  doc["stat"] = isConnected ? "ok" : "disconnected";
  doc["wifi"] = WiFi.status() == WL_CONNECTED ? "connected" : "disconnected";
  doc["rssi"] = WiFi.RSSI();
  
  String jsonStr;
  serializeJson(doc, jsonStr);
  
  String path = "/readings/" + String(DEV_ID) + "/" + String(millis());
  
  if (!sendDataWithRetry(path, doc, jsonStr)) {
    isConnected = false;
    firebaseRetry.currentRetry = 0;
    firebaseRetry.lastAttempt = millis();
  }
}