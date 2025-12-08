module.exports = {
  config: {
    name: "coinflip",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 3,
    role: 0,
    description: "Flip a coin and bet on heads or tails",
    category: "games",
    guide: "{pn} <bet amount> <heads/tails>"
  },
  ST: async function({ message, args, event, usersData }) {
    const bet = parseInt(args[0]);
    const choice = args[1]?.toLowerCase();
    
    if (!bet || !choice || isNaN(bet)) {
      return message.reply("Usage: coinflip <bet> <heads/tails>\nExample: coinflip 50 heads");
    }
    
    if (choice !== 'heads' && choice !== 'tails') {
      return message.reply("Please choose 'heads' or 'tails'!");
    }
    
    const userData = await usersData.get(event.senderID);
    const userMoney = userData.money || 0;
    
    if (bet > userMoney) {
      return message.reply(`You don't have enough money! You have: $${userMoney}`);
    }
    
    if (bet < 5) {
      return message.reply("Minimum bet is $5!");
    }
    
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    
    if (result === choice) {
      const winnings = bet * 2;
      await usersData.set(event.senderID, {
        money: userMoney + bet,
        data: userData.data
      });
      message.reply(`🪙 The coin landed on: ${result}\n🎉 You won $${bet}!\n💰 New balance: $${userMoney + bet}`);
    } else {
      await usersData.set(event.senderID, {
        money: userMoney - bet,
        data: userData.data
      });
      message.reply(`🪙 The coin landed on: ${result}\n❌ You lost $${bet}\n💰 New balance: $${userMoney - bet}`);
    }
  }
};