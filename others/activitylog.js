const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "activitylog",
    aliases: ["actlog", "botactivity"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "",
    category: "system",
    guide: ""
  },

  onLoad: function () {
    const configFile = path.join(process.cwd(), "activitylog_config.json");
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify({
        enabled: true,
        logThread: "886960563901648",
        logJoin: true,
        logLeave: true,
        logKick: true,
        logCommandUse: true
      }, null, 2));
    }
  },

  ST: async function ({ message, args, event }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return;
    }

    const configFile = path.join(process.cwd(), "activitylog_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return { enabled: true, logThread: "886960563901648", logJoin: true, logLeave: true, logKick: true, logCommandUse: true };
      } catch {
        return { enabled: true, logThread: "886960563901648", logJoin: true, logLeave: true, logKick: true, logCommandUse: true };
      }
    }

    function saveConfig(data) {
      try {
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving activity log config:", error);
      }
    }

    if (args[0] === "on" || args[0] === "enable") {
      const config = loadConfig();
      config.enabled = true;
      saveConfig(config);

      return message.reply("✅ Activity Log System ENABLED!");
    }

    if (args[0] === "off" || args[0] === "disable") {
      const config = loadConfig();
      config.enabled = false;
      saveConfig(config);

      return message.reply("❌ Activity Log System DISABLED!");
    }

    if (args[0] === "setthread" || args[0] === "thread") {
      if (!args[1]) {
        return message.reply("❌ Usage: activitylog setthread <threadID>");
      }

      const config = loadConfig();
      config.logThread = args[1];
      saveConfig(config);

      return message.reply(
        `✅ LOG THREAD UPDATED\n\n` +
        `📌 New Thread: ${args[1]}\n` +
        `💡 All activity logs will be sent here`
      );
    }

    if (args[0] === "toggle") {
      if (!args[1]) {
        return message.reply(
          `❌ Usage: activitylog toggle <type>\n\n` +
          `Types: join, leave, kick, command`
        );
      }

      const config = loadConfig();
      const type = args[1].toLowerCase();

      if (type === "join") {
        config.logJoin = !config.logJoin;
        saveConfig(config);
        return message.reply(`✅ Join logs ${config.logJoin ? 'ENABLED' : 'DISABLED'}`);
      }

      if (type === "leave") {
        config.logLeave = !config.logLeave;
        saveConfig(config);
        return message.reply(`✅ Leave logs ${config.logLeave ? 'ENABLED' : 'DISABLED'}`);
      }

      if (type === "kick") {
        config.logKick = !config.logKick;
        saveConfig(config);
        return message.reply(`✅ Kick logs ${config.logKick ? 'ENABLED' : 'DISABLED'}`);
      }

      if (type === "command" || type === "cmd") {
        config.logCommandUse = !config.logCommandUse;
        saveConfig(config);
        return message.reply(`✅ Command logs ${config.logCommandUse ? 'ENABLED' : 'DISABLED'}`);
      }

      return message.reply("❌ Invalid type! Use: join, leave, kick, command");
    }

    if (args[0] === "info" || args[0] === "status") {
      const config = loadConfig();

      return message.reply(
        `📊 ACTIVITY LOG STATUS\n\n` +
        `🔘 System: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
        `📌 Log Thread: ${config.logThread}\n\n` +
        `📋 Log Types:\n` +
        `├─ Join: ${config.logJoin ? '✅' : '❌'}\n` +
        `├─ Leave: ${config.logLeave ? '✅' : '❌'}\n` +
        `├─ Kick: ${config.logKick ? '✅' : '❌'}\n` +
        `└─ Commands: ${config.logCommandUse ? '✅' : '❌'}\n\n` +
        `💡 Use "activitylog toggle <type>" to change`
      );
    }

    return message.reply(
      `📋 ACTIVITY LOG MANAGEMENT\n\n` +
      `💡 Commands:\n` +
      `• activitylog on/off\n` +
      `• activitylog setthread <threadID>\n` +
      `• activitylog toggle <type>\n` +
      `• activitylog info\n\n` +
      `📊 Status: ${loadConfig().enabled ? 'Enabled' : 'Disabled'}`
    );
  },

  onStart: async function ({ event, api, threadsData, usersData }) {
    const configFile = path.join(process.cwd(), "activitylog_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return { enabled: true, logThread: "886960563901648", logJoin: true, logLeave: true, logKick: true, logCommandUse: true };
      } catch {
        return { enabled: true, logThread: "886960563901648", logJoin: true, logLeave: true, logKick: true, logCommandUse: true };
      }
    }

    const config = loadConfig();

    if (!config.enabled) {
      return;
    }

    if (event.logMessageType === "log:subscribe" && config.logJoin) {
      return async function () {
        try {
          const threadInfo = await threadsData.get(event.threadID);
          const threadName = threadInfo?.threadName || "Unknown Group";

          const addedParticipants = event.logMessageData.addedParticipants;

          for (const participant of addedParticipants) {
            const isBotJoined = participant.userFbId === api.getCurrentUserID();

            if (isBotJoined) {
              let logMsg = `✅ BOT JOINED NEW GROUP\n\n`;
              logMsg += `📌 Group: ${threadName}\n`;
              logMsg += `🆔 Thread ID: ${event.threadID}\n`;
              logMsg += `⏰ Time: ${new Date().toLocaleString()}\n`;
              logMsg += `👥 Total Members: ${threadInfo?.members?.length || 'Unknown'}\n`;
              logMsg += `═══════════════════════════`;

              await api.sendMessage(logMsg, config.logThread);
            }
          }
        } catch (error) {
          console.error("Error logging bot join:", error);
        }
      };
    }

    if (event.logMessageType === "log:unsubscribe" && config.logLeave) {
      return async function () {
        try {
          const threadInfo = await threadsData.get(event.threadID);
          const threadName = threadInfo?.threadName || "Unknown Group";

          const leftParticipantFbId = event.logMessageData.leftParticipantFbId;
          const isBotLeft = leftParticipantFbId === api.getCurrentUserID();

          if (isBotLeft) {
            let logMsg = `❌ BOT LEFT GROUP\n\n`;
            logMsg += `📌 Group: ${threadName}\n`;
            logMsg += `🆔 Thread ID: ${event.threadID}\n`;
            logMsg += `⏰ Time: ${new Date().toLocaleString()}\n`;
            logMsg += `═══════════════════════════`;

            await api.sendMessage(logMsg, config.logThread);
          }
        } catch (error) {
          console.error("Error logging bot leave:", error);
        }
      };
    }
  },

  onChat: async function ({ event, api, threadsData, usersData, commandName }) {
    const configFile = path.join(process.cwd(), "activitylog_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return { enabled: true, logThread: "886960563901648", logJoin: true, logLeave: true, logKick: true, logCommandUse: true };
      } catch {
        return { enabled: true, logThread: "886960563901648", logJoin: true, logLeave: true, logKick: true, logCommandUse: true };
      }
    }

    const config = loadConfig();

    if (!config.enabled || !config.logCommandUse || !commandName) {
      return;
    }

    try {
      const senderInfo = await usersData.get(event.senderID);
      const senderName = senderInfo?.name || "Unknown User";

      let threadName = "Private Chat";
      if (event.isGroup) {
        const threadInfo = await threadsData.get(event.threadID);
        threadName = threadInfo?.threadName || "Unknown Group";
      }

      let logMsg = `🔧 COMMAND USED\n\n`;
      logMsg += `👤 User: ${senderName}\n`;
      logMsg += `🆔 UID: ${event.senderID}\n`;
      logMsg += `📌 Thread: ${threadName}\n`;
      logMsg += `🆔 TID: ${event.threadID}\n`;
      logMsg += `💬 Command: ${commandName}\n`;
      logMsg += `⏰ Time: ${new Date().toLocaleString()}\n`;
      logMsg += `═══════════════════════════`;

      await api.sendMessage(logMsg, config.logThread);
    } catch (error) {
      console.error("Error logging command use:", error);
    }
  }
};