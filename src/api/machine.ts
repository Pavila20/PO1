// src/api/machine.ts

const MACHINE_URL = process.env.EXPO_PUBLIC_MACHINE_IP;

export async function getMachineStatus() {
  try {
    if (!MACHINE_URL) return null;
    const response = await fetch(`${MACHINE_URL}/status`);
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe, strength }),
    });
    if (!response.ok) return { success: false };
    return await response.json();
  } catch (error) {
    console.error("❌ Failed to send brew command:", error);
    return { success: false };
  }
}
