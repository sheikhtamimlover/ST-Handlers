module.exports = {
  config: {
    name: "gcmoji",
    aliases: ["gcemoji", "changeemoji"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 1,
    description: "Change group chat emoji",
    category: "group",
    guide: {
      en: "{pn} <emoji> - Change the group emoji"
    }
  },

  ST: async function({ message, args, event, api }) {
    if (event.threadID === event.senderID) {
      return message.reply("⚠️ This command can only be used in group chats!");
    }

    if (!args[0]) {
      return message.reply("❌ Please provide an emoji!\n\nUsage: gcmoji <emoji>");
    }

    const emoji = args[0];

    // Simple emoji validation (checks if it's a single character that could be an emoji)
    if (emoji.length > 10) {
      return message.reply("❌ Please provide a valid emoji!");
    }

    try {
      await api.changeThreadEmoji(emoji, event.threadID);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      return message.reply(`✅ Successfully changed group emoji to: ${emoji}`);
    } catch (error) {
      console.error("Error changing group emoji:", error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌ Failed to change group emoji. Make sure the bot has permission to change group settings and you provided a valid emoji.");
    }
  }
};