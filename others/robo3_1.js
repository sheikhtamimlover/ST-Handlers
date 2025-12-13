const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "robo3",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "Monitor all command usage across the bot",
    category: "system",
    guide: "{pn} on/off - Enable/disable monitoring\n{pn} info - Show monitoring status\n{pn} stats - Show usage statistics"
  },

  onLoad: function () {
    const configFile = path.join(__dirname, "..", "..", "robo3_command_config.json");
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify({
        enabled: true,
        logThread: "886960563901648",
        commandStats: {}
      }, null, 2));
    }

    if (!global.robo3CommandTracker) {
      global.robo3CommandTracker = {};
    }
  },

  ST: async function ({ message, args, event }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return message.reply("⛔ Only the owner can use this command!");
    }

    const configFile = path.join(__dirname, "..", "..", "robo3_command_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return {
          enabled: true,
          logThread: "886960563901648",
          commandStats: {}
        };
      } catch {
        return {
          enabled: true,
          logThread: "886960563901648",
          commandStats: {}
        };
      }
    }

    function saveConfig(data) {
      try {
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving robo3 config:", error);
      }
    }

    if (args[0] === "on" || args[0] === "enable") {
      const config = loadConfig();
      config.enabled = true;
      saveConfig(config);

      return message.reply("✅ Command Usage Monitor ENABLED!");
    }

    if (args[0] === "off" || args[0] === "disable") {
      const config = loadConfig();
      config.enabled = false;
      saveConfig(config);

      return message.reply("❌ Command Usage Monitor DISABLED!");
    }

    if (args[0] === "stats" || args[0] === "statistics") {
      const config = loadConfig();
      const stats = config.commandStats || {};
      
      if (Object.keys(stats).length === 0) {
        return message.reply("📊 No command usage statistics available yet!");
      }

      const sortedStats = Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      let statsMsg = `📊 TOP 10 COMMAND USAGE STATISTICS\n\n`;
      
      for (let i = 0; i < sortedStats.length; i++) {
        statsMsg += `${i + 1}. ${sortedStats[i][0]}: ${sortedStats[i][1]} times\n`;
      }

      statsMsg += `\n📈 Total Commands Tracked: ${Object.keys(stats).length}`;

      return message.reply(statsMsg);
    }

    if (args[0] === "clear" || args[0] === "reset") {
      const config = loadConfig();
      config.commandStats = {};
      saveConfig(config);
      global.robo3CommandTracker = {};

      return message.reply("✅ Command usage statistics cleared!");
    }

    if (args[0] === "info" || args[0] === "status") {
      const config = loadConfig();
      const totalCommands = Object.keys(config.commandStats || {}).length;
      const totalUsage = Object.values(config.commandStats || {}).reduce((a, b) => a + b, 0);

      return message.reply(
        `📊 COMMAND USAGE MONITOR STATUS\n\n` +
        `🔘 Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
        `📌 Log Thread: ${config.logThread}\n` +
        `📝 Commands Tracked: ${totalCommands}\n` +
        `📈 Total Usage: ${totalUsage}\n\n` +
        `💡 Commands:\n` +
        `• robo3 on/off\n` +
        `• robo3 stats - View statistics\n` +
        `• robo3 clear - Clear stats\n` +
        `• robo3 info`
      );
    }

    return message.reply(
      `📋 COMMAND USAGE MONITOR\n\n` +
      `💡 Commands:\n` +
      `• robo3 on/off\n` +
      `• robo3 stats - View statistics\n` +
      `• robo3 clear - Clear stats\n` +
      `• robo3 info\n\n` +
      `📊 Status: ${loadConfig().enabled ? 'Enabled' : 'Disabled'}`
    );
  },

  onChat: async function ({ event, api, threadsData, usersData, commandName }) {
    if (!commandName || commandName === "robo3") {
      return;
    }

    const configFile = path.join(__dirname, "..", "..", "robo3_command_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return {
          enabled: true,
          logThread: "886960563901648",
          commandStats: {}
        };
      } catch {
        return {
          enabled: true,
          logThread: "886960563901648",
          commandStats: {}
        };
      }
    }

    function saveConfig(data) {
      try {
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving robo3 config:", error);
      }
    }

    function getDhakaTime() {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const dhakaTime = new Date(utc + (3600000 * 6));
      
      const day = String(dhakaTime.getDate()).padStart(2, '0');
      const month = String(dhakaTime.getMonth() + 1).padStart(2, '0');
      const year = dhakaTime.getFullYear();
      
      let hours = dhakaTime.getHours();
      const minutes = String(dhakaTime.getMinutes()).padStart(2, '0');
      const seconds = String(dhakaTime.getSeconds()).padStart(2, '0');
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const displayHours = String(hours).padStart(2, '0');
      
      return `${day}/${month}/${year} ${displayHours}:${minutes}:${seconds} ${ampm}`;
    }

    const config = loadConfig();

    if (!config.enabled) {
      return;
    }

    try {
      let userName = "Unknown User";
      let threadName = "Unknown Thread";

      try {
        const userInfo = await api.getUserInfo(event.senderID);
        userName = userInfo[event.senderID]?.name || await usersData.getName(event.senderID) || "Unknown User";
      } catch {
        try {
          userName = await usersData.getName(event.senderID) || "Unknown User";
        } catch {
          userName = "Unknown User";
        }
      }

      try {
        if (event.isGroup) {
          const threadInfo = await threadsData.get(event.threadID);
          threadName = threadInfo?.threadName || "Unknown Group";
        } else {
          threadName = "Private Chat";
        }
      } catch {}

      if (!config.commandStats) {
        config.commandStats = {};
      }

      if (!config.commandStats[commandName]) {
        config.commandStats[commandName] = 0;
      }
      config.commandStats[commandName]++;
      saveConfig(config);

      const commandMsg = `╭─────────────────⭓
│ ⚙️ COMMAND USED
├─────────────────⭓
│ 👤 User: ${userName}
│ 🆔 UID: ${event.senderID}
├─────────────────⭓
│ 📌 Thread: ${threadName}
│ 🆔 TID: ${event.threadID}
├─────────────────⭓
│ 🔧 Command: ${commandName}
│ 💬 Full Message: ${event.body}
├─────────────────⭓
│ ⏰ Time: ${getDhakaTime()}
│ 📊 Usage Count: ${config.commandStats[commandName]}
╰─────────────────⭓`;

      await api.sendMessage(commandMsg, config.logThread);

    } catch (error) {
      console.error("Robo3 command monitor error:", error);
    }
  }
};