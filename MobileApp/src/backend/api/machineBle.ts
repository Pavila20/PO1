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

export async function connectToMachineBle(): Promise<boolean> {
  if (connectedDevice) return true;

  const bleManager = getManager();

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      bleManager.stopDeviceScan();
      resolve(false);
    }, SCAN_TIMEOUT_MS);

    bleManager.startDeviceScan(
      [SERVICE_UUID],
      null,
      async (error, device) => {
        if (error) {
          clearTimeout(timeout);
          bleManager.stopDeviceScan();
          resolve(false);
          return;
        }

        if (device && device.name === DEVICE_NAME) {
          clearTimeout(timeout);
          bleManager.stopDeviceScan();

          try {
            const connected = await device.connect();
            await connected.discoverAllServicesAndCharacteristics();
            connectedDevice = connected;

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
            });

            resolve(true);
          } catch {
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
  connectedDevice?.cancelConnection().catch(() => {});
  connectedDevice = null;
  latestStatus = null;
}
