const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");

module.exports = {
  config: {
    name: "hjjh",
    aliases: [],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Beautiful animated balance card with user avatar and smooth color transitions",
    category: "economy",
    guide: "{pn} - Show your balance card\n{pn} @mention - Show mentioned user's balance"
  },
  langs: {
    en: {
      creating: "💎 Creating your premium balance card...",
      error: "❌ Error: {error}"
    }
  },
  ST: async function({ message, event, api, getLang, usersData }) {
    try {
      let targetUID;
      
      if (Object.keys(event.mentions).length > 0) {
        targetUID = Object.keys(event.mentions)[0];
      } else {
        targetUID = event.senderID;
      }

      await message.reply(getLang("creating"));

      const userInfo = await api.getUserInfo(targetUID);
      const user = userInfo[targetUID];
      const userData = await usersData.get(targetUID);
      
      const name = user.name || "Unknown User";
      const money = userData?.money || 0;
      const exp = userData?.exp || 0;
      const level = userData?.level || 1;
      
      const avatarUrl = `https://graph.facebook.com/${targetUID}/picture?width=400&height=400&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      const width = 850;
      const height = 550;
      const frames = 120;
      
      const cachePath = path.join(__dirname, "cache");
      await fs.ensureDir(cachePath);
      const outputPath = path.join(cachePath, `balance_${Date.now()}.gif`);
      
      const encoder = new GIFEncoder(width, height);
      const writeStream = fs.createWriteStream(outputPath);
      encoder.createReadStream().pipe(writeStream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(40);
      encoder.setQuality(18);
      
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      const avatarResponse = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      const avatarBuffer = Buffer.from(avatarResponse.data);
      const avatarImage = await loadImage(avatarBuffer);
      
      const colors = [
        { r: 220, g: 20, b: 60 },
        { r: 255, g: 105, b: 180 },
        { r: 138, g: 43, b: 226 },
        { r: 65, g: 105, b: 225 }
      ];
      
      for (let i = 0; i < frames; i++) {
        const t = i / frames;
        
        const colorIndex = Math.floor(t * colors.length * 4) % colors.length;
        const nextColorIndex = (colorIndex + 1) % colors.length;
        const colorProgress = (t * colors.length * 4) % 1;
        
        const currentColor = colors[colorIndex];
        const nextColor = colors[nextColorIndex];
        
        const r = Math.floor(currentColor.r + (nextColor.r - currentColor.r) * colorProgress);
        const g = Math.floor(currentColor.g + (nextColor.g - currentColor.g) * colorProgress);
        const b = Math.floor(currentColor.b + (nextColor.b - currentColor.b) * colorProgress);
        
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.5);
        bgGrad.addColorStop(0, `rgb(${Math.floor(r * 0.15)}, ${Math.floor(g * 0.15)}, ${Math.floor(b * 0.15)})`);
        bgGrad.addColorStop(0.5, `rgb(${Math.floor(r * 0.1)}, ${Math.floor(g * 0.1)}, ${Math.floor(b * 0.1)})`);
        bgGrad.addColorStop(1, `rgb(${Math.floor(r * 0.05)}, ${Math.floor(g * 0.05)}, ${Math.floor(b * 0.05)})`);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
        
        for (let p = 0; p < 30; p++) {
          const px = (width * ((p * 0.618 + t * 0.3) % 1));
          const py = (height * ((p * 0.382 + t * 0.2) % 1));
          const pSize = Math.max(1, Math.sin(t * Math.PI * 2 + p) * 1.5 + 1.5);
          const pAlpha = Math.sin(t * Math.PI * 3 + p * 0.5) * 0.2 + 0.3;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${pAlpha})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        const cardX = 125;
        const cardY = 100;
        const cardW = 600;
        const cardH = 350;
        const cornerRadius = 30;
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cardX + cornerRadius, cardY);
        ctx.lineTo(cardX + cardW - cornerRadius, cardY);
        ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + cornerRadius);
        ctx.lineTo(cardX + cardW, cardY + cardH - cornerRadius);
        ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - cornerRadius, cardY + cardH);
        ctx.lineTo(cardX + cornerRadius, cardY + cardH);
        ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - cornerRadius);
        ctx.lineTo(cardX, cardY + cornerRadius);
        ctx.quadraticCurveTo(cardX, cardY, cardX + cornerRadius, cardY);
        ctx.closePath();
        
        const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
        cardGrad.addColorStop(0, `rgba(${Math.floor(r * 0.25)}, ${Math.floor(g * 0.25)}, ${Math.floor(b * 0.25)}, 0.95)`);
        cardGrad.addColorStop(0.5, `rgba(${Math.floor(r * 0.35)}, ${Math.floor(g * 0.35)}, ${Math.floor(b * 0.35)}, 0.95)`);
        cardGrad.addColorStop(1, `rgba(${Math.floor(r * 0.25)}, ${Math.floor(g * 0.25)}, ${Math.floor(b * 0.25)}, 0.95)`);
        ctx.fillStyle = cardGrad;
        ctx.fill();
        
        const borderPulse = Math.sin(t * Math.PI * 2) * 0.2 + 0.8;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${borderPulse * 0.6})`;
        ctx.shadowBlur = 25;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${borderPulse})`;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
        
        const shinePos = t;
        const shineX = cardX + cardW * shinePos;
        const shineGrad = ctx.createLinearGradient(shineX - 100, cardY, shineX + 100, cardY + cardH);
        shineGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        shineGrad.addColorStop(0.5, `rgba(255, 255, 255, ${Math.sin(t * Math.PI) * 0.25})`);
        shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cardX + cornerRadius, cardY);
        ctx.lineTo(cardX + cardW - cornerRadius, cardY);
        ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + cornerRadius);
        ctx.lineTo(cardX + cardW, cardY + cardH - cornerRadius);
        ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - cornerRadius, cardY + cardH);
        ctx.lineTo(cardX + cornerRadius, cardY + cardH);
        ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - cornerRadius);
        ctx.lineTo(cardX, cardY + cornerRadius);
        ctx.quadraticCurveTo(cardX, cardY, cardX + cornerRadius, cardY);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = shineGrad;
        ctx.fillRect(cardX, cardY, cardW, cardH);
        ctx.restore();
        
        const avatarSize = 130;
        const avatarX = cardX + 40;
        const avatarY = cardY + 40;
        
        ctx.save();
        const avatarPulse = Math.sin(t * Math.PI * 2) * 0.3 + 0.7;
        
        for (let ring = 0; ring < 3; ring++) {
          const ringRadius = Math.max(1, avatarSize / 2 + 6 + ring * 5);
          const ringAlpha = (1 - ring * 0.3) * avatarPulse * 0.6;
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${ringAlpha})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 42px Arial";
        ctx.textAlign = "left";
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 10;
        ctx.fillText("💎 PREMIUM", cardX + 200, cardY + 70);
        ctx.shadowBlur = 0;
        
        const namePulse = Math.sin(t * Math.PI * 1.5) * 0.2 + 0.8;
        const nameGrad = ctx.createLinearGradient(cardX + 200, cardY + 100, cardX + 500, cardY + 130);
        nameGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${namePulse})`);
        nameGrad.addColorStop(0.5, `rgba(255, 255, 255, ${namePulse})`);
        nameGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${namePulse})`);
        ctx.fillStyle = nameGrad;
        ctx.font = "bold 30px Arial";
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
        ctx.shadowBlur = 15;
        ctx.fillText(name, cardX + 200, cardY + 120);
        ctx.shadowBlur = 0;
        
        const dataY = cardY + 200;
        const dataSpacing = 50;
        
        const balanceInfo = [
          { emoji: "💰", label: "Balance", value: `$${money.toLocaleString()}` },
          { emoji: "⭐", label: "Experience", value: exp.toLocaleString() },
          { emoji: "🎯", label: "Level", value: `Level ${level}` }
        ];
        
        balanceInfo.forEach((item, idx) => {
          const y = dataY + idx * dataSpacing;
          const itemPulse = Math.sin(t * Math.PI * 2 + idx * 0.8) * 0.2 + 0.8;
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "bold 22px Arial";
          ctx.fillText(`${item.emoji} ${item.label}`, cardX + 40, y);
          
          const valueGrad = ctx.createLinearGradient(cardX + cardW - 200, y - 20, cardX + cardW - 40, y);
          valueGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${itemPulse})`);
          valueGrad.addColorStop(1, `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, ${itemPulse})`);
          ctx.fillStyle = valueGrad;
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${itemPulse * 0.8})`;
          ctx.shadowBlur = 15 * itemPulse;
          ctx.font = "bold 26px Arial";
          ctx.textAlign = "right";
          ctx.fillText(item.value, cardX + cardW - 40, y);
          ctx.shadowBlur = 0;
          ctx.textAlign = "left";
        });
        
        const glowCount = 10;
        for (let g = 0; g < glowCount; g++) {
          const angle = (t * Math.PI * 1.5) + (g * Math.PI * 2 / glowCount);
          const radius = 45;
          const glowX = cardX + cardW - 70 + Math.cos(angle) * radius;
          const glowY = cardY + 60 + Math.sin(angle) * radius;
          const glowSize = Math.max(1, Math.sin(t * Math.PI * 6 + g) * 3 + 5);
          const glowAlpha = Math.sin(t * Math.PI * 4 + g * 0.7) * 0.3 + 0.4;
          
          const outerRadius = Math.max(1, glowSize * 2);
          const glowGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, outerRadius);
          glowGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${glowAlpha})`);
          glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(glowX, glowY, outerRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        const corners = [
          [cardX + 20, cardY + 20],
          [cardX + cardW - 35, cardY + 20],
          [cardX + 20, cardY + cardH - 35],
          [cardX + cardW - 35, cardY + cardH - 35]
        ];
        
        const cornerPulse = Math.sin(t * Math.PI * 3) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${cornerPulse})`;
        corners.forEach(([cx, cy]) => {
          ctx.fillRect(cx, cy, 15, 15);
        });
        
        encoder.addFrame(ctx);
      }
      
      encoder.finish();
      
      await new Promise(resolve => writeStream.on("finish", resolve));
      
      const attachment = fs.createReadStream(outputPath);
      
      await message.reply({
        body: `💎 ${name}'s Premium Balance Card\n\n💰 Balance: $${money.toLocaleString()}\n⭐ Experience: ${exp.toLocaleString()}\n🎯 Level: ${level}`,
        attachment: attachment
      });
      
      setTimeout(() => {
        fs.unlink(outputPath).catch(() => {});
      }, 10000);
      
    } catch (error) {
      console.error("HJJH Error:", error);
      return message.reply(getLang("error", { error: error.message || "Failed to create balance card" }));
    }
  }
};