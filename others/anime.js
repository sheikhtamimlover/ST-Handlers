module.exports = {
  config: {
    name: "anime",
    aliases: ["انمي", "صور_انمي", "انمي_صور"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "بحث عن صور انمي وتحميلها",
    category: "anime",
    guide: "{pn} <كلمة البحث> [عدد الصور]\nمثال: {pn} naruto 5"
  },
  langs: {
    en: {
      searching: "🔍 Searching for anime images: '{query}'...",
      notFound: "❌ No anime images found for '{query}'. Try different keywords.",
      error: "❌ An error occurred while fetching images.",
      invalidCount: "❌ Please specify a number between 1 and 15.",
      missingQuery: "❌ Please provide a search query!\nUsage: {pn} <search term> [count]",
      foundImages: "✅ Found {count} anime image(s) for '{query}'",
      downloading: "📥 Downloading {count} anime images..."
    },
    ar: {
      searching: "🔍 جاري البحث عن صور انمي: '{query}'...",
      notFound: "❌ لم يتم العثور على صور انمي لـ '{query}'. جرب كلمات أخرى.",
      error: "❌ حدث خطأ أثناء جلب الصور.",
      invalidCount: "❌ الرجاء تحديد رقم بين 1 و 15.",
      missingQuery: "❌ الرجاء إدخال كلمة بحث!\nالاستخدام: {pn} <كلمة البحث> [العدد]",
      foundImages: "✅ تم العثور على {count} صورة انمي لـ '{query}'",
      downloading: "📥 جاري تحميل {count} صورة انمي..."
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
      
      if (!isNaN(lastArg) && parseInt(lastArg) > 0 && parseInt(lastArg) <= 15) {
        count = parseInt(lastArg);
        args.pop();
      }

      const query = args.join(" ");
      
      if (!query) {
        return message.reply(getLang("missingQuery").replace("{pn}", commandName));
      }

      await message.reply(getLang("searching").replace("{query}", query));

      const { data } = await axios.get(`https://api-samirxpikachu.onrender.com/pinterest`, {
        params: {
          search: `${query} anime`,
          limit: count
        },
        timeout: 20000
      });

      if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
        return message.reply(getLang("notFound").replace("{query}", query));
      }

      const images = data.result.slice(0, count);
      const cachePath = path.join(__dirname, "cache");
      
      if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath, { recursive: true });
      }

      await message.reply(getLang("downloading").replace("{count}", images.length));

      const attachments = [];
      const timestamp = Date.now();
      const downloads = [];

      for (let i = 0; i < images.length; i++) {
        downloads.push(
          axios.get(images[i], {
            responseType: "arraybuffer",
            timeout: 15000,
            maxContentLength: 50 * 1024 * 1024,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
          .then(imgResponse => {
            const contentType = imgResponse.headers['content-type'] || '';
            let ext = 'jpg';
            
            if (contentType.includes('png')) ext = 'png';
            else if (contentType.includes('gif')) ext = 'gif';
            else if (contentType.includes('webp')) ext = 'webp';
            else if (contentType.includes('jpeg')) ext = 'jpg';
            
            const tempPath = path.join(cachePath, `anime_${timestamp}_${i}.${ext}`);
            fs.writeFileSync(tempPath, Buffer.from(imgResponse.data));
            return tempPath;
          })
          .catch(err => {
            console.error(`Failed to download anime image ${i}:`, err.message);
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
      console.error("Anime Command Error:", error.message);
      if (error.response) {
        console.error("API Error:", error.response.status, error.response.statusText);
      }
      return message.reply(getLang("error"));
    }
  }
};