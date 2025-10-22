const {spawn} = require("child_process");

console.log("🚀 Starting mobile app with Expo tunnel...");
console.log(
  "This will create a tunnel so your mobile device can access localhost:5000"
);
console.log("");

// Start Expo with tunnel
const expo = spawn("npx", ["expo", "start", "--tunnel"], {
  stdio: "inherit",
  shell: true,
});

expo.on("error", (error) => {
  console.error("Failed to start Expo:", error);
});

expo.on("close", (code) => {
  console.log(`Expo process exited with code ${code}`);
});

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Stopping Expo...");
  expo.kill("SIGINT");
  process.exit(0);
});
