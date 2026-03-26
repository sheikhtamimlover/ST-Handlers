const fs = require("fs-extra");
const path = require("path");
const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");

module.exports = {
  config: {
    name: "jksj",
    aliases: [],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 15,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Animated slot machine spin with realistic physics",
    category: "game",
    guide: "{pn} - Spin the slot machine"
  },
  langs: {
    en: {
      spinning: "🎰 Spinning the slot machine...",
      win: "🎉 JACKPOT! You won {amount}!",
      lose: "💔 Better luck next time! You lost {amount}!",
      smallWin: "✨ Nice! You won {amount}!",
      error: "❌ Error: {error}"
    }
  },
  ST: async function({ message, args, event, api, getLang, usersData }) {
    try {
      const { senderID } = event;
      const betAmount = 100;
      
      const userData = await usersData.get(senderID);
      const currentMoney = userData?.money || 0;
      
      if (currentMoney < betAmount) {
        return message.reply(`❌ You need at least $${betAmount} to play!`);
      }

      await message.reply(getLang("spinning"));

      const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "⭐", "🔔"];
      const outputPath = path.join(__dirname, `temp_spin_${Date.now()}.gif`);
      
      const width = 600;
      const height = 400;
      const frames = 120;
      
      const encoder = new GIFEncoder(width, height);
      encoder.createReadStream().pipe(fs.createWriteStream(outputPath));
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(30);
      encoder.setQuality(20);
      
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      const finalSymbols = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];
      
      const isWin = finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2];
      const isSmallWin = finalSymbols[0] === finalSymbols[1] || finalSymbols[1] === finalSymbols[2];
      
      const reelStops = [
        60 + Math.floor(Math.random() * 10),
        75 + Math.floor(Math.random() * 10),
        90 + Math.floor(Math.random() * 10)
      ];
      
      const reelPositions = [0, 0, 0];
      const reelVelocities = [30, 30, 30];
      
      for (let i = 0; i < frames; i++) {
        const t = i / frames;
        
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, "#1a0033");
        bgGradient.addColorStop(0.5, "#2d0055");
        bgGradient.addColorStop(1, "#1a0033");
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = "#4a0080";
        ctx.fillRect(50, 80, 500, 240);
        
        const glowIntensity = Math.sin(t * Math.PI * 8) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(255, 215, 0, ${glowIntensity})`;
        ctx.lineWidth = 4;
        ctx.strokeRect(50, 80, 500, 240);
        
        ctx.fillStyle = "#fff";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🎰 SLOT MACHINE 🎰", width / 2, 50);
        
        for (let r = 0; r < 3; r++) {
          if (i < reelStops[r]) {
            const deceleration = i > reelStops[r] - 20 ? 0.92 : 0.98;
            reelVelocities[r] *= deceleration;
            reelPositions[r] += reelVelocities[r];
          } else {
            const targetIndex = symbols.indexOf(finalSymbols[r]);
            const snapPosition = targetIndex * 80;
            reelPositions[r] = snapPosition;
          }
          
          const x = 100 + r * 166;
          
          ctx.save();
          ctx.beginPath();
          ctx.rect(x - 60, 100, 120, 200);
          ctx.clip();
          
          ctx.fillStyle = "#2a0050";
          ctx.fillRect(x - 60, 100, 120, 200);
          
          for (let s = 0; s < symbols.length * 3; s++) {
            const symbolY = 150 + (s * 80 - reelPositions[r] % (symbols.length * 80));
            const symbol = symbols[s % symbols.length];
            
            if (symbolY > 50 && symbolY < 350) {
              const distanceFromCenter = Math.abs(symbolY - 200);
              const scale = 1 - (distanceFromCenter / 200) * 0.3;
              const alpha = 1 - (distanceFromCenter / 200) * 0.5;
              
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.font = `${60 * scale}px Arial`;
              ctx.textAlign = "center";
              ctx.fillStyle = "#fff";
              ctx.fillText(symbol, x, symbolY);
              ctx.restore();
            }
          }
          
          ctx.restore();
          
          ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 60, 100, 120, 200);
        }
        
        ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(70, 180, 460, 80);
        ctx.setLineDash([]);
        
        if (i >= frames - 30) {
          const flashIntensity = Math.sin((i - (frames - 30)) * 0.5) * 0.5 + 0.5;
          
          if (isWin) {
            ctx.fillStyle = `rgba(255, 215, 0, ${flashIntensity * 0.3})`;
            ctx.fillRect(0, 0, width, height);
            
            ctx.font = "bold 40px Arial";
            ctx.fillStyle = `rgba(255, 215, 0, ${flashIntensity})`;
            ctx.textAlign = "center";
            ctx.fillText("🎉 JACKPOT! 🎉", width / 2, 360);
          } else if (isSmallWin) {
            ctx.fillStyle = `rgba(100, 255, 100, ${flashIntensity * 0.2})`;
            ctx.fillRect(0, 0, width, height);
            
            ctx.font = "bold 32px Arial";
            ctx.fillStyle = `rgba(100, 255, 100, ${flashIntensity})`;
            ctx.textAlign = "center";
            ctx.fillText("✨ NICE! ✨", width / 2, 360);
          }
        }
        
        encoder.addFrame(ctx);
      }
      
      encoder.finish();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let resultMoney;
      let resultMessage;
      
      if (isWin) {
        resultMoney = betAmount * 10;
        await usersData.set(senderID, {
          money: currentMoney + resultMoney,
          data: userData.data
        });
        resultMessage = getLang("win", { amount: `$${resultMoney}` });
      } else if (isSmallWin) {
        resultMoney = betAmount * 2;
        await usersData.set(senderID, {
          money: currentMoney + resultMoney - betAmount,
          data: userData.data
        });
        resultMessage = getLang("smallWin", { amount: `$${resultMoney - betAmount}` });
      } else {
        resultMoney = betAmount;
        await usersData.set(senderID, {
          money: currentMoney - betAmount,
          data: userData.data
        });
        resultMessage = getLang("lose", { amount: `$${betAmount}` });
      }
      
      const stream = fs.createReadStream(outputPath);
      
      await message.reply({
        body: `${resultMessage}\n\nResult: ${finalSymbols.join(" | ")}\n💰 Balance: $${isWin ? currentMoney + resultMoney : isSmallWin ? currentMoney + resultMoney - betAmount : currentMoney - betAmount}`,
        attachment: stream
      });
      
      setTimeout(() => {
        fs.unlink(outputPath).catch(err => console.error("Cleanup error:", err));
      }, 5000);
      
    } catch (error) {
      console.error("JKSJ Error:", error);
      return message.reply(getLang("error", { error: error.message || "Failed to create slot spin" }));
    }
  }
};