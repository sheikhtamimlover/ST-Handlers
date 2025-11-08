const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "cv",
    aliases: ["catvideo", "uploadvideo"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Upload video to catbox and get link",
    category: "media",
    guide: {
      en: "{pn} - Reply to a video to upload it to catbox"
    }
  },

  ST: async function({ message, event, api }) {
    try {
      const { messageReply } = event;

      if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
        return message.reply("⚠️ Please reply to a video message!");
      }

      const attachment = messageReply.attachments[0];

      if (attachment.type !== "video") {
        return message.reply("⚠️ Please reply to a video, not other media types!");
      }

      const videoUrl = attachment.url;
      
      await message.reply("⏳ Uploading video to catbox...");

      const cacheDir = path.join(__dirname, 'cache');
      await fs.ensureDir(cacheDir);
      const videoPath = path.join(cacheDir, `video_${Date.now()}.mp4`);

      const response = await axios({
        method: 'GET',
        url: videoUrl,
        responseType: 'stream',
        timeout: 60000
      });

      const writer = fs.createWriteStream(videoPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('fileToUpload', fs.createReadStream(videoPath));

      const uploadResponse = await axios.post('https://catbox.moe/user/api.php', formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 120000
      });

      const catboxUrl = uploadResponse.data.trim();

      await fs.unlink(videoPath).catch(err => console.error("Error deleting file:", err));

      if (catboxUrl && catboxUrl.startsWith('https://')) {
        return message.reply(`✅ Video uploaded successfully!\n\n🔗 Link: ${catboxUrl}`);
      } else {
        return message.reply("❌ Failed to upload video to catbox. Please try again!");
      }

    } catch (error) {
      console.error("Video upload error:", error);
      return message.reply("❌ An error occurred while uploading the video. Please try again!");
    }
  }
};