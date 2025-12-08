module.exports = {
  config: {
    name: "dice",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 3,
    role: 0,
    description: "Roll dice and bet your luck",
    category: "games",
    guide: "{pn} <bet amount> <guess 1-6>"
  },
  ST: async function({ message, args, event, usersData }) {
    const bet = parseInt(args[0]);
    const guess = parseInt(args[1]);
    
    if (!bet || !guess || isNaN(bet) || isNaN(guess)) {
      return message.reply("Usage: dice <bet> <guess>\nExample: dice 100 5");
    }
    
    if (guess < 1 || guess > 6) {
      return message.reply("Please guess a number between 1 and 6!");
    }
    
    const userData = await usersData.get(event.senderID);
    const userMoney = userData.money || 0;
    
    if (bet > userMoney) {
      return message.reply(`You don't have enough money! You have: $${userMoney}`);
    }
    
    if (bet < 10) {
      return message.reply("Minimum bet is $10!");
    }
    
    const roll = Math.floor(Math.random() * 6) + 1;
    
    if (roll === guess) {
      const winnings = bet * 5;
      await usersData.set(event.senderID, {
        money: userMoney + winnings,
        data: userData.data
      });
      message.reply(`🎲 You rolled: ${roll}\n🎉 JACKPOT! You won $${winnings}!\n💰 New balance: $${userMoney + winnings}`);
    } else {
      await usersData.set(event.senderID, {
        money: userMoney - bet,
        data: userData.data
      });
      message.reply(`🎲 You rolled: ${roll}\n❌ You guessed: ${guess}\nYou lost $${bet}\n💰 New balance: $${userMoney - bet}`);
    }
  }
};