module.exports = {
  config: {
    name: "tve",
    aliases: ["teachvideo", "teachevent"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Teach bot to reply with media when keyword is said",
    category: "utility",
    guide: "{pn} [keyword] - Reply to a message with photo/video/audio"
  },

  ST: async function({ message, event, args, api }) {
    const { threadID, messageID, messageReply } = event;
    const fs = require("fs-extra");
    const axios = require("axios");
    const path = require("path");

    if (!args[0]) {
      return message.reply("⚠️ Please provide a keyword!\nUsage: tve [keyword] - Reply to a message with media");
    }

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return message.reply("⚠️ Please reply to a message containing photo/video/audio!");
    }

    const keyword = args.join(" ").toLowerCase();
    const attachment = messageReply.attachments[0];
    const dataPath = path.join(__dirname, "cache", "tve_data.json");
    const mediaPath = path.join(__dirname, "cache", "tve_media");

    if (!fs.existsSync(mediaPath)) {
      fs.mkdirSync(mediaPath, { recursive: true });
    }

    let database = {};
    if (fs.existsSync(dataPath)) {
      database = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    }

    try {
      const timestamp = Date.now();
      const ext = attachment.type === "photo" ? "jpg" : attachment.type === "video" ? "mp4" : attachment.type === "audio" ? "mp3" : "file";
      const fileName = `${timestamp}.${ext}`;
      const filePath = path.join(mediaPath, fileName);

      const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(response.data));

      database[keyword] = {
        type: attachment.type,
        file: fileName,
        threadID: threadID
      };

      fs.writeFileSync(dataPath, JSON.stringify(database, null, 2));
      return message.reply(`✅ Successfully taught! When someone says "${keyword}", I'll reply with that ${attachment.type}.`);

    } catch (error) {
      console.error("TVE Error:", error);
      return message.reply("❌ Error saving media: " + error.message);
    }
  },

  onChat: async function({ message, event }) {
    const fs = require("fs-extra");
    const path = require("path");

    if (!event.body) return;

    const dataPath = path.join(__dirname, "cache", "tve_data.json");
    const mediaPath = path.join(__dirname, "cache", "tve_media");

    if (!fs.existsSync(dataPath)) return;

    try {
      const database = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      const text = event.body.toLowerCase();

      for (const keyword in database) {
        if (text.includes(keyword)) {
          const data = database[keyword];
          const filePath = path.join(mediaPath, data.file);

          if (fs.existsSync(filePath)) {
            return message.reply({
              attachment: fs.createReadStream(filePath)
            });
          }
        }
      }
    } catch (error) {
      console.error("TVE onChat Error:", error);
    }
  }
};