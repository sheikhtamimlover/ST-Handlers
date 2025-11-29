module.exports = {
  config: {
    name: "hacked",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    description: "Create a realistic Facebook hacked notification prank",
    category: "image",
    guide: "{pn} [@mention] - Prank someone with a fake hacked notification"
  },

  ST: async function({ message, args, event, api, usersData }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const { createCanvas, loadImage, registerFont } = require("canvas");

    const mention = Object.keys(event.mentions);
    let targetID, targetName;

    if (mention.length > 0) {
      targetID = mention[0];
      targetName = event.mentions[targetID].replace("@", "");
    } else {
      targetID = event.senderID;
      const userInfo = await usersData.get(targetID);
      targetName = userInfo.name;
    }

    const avatarPath = __dirname + `/cache/hacked_avatar_${targetID}.png`;
    const outputPath = __dirname + `/cache/hacked_${targetID}.png`;

    try {
      // Download user avatar
      const avatarUrl = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarData = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(avatarPath, Buffer.from(avatarData.data));

      // Create canvas (realistic Facebook notification size)
      const canvas = createCanvas(800, 600);
      const ctx = canvas.getContext("2d");

      // Background - Facebook blue gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 600);
      gradient.addColorStop(0, '#1877f2');
      gradient.addColorStop(1, '#0d5db8');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      // White notification box
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
      ctx.fillRect(50, 50, 700, 500);
      ctx.shadowBlur = 0;

      // Red alert header
      ctx.fillStyle = '#dc3545';
      ctx.fillRect(50, 50, 700, 80);

      // Warning icon (triangle)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️', 400, 105);

      // Header text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('SECURITY ALERT', 400, 145);

      // Load and draw avatar
      const avatar = await loadImage(avatarPath);
      ctx.save();
      ctx.beginPath();
      ctx.arc(400, 220, 50, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 350, 170, 100, 100);
      ctx.restore();

      // Draw circle border around avatar
      ctx.strokeStyle = '#dc3545';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(400, 220, 50, 0, Math.PI * 2);
      ctx.stroke();

      // Main warning text
      ctx.fillStyle = '#212529';
      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Account Compromised!', 400, 310);

      // Account name
      ctx.fillStyle = '#dc3545';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(targetName, 400, 345);

      // Description text
      ctx.fillStyle = '#495057';
      ctx.font = '16px Arial';
      ctx.fillText('Unusual login activity detected', 400, 380);
      ctx.fillText('Location: Unknown Device', 400, 405);
      ctx.fillText('IP: 192.168.xxx.xxx', 400, 430);

      // Fake timestamp
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      ctx.fillStyle = '#6c757d';
      ctx.font = '14px Arial';
      ctx.fillText(`Detected: ${timestamp}`, 400, 460);

      // Fake action buttons
      ctx.fillStyle = '#dc3545';
      ctx.fillRect(150, 485, 200, 45);
      ctx.fillStyle = '#6c757d';
      ctx.fillRect(450, 485, 200, 45);

      // Button text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('SECURE NOW', 250, 513);
      ctx.fillText('IGNORE', 550, 513);

      // Watermark (small text)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText('This is a PRANK - Your account is safe! 😂', 780, 590);

      // Save image
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      fs.unlinkSync(avatarPath);

      // Send with dramatic message
      return message.reply({
        body: `🚨 SECURITY ALERT 🚨\n\n⚠️ WARNING: ${targetName}'s account has been "HACKED"!\n\n🔐 Unusual login detected!\n📍 Location: Unknown\n⏰ Time: Just now\n\n😱 Quick! Check the image!\n\n...\n...\n...\n\n😂 JUST KIDDING! It's a PRANK!\nYour account is completely SAFE! 🎭\n\n💡 This is just a realistic-looking fake notification created with canvas!\n\n✅ No actual hacking occurred\n✅ Your data is secure\n✅ You've been pranked! 🤣`,
        attachment: fs.createReadStream(outputPath)
      }, () => {
        fs.unlinkSync(outputPath);
      });

    } catch (error) {
      console.error(error);
      return message.reply("❌ Error creating the hacked notification. Please try again!");
    }
  }
};