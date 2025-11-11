module.exports = {
  config: {
    name: "spm",
    version: "1.0.2",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "Spam a message multiple times (bot admin only) - fast mode",
    category: "fun",
    guide: "{pn} [text] [amount]"
  },

  ST: async function({ api, event, args }) {
    const botAdminUID = "61578414567795";
    const senderID = event.senderID;

    if (senderID !== botAdminUID) {
      return api.sendMessage("❌ You are not allowed to use this command.", event.threadID);
    }

    if (!args[0] || !args[1]) {
      return api.sendMessage("⚠️ Usage: spm [text] [amount]", event.threadID);
    }

    const amount = parseInt(args[args.length - 1]);
    const text = args.slice(0, -1).join(" ");

    if (isNaN(amount) || amount <= 0 || amount > 100) {
      return api.sendMessage("⚠️ Amount must be a number between 1 and 100.", event.threadID);
    }

    const concurrency = 10;
    const tasks = new Array(amount).fill(text);

    for (let i = 0; i < tasks.length; i += concurrency) {
      const chunk = tasks.slice(i, i + concurrency);
      const promises = chunk.map(msg => api.sendMessage(msg, event.threadID));
      await Promise.allSettled(promises);
    }
  }
};