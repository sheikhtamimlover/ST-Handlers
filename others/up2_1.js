const fs = require("fs");
const moment = require("moment-timezone");
const { createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "up2",
    version: "1.0.0",
    credits: "AYESHA | QUEEN",
    description: "Shows bot information in an image",
    commandCategory: "utility"
  },

  onStart: async function ({ api, event }) {
    try {
      const userID = event.senderID;
      const time = moment().tz("Asia/Dhaka").format("hh:mm A");
      const uptimeSeconds = process.uptime();

      const uptime = `${Math.floor(uptimeSeconds / 86400)}d ` +
                     `${Math.floor((uptimeSeconds % 86400) / 3600)}h ` +
                     `${Math.floor((uptimeSeconds % 3600) / 60)}m ` +
                     `${Math.floor(uptimeSeconds % 60)}s`;

      // Canvas
      const width = 1600;
      const height = 700;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#1a1a3d");
      gradient.addColorStop(1, "#000015");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Border
      ctx.lineWidth = 25;
      ctx.strokeStyle = "green";
      ctx.strokeRect(0, 0, width, height);

      // Shadow
      ctx.shadowColor = "black";
      ctx.shadowBlur = 15;

      // Quick text function
      function write(color, size, text, x, y) {
        ctx.fillStyle = color;
        ctx.font = `${size}px Arial Black`;
        ctx.fillText(text, x, y);
      }

      // -------- NEW TEXT --------
      write("#ff2a7f", 70, "🤖 Bot Name: ≛⃝𝙰𝚈𝙴𝙰𝙷𝙰 𝚀𝚄𝙴𝙴𝙽👑", 80, 120);
      write("#ffbb00", 70, "📌 Global Prefix: ?", 80, 200);
      write("#00eaff", 70, `⏰ Time: ${time}`, 80, 280);
      write("#5bb3ff", 70, `⏳ Uptime: ${uptime}`, 80, 360);
      write("#ff6bff", 70, `👤 Your ID: ${userID}`, 80, 440);
      write("#ff2233", 70, "🖊 Owner: Ayesha Queen", 80, 520);

      // Save image
      const imgPath = __dirname + "/up2_output.png";
      fs.writeFileSync(imgPath, canvas.toBuffer());

      return api.sendMessage(
        {
          body: "✨ Bot Information",
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        event.messageID
      );

    } catch (e) {
      return api.sendMessage("❌ Error creating image:\n" + e, event.threadID);
    }
  }
};