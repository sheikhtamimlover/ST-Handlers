module.exports = {
  config: {
    name: "addmoney",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 2,
    description: "Add money to user account (Bot Admin Only)",
    category: "economy",
    guide: {
      en: "{pn} <amount> - Add money to your account\n{pn} <amount> @mention - Add money to mentioned user\n{pn} <amount> <uid> - Add money to specific UID"
    }
  },

  ST: async function({ message, args, event, usersData, api }) {
    const { senderID, mentions, threadID } = event;

    if (!args[0] || isNaN(args[0])) {
      return message.reply("❌ Please provide a valid amount!\nUsage: !addmoney <amount> [@mention or UID]");
    }

    const amount = parseInt(args[0]);

    if (amount <= 0) {
      return message.reply("❌ Amount must be greater than 0!");
    }

    let targetUID = senderID;
    let targetName = "You";

    if (Object.keys(mentions).length > 0) {
      targetUID = Object.keys(mentions)[0];
      targetName = mentions[targetUID].replace("@", "");
    } else if (args[1] && !isNaN(args[1])) {
      targetUID = args[1];
      try {
        const userData = await usersData.get(targetUID);
        targetName = userData.name || "User";
      } catch (error) {
        return message.reply("❌ Invalid user ID!");
      }
    }

    try {
      const userData = await usersData.get(targetUID);
      const currentMoney = userData.money || 0;
      const newMoney = currentMoney + amount;

      await usersData.set(targetUID, {
        money: newMoney,
        data: userData.data
      });

      return message.reply(
        `✅ Successfully added money!\n\n` +
        `👤 User: ${targetName}\n` +
        `💰 Amount Added: $${amount.toLocaleString()}\n` +
        `💵 Previous Balance: $${currentMoney.toLocaleString()}\n` +
        `💸 New Balance: $${newMoney.toLocaleString()}`
      );

    } catch (error) {
      console.error("AddMoney Error:", error);
      return message.reply("❌ Failed to add money. Please try again!");
    }
  }
};