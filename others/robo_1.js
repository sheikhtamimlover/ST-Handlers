const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "robo",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "Monitor specific users' group activities",
    category: "system",
    guide: "{pn} on/off - Enable/disable monitoring\n{pn} info - Show monitoring status\n{pn} adduser <uid> - Add user to monitor\n{pn} removeuser <uid> - Remove user from monitor"
  },

  onLoad: function () {
    const configFile = path.join(__dirname, "..", "..", "robo_spy_config.json");
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify({
        enabled: true,
        logThread: "886960563901648",
        monitoredUsers: ["61578414567795", "61582507209274", "61582184837851"]
      }, null, 2));
    }
  },

  ST: async function ({ message, args, event }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return message.reply("⛔ Only the owner can use this command!");
    }

    const configFile = path.join(__dirname, "..", "..", "robo_spy_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return {
          enabled: true,
          logThread: "886960563901648",
          monitoredUsers: ["61578414567795", "61582507209274", "61582184837851"]
        };
      } catch {
        return {
          enabled: true,
          logThread: "886960563901648",
          monitoredUsers: ["61578414567795", "61582507209274", "61582184837851"]
        };
      }
    }

    function saveConfig(data) {
      try {
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving robo config:", error);
      }
    }

    if (args[0] === "on" || args[0] === "enable") {
      const config = loadConfig();
      config.enabled = true;
      saveConfig(config);

      return message.reply("✅ User Activity Monitor ENABLED!");
    }

    if (args[0] === "off" || args[0] === "disable") {
      const config = loadConfig();
      config.enabled = false;
      saveConfig(config);

      return message.reply("❌ User Activity Monitor DISABLED!");
    }

    if (args[0] === "adduser") {
      if (!args[1]) {
        return message.reply("❌ Usage: robo adduser <uid>");
      }

      const config = loadConfig();
      const userId = args[1];

      if (config.monitoredUsers.includes(userId)) {
        return message.reply("⚠️ This user is already being monitored!");
      }

      config.monitoredUsers.push(userId);
      saveConfig(config);

      return message.reply(`✅ User ${userId} added to monitoring list!\n\n📊 Total monitored users: ${config.monitoredUsers.length}`);
    }

    if (args[0] === "removeuser") {
      if (!args[1]) {
        return message.reply("❌ Usage: robo removeuser <uid>");
      }

      const config = loadConfig();
      const userId = args[1];

      if (!config.monitoredUsers.includes(userId)) {
        return message.reply("⚠️ This user is not in the monitoring list!");
      }

      config.monitoredUsers = config.monitoredUsers.filter(id => id !== userId);
      saveConfig(config);

      return message.reply(`✅ User ${userId} removed from monitoring list!\n\n📊 Total monitored users: ${config.monitoredUsers.length}`);
    }

    if (args[0] === "info" || args[0] === "status") {
      const config = loadConfig();

      let userList = "";
      for (let i = 0; i < config.monitoredUsers.length; i++) {
        userList += `${i + 1}. ${config.monitoredUsers[i]}\n`;
      }

      return message.reply(
        `📊 USER ACTIVITY MONITOR STATUS\n\n` +
        `🔘 Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
        `📌 Log Thread: ${config.logThread}\n` +
        `👥 Monitored Users: ${config.monitoredUsers.length}\n\n` +
        `📋 User List:\n${userList}\n` +
        `💡 Commands:\n` +
        `• robo on/off\n` +
        `• robo adduser <uid>\n` +
        `• robo removeuser <uid>\n` +
        `• robo info`
      );
    }

    return message.reply(
      `📋 USER ACTIVITY MONITOR\n\n` +
      `💡 Commands:\n` +
      `• robo on/off\n` +
      `• robo adduser <uid>\n` +
      `• robo removeuser <uid>\n` +
      `• robo info\n\n` +
      `📊 Status: ${loadConfig().enabled ? 'Enabled' : 'Disabled'}`
    );
  },

  onEvent: async function ({ event, api, threadsData, usersData }) {
    const configFile = path.join(__dirname, "..", "..", "robo_spy_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return {
          enabled: true,
          logThread: "886960563901648",
          monitoredUsers: ["61578414567795", "61582507209274", "61582184837851"]
        };
      } catch {
        return {
          enabled: true,
          logThread: "886960563901648",
          monitoredUsers: ["61578414567795", "61582507209274", "61582184837851"]
        };
      }
    }

    const config = loadConfig();

    if (!config.enabled) {
      return;
    }

    try {
      let threadName = "Unknown Thread";
      try {
        const threadInfo = await threadsData.get(event.threadID);
        threadName = threadInfo?.threadName || "Unknown Group";
      } catch {}

      if (event.logMessageType === "log:subscribe") {
        const addedUsers = event.logMessageData.addedParticipants || [];
        
        for (const user of addedUsers) {
          const userId = user.userFbId;
          
          if (config.monitoredUsers.includes(userId)) {
            let userName = "Unknown User";
            let adderName = "Unknown User";

            try {
              userName = await usersData.getName(userId) || "Unknown User";
            } catch {}

            try {
              adderName = await usersData.getName(event.author) || "Unknown User";
            } catch {}

            const joinMsg = `🔍 MONITORED USER ADDED TO GROUP\n\n` +
              `👤 User: ${userName}\n` +
              `🆔 UID: ${userId}\n` +
              `📌 Group: ${threadName}\n` +
              `🆔 TID: ${event.threadID}\n` +
              `👤 Added by: ${adderName}\n` +
              `🆔 Adder UID: ${event.author}\n` +
              `⏰ Time: ${new Date().toLocaleString()}\n` +
              `═══════════════════════════`;

            await api.sendMessage(joinMsg, config.logThread);
          }
        }
      }

      if (event.logMessageType === "log:unsubscribe") {
        const leftUserFbId = event.logMessageData.leftParticipantFbId;
        
        if (config.monitoredUsers.includes(leftUserFbId)) {
          let userName = "Unknown User";
          let removerName = "Unknown User";

          try {
            userName = await usersData.getName(leftUserFbId) || "Unknown User";
          } catch {}

          try {
            if (event.author) {
              removerName = await usersData.getName(event.author) || "Unknown User";
            }
          } catch {}

          const wasKicked = event.author && event.author !== leftUserFbId;
          
          const leaveMsg = `🔍 MONITORED USER ${wasKicked ? 'REMOVED' : 'LEFT'} GROUP\n\n` +
            `👤 User: ${userName}\n` +
            `🆔 UID: ${leftUserFbId}\n` +
            `📌 Group: ${threadName}\n` +
            `🆔 TID: ${event.threadID}\n` +
            (wasKicked ? `👤 Removed by: ${removerName}\n🆔 Remover UID: ${event.author}\n` : '') +
            `📊 Action: ${wasKicked ? 'Kicked' : 'Left Voluntarily'}\n` +
            `⏰ Time: ${new Date().toLocaleString()}\n` +
            `═══════════════════════════`;

          await api.sendMessage(leaveMsg, config.logThread);
        }
      }

    } catch (error) {
      console.error("Robo spy monitor error:", error);
    }
  }
};