const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "metat",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 2,
    description: "Change group chat theme using an image",
    category: "admin",
    guide: "{pn} [reply to an image]"
  },

  ST: async function({ message, event, api }) {
    const { messageReply, threadID, type } = event;

    if (type !== "message_reply") {
      return message.reply("❌ Please reply to an image!");
    }

    if (!messageReply.attachments || messageReply.attachments.length === 0) {
      return message.reply("❌ No image found in the replied message!");
    }

    const attachment = messageReply.attachments[0];

    if (attachment.type !== "photo") {
      return message.reply("❌ Please reply to a photo/image only!");
    }

    const imageUrl = attachment.url;

    try {
      message.reply("🎨 Changing chat theme...");

      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const tempPath = path.join(__dirname, "cache", `theme_${Date.now()}.jpg`);
      
      if (!fs.existsSync(path.join(__dirname, "cache"))) {
        fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
      }
      
      fs.writeFileSync(tempPath, Buffer.from(response.data));

      await api.changeThreadImage(fs.createReadStream(tempPath), threadID);
      
      fs.unlinkSync(tempPath);
      
      message.reply("✅ Chat theme changed successfully!");
    } catch (error) {
      console.error("Error changing theme:", error);
      
      if (error.message && error.message.includes("permission")) {
        return message.reply("❌ Bot doesn't have permission to change the chat theme!");
      }
      
      message.reply("❌ Failed to change chat theme. Make sure the bot is an admin in this group.");
    }
  }
};