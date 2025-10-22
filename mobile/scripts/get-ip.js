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
console.log("Your computer IP address is:", ip);
console.log("Update mobile/config/api.ts with:");
console.log(`BASE_URL: 'http://${ip}:5000/api'`);
