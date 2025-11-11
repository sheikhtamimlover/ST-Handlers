const axios = require("axios");
const fs = require("fs");
const path = require("path");
const yts = require("yt-search");

module.exports = {
  config: {
    name: "sing",
    aliases: ["music"],
    version: "1.0.3",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Search and download music from YouTube 🎶",
    category: "music",
    guide: "{pn} <song name or YouTube URL>"
  },

  ST: async function ({ api, event, args }) {
    if (!args.length)
      return api.sendMessage("❌ Please provide a song name or YouTube URL.", event.threadID, event.messageID);

    const query = args.join(" ");
    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    let searchingMsg;
    try {
      // Step 1: Notify searching
      searchingMsg = await api.sendMessage(`🔍 Searching for "${query}"...`, event.threadID);

      // Step 2: Resolve YouTube URL
      let videoUrl;
      if (query.startsWith("http")) {
        videoUrl = query;
      } else {
        const searchResults = await yts(query);
        if (!searchResults || !searchResults.videos.length) throw new Error("No results found.");
        videoUrl = searchResults.videos[0].url;
      }

      // Step 3: Try multiple APIs for better success rate
      const apiList = [
        `http://65.109.80.126:20409/aryan/youtube?url=${encodeURIComponent(videoUrl)}&type=audio`,
        `https://api.ryzendesu.vip/api/ytdl?url=${encodeURIComponent(videoUrl)}&type=audio`,
        `https://api.vreden.my.id/api/ytdl?url=${encodeURIComponent(videoUrl)}&type=audio`
      ];

      let audioData = null;
      for (const apiUrl of apiList) {
        try {
          const res = await axios.get(apiUrl, { timeout: 10000 });
          if (res.data?.mp3) {
            audioData = res.data;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!audioData || !audioData.mp3) throw new Error("All APIs failed to fetch audio.");

      // Step 4: Download the MP3
      const safeTitle = (audioData.title || "music").replace(/[\\/:"*?<>|]/g, "");
      const fileName = `${safeTitle}.mp3`;
      const filePath = path.join(__dirname, fileName);

      const audioResponse = await axios.get(audioData.mp3, {
        responseType: "arraybuffer",
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      fs.writeFileSync(filePath, audioResponse.data);

      // Step 5: Clean up "Searching…" message
      if (searchingMsg?.messageID) api.unsendMessage(searchingMsg.messageID);

      // Step 6: Send the song
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      const messageBody = `🎵 "${audioData.title}"\n📺 YouTube: ${videoUrl}`;
      await api.sendMessage(
        { body: messageBody, attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );

    } catch (error) {
      console.error("Music command error:", error);
      if (searchingMsg?.messageID) api.unsendMessage(searchingMsg.messageID);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(`❌ Failed to play song.\n📛 Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};