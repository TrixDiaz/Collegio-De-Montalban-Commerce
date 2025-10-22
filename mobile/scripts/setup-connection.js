const os = require("os");

function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }

  return "localhost";
}

const ip = getLocalIP();
console.log("\n🔍 Finding your computer's IP address...");
console.log("Your computer IP address is:", ip);
console.log("\n📝 Update your mobile/config/api.ts file:");
console.log("Replace the BASE_URL with:");
console.log(`BASE_URL: 'http://${ip}:5000/api'`);
console.log("\n🚀 Quick steps:");
console.log("1. Copy the IP address above");
console.log("2. Open mobile/config/api.ts");
console.log("3. Replace the BASE_URL with the new IP");
console.log("4. Save the file");
console.log("5. Restart your mobile app");
console.log(
  '\n✅ After updating, test the connection using the "Test Connection" button in the app'
);
