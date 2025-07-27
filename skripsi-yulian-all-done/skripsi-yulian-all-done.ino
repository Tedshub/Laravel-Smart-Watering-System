#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <LiquidCrystal_I2C.h>
#include <Wire.h>

// WiFi credentials
const char* ssid = "KHUSUS DEWASA";
const char* password = "PUTRAMINAN2023";

// Laravel server configuration
const char* serverURL = "http://192.168.1.3:8000";
const char* registerEndpoint = "/api/device/register";
const char* statusCheckEndpoint = "/api/device/status";
const char* validateEndpoint = "/api/device/validate";
const char* schedulesEndpoint = "/api/schedules";
const char* relayLogEndpoint = "/api/relay/log";
const char* sensorLogEndpoint = "/api/sensor/log";

// Device information
String deviceApiKey = "";
int deviceId = 0;
bool isRegistered = false;
bool pendingStatusUpdate = false;
unsigned long lastStatusUpdate = 0;
const long statusUpdateInterval = 30000;
const long connectionTimeout = 60000;
const long scheduleCheckInterval = 35000;
const long sensorLogInterval = 5000;

// Relay configuration
const int relayPin = 13;
bool relayState = false;
unsigned long relayTurnOffTime = 0;
bool lastRelayState = false;
bool relayBySchedule = false; // Track if relay is on by schedule

// Raindrop sensors configuration - Digital pins
const uint8_t RAIN_DO_PINS[4] = {25, 27, 14, 12};
// Raindrop sensors configuration - Analog pins
const uint8_t RAIN_AO_PINS[4] = {34, 35, 32, 33};

bool rainSensorStates[4] = {false, false, false, false}; // false = no rain, true = rain detected
bool rainSensorActive[4] = {false, false, false, false}; // false = sensor inactive, true = sensor active
bool rainSensorManualActive[4] = {false, false, false, false}; // Track manual activation via serial
unsigned long rainStartTime[4] = {0, 0, 0, 0}; // Track when each sensor started detecting rain
unsigned long lastRainDuration[4] = {0, 0, 0, 0}; // Track the last rain duration for each sensor
unsigned long lastSensorLogTime = 0;

// Rain detection thresholds
const int RAIN_THRESHOLD_DIGITAL = LOW; // Digital threshold (LOW = rain)
const int RAIN_THRESHOLD_ANALOG = 2000; // Analog threshold (lower = more moisture)

// Time configuration
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 7 * 3600, 60000); // GMT+7
unsigned long lastScheduleCheck = 0;

// LCD configuration
LiquidCrystal_I2C lcd(0x27, 16, 2);
unsigned long lastLCDUpdate = 0;
const long lcdUpdateInterval = 1000; // Update LCD every second
int lcdDisplayMode = 0; // 0 = clock + sensors, 1 = relay status
unsigned long relayDisplayTime = 0;
const long relayDisplayDuration = 3000; // Show relay status for 3 seconds

// Preferences
Preferences preferences;

void setup() {
  Serial.begin(115200);
  
  // Initialize I2C and LCD
  Wire.begin();
  lcd.init();
  lcd.backlight();
  lcd.clear();
  
  // Show startup message
  lcd.setCursor(0, 0);
  lcd.print("Smart Watering");
  lcd.setCursor(0, 1);
  lcd.print("Starting...");
  
  // Initialize relay
  pinMode(relayPin, OUTPUT);
  digitalWrite(relayPin, LOW);
  
  // Initialize rain sensors
  for (int i = 0; i < 4; i++) {
    pinMode(RAIN_DO_PINS[i], INPUT_PULLUP);
    // Analog pins don't need pinMode setup
    rainStartTime[i] = 0;
    lastRainDuration[i] = 0;
  }

  preferences.begin("device", false);
  loadDeviceData();

  // Show WiFi connecting message
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");
  lcd.setCursor(0, 1);
  lcd.print("Please wait...");
  
  connectToWiFi();
  timeClient.begin();

  // Show server URL after WiFi connection
  if (WiFi.status() == WL_CONNECTED) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Server:");
    lcd.setCursor(0, 1);
    lcd.print("192.168.1.3:8000");
    delay(3000); // Show for 3 seconds
    
    // Show booting system message
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Booting System");
    lcd.setCursor(0, 1);
    lcd.print("Please wait...");
    delay(2000);
  }

  if (isRegistered) {
    if (!validateDeviceOnServer()) {
      Serial.println("Device validation failed. Resetting...");
      resetDeviceRegistration();
    } else {
      Serial.println("Device validated on server");
      updateDeviceStatus(true);
      fetchAndProcessSchedules();
    }
  } else {
    registerDevice();
  }
  
  // Show system ready
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("System Ready");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");
  delay(2000);
  
  Serial.println("Rain Sensor Control Commands:");
  Serial.println("1 - Activate Sensor 1");
  Serial.println("01 - Deactivate Sensor 1");
  Serial.println("2 - Activate Sensor 2");
  Serial.println("02 - Deactivate Sensor 2");
  Serial.println("3 - Activate Sensor 3");
  Serial.println("03 - Deactivate Sensor 3");
  Serial.println("4 - Activate Sensor 4");
  Serial.println("04 - Deactivate Sensor 4");
  Serial.println("status - Show current status");
}

