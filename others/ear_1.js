const axios = require('axios');

module.exports = {
  config: {
    name: "ear",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 2,
    description: "Animal Ear Waifu",
    category: "anime",
    guide: "{pn}"
  },

  ST: async function({ message, event }) {
    try {
      const res = await axios.get('https://api.waifu.pics/sfw/neko');
      const imageUrl = res.data.url;

      await message.send({
        body: `Anime Girl w/Animal Ear`,
        attachment: await global.utils.getStreamFromURL(imageUrl)
      });
    } catch (error) {
      console.error(error);
      message.reply("Failed to fetch animal ear waifu image. Please try again later.");
    }
  }
};