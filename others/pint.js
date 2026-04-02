module.exports = {
  config: {
    name: "pint",
    aliases: ["صورة", "بنترست", "بين"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "يجلب صور من Pinterest",
    category: "image",
    guide: "{pn} <كلمة البحث> [عدد الصور]\nمثال: {pn} nature 5"
  },
  langs: {
    en: {
      searching: "🔍 Searching Pinterest for '{query}'...",
      notFound: "❌ No images found for '{query}'. Try different keywords.",
      error: "❌ An error occurred while fetching images.",
      invalidCount: "❌ Please specify a number between 1 and 15.",
      missingQuery: "❌ Please provide a search query!\nUsage: {pn} <search term> [count]",
      foundImages: "✅ Found {count} image(s) for '{query}'",
      downloading: "📥 Downloading {count} images..."
    },
    ar: {
      searching: "🔍 جاري البحث في Pinterest عن '{query}'...",
      notFound: "❌ لم يتم العثور على صور لـ '{query}'. جرب كلمات بحث أخرى.",
      error: "❌ حدث خطأ أثناء جلب الصور.",
      invalidCount: "❌ الرجاء تحديد رقم بين 1 و 15.",
      missingQuery: "❌ الرجاء إدخال كلمة بحث!\nالاستخدام: {pn} <كلمة البحث> [العدد]",
      foundImages: "✅ تم العثور على {count} صورة لـ '{query}'",
      downloading: "📥 جاري تحميل {count} صورة..."
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

      const apiUrl = `https://pin-kshitiz.vercel.app/pin?search=${encodeURIComponent(query)}`;
      const { data } = await axios.get(apiUrl, { timeout: 15000 });

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
            maxContentLength: 50 * 1024 * 1024
          })
          .then(imgResponse => {
            const ext = images[i].match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)?.[1] || 'jpg';
            const tempPath = path.join(cachePath, `pint_${timestamp}_${i}.${ext}`);
            fs.writeFileSync(tempPath, Buffer.from(imgResponse.data));
            return tempPath;
          })
          .catch(err => {
            console.error(`Failed to download image ${i}:`, err.message);
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
      console.error("Pinterest Command Error:", error.message);
      if (error.response) {
        console.error("API Response:", error.response.status, error.response.data);
      }
      return message.reply(getLang("error"));
    }
  }
};