void loop() {
  timeClient.update();

  // Handle serial input for sensor control
  handleSerialInput();

  // Read rain sensors
  readRainSensors();

  // Update LCD display
  updateLCDDisplay();

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected. Reconnecting...");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Lost");
    lcd.setCursor(0, 1);
    lcd.print("Reconnecting...");
    
    connectToWiFi();
    
    if (WiFi.status() != WL_CONNECTED && millis() > connectionTimeout) {
      if (isRegistered) {
        updateDeviceStatus(false);
      }
    }
  }

  if (isRegistered) {
    if (millis() - lastStatusUpdate > statusUpdateInterval) {
      updateDeviceStatus(true);
      lastStatusUpdate = millis();
    }

    if (millis() - lastScheduleCheck > scheduleCheckInterval) {
      fetchAndProcessSchedules();
      lastScheduleCheck = millis();
    }

    // Log sensor status periodically
    if (millis() - lastSensorLogTime > sensorLogInterval) {
      logSensorStatus();
      lastSensorLogTime = millis();
    }
  }

  // Check relay state changes
  if (relayState != lastRelayState) {
    if (relayState) {
      // Relay turned ON
      lcdDisplayMode = 1; // Switch to relay display mode
      relayDisplayTime = millis();
      logRelayEvent("schedule_triggered", (relayTurnOffTime - millis()) / 1000);
    } else {
      // Relay turned OFF
      lcdDisplayMode = 1; // Switch to relay display mode
      relayDisplayTime = millis();
    }
    lastRelayState = relayState;
  }

  // Check if we should return to normal display mode
  if (lcdDisplayMode == 1 && millis() - relayDisplayTime > relayDisplayDuration) {
    lcdDisplayMode = 0; // Return to clock + sensor display
  }

  // Check if relay should be turned off based on time
  if (relayState && millis() >= relayTurnOffTime) {
    setRelay(false);
    relayBySchedule = false;
  }

  delay(500); // Reduced delay for better responsiveness
}

void updateLCDDisplay() {
  if (millis() - lastLCDUpdate < lcdUpdateInterval) return;
  
  lastLCDUpdate = millis();
  
  if (lcdDisplayMode == 0) {
    // Display clock and sensor status
    displayClockAndSensors();
  } else if (lcdDisplayMode == 1) {
    // Display relay status
    displayRelayStatus();
  }
}

void displayClockAndSensors() {
  // First line: Time
  lcd.setCursor(0, 0);
  int hours = timeClient.getHours();
  int minutes = timeClient.getMinutes();
  int seconds = timeClient.getSeconds();
  
  lcd.print("Time: ");
  if (hours < 10) lcd.print("0");
  lcd.print(hours);
  lcd.print(":");
  if (minutes < 10) lcd.print("0");
  lcd.print(minutes);
  lcd.print(":");
  if (seconds < 10) lcd.print("0");
  lcd.print(seconds);
  
  // Second line: Sensor status
  lcd.setCursor(0, 1);
  lcd.print("S:");
  
  for (int i = 0; i < 4; i++) {
    if (rainSensorActive[i] || rainSensorManualActive[i]) {
      if (rainSensorStates[i]) {
        lcd.print("R"); // Rain detected
      } else {
        lcd.print("D"); // Dry (active but no rain)
      }
    } else {
      lcd.print("-"); // Inactive
    }
  }
  
  // Show relay status on second line
  lcd.print(" R:");
  lcd.print(relayState ? "ON" : "OFF");
  
  // Clear remaining characters
  lcd.print("   ");
}

