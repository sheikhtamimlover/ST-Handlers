const fs = require("fs-extra");
const path = require("path");
const { createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "upx_1",
    aliases: ["uptime", "runtime"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Display bot uptime with beautiful canvas design",
    category: "info",
    guide: "{pn} - Show bot uptime with canvas image"
  },
  langs: {
    en: {
      generating: "⏳ Generating uptime canvas...",
      error: "❌ Error: {error}"
    }
  },
  ST: async function({ message, event, getLang }) {
    try {
      await message.reply(getLang("generating"));

      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const width = 800;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#667eea");
      gradient.addColorStop(0.5, "#764ba2");
      gradient.addColorStop(1, "#f093fb");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.strokeRect(15, 15, width - 30, height - 30);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 50px Arial";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      ctx.fillText("🤖 BOT UPTIME", width / 2, 80);
      ctx.shadowBlur = 0;

      const boxY = 130;
      const boxHeight = 200;
      const boxPadding = 40;

      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(boxPadding, boxY, width - boxPadding * 2, boxHeight);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(boxPadding, boxY, width - boxPadding * 2, boxHeight);

      const timeData = [
        { label: "Days", value: days, color: "#ff6b6b" },
        { label: "Hours", value: hours, color: "#4ecdc4" },
        { label: "Minutes", value: minutes, color: "#ffe66d" },
        { label: "Seconds", value: seconds, color: "#95e1d3" }
      ];

      const itemWidth = (width - boxPadding * 2) / 4;
      
      timeData.forEach((item, index) => {
        const x = boxPadding + index * itemWidth + itemWidth / 2;

        ctx.fillStyle = item.color;
        ctx.font = "bold 60px Arial";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        ctx.shadowBlur = 5;
        ctx.fillText(String(item.value).padStart(2, '0'), x, boxY + 90);
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Arial";
        ctx.fillText(item.label, x, boxY + 130);
      });

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`Total: ${days}d ${hours}h ${minutes}m ${seconds}s`, width / 2, 360);

      const outputPath = path.join(__dirname, `temp_uptime_${Date.now()}.png`);
      const buffer = canvas.toBuffer("image/png");
      await fs.writeFile(outputPath, buffer);

      const stream = fs.createReadStream(outputPath);

      await message.reply({
        body: `⏰ Bot has been running for:\n📅 ${days} days\n⏰ ${hours} hours\n⏱️ ${minutes} minutes\n⏲️ ${seconds} seconds`,
        attachment: stream
      });

      setTimeout(() => {
        fs.unlink(outputPath).catch(err => console.error("Cleanup error:", err));
      }, 5000);

    } catch (error) {
      console.error("UPX Error:", error);
      return message.reply(getLang("error", { error: error.message || "Failed to generate uptime canvas" }));
    }
  }
};