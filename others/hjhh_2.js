const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");
const GIFEncoder = require("gifencoder");

module.exports = {
  config: {
    name: "hjhh",
    aliases: [],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Beautiful animated balance card with user avatar and shiny effects",
    category: "economy",
    guide: "{pn} - Show your balance card\n{pn} @mention - Show mentioned user's balance\n{pn} reply - Show replied user's balance"
  },
  langs: {
    en: {
      creating: "💎 Creating premium balance card...",
      error: "❌ Error: "
    }
  },
  ST: async function({ message, event, api, getLang, usersData }) {
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
      const money = userData?.money || 0;
      const exp = userData?.exp || 0;
      const level = userData?.level || 1;
      
      const avatarUrl = `https://graph.facebook.com/${targetUID}/picture?width=400&height=400&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      
      const width = 900;
      const height = 550;
      const frames = 80;
      
      const cachePath = path.join(__dirname, "cache");
      await fs.ensureDir(cachePath);
      const outputPath = path.join(cachePath, `balance_${Date.now()}.gif`);
      
      const encoder = new GIFEncoder(width, height);
      const writeStream = fs.createWriteStream(outputPath);
      encoder.createReadStream().pipe(writeStream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(35);
      encoder.setQuality(20);
      
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      const avatarResponse = await axios.get(avatarUrl, { responseType: "arraybuffer" });
      const avatarBuffer = Buffer.from(avatarResponse.data);
      const avatarImage = await loadImage(avatarBuffer);
      
      for (let i = 0; i < frames; i++) {
        const t = i / frames;
        
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.3);
        const hue = (t * 360) % 360;
        bgGrad.addColorStop(0, `hsl(${hue}, 65%, 10%)`);
        bgGrad.addColorStop(0.5, `hsl(${(hue + 80) % 360}, 55%, 6%)`);
        bgGrad.addColorStop(1, `hsl(${(hue + 160) % 360}, 45%, 3%)`);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
        
        for (let p = 0; p < 50; p++) {
          const px = (width * ((p * 0.618 + t) % 1));
          const py = (height * ((p * 0.382 + t * 0.6) % 1));
          const pSize = Math.max(1, Math.sin(t * Math.PI * 3 + p) * 2.5 + 2);
          const pAlpha = Math.sin(t * Math.PI * 5 + p * 0.8) * 0.4 + 0.4;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${pAlpha})`;
          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        const cardX = 100;
        const cardY = 75;
        const cardW = 700;
        const cardH = 400;
        const radius = 35;
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cardX + radius, cardY);
        ctx.lineTo(cardX + cardW - radius, cardY);
        ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
        ctx.lineTo(cardX + cardW, cardY + cardH - radius);
        ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
        ctx.lineTo(cardX + radius, cardY + cardH);
        ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
        ctx.lineTo(cardX, cardY + radius);
        ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
        ctx.closePath();
        
        const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
        const cardHue = (t * 360 + 30) % 360;
        cardGrad.addColorStop(0, `hsla(${cardHue}, 80%, 18%, 0.97)`);
        cardGrad.addColorStop(0.25, `hsla(${(cardHue + 70) % 360}, 70%, 23%, 0.97)`);
        cardGrad.addColorStop(0.5, `hsla(${(cardHue + 140) % 360}, 75%, 20%, 0.97)`);
        cardGrad.addColorStop(0.75, `hsla(${(cardHue + 210) % 360}, 70%, 23%, 0.97)`);
        cardGrad.addColorStop(1, `hsla(${(cardHue + 280) % 360}, 80%, 18%, 0.97)`);
        ctx.fillStyle = cardGrad;
        ctx.fill();
        
        const borderPulse = Math.sin(t * Math.PI * 4) * 0.4 + 0.6;
        ctx.shadowColor = `hsla(${(t * 360) % 360}, 100%, 65%, ${borderPulse})`;
        ctx.shadowBlur = 35;
        ctx.strokeStyle = `hsla(${(t * 360) % 360}, 100%, 70%, ${borderPulse})`;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
        
        const shineX = cardX + cardW * t;
        const shineGrad = ctx.createLinearGradient(shineX - 120, cardY, shineX + 120, cardY + cardH);
        const shineIntensity = Math.sin(t * Math.PI) * 0.4;
        shineGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        shineGrad.addColorStop(0.5, `rgba(255, 255, 255, ${shineIntensity})`);
        shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cardX + radius, cardY);
        ctx.lineTo(cardX + cardW - radius, cardY);
        ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
        ctx.lineTo(cardX + cardW, cardY + cardH - radius);
        ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
        ctx.lineTo(cardX + radius, cardY + cardH);
        ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
        ctx.lineTo(cardX, cardY + radius);
        ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = shineGrad;
        ctx.fillRect(cardX, cardY, cardW, cardH);
        ctx.restore();
        
        const avatarSize = 140;
        const avatarX = cardX + 50;
        const avatarY = cardY + 50;
        
        ctx.save();
        const avatarPulse = Math.sin(t * Math.PI * 3) * 0.5 + 0.5;
        
        for (let ring = 0; ring < 4; ring++) {
          const ringRadius = Math.max(1, avatarSize / 2 + 8 + ring * 6);
          const ringAlpha = (1 - ring * 0.25) * avatarPulse;
          ctx.strokeStyle = `hsla(${(t * 360 + ring * 30) % 360}, 100%, 65%, ${ringAlpha})`;
          ctx.lineWidth = 4;
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
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "left";
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 12;
        ctx.fillText("💎 PREMIUM", cardX + 220, cardY + 70);
        ctx.shadowBlur = 0;
        
        const namePulse = Math.sin(t * Math.PI * 2.5) * 0.3 + 0.7;
        const nameGrad = ctx.createLinearGradient(cardX + 220, cardY + 90, cardX + 550, cardY + 120);
        nameGrad.addColorStop(0, `rgba(255, 215, 0, ${namePulse})`);
        nameGrad.addColorStop(0.5, `rgba(255, 255, 255, ${namePulse})`);
        nameGrad.addColorStop(1, `rgba(100, 200, 255, ${namePulse})`);
        ctx.fillStyle = nameGrad;
        ctx.font = "bold 34px Arial";
        ctx.shadowColor = "rgba(255, 215, 0, 0.9)";
        ctx.shadowBlur = 18;
        ctx.fillText(name, cardX + 220, cardY + 120);
        ctx.shadowBlur = 0;
        
        const infoStartY = cardY + 200;
        const infoSpacing = 60;
        
        const balanceData = [
          { icon: "💰", label: "Total Balance", value: `$${money.toLocaleString()}`, color: "#ffd700", hue: 50 },
          { icon: "⭐", label: "Experience", value: `${exp.toLocaleString()} XP`, color: "#00d4ff", hue: 190 },
          { icon: "🎯", label: "Level", value: `Level ${level}`, color: "#ff6b9d", hue: 330 }
        ];
        
        balanceData.forEach((item, idx) => {
          const y = infoStartY + idx * infoSpacing;
          const itemPulse = Math.sin(t * Math.PI * 3.5 + idx * 1.5) * 0.35 + 0.65;
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "bold 26px Arial";
          ctx.fillText(`${item.icon} ${item.label}`, cardX + 50, y);
          
          const valueGrad = ctx.createLinearGradient(cardX + cardW - 250, y - 25, cardX + cardW - 50, y + 5);
          valueGrad.addColorStop(0, `hsla(${item.hue}, 100%, 55%, ${itemPulse})`);
          valueGrad.addColorStop(1, `hsla(${item.hue}, 100%, 75%, ${itemPulse})`);
          ctx.fillStyle = valueGrad;
          ctx.shadowColor = item.color;
          ctx.shadowBlur = 25 * itemPulse;
          ctx.font = "bold 30px Arial";
          ctx.textAlign = "right";
          ctx.fillText(item.value, cardX + cardW - 50, y);
          ctx.shadowBlur = 0;
          ctx.textAlign = "left";
        });
        
        const sparkCount = 15;
        for (let s = 0; s < sparkCount; s++) {
          const angle = (t * Math.PI * 2) + (s * Math.PI * 2 / sparkCount);
          const sparkRadius = 60;
          const sparkX = cardX + cardW - 100 + Math.cos(angle) * sparkRadius;
          const sparkY = cardY + 80 + Math.sin(angle) * sparkRadius;
          const sparkSize = Math.max(1, Math.sin(t * Math.PI * 10 + s) * 5 + 7);
          const sparkAlpha = Math.sin(t * Math.PI * 7 + s * 0.9) * 0.5 + 0.5;
          
          const outerRadius = Math.max(1, sparkSize * 2.5);
          const sparkGrad = ctx.createRadialGradient(sparkX, sparkY, 0, sparkX, sparkY, outerRadius);
          sparkGrad.addColorStop(0, `hsla(${(t * 360 + s * 24) % 360}, 100%, 75%, ${sparkAlpha})`);
          sparkGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = sparkGrad;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, outerRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        const corners = [
          [cardX + 25, cardY + 25],
          [cardX + cardW - 50, cardY + 25],
          [cardX + 25, cardY + cardH - 50],
          [cardX + cardW - 50, cardY + cardH - 50]
        ];
        
        const cornerPulse = Math.sin(t * Math.PI * 5) * 0.5 + 0.5;
        corners.forEach(([cx, cy]) => {
          const cornerGrad = ctx.createRadialGradient(cx + 12.5, cy + 12.5, 0, cx + 12.5, cy + 12.5, 25);
          cornerGrad.addColorStop(0, `hsla(${(t * 360) % 360}, 100%, 75%, ${cornerPulse})`);
          cornerGrad.addColorStop(1, `hsla(${(t * 360) % 360}, 100%, 60%, ${cornerPulse * 0.5})`);
          ctx.fillStyle = cornerGrad;
          ctx.fillRect(cx, cy, 25, 25);
        });
        
        encoder.addFrame(ctx);
      }
      
      encoder.finish();
      
      await new Promise(resolve => writeStream.on("finish", resolve));
      
      const attachment = fs.createReadStream(outputPath);
      
      await message.reply({
        body: `💎 ${name}'s Premium Balance Card\n\n💰 Balance: $${money.toLocaleString()}\n⭐ Experience: ${exp.toLocaleString()} XP\n🎯 Level: ${level}`,
        attachment: attachment
      });
      
      setTimeout(() => {
        fs.unlink(outputPath).catch(() => {});
      }, 10000);
      
    } catch (error) {
      console.error("HJHH Error:", error);
      return message.reply(getLang("error") + (error.message || "Failed to create balance card"));
    }
  }
};