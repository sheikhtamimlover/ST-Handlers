module.exports = {
  config: {
    name: "bank2",
    version: "2.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Complete individual banking system with all features",
    category: "economy",
    guide: {
      en: "{pn} balance - Check your balance\n{pn} balance @mention - Check someone's balance\n{pn} loan <amount> - Take a loan\n{pn} payloan <amount> - Pay back loan\n{pn} deposit <amount> - Deposit money\n{pn} withdraw <amount> - Withdraw money\n{pn} rob @mention - Rob someone (risky)\n{pn} lottery <amount> - Buy lottery ticket\n{pn} spin <amount> - Spin slot machine\n{pn} invest <amount> - Invest money (1 day)\n{pn} interest - Claim daily interest\n{pn} transfer @mention <amount> - Transfer money"
    }
  },

  ST: async function({ message, args, event, api, usersData }) {
    const fs = require('fs-extra');
    const path = require('path');
    const bankFile = path.join(__dirname, 'bank2_data.json');

    // Initialize bank data
    let bankData = {};
    if (fs.existsSync(bankFile)) {
      bankData = JSON.parse(fs.readFileSync(bankFile, 'utf-8'));
    }

    const getUserBank = (uid) => {
      if (!bankData[uid]) {
        bankData[uid] = {
          balance: 1000,
          loan: 0,
          invested: 0,
          investTime: null,
          lastInterest: null,
          totalRobbed: 0,
          totalLost: 0,
          transactions: []
        };
      }
      return bankData[uid];
    };

    const saveBank = () => {
      fs.writeFileSync(bankFile, JSON.stringify(bankData, null, 2));
    };

    const addTransaction = (uid, type, amount, note = '') => {
      const user = getUserBank(uid);
      user.transactions.push({
        type,
        amount,
        note,
        time: new Date().toISOString()
      });
      if (user.transactions.length > 20) {
        user.transactions.shift();
      }
    };

    const formatMoney = (amount) => {
      return amount.toLocaleString('en-US') + ' 💵';
    };

    const getUserName = async (uid) => {
      try {
        const userData = await usersData.get(uid);
        return userData.name || 'User';
      } catch {
        return 'User';
      }
    };

    const senderID = event.senderID;
    const command = args[0]?.toLowerCase();

    // Get target user (mention, reply, or self)
    let targetID = senderID;
    if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (event.messageReply) {
      targetID = event.messageReply.senderID;
    }

    // BALANCE
    if (!command || command === 'balance' || command === 'bal') {
      const user = getUserBank(targetID);
      const name = await getUserName(targetID);
      const isSelf = targetID === senderID;
      
      let msg = `🏦 Bank Account - ${name}\n\n`;
      msg += `💰 Balance: ${formatMoney(user.balance)}\n`;
      msg += `💳 Loan: ${formatMoney(user.loan)}\n`;
      msg += `📈 Invested: ${formatMoney(user.invested)}\n`;
      if (user.invested > 0 && user.investTime) {
        const timeLeft = new Date(user.investTime).getTime() + 86400000 - Date.now();
        if (timeLeft > 0) {
          msg += `⏰ Maturity: ${Math.floor(timeLeft / 3600000)}h ${Math.floor((timeLeft % 3600000) / 60000)}m\n`;
        } else {
          msg += `✅ Investment ready to claim!\n`;
        }
      }
      msg += `\n📊 Stats:\n`;
      msg += `• Total Robbed: ${formatMoney(user.totalRobbed)}\n`;
      msg += `• Total Lost: ${formatMoney(user.totalLost)}`;

      return message.reply(msg);
    }

    const userBank = getUserBank(senderID);

    // LOAN
    if (command === 'loan') {
      const amount = parseInt(args[1]);
      if (!amount || amount < 100) return message.reply('❌ Minimum loan amount is 100 💵');
      if (amount > 50000) return message.reply('❌ Maximum loan amount is 50,000 💵');
      if (userBank.loan > 0) return message.reply(`❌ Pay your existing loan of ${formatMoney(userBank.loan)} first!`);

      userBank.loan = amount;
      userBank.balance += amount;
      addTransaction(senderID, 'loan', amount, 'Loan taken');
      saveBank();
      return message.reply(`✅ Loan approved!\n💰 ${formatMoney(amount)} added to your account\n📌 Repay with interest: ${formatMoney(Math.floor(amount * 1.1))}`);
    }

    // PAY LOAN
    if (command === 'payloan' || command === 'repay') {
      if (userBank.loan === 0) return message.reply('❌ You have no active loan!');
      
      const amount = parseInt(args[1]) || userBank.loan;
      const interest = Math.floor(userBank.loan * 0.1);
      const totalDue = userBank.loan + interest;

      if (amount < totalDue) return message.reply(`❌ You need ${formatMoney(totalDue)} (loan + 10% interest)`);
      if (userBank.balance < totalDue) return message.reply(`❌ Insufficient balance! You need ${formatMoney(totalDue)}`);

      userBank.balance -= totalDue;
      const paidLoan = userBank.loan;
      userBank.loan = 0;
      addTransaction(senderID, 'payloan', totalDue, `Loan cleared: ${formatMoney(paidLoan)} + interest`);
      saveBank();
      return message.reply(`✅ Loan paid successfully!\n💳 Paid: ${formatMoney(totalDue)}\n💰 Remaining balance: ${formatMoney(userBank.balance)}`);
    }

    // DEPOSIT
    if (command === 'deposit' || command === 'dep') {
      const amount = parseInt(args[1]);
      if (!amount || amount < 1) return message.reply('❌ Invalid amount!');
      if (amount > userBank.balance) return message.reply('❌ You don\'t have that much money!');

      userBank.balance += 0; // Placeholder - in real system would transfer from wallet
      addTransaction(senderID, 'deposit', amount);
      saveBank();
      return message.reply(`✅ Deposited ${formatMoney(amount)}\n💰 New balance: ${formatMoney(userBank.balance)}`);
    }

    // WITHDRAW
    if (command === 'withdraw' || command === 'wd') {
      const amount = parseInt(args[1]);
      if (!amount || amount < 1) return message.reply('❌ Invalid amount!');
      if (amount > userBank.balance) return message.reply('❌ Insufficient balance!');

      userBank.balance -= amount;
      addTransaction(senderID, 'withdraw', amount);
      saveBank();
      return message.reply(`✅ Withdrawn ${formatMoney(amount)}\n💰 Remaining balance: ${formatMoney(userBank.balance)}`);
    }

    // ROB
    if (command === 'rob' || command === 'robbery') {
      if (targetID === senderID) return message.reply('❌ You cannot rob yourself!');
      if (userBank.balance < 500) return message.reply('❌ You need at least 500 💵 to attempt a robbery!');

      const targetBank = getUserBank(targetID);
      if (targetBank.balance < 100) return message.reply('❌ Target is too poor to rob!');

      const success = Math.random() > 0.5;
      const targetName = await getUserName(targetID);

      if (success) {
        const robAmount = Math.floor(targetBank.balance * (0.1 + Math.random() * 0.2));
        userBank.balance += robAmount;
        targetBank.balance -= robAmount;
        userBank.totalRobbed += robAmount;
        targetBank.totalLost += robAmount;
        addTransaction(senderID, 'rob', robAmount, `Robbed from ${targetName}`);
        addTransaction(targetID, 'robbed', -robAmount, 'Got robbed');
        saveBank();
        return message.reply(`✅ Robbery successful!\n💰 You stole ${formatMoney(robAmount)} from ${targetName}!`);
      } else {
        const fine = Math.floor(userBank.balance * 0.2);
        userBank.balance -= fine;
        userBank.totalLost += fine;
        addTransaction(senderID, 'rob_failed', -fine, 'Failed robbery - caught');
        saveBank();
        return message.reply(`❌ Robbery failed! You were caught!\n💸 Fine: ${formatMoney(fine)}\n🚔 Better luck next time!`);
      }
    }

    // LOTTERY
    if (command === 'lottery' || command === 'lotto') {
      const amount = parseInt(args[1]);
      if (!amount || amount < 100) return message.reply('❌ Minimum lottery ticket is 100 💵');
      if (amount > userBank.balance) return message.reply('❌ Insufficient balance!');

      const win = Math.random() > 0.7; // 30% chance to win

      if (win) {
        const multiplier = 2 + Math.random() * 3; // 2x to 5x
        const winAmount = Math.floor(amount * multiplier);
        userBank.balance += winAmount;
        addTransaction(senderID, 'lottery_win', winAmount, `Won ${multiplier.toFixed(1)}x`);
        saveBank();
        return message.reply(`🎉 LOTTERY WIN!\n💰 You won ${formatMoney(winAmount)}! (${multiplier.toFixed(1)}x)\n💵 New balance: ${formatMoney(userBank.balance)}`);
      } else {
        userBank.balance -= amount;
        addTransaction(senderID, 'lottery_loss', -amount, 'Lottery ticket lost');
        saveBank();
        return message.reply(`❌ No luck this time!\n💸 Lost ${formatMoney(amount)}\n💰 Balance: ${formatMoney(userBank.balance)}`);
      }
    }

    // SPIN / SLOT
    if (command === 'spin' || command === 'slot') {
      const amount = parseInt(args[1]);
      if (!amount || amount < 50) return message.reply('❌ Minimum spin is 50 💵');
      if (amount > userBank.balance) return message.reply('❌ Insufficient balance!');

      const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎'];
      const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
      const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
      const slot3 = symbols[Math.floor(Math.random() * symbols.length)];

      let multiplier = 0;
      if (slot1 === slot2 && slot2 === slot3) {
        if (slot1 === '💎') multiplier = 10;
        else if (slot1 === '⭐') multiplier = 7;
        else multiplier = 5;
      } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
        multiplier = 2;
      }

      const winAmount = amount * multiplier;
      const profit = winAmount - amount;

      userBank.balance += profit;
      addTransaction(senderID, 'slot', profit, `${slot1}${slot2}${slot3}`);
      saveBank();

      let msg = `🎰 SLOT MACHINE 🎰\n\n[ ${slot1} | ${slot2} | ${slot3} ]\n\n`;
      if (multiplier > 0) {
        msg += `🎉 WIN! ${multiplier}x multiplier!\n💰 Won: ${formatMoney(winAmount)}\n📈 Profit: ${formatMoney(profit)}`;
      } else {
        msg += `❌ No match!\n💸 Lost: ${formatMoney(amount)}`;
      }
      msg += `\n💵 Balance: ${formatMoney(userBank.balance)}`;

      return message.reply(msg);
    }

    // INVEST
    if (command === 'invest' || command === 'investment') {
      const amount = parseInt(args[1]);
      if (!amount || amount < 1000) return message.reply('❌ Minimum investment is 1,000 💵');
      if (amount > userBank.balance) return message.reply('❌ Insufficient balance!');
      if (userBank.invested > 0) return message.reply('❌ You already have an active investment!');

      userBank.balance -= amount;
      userBank.invested = amount;
      userBank.investTime = new Date().toISOString();
      addTransaction(senderID, 'invest', amount, '24h investment at 15% return');
      saveBank();
      return message.reply(`✅ Investment successful!\n💰 Invested: ${formatMoney(amount)}\n📈 Expected return: ${formatMoney(Math.floor(amount * 1.15))} (15%)\n⏰ Maturity: 24 hours`);
    }

    // CLAIM INVESTMENT
    if (command === 'claim' || command === 'claiminvest') {
      if (userBank.invested === 0) return message.reply('❌ You have no active investment!');
      
      const investTime = new Date(userBank.investTime).getTime();
      const now = Date.now();
      const timeElapsed = now - investTime;

      if (timeElapsed < 86400000) { // 24 hours
        const timeLeft = 86400000 - timeElapsed;
        const hours = Math.floor(timeLeft / 3600000);
        const minutes = Math.floor((timeLeft % 3600000) / 60000);
        return message.reply(`❌ Investment not matured yet!\n⏰ Time remaining: ${hours}h ${minutes}m`);
      }

      const returns = Math.floor(userBank.invested * 1.15);
      userBank.balance += returns;
      const profit = returns - userBank.invested;
      userBank.invested = 0;
      userBank.investTime = null;
      addTransaction(senderID, 'invest_return', returns, `Profit: ${formatMoney(profit)}`);
      saveBank();
      return message.reply(`✅ Investment matured!\n💰 Returns: ${formatMoney(returns)}\n📈 Profit: ${formatMoney(profit)}\n💵 New balance: ${formatMoney(userBank.balance)}`);
    }

    // INTEREST
    if (command === 'interest' || command === 'daily') {
      const lastClaim = userBank.lastInterest ? new Date(userBank.lastInterest).getTime() : 0;
      const now = Date.now();
      const timeSince = now - lastClaim;

      if (timeSince < 86400000) { // 24 hours
        const timeLeft = 86400000 - timeSince;
        const hours = Math.floor(timeLeft / 3600000);
        const minutes = Math.floor((timeLeft % 3600000) / 60000);
        return message.reply(`❌ Daily interest already claimed!\n⏰ Next claim in: ${hours}h ${minutes}m`);
      }

      const interest = Math.floor(userBank.balance * 0.05); // 5% daily interest
      userBank.balance += interest;
      userBank.lastInterest = new Date().toISOString();
      addTransaction(senderID, 'interest', interest, 'Daily 5% interest');
      saveBank();
      return message.reply(`✅ Daily interest claimed!\n💰 Earned: ${formatMoney(interest)} (5%)\n💵 New balance: ${formatMoney(userBank.balance)}`);
    }

    // TRANSFER
    if (command === 'transfer' || command === 'send') {
      if (targetID === senderID) return message.reply('❌ You cannot transfer to yourself!');
      
      const amount = parseInt(args[1]);
      if (!amount || amount < 1) return message.reply('❌ Invalid amount!');
      if (amount > userBank.balance) return message.reply('❌ Insufficient balance!');

      const targetBank = getUserBank(targetID);
      const targetName = await getUserName(targetID);

      userBank.balance -= amount;
      targetBank.balance += amount;
      addTransaction(senderID, 'transfer_sent', -amount, `Sent to ${targetName}`);
      addTransaction(targetID, 'transfer_received', amount, `Received from sender`);
      saveBank();

      return message.reply(`✅ Transfer successful!\n💸 Sent ${formatMoney(amount)} to ${targetName}\n💰 Your balance: ${formatMoney(userBank.balance)}`);
    }

    // TRANSACTIONS / HISTORY
    if (command === 'transactions' || command === 'history') {
      const user = getUserBank(senderID);
      if (user.transactions.length === 0) return message.reply('❌ No transaction history!');

      let msg = '📜 Transaction History (Latest 10)\n\n';
      user.transactions.slice(-10).reverse().forEach((tx, i) => {
        const date = new Date(tx.time);
        msg += `${i + 1}. ${tx.type.toUpperCase()}\n`;
        msg += `   💰 ${tx.amount > 0 ? '+' : ''}${formatMoney(tx.amount)}\n`;
        if (tx.note) msg += `   📝 ${tx.note}\n`;
        msg += `   🕐 ${date.toLocaleString()}\n\n`;
      });

      return message.reply(msg);
    }

    // HELP
    return message.reply(`🏦 Bank2 Commands:\n\n` +
      `💰 balance - Check balance\n` +
      `💳 loan <amount> - Take loan\n` +
      `💵 payloan - Repay loan\n` +
      `🎯 rob @user - Rob someone\n` +
      `🎰 spin <amount> - Slot machine\n` +
      `🎫 lottery <amount> - Buy ticket\n` +
      `📈 invest <amount> - Invest (24h)\n` +
      `💎 claim - Claim investment\n` +
      `🎁 interest - Daily interest\n` +
      `💸 transfer @user <amount> - Send money\n` +
      `📜 history - View transactions`);
  }
};