const fs = require("fs-extra");
const path = require("path");

let cachedData = null;
const dataPath = path.join(__dirname, '..', '..', 'cache', 'autoreact_data.json');

async function loadCache() {
  if (cachedData !== null) return cachedData;
  
  try {
    const fileContent = await fs.readFile(dataPath, 'utf8');
    cachedData = fileContent ? JSON.parse(fileContent) : { enabled: false };
  } catch {
    cachedData = { enabled: false };
  }
  return cachedData;
}

async function saveCache(data) {
  cachedData = data;
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "autoreact",
    aliases: ["ar", "react"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 2,
    description: "Enable/disable auto react for all messages (Bot admin only)",
    category: "admin",
    guide: {
      en: "{pn} on - Enable auto react globally\n{pn} off - Disable auto react globally\n{pn} - Check current status"
    }
  },

  onLoad: async function() {
    try {
      await fs.ensureFile(dataPath);
      const fileContent = await fs.readFile(dataPath, 'utf8');
      if (!fileContent) {
        await fs.writeFile(dataPath, JSON.stringify({ enabled: false }, null, 2));
      }
      await loadCache();
    } catch (error) {
      await fs.ensureDir(path.dirname(dataPath));
      await fs.writeFile(dataPath, JSON.stringify({ enabled: false }, null, 2));
      cachedData = { enabled: false };
    }
  },

  ST: async function({ message, args, event, api }) {
    const data = await loadCache();

    if (!args[0]) {
      const status = data.enabled === true ? "enabled ✅" : "disabled ❌";
      return message.reply(`🔔 Auto react is currently ${status} globally.`);
    }

    const action = args[0].toLowerCase();

    if (action === "on") {
      data.enabled = true;
      await saveCache(data);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      return message.reply("✅ Auto react enabled globally for all messages!");
    } else if (action === "off") {
      data.enabled = false;
      await saveCache(data);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌ Auto react disabled globally!");
    } else {
      return message.reply("❌ Invalid usage! Use: autoreact on/off");
    }
  },

  onChat: async function({ event, api }) {
    if (event.senderID === api.getCurrentUserID()) return;
    
    const data = await loadCache();

    if (data.enabled === true) {
      const reactions = [
                "😊‍😍‍😆‍😮‍😆‍🔪‍❤️‍🔥‍❤️‍🙊‍😿‍😅",
                "❤‍💖‍💗‍💓‍😆‍🔪‍🙊‍💖‍🙉‍😻‍😿",
                "🔥‍⭐‍✨‍🌟‍💫‍🔪‍💞‍💖‍😿‍🙊‍🙉",
                "👍‍👎‍😠‍😮‍😆‍🔪‍🙉‍😿‍💓‍💝‍💋",
                "💙‍💚‍💛‍💜‍🖤‍🔪‍🙊‍😿‍😻‍😿‍🙊",
                "💕‍💞‍💓‍💗‍💖‍🔪‍😻‍🙉‍💝‍😹‍😿",
                "😮‍😆‍😍‍😊‍😢‍🔪‍😽‍🤬‍☠️‍😠‍🥱",
                "💯‍🔥‍✨‍⭐‍🌟‍🔪‍😧‍😱‍😨‍😭‍😧",
                "😆‍😮‍😢‍😠‍😍‍🔪‍😣‍😱‍😧‍🥺‍😨",
                "💫‍🌟‍✨‍⭐‍🔥‍🔪‍😞‍😱‍😧‍🥺‍😨",
                "😎‍🤩‍🥳‍🤔‍🙄‍🔪‍🙄‍🫥‍🙄‍😲‍😒",
                "🤯‍😱‍😳‍🥵‍🥶‍🔪‍🤫‍🤐‍🤨‍😌‍🫥",
                "😴‍🤤‍😪‍😵‍🤕‍🔪‍🥶‍🙄‍🙄‍🤤‍🥶",
                "🤗‍🤝‍🙌‍👏‍👐‍🔪‍😠‍🥱‍😣‍😧‍🥺",
                "💩‍👻‍💀‍☠‍🔪‍😐‍💓‍💝‍🙉‍💝‍🙉",
                "🤖‍🎃‍🎄‍🎁‍🎉‍🔪‍💞‍💔‍❤️‍💝‍💕",
                "🍎‍🍊‍🍌‍🍉‍🍇‍🔪‍👹‍👺‍😿‍🤬‍😺",
                "🥑‍🥦‍🥕‍🌽‍🌶️‍🔪‍😹‍💝‍😹‍😿‍👺",
                "⚽‍🏀‍🏈‍⚾‍🎾‍🔪‍😻‍😺‍👹‍😿‍🤬",
                "🚗‍🚕‍🚙‍🚌‍🏎️‍🔪‍🥵‍🫤‍😮‍🤢‍😴",
                "✈‍🚀‍🛸‍🛶‍⛵‍🔪‍🤐‍🤔‍🥶‍🥺‍🥵",
                "🎵‍🎶‍🎷‍🎸‍🥁‍🔪‍🤐‍🤨‍😐‍🤫‍😙",
                "📚‍📖‍📝‍🖊️‍📌‍🔪‍🐸‍😅‍😄‍🙃‍🫠",
                "💡‍🔧‍🔨‍⚙️‍🧰‍🐸‍😅‍😄‍🙃‍🫠‍🔪"
            ];

      try {
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        api.setMessageReaction(randomReaction, event.messageID, () => {}, true);
      } catch (error) {
        console.error("Auto react error:", error);
      }
    }
  }
};