void displayRelayStatus() {
  lcd.clear();
  lcd.setCursor(0, 0);
  
  if (relayState) {
    lcd.print("RELAY ON");
    lcd.setCursor(0, 1);
    unsigned long remainingTime = (relayTurnOffTime - millis()) / 1000;
    if (remainingTime > 0) {
      lcd.print("Time: ");
      lcd.print(remainingTime);
      lcd.print("s");
    } else {
      lcd.print("Manual Control");
    }
  } else {
    lcd.print("RELAY OFF");
    lcd.setCursor(0, 1);
    lcd.print("System Ready");
  }
}

void logSensorStatus() {
  if (!isRegistered || WiFi.status() != WL_CONNECTED) return;

  // Count active sensors
  int activeSensors = 0;
  for (int i = 0; i < 4; i++) {
    if (rainSensorActive[i] || rainSensorManualActive[i]) activeSensors++;
  }

  // Skip if no active sensors
  if (activeSensors == 0) {
    Serial.println("No active sensors, skipping log");
    return;
  }

  HTTPClient http;
  String url = String(serverURL) + sensorLogEndpoint;

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");
  http.addHeader("Authorization", "Bearer " + deviceApiKey);

  DynamicJsonDocument doc(1024);
  JsonArray sensors = doc.createNestedArray("sensors");
  doc["device_id"] = deviceId;

  for (int i = 0; i < 4; i++) {
    if (rainSensorActive[i] || rainSensorManualActive[i]) {
      JsonObject sensor = sensors.createNestedObject();
      sensor["id"] = i + 1;
      sensor["status"] = rainSensorStates[i] ? "raining" : "safe";
      
      // Calculate duration only if it's currently raining
      if (rainSensorStates[i]) {
        if (rainStartTime[i] == 0) {
          // Just started raining
          rainStartTime[i] = millis();
          sensor["duration_seconds"] = 0;
        } else {
          // Calculate duration in seconds
          sensor["duration_seconds"] = (millis() - rainStartTime[i]) / 1000;
        }
      } else if (lastRainDuration[i] > 0) {
        // Not raining now, but we have a previous duration to log
        sensor["duration_seconds"] = lastRainDuration[i];
        lastRainDuration[i] = 0; // Reset after logging
      } else {
        // No rain and no previous duration
        sensor["duration_seconds"] = 0;
      }
    }
  }

  String payload;
  serializeJson(doc, payload);

  Serial.println("Sending sensor log to: " + url);
  Serial.println("Payload: " + payload);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode == 200) {
    Serial.println("Sensor status logged successfully");
  } else {
    String response = http.getString();
    Serial.println("Failed to log sensor status. HTTP Code: " + String(httpResponseCode));
    Serial.println("Response: " + response);
  }

  http.end();
}

void logRelayEvent(const char* event, long duration) {
  if (!isRegistered || WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(serverURL) + relayLogEndpoint;

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");
  if (deviceApiKey != "") {
    http.addHeader("Authorization", "Bearer " + deviceApiKey);
  }

  DynamicJsonDocument doc(200);
  doc["event"] = event;
  doc["duration"] = duration;
  doc["device_id"] = deviceId;
  
  String payload;
  serializeJson(doc, payload);

  Serial.println("Sending relay log to: " + url);
  Serial.println("Payload: " + payload);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode == 200) {
    Serial.println("Relay event logged successfully");
  } else {
    String response = http.getString();
    Serial.println("Failed to log relay event. HTTP Code: " + String(httpResponseCode));
    Serial.println("Response: " + response);
  }

  http.end();
}

