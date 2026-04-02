module.exports = {
  config: {
    name: "wiki",
    aliases: ["ويكيبيديا", "ويكي", "موسوعة"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "البحث في ويكيبيديا باللغة العربية",
    category: "info",
    guide: "{pn} <كلمة البحث>\nمثال: {pn} محمد صلاح"
  },
  langs: {
    en: {
      searching: "🔍 Searching Wikipedia for '{query}'...",
      notFound: "❌ No Wikipedia article found for '{query}'.",
      error: "❌ An error occurred while searching Wikipedia.",
      missingQuery: "❌ Please provide a search query!\nUsage: {pn} <search term>",
      readMore: "\n\n🔗 Read more: {url}"
    },
    ar: {
      searching: "🔍 جاري البحث في ويكيبيديا عن '{query}'...",
      notFound: "❌ لم يتم العثور على مقالة في ويكيبيديا عن '{query}'.",
      error: "❌ حدث خطأ أثناء البحث في ويكيبيديا.",
      missingQuery: "❌ الرجاء إدخال كلمة بحث!\nالاستخدام: {pn} <كلمة البحث>",
      readMore: "\n\n🔗 اقرأ المزيد: {url}"
    }
  },
  ST: async function({ message, args, event, api, getLang, commandName }) {
    const axios = require("axios");

    try {
      if (args.length === 0) {
        return message.reply(getLang("missingQuery").replace("{pn}", commandName));
      }

      const query = args.join(" ");
      
      await message.reply(getLang("searching").replace("{query}", query));

      const searchResponse = await axios.get("https://ar.wikipedia.org/w/api.php", {
        params: {
          action: "query",
          list: "search",
          srsearch: query,
          format: "json",
          srlimit: 1,
          utf8: 1
        },
        timeout: 15000
      });

      if (!searchResponse.data?.query?.search?.[0]) {
        return message.reply(getLang("notFound").replace("{query}", query));
      }

      const pageTitle = searchResponse.data.query.search[0].title;

      const contentResponse = await axios.get("https://ar.wikipedia.org/w/api.php", {
        params: {
          action: "query",
          prop: "extracts|info",
          exintro: true,
          explaintext: true,
          exsentences: 5,
          titles: pageTitle,
          format: "json",
          inprop: "url",
          utf8: 1
        },
        timeout: 15000
      });

      const pages = contentResponse.data.query.pages;
      const page = pages[Object.keys(pages)[0]];

      if (!page || page.missing) {
        return message.reply(getLang("notFound").replace("{query}", query));
      }

      let extract = page.extract || "";
      
      if (extract.length > 2000) {
        extract = extract.substring(0, 1997) + "...";
      }

      const url = page.fullurl || `https://ar.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`;

      const response = `📚 ${page.title}\n\n${extract}${getLang("readMore").replace("{url}", url)}`;

      await message.reply(response);

    } catch (error) {
      console.error("Wikipedia Command Error:", error.message);
      if (error.response) {
        console.error("API Error:", error.response.status, error.response.statusText);
      }
      return message.reply(getLang("error"));
    }
  }
};