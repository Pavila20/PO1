const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Mimics the SystemStatus struct and MAX limits from main.cpp
const MAX_WATER_ML = 1000.0;
const MAX_BEAN_G = 75.0;

let machineState = {
  status: "IDLE", // IDLE, GRIND, USER_PROMPT, PUMP, HEAT, DISPENSE, ERROR
  beanWeight: 60.0, // grams
  waterWeight: 800.0, // mL
  boilerTemp: 22.0, // °C
  flowRate: 0.0, // mL/sec
  errorMessage: "",

  // These are calculated for the App UI so we don't break the percentage circles!
  waterLevel: 80,
  beanLevel: 80,
  waterLevelWarning: false,
};

// Helper function to update percentages based on raw sensor weights
function updateSensors(water_mL, beans_g, temp_c) {
  if (water_mL !== undefined)
    machineState.waterWeight = Math.max(0, Math.min(water_mL, MAX_WATER_ML));
  if (beans_g !== undefined)
    machineState.beanWeight = Math.max(0, Math.min(beans_g, MAX_BEAN_G));
  if (temp_c !== undefined) machineState.boilerTemp = temp_c;

  machineState.waterLevel = Math.round(
    (machineState.waterWeight / MAX_WATER_ML) * 100,
  );
  machineState.beanLevel = Math.round(
    (machineState.beanWeight / MAX_BEAN_G) * 100,
  );
  machineState.waterLevelWarning = machineState.waterLevel <= 10;
}

// --- API ENDPOINTS FOR THE APP ---

app.get("/status", (req, res) => {
  if (req.query.source !== "web") {
    console.log(`📱 APP CHECK: Status is currently [${machineState.status}]`);
  }
  res.json(machineState);
});

app.post("/brew", (req, res) => {
  const { recipe, strength } = req.body;
  console.log(`☕ BREW COMMAND: Recipe: ${recipe}, Strength: ${strength}`);

  if (machineState.waterLevel <= 10) {
    machineState.status = "ERROR";
    machineState.errorMessage = "Not enough water to brew.";
    console.log("⚠️ Brew rejected: Not enough water.");
    return res
      .status(400)
      .json({ success: false, message: "Not enough water" });
  }

  // Mimic the C++ State Machine Sequence
  machineState.status = "GRIND";
  updateSensors(undefined, machineState.beanWeight - 15); // Consume 15g of beans

  setTimeout(() => {
    machineState.status = "USER_PROMPT";
    console.log("⏱️ Waiting for user to move filter...");
  }, 4000);

  setTimeout(() => {
    machineState.status = "PUMP";
    updateSensors(machineState.waterWeight - 250); // Consume 250mL of water
  }, 8000);

  setTimeout(() => {
    machineState.status = "HEAT";
    updateSensors(undefined, undefined, 95.0); // Heat to 95C
  }, 12000);

  setTimeout(() => {
    machineState.status = "DISPENSE";
  }, 16000);

  setTimeout(() => {
    machineState.status = "IDLE";
    updateSensors(undefined, undefined, 22.0); // Cool down
    console.log("✅ Brew complete! Back to IDLE.");
  }, 20000);

  res.json({ success: true, message: "Brewing process started" });
});

// --- DASHBOARD ENDPOINTS ---

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.post("/simulate", (req, res) => {
  const updates = req.body;

  // Map manual toggles to sensor updates
  if (updates.waterLevel !== undefined)
    updateSensors(updates.waterLevel * 10, undefined);
  if (updates.beanLevel !== undefined)
    updateSensors(undefined, (updates.beanLevel / 100) * MAX_BEAN_G);
  if (updates.waterTemperature !== undefined)
    updateSensors(undefined, undefined, updates.waterTemperature);
  if (updates.status !== undefined) machineState.status = updates.status;

  console.log("🔧 DASHBOARD OVERRIDE:", machineState.status);
  res.json(machineState);
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 ESP32 State Machine Simulator running on port ${PORT}`);
});
