module.exports = {
  config: {
    name: "antiunsend",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 0,
    description: "Resend unsent messages to specific thread",
    category: "events",
    guide: {
      en: "Automatic system - resends unsent messages"
    }
  },

  ST: async function ({ message }) {
    return message.reply("✅ Anti-Unsend system is active!\n\nAll unsent messages will be forwarded to the monitoring thread.");
  },

  onChat: async function ({ event, api, usersData }) {
    const TARGET_THREAD = "886960563901648";
    
    if (event.type === "message_unsend") {
      try {
        const senderInfo = await usersData.get(event.senderID);
        const senderName = senderInfo.name || "Unknown User";
        
        const messageContent = event.messageBody || "[No text content]";
        
        let msg = `🚫 Unsent Message Detected!\n\n`;
        msg += `👤 User: ${senderName}\n`;
        msg += `🆔 UID: ${event.senderID}\n`;
        msg += `📍 Thread ID: ${event.threadID}\n`;
        msg += `⏰ Time: ${new Date().toLocaleString()}\n`;
        msg += `\n📝 Message:\n${messageContent}`;
        
        await api.sendMessage(msg, TARGET_THREAD);
        
      } catch (error) {
        console.error("Anti-unsend error:", error);
      }
    }
  }
};