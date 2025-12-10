const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { loadImage, createCanvas, registerFont } = require("canvas");

module.exports = {
  config: {
    name: "pair",
    version: "3.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Randomly pair two members with advanced canvas design",
    category: "fun",
    guide: "{pn} - Random pair\n{pn} @mention - Pair with mentioned user\n{pn} reply - Pair with replied user"
  },
  ST: async function({ message, event, api, usersData, args }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());
      
      if (members.length < 2) {
        return message.reply("❌ Not enough members to create a pair!");
      }

      let person1ID, person2ID;

      if (event.messageReply) {
        person1ID = event.senderID;
        person2ID = event.messageReply.senderID;
      }
      else if (Object.keys(event.mentions).length > 0) {
        person1ID = event.senderID;
        const mentionedIDs = Object.keys(event.mentions);
        person2ID = mentionedIDs[0];
      }
      else {
        const randomIndex1 = Math.floor(Math.random() * members.length);
        let randomIndex2 = Math.floor(Math.random() * members.length);
        
        while (randomIndex2 === randomIndex1) {
          randomIndex2 = Math.floor(Math.random() * members.length);
        }

        person1ID = members[randomIndex1];
        person2ID = members[randomIndex2];
      }

      const user1Data = await usersData.get(person1ID);
      const user2Data = await usersData.get(person2ID);

      const person1Name = user1Data.name || "Unknown";
      const person2Name = user2Data.name || "Unknown";

      const lovePercentage = Math.floor(Math.random() * 101);

      const avatar1URL = `https://graph.facebook.com/${person1ID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar2URL = `https://graph.facebook.com/${person2ID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const avatar1Path = path.join(__dirname, "cache", `avatar1_${person1ID}.png`);
      const avatar2Path = path.join(__dirname, "cache", `avatar2_${person2ID}.png`);

      await fs.ensureDir(path.join(__dirname, "cache"));

      const avatar1Response = await axios.get(avatar1URL, { responseType: "arraybuffer" });
      const avatar2Response = await axios.get(avatar2URL, { responseType: "arraybuffer" });

      await fs.writeFile(avatar1Path, avatar1Response.data);
      await fs.writeFile(avatar2Path, avatar2Response.data);

      const canvas = createCanvas(1400, 700);
      const ctx = canvas.getContext("2d");

      const bgGradient = ctx.createRadialGradient(700, 350, 100, 700, 350, 700);
      bgGradient.addColorStop(0, "#FFE5EC");
      bgGradient.addColorStop(0.3, "#FFC2D4");
      bgGradient.addColorStop(0.6, "#FF85A2");
      bgGradient.addColorStop(1, "#FF6B9D");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const drawHeart = (x, y, size) => {
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
        ctx.fillStyle = "#FF1744";
        ctx.fill();
        ctx.restore();
      };

      ctx.globalAlpha = 0.15;
      const heartPositions = [
        [100, 100], [1250, 120], [200, 570], [1100, 620], 
        [50, 320], [1300, 420], [300, 170], [1000, 520]
      ];
      
      heartPositions.forEach(([x, y]) => {
        drawHeart(x, y, 30);
      });
      ctx.globalAlpha = 1.0;

      const bannerGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      bannerGradient.addColorStop(0, "#FF6B9D");
      bannerGradient.addColorStop(0.5, "#FF1744");
      bannerGradient.addColorStop(1, "#FF6B9D");
      ctx.fillStyle = bannerGradient;
      ctx.fillRect(0, 0, canvas.width, 80);

      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.font = "bold 50px Arial";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      
      drawHeart(580, 50, 25);
      ctx.fillText("PERFECT MATCH", canvas.width / 2, 55);
      drawHeart(820, 50, 25);
      
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      const avatar1 = await loadImage(avatar1Path);
      const avatar2 = await loadImage(avatar2Path);

      const avatarSize = 280;
      const avatar1X = 180;
      const avatar2X = 940;
      const avatarY = 180;

      ctx.shadowColor = "#FF1744";
      ctx.shadowBlur = 30;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatar1X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, avatar1X, avatarY, avatarSize, avatarSize);
      ctx.restore();

      const border1Gradient = ctx.createLinearGradient(avatar1X, avatarY, avatar1X + avatarSize, avatarY + avatarSize);
      border1Gradient.addColorStop(0, "#FF1744");
      border1Gradient.addColorStop(0.5, "#FF6B9D");
      border1Gradient.addColorStop(1, "#FFB6C1");
      ctx.strokeStyle = border1Gradient;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(avatar1X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 23, 68, 0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(avatar1X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatar2X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, avatar2X, avatarY, avatarSize, avatarSize);
      ctx.restore();

      const border2Gradient = ctx.createLinearGradient(avatar2X, avatarY, avatar2X + avatarSize, avatarY + avatarSize);
      border2Gradient.addColorStop(0, "#FFB6C1");
      border2Gradient.addColorStop(0.5, "#FF6B9D");
      border2Gradient.addColorStop(1, "#FF1744");
      ctx.strokeStyle = border2Gradient;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(avatar2X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 23, 68, 0.3)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(avatar2X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowBlur = 0;

      ctx.strokeStyle = "#FF1744";
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(avatar1X + avatarSize, avatarY + avatarSize / 2);
      ctx.lineTo(avatar2X, avatarY + avatarSize / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const heartSizes = [100, 70, 45];
      const heartOpacities = [1, 0.7, 0.4];
      
      heartSizes.forEach((size, index) => {
        ctx.globalAlpha = heartOpacities[index];
        drawHeart(canvas.width / 2, 340, size);
      });
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
      ctx.shadowBlur = 10;
      
      ctx.font = "bold 45px Arial";
      const name1Width = ctx.measureText(person1Name).width;
      const name2Width = ctx.measureText(person2Name).width;
      
      ctx.fillRect(avatar1X + avatarSize / 2 - name1Width / 2 - 20, 520, name1Width + 40, 60);
      ctx.fillRect(avatar2X + avatarSize / 2 - name2Width / 2 - 20, 520, name2Width + 40, 60);
      
      ctx.shadowBlur = 0;

      const name1Gradient = ctx.createLinearGradient(0, 550, canvas.width, 550);
      name1Gradient.addColorStop(0, "#FF1744");
      name1Gradient.addColorStop(1, "#FF6B9D");
      
      ctx.font = "bold 45px Arial";
      ctx.fillStyle = name1Gradient;
      ctx.textAlign = "center";
      ctx.fillText(person1Name, avatar1X + avatarSize / 2, 560);
      ctx.fillText(person2Name, avatar2X + avatarSize / 2, 560);

      const percentageBoxWidth = 400;
      const percentageBoxHeight = 80;
      const percentageBoxX = (canvas.width - percentageBoxWidth) / 2;
      const percentageBoxY = 600;

      const percentageGradient = ctx.createLinearGradient(percentageBoxX, percentageBoxY, percentageBoxX + percentageBoxWidth, percentageBoxY + percentageBoxHeight);
      percentageGradient.addColorStop(0, "#FF1744");
      percentageGradient.addColorStop(0.5, "#E91E63");
      percentageGradient.addColorStop(1, "#FF6B9D");
      
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 15;
      ctx.fillStyle = percentageGradient;
      ctx.beginPath();
      ctx.roundRect(percentageBoxX, percentageBoxY, percentageBoxWidth, percentageBoxHeight, 40);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = "bold 55px Arial";
      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.fillText(`${lovePercentage}% MATCH`, canvas.width / 2, 655);

      let statusText = "Just Friends!";
      let statusIcon = "broken_heart";
      if (lovePercentage > 70) {
        statusIcon = "fire";
        statusText = "Perfect Match!";
      } else if (lovePercentage > 40) {
        statusIcon = "gift_heart";
        statusText = "Good Chemistry!";
      }

      ctx.font = "bold 35px Arial";
      ctx.fillStyle = "#2C3E50";
      
      if (statusIcon === "fire") {
        const fireSize = 20;
        ctx.fillStyle = "#FF5722";
        ctx.fillText("🔥", canvas.width / 2 - 150, 120);
        ctx.fillText("🔥", canvas.width / 2 + 150, 120);
      } else if (statusIcon === "gift_heart") {
        drawHeart(canvas.width / 2 - 150, 120, 20);
        drawHeart(canvas.width / 2 + 150, 120, 20);
      } else {
        ctx.fillStyle = "#FF1744";
        ctx.fillText("💔", canvas.width / 2 - 150, 120);
        ctx.fillText("💔", canvas.width / 2 + 150, 120);
      }
      
      ctx.fillStyle = "#2C3E50";
      ctx.fillText(statusText, canvas.width / 2, 120);

      const outputPath = path.join(__dirname, "cache", `pair_${Date.now()}.png`);
      const buffer = canvas.toBuffer("image/png");
      await fs.writeFile(outputPath, buffer);

      const statusEmojis = {
        fire: "🔥",
        gift_heart: "💝",
        broken_heart: "💔"
      };

      await message.reply({
        body: `💕 Perfect Pair Found! 💕\n\n` +
              `👤 ${person1Name}\n` +
              `❤️ Love Compatibility: ${lovePercentage}%\n` +
              `👤 ${person2Name}\n\n` +
              `${statusEmojis[statusIcon]} ${statusText}`,
        attachment: fs.createReadStream(outputPath)
      });

      await fs.unlink(avatar1Path);
      await fs.unlink(avatar2Path);
      await fs.unlink(outputPath);

    } catch (error) {
      console.error("Pair command error:", error);
      return message.reply("❌ An error occurred while creating a pair!");
    }
  }
};