// src/backend/api/machineBle.ts
//
// BLE transport for the machine API. Matches the shape of machine.ts's
// WiFi functions (status object in, {success} object out) so screens don't
// need to know which transport is active - see setConnectionType in
// machine.ts.
//
// Validated against PO1_Hardware_BLE_Test/src/main.cpp. The teammates'
// real machine firmware (esp32-s3_po1_environment/) hasn't settled on a
// communication protocol yet, so this UUID/shape may need to change once
// it does.

import { Buffer } from "buffer";
import { BleManager, type Device } from "react-native-ble-plx";

const SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const STATUS_CHAR_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const COMMAND_CHAR_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";
const DEVICE_NAME = "PourOver1-BLE-Test";
const SCAN_TIMEOUT_MS = 8000;

let manager: BleManager | null = null;
let connectedDevice: Device | null = null;
let latestStatus: any = null;

function getManager() {
  if (!manager) manager = new BleManager();
  return manager;
}

export function isBleConnected() {
  return connectedDevice !== null;
}

// A freshly created BleManager reports "Unknown" for a moment while iOS
// initializes CoreBluetooth; scanning in that window fails with error 103.
// Wait for PoweredOn (or give up if Bluetooth is off/unauthorized).
function waitForPoweredOn(bleManager: BleManager): Promise<boolean> {
  return new Promise((resolve) => {
    const giveUp = setTimeout(() => {
      sub.remove();
      resolve(false);
    }, 5000);
    const sub = bleManager.onStateChange((state) => {
      if (state === "PoweredOn") {
        clearTimeout(giveUp);
        sub.remove();
        resolve(true);
      } else if (state === "Unauthorized") {
        console.warn("[BLE] Bluetooth state:", state);
        clearTimeout(giveUp);
        sub.remove();
        resolve(false);
      } else {
        // Unknown / Resetting / PoweredOff can all be transient at startup;
        // keep waiting until the timeout above.
        console.log("[BLE] Bluetooth state:", state);
      }
    }, true);
  });
}

// Only one scan/connect attempt may run at a time. Screens poll status every
// couple of seconds; without this each poll started its own scan and they
// cancelled each other, so a dropped machine never got reconnected.
let connectInFlight: Promise<boolean> | null = null;
let userDisconnected = false;

export function connectToMachineBle(): Promise<boolean> {
  if (connectedDevice) return Promise.resolve(true);
  if (!connectInFlight) {
    userDisconnected = false;
    connectInFlight = doConnect().finally(() => {
      connectInFlight = null;
    });
  }
  return connectInFlight;
}

async function doConnect(): Promise<boolean> {
  const bleManager = getManager();

  if (!(await waitForPoweredOn(bleManager))) return false;

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn("[BLE] scan timed out, no device found");
      bleManager.stopDeviceScan();
      resolve(false);
    }, SCAN_TIMEOUT_MS);

    bleManager.startDeviceScan(
      [SERVICE_UUID],
      null,
      async (error, device) => {
        if (error) {
          console.warn("[BLE] scan error:", error.message, error.errorCode);
          clearTimeout(timeout);
          bleManager.stopDeviceScan();
          resolve(false);
          return;
        }

        if (
          device &&
          (device.name === DEVICE_NAME || device.localName === DEVICE_NAME)
        ) {
          console.log("[BLE] found", device.id, device.name, device.localName);
          clearTimeout(timeout);
          bleManager.stopDeviceScan();

          try {
            const connected = await device.connect();
            await connected.discoverAllServicesAndCharacteristics();
            connectedDevice = connected;

            // Read the current value immediately rather than waiting for
            // the next periodic notify (up to 2s away) - otherwise the
            // very first getMachineStatusBle() call right after connecting
            // can return null even though the connection succeeded, which
            // would wrongly show "machine not found" on the setup screen.
            try {
              const initial = await connected.readCharacteristicForService(
                SERVICE_UUID,
                STATUS_CHAR_UUID,
              );
              if (initial.value) {
                const json = Buffer.from(initial.value, "base64").toString(
                  "utf8",
                );
                latestStatus = JSON.parse(json);
              }
            } catch {
              // fall through - the notify subscription below will still
              // populate latestStatus shortly
            }

            connected.monitorCharacteristicForService(
              SERVICE_UUID,
              STATUS_CHAR_UUID,
              (charError, characteristic) => {
                if (charError || !characteristic?.value) return;
                try {
                  const json = Buffer.from(
                    characteristic.value,
                    "base64",
                  ).toString("utf8");
                  latestStatus = JSON.parse(json);
                } catch {
                  // ignore malformed status packets
                }
              },
            );

            connected.onDisconnected(() => {
              connectedDevice = null;
              latestStatus = null;
              // Machine was unplugged / went out of range: start looking for
              // it again right away so it re-pairs as soon as it's back.
              if (!userDisconnected) {
                setTimeout(() => {
                  connectToMachineBle();
                }, 500);
              }
            });

            resolve(true);
          } catch (e: any) {
            console.warn("[BLE] connect failed:", e?.message, e?.errorCode);
            resolve(false);
          }
        }
      },
    );
  });
}

export async function getMachineStatusBle() {
  if (!connectedDevice) {
    const connected = await connectToMachineBle();
    if (!connected) return null;
  }
  return latestStatus;
}

export async function sendMachineCommandBle(command: string) {
  if (!connectedDevice) {
    const connected = await connectToMachineBle();
    if (!connected) return { success: false };
  }

  try {
    const base64Value = Buffer.from(command, "utf8").toString("base64");
    await connectedDevice!.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      COMMAND_CHAR_UUID,
      base64Value,
    );
    return { success: true };
  } catch {
    return { success: false };
  }
}

export function disconnectMachineBle() {
  userDisconnected = true;
  connectedDevice?.cancelConnection().catch(() => {});
  connectedDevice = null;
  latestStatus = null;
}
