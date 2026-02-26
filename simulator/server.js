// simulator/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

let machineState = {
  status: "idle",
  waterTemperature: 22,
  waterLevelWarning: false,
  grinderOn: false,
};

// --- API ENDPOINTS FOR THE APP ---

app.get("/status", (req, res) => {
  // Only print the log if the request IS NOT coming from the web dashboard
  if (req.query.source !== "web") {
    console.log("📱 SUCCESS: Mobile app connected and checked machine status!");
  }
  res.json(machineState);
});

app.post("/brew", (req, res) => {
  const { recipe, strength } = req.body;
  console.log(
    `☕ COMMAND RECEIVED: App requested a brew! Recipe: ${recipe}, Strength: ${strength}`,
  );

  machineState.status = "heating";

  setTimeout(() => {
    machineState.status = "brewing";
  }, 5000);
  setTimeout(() => {
    machineState.status = "done";
  }, 15000);
  setTimeout(() => {
    machineState.status = "idle";
  }, 20000);

  res.json({ success: true, message: "Brewing process started" });
});

// --- DASHBOARD ENDPOINTS ---

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "dashboard.html"));
});

app.post("/simulate", (req, res) => {
  machineState = { ...machineState, ...req.body };
  console.log(
    "🔧 DASHBOARD: Hardware state updated manually to:",
    machineState,
  );
  res.json(machineState);
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Simulator running on port ${PORT}`);
});
