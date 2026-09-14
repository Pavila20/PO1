#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <string.h>

// Tries HOME first, then SCHOOL (TAMU_IoT), automatically at boot — no more
// hand-editing which pair is commented out when you change locations.
// See connectToWifi(). Values come from PO1_Hardware/.env via platformio.ini's
// ${sysenv.*} substitution (use flash.ps1 to load them before building).
struct WifiCandidate {
  const char* ssid;
  const char* password;
  const char* label;
};

WifiCandidate WIFI_CANDIDATES[] = {
  { ENV_HOME_SSID, ENV_HOME_PASSWORD, "HOME" },
  { ENV_SCHOOL_SSID, ENV_SCHOOL_PASSWORD, "SCHOOL" },
};
const int WIFI_CANDIDATE_COUNT = sizeof(WIFI_CANDIDATES) / sizeof(WIFI_CANDIDATES[0]);
const int WIFI_ATTEMPTS_PER_NETWORK = 20; // ~10s per network at 500ms/attempt

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

void scanNetworks() {
  Serial.println("\nScanning for visible WiFi networks (ESP32 only sees 2.4GHz)...");
  int n = WiFi.scanNetworks();
  if (n == 0) {
    Serial.println("  No networks found at all.");
  } else {
    for (int i = 0; i < n; i++) {
      Serial.printf("  %d: \"%s\" (RSSI %d, %s)\n", i + 1, WiFi.SSID(i).c_str(), WiFi.RSSI(i),
                    WiFi.encryptionType(i) == WIFI_AUTH_OPEN ? "open" : "secured");
    }
  }
  Serial.println();
}

void connectToWifi() {
  WiFi.mode(WIFI_STA);
  scanNetworks();

  while (true) {
    for (int i = 0; i < WIFI_CANDIDATE_COUNT; i++) {
      WifiCandidate candidate = WIFI_CANDIDATES[i];
      if (strlen(candidate.ssid) == 0) continue; // credential not set in .env

      Serial.printf("\nTrying %s WiFi (%s)...\n", candidate.label, candidate.ssid);
      WiFi.begin(candidate.ssid, candidate.password);

      int attempts = 0;
      while (WiFi.status() != WL_CONNECTED && attempts < WIFI_ATTEMPTS_PER_NETWORK) {
        delay(500);
        Serial.print(".");
        attempts++;
      }

      if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\nConnected to %s WiFi!\n", candidate.label);
        return;
      }

      Serial.printf("\n%s WiFi not reachable (WiFi.status()=%d), trying next...\n", candidate.label, WiFi.status());
      WiFi.disconnect(); // NOTE: do not pass `true` here - it fully tears down
                          // the WiFi driver and crashes on the next WiFi.begin()
      delay(200);
    }
    Serial.println("\nNo known network found. Retrying... (If you just registered for TAMU_IoT, wait 15 min for routers to update!)");
  }
}

void setup() {
  Serial.begin(115200);
  delay(3000);

  Serial.println("\n=== MACHINE AWAKE & STARTING ===");
  connectToWifi();

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