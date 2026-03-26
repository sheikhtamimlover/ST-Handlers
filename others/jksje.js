const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");
const GIFEncoder = require("gifencoder");

module.exports = {
  config: {
    name: "jksje",
    aliases: ["infocard", "usercard"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Animated user information card with glowing effects",
    category: "info",
    guide: "{pn} - Get your info card\n{pn} @mention - Get mentioned user's info card\n{pn} reply - Get replied user's info card"
  },
  langs: {
    en: {
      creating: "⏳ Creating animated info card...",
      error: "❌ Error: {error}",
      success: "✅ Here's your animated info card!",
      noUser: "❌ Please mention a user or reply to their message!"
    }
  },
  ST: async function({ message, args, event, api, getLang, usersData }) {
    try {
      let targetUID;
      
      if (event.type === "message_reply") {
        targetUID = event.messageReply.senderID;
      } else if (Object.keys(event.mentions).length > 0) {
        targetUID = Object.keys(event.mentions)[0];
      } else {
        targetUID = event.senderID;
      }

      await message.reply(getLang("creating"));

      const userInfo = await api.getUserInfo(targetUID);
      const user = userInfo[targetUID];
      const userData = await usersData.get(targetUID);
      
      const name = user.name || "Unknown User";
      const gender = user.gender === 2 ? "Male" : user.gender === 1 ? "Female" : "Other";
      const uid = targetUID;
      const money = userData?.money || 0;
      const exp = userData?.exp || 0;
      const level = userData?.level || 1;
      
      const avatarUrl = `https://graph.facebook.com/${targetUID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      const outputPath = path.join(__dirname, `temp_card_${Date.now()}.gif`);
      
      const width = 800;
      const height = 600;
      const frames = 200;
      
      const encoder = new GIFEncoder(width, height);
      encoder.createReadStream().pipe(fs.createWriteStream(outputPath));
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(50);
      encoder.setQuality(10);
      
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      const avatarResponse = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      const avatarBuffer = Buffer.from(avatarResponse.data);
      const avatarImage = await loadImage(avatarBuffer);
      
      for (let i = 0; i < frames; i++) {
        const t = i / frames;
        
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        const hue1 = (t * 360) % 360;
        const hue2 = (t * 360 + 180) % 360;
        gradient.addColorStop(0, `hsl(${hue1}, 70%, 20%)`);
        gradient.addColorStop(1, `hsl(${hue2}, 70%, 20%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        const glowIntensity = Math.sin(t * Math.PI * 4) * 0.5 + 0.5;
        const glowColor = `hsla(${(t * 360) % 360}, 100%, 50%, ${glowIntensity})`;
        
        ctx.save();
        ctx.translate(width / 2, 200);
        
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 30 + glowIntensity * 20;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 5 + glowIntensity * 3;
        ctx.beginPath();
        ctx.arc(0, 0, 115, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, 110, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImage, -110, -110, 220, 220);
        ctx.restore();
        
        const textFlicker = Math.random() > 0.1 ? 1 : 0.3;
        const textGlow = `hsla(${(t * 360 + 120) % 360}, 100%, 60%, ${textFlicker})`;
        
        ctx.font = "bold 42px Arial";
        ctx.textAlign = "center";
        ctx.shadowColor = textGlow;
        ctx.shadowBlur = 15;
        ctx.fillStyle = textGlow;
        ctx.fillText(name, width / 2, 380);
        
        ctx.font = "28px Arial";
        const infoY = 430;
        const lineHeight = 40;
        
        const infoTexts = [
          `👤 Gender: ${gender}`,
          `🆔 UID: ${uid}`,
          `💰 Money: $${money.toLocaleString()}`,
          `⭐ EXP: ${exp.toLocaleString()}`,
          `🎯 Level: ${level}`
        ];
        
        infoTexts.forEach((text, index) => {
          const flicker = Math.random() > 0.15 ? 1 : 0.4;
          const color = `hsla(${(t * 360 + index * 60) % 360}, 100%, 70%, ${flicker})`;
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.fillStyle = color;
          ctx.fillText(text, width / 2, infoY + index * lineHeight);
        });
        
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `hsla(${(t * 360) % 360}, 100%, 50%, 0.3)`;
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 20, width - 40, height - 40);
        
        const cornerGlow = `hsla(${(t * 360) % 360}, 100%, 50%, ${glowIntensity})`;
        ctx.fillStyle = cornerGlow;
        const cornerSize = 20;
        ctx.fillRect(20, 20, cornerSize, cornerSize);
        ctx.fillRect(width - 40, 20, cornerSize, cornerSize);
        ctx.fillRect(20, height - 40, cornerSize, cornerSize);
        ctx.fillRect(width - 40, height - 40, cornerSize, cornerSize);
        
        encoder.addFrame(ctx);
      }
      
      encoder.finish();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const stream = fs.createReadStream(outputPath);
      
      await message.reply({
        body: getLang("success"),
        attachment: stream
      });
      
      await fs.unlink(outputPath);
      
    } catch (error) {
      console.error("JKSJE Error:", error);
      return message.reply(getLang("error", { error: error.message || "Failed to create info card" }));
    }
  }
};