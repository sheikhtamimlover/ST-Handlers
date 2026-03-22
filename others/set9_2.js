const { createCanvas, registerFont } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "set9",
    aliases: ["slot9", "slots9"],
    version: "3.0.0",
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
      win: "🎉 CONGRATULATIONS {userName}! 🎉\n\n💰 You won: ${winAmount}\n💵 New balance: ${newBalance}",
      lose: "😢 Better luck next time {userName}!\n\n💸 You lost: ${betAmount}\n💵 Remaining balance: ${newBalance}",
      jackpot: "💎 JACKPOT! JACKPOT! JACKPOT! 💎\n\n🏆 {userName} WON BIG!\n💰 Mega Win: ${winAmount}\n💵 New balance: ${newBalance}",
      processing: "🎰 Spinning the slots... Please wait!"
    }
  },

  onStart: async function({ message, args, event, usersData, getLang, commandName, api }) {
    const { senderID, threadID } = event;

    if (!args[0]) {
      return message.reply(getLang("noBet").replace("{pn}", commandName));
    }

    const betAmount = parseInt(args[0]);
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply(getLang("invalidBet"));
    }

    const userData = await usersData.get(senderID);
    const userName = userData.name || "Player";
    const userMoney = userData.money || 0;

    if (userMoney < betAmount) {
      return message.reply(getLang("notEnoughMoney")
        .replace("{balance}", userMoney)
        .replace("{bet}", betAmount));
    }

    await message.reply(getLang("processing"));

    const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '⭐', '💎', '7️⃣', '🔔'];
    const symbolColors = {
      '🍒': '#FF6B6B',
      '🍋': '#FFD93D',
      '🍊': '#FF8C42',
      '🍇': '#9B59B6',
      '🍉': '#2ECC71',
      '⭐': '#F39C12',
      '💎': '#3498DB',
      '7️⃣': '#E74C3C',
      '🔔': '#F1C40F'
    };
    
    const result = [];
    for (let i = 0; i < 9; i++) {
      result.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }

    let winMultiplier = 0;

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

    const width = 800;
    const height = 900;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    const encoder = new GIFEncoder(width, height);
    const stream = encoder.createReadStream().pipe(fs.createWriteStream(gifPath));
    
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
      
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(100);
      encoder.setQuality(20);

      const totalFrames = 35;
      const spinFrames = 28;
      
      for (let frame = 0; frame < totalFrames; frame++) {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#0a0e27');
        gradient.addColorStop(0.5, '#1a1f3a');
        gradient.addColorStop(1, '#0a0e27');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        const headerGradient = ctx.createLinearGradient(0, 0, 0, 120);
        headerGradient.addColorStop(0, '#FFD700');
        headerGradient.addColorStop(1, '#FFA500');
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, width, 120);

        ctx.fillStyle = '#1a1f3a';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SLOT MACHINE', width / 2, 60);

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`Player: ${userName}`, width / 2, 140);

        const slotSize = 200;
        const gap = 25;
        const startX = (width - (slotSize * 3 + gap * 2)) / 2;
        const startY = 200;

        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            const x = startX + col * (slotSize + gap);
            const y = startY + row * (slotSize + gap);

            const slotGradient = ctx.createRadialGradient(
              x + slotSize / 2, y + slotSize / 2, 0,
              x + slotSize / 2, y + slotSize / 2, slotSize / 2
            );
            slotGradient.addColorStop(0, '#2d3561');
            slotGradient.addColorStop(1, '#1a1f3a');
            ctx.fillStyle = slotGradient;
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 8;
            ctx.shadowOffsetY = 8;
            
            ctx.beginPath();
            ctx.roundRect(x, y, slotSize, slotSize, 20);
            ctx.fill();
            
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            const index = row * 3 + col;
            const stopFrame = spinFrames - (index * 3);
            
            let displaySymbol;
            if (frame < stopFrame) {
              const spinSpeed = Math.floor(frame * 1.5) % symbols.length;
              displaySymbol = symbols[spinSpeed];
            } else {
              displaySymbol = result[index];
            }

            ctx.save();
            
            if (frame < stopFrame) {
              const wobble = Math.sin(frame * 0.8) * 8;
              ctx.translate(x + slotSize / 2 + wobble, y + slotSize / 2);
              const scale = 0.9 + Math.sin(frame * 0.6) * 0.1;
              ctx.scale(scale, scale);
            } else if (frame >= stopFrame && frame < stopFrame + 5) {
              const bounce = Math.abs(Math.sin((frame - stopFrame) * Math.PI / 5)) * 15;
              ctx.translate(x + slotSize / 2, y + slotSize / 2 - bounce);
              const scale = 1 + bounce / 80;
              ctx.scale(scale, scale);
            } else {
              ctx.translate(x + slotSize / 2, y + slotSize / 2);
            }

            ctx.font = 'bold 120px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            ctx.shadowColor = symbolColors[displaySymbol] || '#FFD700';
            ctx.shadowBlur = frame >= stopFrame ? 15 : 5;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(displaySymbol, 0, 0);
            
            ctx.shadowBlur = 0;
            ctx.restore();

            ctx.strokeStyle = frame >= stopFrame ? '#FFD700' : '#4a5568';
            ctx.lineWidth = frame >= stopFrame ? 6 : 4;
            ctx.shadowColor = frame >= stopFrame ? 'rgba(255, 215, 0, 0.6)' : 'transparent';
            ctx.shadowBlur = frame >= stopFrame ? 10 : 0;
            ctx.beginPath();
            ctx.roundRect(x, y, slotSize, slotSize, 20);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
        }

        const infoY = startY + (slotSize + gap) * 3 + 50;
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 40px Arial';
        ctx.fillText(`BET: $${betAmount}`, width / 2, infoY);

        if (frame >= spinFrames) {
          let winAmount = 0;
          if (winMultiplier > 0) {
            winAmount = betAmount * winMultiplier;
            ctx.fillStyle = '#2ECC71';
            ctx.font = 'bold 36px Arial';
            ctx.fillText(`MULTIPLIER: x${winMultiplier}`, width / 2, infoY + 60);
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 42px Arial';
            ctx.fillText(`WIN: $${winAmount}`, width / 2, infoY + 110);
          } else {
            ctx.fillStyle = '#E74C3C';
            ctx.font = 'bold 36px Arial';
            ctx.fillText('NO WIN', width / 2, infoY + 60);
          }
        }

        encoder.addFrame(ctx);
      }

      encoder.finish();
    });

    let winAmount = 0;
    let newBalance = userMoney;
    let messageText = "";

    if (winMultiplier > 0) {
      winAmount = betAmount * winMultiplier;
      newBalance = userMoney - betAmount + winAmount;
      
      if (winMultiplier >= 50) {
        messageText = getLang("jackpot")
          .replace("{userName}", userName)
          .replace("{winAmount}", winAmount)
          .replace("{newBalance}", newBalance);
      } else {
        messageText = getLang("win")
          .replace("{userName}", userName)
          .replace("{winAmount}", winAmount)
          .replace("{newBalance}", newBalance);
      }
    } else {
      newBalance = userMoney - betAmount;
      messageText = getLang("lose")
        .replace("{userName}", userName)
        .replace("{betAmount}", betAmount)
        .replace("{newBalance}", newBalance);
    }

    await usersData.set(senderID, {
      money: newBalance,
      data: userData.data
    });

    api.sendMessage({
      body: messageText,
      attachment: fs.createReadStream(gifPath)
    }, threadID, () => fs.unlinkSync(gifPath));
  }
};