const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

// গান ডাউনলোড এবং সেন্ড করার ফাংশন (Code Reusable করার জন্য আলাদা ফাংশন)
async function downloadAndSend(message, video, api, event) {
  try {
    const stbotApi = new global.utils.STBotApis();
    const payload = {
      url: video.url,
      format: "mp3"
    };

    const response = await axios.post(
      `${stbotApi.baseURL}/api/save/download`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': stbotApi.xApiKey
        }
      }
    );

    if (response.data.status && response.data.result && response.data.result.download) {
      const audioData = response.data.result;
      const audioUrl = audioData.download;
      const title = audioData.title;

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const cachePath = path.join(cacheDir, `sing_${Date.now()}.mp3`);

      const audioResponse = await axios.get(audioUrl, {
        responseType: "arraybuffer"
      });

      fs.writeFileSync(cachePath, Buffer.from(audioResponse.data));

      await message.reply({
        body: `🎶 ${title}`,
        attachment: fs.createReadStream(cachePath)
      }, () => {
        fs.unlinkSync(cachePath);
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      });

    } else {
      api.setMessageReaction("⚠️", event.messageID, (err) => {}, true);
      return message.reply("❌ API Error: Could not fetch the audio link.");
    }
  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", event.messageID, (err) => {}, true);
    return message.reply("⚠️ Error: " + err.message);
  }
}

module.exports = {
  config: {
    name: "sing",
    aliases: ["play", "song", "music"],
    version: "2.8.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Auto download or list songs" },
    longDescription: { en: "Search and auto download song, or use -l to see a list and reply to download" },
    category: "music",
    guide: { en: "{pn} <song name> (Auto Download)\n{pn} -l <song name> (Get List & Reply)" }
  },

  ST: async function ({ message, args, event, api }) {
    
    // --- ১. লিস্ট মোড (-l) ---
    if (args[0] === "-l") {
      const query = args.slice(1).join(" ");
      if (!query) return message.reply("🎵 Please enter a song name after -l.");

      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      try {
        const searchResult = await yts(query);
        if (!searchResult.videos.length) {
          api.setMessageReaction("❌", event.messageID, (err) => {}, true);
          return message.reply("❌ No songs found for this query.");
        }

        const top6 = searchResult.videos.slice(0, 6);
        
        let resultMsg = `🔍 Top 6 results for "${query}":\n\n`;
        
        top6.forEach((v, i) => {
          resultMsg += `${i + 1}. ${v.title}\n`;
          resultMsg += `   👤 ${v.author.name}\n`;
          resultMsg += `   ⏱ ${v.timestamp}\n\n`;
        });
        
        resultMsg += `👉 Reply with 1-${top6.length} to download.`;

        api.setMessageReaction("✅", event.messageID, (err) => {}, true);

        // লিস্ট সেন্ড করা এবং রিপ্লাই অপশন সেট করা
        return message.reply(resultMsg, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            videos: top6
          });
        });

      } catch (err) {
        console.error(err);
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        return message.reply("⚠️ Error searching: " + err.message);
      }
    }

    // --- ২. অটো ডাউনলোড মোড (Normal) ---
    const query = args.join(" ");
    if (!query) return message.reply("🎵 Please enter a song name.");

    api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

    try {
      const searchResult = await yts(query);
      if (!searchResult.videos.length) {
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
        return message.reply("❌ No songs found for this query.");
      }

      const video = searchResult.videos[0];
      await downloadAndSend(message, video, api, event);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      return message.reply("⚠️ Error: " + err.message);
    }
  },

  // --- ৩. রিপ্লাই হ্যান্ডলার ---
  onReply: async function ({ message, event, Reply, api }) {
    const { videos, author, messageID } = Reply;
    
    if (event.senderID !== author) return;

    const choice = parseInt(event.body.trim());
    
    if (isNaN(choice) || choice < 1 || choice > videos.length) {
      return message.reply(`❌ Invalid choice! Please reply with 1-${videos.length}`);
    }

    // আগের লিস্ট মেসেজটি আনসেন্ড করে দেওয়া হচ্ছে (ক্লিন রাখার জন্য)
    api.unsendMessage(messageID);

    const selectedVideo = videos[choice - 1];
    
    // সিলেকশন এর পর ওয়েট রিয়েক্ট
    api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
    
    // গান ডাউনলোড এবং সেন্ড
    await downloadAndSend(message, selectedVideo, api, event);
    
    // রিপ্লাই ডাটা ডিলিট
    global.GoatBot.onReply.delete(messageID);
  }
};
