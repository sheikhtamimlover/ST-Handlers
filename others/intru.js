const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "intru",
    aliases: ["intro"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Ask someone for intro",
    category: "fun",
    guide: "{pn} @mention"
  },

  ST: async function({ message, event, api }) {
    try {
      const mentions = Object.keys(event.mentions);
      
      if (mentions.length === 0) {
        return message.reply("⚠️ Please tag someone to ask for intro!");
      }

      const imageUrl = "https://files.catbox.moe/5miouu.jpg";
      const imagePath = path.join(__dirname, 'cache', 'intro.jpg');

      if (!fs.existsSync(path.join(__dirname, 'cache'))) {
        fs.mkdirSync(path.join(__dirname, 'cache'));
      }

      const response = await axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream'
      });

      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      let mentionText = "intro pls ";
      mentions.forEach(uid => {
        mentionText += `@${event.mentions[uid]} `;
      });

      return message.reply({
        body: mentionText.trim(),
        mentions: mentions.map(uid => ({
          tag: `@${event.mentions[uid]}`,
          id: uid
        })),
        attachment: fs.createReadStream(imagePath)
      }, () => {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });

    } catch (error) {
      console.error("Intro command error:", error);
      return message.reply("❌ Error sending intro request: " + error.message);
    }
  }
};