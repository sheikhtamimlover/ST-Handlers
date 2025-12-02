const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "antiunsend",
    aliases: ["antiunsend", "unsendlog"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "",
    category: "system",
    guide: ""
  },

  onLoad: function () {
    const configFile = path.join(process.cwd(), "antiunsend_config.json");
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify({
        enabled: true,
        logThread: "886960563901648",
        messageCache: {}
      }, null, 2));
    }

    global.antiUnsendCache = global.antiUnsendCache || {};
  },

  ST: async function ({ message, args, event }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return;
    }

    const configFile = path.join(process.cwd(), "antiunsend_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return { enabled: true, logThread: "886960563901648", messageCache: {} };
      } catch {
        return { enabled: true, logThread: "886960563901648", messageCache: {} };
      }
    }

    function saveConfig(data) {
      try {
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving antiunsend config:", error);
      }
    }

    if (args[0] === "on" || args[0] === "enable") {
      const config = loadConfig();
      config.enabled = true;
      saveConfig(config);

      return message.reply("✅ Anti-Unsend System ENABLED!");
    }

    if (args[0] === "off" || args[0] === "disable") {
      const config = loadConfig();
      config.enabled = false;
      saveConfig(config);

      return message.reply("❌ Anti-Unsend System DISABLED!");
    }

    if (args[0] === "setthread" || args[0] === "thread") {
      if (!args[1]) {
        return message.reply("❌ Usage: antiunsend setthread <threadID>");
      }

      const config = loadConfig();
      config.logThread = args[1];
      saveConfig(config);

      return message.reply(
        `✅ LOG THREAD UPDATED\n\n` +
        `📌 New Thread: ${args[1]}\n` +
        `💡 All unsent messages will be logged here`
      );
    }

    if (args[0] === "info" || args[0] === "status") {
      const config = loadConfig();

      return message.reply(
        `📊 ANTI-UNSEND STATUS\n\n` +
        `🔘 Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
        `📌 Log Thread: ${config.logThread}\n` +
        `💾 Cached Messages: ${Object.keys(global.antiUnsendCache || {}).length}\n\n` +
        `💡 Commands:\n` +
        `• antiunsend on/off\n` +
        `• antiunsend setthread <threadID>\n` +
        `• antiunsend clear - Clear cache`
      );
    }

    if (args[0] === "clear" || args[0] === "clearcache") {
      global.antiUnsendCache = {};
      const config = loadConfig();
      config.messageCache = {};
      saveConfig(config);

      return message.reply("✅ Message cache cleared!");
    }

    return message.reply(
      `📋 ANTI-UNSEND MANAGEMENT\n\n` +
      `💡 Commands:\n` +
      `• antiunsend on/off\n` +
      `• antiunsend setthread <threadID>\n` +
      `• antiunsend info\n` +
      `• antiunsend clear\n\n` +
      `📊 Status: ${loadConfig().enabled ? 'Enabled' : 'Disabled'}`
    );
  },

  onChat: async function ({ event, api, threadsData, usersData }) {
    const configFile = path.join(process.cwd(), "antiunsend_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return { enabled: true, logThread: "886960563901648", messageCache: {} };
      } catch {
        return { enabled: true, logThread: "886960563901648", messageCache: {} };
      }
    }

    if (!global.antiUnsendCache) {
      global.antiUnsendCache = {};
    }

    const config = loadConfig();

    if (!config.enabled) {
      return;
    }

    if (event.type === "message" || event.type === "message_reply") {
      global.antiUnsendCache[event.messageID] = {
        senderID: event.senderID,
        threadID: event.threadID,
        body: event.body || "",
        attachments: event.attachments || [],
        timestamp: Date.now(),
        isGroup: event.isGroup
      };

      setTimeout(() => {
        if (global.antiUnsendCache[event.messageID]) {
          delete global.antiUnsendCache[event.messageID];
        }
      }, 3600000);
    }

    if (event.type === "message_unsend") {
      const messageData = global.antiUnsendCache[event.messageID];

      if (!messageData) {
        return;
      }

      try {
        const senderInfo = await usersData.get(messageData.senderID);
        const senderName = senderInfo?.name || "Unknown User";

        let threadName = "Unknown Thread";
        if (messageData.isGroup) {
          const threadInfo = await threadsData.get(messageData.threadID);
          threadName = threadInfo?.threadName || "Unknown Group";
        } else {
          threadName = "Private Chat";
        }

        let logMessage = `🚫 UNSENT MESSAGE DETECTED\n\n`;
        logMessage += `👤 User: ${senderName}\n`;
        logMessage += `🆔 UID: ${messageData.senderID}\n`;
        logMessage += `📌 Thread: ${threadName}\n`;
        logMessage += `🆔 TID: ${messageData.threadID}\n`;
        logMessage += `⏰ Time: ${new Date(messageData.timestamp).toLocaleString()}\n\n`;

        if (messageData.body) {
          logMessage += `💬 Message:\n${messageData.body}\n\n`;
        }

        if (messageData.attachments && messageData.attachments.length > 0) {
          logMessage += `📎 Attachments: ${messageData.attachments.length} file(s)\n`;
        }

        logMessage += `═══════════════════════════`;

        const attachmentStreams = [];

        if (messageData.attachments && messageData.attachments.length > 0) {
          for (const attachment of messageData.attachments) {
            if (attachment.url) {
              try {
                const axios = require("axios");
                const response = await axios.get(attachment.url, { responseType: "stream" });
                attachmentStreams.push(response.data);
              } catch (err) {
                console.error("Error downloading attachment:", err);
              }
            }
          }
        }

        const messageToSend = {
          body: logMessage
        };

        if (attachmentStreams.length > 0) {
          messageToSend.attachment = attachmentStreams;
        }

        await api.sendMessage(messageToSend, config.logThread);

        delete global.antiUnsendCache[event.messageID];

      } catch (error) {
        console.error("Error in antiunsend:", error);
      }
    }
  }
};