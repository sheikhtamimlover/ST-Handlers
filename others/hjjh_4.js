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
    description: "Beautiful animated balance card with user avatar and lightning effects",
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
      
      const width = 900;
      const height = 600;
      const frames = 150;
      
      const cachePath = path.join(__dirname, "cache");
      await fs.ensureDir(cachePath);
      const outputPath = path.join(cachePath, `balance_${Date.now()}.gif`);
      
      const encoder = new GIFEncoder(width, height);
      const writeStream = fs.createWriteStream(outputPath);
      encoder.createReadStream().pipe(writeStream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(45);
      encoder.setQuality(18);
      
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      const avatarResponse = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      const avatarBuffer = Buffer.from(avatarResponse.data);
      const avatarImage = await loadImage(avatarBuffer);
      
      const r = 220;
      const g = 20;
      const b = 60;
      
      for (let i = 0; i < frames; i++) {
        const t = i / frames;
        
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.5);
        bgGrad.addColorStop(0, `rgb(${Math.floor(r * 0.2)}, ${Math.floor(g * 0.2)}, ${Math.floor(b * 0.2)})`);
        bgGrad.addColorStop(0.5, `rgb(${Math.floor(r * 0.12)}, ${Math.floor(g * 0.12)}, ${Math.floor(b * 0.12)})`);
        bgGrad.addColorStop(1, `rgb(${Math.floor(r * 0.05)}, ${Math.floor(g * 0.05)}, ${Math.floor(b * 0.05)})`);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
        
        for (let p = 0; p < 40; p++) {
          const px = (width * ((p * 0.618 + t * 0.15) % 1));
          const py = (height * ((p * 0.382 + t * 0.1) % 1));
          const pSize = Math.max(1, Math.sin(t * Math.PI * 2 + p) * 1.8 + 2);
          const pAlpha = Math.sin(t * Math.PI * 3 + p * 0.5) * 0.25 + 0.35;
          
          ctx.fillStyle = `rgba(${r}, ${Math.floor(g * 2)}, ${Math.floor(b * 1.5)}, ${pAlpha})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        const cardX = 60;
        const cardY = 60;
        const cardW = 780;
        const cardH = 480;
        const cornerRadius = 35;
        
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
        cardGrad.addColorStop(0, `rgba(${Math.floor(r * 0.3)}, ${Math.floor(g * 0.3)}, ${Math.floor(b * 0.3)}, 0.96)`);
        cardGrad.addColorStop(0.5, `rgba(${Math.floor(r * 0.4)}, ${Math.floor(g * 0.4)}, ${Math.floor(b * 0.4)}, 0.96)`);
        cardGrad.addColorStop(1, `rgba(${Math.floor(r * 0.3)}, ${Math.floor(g * 0.3)}, ${Math.floor(b * 0.3)}, 0.96)`);
        ctx.fillStyle = cardGrad;
        ctx.fill();
        
        const borderPulse = Math.sin(t * Math.PI * 2.5) * 0.25 + 0.75;
        ctx.shadowColor = `rgba(${r}, ${Math.floor(g * 3)}, ${Math.floor(b * 1.5)}, ${borderPulse * 0.7})`;
        ctx.shadowBlur = 35;
        ctx.strokeStyle = `rgba(${r}, ${Math.floor(g * 3)}, ${Math.floor(b * 1.5)}, ${borderPulse})`;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
        
        const shinePos = t;
        const shineX = cardX + cardW * shinePos;
        const shineWidth = 200;
        const shineIntensity = Math.sin(t * Math.PI) * 0.65 + 0.25;
        
        const shineGrad = ctx.createLinearGradient(shineX - shineWidth, cardY, shineX + shineWidth, cardY + cardH);
        shineGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        shineGrad.addColorStop(0.25, `rgba(255, 220, 220, ${shineIntensity * 0.35})`);
        shineGrad.addColorStop(0.5, `rgba(255, 240, 240, ${shineIntensity})`);
        shineGrad.addColorStop(0.75, `rgba(255, 220, 220, ${shineIntensity * 0.35})`);
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
        
        const avatarSize = 150;
        const avatarX = cardX + 50;
        const avatarY = cardY + 50;
        
        ctx.save();
        
        const lightningTrigger = Math.sin(t * Math.PI * 10);
        if (lightningTrigger > 0.85) {
          const lightningIntensity = (lightningTrigger - 0.85) / 0.15;
          ctx.shadowColor = `rgba(255, 255, 255, ${lightningIntensity})`;
          ctx.shadowBlur = 60 * lightningIntensity;
          ctx.strokeStyle = `rgba(255, 255, 255, ${lightningIntensity * 0.9})`;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 10, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        
        const avatarPulse = Math.sin(t * Math.PI * 2.5) * 0.25 + 0.75;
        
        for (let ring = 0; ring < 4; ring++) {
          const ringRadius = Math.max(1, avatarSize / 2 + 10 + ring * 7);
          const ringAlpha = (1 - ring * 0.25) * avatarPulse * 0.7;
          const ringGrad = ctx.createRadialGradient(avatarX + avatarSize / 2, avatarY + avatarSize / 2, ringRadius - 3, avatarX + avatarSize / 2, avatarY + avatarSize / 2, ringRadius);
          ringGrad.addColorStop(0, `rgba(${r}, ${Math.floor(g * 5)}, ${Math.floor(b * 2)}, ${ringAlpha})`);
          ringGrad.addColorStop(1, `rgba(${r}, ${Math.floor(g * 3)}, ${Math.floor(b * 1.5)}, ${ringAlpha * 0.5})`);
          ctx.strokeStyle = ringGrad;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.shadowColor = `rgba(${r}, ${Math.floor(g * 4)}, ${Math.floor(b * 2)}, 0.6)`;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 50px Arial";
        ctx.textAlign = "left";
        ctx.shadowColor = `rgba(${r}, 0, ${Math.floor(b * 0.5)}, 0.8)`;
        ctx.shadowBlur = 15;
        ctx.fillText("💎 PREMIUM", cardX + 240, cardY + 85);
        ctx.shadowBlur = 0;
        
        const namePulse = Math.sin(t * Math.PI * 2) * 0.2 + 0.8;
        const nameGrad = ctx.createLinearGradient(cardX + 240, cardY + 115, cardX + 650, cardY + 150);
        nameGrad.addColorStop(0, `rgba(${r}, ${Math.floor(g * 3)}, ${Math.floor(b * 1.5)}, ${namePulse})`);
        nameGrad.addColorStop(0.5, `rgba(255, 255, 255, ${namePulse})`);
        nameGrad.addColorStop(1, `rgba(${r}, ${Math.floor(g * 3)}, ${Math.floor(b * 1.5)}, ${namePulse})`);
        ctx.fillStyle = nameGrad;
        ctx.font = "bold 36px Arial";
        ctx.shadowColor = `rgba(${r}, ${Math.floor(g * 4)}, ${Math.floor(b * 2)}, 0.9)`;
        ctx.shadowBlur = 20;
        ctx.fillText(name, cardX + 240, cardY + 140);
        ctx.shadowBlur = 0;
        
        const dataY = cardY + 260;
        const dataSpacing = 65;
        
        const balanceInfo = [
          { emoji: "💰", label: "Balance", value: `$${money.toLocaleString()}` },
          { emoji: "⭐", label: "Experience", value: exp.toLocaleString() },
          { emoji: "🎯", label: "Level", value: `Level ${level}` }
        ];
        
        balanceInfo.forEach((item, idx) => {
          const y = dataY + idx * dataSpacing;
          const itemPulse = Math.sin(t * Math.PI * 2.5 + idx * 1) * 0.2 + 0.8;
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
          ctx.font = "bold 28px Arial";
          ctx.fillText(`${item.emoji} ${item.label}`, cardX + 50, y);
          
          const valueGrad = ctx.createLinearGradient(cardX + cardW - 280, y - 30, cardX + cardW - 50, y + 10);
          valueGrad.addColorStop(0, `rgba(${r}, ${Math.floor(g * 4)}, ${Math.floor(b * 1.8)}, ${itemPulse})`);
          valueGrad.addColorStop(1, `rgba(255, ${Math.floor(g * 8)}, ${Math.floor(b * 2.5)}, ${itemPulse})`);
          ctx.fillStyle = valueGrad;
          ctx.shadowColor = `rgba(${r}, ${Math.floor(g * 5)}, ${Math.floor(b * 2)}, ${itemPulse * 0.9})`;
          ctx.shadowBlur = 22 * itemPulse;
          ctx.font = "bold 32px Arial";
          ctx.textAlign = "right";
          ctx.fillText(item.value, cardX + cardW - 50, y);
          ctx.shadowBlur = 0;
          ctx.textAlign = "left";
        });
        
        const glowCount = 15;
        for (let g = 0; g < glowCount; g++) {
          const angle = (t * Math.PI * 2) + (g * Math.PI * 2 / glowCount);
          const radius = 55;
          const glowX = cardX + cardW - 90 + Math.cos(angle) * radius;
          const glowY = cardY + 75 + Math.sin(angle) * radius;
          const glowSize = Math.max(1, Math.sin(t * Math.PI * 8 + g) * 5 + 7);
          const glowAlpha = Math.sin(t * Math.PI * 6 + g * 0.8) * 0.4 + 0.5;
          
          const outerRadius = Math.max(1, glowSize * 3);
          const glowGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, outerRadius);
          glowGrad.addColorStop(0, `rgba(${r}, ${Math.floor(g * 6)}, ${Math.floor(b * 2.5)}, ${glowAlpha})`);
          glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(glowX, glowY, outerRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        const corners = [
          [cardX + 25, cardY + 25],
          [cardX + cardW - 50, cardY + 25],
          [cardX + 25, cardY + cardH - 50],
          [cardX + cardW - 50, cardY + cardH - 50]
        ];
        
        const cornerPulse = Math.sin(t * Math.PI * 4) * 0.3 + 0.7;
        corners.forEach(([cx, cy]) => {
          const cornerGrad = ctx.createRadialGradient(cx + 12.5, cy + 12.5, 0, cx + 12.5, cy + 12.5, 25);
          cornerGrad.addColorStop(0, `rgba(${r}, ${Math.floor(g * 5)}, ${Math.floor(b * 2)}, ${cornerPulse})`);
          cornerGrad.addColorStop(1, `rgba(${r}, ${Math.floor(g * 3)}, ${Math.floor(b * 1.5)}, ${cornerPulse * 0.5})`);
          ctx.fillStyle = cornerGrad;
          ctx.fillRect(cx, cy, 25, 25);
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