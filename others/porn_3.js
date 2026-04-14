const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "porn",
    aliases: ["tit", "xxx", "adult", "nsfw"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Search and get adult videos with thumbnails and download option",
    category: "nsfw",
    guide: "{pn} <site> <search query> - Search videos\n{pn} <site> - Get trending videos\n{pn} categories - Show available sites\n\nReply with number (1-10) to download video"
  },

  langs: {
    en: {
      noApi: "❌ API service temporarily unavailable!",
      fetching: "🔍 Fetching videos...",
      searching: "🔍 Searching for: {query}...",
      downloading: "⬇️ Downloading video #{num}...\n⏳ Please wait, this may take a while...",
      error: "❌ Error occurred! Please try again.",
      invalidSite: "❌ Invalid site! Use '{pn} categories' to see available sites.",
      categories: "🔞 Available Sites:\n\n1. pornhub\n2. xvideos\n3. xnxx\n4. redtube\n5. youporn\n6. spankbang\n7. eporner\n\nUsage:\n• {pn} <site> - Trending videos\n• {pn} <site> <search> - Search videos\n\nExample: {pn} pornhub teen",
      noResults: "❌ No results found!",
      resultHeader: "🔞 Top 10 Videos from {site}:\n==============================\n\n",
      invalidNumber: "❌ Invalid number! Reply with 1-10 to download.",
      downloadComplete: "✅ Video downloaded successfully!",
      downloadError: "❌ Failed to download video. Try another one.",
      replyInstruction: "\n💡 Reply with a number (1-10) to download the video!"
    }
  },

  ST: async function({ message, args, event, api, getLang, commandName }) {
    const { threadID, messageID, senderID } = event;

    const isNSFWAllowed = true;

    if (!isNSFWAllowed) {
      return message.reply("❌ NSFW content is not allowed in this group!");
    }

    const input = args.join(" ").trim();

    if (!input || input.toLowerCase() === "categories" || input.toLowerCase() === "list") {
      return message.reply(getLang("categories").replace(/{pn}/g, commandName));
    }

    const validSites = ["pornhub", "xvideos", "xnxx", "redtube", "youporn", "spankbang", "eporner"];
    const parts = input.split(" ");
    const siteInput = parts[0].toLowerCase();
    const searchQuery = parts.slice(1).join(" ").trim();

    const site = validSites.find(s => siteInput.includes(s)) || siteInput;

    if (!validSites.includes(site)) {
      return message.reply(getLang("invalidSite").replace(/{pn}/g, commandName));
    }

    if (searchQuery) {
      message.reply(getLang("searching").replace(/{query}/g, searchQuery));
    } else {
      message.reply(getLang("fetching"));
    }

    api.sendTypingIndicator(threadID);

    try {
      const apiBase = "https://porn-api-service.vercel.app/api";
      let apiUrl = "";

      if (searchQuery) {
        apiUrl = `${apiBase}/${site}/search?q=${encodeURIComponent(searchQuery)}&limit=10`;
      } else {
        apiUrl = `${apiBase}/${site}/trending?limit=10`;
      }

      const response = await axios.get(apiUrl, {
        timeout: 25000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      let videos = response.data?.videos || response.data?.results || response.data || [];

      if (!Array.isArray(videos)) {
        videos = [videos];
      }

      if (!videos || videos.length === 0) {
        return message.reply(getLang("noResults"));
      }

      const top10 = videos.slice(0, 10);
      let resultText = getLang("resultHeader").replace(/{site}/g, site.toUpperCase());
      
      if (searchQuery) {
        resultText += `🔍 Search: "${searchQuery}"\n\n`;
      }

      const attachments = [];
      const tmpDir = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      const videoData = [];

      for (let i = 0; i < top10.length; i++) {
        const video = top10[i];
        const title = video.title || video.name || "Untitled";
        const duration = video.duration || "N/A";
        const views = video.views || video.view_number || video.view_count || "N/A";
        const url = video.url || video.link || video.video_url || video.page_url || "#";
        const videoUrl = video.video_url || video.download_url || video.stream_url || null;
        const thumbnail = video.thumb || video.thumbnail || video.default_thumb || video.thumb_url || video.image || null;

        videoData.push({
          title,
          duration,
          views,
          url,
          videoUrl,
          thumbnail
        });

        resultText += `${i + 1}. ${title}\n`;
        resultText += `   ⏱️ Duration: ${duration}\n`;
        resultText += `   👁️ Views: ${views}\n\n`;

        if (thumbnail && i < 5) {
          try {
            const imgPath = path.join(tmpDir, `porn_${i}_${Date.now()}.jpg`);
            const imgResponse = await axios.get(thumbnail, {
              responseType: 'arraybuffer',
              timeout: 10000,
              headers: {
                'User-Agent': 'Mozilla/5.0',
                'Referer': `https://www.${site}.com/`
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
      resultText += `📊 Total videos: ${videos.length}\n`;
      resultText += `🖼️ Thumbnails: ${attachments.length}`;
      resultText += getLang("replyInstruction");

      const messageData = {
        body: resultText
      };

      if (attachments.length > 0) {
        messageData.attachment = attachments;
      }

      message.reply(messageData, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "porn",
            messageID: info.messageID,
            author: senderID,
            videoData: videoData,
            site: site
          });
        }
      });

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
      }, 10000);

    } catch (error) {
      console.error("Porn command error:", error);
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return message.reply("⏱️ Request timeout! Please try again.");
      }
      
      return message.reply(getLang("error") + `\n\nDetails: ${error.message}`);
    }
  },

  onReply: async function({ message, event, Reply, getLang, api }) {
    const { threadID, messageID, senderID, body } = event;

    if (!Reply || Reply.commandName !== "porn") return;
    if (Reply.author !== senderID) return;

    const userInput = body.trim();
    const videoNumber = parseInt(userInput);

    if (isNaN(videoNumber) || videoNumber < 1 || videoNumber > 10) {
      return message.reply(getLang("invalidNumber"));
    }

    const selectedVideo = Reply.videoData[videoNumber - 1];

    if (!selectedVideo) {
      return message.reply(getLang("invalidNumber"));
    }

    message.reply(getLang("downloading").replace(/{num}/g, videoNumber));
    api.sendTypingIndicator(threadID);

    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    try {
      let videoDownloadUrl = selectedVideo.videoUrl;

      if (!videoDownloadUrl || videoDownloadUrl === "#" || videoDownloadUrl === null) {
        const apiBase = "https://porn-api-service.vercel.app/api";
        const videoApiUrl = `${apiBase}/${Reply.site}/video?url=${encodeURIComponent(selectedVideo.url)}`;
        
        const videoResponse = await axios.get(videoApiUrl, {
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });

        videoDownloadUrl = videoResponse.data?.video_url || videoResponse.data?.download_url || videoResponse.data?.stream_url;
      }

      if (!videoDownloadUrl) {
        return message.reply(getLang("downloadError") + "\n\n🔗 Watch online: " + selectedVideo.url);
      }

      const videoPath = path.join(tmpDir, `video_${Date.now()}.mp4`);
      const videoStream = await axios.get(videoDownloadUrl, {
        responseType: 'stream',
        timeout: 120000,
        maxContentLength: 100 * 1024 * 1024,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': `https://www.${Reply.site}.com/`
        }
      });

      const writer = fs.createWriteStream(videoPath);
      videoStream.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const stats = fs.statSync(videoPath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      if (stats.size > 87 * 1024 * 1024) {
        fs.unlinkSync(videoPath);
        return message.reply(`❌ Video too large (${fileSizeMB}MB)! Max 87MB.\n\n🔗 Watch online: ${selectedVideo.url}`);
      }

      await message.reply({
        body: `${getLang("downloadComplete")}\n\n📹 ${selectedVideo.title}\n⏱️ ${selectedVideo.duration}\n📊 ${fileSizeMB}MB\n\n⚠️ 18+ Content`,
        attachment: fs.createReadStream(videoPath)
      });

      setTimeout(() => {
        try {
          if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }
        } catch (cleanError) {
          console.error("Video cleanup error:", cleanError);
        }
      }, 5000);

      global.GoatBot.onReply.delete(Reply.messageID);

    } catch (downloadError) {
      console.error("Download error:", downloadError);
      
      let errorMsg = getLang("downloadError");
      
      if (downloadError.code === 'ETIMEDOUT') {
        errorMsg += "\n⏱️ Download timeout!";
      } else if (downloadError.response?.status === 403) {
        errorMsg += "\n🚫 Access denied!";
      }
      
      errorMsg += `\n\n🔗 Watch online: ${selectedVideo.url}`;
      
      return message.reply(errorMsg);
    }
  }
};