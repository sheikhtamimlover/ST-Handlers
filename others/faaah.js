const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "faaah",
    version: "1.3",
    author: "Rana x ChatGPT",
    role: 0,
    category: "media"
  },

  // loader requirement
  onStart: async function () {},

  // no prefix trigger
  onChat: async function ({ api, event }) {
    try {
      if (!event.body) return;

      // allowed triggers
      const triggers = ["faaah","faah","fahh","faaaah","faaaahh","faahh"];

      if (!triggers.includes(event.body.toLowerCase())) return;

      // voice links
      const voices = [
        "https://tinyurl.com/22dng8f6",
        "https://tinyurl.com/2bfkfvf8"
      ];

      // random select
      const url = voices[Math.floor(Math.random() * voices.length)];

      const path = __dirname + "/cache/faaah.mp3";

      const data = (await axios.get(url, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(path, Buffer.from(data));

      api.sendMessage(
        {
          attachment: fs.createReadStream(path)
        },
        event.threadID,
        () => fs.unlinkSync(path)
      );

    } catch (err) {
      console.log(err);
    }
  }
};

// apply no-prefix wrapper
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });