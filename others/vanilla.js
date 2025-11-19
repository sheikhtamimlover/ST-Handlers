module.exports = {
  config: {
    name: "vanilla",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    description: "Random Hentai Photo (NSFW)",
    category: "nsfw",
    guide: "{pn}: Get random vanilla hentai image"
  },

  ST: async function({ api, event, message }) {
    try {
      const fs = require('fs-extra');
      const axios = require('axios');
      const path = require('path');
      const { threadID, messageID } = event;

      message.reply("🔍 Fetching image...");

      const apiUrl = "https://api.waifu.pics/nsfw/waifu";
      const response = await axios.get(apiUrl);
      const imageUrl = response.data.url;

      const filePath = path.resolve(__dirname, 'cache', `vanilla_${Date.now()}.jpg`);

      const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, Buffer.from(imageResponse.data));

      return api.sendMessage(
        {
          body: "🔞 Vanilla h*ntai image for horny weebs",
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => fs.unlinkSync(filePath),
        messageID
      );

    } catch (err) {
      console.log(err);
      return message.reply("❌ Error fetching image. Please try again!");
    }
  }
};