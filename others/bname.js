module.exports = {
  config: {
    name: "bname",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Beautiful name card with user stats",
    category: "image",
    guide: "{pn} - Create beautiful name card with your stats"
  },

  ST: async function({ message, args, event, api, usersData, threadsData }) {
    const { createCanvas, loadImage } = require('canvas');
    const fs = require('fs-extra');
    const axios = require('axios');
    const path = require('path');

    try {
      // Ensure cache directory exists
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) {
        await fs.mkdirp(cacheDir);
      }

      // Get user data
      const senderID = event.senderID;
      const userData = await usersData.get(senderID);
      const userName = userData.name || "User";
      const userMoney = userData.money || 0;
      const messageCount = userData.exp || 0;

      // Get user profile picture
      const avatarUrl = `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      const avatarPath = path.join(cacheDir, `avatar_${senderID}.png`);
      await fs.writeFile(avatarPath, avatarResponse.data);
      const avatar = await loadImage(avatarPath);

      // Create canvas
      const canvas = createCanvas(1200, 600);
      const ctx = canvas.getContext('2d');

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(0.5, '#764ba2');
      gradient.addColorStop(1, '#f093fb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add decorative circles
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(100, 100, 150, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(1100, 500, 200, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Draw white rounded rectangle for card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      roundRect(ctx, 100, 100, 1000, 400, 30);
      ctx.fill();

      // Draw avatar circle with border
      ctx.save();
      ctx.beginPath();
      ctx.arc(300, 300, 120, 0, Math.PI * 2);
      ctx.closePath();
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.clip();
      ctx.drawImage(avatar, 180, 180, 240, 240);
      ctx.restore();

      // Draw name
      ctx.fillStyle = '#2d3748';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(userName, 480, 220);

      // Draw decorative line
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(480, 240);
      ctx.lineTo(680, 240);
      ctx.stroke();

      // Draw stats
      ctx.font = 'bold 35px Arial';
      ctx.fillStyle = '#4a5568';
      
      // UID
      ctx.fillText(`UID: ${senderID}`, 480, 310);
      
      // Balance
      ctx.fillText(`Balance: $${userMoney.toLocaleString()}`, 480, 370);
      
      // Message Count
      ctx.fillText(`Messages: ${messageCount.toLocaleString()}`, 480, 430);

      // Draw footer text
      ctx.font = 'italic 25px Arial';
      ctx.fillStyle = '#718096';
      ctx.textAlign = 'center';
      ctx.fillText('Created by ST Bot | Sheikh Tamim', 600, 540);

      // Save and send
      const imagePath = path.join(cacheDir, `bname_${senderID}.png`);
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(imagePath, buffer);

      // Clean up avatar
      await fs.remove(avatarPath);

      // Send as reply
      await message.reply({
        body: `✨ Here's your beautiful name card, ${userName}! ✨`,
        attachment: fs.createReadStream(imagePath)
      });

      // Clean up image after a short delay
      setTimeout(() => {
        fs.remove(imagePath).catch(() => {});
      }, 5000);

    } catch (error) {
      console.error("Error in bname command:", error);
      message.reply("❌ An error occurred while creating your name card. Please try again!");
    }
  }
};

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}