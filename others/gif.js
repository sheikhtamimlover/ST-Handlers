module.exports = {
  config: {
    name: "gif",
    aliases: ["صور_gif", "صورgif"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "يرسل صور GIF عشوائية",
    category: "image",
    guide: "{pn} [كلمة بحث]"
  },
  langs: {
    en: {
      searching: "🔍 Searching for GIF...",
      notFound: "❌ No GIF found. Try different keywords.",
      error: "❌ An error occurred while fetching GIF."
    },
    ar: {
      searching: "🔍 جاري البحث عن صورة GIF...",
      notFound: "❌ لم يتم العثور على صورة GIF. جرب كلمات بحث أخرى.",
      error: "❌ حدث خطأ أثناء جلب الصورة."
    }
  },
  ST: async function({ message, args, event, api, getLang }) {
    try {
      const axios = require("axios");
      const fs = require("fs");
      const path = require("path");

      const query = args.join(" ") || "funny";
      
      message.reply(getLang("searching"));

      const apiKey = "AIzaSyAKUdNGrboarnivS2PXmhLlkLLwUbY6-cE";
      const searchEngineId = "45a5c3d758e1c4574";
      
      const { data } = await axios.get(`https://www.googleapis.com/customsearch/v1`, {
        params: {
          key: apiKey,
          cx: searchEngineId,
          q: query + " gif",
          searchType: "image",
          fileType: "gif",
          num: 10
        }
      });

      if (!data.items || data.items.length === 0) {
        return message.reply(getLang("notFound"));
      }

      const randomGif = data.items[Math.floor(Math.random() * data.items.length)];
      const gifUrl = randomGif.link;

      const imgResponse = await axios.get(gifUrl, { 
        responseType: "arraybuffer",
        timeout: 30000
      });

      const tempPath = path.join(__dirname, "cache", `gif_${Date.now()}.gif`);
      
      if (!fs.existsSync(path.join(__dirname, "cache"))) {
        fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
      }

      fs.writeFileSync(tempPath, Buffer.from(imgResponse.data));

      await message.reply({
        body: `🎬 GIF: ${query}`,
        attachment: fs.createReadStream(tempPath)
      });

      fs.unlinkSync(tempPath);

    } catch (error) {
      console.error("GIF Error:", error);
      message.reply(getLang("error"));
    }
  }
};