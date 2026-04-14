const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "porn",
    aliases: ["tit", "xxx", "adult"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Get top 10 adult videos with thumbnails",
    category: "nsfw",
    guide: "{pn} [site name]\n{pn} categories - Show available sites"
  },

  langs: {
    en: {
      noApi: "❌ API service temporarily unavailable!",
      fetching: "🔍 Fetching top 10 videos...",
      error: "❌ Error occurred! Please try again.",
      invalidSite: "❌ Invalid site! Use '{pn} categories' to see available sites.",
      categories: "🔞 Available Sites:\n\n1. pornhub\n2. xvideos\n3. xnxx\n4. redtube\n5. youporn\n\nUsage: {pn} [site name]",
      noResults: "❌ No results found!",
      resultHeader: "🔞 Top 10 Videos from {site}:\n==============================\n\n"
    }
  },

  ST: async function({ message, args, event, api, getLang, commandName }) {
    const { threadID, messageID } = event;

    const isNSFWAllowed = true;

    if (!isNSFWAllowed) {
      return message.reply("❌ NSFW content is not allowed in this group!");
    }

    const input = args.join(" ").toLowerCase().trim();

    if (input === "categories" || input === "list" || !input) {
      return message.reply(getLang("categories").replace(/{pn}/g, commandName));
    }

    const validSites = ["pornhub", "xvideos", "xnxx", "redtube", "youporn"];
    const site = validSites.find(s => input.includes(s)) || input;

    if (!validSites.includes(site)) {
      return message.reply(getLang("invalidSite").replace(/{pn}/g, commandName));
    }

    message.reply(getLang("fetching"));

    try {
      const apiEndpoints = {
        pornhub: `https://www.pornhub.com/webmasters/search?thumbsize=large`,
        xvideos: `https://api-xvideos.com/api/videos/trending`,
        xnxx: `https://www.xnxx.com/api/videos/best`,
        redtube: `https://api.redtube.com/?data=redtube.Videos.searchVideos&output=json&thumbsize=big`,
        youporn: `https://www.youporn.com/api/webmasters/search.json`
      };

      const apiUrl = apiEndpoints[site];
      
      if (!apiUrl) {
        return message.reply(getLang("noApi"));
      }

      const response = await axios.get(apiUrl, {
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      let videos = [];
      
      if (site === 'pornhub') {
        videos = response.data?.videos || [];
      } else if (site === 'redtube') {
        videos = response.data?.videos || [];
      } else {
        videos = response.data?.videos || response.data?.results || response.data || [];
      }

      if (!videos || videos.length === 0) {
        return message.reply(getLang("noResults"));
      }

      const top10 = videos.slice(0, 10);
      let resultText = getLang("resultHeader").replace(/{site}/g, site.toUpperCase());

      const attachments = [];
      const tmpDir = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      for (let i = 0; i < top10.length; i++) {
        const video = top10[i];
        const title = video.title || video.name || "Untitled";
        const duration = video.duration || "N/A";
        const views = video.views || video.view_number || "N/A";
        const url = video.url || video.link || video.video_url || "#";
        const thumbnail = video.thumb || video.thumbnail || video.default_thumb || video.thumb_url || null;

        resultText += `${i + 1}. ${title}\n`;
        resultText += `   ⏱️ Duration: ${duration}\n`;
        resultText += `   👁️ Views: ${views}\n`;
        resultText += `   🔗 Link: ${url}\n\n`;

        if (thumbnail && i < 5) {
          try {
            const imgPath = path.join(tmpDir, `porn_${i}_${Date.now()}.jpg`);
            const imgResponse = await axios.get(thumbnail, {
              responseType: 'arraybuffer',
              timeout: 8000,
              headers: {
                'User-Agent': 'Mozilla/5.0'
              }
            });
            
            fs.writeFileSync(imgPath, Buffer.from(imgResponse.data));
            attachments.push(fs.createReadStream(imgPath));
          } catch (imgError) {
            console.error(`Failed to download image ${i}:`, imgError.message);
          }
        }
      }

      resultText += `\n⚠️ Content is 18+ only!\n`;
      resultText += `📊 Total videos found: ${videos.length}\n`;
      resultText += `🖼️ Showing ${attachments.length} thumbnails`;

      const messageData = {
        body: resultText
      };

      if (attachments.length > 0) {
        messageData.attachment = attachments;
      }

      await message.reply(messageData);

      setTimeout(() => {
        try {
          const files = fs.readdirSync(tmpDir);
          files.forEach(file => {
            if (file.startsWith('porn_')) {
              fs.unlinkSync(path.join(tmpDir, file));
            }
          });
        } catch (cleanError) {
          console.error("Cleanup error:", cleanError);
        }
      }, 5000);

    } catch (error) {
      console.error("Porn command error:", error);
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return message.reply("⏱️ Request timeout! Please try again.");
      }
      
      return message.reply(getLang("error") + `\n\nDetails: ${error.message}`);
    }
  }
};