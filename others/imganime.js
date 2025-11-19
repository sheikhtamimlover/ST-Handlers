const axios = require('axios');

module.exports = {
  config: {
    name: "imganime",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Random anime images",
    category: "anime",
    guide: "{pn}"
  },

  ST: async function({ message }) {
    try {
      const response = await axios.get('https://nekos.best/api/v2/neko');
      const imageUrl = response.data.results[0].url;

      await message.send({
        body: "🎌 Random Anime Image",
        attachment: await global.utils.getStreamFromURL(imageUrl)
      });
    } catch (error) {
      console.error(error);
      message.reply("Failed to fetch anime image. Please try again later.");
    }
  }
};