const axios = require("axios");
const fs = require('fs');
const baseApiUrl = async () => {
  const base = await axios.get(`https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json`);
  return base.data.api;
};

module.exports = {
  config: {
    name: "sing",
    version: "1.0.0",
    author: "dipto",
    countDown: 5,
    role: 0,
    description: { en: "Play a song from YouTube" },
    category: "media",
    guide: { en: " {pn} <song name>" }
  },
  onStart: async ({ api, args, event }) => {
    const songName = args.join(" ");
    if (!songName) return api.sendMessage("❌ Please provide a song name!", event.threadID, event.messageID);

    try {
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);
      const result = (await axios.get(`${await baseApiUrl()}/ytFullSearch?songName=${songName}`)).data;
      if (result.length === 0) {
        api.setMessageReaction("", event.messageID, (err) => {}, true);
        return api.sendMessage("⭕ No search results match the keyword: " + songName, event.threadID, event.messageID);
      }

      const videoID = result[0].id;
      const { data: { title, downloadLink } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3&quality=3`);
      const path = `song_${videoID}.mp3`;
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      await api.sendMessage({ body: `• Title: ${title}`, attachment: await dipto(downloadLink, path) }, event.threadID, () => fs.unlinkSync(path), event.messageID);
    } catch (e) {
      console.error(e);
      api.setMessageReaction("", event.messageID, (err) => {}, true);
      return api.sendMessage('❌ Failed to play the song. Please try again later.', event.threadID, event.messageID);
    }
  }
};

async function dipto(url, pathName) {
  try {
    const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathName, Buffer.from(response));
    return fs.createReadStream(pathName);
  } catch (err) {
    throw err;
  }
}