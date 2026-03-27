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
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Professional slot machine with realistic spin physics",
    category: "game",
    guide: "{pn} - Spin the slot machine"
  },
  
  langs: {
    en: {
      spinning: "🎰 Spinning the slot machine...",
      jackpot: "🎉 JACKPOT! You won {amount}!",
      win: "✨ You won {amount}!",
      lose: "💔 Better luck next time! Lost {amount}",
      error: "❌ Error: {error}",
      needMoney: "❌ You need at least ${amount} to play!"
    }
  },

  ST: async function({ message, event, getLang, usersData }) {
    try {
      const { senderID } = event;
      const betAmount = 100;
      
      const userData = await usersData.get(senderID);
      const currentMoney = userData?.money || 0;
      
      if (currentMoney < betAmount) {
        return message.reply(getLang("needMoney", { amount: betAmount }));
      }

      await message.reply(getLang("spinning"));

      const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "⭐"];
      const width = 700;
      const height = 450;
      const frames = 100;
      
      const cachePath = path.join(__dirname, "cache");
      await fs.ensureDir(cachePath);
      const gifPath = path.join(cachePath, `slot_${Date.now()}.gif`);
      
      const encoder = new GIFEncoder(width, height);
      const writeStream = fs.createWriteStream(gifPath);
      encoder.createReadStream().pipe(writeStream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(25);
      encoder.setQuality(15);

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      const finalSymbols = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];
      
      const isJackpot = finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2];
      const isWin = !isJackpot && (finalSymbols[0] === finalSymbols[1] || finalSymbols[1] === finalSymbols[2] || finalSymbols[0] === finalSymbols[2]);
      
      const reelStopFrames = [60, 75, 90];
      const reelPositions = [0, 0, 0];
      const reelVelocities = [35, 35, 35];
      const symbolHeight = 90;
      
      for (let frame = 0; frame < frames; frame++) {
        const bg = ctx.createLinearGradient(0, 0, 0, height);
        bg.addColorStop(0, "#0a0015");
        bg.addColorStop(0.5, "#1a0030");
        bg.addColorStop(1, "#0a0015");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);
        
        const borderGlow = Math.sin(frame * 0.15) * 0.4 + 0.6;
        const grd = ctx.createLinearGradient(0, 0, width, 0);
        grd.addColorStop(0, `rgba(255, 215, 0, ${borderGlow})`);
        grd.addColorStop(0.5, `rgba(255, 100, 255, ${borderGlow})`);
        grd.addColorStop(1, `rgba(100, 200, 255, ${borderGlow})`);
        ctx.strokeStyle = grd;
        ctx.lineWidth = 6;
        ctx.strokeRect(20, 20, width - 40, height - 40);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
        ctx.shadowBlur = 15;
        ctx.fillText("🎰 LUXURY SLOTS 🎰", width / 2, 60);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = "rgba(30, 0, 60, 0.9)";
        ctx.fillRect(40, 100, width - 80, 250);
        
        for (let i = 0; i < 3; i++) {
          const reelX = 80 + i * 200;
          const reelY = 120;
          const reelWidth = 160;
          const reelHeight = 210;
          
          if (frame < reelStopFrames[i]) {
            const slowdown = frame > reelStopFrames[i] - 25 ? 0.90 : 0.985;
            reelVelocities[i] *= slowdown;
            reelPositions[i] += reelVelocities[i];
          } else {
            const targetIdx = symbols.indexOf(finalSymbols[i]);
            reelPositions[i] = targetIdx * symbolHeight;
          }
          
          ctx.save();
          ctx.beginPath();
          ctx.rect(reelX, reelY, reelWidth, reelHeight);
          ctx.clip();
          
          const reelBg = ctx.createLinearGradient(reelX, reelY, reelX, reelY + reelHeight);
          reelBg.addColorStop(0, "#1a0040");
          reelBg.addColorStop(0.5, "#2a0060");
          reelBg.addColorStop(1, "#1a0040");
          ctx.fillStyle = reelBg;
          ctx.fillRect(reelX, reelY, reelWidth, reelHeight);
          
          for (let j = 0; j < symbols.length * 4; j++) {
            const symbolY = reelY + 105 + (j * symbolHeight - reelPositions[i] % (symbols.length * symbolHeight));
            const symbol = symbols[j % symbols.length];
            
            if (symbolY > reelY - 50 && symbolY < reelY + reelHeight + 50) {
              const centerDist = Math.abs(symbolY - (reelY + reelHeight / 2));
              const scale = Math.max(0.5, 1 - (centerDist / 150) * 0.5);
              const alpha = Math.max(0.3, 1 - (centerDist / 150) * 0.7);
              
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.font = `bold ${70 * scale}px Arial`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              
              ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
              ctx.shadowBlur = 10 * scale;
              ctx.fillStyle = "#ffffff";
              ctx.fillText(symbol, reelX + reelWidth / 2, symbolY);
              ctx.shadowBlur = 0;
              ctx.restore();
            }
          }
          
          ctx.restore();
          
          const stopped = frame >= reelStopFrames[i];
          const reelGlow = stopped ? Math.sin(frame * 0.2) * 0.5 + 0.5 : 0.3;
          ctx.strokeStyle = stopped ? `rgba(0, 255, 100, ${reelGlow})` : "rgba(100, 100, 150, 0.5)";
          ctx.lineWidth = stopped ? 4 : 2;
          ctx.strokeRect(reelX, reelY, reelWidth, reelHeight);
        }
        
        ctx.setLineDash([10, 5]);
        ctx.strokeStyle = "rgba(255, 215, 0, 0.7)";
        ctx.lineWidth = 3;
        ctx.strokeRect(90, 205, 520, 100);
        ctx.setLineDash([]);
        
        if (frame >= 90) {
          const winPulse = Math.sin((frame - 90) * 0.3) * 0.5 + 0.5;
          
          if (isJackpot) {
            ctx.fillStyle = `rgba(255, 215, 0, ${winPulse * 0.4})`;
            ctx.fillRect(0, 0, width, height);
            
            ctx.font = "bold 50px Arial";
            ctx.fillStyle = `rgba(255, 215, 0, ${winPulse})`;
            ctx.textAlign = "center";
            ctx.shadowColor = "rgba(255, 215, 0, 0.9)";
            ctx.shadowBlur = 20;
            ctx.fillText("🎉 JACKPOT! 🎉", width / 2, 390);
            ctx.shadowBlur = 0;
          } else if (isWin) {
            ctx.fillStyle = `rgba(100, 255, 150, ${winPulse * 0.3})`;
            ctx.fillRect(0, 0, width, height);
            
            ctx.font = "bold 40px Arial";
            ctx.fillStyle = `rgba(100, 255, 150, ${winPulse})`;
            ctx.textAlign = "center";
            ctx.shadowColor = "rgba(100, 255, 150, 0.8)";
            ctx.shadowBlur = 15;
            ctx.fillText("✨ WINNER! ✨", width / 2, 390);
            ctx.shadowBlur = 0;
          }
        }
        
        encoder.addFrame(ctx);
      }
      
      encoder.finish();
      
      await new Promise(resolve => writeStream.on("finish", resolve));
      
      let winAmount, resultMsg;
      
      if (isJackpot) {
        winAmount = betAmount * 10;
        await usersData.set(senderID, {
          money: currentMoney + winAmount,
          data: userData.data
        });
        resultMsg = getLang("jackpot", { amount: `$${winAmount}` });
      } else if (isWin) {
        winAmount = betAmount * 3;
        await usersData.set(senderID, {
          money: currentMoney + winAmount - betAmount,
          data: userData.data
        });
        resultMsg = getLang("win", { amount: `$${winAmount - betAmount}` });
      } else {
        await usersData.set(senderID, {
          money: currentMoney - betAmount,
          data: userData.data
        });
        resultMsg = getLang("lose", { amount: `$${betAmount}` });
      }
      
      const attachment = fs.createReadStream(gifPath);
      
      await message.reply({
        body: `${resultMsg}\n\n🎰 Result: ${finalSymbols.join(" | ")}\n💰 Balance: $${isJackpot ? currentMoney + winAmount : isWin ? currentMoney + winAmount - betAmount : currentMoney - betAmount}`,
        attachment: attachment
      });
      
      setTimeout(() => {
        fs.unlink(gifPath).catch(() => {});
      }, 10000);
      
    } catch (error) {
      console.error("Slot error:", error);
      return message.reply(getLang("error", { error: error.message || "Unknown error" }));
    }
  }
};