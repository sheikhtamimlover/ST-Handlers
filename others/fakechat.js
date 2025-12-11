const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "fakechat",
    aliases: ["fc", "fake"],
    version: "2.0",
    author: "ST | Sheikh Tamim",
    role: 0,
    category: "fun",
    description: "Generate fake chat via reply, mention, or user uid",
    countDown: 5,
    guide: "{pn} <text> (reply to message)\n{pn} @mention <text>\n{pn} <uid> <text>"
  },

  onStart: async function({ event, message, args, usersData, api }) {
    try {
      let targetId;
      let userText = args.join(" ").trim();

      if (event.messageReply) {
        targetId = event.messageReply.senderID;
      } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetId = Object.keys(event.mentions)[0];
        const mentionName = event.mentions[targetId];
        userText = args.join(" ").replace(new RegExp(`@${mentionName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`, "gi"), "").trim();
      } else if (args.length > 0 && /^\d+$/.test(args[0])) {
        targetId = args[0];
        userText = args.slice(1).join(" ").trim();
      } else {
        return message.reply("❌ Please reply to a message, mention someone, or provide a user UID.\n\nUsage:\n• Reply to message + text\n• @mention text\n• <uid> text");
      }

      if (!userText) {
        return message.reply("❌ Please provide the text for the fake chat.");
      }

      let userName = "User";
      let avatarUrl = "";

      try {
        const userInfo = await usersData.get(targetId);
        userName = userInfo.name || (await usersData.getName(targetId)) || targetId;
        avatarUrl = `https://graph.facebook.com/${targetId}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      } catch (error) {
        try {
          userName = (await usersData.getName(targetId)) || targetId;
        } catch {
          userName = targetId;
        }
      }

      const apiUrl = `https://api-canvass.vercel.app/fakechat?uid=${targetId}&name=${encodeURIComponent(userName)}&message=${encodeURIComponent(userText)}`;

      const response = await axios.get(apiUrl, { 
        responseType: "arraybuffer",
        timeout: 30000
      });

      const filePath = path.join(__dirname, `fakechat_${Date.now()}.png`);
      fs.writeFileSync(filePath, Buffer.from(response.data, "binary"));

      await message.reply({
        body: `🗨️ Fake chat generated for: ${userName}`,
        attachment: fs.createReadStream(filePath)
      });

      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }, 5000);

    } catch (error) {
      console.error("Fakechat Error:", error);
      await message.reply("❌ An error occurred while generating the fake chat. Please try again later.");
    }
  }
};