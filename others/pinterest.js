module.exports = {
  config: {
    name: "pinterest",
    aliases: ["pin", "صور_بينترست", "بينترست"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "يبحث ويرسل صور من Pinterest",
    category: "image",
    guide: "{pn} <كلمة البحث> [عدد الصور 1-10]"
  },
  langs: {
    en: {
      searching: "🔍 Searching Pinterest for: {query}...",
      notFound: "❌ No images found for '{query}'. Try different keywords.",
      error: "❌ An error occurred while fetching images.",
      invalidCount: "❌ Please specify a number between 1 and 10.",
      missingQuery: "❌ Please provide a search query!\nUsage: {pn} <search term> [count]",
      foundImages: "✅ Found {count} image(s) for '{query}'"
    },
    ar: {
      searching: "🔍 جاري البحث في Pinterest عن: {query}...",
      notFound: "❌ لم يتم العثور على صور لـ '{query}'. جرب كلمات بحث أخرى.",
      error: "❌ حدث خطأ أثناء جلب الصور.",
      invalidCount: "❌ الرجاء تحديد رقم بين 1 و 10.",
      missingQuery: "❌ الرجاء إدخال كلمة بحث!\nالاستخدام: {pn} <كلمة البحث> [العدد]",
      foundImages: "✅ تم العثور على {count} صورة لـ '{query}'"
    }
  },
  ST: async function({ message, args, event, api, getLang, commandName }) {
    const axios = require("axios");
    const fs = require("fs");
    const path = require("path");

    try {
      if (args.length === 0) {
        return message.reply(getLang("missingQuery").replace("{pn}", commandName));
      }

      let count = 6;
      const lastArg = args[args.length - 1];
      
      if (!isNaN(lastArg) && parseInt(lastArg) > 0 && parseInt(lastArg) <= 10) {
        count = parseInt(lastArg);
        args.pop();
      }

      const query = args.join(" ");
      
      if (!query) {
        return message.reply(getLang("missingQuery").replace("{pn}", commandName));
      }

      await message.reply(getLang("searching").replace("{query}", query));

      const { data } = await axios.get(`https://api.sumiproject.io.vn/images/pinterest`, {
        params: {
          query: query,
          count: count
        },
        timeout: 15000
      });

      if (!data.data || data.data.length === 0) {
        return message.reply(getLang("notFound").replace("{query}", query));
      }

      const images = data.data.slice(0, count);
      const cachePath = path.join(__dirname, "cache");
      
      if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath, { recursive: true });
      }

      const attachments = [];
      const timestamp = Date.now();

      for (let i = 0; i < images.length; i++) {
        try {
          const imgResponse = await axios.get(images[i], {
            responseType: "arraybuffer",
            timeout: 10000
          });

          const tempPath = path.join(cachePath, `pinterest_${timestamp}_${i}.jpg`);
          fs.writeFileSync(tempPath, Buffer.from(imgResponse.data));
          attachments.push(fs.createReadStream(tempPath));
        } catch (err) {
          console.error(`Failed to download image ${i}:`, err.message);
        }
      }

      if (attachments.length === 0) {
        return message.reply(getLang("error"));
      }

      await message.reply({
        body: getLang("foundImages").replace("{count}", attachments.length).replace("{query}", query),
        attachment: attachments
      });

      for (let i = 0; i < images.length; i++) {
        const tempPath = path.join(cachePath, `pinterest_${timestamp}_${i}.jpg`);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }

    } catch (error) {
      console.error("Pinterest Command Error:", error.message);
      return message.reply(getLang("error"));
    }
  }
};