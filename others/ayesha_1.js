const axios = require("axios");
const { GoatWrapper } = require("fca-liane-utils");

module.exports.config = {
  name: "ayesha",
  version: "1.0",
  role: 0,
  author: "VIP HACK",
  description: "Ayesha Baby AI Messenger Command",
  usePrefix: true,
  guide: "[question] | just type question to chat",
  category: "ai",
  aliases: ["ai", "baby"]
};

const API_BASE = "https://ayesha-hello-2.onrender.com"; // Apnar live render link

module.exports.onStart = async function({ api, args, event }) {
  const userId = event.senderID;
  const input = args.join(" ").trim();

  if (!input) {
    return api.sendMessage("💬 Kichu likhun ami reply debo!", event.threadID, (err, info) => {
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
    // SMS test
    const res = await axios.post(`${API_BASE}/api/sms`, { question: input });
    const reply = res.data.reply || "😅 Bujhte parlam na, abar bolun!";
    api.sendMessage(reply, event.threadID, (err, info) => {
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
    api.sendMessage("❌ API error: " + (err.response?.data?.error || err.message), event.threadID, event.messageID);
  }
};

module.exports.onReply = async function({ api, event, Reply }) {
  if (event.senderID !== Reply.author) return;

  const userId = event.senderID;
  const input = event.body.trim();

  try {
    const res = await axios.post(`${API_BASE}/api/sms`, { question: input });
    const reply = res.data.reply || "😅 Bujhte parlam na, abar bolun!";
    api.sendMessage(reply, event.threadID, (err, info) => {
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
    api.sendMessage("❌ API error: " + (err.response?.data?.error || err.message), event.threadID, event.messageID);
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });