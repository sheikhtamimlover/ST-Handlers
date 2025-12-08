module.exports = {
  config: {
    name: "pair",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Randomly pair two members from the group with a canvas image",
    category: "fun",
    guide: "{pn} - Randomly pairs two members from the group"
  },
  ST: async function({ message, args, event, api, usersData, threadsData }) {
    const { createCanvas, loadImage } = require("canvas");
    const fs = require("fs-extra");
    const axios = require("axios");
    const path = require("path");

    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const members = threadInfo.participantIDs.filter(id => id !== event.userID && id !== api.getCurrentUserID());

      if (members.length < 2) {
        return message.reply("❌ Not enough members in the group to make a pair!");
      }

      const person1 = members[Math.floor(Math.random() * members.length)];
      const remainingMembers = members.filter(id => id !== person1);
      const person2 = remainingMembers[Math.floor(Math.random() * remainingMembers.length)];

      const user1Data = await usersData.get(person1);
      const user2Data = await usersData.get(person2);

      const name1 = user1Data.name || "User 1";
      const name2 = user2Data.name || "User 2";

      const avatar1Url = `https://graph.facebook.com/${person1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar2Url = `https://graph.facebook.com/${person2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const avatar1Response = await axios.get(avatar1Url, { responseType: "arraybuffer" });
      const avatar2Response = await axios.get(avatar2Url, { responseType: "arraybuffer" });

      const avatar1 = await loadImage(Buffer.from(avatar1Response.data));
      const avatar2 = await loadImage(Buffer.from(avatar2Response.data));

      const canvas = createCanvas(1200, 600);
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#ff6b9d");
      gradient.addColorStop(0.5, "#c06c84");
      gradient.addColorStop(1, "#6c5b7b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      const avatarSize = 300;
      const avatarY = 100;

      ctx.save();
      ctx.beginPath();
      ctx.arc(250, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 100, avatarY, avatarSize, avatarSize);
      ctx.restore();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(250, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.arc(950, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 800, avatarY, avatarSize, avatarSize);
      ctx.restore();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(950, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = "bold 80px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("💕", canvas.width / 2, avatarY + avatarSize / 2 + 30);

      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(name1.length > 15 ? name1.substring(0, 15) + "..." : name1, 250, avatarY + avatarSize + 60);
      ctx.fillText(name2.length > 15 ? name2.substring(0, 15) + "..." : name2, 950, avatarY + avatarSize + 60);

      const lovePercentage = Math.floor(Math.random() * 100) + 1;
      ctx.font = "bold 50px Arial";
      ctx.fillStyle = "#ffeb3b";
      ctx.fillText(`💘 ${lovePercentage}% Match 💘`, canvas.width / 2, 550);

      const imagePath = path.join(__dirname, "cache", `pair_${Date.now()}.png`);
      const buffer = canvas.toBuffer("image/png");
      await fs.outputFile(imagePath, buffer);

      const msgText = `💑 Perfect Pair Found! 💑\n\n👤 ${name1}\n❤️ +\n👤 ${name2}\n\n💘 Love Match: ${lovePercentage}%\n\nReact to this message to see more pairs!`;

      message.reply({
        body: msgText,
        mentions: [
          { tag: name1, id: person1 },
          { tag: name2, id: person2 }
        ],
        attachment: fs.createReadStream(imagePath)
      }, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID
          });
        }
        fs.unlinkSync(imagePath);
      });

    } catch (error) {
      console.error(error);
      message.reply("❌ An error occurred while creating the pair. Please try again!");
    }
  },
  onReply: async function({ message, event, api, usersData, Reply }) {
    if (event.senderID !== Reply.author) return;

    const { createCanvas, loadImage } = require("canvas");
    const fs = require("fs-extra");
    const axios = require("axios");
    const path = require("path");

    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const members = threadInfo.participantIDs.filter(id => id !== event.userID && id !== api.getCurrentUserID());

      if (members.length < 2) {
        return message.reply("❌ Not enough members in the group to make a pair!");
      }

      const person1 = members[Math.floor(Math.random() * members.length)];
      const remainingMembers = members.filter(id => id !== person1);
      const person2 = remainingMembers[Math.floor(Math.random() * remainingMembers.length)];

      const user1Data = await usersData.get(person1);
      const user2Data = await usersData.get(person2);

      const name1 = user1Data.name || "User 1";
      const name2 = user2Data.name || "User 2";

      const avatar1Url = `https://graph.facebook.com/${person1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar2Url = `https://graph.facebook.com/${person2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const avatar1Response = await axios.get(avatar1Url, { responseType: "arraybuffer" });
      const avatar2Response = await axios.get(avatar2Url, { responseType: "arraybuffer" });

      const avatar1 = await loadImage(Buffer.from(avatar1Response.data));
      const avatar2 = await loadImage(Buffer.from(avatar2Response.data));

      const canvas = createCanvas(1200, 600);
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "#667eea");
      gradient.addColorStop(0.5, "#764ba2");
      gradient.addColorStop(1, "#f093fb");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      const avatarSize = 300;
      const avatarY = 100;

      ctx.save();
      ctx.beginPath();
      ctx.arc(250, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 100, avatarY, avatarSize, avatarSize);
      ctx.restore();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(250, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.save();
      ctx.beginPath();
      ctx.arc(950, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 800, avatarY, avatarSize, avatarSize);
      ctx.restore();

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(950, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = "bold 80px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText("💕", canvas.width / 2, avatarY + avatarSize / 2 + 30);

      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(name1.length > 15 ? name1.substring(0, 15) + "..." : name1, 250, avatarY + avatarSize + 60);
      ctx.fillText(name2.length > 15 ? name2.substring(0, 15) + "..." : name2, 950, avatarY + avatarSize + 60);

      const lovePercentage = Math.floor(Math.random() * 100) + 1;
      ctx.font = "bold 50px Arial";
      ctx.fillStyle = "#ffeb3b";
      ctx.fillText(`💘 ${lovePercentage}% Match 💘`, canvas.width / 2, 550);

      const imagePath = path.join(__dirname, "cache", `pair_${Date.now()}.png`);
      const buffer = canvas.toBuffer("image/png");
      await fs.outputFile(imagePath, buffer);

      const msgText = `💑 Another Perfect Pair! 💑\n\n👤 ${name1}\n❤️ +\n👤 ${name2}\n\n💘 Love Match: ${lovePercentage}%\n\nReply again to see more pairs!`;

      message.reply({
        body: msgText,
        mentions: [
          { tag: name1, id: person1 },
          { tag: name2, id: person2 }
        ],
        attachment: fs.createReadStream(imagePath)
      }, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID
          });
        }
        fs.unlinkSync(imagePath);
      });

    } catch (error) {
      console.error(error);
      message.reply("❌ An error occurred while creating the pair. Please try again!");
    }
  }
};