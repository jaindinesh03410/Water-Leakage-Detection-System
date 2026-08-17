#ifndef CONFIG_H
#define CONFIG_H

#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define API_KEY "Api Dalni h idher"
#define DATABASE_URL "DAta base url dalna h idher"

#define VIB_PIN 14
#define FLOW_PIN 34
#define DEV_ID "esp32_001"

#define READ_INTERVAL 5000
#define MAX_RETRIES 5
#define BASE_RETRY_DELAY 1000
#define MAX_RETRY_DELAY 30000
#define WIFI_TIMEOUT 10000
#define SEND_MAX_ATTEMPTS 3

struct RetryConfig {
  int maxRetries = MAX_RETRIES;
  unsigned long baseDelay = BASE_RETRY_DELAY;
  unsigned long maxDelay = MAX_RETRY_DELAY;
  int currentRetry = 0;
  unsigned long lastAttempt = 0;
};

#endif
