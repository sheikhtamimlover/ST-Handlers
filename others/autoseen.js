const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "autoseen",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 2,
    description: "Auto seen all messages",
    category: "admin",
    guide: "{pn} on/off"
  },

  ST: async function({ message, args, event, threadsData, usersData }) {
    const dataPath = path.join(__dirname, "cache", "autoseen.json");
    await fs.ensureFile(dataPath);
    
    let data = {};
    try {
      data = await fs.readJson(dataPath);
    } catch {
      data = { enabled: false };
    }

    if (!args[0]) {
      return message.reply(`⚙️ Auto Seen Status: ${data.enabled ? "ON ✅" : "OFF ❌"}\n\nUsage: ${this.config.name} on/off`);
    }

    const action = args[0].toLowerCase();

    if (action === "on") {
      data.enabled = true;
      await fs.writeJson(dataPath, data);
      return message.reply("✅ Auto seen turned ON successfully.");
    } 
    else if (action === "off") {
      data.enabled = false;
      await fs.writeJson(dataPath, data);
      return message.reply("❌ Auto seen turned OFF successfully.");
    } 
    else {
      return message.reply(`Wrong format!\nUse: ${this.config.name} on/off`);
    }
  },

  onChat: async function({ api }) {
    const dataPath = path.join(__dirname, "cache", "autoseen.json");
    
    try {
      let data = {};
      if (await fs.pathExists(dataPath)) {
        data = await fs.readJson(dataPath);
      }

      if (data.enabled === true) {
        api.markAsReadAll(() => {});
      }
    } catch (error) {
      console.error(error);
    }
  }
};