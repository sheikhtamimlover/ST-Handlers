const axios = require("axios");
const { GoatWrapper } = require("fca-liane-utils");

module.exports.config = {
  name: "ayesha",
  version: "1.0",
  role: 0,
  author: "VIP HACK",
  description: "Ayesha Baby AI — connected to your TeachAI API (reply/teach system)",
  usePrefix: true,
  guide: "[message] | talk to Ayesha",
  category: "ai",
  aliases: ["baby", "ayeshaai"]
};

// ← Set your deployed reply endpoint (your server.js provides /api/sms)
const API_REPLY = "https://ayesha-hello-2.onrender.com/api/sms";

// Optional font API (if you have one). If not available it will just return original text.
const FONT_API = null; // e.g. "https://your-font-api.com/api/font" or null to disable

const openers = [
  "হ্যালো ভাই, কি অভাব? 🖤",
  "আসসালামু আলাইকুম — Ayesha ready! 🌸",
  "কি খবর? কিছি জিগ করতে চাও? 😏",
  "আমি আছি — বলো কি লাগে? ✨",
  "বলতে পারো — Ayesha তোমার কাছে আছে।"
];

async function convertFont(text) {
  if (!FONT_API) return text;
  try {
    const r = await axios.get(FONT_API, { params: { id: 16, text } });
    return r.data?.output || text;
  } catch (e) {
    return text;
  }
}

async function queryReplyApi(question, userId) {
  // API expects { question: "..." } and returns { reply: "..." }
  const body = { question };
  // include userId optionally if your API supports personalization
  if (userId) body.userId = userId;
  const res = await axios.post(API_REPLY, body, { timeout: 15000 });
  return res.data?.reply || null;
}

module.exports.onStart = async function ({ api, args, event }) {
  const userId = event.senderID;
  const input = args.join(" ").trim();

  // If no input -> send an opener and enable onReply mode
  if (!input) {
    const opener = openers[Math.floor(Math.random() * openers.length)];
    return api.sendMessage(opener, event.threadID, (err, info) => {
      if (!err) {
        // save reply handler so next message is routed to onReply
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          type: "reply",
          messageID: info.messageID,
          author: userId
        });
      }
    }, event.messageID);
  }

  // With input -> query reply API
  try {
    const replyText = await queryReplyApi(input, userId);
    const finalText = await convertFont(replyText || "Ami bujhte parlam na... abar bolo?");
    api.sendMessage(finalText, event.threadID, (err, info) => {
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
    const msg = err.response?.data?.error || err.message || "Unknown error";
    api.sendMessage("❌ Ayesha confused!\nError: " + msg, event.threadID, event.messageID);
  }
};

module.exports.onReply = async function ({ api, event, Reply }) {
  // only allow the original replier to continue conversation
  if (!Reply || event.senderID !== Reply.author) return;

  const userId = event.senderID;
  const input = (event.body || "").trim();
  if (!input) return;

  try {
    const replyText = await queryReplyApi(input, userId);
    const finalText = await convertFont(replyText || "Ki bolo? amar kichu bujhena.");
    api.sendMessage(finalText, event.threadID, (err, info) => {
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
    const msg = err.response?.data?.error || err.message || "Unknown error";
    api.sendMessage("❌ Error: " + msg, event.threadID, event.messageID);
  }
};

// apply wrapper (no-prefix mode allowed so user can type "ayesha" without prefix)
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });