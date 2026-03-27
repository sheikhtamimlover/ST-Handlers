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

      const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "⭐", "🔔"];
      const width = 800;
      const height = 500;
      const frames = 120;
      
      const cachePath = path.join(__dirname, "cache");
      await fs.ensureDir(cachePath);
      const gifPath = path.join(cachePath, `slot_${Date.now()}.gif`);
      
      const encoder = new GIFEncoder(width, height);
      const writeStream = fs.createWriteStream(gifPath);
      encoder.createReadStream().pipe(writeStream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(40);
      encoder.setQuality(10);

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      const finalSymbols = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];
      
      const isJackpot = finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2];
      const isWin = !isJackpot && (finalSymbols[0] === finalSymbols[1] || finalSymbols[1] === finalSymbols[2] || finalSymbols[0] === finalSymbols[2]);
      
      const reelStopFrames = [70, 85, 100];
      const reelPositions = [0, 0, 0];
      const reelVelocities = [40, 40, 40];
      const symbolHeight = 110;
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      
      for (let frame = 0; frame < frames; frame++) {
        const bg = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.5);
        bg.addColorStop(0, "#1a0a2e");
        bg.addColorStop(0.5, "#16213e");
        bg.addColorStop(1, "#0f0a1e");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);
        
        const borderPulse = Math.sin(frame * 0.1) * 0.3 + 0.7;
        const borderGrad = ctx.createLinearGradient(0, 0, width, height);
        borderGrad.addColorStop(0, `rgba(255, 215, 0, ${borderPulse})`);
        borderGrad.addColorStop(0.5, `rgba(255, 165, 0, ${borderPulse})`);
        borderGrad.addColorStop(1, `rgba(255, 215, 0, ${borderPulse})`);
        
        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 8;
        ctx.shadowColor = "rgba(255, 215, 0, 0.6)";
        ctx.shadowBlur = 20;
        ctx.strokeRect(25, 25, width - 50, height - 50);
        ctx.shadowBlur = 0;
        
        ctx.strokeStyle = "rgba(255, 215, 0, 0.3)";
        ctx.lineWidth = 4;
        ctx.strokeRect(35, 35, width - 70, height - 70);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px 'Arial Black'";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(255, 215, 0, 0.9)";
        ctx.shadowBlur = 25;
        
        const titleGrad = ctx.createLinearGradient(0, 50, 0, 80);
        titleGrad.addColorStop(0, "#ffd700");
        titleGrad.addColorStop(1, "#ffed4e");
        ctx.fillStyle = titleGrad;
        ctx.fillText("🎰 PREMIUM SLOTS 🎰", width / 2, 70);
        ctx.shadowBlur = 0;
        
        const machineGrad = ctx.createLinearGradient(0, 120, 0, 380);
        machineGrad.addColorStop(0, "rgba(20, 10, 40, 0.95)");
        machineGrad.addColorStop(0.5, "rgba(30, 15, 60, 0.95)");
        machineGrad.addColorStop(1, "rgba(20, 10, 40, 0.95)");
        ctx.fillStyle = machineGrad;
        ctx.fillRect(50, 120, width - 100, 260);
        
        ctx.strokeStyle = "rgba(100, 100, 150, 0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 120, width - 100, 260);
        
        for (let i = 0; i < 3; i++) {
          const reelX = 100 + i * 220;
          const reelY = 150;
          const reelWidth = 180;
          const reelHeight = 200;
          
          if (frame < reelStopFrames[i]) {
            const framesSinceStart = frame;
            const framesToStop = reelStopFrames[i] - frame;
            
            if (framesToStop < 30) {
              const progress = 1 - (framesToStop / 30);
              const easedProgress = easeOut(progress);
              reelVelocities[i] = 40 * (1 - easedProgress * 0.95);
            }
            
            reelPositions[i] += reelVelocities[i];
          } else {
            const targetIdx = symbols.indexOf(finalSymbols[i]);
            const targetPos = targetIdx * symbolHeight;
            const diff = targetPos - (reelPositions[i] % (symbols.length * symbolHeight));
            reelPositions[i] += diff * 0.3;
          }
          
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(reelX, reelY, reelWidth, reelHeight, 10);
          ctx.clip();
          
          const reelBg = ctx.createLinearGradient(reelX, reelY, reelX, reelY + reelHeight);
          reelBg.addColorStop(0, "#0d0025");
          reelBg.addColorStop(0.5, "#1a0040");
          reelBg.addColorStop(1, "#0d0025");
          ctx.fillStyle = reelBg;
          ctx.fillRect(reelX, reelY, reelWidth, reelHeight);
          
          const totalSymbols = symbols.length * 5;
          for (let j = -2; j < totalSymbols; j++) {
            const currentPos = reelPositions[i] % (symbols.length * symbolHeight);
            const symbolY = reelY + reelHeight / 2 + (j * symbolHeight - currentPos);
            const symbol = symbols[((j % symbols.length) + symbols.length) % symbols.length];
            
            if (symbolY > reelY - 80 && symbolY < reelY + reelHeight + 80) {
              const centerY = reelY + reelHeight / 2;
              const distFromCenter = Math.abs(symbolY - centerY);
              const maxDist = reelHeight / 2;
              
              const scale = Math.max(0.4, 1 - (distFromCenter / maxDist) * 0.6);
              const alpha = Math.max(0.2, 1 - (distFromCenter / maxDist) * 0.8);
              
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.font = `bold ${Math.floor(85 * scale)}px Arial`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              
              if (distFromCenter < 30) {
                ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
                ctx.shadowBlur = 15 * scale;
              }
              
              ctx.fillStyle = "#ffffff";
              ctx.fillText(symbol, reelX + reelWidth / 2, symbolY);
              ctx.shadowBlur = 0;
              ctx.restore();
            }
          }
          
          const vignette = ctx.createLinearGradient(reelX, reelY, reelX, reelY + reelHeight);
          vignette.addColorStop(0, "rgba(0, 0, 0, 0.7)");
          vignette.addColorStop(0.2, "rgba(0, 0, 0, 0)");
          vignette.addColorStop(0.8, "rgba(0, 0, 0, 0)");
          vignette.addColorStop(1, "rgba(0, 0, 0, 0.7)");
          ctx.fillStyle = vignette;
          ctx.fillRect(reelX, reelY, reelWidth, reelHeight);
          
          ctx.restore();
          
          const stopped = frame >= reelStopFrames[i] + 5;
          if (stopped) {
            const glowPulse = Math.sin(frame * 0.25) * 0.4 + 0.6;
            ctx.strokeStyle = `rgba(0, 255, 150, ${glowPulse})`;
            ctx.lineWidth = 5;
            ctx.shadowColor = `rgba(0, 255, 150, ${glowPulse * 0.8})`;
            ctx.shadowBlur = 20;
          } else {
            ctx.strokeStyle = "rgba(150, 150, 200, 0.5)";
            ctx.lineWidth = 3;
            ctx.shadowBlur = 0;
          }
          
          ctx.beginPath();
          ctx.roundRect(reelX, reelY, reelWidth, reelHeight, 10);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        
        ctx.setLineDash([15, 10]);
        ctx.strokeStyle = "rgba(255, 215, 0, 0.8)";
        ctx.lineWidth = 4;
        ctx.shadowColor = "rgba(255, 215, 0, 0.5)";
        ctx.shadowBlur = 10;
        ctx.strokeRect(110, 235, 580, 110);
        ctx.shadowBlur = 0;
        ctx.setLineDash([]);
        
        if (frame >= 105) {
          const winPulse = Math.sin((frame - 105) * 0.4) * 0.5 + 0.5;
          
          if (isJackpot) {
            ctx.fillStyle = `rgba(255, 215, 0, ${winPulse * 0.15})`;
            ctx.fillRect(0, 0, width, height);
            
            ctx.font = "bold 60px 'Arial Black'";
            const jackpotGrad = ctx.createLinearGradient(0, 410, 0, 450);
            jackpotGrad.addColorStop(0, `rgba(255, 215, 0, ${winPulse})`);
            jackpotGrad.addColorStop(0.5, `rgba(255, 255, 100, ${winPulse})`);
            jackpotGrad.addColorStop(1, `rgba(255, 215, 0, ${winPulse})`);
            ctx.fillStyle = jackpotGrad;
            ctx.textAlign = "center";
            ctx.shadowColor = `rgba(255, 215, 0, ${winPulse})`;
            ctx.shadowBlur = 30;
            ctx.fillText("🎉 JACKPOT! 🎉", width / 2, 430);
            ctx.shadowBlur = 0;
          } else if (isWin) {
            ctx.fillStyle = `rgba(100, 255, 150, ${winPulse * 0.12})`;
            ctx.fillRect(0, 0, width, height);
            
            ctx.font = "bold 50px 'Arial Black'";
            const winGrad = ctx.createLinearGradient(0, 410, 0, 450);
            winGrad.addColorStop(0, `rgba(100, 255, 150, ${winPulse})`);
            winGrad.addColorStop(1, `rgba(150, 255, 200, ${winPulse})`);
            ctx.fillStyle = winGrad;
            ctx.textAlign = "center";
            ctx.shadowColor = `rgba(100, 255, 150, ${winPulse * 0.9})`;
            ctx.shadowBlur = 25;
            ctx.fillText("✨ WINNER! ✨", width / 2, 430);
            ctx.shadowBlur = 0;
          } else {
            ctx.font = "bold 40px Arial";
            ctx.fillStyle = `rgba(200, 200, 200, ${winPulse * 0.6})`;
            ctx.textAlign = "center";
            ctx.fillText("TRY AGAIN", width / 2, 430);
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