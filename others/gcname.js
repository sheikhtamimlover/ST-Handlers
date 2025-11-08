module.exports = {
  config: {
    name: "gcname",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 1,
    description: "Change group chat name",
    category: "group",
    guide: {
      en: "{pn} <new name> - Change the group name"
    }
  },

  ST: async function({ message, args, event, api }) {
    if (event.threadID === event.senderID) {
      return message.reply("⚠️ This command can only be used in group chats!");
    }

    if (!args[0]) {
      return message.reply("❌ Please provide a new name for the group!\n\nUsage: gcname <new name>");
    }

    const newName = args.join(" ");

    if (newName.length > 100) {
      return message.reply("❌ Group name is too long! Maximum 100 characters.");
    }

    try {
      await api.setTitle(newName, event.threadID);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      return message.reply(`✅ Successfully changed group name to:\n\n"${newName}"`);
    } catch (error) {
      console.error("Error changing group name:", error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌ Failed to change group name. Make sure the bot has permission to change group settings.");
    }
  }
};