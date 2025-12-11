const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'coinflip_data.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading coinflip data:', error);
  }
  return { users: {} };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving coinflip data:', error);
  }
}

function getUserData(userId) {
  const data = loadData();
  if (!data.users[userId]) {
    data.users[userId] = {
      balance: 1000,
      wins: 0,
      losses: 0,
      totalBet: 0,
      totalWon: 0,
      winStreak: 0,
      bestStreak: 0
    };
    saveData(data);
  }
  return data.users[userId];
}

function saveUserData(userId, userData) {
  const data = loadData();
  data.users[userId] = userData;
  saveData(data);
}

module.exports = {
  config: {
    name: "coinflip",
    aliases: ["cf", "flip"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 3,
    role: 0,
    description: "Flip a coin and bet on heads or tails",
    category: "game",
    guide: "{pn} <heads/tails> <amount> - Bet on coin flip\n{pn} stats - View your statistics\n{pn} balance - Check your balance\n{pn} daily - Get daily coins"
  },

  ST: async function({ message, args, event, usersData }) {
    const userId = event.senderID;
    const userData = getUserData(userId);

    if (!args[0] || args[0] === 'balance') {
      const userName = await usersData.getName(userId);
      const winRate = userData.wins + userData.losses > 0 
        ? ((userData.wins / (userData.wins + userData.losses)) * 100).toFixed(1) 
        : 0;

      return message.reply(`╭─────────────────⭓
│ 💰 ${userName}'s Balance
├─────────────────⭓
│ 💵 Coins: ${userData.balance.toLocaleString()}
│ 📊 Win Rate: ${winRate}%
│ 🔥 Current Streak: ${userData.winStreak}
╰─────────────────⭓`);
    }

    if (args[0] === 'stats') {
      const userName = await usersData.getName(userId);
      const totalGames = userData.wins + userData.losses;
      const winRate = totalGames > 0 
        ? ((userData.wins / totalGames) * 100).toFixed(1) 
        : 0;
      const profit = userData.totalWon - userData.totalBet;

      return message.reply(`╭─────────────────⭓
│ 📊 ${userName}'s Stats
├─────────────────⭓
│ 💰 Balance: ${userData.balance.toLocaleString()}
│ 🎮 Games Played: ${totalGames}
├─────────────────⭓
│ ✅ Wins: ${userData.wins}
│ ❌ Losses: ${userData.losses}
│ 📈 Win Rate: ${winRate}%
├─────────────────⭓
│ 💵 Total Bet: ${userData.totalBet.toLocaleString()}
│ 💰 Total Won: ${userData.totalWon.toLocaleString()}
│ 📊 Profit: ${profit >= 0 ? '+' : ''}${profit.toLocaleString()}
├─────────────────⭓
│ 🔥 Current Streak: ${userData.winStreak}
│ 🏆 Best Streak: ${userData.bestStreak}
╰─────────────────⭓`);
    }

    if (args[0] === 'daily') {
      const now = Date.now();
      const lastDaily = userData.lastDaily || 0;
      const oneDayMs = 24 * 60 * 60 * 1000;

      if (now - lastDaily < oneDayMs) {
        const timeLeft = oneDayMs - (now - lastDaily);
        const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
        
        return message.reply(`⏰ Daily reward already claimed!\n\n🕐 Next reward in: ${hoursLeft}h ${minutesLeft}m`);
      }

      const dailyAmount = 500;
      userData.balance += dailyAmount;
      userData.lastDaily = now;
      saveUserData(userId, userData);

      return message.reply(`🎁 Daily Reward Claimed!
╭─────────────────⭓
│ 💰 +${dailyAmount} Coins
│ 💵 New Balance: ${userData.balance.toLocaleString()}
╰─────────────────⭓

💡 Come back tomorrow for more!`);
    }

    const choice = args[0]?.toLowerCase();
    const betAmount = parseInt(args[1]);

    if (!choice || (choice !== 'heads' && choice !== 'tails' && choice !== 'h' && choice !== 't')) {
      return message.reply(`❌ Invalid choice!

Usage: coinflip <heads/tails> <amount>

Examples:
• coinflip heads 100
• coinflip tails 500
• coinflip h 50
• coinflip t 200

💡 Use "coinflip balance" to check your coins!`);
    }

    if (!betAmount || isNaN(betAmount) || betAmount <= 0) {
      return message.reply('❌ Please enter a valid bet amount!\n\nExample: coinflip heads 100');
    }

    if (betAmount < 10) {
      return message.reply('❌ Minimum bet is 10 coins!');
    }

    if (betAmount > userData.balance) {
      return message.reply(`❌ Not enough coins!

💰 Your Balance: ${userData.balance.toLocaleString()}
💵 Bet Amount: ${betAmount.toLocaleString()}
💸 Short: ${(betAmount - userData.balance).toLocaleString()}

💡 Use "coinflip daily" to get free coins!`);
    }

    const userChoice = choice === 'h' ? 'heads' : choice === 't' ? 'tails' : choice;
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const won = userChoice === result;

    userData.totalBet += betAmount;

    if (won) {
      const winAmount = betAmount * 2;
      userData.balance += betAmount;
      userData.wins++;
      userData.totalWon += winAmount;
      userData.winStreak++;
      
      if (userData.winStreak > userData.bestStreak) {
        userData.bestStreak = userData.winStreak;
      }

      saveUserData(userId, userData);

      let bonusMsg = '';
      if (userData.winStreak >= 5) {
        const streakBonus = Math.floor(betAmount * 0.5);
        userData.balance += streakBonus;
        saveUserData(userId, userData);
        bonusMsg = `\n🎊 Streak Bonus: +${streakBonus} coins!`;
      }

      return message.reply(`🪙 Coin is flipping...

╭─────────────────⭓
│ 🎯 Your Choice: ${userChoice.toUpperCase()}
│ 🪙 Result: ${result.toUpperCase()}
├─────────────────⭓
│ ✅ YOU WIN!
├─────────────────⭓
│ 💰 Won: +${betAmount.toLocaleString()}
│ 💵 New Balance: ${userData.balance.toLocaleString()}
│ 🔥 Win Streak: ${userData.winStreak}${bonusMsg}
╰─────────────────⭓`);
    } else {
      userData.balance -= betAmount;
      userData.losses++;
      userData.winStreak = 0;
      saveUserData(userId, userData);

      return message.reply(`🪙 Coin is flipping...

╭─────────────────⭓
│ 🎯 Your Choice: ${userChoice.toUpperCase()}
│ 🪙 Result: ${result.toUpperCase()}
├─────────────────⭓
│ ❌ YOU LOSE!
├─────────────────⭓
│ 💸 Lost: -${betAmount.toLocaleString()}
│ 💵 New Balance: ${userData.balance.toLocaleString()}
│ 🔥 Streak Reset
╰─────────────────⭓

💡 Better luck next time!`);
    }
  }
};