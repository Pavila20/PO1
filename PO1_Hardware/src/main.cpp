#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// =========================================================
// WIFI CONFIGURATION (TAMU_IoT MAC Authenticated)
// =========================================================
//const char* WIFI_SSID     = "TAMU_IoT";        
//const char* WIFI_PASSWORD = "";    // Leave empty! 
const char* WIFI_SSID     = "Reveille Ranch Resident";        
const char* WIFI_PASSWORD = "YN85V2DRFQ4KJ9ZT"; 
const int SERVER_PORT     = 80;   

WebServer server(SERVER_PORT);

// =========================================================
// MACHINE STATE & HARDWARE SIMULATION VARIABLES
// =========================================================
enum MachineState { IDLE, GRIND, HEAT, DISPENSE, USER_PROMPT, ERROR };
MachineState currentState = IDLE;

int waterLevel = 100;
int beanLevel = 100;
int boilerTemp = 200;
bool waterLevelWarning = false;

// --- NEW: Cup Sensor Variable ---
bool cupPresent = true; 

unsigned long actionStartTime = 0;

// =========================================================
// CORS HEADERS
// =========================================================
void sendCORSHeaders() {
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  server.sendHeader("Access-Control-Allow-Headers", "Content-Type");
}

void handleOptions() {
  sendCORSHeaders();
  server.send(204);
}

// =========================================================
// REST API ENDPOINTS
// =========================================================

void handleStatus() {
  StaticJsonDocument<250> doc;
  
  String stateStr = "IDLE";
  if (currentState == GRIND) stateStr = "GRIND";
  else if (currentState == USER_PROMPT) stateStr = "USER_PROMPT";
  else if (currentState == DISPENSE) stateStr = "DISPENSE";
  else if (currentState == ERROR) stateStr = "ERROR";

  doc["status"] = stateStr;
  doc["boilerTemp"] = boilerTemp;
  doc["beanLevel"] = beanLevel;
  doc["waterLevel"] = waterLevel;
  doc["waterLevelWarning"] = waterLevelWarning;
  
  // --- NEW: Report Cup Status to React Native ---
  doc["cupPresent"] = cupPresent; 

  String response;
  serializeJson(doc, response);
  
  sendCORSHeaders();
  server.send(200, "application/json", response);
}

void handleCommand() {
  sendCORSHeaders();
  
  if (server.hasArg("plain") == false) {
    server.send(400, "text/plain", "Body not received");
    return;
  }

  String body = server.arg("plain");
  StaticJsonDocument<200> doc;
  deserializeJson(doc, body);
  
  String command = doc["command"];

  // --- NORMAL APP COMMANDS ---
  if (command == "START_GRIND") {
    currentState = GRIND;
    actionStartTime = millis();
    Serial.println("App commanded: START GRIND");
    server.send(200, "application/json", "{\"success\":true}");
  } 
  else if (command == "START_DISPENSE") {
    currentState = DISPENSE;
    actionStartTime = millis();
    Serial.println("App commanded: START DISPENSE");
    server.send(200, "application/json", "{\"success\":true}");
  } 
  
  // --- TESTING / SIMULATION COMMANDS ---
  else if (command == "REFILL") {
    waterLevel = 100;
    beanLevel = 100;
    waterLevelWarning = false;
    cupPresent = true; // Reset cup status on refill
    currentState = IDLE;
    Serial.println("TEST: Refilled machine!");
    server.send(200, "application/json", "{\"success\":true}");
  }
  else if (command == "EMPTY_WATER") {
    waterLevel = 4;
    waterLevelWarning = true;
    Serial.println("TEST: Emptied water tank!");
    server.send(200, "application/json", "{\"success\":true}");
  }
  else if (command == "EMPTY_BEANS") {
    beanLevel = 2;
    Serial.println("TEST: Emptied bean hopper!");
    server.send(200, "application/json", "{\"success\":true}");
  }
  
  else if (command == "REMOVE_CUP") {
    cupPresent = false;
    Serial.println("TEST: Cup Removed!");
    server.send(200, "application/json", "{\"success\":true}");
  }
  else if (command == "PLACE_CUP") {
    cupPresent = true;
    Serial.println("TEST: Cup Placed!");
    server.send(200, "application/json", "{\"success\":true}");
  }

  else if (command == "TRIGGER_ERROR") {
    currentState = ERROR;
    Serial.println("TEST: Machine error state triggered!");
    server.send(200, "application/json", "{\"success\":true}");
  }
  else if (command == "CLEAR_ERROR") {
    currentState = IDLE;
    Serial.println("TEST: Cleared error state!");
    server.send(200, "application/json", "{\"success\":true}");
  }
  else {
    server.send(400, "application/json", "{\"success\":false, \"message\":\"Unknown command\"}");
  }
}

// =========================================================
// SETUP & MAIN LOOP
// =========================================================

void setup() {
  Serial.begin(115200);
  delay(3000); 
  
  Serial.println("\n=== MACHINE AWAKE & STARTING ===");
  WiFi.mode(WIFI_STA);

  Serial.println("\nConnecting to TAMU_IoT...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    attempts++;
    if (attempts > 30) {
      Serial.println("\nNetwork rejecting connection. (If you just registered, wait 15 mins for TAMU routers to update!)");
      attempts = 0; 
    }
  }

  Serial.println("\n Connected to WiFi!");
  Serial.print(" Machine IP Address: ");
  Serial.println(WiFi.localIP());

  server.on("/status", HTTP_GET, handleStatus);
  server.on("/command", HTTP_POST, handleCommand);
  server.on("/command", HTTP_OPTIONS, handleOptions);
  
  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();

  if (currentState == GRIND) {
    if (millis() - actionStartTime > 5000) { 
      currentState = USER_PROMPT; 
      beanLevel -= 5;             
      if (beanLevel < 0) beanLevel = 0;
      Serial.println("Finished Grinding. Waiting for user to move cup.");
    }
  }
  else if (currentState == DISPENSE) {
    if (millis() - actionStartTime > 7000) { 
      currentState = IDLE;       
      waterLevel -= 15;          
      if (waterLevel < 0) waterLevel = 0;
      if (waterLevel < 15) waterLevelWarning = true;
      Serial.println("Finished Dispensing. Coffee ready!");
    }
  }
}