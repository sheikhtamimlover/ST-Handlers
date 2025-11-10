const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "php",
    version: "3.0.1",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Show user profile info with profile & cover photo",
    category: "info",
    guide: {
      en: "php (reply/tag someone)"
    }
  },

  ST: async function({ api, event, message }) {
    const { threadID, messageID, mentions, senderID, type } = event;

    let userID;
    if (Object.keys(mentions).length > 0) {
      userID = Object.keys(mentions)[0];
    } else if (type === "message_reply" && event.messageReply) {
      userID = event.messageReply.senderID;
    } else {
      userID = senderID;
    }

    try {
      const fbLink = `https://www.facebook.com/profile.php?id=${userID}`;

      const userInfo = await api.getUserInfo(userID);
      const user = userInfo[userID];

      const name = user.name || "Unknown";
      const uid = userID;
      const gender = user.gender === 2 ? "Male" : user.gender === 1 ? "Female" : "Unknown";
      const relationshipStatus = user.relationship_status || "Not Available";
      const birthday = user.birthday || "⛔ Private";

      const profilePicPath = path.join(__dirname, "cache", `profile_${uid}.jpg`);
      const coverPicPath = path.join(__dirname, "cache", `cover_${uid}.jpg`);

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const attachments = [];

      try {
        const profileUrl = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const profileResp = await axios.get(profileUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(profilePicPath, Buffer.from(profileResp.data));
        attachments.push(fs.createReadStream(profilePicPath));
      } catch (error) {
        console.error("Failed to fetch profile photo:", error);
      }

      try {
        const coverUrl = `https://graph.facebook.com/${uid}?fields=cover&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const coverResp = await axios.get(coverUrl);
        if (coverResp.data && coverResp.data.cover && coverResp.data.cover.source) {
          const coverImageResp = await axios.get(coverResp.data.cover.source, { responseType: "arraybuffer" });
          fs.writeFileSync(coverPicPath, Buffer.from(coverImageResp.data));
          attachments.push(fs.createReadStream(coverPicPath));
        }
      } catch (error) {
        console.error("Failed to fetch cover photo:", error);
      }

      const messageText = `
╭─── ✦ PROFILE ✦ ───
├─ 🎭 Name: ${name}
├─ 🧬 Gender: ${gender}
├─ 🆔 UID: ${uid}
├─ 👑 Relationship Status: ${relationshipStatus}
├─ 🎂 Birthday: ${birthday}
╰────────────────

🌐 Profile: ${fbLink}
`;

      await message.reply({
        body: messageText,
        attachment: attachments.length > 0 ? attachments : undefined
      });

      if (fs.existsSync(profilePicPath)) fs.unlinkSync(profilePicPath);
      if (fs.existsSync(coverPicPath)) fs.unlinkSync(coverPicPath);

    } catch (err) {
      console.error(err);
      return message.reply("❌ Could not fetch user information.");
    }
  }
};