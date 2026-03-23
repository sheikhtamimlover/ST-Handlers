const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "hexslot",
    aliases: ["hslot", "hexagon"],
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Play hexagonal slot machine with beautiful animations!",
    category: "game",
    guide: "{pn} <bet amount> - Spin the hexagonal slots!"
  },

  langs: {
    en: {
      noBet: "❌ Please provide a bet amount!\nUsage: {pn} <amount>",
      invalidBet: "❌ Invalid bet amount! Please enter a valid number.",
      notEnoughMoney: "❌ You don't have enough money!\n💰 Your balance: ${balance}\n💸 Bet amount: ${bet}",
      processing: "🎰 Spinning hexagonal slots... Please wait!"
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

    const symbolNames = ['CHERRY', 'LEMON', 'ORANGE', 'GRAPE', 'MELON', 'STAR', 'DIAMOND', 'SEVEN', 'BELL'];
    const symbolColors = {
      'CHERRY': '#FF6B6B',
      'LEMON': '#FFD93D',
      'ORANGE': '#FF8C42',
      'GRAPE': '#9B59B6',
      'MELON': '#2ECC71',
      'STAR': '#F39C12',
      'DIAMOND': '#3498DB',
      'SEVEN': '#E74C3C',
      'BELL': '#F1C40F'
    };

    const result = [];
    for (let i = 0; i < 7; i++) {
      result.push(symbolNames[Math.floor(Math.random() * symbolNames.length)]);
    }

    let winMultiplier = 0;
    
    if (result[0] === result[1] && result[1] === result[2]) winMultiplier += 3;
    if (result[3] === result[4] && result[4] === result[5]) winMultiplier += 3;
    if (result[0] === result[3] && result[3] === result[6]) winMultiplier += 4;
    if (result[1] === result[4]) winMultiplier += 2;
    if (result[2] === result[5]) winMultiplier += 2;

    if (result.every(symbol => symbol === result[0])) {
      winMultiplier = 100;
    }

    const tempDir = path.join(__dirname, 'temp');
    await fs.ensureDir(tempDir);
    const gifPath = path.join(tempDir, `hexslot_${senderID}_${Date.now()}.gif`);

    const width = 1000;
    const height = 1100;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    function drawHexagon(x, y, size, fillColor, strokeColor = '#FFD700', lineWidth = 4) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      
      if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
      }
      
      if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    }

    function drawSymbolText(x, y, symbol, size, color) {
      ctx.font = `bold ${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      ctx.fillText(symbol, x, y);
      ctx.shadowBlur = 0;
    }

    const encoder = new GIFEncoder(width, height);
    const stream = encoder.createReadStream().pipe(fs.createWriteStream(gifPath));

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);

      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(90);
      encoder.setQuality(15);

      const totalFrames = 45;
      const spinFrames = 35;

      let winAmount = 0;
      if (winMultiplier > 0) {
        winAmount = betAmount * winMultiplier;
      }
      const newBalance = userMoney - betAmount + winAmount;

      const hexPositions = [
        { x: width / 2, y: 280 },
        { x: width / 2 - 130, y: 360 },
        { x: width / 2 + 130, y: 360 },
        { x: width / 2, y: 440 },
        { x: width / 2 - 130, y: 520 },
        { x: width / 2 + 130, y: 520 },
        { x: width / 2, y: 600 }
      ];

      for (let frame = 0; frame < totalFrames; frame++) {
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, '#0f0c29');
        bgGradient.addColorStop(0.5, '#302b63');
        bgGradient.addColorStop(1, '#24243e');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        const headerGradient = ctx.createLinearGradient(0, 0, width, 160);
        headerGradient.addColorStop(0, '#f093fb');
        headerGradient.addColorStop(0.5, '#f5576c');
        headerGradient.addColorStop(1, '#4facfe');
        ctx.fillStyle = headerGradient;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.fillRect(0, 0, width, 160);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 56px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText('HEXAGONAL SLOTS', width / 2, 60);
        ctx.shadowBlur = 0;

        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`Player: ${userName}`, width / 2, 120);

        for (let i = 0; i < 7; i++) {
          const pos = hexPositions[i];
          const stopFrame = spinFrames - (i * 4);

          let displaySymbol;
          if (frame < stopFrame) {
            const spinSpeed = Math.floor(frame * 2) % symbolNames.length;
            displaySymbol = symbolNames[spinSpeed];
          } else {
            displaySymbol = result[i];
          }

          const hexSize = 65;
          let scale = 1;
          let glowIntensity = 0;

          if (frame < stopFrame) {
            scale = 0.95 + Math.sin(frame * 0.5) * 0.05;
          } else if (frame >= stopFrame && frame < stopFrame + 6) {
            const bounceProgress = (frame - stopFrame) / 6;
            scale = 1 + Math.sin(bounceProgress * Math.PI) * 0.15;
            glowIntensity = Math.sin(bounceProgress * Math.PI) * 20;
          } else {
            scale = 1;
            glowIntensity = 5;
          }

          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.scale(scale, scale);

          const hexGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, hexSize);
          hexGradient.addColorStop(0, symbolColors[displaySymbol] + '40');
          hexGradient.addColorStop(1, symbolColors[displaySymbol] + '10');

          if (frame >= stopFrame) {
            ctx.shadowColor = symbolColors[displaySymbol];
            ctx.shadowBlur = 20 + glowIntensity;
          }

          drawHexagon(0, 0, hexSize, hexGradient, 
            frame >= stopFrame ? '#FFD700' : '#4a5568', 
            frame >= stopFrame ? 5 : 3);

          ctx.shadowBlur = 0;

          drawSymbolText(0, 0, displaySymbol.substring(0, 3), 28, 
            frame >= stopFrame ? '#FFFFFF' : '#CCCCCC');

          ctx.restore();
        }

        const infoY = 700;

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.fillText(`BET: $${betAmount}`, width / 2, infoY);
        ctx.shadowBlur = 0;

        if (frame >= spinFrames + 3) {
          const resultY = infoY + 80;

          if (winMultiplier > 0) {
            if (winMultiplier >= 100) {
              const pulseScale = 1 + Math.sin((frame - spinFrames) * 0.3) * 0.1;
              ctx.save();
              ctx.translate(width / 2, resultY);
              ctx.scale(pulseScale, pulseScale);

              ctx.fillStyle = '#FFD700';
              ctx.font = 'bold 64px Arial';
              ctx.shadowColor = '#FFD700';
              ctx.shadowBlur = 30;
              ctx.fillText('JACKPOT!!!', 0, 0);
              ctx.shadowBlur = 0;
              ctx.restore();

              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 52px Arial';
              ctx.fillText(`WIN: $${winAmount}`, width / 2, resultY + 80);
            } else {
              const gradient = ctx.createLinearGradient(0, resultY, 0, resultY + 100);
              gradient.addColorStop(0, '#2ECC71');
              gradient.addColorStop(1, '#27AE60');
              ctx.fillStyle = gradient;
              ctx.font = 'bold 48px Arial';
              ctx.fillText(`MULTIPLIER: x${winMultiplier}`, width / 2, resultY);

              ctx.fillStyle = '#FFD700';
              ctx.font = 'bold 52px Arial';
              ctx.fillText(`WIN: $${winAmount}`, width / 2, resultY + 70);
            }

            ctx.fillStyle = '#4ecca3';
            ctx.font = 'bold 42px Arial';
            ctx.fillText(`NEW BALANCE: $${newBalance}`, width / 2, resultY + 140);
          } else {
            ctx.fillStyle = '#E74C3C';
            ctx.font = 'bold 48px Arial';
            ctx.shadowColor = 'rgba(231, 76, 60, 0.5)';
            ctx.shadowBlur = 15;
            ctx.fillText('NO WIN', width / 2, resultY);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#95a5a6';
            ctx.font = 'bold 40px Arial';
            ctx.fillText(`BALANCE: $${newBalance}`, width / 2, resultY + 70);
          }

          ctx.fillStyle = '#ecf0f1';
          ctx.font = 'bold 32px Arial';
          ctx.fillText('Good Luck Next Time!', width / 2, height - 60);
        }

        encoder.addFrame(ctx);
      }

      encoder.finish();
    });

    let winAmount = 0;
    let newBalance = userMoney;

    if (winMultiplier > 0) {
      winAmount = betAmount * winMultiplier;
      newBalance = userMoney - betAmount + winAmount;
    } else {
      newBalance = userMoney - betAmount;
    }

    await usersData.set(senderID, {
      money: newBalance,
      data: userData.data
    });

    api.sendMessage({
      attachment: fs.createReadStream(gifPath)
    }, threadID, () => fs.unlinkSync(gifPath));
  }
};