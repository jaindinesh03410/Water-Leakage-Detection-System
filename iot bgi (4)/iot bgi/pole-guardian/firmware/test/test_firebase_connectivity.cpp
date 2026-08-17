#include <unity.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <ArduinoJson.h>

void setUp(void) {
}

void tearDown(void) {
}

void test_exponential_backoff_calculation() {
    struct RetryConfig {
        int maxRetries = 5;
        unsigned long baseDelay = 1000;
        unsigned long maxDelay = 30000;
        int currentRetry = 0;
        unsigned long lastAttempt = 0;
    };
    
    auto calculateBackoffDelay = [](RetryConfig* retry) -> unsigned long {
        unsigned long delay = retry->baseDelay * (1 << retry->currentRetry);
        return min(delay, retry->maxDelay);
    };
    
    RetryConfig retry;
    
    retry.currentRetry = 0;
    TEST_ASSERT_EQUAL(1000, calculateBackoffDelay(&retry));
    
    retry.currentRetry = 1;
    TEST_ASSERT_EQUAL(2000, calculateBackoffDelay(&retry));
    
    retry.currentRetry = 2;
    TEST_ASSERT_EQUAL(4000, calculateBackoffDelay(&retry));
    
    retry.currentRetry = 3;
    TEST_ASSERT_EQUAL(8000, calculateBackoffDelay(&retry));
    
    retry.currentRetry = 10;
    TEST_ASSERT_EQUAL(30000, calculateBackoffDelay(&retry));
}

void test_json_data_format() {
    DynamicJsonDocument doc(512);
    doc["ts"] = 1234567890;
    doc["id"] = "esp32_001";
    doc["vib"] = 0;
    doc["flow"] = 12.34;
    doc["stat"] = "ok";
    doc["wifi"] = "connected";
    doc["rssi"] = -45;
    
    String jsonStr;
    serializeJson(doc, jsonStr);
    
    TEST_ASSERT_TRUE(jsonStr.indexOf("\"ts\":1234567890") > -1);
    TEST_ASSERT_TRUE(jsonStr.indexOf("\"id\":\"esp32_001\"") > -1);
    TEST_ASSERT_TRUE(jsonStr.indexOf("\"vib\":0") > -1);
    TEST_ASSERT_TRUE(jsonStr.indexOf("\"flow\":12.34") > -1);
    TEST_ASSERT_TRUE(jsonStr.indexOf("\"stat\":\"ok\"") > -1);
    TEST_ASSERT_TRUE(jsonStr.indexOf("\"wifi\":\"connected\"") > -1);
    TEST_ASSERT_TRUE(jsonStr.indexOf("\"rssi\":-45") > -1);
}

void test_path_generation() {
    String deviceId = "esp32_001";
    unsigned long timestamp = 1234567890;
    String expectedPath = "/readings/esp32_001/1234567890";
    String actualPath = "/readings/" + deviceId + "/" + String(timestamp);
    
    TEST_ASSERT_EQUAL_STRING(expectedPath.c_str(), actualPath.c_str());
}

void test_flow_sensor_conversion() {
    int flowRaw = 2048;
    float expectedFlow = (2048 * 3.3 / 4095.0) * 10.0;
    float actualFlow = (flowRaw * 3.3 / 4095.0) * 10.0;
    float roundedFlow = round(actualFlow * 100) / 100.0;
    
    TEST_ASSERT_FLOAT_WITHIN(0.01, expectedFlow, actualFlow);
    TEST_ASSERT_FLOAT_WITHIN(0.01, round(expectedFlow * 100) / 100.0, roundedFlow);
}

void test_vibration_status_logic() {
    unsigned long currentTime = 10000;
    unsigned long vibTime = 9500;
    bool vibDetected = false;
    
    int vibStatus1 = (vibDetected || (currentTime - vibTime < 1000)) ? 1 : 0;
    TEST_ASSERT_EQUAL(1, vibStatus1);
    
    vibTime = 8500;
    int vibStatus2 = (vibDetected || (currentTime - vibTime < 1000)) ? 1 : 0;
    TEST_ASSERT_EQUAL(0, vibStatus2);
    
    vibDetected = true;
    int vibStatus3 = (vibDetected || (currentTime - vibTime < 1000)) ? 1 : 0;
    TEST_ASSERT_EQUAL(1, vibStatus3);
}

void setup() {
    UNITY_BEGIN();
    
    RUN_TEST(test_exponential_backoff_calculation);
    RUN_TEST(test_json_data_format);
    RUN_TEST(test_path_generation);
    RUN_TEST(test_flow_sensor_conversion);
    RUN_TEST(test_vibration_status_logic);
    
    UNITY_END();
}

void loop() {
}