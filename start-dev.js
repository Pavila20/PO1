// start-dev.js
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("⏳ Starting Developer Environment...");

// 1. Start the local Node.js simulator
const simulator = spawn("node", ["simulator/server.js"], {
  stdio: "inherit",
  shell: true,
});

// 2. Start Localtunnel to expose port 5000 to the internet
const tunnel = spawn("npx", ["localtunnel", "--port", "5000"], { shell: true });

tunnel.stdout.on("data", (data) => {
  const output = data.toString();

  // When Localtunnel outputs the new URL, grab it
  if (output.includes("your url is:")) {
    const tunnelUrl = output.split("your url is:")[1].trim();

    console.log(`\n=========================================`);
    console.log(`✅ TUNNEL CONNECTED!`);
    console.log(`🔗 Public Machine URL: ${tunnelUrl}`);
    console.log(`=========================================\n`);

    // 3. Automatically update the .env file with the new URL
    const envPath = path.join(__dirname, ".env");
    let envFile = fs.readFileSync(envPath, "utf8");

    // Replace the old MACHINE_IP with the new one
    envFile = envFile.replace(
      /EXPO_PUBLIC_MACHINE_IP=.*/g,
      `EXPO_PUBLIC_MACHINE_IP=${tunnelUrl}`,
    );
    fs.writeFileSync(envPath, envFile);
    console.log(`📝 SUCCESS: Auto-updated .env with new Machine IP!`);

    // 4. Start Expo now that the .env is ready
    console.log(`🚀 Starting Expo App with Tunnel...\n`);

    // 👇 UPDATED: Added '--tunnel' to the arguments array
    spawn("npx", ["expo", "start", "--tunnel"], {
      stdio: "inherit",
      shell: true,
    });
  }
});

tunnel.stderr.on("data", (data) => {
  console.error(`Tunnel Error: ${data}`);
});
