const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");
const { exec } = require("child_process");

module.exports = {
  config: {
    name: "cv",
    aliases: ["catvideo", "uploadvideo"],
    version: "2.3",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Upload video to Catbox with auto .video → .mp4 conversion",
    category: "media",
  },

  ST: async function ({ message, event }) {
    try {
      const { messageReply } = event;

      if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
        return message.reply("⚠️ Please reply to a video message!");
      }

      const attachment = messageReply.attachments[0];
      const videoUrl = attachment.url;

      // Temporary uploading message
      const tempMsg = await message.reply("⏳ Uploading video...");

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const rawPath = path.join(cacheDir, `raw_${Date.now()}.video`);
      const finalMp4 = path.join(cacheDir, `fixed_${Date.now()}.mp4`);

      // Download original file silently
      const response = await axios({
        method: "GET",
        url: videoUrl,
        responseType: "stream",
        timeout: 60000
      });

      const writer = fs.createWriteStream(rawPath);
      let downloadedBytes = 0;

      response.data.on("data", (chunk) => {
        downloadedBytes += chunk.length;
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Convert .video → .mp4
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -y -i "${rawPath}" -c copy "${finalMp4}"`, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      // Get stats BEFORE uploading
      const stats = await fs.stat(finalMp4);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      // Upload video
      const formData = new FormData();
      formData.append("reqtype", "fileupload");
      formData.append("fileToUpload", fs.createReadStream(finalMp4), {
        filename: "video.mp4",
        contentType: "video/mp4",
      });

      const uploadStart = Date.now();
      const uploadResponse = await axios.post(
        "https://catbox.moe/user/api.php",
        formData,
        { headers: formData.getHeaders(), timeout: 120000 }
      );
      const uploadEnd = Date.now();

      const catboxUrl = uploadResponse.data.trim();

      const uploadTimeSec = (uploadEnd - uploadStart) / 1000;
      const speedMBs = (stats.size / (1024 * 1024) / uploadTimeSec).toFixed(2);

      // Clean cache
      await fs.unlink(rawPath).catch(() => {});
      await fs.unlink(finalMp4).catch(() => {});

      // Unsend temporary uploading message
      if (tempMsg && tempMsg.messageID && message.unsend) {
        await message.unsend(tempMsg.messageID).catch(() => {});
      }

      if (catboxUrl.startsWith("https://")) {
        return message.reply(
          `✅ Upload Complete! Here is your file link:\n\n` +
          `📦 File: ${catboxUrl}\n` +
          `📥 Size: ${fileSizeMB} MB\n` +
          `⚡ Speed: ${speedMBs} MB/s`
        );
      } else {
        return message.reply("❌ Upload failed!");
      }

    } catch (error) {
      console.error("Video upload error:", error);
      return message.reply("❌ Error while processing video!");
    }
  }
};