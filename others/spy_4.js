const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "spy",
    aliases: ["userinfo", "stalk"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Display target user information with neon card style",
    category: "info",
    guide: "{pn} [@mention or reply]\n{pn} [UID]\n{pn} [leave blank for self]"
  },
  langs: {
    en: {
      noUser: "❌ User not found!",
      fetching: "🔍 Generating spy card...",
      error: "❌ Error: {error}"
    }
  },
  ST: async function({ message, args, event, api, getLang, usersData }) {
    let targetUID;
    
    if (Object.keys(event.mentions).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
    } else if (event.messageReply) {
      targetUID = event.messageReply.senderID;
    } else if (args[0]) {
      targetUID = args[0];
    } else {
      targetUID = event.senderID;
    }

    try {
      message.reply(getLang("fetching"));
      
      const userInfo = await api.getUserInfo(targetUID);
      const userData = await usersData.get(targetUID);
      const user = userInfo[targetUID];
      
      if (!user) {
        return message.reply(getLang("noUser"));
      }

      const gender = user.gender === 1 ? 'Female' : user.gender === 2 ? 'Male' : 'Other';
      const money = userData?.money || 0;
      const exp = userData?.exp || 0;
      const banned = userData?.banned ? 'Yes' : 'No';

      const cachePath = path.join(__dirname, "cache", `spy_${targetUID}.png`);
      await fs.ensureDir(path.join(__dirname, "cache"));

      const canvas = createCanvas(800, 600);
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createLinearGradient(0, 0, 800, 600);
      gradient.addColorStop(0, "#1a0033");
      gradient.addColorStop(0.5, "#0d001a");
      gradient.addColorStop(1, "#1a0033");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 600);

      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#ff00ff";
      ctx.shadowBlur = 20;
      ctx.strokeRect(20, 20, 760, 560);

      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 15;
      ctx.strokeRect(30, 30, 740, 540);

      const avatarUrl = `https://graph.facebook.com/${targetUID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      try {
        const avatarResponse = await axios.get(avatarUrl, { responseType: "arraybuffer" });
        const avatarImage = await loadImage(Buffer.from(avatarResponse.data));
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(400, 140, 80, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatarImage, 320, 60, 160, 160);
        ctx.restore();

        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(400, 140, 80, 0, Math.PI * 2);
        ctx.stroke();
      } catch (avatarError) {
        console.log("Avatar load failed, using placeholder");
        ctx.fillStyle = "#00ffff";
        ctx.beginPath();
        ctx.arc(400, 140, 80, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.font = "bold 36px sans-serif";
      ctx.fillStyle = "#00ffff";
      ctx.textAlign = "center";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 10;
      ctx.fillText("SPY INFORMATION", 400, 270);

      ctx.font = "26px sans-serif";
      ctx.textAlign = "left";
      ctx.shadowBlur = 0;
      
      const info = [
        { label: "Name:", value: user.name, color: "#ff00ff" },
        { label: "UID:", value: targetUID, color: "#00ffff" },
        { label: "Gender:", value: gender, color: "#ff00ff" },
        { label: "Birthday:", value: user.birthday || "Hidden", color: "#00ffff" },
        { label: "Location:", value: user.location?.name || "Hidden", color: "#ff00ff" },
        { label: "Money:", value: `${money}$`, color: "#00ffff" },
        { label: "EXP:", value: exp.toString(), color: "#ff00ff" },
        { label: "Banned:", value: banned, color: "#00ffff" }
      ];

      let yPos = 320;
      info.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.shadowColor = item.color;
        ctx.shadowBlur = 5;
        ctx.fillText(item.label, 100, yPos);
        
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 3;
        const valueText = String(item.value);
        ctx.fillText(valueText.length > 35 ? valueText.substring(0, 32) + "..." : valueText, 280, yPos);
        yPos += 35;
      });

      ctx.font = "bold 22px sans-serif";
      ctx.fillStyle = "#00ffff";
      ctx.textAlign = "center";
      ctx.shadowColor = "#00ffff";
      ctx.shadowBlur = 10;
      ctx.fillText("ST BOT SPY SYSTEM", 400, 570);

      const buffer = canvas.toBuffer("image/png");
      await fs.writeFile(cachePath, buffer);

      message.reply({
        body: `🎭 SPY CARD GENERATED 🎭\n\n👤 Target: ${user.name}\n🆔 UID: ${targetUID}\n\n🌟 ST BOT SPY SYSTEM 🌟`,
        attachment: fs.createReadStream(cachePath)
      }, async () => {
        await fs.unlink(cachePath).catch(() => {});
      });

    } catch (error) {
      console.error("Spy command error:", error);
      message.reply(getLang("error", { error: error.message }));
    }
  }
};