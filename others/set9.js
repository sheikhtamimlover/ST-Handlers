const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "set9",
    aliases: ["slot9", "slots9"],
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Play a slot machine game with 9 slots and win prizes!",
    category: "game",
    guide: "{pn} <bet amount> - Spin the 9-slot machine and try your luck!"
  },

  langs: {
    en: {
      noBet: "❌ Please provide a bet amount!\nUsage: {pn} <amount>",
      invalidBet: "❌ Invalid bet amount! Please enter a valid number.",
      notEnoughMoney: "❌ You don't have enough money!\n💰 Your balance: {balance}$\n💸 Bet amount: {bet}$",
      spinning: "🎰 Spinning the 9-slot machine...",
      win: "🎉 CONGRATULATIONS! 🎉\n\n🎰 Result: {result}\n💰 You won: {winAmount}$\n💵 New balance: {newBalance}$",
      lose: "😢 Better luck next time!\n\n🎰 Result: {result}\n💸 You lost: {betAmount}$\n💵 Remaining balance: {newBalance}$",
      jackpot: "💎 JACKPOT! JACKPOT! JACKPOT! 💎\n\n🎰 Result: {result}\n🏆 You won: {winAmount}$\n💰 New balance: {newBalance}$",
      processing: "⏳ Creating your slot animation..."
    }
  },

  onStart: async function({ message, args, event, usersData, getLang, commandName }) {
    const { senderID } = event;

    // Check bet amount
    if (!args[0]) {
      return message.reply(getLang("noBet").replace("{pn}", commandName));
    }

    const betAmount = parseInt(args[0]);
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply(getLang("invalidBet"));
    }

    // Check user balance
    const userData = await usersData.get(senderID);
    const userMoney = userData.money || 0;

    if (userMoney < betAmount) {
      return message.reply(getLang("notEnoughMoney")
        .replace("{balance}", userMoney)
        .replace("{bet}", betAmount));
    }

    // Send processing message
    await message.reply(getLang("processing"));

    // Slot symbols
    const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '💎', '7️⃣', '🔔'];
    
    // Generate random result
    const result = [];
    for (let i = 0; i < 9; i++) {
      result.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }

    // Calculate winnings
    let winMultiplier = 0;
    const resultString = `${result[0]} ${result[1]} ${result[2]}\n${result[3]} ${result[4]} ${result[5]}\n${result[6]} ${result[7]} ${result[8]}`;

    // Check for wins
    // Horizontal lines
    if (result[0] === result[1] && result[1] === result[2]) winMultiplier += 2;
    if (result[3] === result[4] && result[4] === result[5]) winMultiplier += 2;
    if (result[6] === result[7] && result[7] === result[8]) winMultiplier += 2;
    
    // Vertical lines
    if (result[0] === result[3] && result[3] === result[6]) winMultiplier += 2;
    if (result[1] === result[4] && result[4] === result[7]) winMultiplier += 2;
    if (result[2] === result[5] && result[5] === result[8]) winMultiplier += 2;
    
    // Diagonal lines
    if (result[0] === result[4] && result[4] === result[8]) winMultiplier += 3;
    if (result[2] === result[4] && result[4] === result[6]) winMultiplier += 3;

    // Jackpot - all same
    if (result.every(symbol => symbol === result[0])) {
      winMultiplier = 50;
    }

    // Create GIF
    const tempDir = path.join(__dirname, 'temp');
    await fs.ensureDir(tempDir);
    const gifPath = path.join(tempDir, `slot_${senderID}_${Date.now()}.gif`);

    const width = 600;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    const encoder = new GIFEncoder(width, height);
    encoder.createReadStream().pipe(fs.createWriteStream(gifPath));
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(100);
    encoder.setQuality(10);

    // Animation frames
    const totalFrames = 30;
    for (let frame = 0; frame < totalFrames; frame++) {
      // Background
      ctx.fillStyle = '#2C3E50';
      ctx.fillRect(0, 0, width, height);

      // Title
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎰 SLOT MACHINE 🎰', width / 2, 60);

      // Draw slot grid
      const slotSize = 150;
      const startX = 75;
      const startY = 120;

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const x = startX + col * (slotSize + 20);
          const y = startY + row * (slotSize + 20);

          // Slot background
          ctx.fillStyle = '#34495E';
          ctx.fillRect(x, y, slotSize, slotSize);
          ctx.strokeStyle = '#FFD700';
          ctx.lineWidth = 4;
          ctx.strokeRect(x, y, slotSize, slotSize);

          // Symbol
          ctx.font = 'bold 80px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const index = row * 3 + col;
          
          if (frame < totalFrames - 5) {
            // Spinning animation
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            ctx.fillText(randomSymbol, x + slotSize / 2, y + slotSize / 2);
          } else {
            // Final result
            ctx.fillText(result[index], x + slotSize / 2, y + slotSize / 2);
          }
        }
      }

      // Bet info
      ctx.fillStyle = '#ECF0F1';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(`💰 BET: ${betAmount}$`, width / 2, height - 40);

      encoder.addFrame(ctx);
    }

    encoder.finish();

    // Calculate final money
    let winAmount = 0;
    let newBalance = userMoney;
    let messageText = "";

    if (winMultiplier > 0) {
      winAmount = betAmount * winMultiplier;
      newBalance = userMoney - betAmount + winAmount;
      
      if (winMultiplier >= 50) {
        messageText = getLang("jackpot")
          .replace("{result}", resultString)
          .replace("{winAmount}", winAmount)
          .replace("{newBalance}", newBalance);
      } else {
        messageText = getLang("win")
          .replace("{result}", resultString)
          .replace("{winAmount}", winAmount)
          .replace("{newBalance}", newBalance);
      }
    } else {
      newBalance = userMoney - betAmount;
      messageText = getLang("lose")
        .replace("{result}", resultString)
        .replace("{betAmount}", betAmount)
        .replace("{newBalance}", newBalance);
    }

    // Update user balance
    await usersData.set(senderID, {
      money: newBalance,
      data: userData.data
    });

    // Send result
    await message.reply({
      body: messageText,
      attachment: fs.createReadStream(gifPath)
    });

    // Clean up
    setTimeout(() => {
      fs.remove(gifPath).catch(console.error);
    }, 60000);
  }
};