module.exports = {
  config: {
    name: "antichapri",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 0,
    description: "Auto reply to specific user messages",
    category: "events",
    guide: {
      en: "Automatic response system"
    }
  },

  ST: async function ({ message }) {
    return message.reply("✅ Anti-Chapri system is active!");
  },

  onChat: async function ({ message, event }) {
    const TARGET_UID = "61582917346905";
    
    if (event.senderID === TARGET_UID) {
      return message.reply("chapri caption Ayesha theke copy paste bad diye maiya khujo");
    }
  }
};