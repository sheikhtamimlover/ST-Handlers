const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { pipeline } = require("stream");
const { promisify } = require("util");

const streamPipeline = promisify(pipeline);
const stbotApi = new global.utils.STBotApis();

const httpAgent = new (require('http').Agent)({ keepAlive: true, maxSockets: 50 });
const httpsAgent = new (require('https').Agent)({ keepAlive: true, maxSockets: 50 });

module.exports = {
  config: {
    name: "autodl",
    aliases: [],
    version: "3.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    shortDescription: "Auto download videos from 12+ platforms",
    longDescription: "",
    category: "media",
    guide: {
      en: `Auto download from 12+ platforms: TikTok, Facebook, Instagram, YouTube, Twitter, Pinterest, Reddit, LinkedIn, CapCut, Douyin, Snapchat, Threads, Tumblr`,
    },
  },

  onStart: () => {},

  onChat: async function ({ message, event }) {
    const inputUrl = event.body?.trim();
    if (!inputUrl) return;

    const platformRegex = /(tiktok\.com|fb\.watch|facebook\.com|instagram\.com|youtu\.?be|youtube\.com|twitter\.com|x\.com|pin\.it|pinterest\.com|reddit\.com|redd\.it|linkedin\.com|capcut\.com|douyin\.com|snapchat\.com|threads\.net|tumblr\.com)/i;
    
    if (!platformRegex.test(inputUrl)) return;

    const urlMatch = inputUrl.match(/https?:\/\/[^\s]+/i);
    const finalUrl = urlMatch ? urlMatch[0] : `https://${inputUrl.match(/[^\s]+/)[0]}`;

    const startTime = Date.now();
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, `${event.senderID}_${Date.now()}.mp4`);

    (async () => {
      try {
        const isYoutube = /youtu\.?be|youtube\.com/i.test(finalUrl);

        const apiUrl = isYoutube ? `${stbotApi.baseURL}/cyt/youtube` : `${stbotApi.baseURL}/api/download/auto`;
        
        const apiResp = await axios.post(apiUrl, { url: finalUrl }, { 
          headers: stbotApi.getHeaders(true),
          timeout: 6000,
          httpAgent,
          httpsAgent
        });

        let downloadUrl, title, platform;

        if (isYoutube) {
          const ytData = apiResp.data;
          if (!ytData?.success || !ytData?.medias?.length) return;

          const media = ytData.medias.find(m => m.is_audio || m.audioQuality) || ytData.medias[0];
          if (!media) return;

          downloadUrl = `${stbotApi.baseURL}${media.downloadUrl || media.proxyUrl}`;
          title = ytData.title;
          platform = "YouTube";
        } else {
          const data = apiResp.data;
          if (!data?.success || !data?.data?.videos?.length) return;

          downloadUrl = data.data.videos[0];
          platform = data.platform?.toUpperCase() || "VIDEO";
        }

        const streamResp = await axios({ 
          url: downloadUrl, 
          method: "GET", 
          responseType: "stream", 
          timeout: 12000,
          maxContentLength: 100 * 1024 * 1024,
          httpAgent,
          httpsAgent
        });

        await fs.ensureDir(cacheDir);
        await streamPipeline(streamResp.data, fs.createWriteStream(filePath));

        const stats = await fs.stat(filePath);
        if (stats.size === 0) {
          await fs.unlink(filePath);
          return;
        }

        const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);

        await message.reply({
          body: isYoutube ? `🎬 ${title}\n✅ ${platform} | ⏱️ ${timeTaken}s` : `✅ ${platform} | ⏱️ ${timeTaken}s`,
          attachment: fs.createReadStream(filePath)
        });

        fs.unlink(filePath).catch(() => {});

      } catch (err) {
        console.error("Download error:", err.message);
      }
    })();
  },
};