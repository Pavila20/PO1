// src/api/machine.ts

const MACHINE_URL = process.env.EXPO_PUBLIC_MACHINE_IP;

export async function getMachineStatus() {
  try {
    if (!MACHINE_URL) return null;

    // 👇 NEW: Added headers to bypass the Localtunnel warning page
    const response = await fetch(`${MACHINE_URL}/status`, {
      headers: {
        "Bypass-Tunnel-Reminder": "true",
        "User-Agent": "CustomApp/1.0",
      },
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.log(`⚠️ Failed to connect to machine at ${MACHINE_URL}`);
    return null;
  }
}

export async function sendBrewCommand(recipe: string, strength: string) {
  try {
    if (!MACHINE_URL) return { success: false };
    const response = await fetch(`${MACHINE_URL}/brew`, {
      method: "POST",
      // 👇 NEW: Also added the bypass headers here just in case!
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
    console.error("❌ Failed to send brew command:", error);
    return { success: false };
  }
}
