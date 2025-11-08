const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gcimg",
    aliases: ["gcimage", "changeimg"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 1,
    description: "Change group chat image",
    category: "group",
    guide: {
      en: "Reply to a photo with {pn} to change the group image"
    }
  },

  ST: async function({ message, event, api }) {
    if (event.threadID === event.senderID) {
      return message.reply("⚠️ This command can only be used in group chats!");
    }

    const { messageReply } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return message.reply("❌ Please reply to a photo to change the group image!");
    }

    const attachment = messageReply.attachments[0];

    if (attachment.type !== "photo") {
      return message.reply("❌ Please reply to a photo, not other types of attachments!");
    }

    const imageUrl = attachment.url;
    const cacheDir = path.join(__dirname, 'cache');
    await fs.ensureDir(cacheDir);
    const imagePath = path.join(cacheDir, `gcimg_${Date.now()}.jpg`);

    try {
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await api.changeGroupImage(fs.createReadStream(imagePath), event.threadID);
      
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      await message.reply("✅ Successfully changed the group image!");

      await fs.unlink(imagePath).catch(err => console.error("Error deleting file:", err));

    } catch (error) {
      console.error("Error changing group image:", error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      await message.reply("❌ Failed to change group image. Make sure the bot has permission to change group settings.");
      
      if (fs.existsSync(imagePath)) {
        await fs.unlink(imagePath).catch(err => console.error("Error deleting file:", err));
      }
    }
  }
};