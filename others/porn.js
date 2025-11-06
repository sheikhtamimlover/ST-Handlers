module.exports = {
  config: {
    name: "porn",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    description: "Random adult video (18+)",
    category: "nsfw",
    guide: {
      en: "{pn} - Get random adult video\n⚠️ 18+ Only"
    }
  },

  ST: async function({ message, args, event, api }) {
    const axios = require('axios');
    const fs = require('fs-extra');
    const path = require('path');

    const processingMsg = await message.reply("🔞 Fetching adult content...\n⏳ Please wait...");

    try {
      // Multiple API sources for adult content
      const apis = [
        'https://api-samir.onrender.com/porn',
        'https://hazeyy-apis-combine.kyrinwu.repl.co/api/random/porn',
        'https://joshweb.click/api/randomvid',
        'https://nekopoi.care/api/nsfwvid'
      ];

      let videoUrl = null;
      let title = "Random Adult Video";

      for (const apiUrl of apis) {
        try {
          const response = await axios.get(apiUrl, { timeout: 15000 });
          
          if (response.data) {
            if (response.data.url) {
              videoUrl = response.data.url;
              title = response.data.title || title;
            } else if (response.data.video) {
              videoUrl = response.data.video;
            } else if (response.data.link) {
              videoUrl = response.data.link;
            } else if (typeof response.data === 'string' && response.data.startsWith('http')) {
              videoUrl = response.data;
            }

            if (videoUrl) break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!videoUrl) {
        return message.reply("❌ Failed to fetch content. Please try again!");
      }

      const cacheDir = path.join(__dirname, 'cache');
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const videoPath = path.join(cacheDir, `porn_${Date.now()}.mp4`);

      // Download video
      const videoResponse = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        maxContentLength: 100 * 1024 * 1024, // 100MB max
        maxBodyLength: 100 * 1024 * 1024
      });

      fs.writeFileSync(videoPath, Buffer.from(videoResponse.data));

      await message.reply({
        body: `🔞 ${title}\n\n⚠️ 18+ Content Only\n📹 Video Size: ${(videoResponse.data.length / (1024 * 1024)).toFixed(2)} MB`,
        attachment: fs.createReadStream(videoPath)
      });

      // Clean up
      setTimeout(() => {
        try {
          if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }
        } catch (e) {}
      }, 60000);

      if (processingMsg && processingMsg.messageID) {
        api.unsendMessage(processingMsg.messageID);
      }

    } catch (error) {
      console.error("Porn fetch error:", error);
      
      let errorMsg = "❌ Failed to fetch content!";
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = "❌ Download timeout! Video too large or slow connection.";
      } else if (error.response && error.response.status === 404) {
        errorMsg = "❌ Content not available. Try again!";
      }
      
      return message.reply(errorMsg);
    }
  }
};