void handleSerialInput() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    if (command == "1") {
      rainSensorManualActive[0] = true;
      rainStartTime[0] = 0;
      lastRainDuration[0] = 0;
      Serial.println("Sensor 1 manually activated");
    } else if (command == "01") {
      rainSensorManualActive[0] = false;
      rainStartTime[0] = 0;
      lastRainDuration[0] = 0;
      Serial.println("Sensor 1 manually deactivated");
    } else if (command == "2") {
      rainSensorManualActive[1] = true;
      rainStartTime[1] = 0;
      lastRainDuration[1] = 0;
      Serial.println("Sensor 2 manually activated");
    } else if (command == "02") {
      rainSensorManualActive[1] = false;
      rainStartTime[1] = 0;
      lastRainDuration[1] = 0;
      Serial.println("Sensor 2 manually deactivated");
    } else if (command == "3") {
      rainSensorManualActive[2] = true;
      rainStartTime[2] = 0;
      lastRainDuration[2] = 0;
      Serial.println("Sensor 3 manually activated");
    } else if (command == "03") {
      rainSensorManualActive[2] = false;
      rainStartTime[2] = 0;
      lastRainDuration[2] = 0;
      Serial.println("Sensor 3 manually deactivated");
    } else if (command == "4") {
      rainSensorManualActive[3] = true;
      rainStartTime[3] = 0;
      lastRainDuration[3] = 0;
      Serial.println("Sensor 4 manually activated");
    } else if (command == "04") {
      rainSensorManualActive[3] = false;
      rainStartTime[3] = 0;
      lastRainDuration[3] = 0;
      Serial.println("Sensor 4 manually deactivated");
    } else if (command == "status") {
      printCurrentStatus();
    }
  }
}

void readRainSensors() {
  for (int i = 0; i < 4; i++) {
    // Read both digital and analog values
    bool digitalReading = digitalRead(RAIN_DO_PINS[i]) == RAIN_THRESHOLD_DIGITAL;
    int analogReading = analogRead(RAIN_AO_PINS[i]);
    
    // Sensor is considered active if moisture is detected OR manually activated
    bool sensorCurrentlyActive = digitalReading || analogReading < RAIN_THRESHOLD_ANALOG;
    rainSensorActive[i] = sensorCurrentlyActive;
    
    // Determine if rain is detected (considering both auto-detection and manual activation)
    bool rainDetected = false;
    if (rainSensorManualActive[i]) {
      // If manually activated, use the sensor readings
      rainDetected = sensorCurrentlyActive;
    } else {
      // If not manually activated, only detect rain if sensor naturally detects moisture
      rainDetected = sensorCurrentlyActive;
    }
    
    if (rainDetected != rainSensorStates[i]) {
      // State changed
      rainSensorStates[i] = rainDetected;
      
      if (rainDetected) {
        // Just started raining
        rainStartTime[i] = millis();
        lastRainDuration[i] = 0; // Reset previous duration
        Serial.print("Sensor ");
        Serial.print(i + 1);
        Serial.println(" detected rain");
        
        // If rain detected and relay is on by schedule, turn off relay
        if (relayState && relayBySchedule) {
          setRelay(false);
          relayBySchedule = false;
          Serial.println("Rain detected, turning off scheduled relay");
        }
      } else {
        // Rain stopped - store the duration
        if (rainStartTime[i] > 0) {
          lastRainDuration[i] = (millis() - rainStartTime[i]) / 1000;
        }
        rainStartTime[i] = 0;
        Serial.print("Sensor ");
        Serial.print(i + 1);
        Serial.println(" no rain detected");
      }
    }
    
    // Print sensor readings for debugging (optional)
    if (millis() % 10000 == 0) { // Print every 10 seconds
      Serial.print("Sensor ");
      Serial.print(i + 1);
      Serial.print(" - Digital: ");
      Serial.print(digitalReading ? "WET" : "DRY");
      Serial.print(", Analog: ");
      Serial.print(analogReading);
      Serial.print(", Active: ");
      Serial.print((rainSensorActive[i] || rainSensorManualActive[i]) ? "YES" : "NO");
      Serial.print(", Rain: ");
      Serial.println(rainSensorStates[i] ? "DETECTED" : "NONE");
    }
  }
}

bool isRainDetected() {
  for (int i = 0; i < 4; i++) {
    if ((rainSensorActive[i] || rainSensorManualActive[i]) && rainSensorStates[i]) {
      return true;
    }
  }
  return false;
}

