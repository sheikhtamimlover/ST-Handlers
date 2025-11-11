const activeSessions = new Map();

// Replace this with your actual bot admin ID
const BOT_ADMIN = "61578414567795";

module.exports = {
  config: {
    name: "murgi",
    version: "1.0.5",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 2,
    description: "মজা করার জন্য ম্যানশন করুন",
    category: "fun",
    guide: "{pn} @mention | {pn} stop"
  },

  ST: async function({ api, event, args }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const message = event.body.toLowerCase();

    // Only bot admin can use
    if (senderID !== BOT_ADMIN) {
      return api.sendMessage("❌ শুধুমাত্র Bot Admin ব্যবহার করতে পারবে।", threadID);
    }

    // Stop the active session
    if (args[0] === "stop" || message.includes("murgi stop") || message.includes("murgi off")) {
      if (activeSessions.has(threadID)) {
        const timeouts = activeSessions.get(threadID);
        timeouts.forEach(clearTimeout);
        activeSessions.delete(threadID);
        return api.sendMessage("✅ Spamming বন্ধ করা হয়েছে।", threadID);
      } else {
        return api.sendMessage("এখন কোনো Spamming চলছে না।", threadID);
      }
    }

    // Check mention
    const mentionKeys = Object.keys(event.mentions || {});
    if (mentionKeys.length === 0) {
      return api.sendMessage("যাকে চোদাতে চান তাকে ম্যানশন করুন।", threadID, event.messageID);
    }

    const mentionID = mentionKeys[0];
    const name = event.mentions[mentionID].replace(/@/g, '');
    const arraytag = [{ id: mentionID, tag: name }];

    // Messages to spam
    const messages = [
      `লো চোদা,,🥵🖕🖕 ${name}`,
      `খাংকির পোলা তর মারে চুদি,,,,🥵👉👌 ${name}`,
      `খাংকির পোলা তর কচি বোন রে চুদি,,,,😡🥵 ${name}`,
      `মাদারচোদ তর আম্মু পম পম খাংকির পো,,,,, 🤣🤣 ${name}`,
      `খাংকির পোলা তর কচি ভুদায় ভুদায় কামর দিমু,,,,, 🥵😡 ${name}`,
      `খাংকি মাগির পোলা কথা ক কম কম তর আম্মু রে চুদে বানামু আইটেম বোম,,,,🥵👉👌 ${name}`
    ];

    // Send messages sequentially with a delay
    const timeouts = [];
    for (let i = 0; i < messages.length; i++) {
      const timeout = setTimeout(() => {
        api.sendMessage({ body: messages[i], mentions: arraytag }, threadID);
      }, i * 1000);
      timeouts.push(timeout);
    }

    activeSessions.set(threadID, timeouts);
  }
};