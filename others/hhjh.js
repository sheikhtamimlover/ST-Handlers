const fs = require("fs-extra");
const path = require("path");
const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");

module.exports = {
  config: {
    name: "hhjh",
    aliases: ["balance", "bal"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Animated balance card with shiny effects",
    category: "economy",
    guide: "{pn} - Show your balance card\n{pn} @mention - Show mentioned user's balance card"
  },
  langs: {
    en: {
      generating: "💳 Creating your balance card...",
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

      await message.reply(getLang("generating"));

      const userInfo = await api.getUserInfo(targetUID);
      const user = userInfo[targetUID];
      const userData = await usersData.get(targetUID);
      
      const name = user.name || "Unknown User";
      const money = userData?.money || 0;
      const exp = userData?.exp || 0;
      const level = userData?.level || 1;
      
      const width = 800;
      const height = 500;
      const frames = 80;
      
      const outputPath = path.join(__dirname, `temp_balance_${Date.now()}.gif`);
      
      const encoder = new GIFEncoder(width, height);
      const writeStream = fs.createWriteStream(outputPath);
      encoder.createReadStream().pipe(writeStream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(35);
      encoder.setQuality(20);
      
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      
      for (let i = 0; i < frames; i++) {
        const t = i / frames;
        
        const bgGradient = ctx.createLinearGradient(0, 0, width, height);
        const hue1 = (t * 360) % 360;
        const hue2 = (t * 360 + 120) % 360;
        bgGradient.addColorStop(0, `hsl(${hue1}, 70%, 15%)`);
        bgGradient.addColorStop(0.5, `hsl(${hue2}, 60%, 20%)`);
        bgGradient.addColorStop(1, `hsl(${(hue1 + 240) % 360}, 70%, 15%)`);
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);
        
        const shine = Math.sin(t * Math.PI * 2) * 0.5 + 0.5;
        const shineGradient = ctx.createLinearGradient(
          -200 + t * (width + 400), 0, 
          t * (width + 400), height
        );
        shineGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
        shineGradient.addColorStop(0.5, `rgba(255, 255, 255, ${shine * 0.3})`);
        shineGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = shineGradient;
        ctx.fillRect(0, 0, width, height);
        
        const cardX = 100;
        const cardY = 80;
        const cardWidth = 600;
        const cardHeight = 340;
        const radius = 25;
        
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cardX + radius, cardY);
        ctx.lineTo(cardX + cardWidth - radius, cardY);
        ctx.arcTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius, radius);
        ctx.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
        ctx.arcTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - radius, cardY + cardHeight, radius);
        ctx.lineTo(cardX + radius, cardY + cardHeight);
        ctx.arcTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius, radius);
        ctx.lineTo(cardX, cardY + radius);
        ctx.arcTo(cardX, cardY, cardX + radius, cardY, radius);
        ctx.closePath();
        
        const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
        cardGradient.addColorStop(0, `hsla(${(t * 360 + 60) % 360}, 80%, 25%, 0.95)`);
        cardGradient.addColorStop(0.5, `hsla(${(t * 360 + 180) % 360}, 70%, 30%, 0.95)`);
        cardGradient.addColorStop(1, `hsla(${(t * 360 + 300) % 360}, 80%, 25%, 0.95)`);
        ctx.fillStyle = cardGradient;
        ctx.fill();
        
        const glowIntensity = Math.sin(t * Math.PI * 3) * 0.4 + 0.6;
        ctx.shadowColor = `hsla(${(t * 360) % 360}, 100%, 60%, ${glowIntensity})`;
        ctx.shadowBlur = 25;
        ctx.strokeStyle = `hsla(${(t * 360) % 360}, 100%, 70%, ${glowIntensity})`;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
        
        const lightX = cardX + (cardWidth * (0.2 + t * 0.6));
        const lightGradient = ctx.createRadialGradient(lightX, cardY + 100, 0, lightX, cardY + 100, 200);
        lightGradient.addColorStop(0, `rgba(255, 255, 255, ${shine * 0.4})`);
        lightGradient.addColorStop(0.5, `rgba(255, 255, 255, ${shine * 0.2})`);
        lightGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cardX + radius, cardY);
        ctx.lineTo(cardX + cardWidth - radius, cardY);
        ctx.arcTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + radius, radius);
        ctx.lineTo(cardX + cardWidth, cardY + cardHeight - radius);
        ctx.arcTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - radius, cardY + cardHeight, radius);
        ctx.lineTo(cardX + radius, cardY + cardHeight);
        ctx.arcTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - radius, radius);
        ctx.lineTo(cardX, cardY + radius);
        ctx.arcTo(cardX, cardY, cardX + radius, cardY, radius);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = lightGradient;
        ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
        ctx.restore();
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "left";
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 8;
        ctx.fillText("💳 BALANCE CARD", cardX + 30, cardY + 60);
        ctx.shadowBlur = 0;
        
        const pulse = Math.sin(t * Math.PI * 4) * 0.2 + 0.8;
        ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
        ctx.font = "bold 28px Arial";
        ctx.fillText(name, cardX + 30, cardY + 110);
        
        const infoY = cardY + 160;
        const lineSpacing = 50;
        
        const balanceData = [
          { icon: "💰", label: "Balance", value: `$${money.toLocaleString()}`, color: "#ffd700" },
          { icon: "⭐", label: "Experience", value: exp.toLocaleString(), color: "#00d4ff" },
          { icon: "🎯", label: "Level", value: level, color: "#ff6b9d" }
        ];
        
        balanceData.forEach((item, idx) => {
          const y = infoY + idx * lineSpacing;
          const itemPulse = Math.sin(t * Math.PI * 2 + idx) * 0.3 + 0.7;
          
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.font = "bold 22px Arial";
          ctx.fillText(`${item.icon} ${item.label}:`, cardX + 30, y);
          
          ctx.fillStyle = item.color;
          ctx.shadowColor = item.color;
          ctx.shadowBlur = 15 * itemPulse;
          ctx.font = "bold 26px Arial";
          ctx.textAlign = "right";
          ctx.fillText(item.value, cardX + cardWidth - 30, y);
          ctx.shadowBlur = 0;
          ctx.textAlign = "left";
        });
        
        const sparkles = 8;
        for (let s = 0; s < sparkles; s++) {
          const angle = (t * Math.PI * 2) + (s * Math.PI * 2 / sparkles);
          const sparkleX = cardX + cardWidth - 80 + Math.cos(angle) * 40;
          const sparkleY = cardY + 60 + Math.sin(angle) * 40;
          const sparkleSize = Math.sin(t * Math.PI * 6 + s) * 3 + 5;
          
          ctx.fillStyle = `hsla(${(t * 360 + s * 45) % 360}, 100%, 70%, ${Math.sin(t * Math.PI * 4 + s) * 0.5 + 0.5})`;
          ctx.beginPath();
          ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        encoder.addFrame(ctx);
      }
      
      encoder.finish();
      
      await new Promise(resolve => writeStream.on("finish", resolve));
      
      const attachment = fs.createReadStream(outputPath);
      
      await message.reply({
        body: `💳 ${name}'s Balance Card\n\n💰 Balance: $${money.toLocaleString()}\n⭐ Experience: ${exp.toLocaleString()}\n🎯 Level: ${level}`,
        attachment: attachment
      });
      
      setTimeout(() => {
        fs.unlink(outputPath).catch(() => {});
      }, 10000);
      
    } catch (error) {
      console.error("HHJH Error:", error);
      return message.reply(getLang("error", { error: error.message || "Failed to create balance card" }));
    }
  }
};