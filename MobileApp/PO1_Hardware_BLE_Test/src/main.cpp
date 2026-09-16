// Standalone BLE proof-of-concept for PO1.
// Advertises as "PourOver1-BLE-Test" with one NOTIFY characteristic (status)
// and one WRITE characteristic (command), using the Nordic UART Service UUIDs
// so generic BLE scanner apps (nRF Connect, LightBlue) can also poke at it.
//
// This does not touch WiFi, the REST API, or PO1_Hardware/main.cpp at all —
// it is purely to prove BLE works end-to-end before deciding whether to
// integrate it into the real app.

#include <Arduino.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ArduinoJson.h>

#define SERVICE_UUID      "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define STATUS_CHAR_UUID  "6e400003-b5a3-f393-e0a9-e50e24dcca9e" // NOTIFY: device -> app
#define COMMAND_CHAR_UUID "6e400002-b5a3-f393-e0a9-e50e24dcca9e" // WRITE:  app -> device

BLECharacteristic *pStatusChar = nullptr;
BLECharacteristic *pCommandChar = nullptr;
bool deviceConnected = false;

// Mirrors the shape of simulator/server.js's machineState so it feels familiar.
String machineStatus = "IDLE";
int waterLevel = 80;
int beanLevel = 80;
float boilerTemp = 22.0;
bool cupPresent = true;
bool waterLevelWarning = false;

unsigned long actionStartTime = 0;
const unsigned long GRIND_DURATION_MS = 4000;    // GRIND -> USER_PROMPT
const unsigned long DISPENSE_DURATION_MS = 6000; // DISPENSE -> IDLE

void sendStatusUpdate(); // forward declaration so CommandCallbacks can call it

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *server) override {
    deviceConnected = true;
    Serial.println("[BLE] Client connected");
  }
  void onDisconnect(BLEServer *server) override {
    deviceConnected = false;
    Serial.println("[BLE] Client disconnected, resuming advertising");
    BLEDevice::startAdvertising();
  }
};

class CommandCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *characteristic) override {
    String value = characteristic->getValue().c_str();
    Serial.print("[BLE] Command received: ");
    Serial.println(value);

    if (value == "START_GRIND") {
      machineStatus = "GRIND";
      beanLevel = max(0, beanLevel - 5);
      actionStartTime = millis();
      sendStatusUpdate(); // don't wait for the next periodic notify
    } else if (value == "START_DISPENSE") {
      machineStatus = "DISPENSE";
      waterLevel = max(0, waterLevel - 15);
      if (waterLevel < 15) waterLevelWarning = true;
      actionStartTime = millis();
      sendStatusUpdate();
    } else if (value == "RESET") {
      machineStatus = "IDLE";
      sendStatusUpdate();
    }
    // --- TESTING / SIMULATION COMMANDS (mirrors PO1_Hardware/main.cpp) ---
    else if (value == "REFILL") {
      waterLevel = 100;
      beanLevel = 100;
      waterLevelWarning = false;
      cupPresent = true;
      machineStatus = "IDLE";
      Serial.println("[BLE TEST] Refilled machine!");
      sendStatusUpdate();
    } else if (value == "EMPTY_WATER") {
      waterLevel = 4;
      waterLevelWarning = true;
      Serial.println("[BLE TEST] Emptied water tank!");
      sendStatusUpdate();
    } else if (value == "EMPTY_BEANS") {
      beanLevel = 2;
      Serial.println("[BLE TEST] Emptied bean hopper!");
      sendStatusUpdate();
    } else if (value == "REMOVE_CUP") {
      cupPresent = false;
      Serial.println("[BLE TEST] Cup removed!");
      sendStatusUpdate();
    } else if (value == "PLACE_CUP") {
      cupPresent = true;
      Serial.println("[BLE TEST] Cup placed!");
      sendStatusUpdate();
    } else if (value == "TRIGGER_ERROR") {
      machineStatus = "ERROR";
      Serial.println("[BLE TEST] Error state triggered!");
      sendStatusUpdate();
    } else if (value == "CLEAR_ERROR") {
      machineStatus = "IDLE";
      Serial.println("[BLE TEST] Error cleared!");
      sendStatusUpdate();
    }
  }
};

void sendStatusUpdate() {
  StaticJsonDocument<256> doc;
  doc["status"] = machineStatus;
  doc["waterLevel"] = waterLevel;
  doc["beanLevel"] = beanLevel;
  doc["boilerTemp"] = boilerTemp;
  doc["cupPresent"] = cupPresent;
  doc["waterLevelWarning"] = waterLevelWarning;

  String json;
  serializeJson(doc, json);

  pStatusChar->setValue(json.c_str());
  pStatusChar->notify();
  Serial.print("[BLE] Notified: ");
  Serial.println(json);
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("\n=== PO1 BLE Test Starting ===");

  BLEDevice::init("PourOver1-BLE-Test");
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new ServerCallbacks());

  BLEService *pService = pServer->createService(SERVICE_UUID);

  pStatusChar = pService->createCharacteristic(
      STATUS_CHAR_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pStatusChar->addDescriptor(new BLE2902());

  pCommandChar = pService->createCharacteristic(
      COMMAND_CHAR_UUID, BLECharacteristic::PROPERTY_WRITE);
  pCommandChar->setCallbacks(new CommandCallbacks());

  pService->start();

  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.println("[BLE] Advertising as 'PourOver1-BLE-Test'");
}

unsigned long lastNotify = 0;

void loop() {
  // Auto-advance the state machine, same idea as simulator/server.js's
  // setTimeout chains - this was missing entirely before, which is why
  // the app got stuck showing "Grinding..." forever.
  if (machineStatus == "GRIND" && millis() - actionStartTime > GRIND_DURATION_MS) {
    machineStatus = "USER_PROMPT";
    Serial.println("[BLE] Grinding finished, waiting for user to move cup");
    sendStatusUpdate();
  } else if (machineStatus == "DISPENSE" && millis() - actionStartTime > DISPENSE_DURATION_MS) {
    machineStatus = "IDLE";
    Serial.println("[BLE] Dispensing finished, back to IDLE");
    sendStatusUpdate();
  }

  if (deviceConnected && millis() - lastNotify > 2000) {
    sendStatusUpdate();
    lastNotify = millis();
  }
}
