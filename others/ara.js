const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "araara",
    version: "1.0.1",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Responds to 'ara ara' messages",
    category: "no prefix",
    guide: "Just say 'ara ara' or 'ara'"
  },

  onStart: async function({ message }) {
    const audioPath = path.join(__dirname, "cache", "ara.mp3");
    
    if (await fs.pathExists(audioPath)) {
      await message.send({
        body: "Ara ara~",
        attachment: fs.createReadStream(audioPath)
      });
    } else {
      await message.reply("Ara ara~");
    }
  },

  onChat: async function({ event, message, api }) {
    const body = event.body.toLowerCase();
    
    if (body === "ara ara" || body === "ara") {
      const audioPath = path.join(__dirname, "cache", "ara.mp3");
      
      try {
        api.setMessageReaction("😍", event.messageID, (err) => {}, true);
        
        if (await fs.pathExists(audioPath)) {
          await message.send({
            body: "Ara ara~",
            attachment: fs.createReadStream(audioPath)
          });
        } else {
          await message.reply("Ara ara~");
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
};