void printCurrentStatus() {
  Serial.println("\nCurrent Status:");
  Serial.println("---------------");
  Serial.println("Relay: " + String(relayState ? "ON" : "OFF"));
  Serial.println("Relay by schedule: " + String(relayBySchedule ? "YES" : "NO"));
  
  Serial.println("Rain Sensors:");
  for (int i = 0; i < 4; i++) {
    Serial.print("  Sensor ");
    Serial.print(i + 1);
    Serial.print(": ");
    
    bool totallyActive = rainSensorActive[i] || rainSensorManualActive[i];
    Serial.print(totallyActive ? "Active" : "Inactive");
    
    if (rainSensorManualActive[i]) {
      Serial.print(" (Manual)");
    }
    
    Serial.print(" - ");
    Serial.print(rainSensorStates[i] ? "Rain Detected" : "No Rain");
    
    // Read current analog value
    int analogValue = analogRead(RAIN_AO_PINS[i]);
    Serial.print(" (Analog: ");
    Serial.print(analogValue);
    Serial.print(")");
    
    if (rainSensorStates[i] && rainStartTime[i] > 0) {
      Serial.print(" (Current duration: ");
      Serial.print((millis() - rainStartTime[i]) / 1000);
      Serial.print("s)");
    } else if (lastRainDuration[i] > 0) {
      Serial.print(" (Last duration: ");
      Serial.print(lastRainDuration[i]);
      Serial.print("s)");
    }
    
    Serial.println();
  }
  
  Serial.println("---------------\n");
}

void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  WiFi.disconnect(true);
  delay(1000);
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  unsigned long startAttemptTime = millis();
  
  while (WiFi.status() != WL_CONNECTED && millis() - startAttemptTime < 15000) {
    delay(500);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    timeClient.forceUpdate();
  } else {
    Serial.println("\nFailed to connect to WiFi");
  }
}

void loadDeviceData() {
  deviceApiKey = preferences.getString("apiKey", "");
  deviceId = preferences.getInt("deviceId", 0);
  isRegistered = preferences.getBool("registered", false);

  Serial.println("Loaded device data:");
  Serial.println("Device ID: " + String(deviceId));
  Serial.println("API Key: " + deviceApiKey);
  Serial.println("Registered: " + String(isRegistered));
}

void saveDeviceData() {
  preferences.putString("apiKey", deviceApiKey);
  preferences.putInt("deviceId", deviceId);
  preferences.putBool("registered", isRegistered);
  Serial.println("Device data saved");
}

void registerDevice() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected. Cannot register.");
    return;
  }

  HTTPClient http;
  String url = String(serverURL) + registerEndpoint;

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");

  DynamicJsonDocument doc(200);
  doc["ip"] = WiFi.localIP().toString();
  String payload;
  serializeJson(doc, payload);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode == 200) {
    String response = http.getString();
    DynamicJsonDocument responseDoc(500);
    DeserializationError error = deserializeJson(responseDoc, response);

    if (!error && responseDoc["status"] == "success") {
      deviceApiKey = responseDoc["api_key"].as<String>();
      deviceId = responseDoc["device_id"].as<int>();
      isRegistered = true;
      saveDeviceData();

      Serial.println("Registration successful");
      updateDeviceStatus(true);
      fetchAndProcessSchedules();
    } else {
      Serial.println("Failed to parse registration response");
    }
  } else {
    Serial.println("Registration failed. HTTP Code: " + String(httpResponseCode));
  }

  http.end();
}

