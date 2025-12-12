const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "nanobanana",
    aliases: ["nano", "banana"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Create funny banana meme edits",
    category: "image",
    guide: "{pn} <reply to image> - Create banana meme\n{pn} <image URL> - Create banana meme from URL\n{pn} @mention - Create banana meme from profile"
  },

  ST: async function({ message, args, event, api, usersData }) {
    try {
      let imageUrl = null;

      if (event.messageReply) {
        const reply = event.messageReply;
        
        if (reply.attachments && reply.attachments.length > 0) {
          const attachment = reply.attachments[0];
          
          if (attachment.type === 'photo') {
            imageUrl = attachment.url;
          } else {
            return message.reply('❌ Please reply to a photo message!');
          }
        } else {
          return message.reply('❌ The replied message has no photo attachment!');
        }
      } else if (Object.keys(event.mentions).length > 0) {
        const mentionId = Object.keys(event.mentions)[0];
        imageUrl = `https://graph.facebook.com/${mentionId}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      } else if (args[0]) {
        if (args[0].startsWith('http://') || args[0].startsWith('https://')) {
          imageUrl = args[0];
        } else {
          return message.reply('❌ Please provide a valid image URL!');
        }
      } else {
        imageUrl = `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      }

      await message.reply('🍌 Creating banana meme... Please wait...');

      const apiUrl = `https://api-canvass.vercel.app/nanobanana?img=${encodeURIComponent(imageUrl)}`;

      const response = await axios.get(apiUrl, {
        responseType: 'arraybuffer',
        timeout: 60000
      });

      const imagePath = path.join(__dirname, `nanobanana_${Date.now()}.png`);
      fs.writeFileSync(imagePath, Buffer.from(response.data));

      await message.reply({
        body: '🍌 Your Nano Banana meme is ready!',
        attachment: fs.createReadStream(imagePath)
      });

      setTimeout(() => {
        try {
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (error) {
          console.error('Error deleting file:', error);
        }
      }, 5000);

    } catch (error) {
      console.error('Nano banana error:', error);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return message.reply('❌ Request timeout! Please try again with a smaller image.');
      }
      
      if (error.response && error.response.status === 404) {
        return message.reply('❌ API endpoint not found. The service might be temporarily unavailable.');
      }
      
      return message.reply('❌ An error occurred while creating the banana meme. Please try again later.');
    }
  }
};