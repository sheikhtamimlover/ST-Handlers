const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "robot",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "Complete bot monitoring and logging system",
    category: "system",
    guide: "{pn} on/off - Enable/disable monitoring\n{pn} info - Show monitoring status"
  },

  onLoad: function () {
    const configFile = path.join(__dirname, "..", "..", "robot_monitor_config.json");
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify({
        enabled: true,
        logThread: "886960563901648",
        excludedUsers: ["61578414567795", "61582507209274", "61582184837851"],
        lastUptimeReport: 0
      }, null, 2));
    }

    global.robotMonitor = {
      commandUsage: {},
      messageCount: {}
    };

    const uptimeInterval = setInterval(async () => {
      try {
        const config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
        if (!config.enabled) return;

        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        if (now - config.lastUptimeReport >= oneHour) {
          const uptime = process.uptime();
          const hours = Math.floor(uptime / 3600);
          const minutes = Math.floor((uptime % 3600) / 60);
          const seconds = Math.floor(uptime % 60);

          const totalMem = os.totalmem() / (1024 * 1024);
          const freeMem = os.freemem() / (1024 * 1024);
          const usedMem = totalMem - freeMem;
          const memPercentage = ((usedMem / totalMem) * 100).toFixed(1);

          const uptimeMsg = `🤖 HOURLY BOT REPORT\n\n` +
            `⏱️ Uptime: ${hours}h ${minutes}m ${seconds}s\n` +
            `💾 Memory: ${memPercentage}% (${usedMem.toFixed(0)}MB/${totalMem.toFixed(0)}MB)\n` +
            `📊 Status: Online & Operational ✅\n` +
            `⏰ Time: ${new Date().toLocaleString()}\n` +
            `═══════════════════════════`;

          if (global.api) {
            await global.api.sendMessage(uptimeMsg, config.logThread);
          }

          config.lastUptimeReport = now;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        }
      } catch (error) {
        console.error("Uptime report error:", error);
      }
    }, 60000);

    if (global.robotMonitorInterval) {
      clearInterval(global.robotMonitorInterval);
    }
    global.robotMonitorInterval = uptimeInterval;
  },

  ST: async function ({ message, args, event }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return message.reply("⛔ Only the owner can use this command!");
    }

    const configFile = path.join(__dirname, "..", "..", "robot_monitor_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return {
          enabled: true,
          logThread: "886960563901648",
          excludedUsers: ["61578414567795", "61582507209274", "61582184837851"],
          lastUptimeReport: 0
        };
      } catch {
        return {
          enabled: true,
          logThread: "886960563901648",
          excludedUsers: ["61578414567795", "61582507209274", "61582184837851"],
          lastUptimeReport: 0
        };
      }
    }

    function saveConfig(data) {
      try {
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving robot config:", error);
      }
    }

    if (args[0] === "on" || args[0] === "enable") {
      const config = loadConfig();
      config.enabled = true;
      saveConfig(config);

      return message.reply("✅ Robot Monitoring System ENABLED!");
    }

    if (args[0] === "off" || args[0] === "disable") {
      const config = loadConfig();
      config.enabled = false;
      saveConfig(config);

      return message.reply("❌ Robot Monitoring System DISABLED!");
    }

    if (args[0] === "info" || args[0] === "status") {
      const config = loadConfig();

      return message.reply(
        `📊 ROBOT MONITOR STATUS\n\n` +
        `🔘 Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
        `📌 Log Thread: ${config.logThread}\n` +
        `👥 Excluded Users: ${config.excludedUsers.length}\n` +
        `⏰ Last Report: ${config.lastUptimeReport ? new Date(config.lastUptimeReport).toLocaleString() : 'Never'}\n\n` +
        `💡 Commands:\n` +
        `• robot on/off\n` +
        `• robot info`
      );
    }

    return message.reply(
      `📋 ROBOT MONITORING SYSTEM\n\n` +
      `💡 Commands:\n` +
      `• robot on/off\n` +
      `• robot info\n\n` +
      `📊 Status: ${loadConfig().enabled ? 'Enabled' : 'Disabled'}`
    );
  },

  onChat: async function ({ event, api, threadsData, usersData, commandName }) {
    const configFile = path.join(__dirname, "..", "..", "robot_monitor_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return {
          enabled: true,
          logThread: "886960563901648",
          excludedUsers: ["61578414567795", "61582507209274", "61582184837851"],
          lastUptimeReport: 0
        };
      } catch {
        return {
          enabled: true,
          logThread: "886960563901648",
          excludedUsers: ["61578414567795", "61582507209274", "61582184837851"],
          lastUptimeReport: 0
        };
      }
    }

    const config = loadConfig();

    if (!config.enabled) {
      return;
    }

    const isExcluded = config.excludedUsers.includes(event.senderID);

    try {
      if (commandName && !isExcluded) {
        let senderName = "Unknown User";
        let threadName = "Unknown Thread";

        try {
          senderName = await usersData.getName(event.senderID) || "Unknown User";
        } catch {}

        try {
          if (event.isGroup) {
            const threadInfo = await threadsData.get(event.threadID);
            threadName = threadInfo?.threadName || "Unknown Group";
          } else {
            threadName = "Private Chat";
          }
        } catch {}

        const logMsg = `📝 COMMAND USED\n\n` +
          `👤 User: ${senderName}\n` +
          `🆔 UID: ${event.senderID}\n` +
          `📌 Thread: ${threadName}\n` +
          `🆔 TID: ${event.threadID}\n` +
          `⚙️ Command: ${commandName}\n` +
          `💬 Message: ${event.body}\n` +
          `⏰ Time: ${new Date().toLocaleString()}\n` +
          `═══════════════════════════`;

        await api.sendMessage(logMsg, config.logThread);
      }

      if (event.type === "message_unsend" && !isExcluded) {
        let senderName = "Unknown User";
        let threadName = "Unknown Thread";

        try {
          senderName = await usersData.getName(event.senderID) || "Unknown User";
        } catch {}

        try {
          if (event.isGroup) {
            const threadInfo = await threadsData.get(event.threadID);
            threadName = threadInfo?.threadName || "Unknown Group";
          } else {
            threadName = "Private Chat";
          }
        } catch {}

        const unsendMsg = `🚫 MESSAGE UNSENT\n\n` +
          `👤 User: ${senderName}\n` +
          `🆔 UID: ${event.senderID}\n` +
          `📌 Thread: ${threadName}\n` +
          `🆔 TID: ${event.threadID}\n` +
          `⏰ Time: ${new Date().toLocaleString()}\n` +
          `═══════════════════════════`;

        await api.sendMessage(unsendMsg, config.logThread);
      }

    } catch (error) {
      console.error("Robot monitor error:", error);
    }
  },

  onEvent: async function ({ event, api, threadsData, usersData }) {
    const configFile = path.join(__dirname, "..", "..", "robot_monitor_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return {
          enabled: true,
          logThread: "886960563901648",
          excludedUsers: ["61578414567795", "61582507209274", "61582184837851"],
          lastUptimeReport: 0
        };
      } catch {
        return {
          enabled: true,
          logThread: "886960563901648",
          excludedUsers: ["61578414567795", "61582507209274", "61582184837851"],
          lastUptimeReport: 0
        };
      }
    }

    const config = loadConfig();

    if (!config.enabled) {
      return;
    }

    const isExcluded = config.excludedUsers.includes(event.author || event.senderID);

    try {
      let threadName = "Unknown Thread";
      try {
        const threadInfo = await threadsData.get(event.threadID);
        threadName = threadInfo?.threadName || "Unknown Group";
      } catch {}

      if (event.logMessageType === "log:subscribe" && !isExcluded) {
        const addedUsers = event.logMessageData.addedParticipants || [];
        
        for (const user of addedUsers) {
          const isBotAdded = user.userFbId === api.getCurrentUserID();
          let userName = "Unknown User";
          let adderName = "Unknown User";

          try {
            userName = await usersData.getName(user.userFbId) || "Unknown User";
          } catch {}

          try {
            adderName = await usersData.getName(event.author) || "Unknown User";
          } catch {}

          if (isBotAdded) {
            const botAddMsg = `🤖 BOT ADDED TO GROUP\n\n` +
              `📌 Group: ${threadName}\n` +
              `🆔 TID: ${event.threadID}\n` +
              `👤 Added by: ${adderName}\n` +
              `🆔 UID: ${event.author}\n` +
              `⏰ Time: ${new Date().toLocaleString()}\n` +
              `═══════════════════════════`;

            await api.sendMessage(botAddMsg, config.logThread);
          } else {
            const memberAddMsg = `➕ MEMBER ADDED\n\n` +
              `👤 Member: ${userName}\n` +
              `🆔 UID: ${user.userFbId}\n` +
              `📌 Group: ${threadName}\n` +
              `🆔 TID: ${event.threadID}\n` +
              `👤 Added by: ${adderName}\n` +
              `⏰ Time: ${new Date().toLocaleString()}\n` +
              `═══════════════════════════`;

            await api.sendMessage(memberAddMsg, config.logThread);
          }
        }
      }

      if (event.logMessageType === "log:unsubscribe" && !isExcluded) {
        const leftUserFbId = event.logMessageData.leftParticipantFbId;
        const isBotRemoved = leftUserFbId === api.getCurrentUserID();
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

        if (isBotRemoved) {
          const wasKicked = event.author && event.author !== leftUserFbId;
          
          const botRemoveMsg = `🤖 BOT ${wasKicked ? 'KICKED' : 'LEFT'} GROUP\n\n` +
            `📌 Group: ${threadName}\n` +
            `🆔 TID: ${event.threadID}\n` +
            (wasKicked ? `👤 Kicked by: ${removerName}\n🆔 UID: ${event.author}\n` : '') +
            `⏰ Time: ${new Date().toLocaleString()}\n` +
            `═══════════════════════════`;

          await api.sendMessage(botRemoveMsg, config.logThread);
        } else {
          const wasKicked = event.author && event.author !== leftUserFbId;
          
          const memberRemoveMsg = `${wasKicked ? '🚫 MEMBER KICKED' : '👋 MEMBER LEFT'}\n\n` +
            `👤 Member: ${userName}\n` +
            `🆔 UID: ${leftUserFbId}\n` +
            `📌 Group: ${threadName}\n` +
            `🆔 TID: ${event.threadID}\n` +
            (wasKicked ? `👤 Kicked by: ${removerName}\n` : '') +
            `⏰ Time: ${new Date().toLocaleString()}\n` +
            `═══════════════════════════`;

          await api.sendMessage(memberRemoveMsg, config.logThread);
        }
      }

    } catch (error) {
      console.error("Robot event monitor error:", error);
    }
  }
};