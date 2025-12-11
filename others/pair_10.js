const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "pair",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Pair with opposite gender based on sender's gender",
    category: "fun",
    guide: "{pn} @mention\n{pn} reply\n{pn} (random opposite gender pair)"
  },
  ST: async function({ message, args, event, api, usersData, threadsData }) {
    try {
      let targetUID;
      let targetName;
      let senderUID = event.senderID;
      let senderName = await usersData.getName(senderUID);

      const getSenderGender = async (uid) => {
        try {
          const userInfo = await api.getUserInfo(uid);
          return userInfo[uid]?.gender || null;
        } catch {
          return null;
        }
      };

      const senderGender = await getSenderGender(senderUID);

      if (Object.keys(event.mentions).length > 0) {
        targetUID = Object.keys(event.mentions)[0];
        targetName = event.mentions[targetUID];
      }
      else if (event.messageReply) {
        targetUID = event.messageReply.senderID;
        targetName = await usersData.getName(targetUID);
      }
      else {
        const threadInfo = await threadsData.get(event.threadID);
        const participantIDs = threadInfo.members.map(member => member.userID).filter(id => id !== senderUID);
        
        if (participantIDs.length === 0) {
          return message.reply("Not enough members in this group to pair with!");
        }

        const oppositeGenderMembers = [];
        
        for (const uid of participantIDs) {
          const memberGender = await getSenderGender(uid);
          
          if (senderGender === 2 && memberGender === 1) {
            oppositeGenderMembers.push(uid);
          } else if (senderGender === 1 && memberGender === 2) {
            oppositeGenderMembers.push(uid);
          } else if (!senderGender || !memberGender) {
            oppositeGenderMembers.push(uid);
          }
        }

        if (oppositeGenderMembers.length === 0) {
          targetUID = participantIDs[Math.floor(Math.random() * participantIDs.length)];
        } else {
          targetUID = oppositeGenderMembers[Math.floor(Math.random() * oppositeGenderMembers.length)];
        }
        
        targetName = await usersData.getName(targetUID);
      }

      if (targetUID === senderUID) {
        return message.reply("You cannot pair with yourself!");
      }

      const lovePercent = Math.floor(Math.random() * 101);
      
      let loveMessage;
      if (lovePercent >= 90) {
        loveMessage = "They Love Forever!";
      } else if (lovePercent >= 70) {
        loveMessage = "They Love Forever!";
      } else if (lovePercent >= 50) {
        loveMessage = "They Love Forever!";
      } else if (lovePercent >= 30) {
        loveMessage = "They Love Forever!";
      } else {
        loveMessage = "They Love Forever!";
      }

      const senderAvatarUrl = `https://graph.facebook.com/${senderUID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const targetAvatarUrl = `https://graph.facebook.com/${targetUID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const cachePath = path.join(__dirname, 'cache');
      await fs.ensureDir(cachePath);

      const senderAvatarPath = path.join(cachePath, `sender_${Date.now()}.png`);
      const targetAvatarPath = path.join(cachePath, `target_${Date.now()}.png`);

      const senderAvatar = await axios.get(senderAvatarUrl, { responseType: 'arraybuffer' });
      const targetAvatar = await axios.get(targetAvatarUrl, { responseType: 'arraybuffer' });

      await fs.writeFile(senderAvatarPath, Buffer.from(senderAvatar.data));
      await fs.writeFile(targetAvatarPath, Buffer.from(targetAvatar.data));

      const designType = Math.floor(Math.random() * 15) + 1;

      const canvas = createCanvas(1200, 700);
      const ctx = canvas.getContext('2d');

      const senderImg = await loadImage(senderAvatarPath);
      const targetImg = await loadImage(targetAvatarPath);

      const drawHeart = (x, y, size, color) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(size / 100, size / 100);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-50, -30, -50, -70, -25, -70);
        ctx.bezierCurveTo(0, -70, 0, -50, 0, -50);
        ctx.bezierCurveTo(0, -50, 0, -70, 25, -70);
        ctx.bezierCurveTo(50, -70, 50, -30, 0, 0);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
      };

      if (designType === 1) {
        const gradient = ctx.createLinearGradient(0, 0, 1200, 700);
        gradient.addColorStop(0, '#ff9a9e');
        gradient.addColorStop(0.5, '#fad0c4');
        gradient.addColorStop(1, '#ffecd2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1200, 700);

        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * 1200;
          const y = Math.random() * 700;
          const size = Math.random() * 15 + 5;
          drawHeart(x, y, size, '#ff6b6b');
        }
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.fillRect(100, 80, 1000, 540);
        ctx.shadowBlur = 0;

        const headerGradient = ctx.createLinearGradient(100, 80, 1100, 120);
        headerGradient.addColorStop(0, '#ff6b6b');
        headerGradient.addColorStop(1, '#ee5a6f');
        ctx.fillStyle = headerGradient;
        ctx.fillRect(100, 80, 1000, 80);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        drawHeart(480, 135, 25, '#ffffff');
        ctx.fillText('LOVE PAIR METER', 600, 135);
        drawHeart(720, 135, 25, '#ffffff');
      }
      else if (designType === 2) {
        const gradient = ctx.createLinearGradient(0, 0, 1200, 700);
        gradient.addColorStop(0, '#4a00e0');
        gradient.addColorStop(0.5, '#8e2de2');
        gradient.addColorStop(1, '#da22ff');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1200, 700);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        for (let i = 0; i < 30; i++) {
          ctx.beginPath();
          ctx.arc(Math.random() * 1200, Math.random() * 700, Math.random() * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.shadowColor = 'rgba(138, 43, 226, 0.5)';
        ctx.shadowBlur = 30;
        ctx.fillRect(100, 80, 1000, 540);
        ctx.shadowBlur = 0;

        const headerGradient = ctx.createLinearGradient(100, 80, 1100, 120);
        headerGradient.addColorStop(0, '#8e2de2');
        headerGradient.addColorStop(1, '#4a00e0');
        ctx.fillStyle = headerGradient;
        ctx.fillRect(100, 80, 1000, 80);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        drawHeart(500, 135, 25, '#da22ff');
        ctx.fillText('ETERNAL LOVE', 600, 135);
        drawHeart(700, 135, 25, '#da22ff');
      }
      else if (designType === 3) {
        const gradient = ctx.createLinearGradient(0, 0, 1200, 700);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1200, 700);

        ctx.globalAlpha = 0.25;
        for (let i = 0; i < 15; i++) {
          const x = Math.random() * 1200;
          const y = Math.random() * 700;
          const size = Math.random() * 20 + 10;
          drawHeart(x, y, size, '#667eea');
        }
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.shadowColor = 'rgba(102, 126, 234, 0.4)';
        ctx.shadowBlur = 25;
        ctx.fillRect(100, 80, 1000, 540);
        ctx.shadowBlur = 0;

        const headerGradient = ctx.createLinearGradient(100, 80, 1100, 120);
        headerGradient.addColorStop(0, '#667eea');
        headerGradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = headerGradient;
        ctx.fillRect(100, 80, 1000, 80);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        drawHeart(510, 135, 25, '#ffffff');
        ctx.fillText('SOULMATES', 600, 135);
        drawHeart(690, 135, 25, '#ffffff');
      }
      else {
        const gradient = ctx.createLinearGradient(0, 0, 1200, 700);
        gradient.addColorStop(0, '#fa709a');
        gradient.addColorStop(0.5, '#fee140');
        gradient.addColorStop(1, '#fa709a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1200, 700);

        ctx.globalAlpha = 0.28;
        for (let i = 0; i < 25; i++) {
          const x = Math.random() * 1200;
          const y = Math.random() * 700;
          const size = Math.random() * 18 + 8;
          drawHeart(x, y, size, '#fa709a');
        }
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.93)';
        ctx.shadowColor = 'rgba(250, 112, 154, 0.45)';
        ctx.shadowBlur = 22;
        ctx.fillRect(100, 80, 1000, 540);
        ctx.shadowBlur = 0;

        const headerGradient = ctx.createLinearGradient(100, 80, 1100, 120);
        headerGradient.addColorStop(0, '#fa709a');
        headerGradient.addColorStop(1, '#fee140');
        ctx.fillStyle = headerGradient;
        ctx.fillRect(100, 80, 1000, 80);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        drawHeart(510, 135, 25, '#ffffff');
        ctx.fillText('TRUE LOVE', 600, 135);
        drawHeart(690, 135, 25, '#ffffff');
      }

      function drawCircularImage(img, x, y, radius) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
        ctx.restore();
        
        ctx.strokeStyle = '#ff6b6b';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      drawCircularImage(senderImg, 300, 330, 100);
      drawCircularImage(targetImg, 900, 330, 100);

      drawHeart(600, 350, 40, '#ff6b6b');

      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      
      const truncateName = (name) => name.length > 15 ? name.substring(0, 15) + '...' : name;
      
      ctx.fillText(truncateName(senderName), 300, 470);
      ctx.fillText(truncateName(targetName), 900, 470);

      const percentGradient = ctx.createLinearGradient(400, 500, 800, 580);
      percentGradient.addColorStop(0, '#ff6b6b');
      percentGradient.addColorStop(1, '#ee5a6f');
      ctx.fillStyle = percentGradient;
      ctx.fillRect(400, 500, 400, 80);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${lovePercent}%`, 600, 550);

      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(loveMessage, 600, 245);

      ctx.fillStyle = 'rgba(255, 107, 107, 0.1)';
      ctx.fillRect(100, 620, 1000, 80);
      
      ctx.fillStyle = '#ff6b6b';
      ctx.font = 'italic 22px Arial';
      ctx.textAlign = 'center';
      drawHeart(450, 670, 12, '#ff6b6b');
      ctx.fillText('Developed by ST | Sheikh Tamim', 600, 670);
      drawHeart(750, 670, 12, '#ff6b6b');

      ctx.fillStyle = '#ff6b6b';
      const cornerSize = 40;
      
      ctx.beginPath();
      ctx.moveTo(100, 80);
      ctx.lineTo(100 + cornerSize, 80);
      ctx.lineTo(100, 80 + cornerSize);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(1100, 80);
      ctx.lineTo(1100 - cornerSize, 80);
      ctx.lineTo(1100, 80 + cornerSize);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(100, 620);
      ctx.lineTo(100 + cornerSize, 620);
      ctx.lineTo(100, 620 - cornerSize);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(1100, 620);
      ctx.lineTo(1100 - cornerSize, 620);
      ctx.lineTo(1100, 620 - cornerSize);
      ctx.fill();

      const imagePath = path.join(cachePath, `pair_${Date.now()}.png`);
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(imagePath, buffer);

      await message.reply({
        body: `💝 Love Pair Result!\n\n👤 ${senderName}\n💕 Paired with\n👤 ${targetName}\n\n💖 Love Score: ${lovePercent}%\n✨ ${loveMessage}\n\n━━━━━━━━━━━━━━━`,
        attachment: fs.createReadStream(imagePath)
      });

      await fs.unlink(imagePath);
      await fs.unlink(senderAvatarPath);
      await fs.unlink(targetAvatarPath);

    } catch (error) {
      console.error("Pair command error:", error);
      message.reply(`Error: ${error.message}`);
    }
  }
};