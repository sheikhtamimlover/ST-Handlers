const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "pair",
    version: "2.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Randomly pair two members with canvas design",
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

      // Check if reply to message
      if (event.messageReply) {
        person1ID = event.senderID;
        person2ID = event.messageReply.senderID;
      }
      // Check if mention
      else if (Object.keys(event.mentions).length > 0) {
        person1ID = event.senderID;
        const mentionedIDs = Object.keys(event.mentions);
        person2ID = mentionedIDs[0];
      }
      // Random pair
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

      // Download avatars
      const avatar1URL = `https://graph.facebook.com/${person1ID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar2URL = `https://graph.facebook.com/${person2ID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const avatar1Path = path.join(__dirname, "cache", `avatar1_${person1ID}.png`);
      const avatar2Path = path.join(__dirname, "cache", `avatar2_${person2ID}.png`);

      await fs.ensureDir(path.join(__dirname, "cache"));

      const avatar1Response = await axios.get(avatar1URL, { responseType: "arraybuffer" });
      const avatar2Response = await axios.get(avatar2URL, { responseType: "arraybuffer" });

      await fs.writeFile(avatar1Path, avatar1Response.data);
      await fs.writeFile(avatar2Path, avatar2Response.data);

      // Create canvas
      const canvas = createCanvas(1200, 600);
      const ctx = canvas.getContext("2d");

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#ff9a9e");
      gradient.addColorStop(0.5, "#fecfef");
      gradient.addColorStop(1, "#ffdde1");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load and draw avatars
      const avatar1 = await loadImage(avatar1Path);
      const avatar2 = await loadImage(avatar2Path);

      // Draw circular avatars
      const avatarSize = 300;
      const avatar1X = 150;
      const avatar2X = 750;
      const avatarY = 150;

      // Person 1 avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatar1X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, avatar1X, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Border for avatar 1
      ctx.strokeStyle = "#ff6b9d";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(avatar1X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Person 2 avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatar2X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, avatar2X, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Border for avatar 2
      ctx.strokeStyle = "#ff6b9d";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(avatar2X + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Heart symbol in the middle
      ctx.font = "bold 120px Arial";
      ctx.fillStyle = "#ff1744";
      ctx.textAlign = "center";
      ctx.fillText("❤️", canvas.width / 2, 320);

      // Draw names
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#2c3e50";
      ctx.textAlign = "center";
      ctx.fillText(person1Name, avatar1X + avatarSize / 2, 500);
      ctx.fillText(person2Name, avatar2X + avatarSize / 2, 500);

      // Draw love percentage
      ctx.font = "bold 50px Arial";
      ctx.fillStyle = "#e91e63";
      ctx.fillText(`${lovePercentage}% Match`, canvas.width / 2, 550);

      // Save canvas
      const outputPath = path.join(__dirname, "cache", `pair_${Date.now()}.png`);
      const buffer = canvas.toBuffer("image/png");
      await fs.writeFile(outputPath, buffer);

      // Send image
      await message.reply({
        body: `💕 Perfect Pair Found! 💕\n\n` +
              `👤 ${person1Name}\n` +
              `❤️ Love Compatibility: ${lovePercentage}%\n` +
              `👤 ${person2Name}\n\n` +
              `${lovePercentage > 70 ? "🔥 Perfect Match!" : lovePercentage > 40 ? "💝 Good Chemistry!" : "💔 Just Friends!"}`,
        attachment: fs.createReadStream(outputPath)
      });

      // Clean up
      await fs.unlink(avatar1Path);
      await fs.unlink(avatar2Path);
      await fs.unlink(outputPath);

    } catch (error) {
      console.error("Pair command error:", error);
      return message.reply("❌ An error occurred while creating a pair!");
    }
  }
};