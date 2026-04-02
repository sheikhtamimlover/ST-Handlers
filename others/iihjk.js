const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "iihjk",
    aliases: ["autounsend", "aun"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Auto unsend messages after specified time (default: off, per-group control)",
    category: "admin",
    guide: "{pn} on - Enable auto unsend in this group\n{pn} off - Disable auto unsend\n{pn} time <seconds> - Set unsend delay (default: 20s)\n{pn} status - Check current settings"
  },
  langs: {
    en: {
      enabled: "✅ Auto unsend enabled! Messages will be deleted after {time} seconds.",
      disabled: "❌ Auto unsend disabled in this group.",
      timeSet: "⏰ Auto unsend delay set to {time} seconds.",
      invalidTime: "❌ Invalid time! Please provide a number between 5 and 300 seconds.",
      status: "📊 Auto Unsend Status:\n━━━━━━━━━━━━━━━\n• Status: {status}\n• Delay: {time} seconds\n• Total Messages Tracked: {count}",
      notGroup: "❌ This command only works in group chats!",
      error: "❌ Error: {error}"
    }
  },
  onStart: async function({ message, args, event, threadsData, getLang }) {
    try {
      if (!event.isGroup) {
        return message.reply(getLang("notGroup"));
      }

      const threadID = event.threadID;
      const threadData = await threadsData.get(threadID);
      
      if (!threadData.data) threadData.data = {};
      if (!threadData.data.autoUnsend) {
        threadData.data.autoUnsend = {
          enabled: false,
          delay: 20,
          messages: []
        };
      }

      const autoUnsendData = threadData.data.autoUnsend;
      const subCommand = args[0]?.toLowerCase();

      if (!subCommand || subCommand === "status") {
        const status = autoUnsendData.enabled ? "ON ✅" : "OFF ❌";
        const messageCount = autoUnsendData.messages?.length || 0;
        return message.reply(getLang("status", {
          status: status,
          time: autoUnsendData.delay,
          count: messageCount
        }));
      }

      if (subCommand === "on") {
        autoUnsendData.enabled = true;
        await threadsData.set(threadID, threadData);
        return message.reply(getLang("enabled", { time: autoUnsendData.delay }));
      }

      if (subCommand === "off") {
        autoUnsendData.enabled = false;
        autoUnsendData.messages = [];
        await threadsData.set(threadID, threadData);
        return message.reply(getLang("disabled"));
      }

      if (subCommand === "time") {
        const timeValue = parseInt(args[1]);
        if (isNaN(timeValue) || timeValue < 5 || timeValue > 300) {
          return message.reply(getLang("invalidTime"));
        }
        autoUnsendData.delay = timeValue;
        await threadsData.set(threadID, threadData);
        return message.reply(getLang("timeSet", { time: timeValue }));
      }

      return message.reply(getLang("status", {
        status: autoUnsendData.enabled ? "ON ✅" : "OFF ❌",
        time: autoUnsendData.delay,
        count: autoUnsendData.messages?.length || 0
      }));

    } catch (error) {
      console.error("Auto Unsend Error:", error);
      return message.reply(getLang("error", { error: error.message }));
    }
  },
  onChat: async function({ event, api, threadsData }) {
    try {
      if (!event.isGroup) return;

      const threadID = event.threadID;
      const messageID = event.messageID;
      const threadData = await threadsData.get(threadID);

      if (!threadData.data?.autoUnsend?.enabled) return;

      const autoUnsendData = threadData.data.autoUnsend;
      const delay = (autoUnsendData.delay || 20) * 1000;

      if (!autoUnsendData.messages) {
        autoUnsendData.messages = [];
      }

      autoUnsendData.messages.push({
        messageID: messageID,
        timestamp: Date.now(),
        threadID: threadID
      });

      await threadsData.set(threadID, threadData);

      setTimeout(async () => {
        try {
          await api.unsendMessage(messageID);
          
          const updatedThreadData = await threadsData.get(threadID);
          if (updatedThreadData.data?.autoUnsend?.messages) {
            updatedThreadData.data.autoUnsend.messages = updatedThreadData.data.autoUnsend.messages.filter(
              msg => msg.messageID !== messageID
            );
            await threadsData.set(threadID, updatedThreadData);
          }
        } catch (unsendError) {
          console.error("Unsend failed:", unsendError);
        }
      }, delay);

    } catch (error) {
      console.error("Auto Unsend onChat Error:", error);
    }
  }
};