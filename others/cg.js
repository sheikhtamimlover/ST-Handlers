const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const FormData = require("form-data");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

module.exports = {
  config: {
    name: "cg",
    aliases: ["catgif", "uploadgif"],
    version: "2.2",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Upload GIF to Catbox (Messenger GIFs as MP4 are converted) and get GIF link",
    category: "media",
    guide: "{pn} - Reply to a GIF to upload it to Catbox"
  },

  ST: async function({ message, event, api }) {
    try {
      const { messageReply } = event;
      if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
        return message.reply("⚠️ Please reply to a GIF!");
      }

      const attachment = messageReply.attachments[0];
      if (!(attachment.type === "animated_image" || attachment.type === "video")) {
        return message.reply("⚠️ Please reply to a GIF!");
      }

      const gifUrl = attachment.url;
      const processingMsg = await message.reply("⏳ Uploading GIF...");

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);

      const mp4Path = path.join(cacheDir, `temp_${Date.now()}.mp4`);
      const gifPath = path.join(cacheDir, `gif_${Date.now()}.gif`);

      // Download file
      const response = await axios({
        method: "GET",
        url: gifUrl,
        responseType: "stream",
        timeout: 120000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      const writer = fs.createWriteStream(mp4Path);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
        setTimeout(() => reject(new Error("Download timeout")), 120000);
      });

      // Convert MP4 to GIF
      await convertMp4ToGif(mp4Path, gifPath);
      await fs.unlink(mp4Path).catch(() => {});

      // Upload GIF to Catbox
      const formData = new FormData();
      formData.append("reqtype", "fileupload");
      formData.append("fileToUpload", fs.createReadStream(gifPath), {
        filename: path.basename(gifPath),
        contentType: "image/gif"
      });

      const uploadResponse = await axios.post("https://catbox.moe/user/api.php", formData, {
        headers: { ...formData.getHeaders() },
        timeout: 180000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      const catboxUrl = uploadResponse.data.trim();
      if (!catboxUrl || !catboxUrl.startsWith("https://")) {
        await fs.unlink(gifPath).catch(() => {});
        return message.reply("❌ Failed to upload GIF. Please try again!");
      }

      // File stats
      const fsStat = await fs.stat(gifPath);
      const fileSizeMB = (fsStat.size / (1024 * 1024)).toFixed(2);
      const speedMBps = (fileSizeMB / 10).toFixed(2); // placeholder

      await fs.unlink(gifPath).catch(() => {});

      // Unsend temporary message
      if (processingMsg && processingMsg.messageID && message.unsend) {
        await message.unsend(processingMsg.messageID).catch(() => {});
      }

      return message.reply(`✅ Upload Complete Here Your File Link

📦 File: ${catboxUrl}
📥 Size: ${fileSizeMB} MB
⚡ Speed: ${speedMBps} MB/s`);

    } catch (err) {
      console.error("GIF upload error:", err);
      return message.reply(`❌ An error occurred while uploading the GIF.\nError: ${err.message}`);
    }
  }
};

// --- Utility: convert MP4 to GIF ---
function convertMp4ToGif(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        "-vf fps=15,scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-gifflags -transdiff"
      ])
      .toFormat("gif")
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });
}