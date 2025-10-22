#!/usr/bin/env node

const {execSync} = require("child_process");
const path = require("path");

console.log("🔄 Restarting mobile app with fresh configuration...\n");

try {
  // Clear Expo cache
  console.log("1. Clearing Expo cache...");
  execSync("npx expo r -c", {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });

  console.log("\n✅ Cache cleared successfully!");
  console.log("\n📱 Now restart your mobile app:");
  console.log("   npx expo start --tunnel");
  console.log("\n🔧 Or if you want to use your IP address:");
  console.log("   npx expo start");
} catch (error) {
  console.error("❌ Error clearing cache:", error.message);
  console.log("\n📱 Try manually restarting:");
  console.log("   1. Stop the current Expo server (Ctrl+C)");
  console.log("   2. Run: npx expo r -c");
  console.log("   3. Run: npx expo start --tunnel");
}
