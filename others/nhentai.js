const axios = require("axios");

module.exports = {
  config: {
    name: "nht",
    version: "1.0.2",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Search for the information story on nhentai",
    category: "nsfw",
    guide: "{pn} [ID]"
  },

  ST: async function({ message, args, event }) {
    const { threadID, messageID } = event;

    if (!args[0] || isNaN(parseInt(args[0]))) {
      const randomCode = Math.floor(Math.random() * 99999);
      return message.reply(`The ideal code for you: ${randomCode}`);
    }

    try {
      const response = await axios.get(`https://nhentai.net/api/gallery/${parseInt(args[0])}`, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'application/json'
        }
      });

      const codeData = response.data;

      if (!codeData || codeData.error === true) {
        return message.reply("❌ Can't find your hentai manga!");
      }

      const title = codeData.title?.pretty || codeData.title?.english || 'Unknown Title';
      let tagList = [];
      let artistList = [];
      let characterList = [];

      if (codeData.tags && Array.isArray(codeData.tags)) {
        codeData.tags.forEach(item => {
          if (item.type === "tag") tagList.push(item.name);
          else if (item.type === "artist") artistList.push(item.name);
          else if (item.type === "character") characterList.push(item.name);
        });
      }

      const tags = tagList.length > 0 ? tagList.join(', ') : 'None';
      const artists = artistList.length > 0 ? artistList.join(', ') : 'Unknown';
      const characters = characterList.length > 0 ? characterList.join(', ') : 'Original';

      const resultMessage = `╔════════════════╗
║ 📚 NHENTAI INFO
╠════════════════╣
║ 📖 Name: ${title}
║ ✍️ Author: ${artists}
║ 👤 Characters: ${characters}
║ 🏷️ Tags: ${tags}
║ 🔗 Link: https://nhentai.net/g/${args[0]}
╚════════════════╝`;

      return message.reply(resultMessage);

    } catch (error) {
      console.error("NHentai command error:", error);
      if (error.response && error.response.status === 404) {
        return message.reply("❌ Can't find your hentai manga! Invalid ID.");
      }
      return message.reply("❌ An error occurred while fetching the manga. Please try again later.");
    }
  }
};