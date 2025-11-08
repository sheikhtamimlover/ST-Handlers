const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

function formatUptimeShort(uptime) {
  const days = Math.floor(uptime / (24 * 60 * 60));
  const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((uptime % (60 * 60)) / 60);
  const seconds = Math.floor(uptime % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

module.exports = {
  config: {
    name: "up",
    aliases: ["uptime", "runtime"],
    version: "2.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Show bot uptime information",
    category: "system",
    guide: {
      en: "{pn} - Display bot uptime with database photo"
    }
  },

  ST: async function({ message, event, api }) {
    try {
      const uptime = process.uptime();
      const uptimeShort = formatUptimeShort(uptime);

      const now = new Date();
      const timeFormatted = now.toLocaleString('en-US', { 
        timeZone: 'Asia/Dhaka',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const dateFormatted = now.toLocaleString('en-US', { 
        timeZone: 'Asia/Dhaka',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });

      const memoryUsage = process.memoryUsage();
      const memoryUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

      const osType = os.type().toLowerCase();
      const osArch = os.arch();
      const nodeVersion = process.version;

      const imageUrls = [
        "https://i.imgur.com/3ZVqgXy.jpeg",
        "https://i.imgur.com/8rXGCDp.jpeg",
        "https://i.imgur.com/tPzzqVl.jpeg",
        "https://i.imgur.com/KL6P5uN.jpeg",
        "https://i.imgur.com/9sJ3XhN.jpeg"
      ];

      const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];

      const cacheDir = path.join(__dirname, 'cache');
      await fs.ensureDir(cacheDir);
      const imagePath = path.join(cacheDir, `uptime_${Date.now()}.jpg`);

      const response = await axios({
        method: 'GET',
        url: randomImage,
        responseType: 'stream',
        timeout: 30000
      });

      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const messageBody = `𝐁𝐎𝐓 𝐔𝐏𝐓𝐈𝐌𝐄 𝐒𝐓𝐀𝐓𝐒\n\n🕰️ ᴜᴘᴛɪᴍᴇ: ${uptimeShort}\n🦆 ᴛɪᴍᴇ: ${timeFormatted}\n📆 ᴅᴀᴛᴇ: ${dateFormatted}\n\n💾 ʀᴀᴍ ᴜꜱᴀɢᴇ: ${memoryUsedMB} MB\n🖥️ ᴏꜱ: ${osType} (${osArch})\n🛠️ ɴᴏᴅᴇ: ${nodeVersion}`;

      await message.reply({
        body: messageBody,
        attachment: fs.createReadStream(imagePath)
      });

      await fs.unlink(imagePath).catch(err => console.error("Error deleting file:", err));

    } catch (error) {
      console.error("Uptime command error:", error);
      
      const uptime = process.uptime();
      const uptimeShort = formatUptimeShort(uptime);

      const now = new Date();
      const timeFormatted = now.toLocaleString('en-US', { 
        timeZone: 'Asia/Dhaka',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });

      const dateFormatted = now.toLocaleString('en-US', { 
        timeZone: 'Asia/Dhaka',
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });

      const memoryUsage = process.memoryUsage();
      const memoryUsedMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

      const osType = os.type().toLowerCase();
      const osArch = os.arch();
      const nodeVersion = process.version;

      return message.reply(`𝐁𝐎𝐓 𝐔𝐏𝐓𝐈𝐌𝐄 𝐒𝐓𝐀𝐓𝐒\n\n🕰️ ᴜᴘᴛɪᴍᴇ: ${uptimeShort}\n🦆 ᴛɪᴍᴇ: ${timeFormatted}\n📆 ᴅᴀᴛᴇ: ${dateFormatted}\n\n💾 ʀᴀᴍ ᴜꜱᴀɢᴇ: ${memoryUsedMB} MB\n🖥️ ᴏꜱ: ${osType} (${osArch})\n🛠️ ɴᴏᴅᴇ: ${nodeVersion}`);
    }
  }
};