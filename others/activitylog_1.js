const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "activitylog",
    aliases: ["aclog", "botlog"],
    version: "2.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "Complete bot activity logging system",
    category: "system",
    guide: "{pn} on/off - Enable/disable logging\n{pn} setthread <threadID> - Set log thread\n{pn} toggle <type> - Toggle log types\n{pn} info - View status"
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
        logMessages: true,
        logCommands: true,
        excludeCommands: ["activitylog", "aclog", "botlog"]
      }, null, 2));
    }
  },

  ST: async function ({ message, args, event }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return message.reply("⛔ Only bot owner can use this command!");
    }

    const configFile = path.join(process.cwd(), "activitylog_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return { 
          enabled: true, 
          logThread: "886960563901648", 
          logJoin: true, 
          logLeave: true, 
          logKick: true, 
          logMessages: true, 
          logCommands: true,
          excludeCommands: ["activitylog", "aclog", "botlog"] 
        };
      } catch {
        return { 
          enabled: true, 
          logThread: "886960563901648", 
          logJoin: true, 
          logLeave: true, 
          logKick: true, 
          logMessages: true, 
          logCommands: true,
          excludeCommands: ["activitylog", "aclog", "botlog"] 
        };
      }
    }

    function saveConfig(data) {
      try {
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving activity log config:", error);
      }
    }

    if (!args[0]) {
      const config = loadConfig();
      return message.reply(
        `📋 ACTIVITY LOG MANAGEMENT\n\n` +
        `💡 Commands:\n` +
        `• activitylog on/off\n` +
        `• activitylog setthread <threadID>\n` +
        `• activitylog toggle <type>\n` +
        `• activitylog info\n\n` +
        `📊 Current Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
        `📌 Log Thread: ${config.logThread}`
      );
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
          `📋 Available Types:\n` +
          `• join - User/Bot joins\n` +
          `• leave - User/Bot leaves\n` +
          `• kick - User kicked\n` +
          `• messages - All messages\n` +
          `• commands - Command usage`
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

      if (type === "messages" || type === "msg" || type === "sms") {
        config.logMessages = !config.logMessages;
        saveConfig(config);
        return message.reply(`✅ Message logs ${config.logMessages ? 'ENABLED' : 'DISABLED'}`);
      }

      if (type === "commands" || type === "cmd") {
        config.logCommands = !config.logCommands;
        saveConfig(config);
        return message.reply(`✅ Command logs ${config.logCommands ? 'ENABLED' : 'DISABLED'}`);
      }

      return message.reply("❌ Invalid type! Use: join, leave, kick, messages, commands");
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
        `├─ Messages: ${config.logMessages ? '✅' : '❌'}\n` +
        `└─ Commands: ${config.logCommands ? '✅' : '❌'}\n\n` +
        `🚫 Excluded Commands: ${config.excludeCommands.join(', ')}\n\n` +
        `💡 Use "activitylog toggle <type>" to change settings`
      );
    }

    return message.reply("❌ Invalid command! Use 'activitylog' to see all commands.");
  },

  onStart: async function ({ event, api, threadsData, usersData }) {
    const configFile = path.join(process.cwd(), "activitylog_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return { 
          enabled: true, 
          logThread: "886960563901648", 
          logJoin: true, 
          logLeave: true, 
          logKick: true, 
          logMessages: true, 
          logCommands: true,
          excludeCommands: ["activitylog", "aclog", "botlog"] 
        };
      } catch {
        return { 
          enabled: true, 
          logThread: "886960563901648", 
          logJoin: true, 
          logLeave: true, 
          logKick: true, 
          logMessages: true, 
          logCommands: true,
          excludeCommands: ["activitylog", "aclog", "botlog"] 
        };
      }
    }

    function getBDTime() {
      const now = new Date();
      const bdOffset = 6 * 60;
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const bdTime = new Date(utc + (bdOffset * 60000));
      
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      
      return bdTime.toLocaleString('en-US', options);
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
              let logMsg = `🤖 BOT JOINED NEW GROUP\n\n`;
              logMsg += `📌 Group: ${threadName}\n`;
              logMsg += `🆔 Thread ID: ${event.threadID}\n`;
              logMsg += `⏰ Time: ${getBDTime()}\n`;
              logMsg += `👥 Total Members: ${threadInfo?.members?.length || 'Unknown'}\n`;
              logMsg += `═══════════════════════════`;
              await api.sendMessage(logMsg, config.logThread);
            } else {
              const userInfo = await usersData.get(participant.userFbId);
              const userName = userInfo?.name || "Unknown User";
              
              let logMsg = `➕ USER JOINED GROUP\n\n`;
              logMsg += `👤 User: ${userName}\n`;
              logMsg += `🆔 UID: ${participant.userFbId}\n`;
              logMsg += `📌 Group: ${threadName}\n`;
              logMsg += `🆔 TID: ${event.threadID}\n`;
              logMsg += `⏰ Time: ${getBDTime()}\n`;
              logMsg += `═══════════════════════════`;
              await api.sendMessage(logMsg, config.logThread);
            }
          }
        } catch (error) {
          console.error("Error logging join:", error);
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
            let logMsg = `🚫 BOT LEFT GROUP\n\n`;
            logMsg += `📌 Group: ${threadName}\n`;
            logMsg += `🆔 Thread ID: ${event.threadID}\n`;
            logMsg += `⏰ Time: ${getBDTime()}\n`;
            logMsg += `═══════════════════════════`;
            await api.sendMessage(logMsg, config.logThread);
          } else {
            const userInfo = await usersData.get(leftParticipantFbId);
            const userName = userInfo?.name || "Unknown User";
            
            let logMsg = `➖ USER LEFT GROUP\n\n`;
            logMsg += `👤 User: ${userName}\n`;
            logMsg += `🆔 UID: ${leftParticipantFbId}\n`;
            logMsg += `📌 Group: ${threadName}\n`;
            logMsg += `🆔 TID: ${event.threadID}\n`;
            logMsg += `⏰ Time: ${getBDTime()}\n`;
            logMsg += `═══════════════════════════`;
            await api.sendMessage(logMsg, config.logThread);
          }
        } catch (error) {
          console.error("Error logging leave:", error);
        }
      };
    }

    if (event.logMessageType === "log:unsubscribe" && event.logMessageData.leftParticipantFbId !== event.author && config.logKick) {
      return async function () {
        try {
          const threadInfo = await threadsData.get(event.threadID);
          const threadName = threadInfo?.threadName || "Unknown Group";
          const kickedUserInfo = await usersData.get(event.logMessageData.leftParticipantFbId);
          const kickedUserName = kickedUserInfo?.name || "Unknown User";
          const kickerInfo = await usersData.get(event.author);
          const kickerName = kickerInfo?.name || "Unknown User";

          let logMsg = `🚷 USER KICKED FROM GROUP\n\n`;
          logMsg += `👤 Kicked User: ${kickedUserName}\n`;
          logMsg += `🆔 UID: ${event.logMessageData.leftParticipantFbId}\n`;
          logMsg += `👮 Kicked By: ${kickerName}\n`;
          logMsg += `🆔 Kicker UID: ${event.author}\n`;
          logMsg += `📌 Group: ${threadName}\n`;
          logMsg += `🆔 TID: ${event.threadID}\n`;
          logMsg += `⏰ Time: ${getBDTime()}\n`;
          logMsg += `═══════════════════════════`;
          await api.sendMessage(logMsg, config.logThread);
        } catch (error) {
          console.error("Error logging kick:", error);
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
        return { 
          enabled: true, 
          logThread: "886960563901648", 
          logJoin: true, 
          logLeave: true, 
          logKick: true, 
          logMessages: true, 
          logCommands: true,
          excludeCommands: ["activitylog", "aclog", "botlog"] 
        };
      } catch {
        return { 
          enabled: true, 
          logThread: "886960563901648", 
          logJoin: true, 
          logLeave: true, 
          logKick: true, 
          logMessages: true, 
          logCommands: true,
          excludeCommands: ["activitylog", "aclog", "botlog"] 
        };
      }
    }

    function getBDTime() {
      const now = new Date();
      const bdOffset = 6 * 60;
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const bdTime = new Date(utc + (bdOffset * 60000));
      
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      
      return bdTime.toLocaleString('en-US', options);
    }

    const config = loadConfig();

    if (!config.enabled) {
      return;
    }

    const excludeCommands = config.excludeCommands || ["activitylog", "aclog", "botlog"];
    
    if (commandName && excludeCommands.some(cmd => cmd.toLowerCase() === commandName.toLowerCase())) {
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

      if (commandName && config.logCommands) {
        let logMsg = `🔧 COMMAND USED\n\n`;
        logMsg += `👤 User: ${senderName}\n`;
        logMsg += `🆔 UID: ${event.senderID}\n`;
        logMsg += `📌 Thread: ${threadName}\n`;
        logMsg += `🆔 TID: ${event.threadID}\n`;
        logMsg += `💬 Command: ${commandName}\n`;
        logMsg += `📝 Full Message: ${event.body || 'N/A'}\n`;
        logMsg += `⏰ Time: ${getBDTime()}\n`;
        logMsg += `═══════════════════════════`;
        await api.sendMessage(logMsg, config.logThread);
      } else if (!commandName && config.logMessages) {
        let logMsg = `💬 MESSAGE RECEIVED\n\n`;
        logMsg += `👤 User: ${senderName}\n`;
        logMsg += `🆔 UID: ${event.senderID}\n`;
        logMsg += `📌 Thread: ${threadName}\n`;
        logMsg += `🆔 TID: ${event.threadID}\n`;
        logMsg += `📝 Message: ${event.body || 'N/A'}\n`;
        logMsg += `⏰ Time: ${getBDTime()}\n`;
        logMsg += `═══════════════════════════`;
        await api.sendMessage(logMsg, config.logThread);
      }
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  }
};