module.exports = {
  config: {
    name: "pair",
    version: "2.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Pair the command user with a random member with advanced canvas design",
    category: "fun",
    guide: "{pn} - Pairs you with a random member from the group"
  },
  ST: async function({ message, args, event, api, usersData, threadsData }) {
    const { createCanvas, loadImage } = require("canvas");
    const fs = require("fs-extra");
    const axios = require("axios");
    const path = require("path");

    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const members = threadInfo.participantIDs.filter(id => id !== event.senderID && id !== api.getCurrentUserID());

      if (members.length < 1) {
        return message.reply("❌ Not enough members in the group to make a pair!");
      }

      const person1 = event.senderID;
      const person2 = members[Math.floor(Math.random() * members.length)];

      const user1Data = await usersData.get(person1);
      const user2Data = await usersData.get(person2);

      const name1 = user1Data.name || "You";
      const name2 = user2Data.name || "User";

      const avatar1Url = `https://graph.facebook.com/${person1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar2Url = `https://graph.facebook.com/${person2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const avatar1Response = await axios.get(avatar1Url, { responseType: "arraybuffer" });
      const avatar2Response = await axios.get(avatar2Url, { responseType: "arraybuffer" });

      const avatar1 = await loadImage(Buffer.from(avatar1Response.data));
      const avatar2 = await loadImage(Buffer.from(avatar2Response.data));

      const canvas = createCanvas(1400, 700);
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createRadialGradient(700, 350, 100, 700, 350, 700);
      gradient.addColorStop(0, "#ff6b9d");
      gradient.addColorStop(0.3, "#c06c84");
      gradient.addColorStop(0.6, "#6c5b7b");
      gradient.addColorStop(1, "#355c7d");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 3 + 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      const avatarSize = 280;
      const avatarY = 150;

      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;

      const glow1 = ctx.createRadialGradient(280, avatarY + avatarSize / 2, avatarSize / 2 - 20, 280, avatarY + avatarSize / 2, avatarSize / 2 + 20);
      glow1.addColorStop(0, "rgba(255, 107, 157, 0.3)");
      glow1.addColorStop(1, "rgba(255, 107, 157, 0)");
      ctx.fillStyle = glow1;
      ctx.beginPath();
      ctx.arc(280, avatarY + avatarSize / 2, avatarSize / 2 + 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(280, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 280 - avatarSize / 2, avatarY, avatarSize, avatarSize);
      ctx.restore();

      const borderGradient1 = ctx.createLinearGradient(0, avatarY, 0, avatarY + avatarSize);
      borderGradient1.addColorStop(0, "#ffffff");
      borderGradient1.addColorStop(0.5, "#ffeb3b");
      borderGradient1.addColorStop(1, "#ff6b9d");
      ctx.strokeStyle = borderGradient1;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(280, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      const glow2 = ctx.createRadialGradient(1120, avatarY + avatarSize / 2, avatarSize / 2 - 20, 1120, avatarY + avatarSize / 2, avatarSize / 2 + 20);
      glow2.addColorStop(0, "rgba(240, 147, 251, 0.3)");
      glow2.addColorStop(1, "rgba(240, 147, 251, 0)");
      ctx.fillStyle = glow2;
      ctx.beginPath();
      ctx.arc(1120, avatarY + avatarSize / 2, avatarSize / 2 + 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(1120, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 1120 - avatarSize / 2, avatarY, avatarSize, avatarSize);
      ctx.restore();

      const borderGradient2 = ctx.createLinearGradient(0, avatarY, 0, avatarY + avatarSize);
      borderGradient2.addColorStop(0, "#ffffff");
      borderGradient2.addColorStop(0.5, "#f093fb");
      borderGradient2.addColorStop(1, "#764ba2");
      ctx.strokeStyle = borderGradient2;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(1120, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowBlur = 0;

      for (let i = 0; i < 15; i++) {
        const heartY = 100 + Math.random() * 500;
        const heartX = 550 + Math.random() * 300;
        const size = Math.random() * 20 + 10;
        ctx.font = `${size}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.2})`;
        ctx.fillText("💕", heartX, heartY);
      }

      const heartGradient = ctx.createLinearGradient(650, 250, 750, 350);
      heartGradient.addColorStop(0, "#ff6b9d");
      heartGradient.addColorStop(0.5, "#ffffff");
      heartGradient.addColorStop(1, "#f093fb");
      ctx.font = "bold 120px Arial";
      ctx.fillStyle = heartGradient;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.fillText("💕", canvas.width / 2, avatarY + avatarSize / 2 + 40);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(50, avatarY + avatarSize + 30, 550, 80);
      ctx.fillRect(800, avatarY + avatarSize + 30, 550, 80);

      ctx.font = "bold 45px 'Segoe UI', Arial";
      const nameGradient1 = ctx.createLinearGradient(0, 0, 0, 50);
      nameGradient1.addColorStop(0, "#ffffff");
      nameGradient1.addColorStop(1, "#ffeb3b");
      ctx.fillStyle = nameGradient1;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 10;
      const displayName1 = name1.length > 12 ? name1.substring(0, 12) + "..." : name1;
      ctx.fillText(displayName1, 280, avatarY + avatarSize + 75);

      const nameGradient2 = ctx.createLinearGradient(0, 0, 0, 50);
      nameGradient2.addColorStop(0, "#ffffff");
      nameGradient2.addColorStop(1, "#f093fb");
      ctx.fillStyle = nameGradient2;
      const displayName2 = name2.length > 12 ? name2.substring(0, 12) + "..." : name2;
      ctx.fillText(displayName2, 1120, avatarY + avatarSize + 75);
      ctx.shadowBlur = 0;

      const lovePercentage = Math.floor(Math.random() * 100) + 1;
      
      const boxGradient = ctx.createLinearGradient(0, 580, 0, 660);
      boxGradient.addColorStop(0, "rgba(255, 107, 157, 0.4)");
      boxGradient.addColorStop(1, "rgba(240, 147, 251, 0.4)");
      ctx.fillStyle = boxGradient;
      ctx.fillRect(400, 580, 600, 90);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.strokeRect(400, 580, 600, 90);

      ctx.font = "bold 55px 'Segoe UI', Arial";
      const matchGradient = ctx.createLinearGradient(0, 600, 0, 650);
      matchGradient.addColorStop(0, "#ffeb3b");
      matchGradient.addColorStop(0.5, "#ffffff");
      matchGradient.addColorStop(1, "#ffeb3b");
      ctx.fillStyle = matchGradient;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 15;
      ctx.fillText(`💘 ${lovePercentage}% Match 💘`, canvas.width / 2, 640);
      ctx.shadowBlur = 0;

      const imagePath = path.join(__dirname, "cache", `pair_${Date.now()}.png`);
      const buffer = canvas.toBuffer("image/png");
      await fs.outputFile(imagePath, buffer);

      const msgText = `💑 ════ Perfect Pair Found! ════ 💑\n\n👤 ${name1}\n❤️ ════════ + ════════ ❤️\n👤 ${name2}\n\n💘 Love Match: ${lovePercentage}% 💘\n━━━━━━━━━━━━━━━━━━━━\n✨ Reply to this message to find another pair! ✨`;

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
      const members = threadInfo.participantIDs.filter(id => id !== event.senderID && id !== api.getCurrentUserID());

      if (members.length < 1) {
        return message.reply("❌ Not enough members in the group to make a pair!");
      }

      const person1 = event.senderID;
      const person2 = members[Math.floor(Math.random() * members.length)];

      const user1Data = await usersData.get(person1);
      const user2Data = await usersData.get(person2);

      const name1 = user1Data.name || "You";
      const name2 = user2Data.name || "User";

      const avatar1Url = `https://graph.facebook.com/${person1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatar2Url = `https://graph.facebook.com/${person2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const avatar1Response = await axios.get(avatar1Url, { responseType: "arraybuffer" });
      const avatar2Response = await axios.get(avatar2Url, { responseType: "arraybuffer" });

      const avatar1 = await loadImage(Buffer.from(avatar1Response.data));
      const avatar2 = await loadImage(Buffer.from(avatar2Response.data));

      const canvas = createCanvas(1400, 700);
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createRadialGradient(700, 350, 100, 700, 350, 700);
      gradient.addColorStop(0, "#667eea");
      gradient.addColorStop(0.3, "#764ba2");
      gradient.addColorStop(0.6, "#f093fb");
      gradient.addColorStop(1, "#4facfe");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 3 + 1;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      const avatarSize = 280;
      const avatarY = 150;

      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;

      const glow1 = ctx.createRadialGradient(280, avatarY + avatarSize / 2, avatarSize / 2 - 20, 280, avatarY + avatarSize / 2, avatarSize / 2 + 20);
      glow1.addColorStop(0, "rgba(102, 126, 234, 0.3)");
      glow1.addColorStop(1, "rgba(102, 126, 234, 0)");
      ctx.fillStyle = glow1;
      ctx.beginPath();
      ctx.arc(280, avatarY + avatarSize / 2, avatarSize / 2 + 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(280, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 280 - avatarSize / 2, avatarY, avatarSize, avatarSize);
      ctx.restore();

      const borderGradient1 = ctx.createLinearGradient(0, avatarY, 0, avatarY + avatarSize);
      borderGradient1.addColorStop(0, "#ffffff");
      borderGradient1.addColorStop(0.5, "#667eea");
      borderGradient1.addColorStop(1, "#764ba2");
      ctx.strokeStyle = borderGradient1;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(280, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      const glow2 = ctx.createRadialGradient(1120, avatarY + avatarSize / 2, avatarSize / 2 - 20, 1120, avatarY + avatarSize / 2, avatarSize / 2 + 20);
      glow2.addColorStop(0, "rgba(240, 147, 251, 0.3)");
      glow2.addColorStop(1, "rgba(240, 147, 251, 0)");
      ctx.fillStyle = glow2;
      ctx.beginPath();
      ctx.arc(1120, avatarY + avatarSize / 2, avatarSize / 2 + 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(1120, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 1120 - avatarSize / 2, avatarY, avatarSize, avatarSize);
      ctx.restore();

      const borderGradient2 = ctx.createLinearGradient(0, avatarY, 0, avatarY + avatarSize);
      borderGradient2.addColorStop(0, "#ffffff");
      borderGradient2.addColorStop(0.5, "#4facfe");
      borderGradient2.addColorStop(1, "#00f2fe");
      ctx.strokeStyle = borderGradient2;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(1120, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowBlur = 0;

      for (let i = 0; i < 15; i++) {
        const heartY = 100 + Math.random() * 500;
        const heartX = 550 + Math.random() * 300;
        const size = Math.random() * 20 + 10;
        ctx.font = `${size}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.2})`;
        ctx.fillText("💕", heartX, heartY);
      }

      const heartGradient = ctx.createLinearGradient(650, 250, 750, 350);
      heartGradient.addColorStop(0, "#667eea");
      heartGradient.addColorStop(0.5, "#ffffff");
      heartGradient.addColorStop(1, "#f093fb");
      ctx.font = "bold 120px Arial";
      ctx.fillStyle = heartGradient;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;
      ctx.fillText("💕", canvas.width / 2, avatarY + avatarSize / 2 + 40);
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(50, avatarY + avatarSize + 30, 550, 80);
      ctx.fillRect(800, avatarY + avatarSize + 30, 550, 80);

      ctx.font = "bold 45px 'Segoe UI', Arial";
      const nameGradient1 = ctx.createLinearGradient(0, 0, 0, 50);
      nameGradient1.addColorStop(0, "#ffffff");
      nameGradient1.addColorStop(1, "#667eea");
      ctx.fillStyle = nameGradient1;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
      ctx.shadowBlur = 10;
      const displayName1 = name1.length > 12 ? name1.substring(0, 12) + "..." : name1;
      ctx.fillText(displayName1, 280, avatarY + avatarSize + 75);

      const nameGradient2 = ctx.createLinearGradient(0, 0, 0, 50);
      nameGradient2.addColorStop(0, "#ffffff");
      nameGradient2.addColorStop(1, "#00f2fe");
      ctx.fillStyle = nameGradient2;
      const displayName2 = name2.length > 12 ? name2.substring(0, 12) + "..." : name2;
      ctx.fillText(displayName2, 1120, avatarY + avatarSize + 75);
      ctx.shadowBlur = 0;

      const lovePercentage = Math.floor(Math.random() * 100) + 1;
      
      const boxGradient = ctx.createLinearGradient(0, 580, 0, 660);
      boxGradient.addColorStop(0, "rgba(102, 126, 234, 0.4)");
      boxGradient.addColorStop(1, "rgba(240, 147, 251, 0.4)");
      ctx.fillStyle = boxGradient;
      ctx.fillRect(400, 580, 600, 90);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.strokeRect(400, 580, 600, 90);

      ctx.font = "bold 55px 'Segoe UI', Arial";
      const matchGradient = ctx.createLinearGradient(0, 600, 0, 650);
      matchGradient.addColorStop(0, "#ffeb3b");
      matchGradient.addColorStop(0.5, "#ffffff");
      matchGradient.addColorStop(1, "#ffeb3b");
      ctx.fillStyle = matchGradient;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 15;
      ctx.fillText(`💘 ${lovePercentage}% Match 💘`, canvas.width / 2, 640);
      ctx.shadowBlur = 0;

      const imagePath = path.join(__dirname, "cache", `pair_${Date.now()}.png`);
      const buffer = canvas.toBuffer("image/png");
      await fs.outputFile(imagePath, buffer);

      const msgText = `💑 ════ Another Perfect Pair! ════ 💑\n\n👤 ${name1}\n❤️ ════════ + ════════ ❤️\n👤 ${name2}\n\n💘 Love Match: ${lovePercentage}% 💘\n━━━━━━━━━━━━━━━━━━━━\n✨ Reply again to find more pairs! ✨`;

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