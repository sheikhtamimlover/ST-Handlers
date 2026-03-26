const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
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
      
      const avatarUrl = `https://graph.facebook.com/${targetUID}/picture?width=320&height=320&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      const outputPath = path.join(__dirname, `temp_card_${Date.now()}.gif`);
      
      const width = 700;
      const height = 500;
      const frames = 60;
      
      const encoder = new GIFEncoder(width, height);
      encoder.createReadStream().pipe(fs.createWriteStream(outputPath));
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(40);
      encoder.setQuality(20);
      
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      const avatarResponse = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      const avatarBuffer = Buffer.from(avatarResponse.data);
      const avatarImage = await loadImage(avatarBuffer);
      
      for (let i = 0; i < frames; i++) {
        const t = i / frames;
        
        const bg = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
        const hue = (t * 360) % 360;
        bg.addColorStop(0, `hsl(${hue}, 60%, 15%)`);
        bg.addColorStop(0.5, `hsl(${(hue + 60) % 360}, 50%, 10%)`);
        bg.addColorStop(1, `hsl(${(hue + 120) % 360}, 40%, 5%)`);
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);
        
        const pulse = Math.sin(t * Math.PI * 2) * 0.3 + 0.7;
        const glowHue = (t * 360) % 360;
        
        ctx.save();
        ctx.translate(width / 2, 150);
        
        for (let j = 0; j < 3; j++) {
          const radius = 95 + j * 8;
          const alpha = (1 - j * 0.3) * pulse;
          ctx.strokeStyle = `hsla(${glowHue}, 100%, 60%, ${alpha})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.beginPath();
        ctx.arc(0, 0, 85, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImage, -85, -85, 170, 170);
        ctx.restore();
        
        ctx.font = "bold 36px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = `hsl(${(glowHue + 180) % 360}, 100%, 80%)`;
        ctx.fillText(name, width / 2, 270);
        
        ctx.font = "22px Arial, sans-serif";
        const startY = 310;
        const spacing = 35;
        
        const info = [
          { icon: "👤", label: "Gender", value: gender },
          { icon: "🆔", label: "UID", value: uid },
          { icon: "💰", label: "Money", value: `$${money.toLocaleString()}` },
          { icon: "⭐", label: "EXP", value: exp.toLocaleString() },
          { icon: "🎯", label: "Level", value: level }
        ];
        
        info.forEach((item, idx) => {
          const y = startY + idx * spacing;
          const itemHue = (glowHue + idx * 72) % 360;
          ctx.fillStyle = `hsl(${itemHue}, 90%, 75%)`;
          ctx.fillText(`${item.icon} ${item.label}: ${item.value}`, width / 2, y);
        });
        
        const borderPulse = Math.sin(t * Math.PI * 4) * 0.4 + 0.6;
        ctx.strokeStyle = `hsla(${glowHue}, 100%, 60%, ${borderPulse})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(15, 15, width - 30, height - 30);
        
        const corners = [
          [15, 15], [width - 35, 15], 
          [15, height - 35], [width - 35, height - 35]
        ];
        
        ctx.fillStyle = `hsla(${glowHue}, 100%, 70%, ${borderPulse})`;
        corners.forEach(([x, y]) => {
          ctx.fillRect(x, y, 20, 20);
        });
        
        encoder.addFrame(ctx);
      }
      
      encoder.finish();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const stream = fs.createReadStream(outputPath);
      
      await message.reply({
        body: getLang("success"),
        attachment: stream
      });
      
      setTimeout(() => {
        fs.unlink(outputPath).catch(err => console.error("Cleanup error:", err));
      }, 5000);
      
    } catch (error) {
      console.error("JKSJE Error:", error);
      return message.reply(getLang("error", { error: error.message || "Failed to create info card" }));
    }
  }
};