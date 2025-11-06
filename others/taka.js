module.exports = {
  config: {
    name: "taka",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Generate random Bangladesh Taka note with user avatar",
    category: "image",
    guide: {
      en: "{pn} - Generate random BD Taka note (10/50/100)"
    }
  },

  ST: async function({ message, args, event, api, usersData }) {
    const { createCanvas, loadImage, registerFont } = require('canvas');
    const fs = require('fs-extra');
    const path = require('path');
    const axios = require('axios');

    try {
      const processingMsg = await message.reply("💵 Creating Bangladesh Taka note...");

      // Random taka denomination
      const denominations = [10, 50, 100];
      const amount = denominations[Math.floor(Math.random() * denominations.length)];

      // Get user info
      const userID = event.senderID;
      const userData = await usersData.get(userID);
      const userName = userData.name || "User";
      const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // Canvas setup - Bangladesh Taka sizes (real proportions)
      const width = 1400;
      const height = 650;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Taka color schemes
      const takaColors = {
        10: { bg: '#8B4789', dark: '#5D2E5C', light: '#A86BA6', accent: '#D4A5D3' },
        50: { bg: '#2E8B57', dark: '#1F5F3D', light: '#4DAF7C', accent: '#90EE90' },
        100: { bg: '#DC143C', dark: '#8B0000', light: '#FF6B6B', accent: '#FFB6C1' }
      };

      const colors = takaColors[amount];

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, colors.light);
      gradient.addColorStop(0.5, colors.bg);
      gradient.addColorStop(1, colors.dark);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Decorative patterns
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.2;
      
      // Grid pattern
      for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Border
      ctx.strokeStyle = colors.dark;
      ctx.lineWidth = 15;
      ctx.strokeRect(10, 10, width - 20, height - 20);

      // Inner border
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 5;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // Download and draw user avatar (circular)
      try {
        const avatarResponse = await axios.get(avatarUrl, { 
          responseType: 'arraybuffer',
          timeout: 10000 
        });
        const avatarBuffer = Buffer.from(avatarResponse.data);
        const avatar = await loadImage(avatarBuffer);

        const avatarSize = 280;
        const avatarX = width - avatarSize - 80;
        const avatarY = (height - avatarSize) / 2;

        // Circular clip for avatar
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();

        // Avatar border
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();

        // Inner avatar border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 - 5, 0, Math.PI * 2);
        ctx.stroke();

      } catch (err) {
        console.error("Avatar load error:", err);
      }

      // Bangladesh Bank text (top)
      ctx.fillStyle = 'white';
      ctx.font = 'bold 45px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('বাংলাদেশ ব্যাংক', width / 2, 90);
      
      ctx.font = 'bold 32px Arial';
      ctx.fillText('BANGLADESH BANK', width / 2, 135);

      // Amount - Large
      ctx.font = 'bold 180px Arial';
      ctx.fillStyle = '#FFD700';
      ctx.strokeStyle = colors.dark;
      ctx.lineWidth = 4;
      ctx.textAlign = 'left';
      const amountText = `৳${amount}`;
      ctx.strokeText(amountText, 80, 280);
      ctx.fillText(amountText, 80, 280);

      // Taka in words
      const wordsMap = {
        10: { bn: 'দশ টাকা', en: 'TEN TAKA' },
        50: { bn: 'পঞ্চাশ টাকা', en: 'FIFTY TAKA' },
        100: { bn: 'একশত টাকা', en: 'ONE HUNDRED TAKA' }
      };

      ctx.font = 'bold 38px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(wordsMap[amount].bn, 80, 340);
      
      ctx.font = 'bold 30px Arial';
      ctx.fillText(wordsMap[amount].en, 80, 380);

      // Serial number
      const serial = `BD${Date.now().toString().slice(-8)}`;
      ctx.font = 'bold 28px Courier New';
      ctx.fillStyle = colors.dark;
      ctx.fillText(`Serial: ${serial}`, 80, 450);

      // User name
      ctx.font = 'bold 35px Arial';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = colors.dark;
      ctx.lineWidth = 2;
      ctx.textAlign = 'center';
      ctx.strokeText(userName, width / 2, 550);
      ctx.fillText(userName, width / 2, 550);

      // Decorative elements
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.3;
      
      // Corner decorations
      for (let i = 0; i < 4; i++) {
        const x = i < 2 ? 60 : width - 60;
        const y = i % 2 === 0 ? 60 : height - 60;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Watermark
      ctx.font = 'bold 120px Arial';
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.1;
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(-0.3);
      ctx.fillText(amount.toString(), 0, 0);
      ctx.restore();
      ctx.globalAlpha = 1;

      // Bottom text
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('PROMISED TO PAY THE BEARER ON DEMAND', width / 2, height - 50);

      // Save image
      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const imagePath = path.join(cacheDir, `taka_${Date.now()}.png`);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(imagePath, buffer);

      await message.reply({
        body: `💵 Bangladesh ${amount} Taka Note\n👤 Owner: ${userName}\n🔢 Serial: ${serial}\n💰 Value: ৳${amount}`,
        attachment: fs.createReadStream(imagePath)
      });

      // Clean up
      setTimeout(() => {
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (e) {}
      }, 60000);

      if (processingMsg && processingMsg.messageID) {
        api.unsendMessage(processingMsg.messageID);
      }

    } catch (error) {
      console.error("Taka generation error:", error);
      return message.reply("❌ Failed to generate Taka note! Error: " + error.message);
    }
  }
};