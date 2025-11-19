const fs = require("fs");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "sus",
    version: "1.0.1",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Among Us sus reaction",
    category: "no prefix",
    guide: "Auto response to sus/imposter"
  },

  ST: async function({ api, event, message }) {
    return message.reply("This is an auto-response command. Just type 'sus' or 'imposter' in chat!");
  },

  onChat: async function({ api, event, message }) {
    const { threadID, messageID, body } = event;
    
    if (!body) return;
    
    const lowerBody = body.toLowerCase();
    if (lowerBody.startsWith("sus") || lowerBody.startsWith("imposter")) {
      try {
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        const audioPath = path.join(cacheDir, "sus.mp3");
        
        if (!fs.existsSync(audioPath)) {
          const response = await axios.get("https://files.catbox.moe/s5wpyv.mp3", {
            responseType: "arraybuffer"
          });
          fs.writeFileSync(audioPath, Buffer.from(response.data));
        }
        
        await api.sendMessage({
          body: "ඞ",
          attachment: fs.createReadStream(audioPath)
        }, threadID, messageID);
        
        api.setMessageReaction("😱", messageID, (err) => {}, true);
      } catch (err) {
        console.log(err);
        message.reply("ඞ");
      }
    }
  }
};