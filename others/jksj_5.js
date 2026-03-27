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
      const width = 900;
      const height = 600;
      const frames = 150;
      
      const cachePath = path.join(__dirname, "cache");
      await fs.ensureDir(cachePath);
      const gifPath = path.join(cachePath, `slot_${Date.now()}.gif`);
      
      const encoder = new GIFEncoder(width, height);
      const writeStream = fs.createWriteStream(gifPath);
      encoder.createReadStream().pipe(writeStream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(35);
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
      
      const reelStopFrames = [90, 110, 130];
      const reelPositions = [0, 0, 0];
      const reelVelocities = [50, 50, 50];
      const symbolHeight = 130;
      
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      
      for (let frame = 0; frame < frames; frame++) {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#0a0015");
        bgGrad.addColorStop(0.5, "#1a1030");
        bgGrad.addColorStop(1, "#0a0015");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 55px Arial";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(255, 255, 255, 0.3)";
        ctx.shadowBlur = 15;
        ctx.fillText("🎰 PREMIUM SLOTS 🎰", width / 2, 70);
        ctx.shadowBlur = 0;
        
        const panelGrad = ctx.createLinearGradient(0, 140, 0, 460);
        panelGrad.addColorStop(0, "#1a0a30");
        panelGrad.addColorStop(0.5, "#2a1550");
        panelGrad.addColorStop(1, "#1a0a30");
        ctx.fillStyle = panelGrad;
        ctx.fillRect(60, 140, width - 120, 320);
        
        ctx.strokeStyle = "rgba(100, 80, 150, 0.6)";
        ctx.lineWidth = 3;
        ctx.strokeRect(60, 140, width - 120, 320);
        
        for (let i = 0; i < 3; i++) {
          const reelX = 120 + i * 250;
          const reelY = 180;
          const reelWidth = 210;
          const reelHeight = 240;
          
          if (frame < reelStopFrames[i]) {
            const framesToStop = reelStopFrames[i] - frame;
            
            if (framesToStop <= 40) {
              const progress = 1 - (framesToStop / 40);
              const easedProgress = easeOutCubic(progress);
              reelVelocities[i] = 50 * (1 - easedProgress);
            }
            
            reelPositions[i] += reelVelocities[i];
          } else {
            const targetIdx = symbols.indexOf(finalSymbols[i]);
            const targetPosition = targetIdx * symbolHeight;
            const cycleLength = symbols.length * symbolHeight;
            const currentMod = reelPositions[i] % cycleLength;
            
            let diff = targetPosition - currentMod;
            if (diff < 0) diff += cycleLength;
            if (diff > cycleLength / 2) diff -= cycleLength;
            
            const snapSpeed = 0.15;
            reelPositions[i] += diff * snapSpeed;
          }
          
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(reelX, reelY, reelWidth, reelHeight, 12);
          ctx.clip();
          
          const reelBgGrad = ctx.createLinearGradient(reelX, reelY, reelX, reelY + reelHeight);
          reelBgGrad.addColorStop(0, "#050010");
          reelBgGrad.addColorStop(0.5, "#0f0025");
          reelBgGrad.addColorStop(1, "#050010");
          ctx.fillStyle = reelBgGrad;
          ctx.fillRect(reelX, reelY, reelWidth, reelHeight);
          
          const cycleLength = symbols.length * symbolHeight;
          const normalizedPos = ((reelPositions[i] % cycleLength) + cycleLength) % cycleLength;
          
          for (let j = -3; j <= 5; j++) {
            const symbolY = reelY + reelHeight / 2 + (j * symbolHeight - normalizedPos);
            
            let symbolIdx = Math.floor((normalizedPos / symbolHeight) + j);
            symbolIdx = ((symbolIdx % symbols.length) + symbols.length) % symbols.length;
            
            const symbol = symbols[symbolIdx];
            
            if (symbolY > reelY - 100 && symbolY < reelY + reelHeight + 100) {
              const centerY = reelY + reelHeight / 2;
              const distFromCenter = Math.abs(symbolY - centerY);
              const maxDist = reelHeight / 2;
              
              const normalizedDist = Math.min(distFromCenter / maxDist, 1);
              const scale = 1 - (normalizedDist * 0.5);
              const alpha = 1 - (normalizedDist * 0.75);
              
              ctx.save();
              ctx.globalAlpha = Math.max(0.15, alpha);
              
              const fontSize = Math.floor(95 * scale);
              ctx.font = `bold ${fontSize}px Arial`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              
              if (distFromCenter < 40) {
                ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
                ctx.shadowBlur = 12;
              }
              
              ctx.fillStyle = "#ffffff";
              ctx.fillText(symbol, reelX + reelWidth / 2, symbolY);
              ctx.shadowBlur = 0;
              ctx.restore();
            }
          }
          
          const vignetteTop = ctx.createLinearGradient(reelX, reelY, reelX, reelY + 80);
          vignetteTop.addColorStop(0, "rgba(0, 0, 0, 0.85)");
          vignetteTop.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = vignetteTop;
          ctx.fillRect(reelX, reelY, reelWidth, 80);
          
          const vignetteBottom = ctx.createLinearGradient(reelX, reelY + reelHeight - 80, reelX, reelY + reelHeight);
          vignetteBottom.addColorStop(0, "rgba(0, 0, 0, 0)");
          vignetteBottom.addColorStop(1, "rgba(0, 0, 0, 0.85)");
          ctx.fillStyle = vignetteBottom;
          ctx.fillRect(reelX, reelY + reelHeight - 80, reelWidth, 80);
          
          ctx.restore();
          
          const isStopped = frame >= reelStopFrames[i] + 10;
          
          if (isStopped) {
            const glowIntensity = Math.sin(frame * 0.2) * 0.3 + 0.7;
            ctx.strokeStyle = `rgba(0, 255, 180, ${glowIntensity})`;
            ctx.lineWidth = 6;
            ctx.shadowColor = `rgba(0, 255, 180, ${glowIntensity * 0.7})`;
            ctx.shadowBlur = 20;
          } else {
            ctx.strokeStyle = "rgba(120, 120, 180, 0.4)";
            ctx.lineWidth = 3;
            ctx.shadowBlur = 0;
          }
          
          ctx.beginPath();
          ctx.roundRect(reelX, reelY, reelWidth, reelHeight, 12);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        
        if (frame >= 135) {
          const resultY = 500;
          const pulse = Math.sin((frame - 135) * 0.35) * 0.4 + 0.6;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${pulse * 0.9})`;
          ctx.font = "bold 50px Arial";
          ctx.textAlign = "center";
          ctx.fillText(`${finalSymbols[0]}  ${finalSymbols[1]}  ${finalSymbols[2]}`, width / 2, resultY);
          
          if (isJackpot) {
            const jackpotGlow = Math.sin((frame - 135) * 0.4) * 0.5 + 0.5;
            
            ctx.fillStyle = `rgba(255, 215, 0, ${jackpotGlow * 0.2})`;
            ctx.fillRect(0, 0, width, height);
            
            ctx.font = "bold 65px Arial";
            const jackpotGrad = ctx.createLinearGradient(0, 540, 0, 570);
            jackpotGrad.addColorStop(0, `rgba(255, 215, 0, ${jackpotGlow})`);
            jackpotGrad.addColorStop(1, `rgba(255, 255, 100, ${jackpotGlow})`);
            ctx.fillStyle = jackpotGrad;
            ctx.shadowColor = `rgba(255, 215, 0, ${jackpotGlow})`;
            ctx.shadowBlur = 35;
            ctx.fillText("🎉 JACKPOT! 🎉", width / 2, 555);
            ctx.shadowBlur = 0;
          } else if (isWin) {
            const winGlow = Math.sin((frame - 135) * 0.4) * 0.5 + 0.5;
            
            ctx.fillStyle = `rgba(100, 255, 200, ${winGlow * 0.15})`;
            ctx.fillRect(0, 0, width, height);
            
            ctx.font = "bold 55px Arial";
            ctx.fillStyle = `rgba(100, 255, 200, ${winGlow})`;
            ctx.shadowColor = `rgba(100, 255, 200, ${winGlow * 0.8})`;
            ctx.shadowBlur = 25;
            ctx.fillText("✨ WINNER! ✨", width / 2, 555);
            ctx.shadowBlur = 0;
          } else {
            ctx.font = "bold 45px Arial";
            ctx.fillStyle = `rgba(180, 180, 200, ${pulse * 0.7})`;
            ctx.fillText("TRY AGAIN", width / 2, 555);
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