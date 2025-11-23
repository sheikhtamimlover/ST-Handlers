const axios = require("axios");
const { GoatWrapper } = require("fca-liane-utils");

module.exports.config = {
  name: "sakura",
  version: "2.0",
  role: 0,
  author: "Ew’r Saim",
  description: "Friendly AI Sakura from Wind Breaker",
  usePrefix: true,
  guide: "[message] | just type sakura",
  category: "ai",
  aliases: ["haruka", "windboy", "breaker"]
};

const API_BASE = "https://xsaim8x-xxx-api.onrender.com/api/sakura";
const FONT_API = "https://xsaim8x-xxx-api.onrender.com/api/font";
const randomOpeners = [
  "𝐁𝐨𝐥𝐨 𝐛𝐨𝐧𝐝𝐡𝐮, 𝐤𝐢 𝐡𝐞𝐥𝐩 𝐥𝐚𝐠𝐛𝐞? 😎",
  "𝐇𝐦𝐦... 𝐤𝐢𝐜𝐡𝐮 𝐣𝐢𝐠𝐠𝐞𝐬𝐡 𝐤𝐨𝐫𝐭𝐞 𝐜𝐡𝐚𝐨 𝐧𝐚𝐤𝐢? 🌸",
  "𝐤𝐢𝐫𝐞 𝐦𝐚𝐦𝐚 𝐤𝐢 𝐨𝐛𝐨𝐬𝐭𝐚 𝐭𝐨𝐫? 🫠",
  "𝐘𝐞𝐬 𝐈'𝐦 𝐡𝐞𝐫𝐞... ✨",
  "𝐊𝐢 𝐫𝐞? 𝐊𝐢 𝐬𝐨𝐦𝐨𝐬𝐬𝐚 𝐭𝐨𝐫? 😏"
];
async function convertFont(text) {
  try {
    const res = await axios.get(FONT_API, { params: { id: 16, text } });
    return res.data.output || text;
  } catch (err) {
    console.error("Font API failed:", err.message);
    return text;
  }
}

module.exports.onStart = async function ({ api, args, event }) {
  const userId = event.senderID;
  const input = args.join(" ").trim();
  if (!input) {
    const opener = randomOpeners[Math.floor(Math.random() * randomOpeners.length)];
    return api.sendMessage(opener, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: userId
        });
      }
    }, event.messageID);
  }

  try {
    const res = await axios.get(API_BASE, { params: { query: input, userId } });
    const aiText = res.data.response || "Bujhte parlam na... abar bol? 😅";
    const styledText = await convertFont(aiText);

    api.sendMessage(styledText, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: userId
        });
      }
    }, event.messageID);

  } catch (err) {
    const msg = err.response?.data?.error || err.message;
    api.sendMessage("❌ Sakura confused hoye gelo!\nError: " + msg, event.threadID, event.messageID);
  }
};

module.exports.onReply = async function ({ api, event, Reply }) {
  if (event.senderID !== Reply.author) return;

  const userId = event.senderID;
  const input = event.body.trim();

  try {
    const res = await axios.get(API_BASE, { params: { query: input, userId } });
    const aiText = res.data.response || "Bol bol... tor kotha shunle valo lage 😎";
    const styledText = await convertFont(aiText);

    api.sendMessage(styledText, event.threadID, (err, info) => {
      if (!err) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: userId
        });
      }
    }, event.messageID);

  } catch (err) {
    const msg = err.response?.data?.error || err.message;
    api.sendMessage("❌ Error: " + msg, event.threadID, event.messageID);
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
