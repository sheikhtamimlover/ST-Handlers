module.exports = {
  config: {
    name: "slot",
    version: "2.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Advanced slot machine game with realistic canvas graphics",
    category: "games",
    guide: "{pn} [bet amount] - Spin the slot machine and win big!"
  },

  ST: async function({ message, args, event, usersData, api }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const { createCanvas, loadImage } = require("canvas");

    const amount = parseInt(args[0]);
    const userID = event.senderID;

    if (isNaN(amount) || amount <= 0) {
      return message.reply("❌ Invalid amount!\n\n💰 Enter a valid bet amount\n\nExample: slot 1000");
    }

    const userData = await usersData.get(userID);

    if (amount > userData.money) {
      return message.reply(`❌ Insufficient balance!\n\n💰 Your balance: ${userData.money} coins\n💸 Required: ${amount} coins`);
    }

    const processingMsg = await message.reply("🎰 Spinning the slot machine...\n\n⏳ Please wait...");

    try {
      const slots = ["🍒", "🍇", "🍊", "🍉", "🍋", "🍎", "🍓", "🍑", "🥝"];
      const slot1 = slots[Math.floor(Math.random() * slots.length)];
      const slot2 = slots[Math.floor(Math.random() * slots.length)];
      const slot3 = slots[Math.floor(Math.random() * slots.length)];

      let winMultiplier = 0;
      let resultText = "";

      if (slot1 === "🍒" && slot2 === "🍒" && slot3 === "🍒") {
        winMultiplier = 10;
        resultText = "💎 CHERRY JACKPOT! 💎";
      } else if (slot1 === "🍇" && slot2 === "🍇" && slot3 === "🍇") {
        winMultiplier = 5;
        resultText = "🎰 GRAPE BONUS! 🎰";
      } else if (slot1 === slot2 && slot2 === slot3) {
        winMultiplier = 3;
        resultText = "🎉 TRIPLE MATCH! 🎉";
      } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
        winMultiplier = 2;
        resultText = "✨ DOUBLE MATCH! ✨";
      } else {
        winMultiplier = -1;
        resultText = "😢 NO MATCH";
      }

      const winnings = winMultiplier > 0 ? amount * winMultiplier : -amount;

      const avatarPath = __dirname + `/cache/slot_avatar_${userID}.png`;
      const outputPath = __dirname + `/cache/slot_result_${userID}.png`;

      const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarData = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(avatarPath, Buffer.from(avatarData.data));

      const canvas = createCanvas(1000, 700);
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createLinearGradient(0, 0, 0, 700);
      gradient.addColorStop(0, '#8B0000');
      gradient.addColorStop(0.5, '#DC143C');
      gradient.addColorStop(1, '#8B0000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1000, 700);

      ctx.fillStyle = '#FFD700';
      ctx.fillRect(50, 50, 900, 600);

      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 15;
      ctx.strokeRect(50, 50, 900, 600);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🎰 SLOT MACHINE 🎰', 500, 130);

      const slotBoxY = 200;
      const slotBoxHeight = 180;
      
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(150 + (i * 250), slotBoxY, 200, slotBoxHeight);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 5;
        ctx.strokeRect(150 + (i * 250), slotBoxY, 200, slotBoxHeight);
      }

      ctx.font = 'bold 120px Arial';
      ctx.fillStyle = '#000000';
      ctx.fillText(slot1, 250, slotBoxY + 130);
      ctx.fillText(slot2, 500, slotBoxY + 130);
      ctx.fillText(slot3, 750, slotBoxY + 130);

      ctx.fillStyle = winMultiplier > 0 ? '#228B22' : '#DC143C';
      ctx.font = 'bold 45px Arial';
      ctx.fillText(resultText, 500, 450);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 35px Arial';
      ctx.fillText(`💰 Bet: ${amount} coins`, 500, 510);
      
      ctx.fillStyle = winMultiplier > 0 ? '#228B22' : '#DC143C';
      ctx.fillText(winMultiplier > 0 ? `🎉 Won: +${winnings} coins` : `💸 Lost: ${-winnings} coins`, 500, 560);

      const avatar = await loadImage(avatarPath);
      ctx.save();
      ctx.beginPath();
      ctx.arc(120, 630, 40, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 80, 590, 80, 80);
      ctx.restore();

      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(120, 630, 40, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 25px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Balance: ${userData.money + winnings} coins`, 180, 640);

      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      fs.unlinkSync(avatarPath);

      await usersData.set(userID, {
        money: userData.money + winnings,
        data: userData.data
      });

      await message.reply({
        body: `${resultText}\n\n💰 Bet: ${amount} coins\n${winMultiplier > 0 ? `🎉 Won: +${winnings} coins` : `💸 Lost: ${-winnings} coins`}\n💵 New Balance: ${userData.money + winnings} coins`,
        attachment: fs.createReadStream(outputPath)
      }, () => {
        fs.unlinkSync(outputPath);
      });

      api.unsendMessage(processingMsg.messageID);

    } catch (error) {
      console.error(error);
      return message.reply("❌ Error generating slot machine. Please try again!");
    }
  }
};