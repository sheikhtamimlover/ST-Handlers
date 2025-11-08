const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "ca",
    aliases: ["cataudio", "uploadaudio"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Upload audio to catbox and get link",
    category: "media",
    guide: {
      en: "{pn} - Reply to an audio to upload it to catbox"
    }
  },

  ST: async function({ message, event, api }) {
    try {
      const { messageReply } = event;

      if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
        return message.reply("⚠️ Please reply to an audio message!");
      }

      const attachment = messageReply.attachments[0];

      if (attachment.type !== "audio") {
        return message.reply("⚠️ Please reply to an audio, not other media types!");
      }

      const audioUrl = attachment.url;
      
      await message.reply("⏳ Uploading audio to catbox...");

      const cacheDir = path.join(__dirname, 'cache');
      await fs.ensureDir(cacheDir);
      const audioPath = path.join(cacheDir, `audio_${Date.now()}.mp3`);

      const response = await axios({
        method: 'GET',
        url: audioUrl,
        responseType: 'stream',
        timeout: 60000
      });

      const writer = fs.createWriteStream(audioPath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      formData.append('fileToUpload', fs.createReadStream(audioPath));

      const uploadResponse = await axios.post('https://catbox.moe/user/api.php', formData, {
        headers: {
          ...formData.getHeaders()
        },
        timeout: 120000
      });

      const catboxUrl = uploadResponse.data.trim();

      await fs.unlink(audioPath).catch(err => console.error("Error deleting file:", err));

      if (catboxUrl && catboxUrl.startsWith('https://')) {
        return message.reply(`✅ Audio uploaded successfully!\n\n🔗 Link: ${catboxUrl}`);
      } else {
        return message.reply("❌ Failed to upload audio to catbox. Please try again!");
      }

    } catch (error) {
      console.error("Audio upload error:", error);
      return message.reply("❌ An error occurred while uploading the audio. Please try again!");
    }
  }
};