const fs = require("fs");
const moment = require("moment-timezone");
const { createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "up2",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Shows bot information in an image",
    category: "utility",
    guide: "{pn}"
  },

  ST: async function ({ api, event, message }) {
    try {
      const userID = event.senderID;
      const time = moment().tz("Asia/Dhaka").format("hh:mm A");
      const uptimeSeconds = process.uptime();

      const uptime = `${Math.floor(uptimeSeconds / 86400)}d ` +
                     `${Math.floor((uptimeSeconds % 86400) / 3600)}h ` +
                     `${Math.floor((uptimeSeconds % 3600) / 60)}m ` +
                     `${Math.floor(uptimeSeconds % 60)}s`;

      const width = 1600;
      const height = 700;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#1a1a3d");
      gradient.addColorStop(1, "#000015");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 25;
      ctx.strokeStyle = "green";
      ctx.strokeRect(0, 0, width, height);

      ctx.shadowColor = "black";
      ctx.shadowBlur = 15;

      function write(color, size, text, x, y) {
        ctx.fillStyle = color;
        ctx.font = `${size}px Arial Black`;
        ctx.fillText(text, x, y);
      }

      write("#ff2a7f", 70, "🤖 Bot Name: ≛⃝𝙰𝚈𝙴𝙰𝙷𝙰 𝚀𝚄𝙴𝙴𝙽👑", 80, 120);
      write("#ffbb00", 70, "📌 Global Prefix: ?", 80, 200);
      write("#00eaff", 70, `⏰ Time: ${time}`, 80, 280);
      write("#5bb3ff", 70, `⏳ Uptime: ${uptime}`, 80, 360);
      write("#ff6bff", 70, `👤 Your ID: ${userID}`, 80, 440);
      write("#ff2233", 70, "🖊 Owner: Ayesha Queen", 80, 520);

      const imgPath = __dirname + "/cache/up2_output.png";
      const cacheDir = __dirname + "/cache";
      
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      fs.writeFileSync(imgPath, canvas.toBuffer());

      await message.reply({
        body: "✨ Bot Information",
        attachment: fs.createReadStream(imgPath)
      });

      setTimeout(() => {
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      }, 5000);

    } catch (e) {
      return message.reply("❌ Error creating image:\n" + e.message);
    }
  }
};