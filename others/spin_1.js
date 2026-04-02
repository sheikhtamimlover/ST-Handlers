const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');
const GIFEncoder = require('gifencoder');

module.exports = {
  config: {
    name: "spin_1",
    aliases: ["slot", "lucky"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Spin the slot machine and win prizes!",
    category: "game",
    guide: "{pn} - Spin the slot machine and test your luck!"
  },

  langs: {
    en: {
      noMoney: "❌ You need at least $100 to spin!",
      spinning: "🎰 Spinning the slot machine...",
      jackpot: "🎊 JACKPOT! You won ${prize}! 💰",
      bigWin: "🌟 BIG WIN! You won ${prize}! 🎉",
      win: "✨ You won ${prize}! 🎁",
      lose: "💔 Better luck next time! You lost $100",
      error: "❌ An error occurred while spinning!"
    }
  },

  ST: async function({ message, event, usersData, getLang, api }) {
    try {
      const senderID = event.senderID;
      const userData = await usersData.get(senderID);
      const userMoney = userData.money || 0;
      const betAmount = 100;

      if (userMoney < betAmount) {
        return message.reply(getLang("noMoney"));
      }

      await usersData.set(senderID, {
        money: userMoney - betAmount,
        data: userData.data
      });

      const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '⭐'];
      const weights = [25, 20, 18, 15, 10, 7, 5];
      
      const getRandomSymbol = () => {
        const total = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * total;
        for (let i = 0; i < symbols.length; i++) {
          if (random < weights[i]) return symbols[i];
          random -= weights[i];
        }
        return symbols[0];
      };

      const finalSlots = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
      
      const width = 600;
      const height = 400;
      const encoder = new GIFEncoder(width, height);
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      const tmpDir = path.join(__dirname, 'tmp');
      await fs.ensureDir(tmpDir);
      const filePath = path.join(tmpDir, `spin_${senderID}_${Date.now()}.gif`);
      const stream = fs.createWriteStream(filePath);

      encoder.createReadStream().pipe(stream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(100);
      encoder.setQuality(10);

      const drawSlotMachine = (slot1, slot2, slot3, frame) => {
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(0.5, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, width - 20, height - 20);

        ctx.fillStyle = '#FFD700';
        ctx.fillRect(20, 20, width - 40, 80);
        
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎰 SLOT MACHINE 🎰', width / 2, 70);

        const slotWidth = 140;
        const slotHeight = 160;
        const startX = (width - (slotWidth * 3 + 40)) / 2;
        const startY = 140;

        for (let i = 0; i < 3; i++) {
          const x = startX + (slotWidth + 20) * i;
          
          const slotGradient = ctx.createLinearGradient(x, startY, x, startY + slotHeight);
          slotGradient.addColorStop(0, '#ffffff');
          slotGradient.addColorStop(1, '#f0f0f0');
          ctx.fillStyle = slotGradient;
          ctx.fillRect(x, startY, slotWidth, slotHeight);

          ctx.strokeStyle = '#333';
          ctx.lineWidth = 4;
          ctx.strokeRect(x, startY, slotWidth, slotHeight);

          ctx.fillStyle = '#000';
          ctx.font = 'bold 80px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          let displaySymbol;
          if (i === 0) displaySymbol = slot1;
          else if (i === 1) displaySymbol = slot2;
          else displaySymbol = slot3;
          
          ctx.fillText(displaySymbol, x + slotWidth / 2, startY + slotHeight / 2);
        }

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('💰 Bet: $100 💰', width / 2, height - 30);

        if (frame < 20) {
          ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
          ctx.fillRect(0, 0, width, height);
        }
      };

      const spinFrames = 25;
      for (let frame = 0; frame < spinFrames; frame++) {
        const slot1 = frame < spinFrames - 5 ? getRandomSymbol() : finalSlots[0];
        const slot2 = frame < spinFrames - 3 ? getRandomSymbol() : finalSlots[1];
        const slot3 = frame < spinFrames - 1 ? getRandomSymbol() : finalSlots[2];
        
        drawSlotMachine(slot1, slot2, slot3, frame);
        encoder.addFrame(ctx);
      }

      for (let i = 0; i < 5; i++) {
        drawSlotMachine(finalSlots[0], finalSlots[1], finalSlots[2], spinFrames + i);
        encoder.addFrame(ctx);
      }

      encoder.finish();

      await new Promise(resolve => stream.on('finish', resolve));

      let prize = 0;
      let resultMessage = "";

      if (finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2]) {
        if (finalSlots[0] === '7️⃣') {
          prize = 10000;
          resultMessage = getLang("jackpot").replace("${prize}", prize);
        } else if (finalSlots[0] === '💎') {
          prize = 5000;
          resultMessage = getLang("jackpot").replace("${prize}", prize);
        } else if (finalSlots[0] === '⭐') {
          prize = 3000;
          resultMessage = getLang("bigWin").replace("${prize}", prize);
        } else {
          prize = 1000;
          resultMessage = getLang("bigWin").replace("${prize}", prize);
        }
      } else if (finalSlots[0] === finalSlots[1] || finalSlots[1] === finalSlots[2] || finalSlots[0] === finalSlots[2]) {
        prize = 300;
        resultMessage = getLang("win").replace("${prize}", prize);
      } else {
        resultMessage = getLang("lose");
      }

      if (prize > 0) {
        await usersData.set(senderID, {
          money: userData.money - betAmount + prize,
          data: userData.data
        });
      }

      await message.reply({
        body: resultMessage,
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => {
        fs.unlink(filePath).catch(err => console.error(err));
      }, 60000);

    } catch (error) {
      console.error(error);
      return message.reply(getLang("error"));
    }
  }
};