const axios = require('axios');

module.exports = {
  config: {
    name: "porn",
    aliases: ["tit", "xxx", "adult"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Get top 10 adult videos from popular sites",
    category: "nsfw",
    guide: "{pn} [site name]\n{pn} categories - Show available sites"
  },

  langs: {
    en: {
      noApi: "❌ API service temporarily unavailable!",
      fetching: "🔍 Fetching top 10 videos...",
      error: "❌ Error occurred! Please try again.",
      invalidSite: "❌ Invalid site! Use '{pn} categories' to see available sites.",
      categories: "🔞 Available Sites:\n\n1. pornhub\n2. xvideos\n3. xnxx\n4. redtube\n5. youporn\n\nUsage: {pn} [site name]",
      noResults: "❌ No results found!",
      resultHeader: "🔞 Top 10 Videos from {site}:\n{'='repeat(30)}\n\n"
    }
  },

  ST: async function({ message, args, event, api, getLang, commandName }) {
    const { threadID, messageID } = event;

    // NSFW check - only allow in specific threads or DM
    const isNSFWAllowed = true; // You can add thread checking logic here

    if (!isNSFWAllowed) {
      return message.reply("❌ NSFW content is not allowed in this group!");
    }

    const input = args.join(" ").toLowerCase().trim();

    // Show categories
    if (input === "categories" || input === "list" || !input) {
      return message.reply(getLang("categories").replace(/{pn}/g, commandName));
    }

    const validSites = ["pornhub", "xvideos", "xnxx", "redtube", "youporn"];
    const site = validSites.find(s => input.includes(s)) || input;

    if (!validSites.includes(site)) {
      return message.reply(getLang("invalidSite").replace(/{pn}/g, commandName));
    }

    message.reply(getLang("fetching"));

    try {
      // API endpoints for adult content (example - replace with actual working API)
      const apiEndpoints = {
        pornhub: `https://api.example.com/pornhub/trending`,
        xvideos: `https://api.example.com/xvideos/top`,
        xnxx: `https://api.example.com/xnxx/popular`,
        redtube: `https://api.example.com/redtube/trending`,
        youporn: `https://api.example.com/youporn/top`
      };

      const apiUrl = apiEndpoints[site];
      
      if (!apiUrl) {
        return message.reply(getLang("noApi"));
      }

      const response = await axios.get(apiUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const videos = response.data?.videos || response.data?.results || [];

      if (!videos || videos.length === 0) {
        return message.reply(getLang("noResults"));
      }

      // Process top 10 videos
      const top10 = videos.slice(0, 10);
      let resultText = getLang("resultHeader").replace(/{site}/g, site.toUpperCase());

      top10.forEach((video, index) => {
        const title = video.title || video.name || "Untitled";
        const duration = video.duration || "N/A";
        const views = video.views || "N/A";
        const url = video.url || video.link || "#";
        const thumbnail = video.thumbnail || video.image || video.thumb || null;

        resultText += `${index + 1}. ${title}\n`;
        resultText += `   ⏱️ Duration: ${duration}\n`;
        resultText += `   👁️ Views: ${views}\n`;
        resultText += `   🔗 Link: ${url}\n\n`;
      });

      resultText += `\n⚠️ Content is 18+ only!\n`;
      resultText += `📊 Total videos found: ${videos.length}`;

      // Try to send with first video thumbnail
      const firstThumbnail = top10[0]?.thumbnail || top10[0]?.image;
      
      if (firstThumbnail) {
        try {
          const imageStream = await axios.get(firstThumbnail, { 
            responseType: 'stream',
            timeout: 10000 
          });
          
          return message.reply({
            body: resultText,
            attachment: imageStream.data
          });
        } catch (imgError) {
          // If image fails, send text only
          return message.reply(resultText);
        }
      } else {
        return message.reply(resultText);
      }

    } catch (error) {
      console.error("Porn command error:", error);
      
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        return message.reply("⏱️ Request timeout! Please try again.");
      }
      
      return message.reply(getLang("error") + `\n\nDetails: ${error.message}`);
    }
  }
};