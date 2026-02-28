const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const MAX_WATER_ML = 1000.0;
const MAX_BEAN_G = 75.0;

let machineState = {
  status: "IDLE", // IDLE, GRIND, USER_PROMPT, PUMP, HEAT, DISPENSE, ERROR
  beanWeight: 60.0,
  waterWeight: 800.0,
  boilerTemp: 22.0,
  flowRate: 0.0,
  errorMessage: "",
  grinderCupDetected: false,
  dispenserCupDetected: false,
  waterLevel: 80,
  beanLevel: 80,
  waterLevelWarning: false,
};

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

app.get("/status", (req, res) => {
  res.json(machineState);
});

// 👇 NEW: Step-by-Step Command Handler
app.post("/command", (req, res) => {
  const { command } = req.body;
  console.log(`🤖 APP COMMAND RECEIVED: ${command}`);

  if (command === "START_GRIND") {
    if (machineState.beanWeight < 15) {
      console.log("❌ Error: Not enough beans!");
      machineState.status = "ERROR";
      machineState.errorMessage = "Not enough beans";
      return res.json({
        success: false,
        status: machineState.status,
        error: "Not enough beans",
      });
    }

    machineState.status = "GRIND";
    updateSensors(undefined, machineState.beanWeight - 15);

    // Simulate grinding taking 4 seconds, then prompt user to move cup
    setTimeout(() => {
      machineState.status = "USER_PROMPT";
      console.log("⏱️ Grinding finished. Waiting for user to move cup...");
    }, 4000);
  } else if (command === "START_DISPENSE") {
    if (machineState.waterWeight < 250) {
      console.log("❌ Error: Not enough water!");
      machineState.status = "ERROR";
      machineState.errorMessage = "Not enough water";
      return res.json({
        success: false,
        status: machineState.status,
        error: "Not enough water",
      });
    }

    machineState.status = "PUMP";
    updateSensors(machineState.waterWeight - 250);

    // Simulate pumping, heating, dispensing sequence taking 8 seconds
    setTimeout(() => {
      machineState.status = "HEAT";
      updateSensors(undefined, undefined, 95.0);
    }, 2000);

    setTimeout(() => {
      machineState.status = "DISPENSE";
    }, 4000);

    setTimeout(() => {
      machineState.status = "IDLE";
      updateSensors(undefined, undefined, 22.0);
      console.log("✅ Brew complete! Back to IDLE.");
    }, 8000);
  }

  res.json({ success: true, status: machineState.status });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.post("/simulate", (req, res) => {
  const updates = req.body;
  if (updates.waterLevel !== undefined)
    updateSensors(updates.waterLevel * 10, undefined);
  if (updates.beanLevel !== undefined)
    updateSensors(undefined, (updates.beanLevel / 100) * MAX_BEAN_G);
  if (updates.waterTemperature !== undefined)
    updateSensors(undefined, undefined, updates.waterTemperature);
  if (updates.status !== undefined) machineState.status = updates.status;

  if (updates.grinderCupDetected !== undefined)
    machineState.grinderCupDetected = updates.grinderCupDetected;
  if (updates.dispenserCupDetected !== undefined)
    machineState.dispenserCupDetected = updates.dispenserCupDetected;

  console.log("🔧 DASHBOARD OVERRIDE:", updates);
  res.json(machineState);
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 ESP32 State Machine Simulator running on port ${PORT}`);
});
