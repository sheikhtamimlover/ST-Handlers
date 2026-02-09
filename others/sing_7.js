const axios = require("axios");
const fs = require("fs");
const path = require("path");
const yts = require("yt-search");

const CACHE = path.join(__dirname, "cache");
if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE);

module.exports = {
  config: {
    name: "sing",
    version: "1.1",
    author: "Aryan Chauhan",
    role: 0,
    category: "media",
    guide: { en: "{pn} <song name>" }
  },

  onStart: async function ({ api, event, args }) {
    if (!args.length)
      return api.sendMessage(
        "❌ Song name missing.",
        event.threadID,
        event.messageID
      );

    api.setMessageReaction("⏳", event.messageID, () => {}, true);

    try {
      const a = await b(args.join(" "));
      const c = await d(a.url);
      await e(api, event, a, c);
    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      api.sendMessage(
        "❌ Failed to play song.",
        event.threadID,
        event.messageID
      );
    }
  }
};

async function b(q) {
  const r = await yts(q);
  if (!r.videos || !r.videos[0]) throw "No result";
  return r.videos[0];
}

async function d(url) {
  const apiUrl =
    "https://downvid.onrender.com/api/v1/download" +
    `?url=${encodeURIComponent(url)}&format=mp3`;

  const r = await axios.get(apiUrl);
  if (r.data.status !== "success" || !r.data.downloadUrl)
    throw "API error";

  return r.data.downloadUrl;
}

async function e(api, event, video, dl) {
  const p = path.join(CACHE, `${Date.now()}.mp3`);
  const s = await axios.get(dl, { responseType: "stream" });

  const w = fs.createWriteStream(p);
  s.data.pipe(w);

  w.on("finish", async () => {
    api.setMessageReaction("✅", event.messageID, () => {}, true);
    await api.sendMessage(
      {
        body: `🎶 ${video.title}`,
        attachment: fs.createReadStream(p)
      },
      event.threadID,
      event.messageID 
    );
    fs.unlinkSync(p);
  });

  w.on("error", () => {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
  });
}