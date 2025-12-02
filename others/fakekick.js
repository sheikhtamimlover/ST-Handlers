module.exports = {
  config: {
    name: "fakekick",
    aliases: ["fkick", "prankkick", "trollkick"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 20,
    role: 1,
    description: "Fake kick prank with dramatic effects - pretends to kick someone from group",
    category: "fun",
    guide: "{pn} @mention - Fake kick mentioned user\n{pn} @mention <reason> - Add custom reason\n{pn} random - Kick random person"
  },

  ST: async function ({ message, args, event, api, usersData, threadsData }) {
    try {
      if (!event.isGroup) {
        return message.reply("❌ This command only works in groups!");
      }

      let targetUID;
      let targetName;
      let kickReason = "Violating group rules";

      const mentions = Object.keys(event.mentions);

      if (mentions.length > 0) {
        targetUID = mentions[0];
        targetName = event.mentions[targetUID];
        
        const reasonIndex = event.body.indexOf(targetName) + targetName.length;
        const customReason = event.body.substring(reasonIndex).trim();
        if (customReason) {
          kickReason = customReason;
        }
      } else if (args[0] === "random") {
        const threadInfo = await threadsData.get(event.threadID);
        const members = threadInfo?.members || [];
        const botID = api.getCurrentUserID();
        const validMembers = members.filter(m => m.userID !== botID && m.userID !== event.senderID);
        
        if (validMembers.length === 0) {
          return message.reply("❌ No valid members to kick!");
        }

        const randomMember = validMembers[Math.floor(Math.random() * validMembers.length)];
        targetUID = randomMember.userID;
        
        const userData = await usersData.get(targetUID);
        targetName = userData?.name || "Unknown User";
      } else {
        return message.reply(
          `❌ Invalid usage!\n\n` +
          `Examples:\n` +
          `• ${this.config.name} @user\n` +
          `• ${this.config.name} @user Being too awesome\n` +
          `• ${this.config.name} random`
        );
      }

      const fakeReasons = [
        "Excessive coolness detected",
        "Being too legendary",
        "Winning too much",
        "Making others jealous",
        "Too much swag",
        "Unauthorized fun activities",
        "Breaking the vibe meter",
        "Extreme chad energy",
        "Illegal meme distribution",
        "Unauthorized roasting",
        "Too many jokes per minute",
        "Violation of cringe policy",
        "Excessive emoji usage",
        "Dangerous levels of sarcasm",
        "Unauthorized main character energy"
      ];

      if (!args.slice(1).join(" ")) {
        kickReason = fakeReasons[Math.floor(Math.random() * fakeReasons.length)];
      }

      await message.reply(
        `⚠️ MODERATION ALERT ⚠️\n\n` +
        `🚨 Initiating kick sequence...\n` +
        `🎯 Target: ${targetName}\n` +
        `📋 Reason: ${kickReason}\n\n` +
        `⏳ Processing in 3... 2... 1...`
      );

      await new Promise(resolve => setTimeout(resolve, 3000));

      await message.reply(
        `🔒 SYSTEM VERIFICATION\n\n` +
        `├─ Checking permissions... ✅\n` +
        `├─ Validating target... ✅\n` +
        `├─ Preparing kick protocol... ✅\n` +
        `└─ Final authorization... ⏳`
      );

      await new Promise(resolve => setTimeout(resolve, 2500));

      await message.reply(
        `⚡ EXECUTING KICK COMMAND\n\n` +
        `🎯 Target locked: ${targetName}\n` +
        `💥 Removing from group...\n` +
        `📤 Sending notification...\n` +
        `🔄 Updating member list...`
      );

      await new Promise(resolve => setTimeout(resolve, 2500));

      let finalMsg = `❌ KICK EXECUTED ❌\n`;
      finalMsg += `═══════════════════════════════════\n\n`;
      finalMsg += `👤 Kicked User: ${targetName}\n`;
      finalMsg += `🆔 UID: ${targetUID}\n`;
      finalMsg += `📋 Reason: ${kickReason}\n`;
      finalMsg += `👮 Kicked By: System Admin\n`;
      finalMsg += `⏰ Time: ${new Date().toLocaleString()}\n\n`;
      finalMsg += `═══════════════════════════════════\n`;
      finalMsg += `📊 Action logged to database\n`;
      finalMsg += `✅ Member successfully removed\n\n`;

      await message.reply(finalMsg);

      await new Promise(resolve => setTimeout(resolve, 2000));

      let reveal = `🎭 JUST KIDDING! 🎭\n\n`;
      reveal += `😂 IT WAS A PRANK!\n`;
      reveal += `🤣 ${targetName} is NOT kicked!\n\n`;
      reveal += `💀 Did we scare you?\n`;
      reveal += `🎪 Welcome to Prank Central!\n\n`;
      reveal += `═══════════════════════════════════\n`;
      reveal += `⚠️ This was a harmless prank!\n`;
      reveal += `❤️ Everyone is safe and sound!\n`;
      reveal += `🎉 Enjoy the chaos!`;

      await message.reply(reveal);

      try {
        await api.setMessageReaction("😂", event.messageID, () => {}, true);
      } catch (err) {}

    } catch (error) {
      console.error("Fake kick error:", error);
      return message.reply(
        `❌ PRANK FAILED!\n\n` +
        `Error: ${error.message}\n\n` +
        `The prank machine broke! 🤡`
      );
    }
  }
};