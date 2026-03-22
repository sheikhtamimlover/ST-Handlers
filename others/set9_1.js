const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "set9",
    aliases: ["slot9", "slots9"],
    version: "2.0.0",
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
      win: "🎉 CONGRATULATIONS! 🎉\n\n🎰 Result:\n{result}\n\n💰 You won: {winAmount}$\n💵 New balance: {newBalance}$",
      lose: "😢 Better luck next time!\n\n🎰 Result:\n{result}\n\n💸 You lost: {betAmount}$\n💵 Remaining balance: {newBalance}$",
      jackpot: "💎 JACKPOT! JACKPOT! JACKPOT! 💎\n\n🎰 Result:\n{result}\n\n🏆 MEGA WIN: {winAmount}$\n💰 New balance: {newBalance}$",
      processing: "🎰 Spinning the slots... Please wait!"
    }
  },

  onStart: async function({ message, args, event, usersData, getLang, commandName }) {
    const { senderID } = event;

    if (!args[0]) {
      return message.reply(getLang("noBet").replace("{pn}", commandName));
    }

    const betAmount = parseInt(args[0]);
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply(getLang("invalidBet"));
    }

    const userData = await usersData.get(senderID);
    const userMoney = userData.money || 0;

    if (userMoney < betAmount) {
      return message.reply(getLang("notEnoughMoney")
        .replace("{balance}", userMoney)
        .replace("{bet}", betAmount));
    }

    const processingMsg = await message.reply(getLang("processing"));

    const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '💎', '7️⃣', '🔔'];
    
    const result = [];
    for (let i = 0; i < 9; i++) {
      result.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }

    let winMultiplier = 0;
    const resultString = `${result[0]} ${result[1]} ${result[2]}\n${result[3]} ${result[4]} ${result[5]}\n${result[6]} ${result[7]} ${result[8]}`;

    if (result[0] === result[1] && result[1] === result[2]) winMultiplier += 2;
    if (result[3] === result[4] && result[4] === result[5]) winMultiplier += 2;
    if (result[6] === result[7] && result[7] === result[8]) winMultiplier += 2;
    if (result[0] === result[3] && result[3] === result[6]) winMultiplier += 2;
    if (result[1] === result[4] && result[4] === result[7]) winMultiplier += 2;
    if (result[2] === result[5] && result[5] === result[8]) winMultiplier += 2;
    if (result[0] === result[4] && result[4] === result[8]) winMultiplier += 3;
    if (result[2] === result[4] && result[4] === result[6]) winMultiplier += 3;

    if (result.every(symbol => symbol === result[0])) {
      winMultiplier = 50;
    }

    const tempDir = path.join(__dirname, 'temp');
    await fs.ensureDir(tempDir);
    const gifPath = path.join(tempDir, `slot_${senderID}_${Date.now()}.gif`);

    const width = 700;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    const encoder = new GIFEncoder(width, height);
    encoder.createReadStream().pipe(fs.createWriteStream(gifPath));
    encoder.start();
    encoder.setRepeat(0);
    encoder.setDelay(80);
    encoder.setQuality(10);

    const totalFrames = 40;
    const spinFrames = 32;
    
    for (let frame = 0; frame < totalFrames; frame++) {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(0.5, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(0, 0, width, 100);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#1a1a2e';
      ctx.font = 'bold 50px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎰 SLOT MACHINE 🎰', width / 2, 70);

      const slotSize = 180;
      const gap = 20;
      const startX = (width - (slotSize * 3 + gap * 2)) / 2;
      const startY = 140;

      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const x = startX + col * (slotSize + gap);
          const y = startY + row * (slotSize + gap);

          const slotGradient = ctx.createLinearGradient(x, y, x, y + slotSize);
          slotGradient.addColorStop(0, '#2d4059');
          slotGradient.addColorStop(1, '#1a2332');
          ctx.fillStyle = slotGradient;
          
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 5;
          ctx.shadowOffsetY = 5;
          
          ctx.beginPath();
          ctx.roundRect(x, y, slotSize, slotSize, 15);
          ctx.fill();
          
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;

          const index = row * 3 + col;
          const stopFrame = spinFrames - (index * 2);
          
          let displaySymbol;
          if (frame < stopFrame) {
            const spinSpeed = Math.floor(frame / 2) % symbols.length;
            displaySymbol = symbols[spinSpeed];
            
            const wobble = Math.sin(frame * 0.5) * 5;
            ctx.save();
            ctx.translate(x + slotSize / 2 + wobble, y + slotSize / 2);
          } else {
            displaySymbol = result[index];
            
            if (frame >= stopFrame && frame < stopFrame + 4) {
              const bounce = Math.sin((frame - stopFrame) * Math.PI / 4) * 10;
              ctx.save();
              ctx.translate(x + slotSize / 2, y + slotSize / 2 - bounce);
              ctx.scale(1 + bounce / 100, 1 + bounce / 100);
            } else {
              ctx.save();
              ctx.translate(x + slotSize / 2, y + slotSize / 2);
            }
          }

          ctx.font = 'bold 100px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#FFD700';
          ctx.fillText(displaySymbol, 0, 0);
          ctx.restore();

          ctx.strokeStyle = frame >= stopFrame ? '#FFD700' : '#4a5568';
          ctx.lineWidth = frame >= stopFrame ? 5 : 3;
          ctx.beginPath();
          ctx.roundRect(x, y, slotSize, slotSize, 15);
          ctx.stroke();
        }
      }

      const infoY = startY + (slotSize + gap) * 3 + 40;
      
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(`💰 BET: ${betAmount}$`, width / 2, infoY);

      if (frame >= spinFrames) {
        ctx.fillStyle = '#4ecca3';
        ctx.font = 'bold 32px Arial';
        if (winMultiplier > 0) {
          ctx.fillText(`🎉 MULTIPLIER: x${winMultiplier}`, width / 2, infoY + 60);
        } else {
          ctx.fillStyle = '#e94560';
          ctx.fillText('😢 NO WIN', width / 2, infoY + 60);
        }
      }

      encoder.addFrame(ctx);
    }

    encoder.finish();

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

    await usersData.set(senderID, {
      money: newBalance,
      data: userData.data
    });

    await message.reply({
      body: messageText,
      attachment: fs.createReadStream(gifPath)
    });

    setTimeout(() => {
      fs.remove(gifPath).catch(console.error);
    }, 60000);
  }
};