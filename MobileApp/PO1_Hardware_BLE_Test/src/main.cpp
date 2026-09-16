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

BLEServer *pServer = nullptr;
BLECharacteristic *pStatusChar = nullptr;
BLECharacteristic *pCommandChar = nullptr;

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

// IMPORTANT: BLE server/characteristic callbacks (onConnect/onDisconnect/
// onWrite) run on the Bluetooth controller's own task (BTC_TASK), which has
// a small fixed stack. Calling more BLE-stack operations (notify(),
// startAdvertising()) directly from inside these callbacks stacks more
// frames on top of an already-deep call chain and can overflow it - this is
// exactly what crashed the board ("stack overflow in task BTC_TASK")
// after a period of normal use. Fix: callbacks only set a flag; the actual
// BLE-stack work happens in loop(), which runs on the main task with a much
// larger stack.
volatile bool statusUpdatePending = false;
volatile bool advertisingRestartPending = false;

void sendStatusUpdate(); // forward declaration so CommandCallbacks can call it

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *server) override {
    Serial.printf("[BLE] Client connected (%d total)\n", server->getConnectedCount());
    advertisingRestartPending = true;
  }
  void onDisconnect(BLEServer *server) override {
    Serial.printf("[BLE] Client disconnected (%d remaining), resuming advertising\n", server->getConnectedCount());
    advertisingRestartPending = true;
  }
};

class CommandCallbacks : public BLECharacteristicCallbacks {
  void onWrite(BLECharacteristic *characteristic) override {
    String value = characteristic->getValue().c_str();
    Serial.print("[BLE] Command received: ");
    Serial.println(value);

    // NOTE: never call sendStatusUpdate()/notify() directly in here - see
    // the comment above statusUpdatePending. Every branch below just sets
    // state and requests an update; loop() does the actual notify.

    if (value == "START_GRIND") {
      machineStatus = "GRIND";
      beanLevel = max(0, beanLevel - 5);
      actionStartTime = millis();
    } else if (value == "START_DISPENSE") {
      machineStatus = "DISPENSE";
      waterLevel = max(0, waterLevel - 15);
      if (waterLevel < 15) waterLevelWarning = true;
      actionStartTime = millis();
    } else if (value == "RESET") {
      machineStatus = "IDLE";
    }
    // --- TESTING / SIMULATION COMMANDS (mirrors PO1_Hardware/main.cpp) ---
    else if (value == "REFILL") {
      waterLevel = 100;
      beanLevel = 100;
      waterLevelWarning = false;
      cupPresent = true;
      machineStatus = "IDLE";
      Serial.println("[BLE TEST] Refilled machine!");
    } else if (value == "EMPTY_WATER") {
      waterLevel = 4;
      waterLevelWarning = true;
      Serial.println("[BLE TEST] Emptied water tank!");
    } else if (value == "EMPTY_BEANS") {
      beanLevel = 2;
      Serial.println("[BLE TEST] Emptied bean hopper!");
    } else if (value == "REMOVE_CUP") {
      cupPresent = false;
      Serial.println("[BLE TEST] Cup removed!");
    } else if (value == "PLACE_CUP") {
      cupPresent = true;
      Serial.println("[BLE TEST] Cup placed!");
    } else if (value == "TRIGGER_ERROR") {
      machineStatus = "ERROR";
      Serial.println("[BLE TEST] Error state triggered!");
    } else if (value == "CLEAR_ERROR") {
      machineStatus = "IDLE";
      Serial.println("[BLE TEST] Error cleared!");
    }
    // SET_WATER:<0-100> / SET_BEANS:<0-100> - set an exact level instead of
    // just empty/full, e.g. to test the low-supply warning threshold.
    else if (value.startsWith("SET_WATER:")) {
      int level = constrain(value.substring(10).toInt(), 0, 100);
      waterLevel = level;
      waterLevelWarning = level < 15;
      Serial.printf("[BLE TEST] Water level set to %d\n", level);
    } else if (value.startsWith("SET_BEANS:")) {
      int level = constrain(value.substring(10).toInt(), 0, 100);
      beanLevel = level;
      Serial.printf("[BLE TEST] Bean level set to %d\n", level);
    } else {
      return; // unrecognized command, nothing changed, don't notify
    }

    statusUpdatePending = true;
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
  pServer = BLEDevice::createServer();
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
  // Handle anything BLE callbacks deferred rather than doing directly -
  // this runs on the main task (large stack), unlike the callbacks
  // themselves (small BTC_TASK stack). See the comment above
  // statusUpdatePending for why this matters.
  if (advertisingRestartPending) {
    BLEDevice::startAdvertising();
    advertisingRestartPending = false;
  }
  if (statusUpdatePending) {
    sendStatusUpdate();
    statusUpdatePending = false;
    lastNotify = millis();
  }

  // Auto-advance the state machine, same idea as simulator/server.js's
  // setTimeout chains - this was missing entirely before, which is why
  // the app got stuck showing "Grinding..." forever.
  if (machineStatus == "GRIND" && millis() - actionStartTime > GRIND_DURATION_MS) {
    machineStatus = "USER_PROMPT";
    Serial.println("[BLE] Grinding finished, waiting for user to move cup");
    sendStatusUpdate();
    lastNotify = millis();
  } else if (machineStatus == "DISPENSE" && millis() - actionStartTime > DISPENSE_DURATION_MS) {
    machineStatus = "IDLE";
    Serial.println("[BLE] Dispensing finished, back to IDLE");
    sendStatusUpdate();
    lastNotify = millis();
  }

  if (pServer->getConnectedCount() > 0 && millis() - lastNotify > 2000) {
    sendStatusUpdate();
    lastNotify = millis();
  }
}
