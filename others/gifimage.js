module.exports = {
  config: {
    name: "gifimage",
    aliases: ["صور_متحركة", "جيف", "متحركة"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "يجلب صور GIF متحركة من Tenor",
    category: "image",
    guide: "{pn} <كلمة البحث> [عدد الصور]\nمثال: {pn} funny 3"
  },
  langs: {
    en: {
      searching: "🔍 Searching for GIFs: '{query}'...",
      notFound: "❌ No GIFs found for '{query}'. Try different keywords.",
      error: "❌ An error occurred while fetching GIFs.",
      invalidCount: "❌ Please specify a number between 1 and 10.",
      missingQuery: "❌ Please provide a search query!\nUsage: {pn} <search term> [count]",
      foundImages: "✅ Found {count} GIF(s) for '{query}'",
      downloading: "📥 Downloading {count} GIF(s)..."
    },
    ar: {
      searching: "🔍 جاري البحث عن صور GIF: '{query}'...",
      notFound: "❌ لم يتم العثور على صور GIF لـ '{query}'. جرب كلمات أخرى.",
      error: "❌ حدث خطأ أثناء جلب الصور.",
      invalidCount: "❌ الرجاء تحديد رقم بين 1 و 10.",
      missingQuery: "❌ الرجاء إدخال كلمة بحث!\nالاستخدام: {pn} <كلمة البحث> [العدد]",
      foundImages: "✅ تم العثور على {count} صورة GIF لـ '{query}'",
      downloading: "📥 جاري تحميل {count} صورة GIF..."
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

      let count = 4;
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

      const apiKey = "AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ";
      const { data } = await axios.get(`https://tenor.googleapis.com/v2/search`, {
        params: {
          q: query,
          key: apiKey,
          client_key: "stbot",
          limit: count * 2,
          media_filter: "gif",
          contentfilter: "medium"
        },
        timeout: 15000
      });

      if (!data.results || data.results.length === 0) {
        return message.reply(getLang("notFound").replace("{query}", query));
      }

      const gifs = data.results.slice(0, count);
      const cachePath = path.join(__dirname, "cache");
      
      if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath, { recursive: true });
      }

      await message.reply(getLang("downloading").replace("{count}", gifs.length));

      const attachments = [];
      const timestamp = Date.now();
      const downloads = [];

      for (let i = 0; i < gifs.length; i++) {
        const gifUrl = gifs[i].media_formats.gif.url;
        
        downloads.push(
          axios.get(gifUrl, {
            responseType: "arraybuffer",
            timeout: 20000,
            maxContentLength: 50 * 1024 * 1024
          })
          .then(gifResponse => {
            const tempPath = path.join(cachePath, `gif_${timestamp}_${i}.gif`);
            fs.writeFileSync(tempPath, Buffer.from(gifResponse.data));
            return tempPath;
          })
          .catch(err => {
            console.error(`Failed to download GIF ${i}:`, err.message);
            return null;
          })
        );
      }

      const downloadedPaths = (await Promise.all(downloads)).filter(p => p !== null);

      if (downloadedPaths.length === 0) {
        return message.reply(getLang("error"));
      }

      downloadedPaths.forEach(p => {
        attachments.push(fs.createReadStream(p));
      });

      await message.reply({
        body: getLang("foundImages").replace("{count}", downloadedPaths.length).replace("{query}", query),
        attachment: attachments
      });

      setTimeout(() => {
        downloadedPaths.forEach(p => {
          if (fs.existsSync(p)) {
            fs.unlinkSync(p);
          }
        });
      }, 5000);

    } catch (error) {
      console.error("GIF Command Error:", error.message);
      if (error.response) {
        console.error("API Response:", error.response.status);
      }
      return message.reply(getLang("error"));
    }
  }
};