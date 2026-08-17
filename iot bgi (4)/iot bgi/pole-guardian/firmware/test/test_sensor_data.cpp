#include <unity.h>
#include <ArduinoJson.h>

void test_json_format_concise_variables() {
    DynamicJsonDocument doc(512);
    doc["ts"] = 12345;
    doc["id"] = "esp32_001";
    doc["vib"] = 1;
    doc["flow"] = 2.45;
    doc["stat"] = "ok";
    
    String jsonStr;
    serializeJson(doc, jsonStr);
    
    TEST_ASSERT_TRUE(jsonStr.indexOf("ts") != -1);
    TEST_ASSERT_TRUE(jsonStr.indexOf("id") != -1);
    TEST_ASSERT_TRUE(jsonStr.indexOf("vib") != -1);
    TEST_ASSERT_TRUE(jsonStr.indexOf("flow") != -1);
    TEST_ASSERT_TRUE(jsonStr.indexOf("stat") != -1);
    
    TEST_ASSERT_FALSE(jsonStr.indexOf("timestamp") != -1);
    TEST_ASSERT_FALSE(jsonStr.indexOf("deviceId") != -1);
    TEST_ASSERT_FALSE(jsonStr.indexOf("vibration") != -1);
    TEST_ASSERT_FALSE(jsonStr.indexOf("status") != -1);
}

void test_json_size_efficiency() {
    DynamicJsonDocument doc(512);
    doc["ts"] = 12345;
    doc["id"] = "esp32_001";
    doc["vib"] = 1;
    doc["flow"] = 2.45;
    doc["stat"] = "ok";
    
    String jsonStr;
    serializeJson(doc, jsonStr);
    
    TEST_ASSERT_LESS_THAN(100, jsonStr.length());
}

void test_flow_sensor_adc_conversion() {
    int flowRaw = 2048;
    float flowRate = (flowRaw * 3.3 / 4095.0) * 10.0;
    float expected = (2048 * 3.3 / 4095.0) * 10.0;
    
    TEST_ASSERT_FLOAT_WITHIN(0.01, expected, flowRate);
}

void test_vibration_status_logic() {
    unsigned long currentTime = 5000;
    unsigned long vibTime = 4500;
    bool vibDetected = false;
    
    int vibStatus = (vibDetected || (currentTime - vibTime < 1000)) ? 1 : 0;
    TEST_ASSERT_EQUAL(1, vibStatus);
    
    vibTime = 3000;
    vibStatus = (vibDetected || (currentTime - vibTime < 1000)) ? 1 : 0;
    TEST_ASSERT_EQUAL(0, vibStatus);
}

void setup() {
    UNITY_BEGIN();
    RUN_TEST(test_json_format_concise_variables);
    RUN_TEST(test_json_size_efficiency);
    RUN_TEST(test_flow_sensor_adc_conversion);
    RUN_TEST(test_vibration_status_logic);
    UNITY_END();
}

void loop() {
}