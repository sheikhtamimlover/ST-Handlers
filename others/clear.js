module.exports = {
  config: {
    name: "clear",
    version: "1.0",
    author: "BaYjid", //*do not change author BaYjid okh Fuck you
    role: 2,
    shortDescription: {
      en: "Clear bot's messages by unsending"
    },
    longDescription: {
      en: "Unsend all recent messages sent by the bot in this group."
    },
    category: "admin",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const threadID = event.threadID;


      const history = await api.getThreadHistory(threadID, 100);


      const botMsgs = history.filter(msg => msg.senderID == api.getCurrentUserID());

      if (botMsgs.length === 0) {
        return api.sendMessage("⚠️ No bot messages found to clear!", threadID);
      }

      for (const msg of botMsgs) {
        await api.unsendMessage(msg.messageID);
      }

      api.sendMessage(`✅ Cleared ${botMsgs.length} bot messages!`, threadID);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Could not clear messages. (Check if bot is logged in with appState)", event.threadID);
    }
  }
};
