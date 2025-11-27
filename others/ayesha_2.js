const axios = require("axios");
const API_BASE = "https://ayesha-hello-2.onrender.com/api"; // apnar live server URL

module.exports.config = {
  name: "ayesha",
  version: "1.0",
  role: 0,
  author: "VIP HACK",
  description: "Messenger bot AI commands: teach, edit, remove, test SMS",
  usePrefix: true,
  guide: `
    !teach question | answer1,answer2
    !edit question | newanswer1,newanswer2
    !remove question
    !test question
  `
};

// --- Helper ---
async function callAPI(endpoint, payload) {
  try {
    const res = await axios.post(`${API_BASE}/${endpoint}`, payload);
    return res.data;
  } catch (err) {
    return { error: err.response?.data?.error || err.message };
  }
}

// --- Command start ---
module.exports.onStart = async function({ api, args, event }) {
  const userId = event.senderID;
  const command = args[0]?.toLowerCase();
  const rest = args.slice(1).join(" ").trim();

  if (!command) return api.sendMessage("❌ Use: !teach, !edit, !remove, !test", event.threadID);

  // --- Teach ---
  if (command === "teach") {
    const parts = rest.split("|");
    if(parts.length < 2) return api.sendMessage("❌ Format: !teach question | answer1,answer2", event.threadID);
    const question = parts[0].trim();
    const answers = parts[1].split(",").map(a=>a.trim()).filter(a=>a);
    if(!question || answers.length === 0) return api.sendMessage("❌ Question & answers required", event.threadID);

    const res = await callAPI("teach", { question, answers });
    api.sendMessage(res.success ? `✅ Teach added: ${question}` : `❌ Error: ${res.error}`, event.threadID);
    return;
  }

  // --- Edit ---
  if (command === "edit") {
    const parts = rest.split("|");
    if(parts.length < 2) return api.sendMessage("❌ Format: !edit question | newanswer1,newanswer2", event.threadID);
    const question = parts[0].trim();
    const newAnswers = parts[1].split(",").map(a=>a.trim()).filter(a=>a);
    if(!question || newAnswers.length === 0) return api.sendMessage("❌ Question & new answers required", event.threadID);

    const res = await callAPI("edit", { question, newAnswers });
    api.sendMessage(res.success ? `✅ Teach updated: ${question}` : `❌ Error: ${res.error}`, event.threadID);
    return;
  }

  // --- Remove ---
  if (command === "remove") {
    const question = rest;
    if(!question) return api.sendMessage("❌ Format: !remove question", event.threadID);

    const res = await callAPI("remove", { question });
    api.sendMessage(res.success ? `✅ Teach removed: ${question}` : `❌ Error: ${res.error}`, event.threadID);
    return;
  }

  // --- Test SMS ---
  if (command === "test") {
    const question = rest;
    if(!question) return api.sendMessage("❌ Format: !test question", event.threadID);

    const res = await callAPI("sms", { question });
    api.sendMessage(res.reply ? `💬 Reply: ${res.reply}` : "❌ No reply", event.threadID);
    return;
  }

  // --- Unknown ---
  api.sendMessage("❌ Unknown command. Use: !teach, !edit, !remove, !test", event.threadID);
};