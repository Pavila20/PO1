#include <Arduino.h>  // <-- THIS IS REQUIRED IN PLATFORMIO
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// ⚠️ UPDATE THESE WITH YOUR ACTUAL WI-FI CREDENTIALS
const char* ssid = "Reveille Ranch Resident";
const char* password = "YN85V2DRFQ4KJ9ZT";

WebServer server(80);

// --- 1. THE STATE MACHINE ---
enum SystemState { IDLE, GRIND, USER_PROMPT, PUMP, HEAT, DISPENSE, ERROR_STATE };
SystemState currentState = IDLE;

// --- 2. HARDWARE VARIABLES (Simulated for now) ---
int beanWeight = 20;
int waterWeight = 300;
int waterLevel = 100;
int beanLevel = 100;
int boilerTemp = 90;
bool grinderCupDetected = true;
bool dispenserCupDetected = true;
bool waterLevelWarning = false;

unsigned long actionStartTime = 0;

// --- FUNCTION PROTOTYPES (Required for C++ / PlatformIO) ---
void handleOptions();
void handleStatus();
void handleCommand();

// Handle CORS preflight requests
void handleOptions() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type, Bypass-Tunnel-Reminder, User-Agent");
  server.send(204);
}

// --- 3. ENDPOINT: GET /status ---
void handleStatus() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  
  StaticJsonDocument<512> doc;

  String statusStr = "IDLE";
  if(currentState == GRIND) statusStr = "GRIND";
  else if(currentState == USER_PROMPT) statusStr = "USER_PROMPT";
  else if(currentState == DISPENSE) statusStr = "DISPENSE";
  else if(currentState == ERROR_STATE) statusStr = "ERROR";

  doc["status"] = statusStr;
  doc["waterLevel"] = waterLevel;
  doc["beanLevel"] = beanLevel;
  doc["boilerTemp"] = boilerTemp;
  doc["waterLevelWarning"] = waterLevelWarning;
  doc["beanWeight"] = beanWeight;
  doc["waterWeight"] = waterWeight;
  doc["grinderCupDetected"] = grinderCupDetected;
  doc["dispenserCupDetected"] = dispenserCupDetected;

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

// --- 4. ENDPOINT: POST /command ---
void handleCommand() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  
  if (server.hasArg("plain") == false) {
    server.send(400, "application/json", "{\"success\": false}");
    return;
  }

  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, server.arg("plain"));

  if (error) {
    server.send(400, "application/json", "{\"success\": false}");
    return;
  }

  String command = doc["command"];
  Serial.println("App sent command: " + command);

 if (command == "REFILL") {
    waterLevel = 100;
    beanLevel = 100;
    waterLevelWarning = false;
    Serial.println("App commanded a machine refill! Levels reset to 100%.");
    server.send(200, "application/json", "{\"success\":true}");
    return;
  }
  if (command == "START_GRIND" && currentState == IDLE) {
    currentState = GRIND;
    actionStartTime = millis();
    Serial.println("Turning on Grinder Motor...");
  } 
  else if (command == "START_DISPENSE" && currentState == USER_PROMPT) {
    currentState = DISPENSE;
    actionStartTime = millis();
    Serial.println("Opening Water Valve...");
  }

  server.send(200, "application/json", "{\"success\": true}");
}

void setup() {
  Serial.begin(115200);
  
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n--- PO1 MACHINE ONLINE ---");
  Serial.print("IP Address for your .env file: ");
  Serial.println(WiFi.localIP()); 

  server.on("/status", HTTP_GET, handleStatus);
  server.on("/command", HTTP_POST, handleCommand);
  server.onNotFound(handleOptions); 

  server.begin();
}

void loop() {
  server.handleClient();

  // Hardware state logic (Simulated)
  if (currentState == GRIND) {
    if (millis() - actionStartTime > 5000) { 
      currentState = USER_PROMPT;
      Serial.println("Grinding finished. Waiting for user to move cup.");
      
      // --- SIMULATE BEAN DROP ---
      beanLevel = beanLevel - 5; 
      if (beanLevel < 0) beanLevel = 0; // Don't let it go below 0%
      Serial.println("Bean level dropped to: " + String(beanLevel) + "%");
    }
  } 
  else if (currentState == DISPENSE) {
    if (millis() - actionStartTime > 7000) { 
      currentState = IDLE;
      Serial.println("Dispensing complete. Machine ready.");

      // --- SIMULATE WATER DROP ---
      waterLevel = waterLevel - 15;
      if (waterLevel < 0) waterLevel = 0; // Don't let it go below 0%
      Serial.println("Water level dropped to: " + String(waterLevel) + "%");
    }
  }
}