bool validateDeviceOnServer() {
  if (!isRegistered || WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  String url = String(serverURL) + validateEndpoint;

  http.begin(url);
  http.addHeader("Authorization", "Bearer " + deviceApiKey);
  http.addHeader("Accept", "application/json");
  http.setTimeout(5000);

  int httpResponseCode = http.GET();

  if (httpResponseCode == 200) {
    String response = http.getString();
    DynamicJsonDocument doc(300);
    DeserializationError error = deserializeJson(doc, response);

    if (!error && doc["status"] == "valid") {
      return true;
    }
  }

  http.end();
  return false;
}

void updateDeviceStatus(bool isActive) {
  if (!isRegistered) return;

  if (WiFi.status() != WL_CONNECTED) {
    if (!isActive) pendingStatusUpdate = true;
    return;
  }

  HTTPClient http;
  String url = String(serverURL) + statusCheckEndpoint;

  http.begin(url);
  http.addHeader("Authorization", "Bearer " + deviceApiKey);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Accept", "application/json");

  DynamicJsonDocument doc(200);
  doc["status"] = isActive ? "active" : "inactive";
  doc["device_id"] = deviceId;
  doc["ip_address"] = WiFi.localIP().toString();
  String payload;
  serializeJson(doc, payload);

  int httpResponseCode = http.POST(payload);

  if (httpResponseCode == 200) {
    pendingStatusUpdate = false;
    lastStatusUpdate = millis();
  } else if (httpResponseCode == 401) {
    Serial.println("Unauthorized - Invalid API Key");
    resetDeviceRegistration();
  } else {
    Serial.println("Status update failed. Error: " + String(httpResponseCode));
    if (!isActive) pendingStatusUpdate = true;
  }

  http.end();
}

void fetchAndProcessSchedules() {
  if (!isRegistered || WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(serverURL) + schedulesEndpoint;
  
  Serial.println("Fetching schedules from: " + url);

  http.begin(url);
  http.addHeader("Accept", "application/json");
  http.setTimeout(5000);

  int httpResponseCode = http.GET();

  Serial.println("HTTP Response code: " + String(httpResponseCode));
  
  if (httpResponseCode == HTTP_CODE_OK) {
    String response = http.getString();
    Serial.println("Raw response: " + response);
    
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      if (doc.is<JsonArray>()) {
        processFilteredSchedules(doc.as<JsonArray>());
      } else if (doc.containsKey("data") && doc["data"].is<JsonArray>()) {
        processFilteredSchedules(doc["data"].as<JsonArray>());
      } else {
        Serial.println("Unexpected response format");
      }
    } else {
      Serial.print("JSON parsing error: ");
      Serial.println(error.c_str());
    }
  } else {
    Serial.println("Error in HTTP request: " + http.errorToString(httpResponseCode));
  }

  http.end();
}

void processFilteredSchedules(JsonArray schedules) {
  timeClient.update();
  int currentHour = timeClient.getHours();
  int currentMinute = timeClient.getMinutes();
  unsigned long currentMillis = millis();
  bool foundActiveSchedule = false;

  Serial.println("Current time: " + String(currentHour) + ":" + String(currentMinute));
  Serial.println("Filtering schedules for device ID: " + String(deviceId));

  for (JsonObject schedule : schedules) {
    if (schedule["device_id"] != deviceId) {
      continue;
    }

    int hour = schedule["hour"];
    int minute = schedule["minute"];
    int duration = schedule["duration"];
    bool isActive = schedule["active"] | true;

    if (!isActive) {
      continue;
    }

    int currentTotalMinutes = currentHour * 60 + currentMinute;
    int scheduleTotalMinutes = hour * 60 + minute;
    int diffMinutes = currentTotalMinutes - scheduleTotalMinutes;

    Serial.println("Checking schedule: " + String(hour) + ":" + String(minute) + 
                  " for " + String(duration) + " minutes");

    if (diffMinutes >= 0 && diffMinutes < duration) {
      unsigned long remainingMillis = (duration - diffMinutes) * 60000UL;
      
      // Check if rain is detected
      if (isRainDetected()) {
        Serial.println("Rain detected, cannot turn on relay");
        if (relayState) {
          setRelay(false);
          relayBySchedule = false;
        }
        return;
      }
      
      if (!relayState || (relayTurnOffTime - currentMillis) < remainingMillis) {
        setRelay(true);
        relayBySchedule = true; // Mark as scheduled relay
        relayTurnOffTime = currentMillis + remainingMillis;
        Serial.println("Relay ON for " + String(duration - diffMinutes) + " minutes (scheduled)");
      }
      foundActiveSchedule = true;
      break;
    }
  }

  if (!foundActiveSchedule && relayState && relayBySchedule) {
    setRelay(false);
    relayBySchedule = false;
    Serial.println("No active schedules for this device, relay OFF");
  }
}

void setRelay(bool state) {
  // Don't turn on relay if rain is detected
  if (state && isRainDetected()) {
    Serial.println("Cannot turn on relay - rain detected");
    return;
  }
  
  relayState = state;
  digitalWrite(relayPin, state ? HIGH : LOW);
  Serial.println("Relay " + String(state ? "ON" : "OFF"));
}

void resetDeviceRegistration() {
  preferences.clear();
  deviceApiKey = "";
  deviceId = 0;
  isRegistered = false;
  pendingStatusUpdate = false;
  relayBySchedule = false;
  setRelay(false);
  
  // Show reset message on LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("System Reset");
  lcd.setCursor(0, 1);
  lcd.print("Restarting...");
  
  Serial.println("Device registration reset. Restarting...");
  delay(2000);
  ESP.restart();
}