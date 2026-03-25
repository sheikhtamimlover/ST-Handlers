const fs = require('fs-extra');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');

module.exports = {
  config: {
    name: "slotmachine",
    aliases: ["slot", "slots"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 15,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Play an animated slot machine game and win money",
    category: "game",
    guide: "{pn} <amount> - Bet money and spin the slot machine\nExample: {pn} 100"
  },

  langs: {
    en: {
      notEnoughMoney: "❌ You don't have enough money! You have $%1",
      invalidAmount: "❌ Please enter a valid bet amount!\nExample: slot 100",
      minBet: "❌ Minimum bet is $10!",
      spinning: "🎰 Spinning the slot machine...",
      jackpot: "🎊 JACKPOT! You won $%1!",
      bigWin: "🎉 BIG WIN! You won $%1!",
      win: "✨ You won $%1!",
      lose: "😔 You lost $%1. Better luck next time!"
    }
  },

  ST: async function({ message, args, event, usersData, getLang }) {
    try {
      const betAmount = parseInt(args[0]);
      const userData = await usersData.get(event.senderID);
      
      if (!betAmount || isNaN(betAmount)) {
        return message.reply(getLang("invalidAmount"));
      }
      
      if (betAmount < 10) {
        return message.reply(getLang("minBet"));
      }
      
      if (userData.money < betAmount) {
        return message.reply(getLang("notEnoughMoney", userData.money.toLocaleString()));
      }

      message.reply(getLang("spinning"));

      // Slot symbols with proper emoji-style icons
      const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '⭐'];
      const symbolValues = {
        '🍒': 1.5,
        '🍋': 2,
        '🍊': 2.5,
        '🍇': 3,
        '💎': 5,
        '7️⃣': 10,
        '⭐': 15
      };

      // Generate random result
      const result = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];

      // Calculate winnings
      let winMultiplier = 0;
      let winMessage = "";
      
      if (result[0] === result[1] && result[1] === result[2]) {
        // All three match - JACKPOT
        winMultiplier = symbolValues[result[0]] * 3;
        winMessage = result[0] === '⭐' ? getLang("jackpot", (betAmount * winMultiplier).toLocaleString()) : getLang("bigWin", (betAmount * winMultiplier).toLocaleString());
      } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
        // Two match
        const matchedSymbol = result[0] === result[1] ? result[0] : (result[1] === result[2] ? result[1] : result[0]);
        winMultiplier = symbolValues[matchedSymbol];
        winMessage = getLang("win", (betAmount * winMultiplier).toLocaleString());
      } else {
        // No match - lose
        winMessage = getLang("lose", betAmount.toLocaleString());
      }

      // Canvas setup
      const width = 600;
      const height = 400;
      const encoder = new GIFEncoder(width, height);
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Setup GIF encoder
      const stream = encoder.createReadStream();
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(80);
      encoder.setQuality(10);

      // Animation frames
      const totalFrames = 30;
      const spinSymbols = [[], [], []]; // Store spinning symbols for each reel
      
      // Populate initial spinning symbols
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 10; j++) {
          spinSymbols[i].push(symbols[Math.floor(Math.random() * symbols.length)]);
        }
        spinSymbols[i].push(result[i]); // Final result at the end
      }

      for (let frame = 0; frame < totalFrames; frame++) {
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Decorative background elements
        ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
        ctx.beginPath();
        ctx.arc(50, 50, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(550, 350, 100, 0, Math.PI * 2);
        ctx.fill();

        // Main slot machine frame
        ctx.fillStyle = '#2d3561';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        roundRect(ctx, 50, 80, 500, 280, 20);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Title bar
        const titleGradient = ctx.createLinearGradient(50, 80, 550, 80);
        titleGradient.addColorStop(0, '#ffd700');
        titleGradient.addColorStop(0.5, '#ffed4e');
        titleGradient.addColorStop(1, '#ffd700');
        ctx.fillStyle = titleGradient;
        roundRect(ctx, 50, 80, 500, 60, 20, true, false, false, false);
        ctx.fill();

        // Title text
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎰 SLOT MACHINE 🎰', 300, 120);

        // Bet amount display
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`BET: $${betAmount.toLocaleString()}`, 300, 165);

        // Slot reels background
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = '#1a1a2e';
          roundRect(ctx, 90 + (i * 140), 190, 120, 130, 10);
          ctx.fill();
          
          // Reel border
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 3;
          roundRect(ctx, 90 + (i * 140), 190, 120, 130, 10);
          ctx.stroke();
        }

        // Draw spinning symbols
        for (let i = 0; i < 3; i++) {
          const stopFrame = 20 + (i * 3); // Each reel stops at different time
          const isSpinning = frame < stopFrame;
          
          if (isSpinning) {
            // Calculate spinning position
            const spinSpeed = 3;
            const offset = (frame * spinSpeed * 60) % (spinSymbols[i].length * 60);
            const index = Math.floor(offset / 60);
            const yOffset = -(offset % 60);
            
            // Draw current and next symbol
            ctx.font = '64px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            
            // Current symbol
            ctx.fillText(spinSymbols[i][index % spinSymbols[i].length], 150 + (i * 140), 255 + yOffset);
            // Next symbol
            ctx.fillText(spinSymbols[i][(index + 1) % spinSymbols[i].length], 150 + (i * 140), 315 + yOffset);
            
          } else {
            // Stopped - show final result
            ctx.font = '72px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            
            // Add bouncing effect when stopped
            const bounceOffset = frame < stopFrame + 3 ? Math.sin((frame - stopFrame) * Math.PI) * 10 : 0;
            ctx.fillText(result[i], 150 + (i * 140), 255 - bounceOffset);
          }
        }

        // Win/Lose indicator (show on last frames)
        if (frame > 25) {
          const alpha = (frame - 25) / 5;
          ctx.globalAlpha = alpha;
          
          if (winMultiplier > 0) {
            // Win background
            ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
            roundRect(ctx, 100, 340, 400, 50, 10);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`WIN: $${(betAmount * winMultiplier).toLocaleString()}`, 300, 367);
          } else {
            // Lose background
            ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
            roundRect(ctx, 100, 340, 400, 50, 10);
            ctx.fill();
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`LOST: $${betAmount.toLocaleString()}`, 300, 367);
          }
          ctx.globalAlpha = 1;
        }

        // Decorative lights animation
        for (let i = 0; i < 8; i++) {
          const lightAngle = (i / 8) * Math.PI * 2;
          const lightX = 300 + Math.cos(lightAngle + (frame * 0.1)) * 260;
          const lightY = 220 + Math.sin(lightAngle + (frame * 0.1)) * 160;
          
          ctx.fillStyle = `rgba(255, 215, 0, ${0.3 + Math.sin(frame * 0.3 + i) * 0.3})`;
          ctx.beginPath();
          ctx.arc(lightX, lightY, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        encoder.addFrame(ctx);
      }

      encoder.finish();

      // Update user money
      const finalAmount = winMultiplier > 0 ? 
        userData.money - betAmount + (betAmount * winMultiplier) : 
        userData.money - betAmount;
      
      await usersData.set(event.senderID, {
        money: Math.floor(finalAmount),
        data: userData.data
      });

      // Save and send
      const buffer = await streamToBuffer(stream);
      const pathSave = `${__dirname}/tmp/slot_${event.senderID}.gif`;
      await fs.outputFile(pathSave, buffer);

      await message.reply({
        body: `${winMessage}\n━━━━━━━━━━━━━━━━\n🎰 Result: ${result.join(' | ')}\n💰 Balance: $${Math.floor(finalAmount).toLocaleString()}`,
        attachment: fs.createReadStream(pathSave)
      });

      await fs.remove(pathSave);

    } catch (error) {
      console.error(error);
      message.reply("❌ An error occurred while playing the slot machine!");
    }
  }
};

// Helper functions
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

function roundRect(ctx, x, y, width, height, radius, tl = true, tr = true, br = true, bl = true) {
  ctx.beginPath();
  ctx.moveTo(x + (tl ? radius : 0), y);
  ctx.lineTo(x + width - (tr ? radius : 0), y);
  if (tr) ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - (br ? radius : 0));
  if (br) ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + (bl ? radius : 0), y + height);
  if (bl) ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + (tl ? radius : 0));
  if (tl) ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}