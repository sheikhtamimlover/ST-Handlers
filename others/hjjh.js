const fs = require("fs-extra");
const path = require("path");
const { createCanvas } = require("canvas");
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
    description: "Beautiful animated balance card with shiny effects",
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
      
      const width = 850;
      const height = 550;
      const frames = 90;
      
      const outputPath = path.join(__dirname, `temp_balance_${Date.now()}.gif`);
      
      const encoder = new GIFEncoder(width, height);
      const writeStream = fs.createWriteStream(outputPath);
      encoder.createReadStream().pipe(writeStream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(30);
      encoder.setQuality(15);
      
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      for (let i = 0; i < frames; i++) {
        const t = i / frames;
        
        const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width / 1.5);
        const mainHue = (t * 360) % 360;
        bgGrad.addColorStop(0, `hsl(${mainHue}, 60%, 12%)`);
        bgGrad.addColorStop(0.5, `hsl(${(mainHue + 60) % 360}, 50%, 8%)`);
        bgGrad.addColorStop(1, `hsl(${(mainHue + 120) % 360}, 40%, 5%)`);
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
        
        const particles = 40;
        for (let p = 0; p < particles; p++) {
          const px = (width * ((p * 0.618 + t) % 1));
          const py = (height * ((p * 0.382 + t * 0.5) % 1));
          const pSize = Math.sin(t * Math.PI * 2 + p) * 2 + 2;
          const pAlpha = Math.sin(t * Math.PI * 4 + p * 0.5) * 0.3 + 0.3;
          
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
        const cardHue = (t * 360 + 45) % 360;
        cardGrad.addColorStop(0, `hsla(${cardHue}, 75%, 20%, 0.98)`);
        cardGrad.addColorStop(0.3, `hsla(${(cardHue + 90) % 360}, 65%, 25%, 0.98)`);
        cardGrad.addColorStop(0.7, `hsla(${(cardHue + 180) % 360}, 70%, 22%, 0.98)`);
        cardGrad.addColorStop(1, `hsla(${(cardHue + 270) % 360}, 75%, 20%, 0.98)`);
        ctx.fillStyle = cardGrad;
        ctx.fill();
        
        const borderPulse = Math.sin(t * Math.PI * 3) * 0.35 + 0.65;
        ctx.shadowColor = `hsla(${(t * 360) % 360}, 100%, 60%, ${borderPulse})`;
        ctx.shadowBlur = 30;
        ctx.strokeStyle = `hsla(${(t * 360) % 360}, 100%, 65%, ${borderPulse})`;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
        
        const shinePos = t;
        const shineX = cardX + cardW * shinePos;
        const shineGrad = ctx.createLinearGradient(shineX - 100, cardY, shineX + 100, cardY + cardH);
        shineGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        shineGrad.addColorStop(0.5, `rgba(255, 255, 255, ${Math.sin(t * Math.PI) * 0.35})`);
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
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 45px Arial";
        ctx.textAlign = "left";
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 10;
        ctx.fillText("💎 PREMIUM CARD", cardX + 40, cardY + 65);
        ctx.shadowBlur = 0;
        
        const namePulse = Math.sin(t * Math.PI * 2) * 0.25 + 0.75;
        const nameGrad = ctx.createLinearGradient(cardX + 40, cardY + 100, cardX + 400, cardY + 130);
        nameGrad.addColorStop(0, `rgba(255, 215, 0, ${namePulse})`);
        nameGrad.addColorStop(0.5, `rgba(255, 255, 255, ${namePulse})`);
        nameGrad.addColorStop(1, `rgba(255, 215, 0, ${namePulse})`);
        ctx.fillStyle = nameGrad;
        ctx.font = "bold 32px Arial";
        ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
        ctx.shadowBlur = 15;
        ctx.fillText(name, cardX + 40, cardY + 120);
        ctx.shadowBlur = 0;
        
        const dataY = cardY + 180;
        const dataSpacing = 55;
        
        const balanceInfo = [
          { emoji: "💰", label: "Total Balance", value: `$${money.toLocaleString()}`, color: "#ffd700", hue: 45 },
          { emoji: "⭐", label: "Experience Points", value: exp.toLocaleString(), color: "#00d4ff", hue: 190 },
          { emoji: "🎯", label: "Current Level", value: `Level ${level}`, color: "#ff6b9d", hue: 330 }
        ];
        
        balanceInfo.forEach((item, idx) => {
          const y = dataY + idx * dataSpacing;
          const itemPulse = Math.sin(t * Math.PI * 3 + idx * 1.2) * 0.3 + 0.7;
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.font = "bold 24px Arial";
          ctx.fillText(`${item.emoji} ${item.label}`, cardX + 40, y);
          
          const valueGrad = ctx.createLinearGradient(cardX + cardW - 200, y - 20, cardX + cardW - 40, y);
          valueGrad.addColorStop(0, `hsla(${item.hue}, 100%, 60%, ${itemPulse})`);
          valueGrad.addColorStop(1, `hsla(${item.hue}, 100%, 80%, ${itemPulse})`);
          ctx.fillStyle = valueGrad;
          ctx.shadowColor = item.color;
          ctx.shadowBlur = 20 * itemPulse;
          ctx.font = "bold 28px Arial";
          ctx.textAlign = "right";
          ctx.fillText(item.value, cardX + cardW - 40, y);
          ctx.shadowBlur = 0;
          ctx.textAlign = "left";
        });
        
        const glowCount = 12;
        for (let g = 0; g < glowCount; g++) {
          const angle = (t * Math.PI * 2) + (g * Math.PI * 2 / glowCount);
          const radius = 50;
          const glowX = cardX + cardW - 80 + Math.cos(angle) * radius;
          const glowY = cardY + 70 + Math.sin(angle) * radius;
          const glowSize = Math.sin(t * Math.PI * 8 + g) * 4 + 6;
          const glowAlpha = Math.sin(t * Math.PI * 6 + g * 0.7) * 0.4 + 0.5;
          
          const glowGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowSize * 2);
          glowGrad.addColorStop(0, `hsla(${(t * 360 + g * 30) % 360}, 100%, 70%, ${glowAlpha})`);
          glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(glowX, glowY, glowSize * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        const corners = [
          [cardX + 20, cardY + 20],
          [cardX + cardW - 40, cardY + 20],
          [cardX + 20, cardY + cardH - 40],
          [cardX + cardW - 40, cardY + cardH - 40]
        ];
        
        const cornerPulse = Math.sin(t * Math.PI * 4) * 0.5 + 0.5;
        ctx.fillStyle = `hsla(${(t * 360) % 360}, 100%, 70%, ${cornerPulse})`;
        corners.forEach(([cx, cy]) => {
          ctx.fillRect(cx, cy, 20, 20);
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