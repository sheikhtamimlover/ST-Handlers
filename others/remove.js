const { GoatWrapper } = require("fca-liane-utils");



const deletedTracker = {}; // thread অনুযায়ী last deleted timestamp track করবে

module.exports = {
  config: {
    name: "remove",
    aliases: ["rmv", "r"],
    author: "Rana with gpt (Modified)",
    version: "2.7",
    cooldowns: 5,
    role: 0,
    longDescription: {
      en: "Unsend specified number of bot messages sequentially without re-counting previous ones."
    },
    category: "owner",
    guide: {
      en: "{p}{n} [number_of_messages]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const targetCount = parseInt(args[0]);
    if (isNaN(targetCount) || targetCount <= 0) {
      return api.sendMessage("Please provide a valid number.", event.threadID);
    }

    const botID = api.getCurrentUserID();
    const fetchLimit = targetCount * 10; // বেশি range নিচ্ছি যাতে gap cover হয়

    try {
      let messages = await api.getThreadHistory(event.threadID, fetchLimit);

      // শুধু bot এর message রাখবো
      let botMessages = messages.filter(msg => msg.senderID === botID);

      // যদি আগে delete হয়ে থাকে তাহলে আগের timestamp এর উপরেরগুলো নিবো
      if (deletedTracker[event.threadID]) {
        botMessages = botMessages.filter(
          msg => msg.timestamp < deletedTracker[event.threadID]
        );
      }

      if (botMessages.length === 0) return;

      // oldest থেকে newest sort
      botMessages.sort((a, b) => a.timestamp - b.timestamp);

      const messagesToDelete = botMessages.slice(-targetCount);

      for (const msg of messagesToDelete) {
        await api.unsendMessage(msg.messageID);
      }

      // last deleted message timestamp save করলাম
      deletedTracker[event.threadID] =
        messagesToDelete[0].timestamp;

      await api.setMessageReaction("🆗", event.messageID, () => {}, true);
      await api.unsendMessage(event.messageID);

    } catch (err) {
      console.error("Failed to unsend messages:", err);
      return api.sendMessage("An error occurred while removing messages.", event.threadID);
    }
  }
};


const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });