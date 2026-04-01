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
    description: "Professional animated balance card with chip, account number and VISA branding",
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
      
      const accountNumber = targetUID.slice(-16).padStart(16, '0').match(/.{1,4}/g).join(' ');
      
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
        
        const chipX = cardX + 50;
        const chipY = cardY + 45;
        const chipW = 70;
        const chipH = 55;
        const chipRadius = 8;
        
        ctx.save();
        const chipPulse = Math.sin(t * Math.PI * 3) * 0.2 + 0.8;
        
        const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
        chipGrad.addColorStop(0, `rgba(255, 215, 0, ${chipPulse})`);
        chipGrad.addColorStop(0.5, `rgba(255, 230, 100, ${chipPulse})`);
        chipGrad.addColorStop(1, `rgba(255, 215, 0, ${chipPulse})`);
        
        ctx.fillStyle = chipGrad;
        ctx.beginPath();
        ctx.moveTo(chipX + chipRadius, chipY);
        ctx.lineTo(chipX + chipW - chipRadius, chipY);
        ctx.quadraticCurveTo(chipX + chipW, chipY, chipX + chipW, chipY + chipRadius);
        ctx.lineTo(chipX + chipW, chipY + chipH - chipRadius);
        ctx.quadraticCurveTo(chipX + chipW, chipY + chipH, chipX + chipW - chipRadius, chipY + chipH);
        ctx.lineTo(chipX + chipRadius, chipY + chipH);
        ctx.quadraticCurveTo(chipX, chipY + chipH, chipX, chipY + chipH - chipRadius);
        ctx.lineTo(chipX, chipY + chipRadius);
        ctx.quadraticCurveTo(chipX, chipY, chipX + chipRadius, chipY);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = `rgba(200, 160, 0, ${chipPulse})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.strokeStyle = `rgba(180, 140, 0, ${chipPulse * 0.8})`;
        ctx.lineWidth = 1;
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 5; col++) {
            const dotX = chipX + 12 + col * 12;
            const dotY = chipY + 12 + row * 12;
            ctx.strokeRect(dotX, dotY, 8, 8);
          }
        }
        ctx.restore();
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.font = "italic bold 18px Arial";
        ctx.textAlign = "left";
        ctx.fillText("CHIP CARD", chipX + chipW + 15, chipY + 35);
        
        const visaPulse = Math.sin(t * Math.PI * 2) * 0.15 + 0.85;
        ctx.fillStyle = `rgba(255, 255, 255, ${visaPulse})`;
        ctx.font = "italic bold 65px Arial";
        ctx.textAlign = "right";
        ctx.shadowColor = `rgba(${r}, ${Math.floor(g * 4)}, ${Math.floor(b * 2)}, 0.8)`;
        ctx.shadowBlur = 15;
        ctx.fillText("VISA", cardX + cardW - 50, cardY + 85);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.fillText("PREMIUM MEMBER", cardX + 50, cardY + 135);
        
        const avatarSize = 90;
        const avatarX = cardX + cardW - 140;
        const avatarY = cardY + 30;
        
        ctx.save();
        
        const lightningTrigger = Math.sin(t * Math.PI * 10);
        if (lightningTrigger > 0.85) {
          const lightningIntensity = (lightningTrigger - 0.85) / 0.15;
          ctx.shadowColor = `rgba(255, 255, 255, ${lightningIntensity})`;
          ctx.shadowBlur = 50 * lightningIntensity;
          ctx.strokeStyle = `rgba(255, 255, 255, ${lightningIntensity * 0.9})`;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        
        const avatarPulse = Math.sin(t * Math.PI * 2.5) * 0.2 + 0.8;
        
        for (let ring = 0; ring < 3; ring++) {
          const ringRadius = Math.max(1, avatarSize / 2 + 5 + ring * 5);
          const ringAlpha = (1 - ring * 0.3) * avatarPulse * 0.6;
          const ringGrad = ctx.createRadialGradient(avatarX + avatarSize / 2, avatarY + avatarSize / 2, ringRadius - 2, avatarX + avatarSize / 2, avatarY + avatarSize / 2, ringRadius);
          ringGrad.addColorStop(0, `rgba(${r}, ${Math.floor(g * 5)}, ${Math.floor(b * 2)}, ${ringAlpha})`);
          ringGrad.addColorStop(1, `rgba(${r}, ${Math.floor(g * 3)}, ${Math.floor(b * 1.5)}, ${ringAlpha * 0.5})`);
          ctx.strokeStyle = ringGrad;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, ringRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        ctx.shadowColor = `rgba(${r}, ${Math.floor(g * 4)}, ${Math.floor(b * 2)}, 0.6)`;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.font = "12px monospace";
        ctx.textAlign = "left";
        ctx.fillText("CARD NUMBER", cardX + 50, cardY + 175);
        
        const numberPulse = Math.sin(t * Math.PI * 1.5) * 0.15 + 0.85;
        ctx.fillStyle = `rgba(255, 255, 255, ${numberPulse})`;
        ctx.font = "bold 28px monospace";
        ctx.shadowColor = `rgba(${r}, ${Math.floor(g * 3)}, ${Math.floor(b * 1.5)}, 0.6)`;
        ctx.shadowBlur = 10;
        ctx.fillText(accountNumber, cardX + 50, cardY + 210);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.font = "11px Arial";
        ctx.fillText("CARD HOLDER", cardX + 50, cardY + 250);
        
        const namePulse = Math.sin(t * Math.PI * 2) * 0.15 + 0.85;
        const nameGrad = ctx.createLinearGradient(cardX + 50, cardY + 265, cardX + 400, cardY + 285);
        nameGrad.addColorStop(0, `rgba(${r}, ${Math.floor(g * 3)}, ${Math.floor(b * 1.5)}, ${namePulse})`);
        nameGrad.addColorStop(0.5, `rgba(255, 255, 255, ${namePulse})`);
        nameGrad.addColorStop(1, `rgba(${r}, ${Math.floor(g * 3)}, ${Math.floor(b * 1.5)}, ${namePulse})`);
        ctx.fillStyle = nameGrad;
        ctx.font = "bold 26px Arial";
        ctx.shadowColor = `rgba(${r}, ${Math.floor(g * 4)}, ${Math.floor(b * 2)}, 0.8)`;
        ctx.shadowBlur = 15;
        ctx.fillText(name.toUpperCase(), cardX + 50, cardY + 280);
        ctx.shadowBlur = 0;
        
        const validThru = new Date();
        validThru.setFullYear(validThru.getFullYear() + 3);
        const expiryDate = `${String(validThru.getMonth() + 1).padStart(2, '0')}/${String(validThru.getFullYear()).slice(-2)}`;
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.font = "10px Arial";
        ctx.textAlign = "right";
        ctx.fillText("VALID THRU", cardX + cardW - 60, cardY + 250);
        
        ctx.fillStyle = `rgba(255, 255, 255, ${numberPulse})`;
        ctx.font = "bold 20px monospace";
        ctx.fillText(expiryDate, cardX + cardW - 60, cardY + 275);
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.font = "11px Arial";
        ctx.textAlign = "left";
        ctx.fillText("ACCOUNT DETAILS", cardX + 50, cardY + 330);
        
        const dataY = cardY + 360;
        const dataSpacing = 40;
        
        const balanceInfo = [
          { emoji: "💰", label: "Balance", value: `$${money.toLocaleString()}` },
          { emoji: "⭐", label: "Experience", value: `${exp.toLocaleString()} XP` },
          { emoji: "🎯", label: "Level", value: `Level ${level}` }
        ];
        
        balanceInfo.forEach((item, idx) => {
          const y = dataY + idx * dataSpacing;
          const itemPulse = Math.sin(t * Math.PI * 2.5 + idx * 1) * 0.15 + 0.85;
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
          ctx.font = "bold 20px Arial";
          ctx.textAlign = "left";
          ctx.fillText(`${item.emoji} ${item.label}`, cardX + 50, y);
          
          const valueGrad = ctx.createLinearGradient(cardX + cardW - 250, y - 20, cardX + cardW - 50, y + 5);
          valueGrad.addColorStop(0, `rgba(${r}, ${Math.floor(g * 4)}, ${Math.floor(b * 1.8)}, ${itemPulse})`);
          valueGrad.addColorStop(1, `rgba(255, ${Math.floor(g * 8)}, ${Math.floor(b * 2.5)}, ${itemPulse})`);
          ctx.fillStyle = valueGrad;
          ctx.shadowColor = `rgba(${r}, ${Math.floor(g * 5)}, ${Math.floor(b * 2)}, ${itemPulse * 0.8})`;
          ctx.shadowBlur = 18 * itemPulse;
          ctx.font = "bold 24px Arial";
          ctx.textAlign = "right";
          ctx.fillText(item.value, cardX + cardW - 50, y);
          ctx.shadowBlur = 0;
        });
        
        const glowCount = 12;
        for (let g = 0; g < glowCount; g++) {
          const angle = (t * Math.PI * 2) + (g * Math.PI * 2 / glowCount);
          const radius = 45;
          const glowX = cardX + 35 + Math.cos(angle) * radius;
          const glowY = cardY + cardH - 35 + Math.sin(angle) * radius;
          const glowSize = Math.max(1, Math.sin(t * Math.PI * 8 + g) * 4 + 5);
          const glowAlpha = Math.sin(t * Math.PI * 6 + g * 0.8) * 0.35 + 0.45;
          
          const outerRadius = Math.max(1, glowSize * 2.5);
          const glowGrad = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, outerRadius);
          glowGrad.addColorStop(0, `rgba(${r}, ${Math.floor(g * 6)}, ${Math.floor(b * 2.5)}, ${glowAlpha})`);
          glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(glowX, glowY, outerRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        const hologramPulse = Math.sin(t * Math.PI * 4) * 0.4 + 0.6;
        const hologramGrad = ctx.createRadialGradient(cardX + cardW - 50, cardY + cardH - 50, 0, cardX + cardW - 50, cardY + cardH - 50, 40);
        hologramGrad.addColorStop(0, `rgba(100, 200, 255, ${hologramPulse * 0.6})`);
        hologramGrad.addColorStop(0.5, `rgba(255, 100, 200, ${hologramPulse * 0.4})`);
        hologramGrad.addColorStop(1, `rgba(255, 255, 100, ${hologramPulse * 0.2})`);
        ctx.fillStyle = hologramGrad;
        ctx.beginPath();
        ctx.arc(cardX + cardW - 50, cardY + cardH - 50, 35, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(255, 255, 255, ${hologramPulse})`;
        ctx.font = "bold 12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("SECURE", cardX + cardW - 50, cardY + cardH - 45);
        
        encoder.addFrame(ctx);
      }
      
      encoder.finish();
      
      await new Promise(resolve => writeStream.on("finish", resolve));
      
      const attachment = fs.createReadStream(outputPath);
      
      await message.reply({
        body: `💎 ${name}'s Premium VISA Card\n\n💳 Account: ${accountNumber}\n💰 Balance: $${money.toLocaleString()}\n⭐ Experience: ${exp.toLocaleString()} XP\n🎯 Level: ${level}\n\n✨ Valid Thru: ${new Date(Date.now() + 94608000000).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}`,
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