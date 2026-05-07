const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "spy",
    aliases: ["userinfo", "stalk"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Display target user information with neon card style",
    category: "info",
    guide: "{pn} [@mention or reply]\n{pn} [UID]\n{pn} [leave blank for self]"
  },
  langs: {
    en: {
      noUser: "❌ User not found!",
      fetching: "🔍 Generating spy card...",
      error: "❌ Error fetching user information!"
    }
  },
  ST: async function({ message, args, event, api, getLang, usersData }) {
    let targetUID;
    
    if (Object.keys(event.mentions).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
    } else if (event.messageReply) {
      targetUID = event.messageReply.senderID;
    } else if (args[0]) {
      targetUID = args[0];
    } else {
      targetUID = event.senderID;
    }

    try {
      message.reply(getLang("fetching"));
      
      const userInfo = await api.getUserInfo(targetUID);
      const userData = await usersData.get(targetUID);
      const user = userInfo[targetUID];
      
      if (!user) {
        return message.reply(getLang("noUser"));
      }

      const gender = user.gender === 1 ? 'Female' : user.gender === 2 ? 'Male' : 'Other';
      const money = userData?.money || 0;
      const exp = userData?.exp || 0;
      const banned = userData?.banned ? 'Yes' : 'No';

      const avatarUrl = `https://graph.facebook.com/${targetUID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const cardData = {
        name: user.name,
        uid: targetUID,
        gender: gender,
        birthday: user.birthday || 'Hidden',
        location: user.location?.name || 'Hidden',
        relationship: user.relationship_status || 'Hidden',
        money: money,
        exp: exp,
        banned: banned,
        avatar: avatarUrl
      };

      const apiUrl = `https://api-canvacord.vercel.app/spy?name=${encodeURIComponent(cardData.name)}&uid=${cardData.uid}&gender=${cardData.gender}&birthday=${encodeURIComponent(cardData.birthday)}&location=${encodeURIComponent(cardData.location)}&relationship=${encodeURIComponent(cardData.relationship)}&money=${cardData.money}&exp=${cardData.exp}&banned=${cardData.banned}&avatar=${encodeURIComponent(cardData.avatar)}`;

      const cachePath = path.join(__dirname, "cache", `spy_${targetUID}.png`);
      await fs.ensureDir(path.join(__dirname, "cache"));

      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      await fs.writeFile(cachePath, Buffer.from(response.data));

      message.reply({
        body: `🎭 SPY CARD GENERATED 🎭\n\n👤 Target: ${user.name}\n🆔 UID: ${targetUID}\n\n🌟 ST BOT SPY SYSTEM 🌟`,
        attachment: fs.createReadStream(cachePath)
      }, async () => {
        await fs.unlink(cachePath);
      });

    } catch (error) {
      console.error(error);
      message.reply(getLang("error"));
    }
  }
};