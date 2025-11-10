const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "cp",
    aliases: ["catphoto", "uploadphoto"],
    version: "1.1",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Upload photo to catbox and get link",
    category: "media",
    guide: {
      en: "{pn} - Reply to a photo to upload it to catbox"
    }
  },

  ST: async function({ message, event, api }) {
    try {
      const { messageReply } = event;

      if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
        return message.reply("⚠️ Please reply to a photo message!");
      }

      const attachment = messageReply.attachments[0];

      if (attachment.type !== "photo") {
        return message.reply("⚠️ Please reply to a photo, not other media types!");
      }

      const photoUrl = attachment.url;
      
      const pr = await message.pr("⏳ Uploading photo to catbox...", "✅");

      const cacheDir = path.join(__dirname, 'cache');
      await fs.ensureDir(cacheDir);
      const photoPath = path.join(cacheDir, `photo_${Date.now()}.jpg`);

      const response = await axios({
        method: 'GET',
        url: photoUrl,
        responseType: 'arraybuffer',
        timeout: 60000
      });

      await fs.writeFile(photoPath, response.data);

      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('fileToUpload', fs.createReadStream(photoPath));

      const uploadResponse = await axios.post('https://catbox.moe/user/api.php', formData, {
        headers: formData.getHeaders(),
        timeout: 120000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      const catboxUrl = uploadResponse.data.trim();

      await fs.unlink(photoPath).catch(err => console.error("Error deleting file:", err));

      if (catboxUrl && catboxUrl.startsWith('https://')) {
        await pr.success();
        return message.reply(`✅ Photo uploaded successfully!\n\n🔗 Link: ${catboxUrl}`);
      } else {
        await pr.error("❌ Failed to upload photo to catbox. Please try again!");
      }

    } catch (error) {
      console.error("Photo upload error:", error);
      return message.reply("❌ An error occurred while uploading the photo. Please try again!");
    }
  }
};