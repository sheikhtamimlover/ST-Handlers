const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "nude",
    version: "1.0.2",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Get random nude images",
    category: "nsfw",
    guide: "{pn}"
  },

  ST: async function({ message, event, api }) {
    try {
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const cachePath = path.join(cacheDir, `nude_${event.threadID}_${Date.now()}.jpg`);

      const imageUrls = [
        "https://i.imgur.com/example1.jpg",
        "https://i.imgur.com/example2.jpg",
        "https://i.imgur.com/example3.jpg"
      ];

      const randomUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];

      const imageResponse = await axios.get(randomUrl, {
        responseType: "arraybuffer",
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      await fs.writeFile(cachePath, imageResponse.data);

      await api.sendMessage({
        body: `🔞 Random NSFW Image\n📸 Total: ${imageUrls.length}`,
        attachment: fs.createReadStream(cachePath)
      }, event.threadID, event.messageID);

      setTimeout(() => {
        fs.unlink(cachePath).catch(() => {});
      }, 5000);

    } catch (error) {
      console.error("Nude command error:", error);
      return message.reply("❌ Failed to fetch image. Please try again later!");
    }
  }
};