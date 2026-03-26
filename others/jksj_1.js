const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");

module.exports = {
  config: {
    name: "jksj",
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Realistic slot machine spin animation with GIF output",
    category: "game",
    guide: "{pn}"
  },
  
  langs: {
    en: {
      spinning: "🎰 Spinning the slot machine...",
      result: "🎰 Result: {result}\n{message}",
      jackpot: "🎉 JACKPOT! You won big! 💰",
      win: "✨ You won! 🎊",
      lose: "😔 Try again!"
    }
  },

  ST: async function({ message, event, api, getLang }) {
    const symbols = ["🍒", "🍋", "🍊", "🍇", "💎", "⭐", "7️⃣"];
    const width = 600;
    const height = 400;
    const slotWidth = 180;
    const slotHeight = 120;
    const symbolSize = 100;
    
    message.reply(getLang("spinning"));

    try {
      const finalSymbols = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];

      const encoder = new GIFEncoder(width, height);
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      const cachePath = path.join(__dirname, "cache");
      await fs.ensureDir(cachePath);
      const gifPath = path.join(cachePath, `slot_${event.senderID}.gif`);
      
      const stream = fs.createWriteStream(gifPath);
      encoder.createReadStream().pipe(stream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(50);
      encoder.setQuality(10);

      const totalFrames = 200;
      const spinSpeed = [25, 25, 25];
      const deceleration = [0.92, 0.91, 0.90];
      const stopFrames = [120, 150, 180];
      
      let positions = [0, 0, 0];
      let speeds = [...spinSpeed];
      let stopped = [false, false, false];
      let finalPositions = [
        symbols.indexOf(finalSymbols[0]) * symbolSize,
        symbols.indexOf(finalSymbols[1]) * symbolSize,
        symbols.indexOf(finalSymbols[2]) * symbolSize
      ];

      for (let frame = 0; frame < totalFrames; frame++) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "#ff6b6b";
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, width - 20, height - 20);

        ctx.fillStyle = "#0f3460";
        ctx.fillRect(30, 100, width - 60, 200);

        for (let i = 0; i < 3; i++) {
          if (frame >= stopFrames[i]) {
            if (!stopped[i]) {
              positions[i] = finalPositions[i];
              stopped[i] = true;
            }
          } else {
            positions[i] += speeds[i];
            speeds[i] *= deceleration[i];
            
            if (positions[i] >= symbols.length * symbolSize) {
              positions[i] = 0;
            }
          }

          const slotX = 50 + i * (slotWidth + 20);
          const slotY = 120;

          ctx.save();
          ctx.beginPath();
          ctx.rect(slotX, slotY, slotWidth, slotHeight);
          ctx.clip();

          for (let j = -1; j <= 2; j++) {
            let symbolIndex = Math.floor((positions[i] / symbolSize + j)) % symbols.length;
            if (symbolIndex < 0) symbolIndex += symbols.length;
            
            const y = slotY + (j * symbolSize) - (positions[i] % symbolSize) + 10;
            
            ctx.font = "bold 80px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            const gradient = ctx.createLinearGradient(slotX, y, slotX + slotWidth, y + symbolSize);
            gradient.addColorStop(0, "#ffd700");
            gradient.addColorStop(1, "#ff6b6b");
            ctx.fillStyle = gradient;
            
            ctx.fillText(symbols[symbolIndex], slotX + slotWidth / 2, y + symbolSize / 2);
          }

          ctx.restore();

          ctx.strokeStyle = stopped[i] ? "#00ff00" : "#ffffff";
          ctx.lineWidth = 4;
          ctx.strokeRect(slotX, slotY, slotWidth, slotHeight);
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("🎰 SLOT MACHINE 🎰", width / 2, 50);

        if (frame > 180) {
          ctx.font = "bold 30px Arial";
          const flashColor = frame % 4 < 2 ? "#ffff00" : "#ff00ff";
          ctx.fillStyle = flashColor;
          ctx.fillText("★ RESULT ★", width / 2, 340);
        }

        encoder.addFrame(ctx);
      }

      encoder.finish();

      await new Promise(resolve => stream.on("finish", resolve));

      let resultMessage;
      if (finalSymbols[0] === finalSymbols[1] && finalSymbols[1] === finalSymbols[2]) {
        resultMessage = getLang("jackpot");
      } else if (finalSymbols[0] === finalSymbols[1] || finalSymbols[1] === finalSymbols[2] || finalSymbols[0] === finalSymbols[2]) {
        resultMessage = getLang("win");
      } else {
        resultMessage = getLang("lose");
      }

      await message.reply({
        body: getLang("result", {
          result: finalSymbols.join(" | "),
          message: resultMessage
        }),
        attachment: fs.createReadStream(gifPath)
      });

      await fs.remove(gifPath);

    } catch (error) {
      console.error("Slot machine error:", error);
      message.reply("❌ Error creating slot machine animation. Please try again.");
    }
  }
};