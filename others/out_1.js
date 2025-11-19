module.exports = {
  config: {
    name: "out",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 2,
    description: "Bot leaves the group (Bot Admin only)",
    category: "admin",
    guide: "{pn}"
  },

  ST: async function({ api, event, message }) {
    try {
      await message.reply("👋 Goodbye! Bot is leaving this group...");
      
      setTimeout(() => {
        api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
      }, 2000);
    } catch (err) {
      message.reply("❌ Error: " + err.message);
    }
  }
};