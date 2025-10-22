const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "caturl",
	aliases: ["catbox"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    shortDescription: "Upload media to Catbox",
    longDescription: "Reply to an image or video, and this command will upload it to Catbox and return the hosted URL.",
    category: "tools",
    guide: {
      en: "{p}caturl (reply to an image/video)"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        return message.reply("⚠️ Please reply to an image or video.");
      }

      const attachment = event.messageReply.attachments[0];
      const url = attachment.url;
      const ext = attachment.type === "photo" ? ".jpg" : ".mp4";
      const filePath = path.join(__dirname, `cache_${Date.now()}${ext}`);

      
      const response = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, response.data);

      
      const form = new FormData();
      form.append("reqtype", "fileupload");
      form.append("userhash", "");
      form.append("fileToUpload", fs.createReadStream(filePath));

      const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: {
          ...form.getHeaders()
        }
      });


      fs.unlinkSync(filePath);


      return message.reply(`✅ Uploaded successfully:\n${uploadRes.data}`);

    } catch (err) {
      console.error(err);
      return message.reply("❌ Failed to upload file.");
    }
  }
};