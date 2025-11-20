const axios = require("axios");

module.exports = {
  config: {
    name: "nettest",
    version: "1.0",
    author: "ChatGPT",
    role: 0
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get("https://google.com", { timeout: 10000 });
      return api.sendMessage("✅ Internet OK — Server can connect.", event.threadID);
    } catch (err) {
      return api.sendMessage("❌ Server has NO internet access at all.", event.threadID);
    }
  }
};