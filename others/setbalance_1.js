module.exports = {
  config: {
    name: "setbalance",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Set balance for a user (Owner only)",
    category: "admin",
    guide: "{pn} @mention <amount>\n{pn} reply <amount>\n{pn} <uid> <amount>"
  },
  ST: async function({ message, args, event, api, usersData }) {
    try {
      const ownerUID = "100033670741301";
      
      if (event.senderID !== ownerUID) {
        return message.reply("❌ This command can only be used by the owner!");
      }

      let targetUID;
      let amount;

      if (Object.keys(event.mentions).length > 0) {
        targetUID = Object.keys(event.mentions)[0];
        amount = parseInt(args[1]);
      }
      else if (event.messageReply) {
        targetUID = event.messageReply.senderID;
        amount = parseInt(args[0]);
      }
      else if (args.length >= 2) {
        targetUID = args[0];
        amount = parseInt(args[1]);
      }
      else {
        return message.reply("⚠️ Invalid format!\n\nUsage:\n• /setbalance @mention <amount>\n• /setbalance reply <amount>\n• /setbalance <uid> <amount>");
      }

      if (isNaN(amount) || amount < 0) {
        return message.reply("❌ Please provide a valid positive number for the amount!");
      }

      const userData = await usersData.get(targetUID);
      if (!userData) {
        return message.reply("❌ User not found!");
      }

      const oldBalance = userData.money || 0;
      await usersData.set(targetUID, {
        money: amount,
        data: userData.data
      });

      const userName = userData.name || "Unknown";

      return message.reply(
        `✅ Balance Updated Successfully!\n\n` +
        `👤 User: ${userName}\n` +
        `🆔 UID: ${targetUID}\n` +
        `💰 Old Balance: $${oldBalance.toLocaleString()}\n` +
        `💵 New Balance: $${amount.toLocaleString()}\n` +
        `📊 Change: ${amount > oldBalance ? '+' : ''}$${(amount - oldBalance).toLocaleString()}`
      );

    } catch (error) {
      console.error("SetBalance command error:", error);
      return message.reply(`❌ An error occurred: ${error.message}`);
    }
  }
};