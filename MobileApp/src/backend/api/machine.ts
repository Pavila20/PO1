import { getMachineStatusBle, sendMachineCommandBle } from "./machineBle";

const MACHINE_URL = process.env.EXPO_PUBLIC_MACHINE_IP;

// Which transport getMachineStatus/sendMachineCommand actually use.
// Screens never need to know or care which one is active - they just keep
// calling the same two functions. Defaults to wifi so nothing changes
// unless something explicitly opts into ble (see setConnectionType).
export type ConnectionType = "wifi" | "ble";
let connectionType: ConnectionType = "wifi";

export function setConnectionType(type: ConnectionType) {
  connectionType = type;
}

export function getConnectionType() {
  return connectionType;
}

// Helper function to fetch with a timeout
async function fetchWithTimeout(resource: string, options: any = {}) {
  const { timeout = 5000 } = options; // 5 second timeout

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(resource, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
}

async function getMachineStatusWifi() {
  try {
    if (!MACHINE_URL) return null;

    const response = await fetchWithTimeout(`${MACHINE_URL}/status`, {
      timeout: 5000,
      headers: {
        "Bypass-Tunnel-Reminder": "true",
        "User-Agent": "CustomApp/1.0",
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.log(` Failed to connect to machine at ${MACHINE_URL}`);
    return null;
  }
}

export async function getMachineStatus() {
  if (connectionType === "ble") return getMachineStatusBle();
  return getMachineStatusWifi();
}

export async function sendBrewCommand(recipe: string, strength: string) {
  try {
    if (!MACHINE_URL) return { success: false };
    const response = await fetch(`${MACHINE_URL}/brew`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Bypass-Tunnel-Reminder": "true",
        "User-Agent": "CustomApp/1.0",
      },
      body: JSON.stringify({ recipe, strength }),
    });
    if (!response.ok) return { success: false };
    return await response.json();
  } catch (error) {
    console.error(" Failed to send brew command:", error);
    return { success: false };
  }
}

// Send specific step-by-step commands to the hardware
async function sendMachineCommandWifi(command: string) {
  try {
    if (!MACHINE_URL) return { success: false };
    const response = await fetch(`${MACHINE_URL}/command`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Bypass-Tunnel-Reminder": "true",
        "User-Agent": "CustomApp/1.0",
      },
      body: JSON.stringify({ command }),
    });
    if (!response.ok) return { success: false };
    return await response.json();
  } catch (error) {
    console.error(` Failed to send command ${command}:`, error);
    return { success: false };
  }
}

export async function sendMachineCommand(command: string) {
  if (connectionType === "ble") return sendMachineCommandBle(command);
  return sendMachineCommandWifi(command);
}
