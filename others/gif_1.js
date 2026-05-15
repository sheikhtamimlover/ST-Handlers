module.exports = {
  config: {
    name: "gif",
    aliases: ["searchgif"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Search and send random GIFs based on keywords with beautiful UI",
    category: "fun",
    guide: "{pn} <keyword> - Example: {pn} hugging"
  },

  langs: {
    en: {
      noKeyword: "❌ Please enter a keyword to search for GIFs!\n\n📝 Usage: {pn} <keyword>\n💡 Example: {pn} love",
      searching: "╔═══════════════════╗\n║  🔍 GIF SEARCH  🔍  ║\n╚═══════════════════╝\n\n🎬 Searching for: {keyword}\n⏳ Please wait...",
      noResults: "❌ No GIFs found for \"{keyword}\"\n\n💡 Try different keywords!",
      error: "❌ Sorry, an error occurred while searching for GIFs.\n\nPlease try again later!"
    }
  },

  ST: async function({ api, event, args, message, getLang, commandName }) {
    const axios = require("axios");
    const fs = require("fs-extra");
    const path = require("path");

    const keyword = args.join(" ");
    
    if (!keyword) {
      return message.reply(getLang("noKeyword").replace("{pn}", commandName));
    }

    try {
      // Show searching message
      await message.reply(getLang("searching").replace("{keyword}", keyword));
      
      // Search for GIFs using Giphy API
      const response = await axios.get(`https://api.giphy.com/v1/gifs/search`, {
        params: {
          api_key: 'wBUEVK7mbqAaiCBRrYKYyEMMqZ1sPujI',
          q: keyword,
          limit: 50,
          offset: 0,
          rating: 'g',
          lang: 'en',
          bundle: 'messaging_non_clips'
        },
        timeout: 15000
      });

      const gifs = response.data.data;
      
      if (gifs.length === 0) {
        return message.reply(getLang("noResults").replace("{keyword}", keyword));
      }

      // Select a random GIF from the results
      const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
      const gifUrl = randomGif.images.original.url;
      const gifTitle = randomGif.title || keyword;

      // Download and send the GIF
      const gifPath = path.join(__dirname, "cache", `gif_${event.senderID}_${Date.now()}.gif`);
      
      const gifResponse = await axios.get(gifUrl, {
        responseType: "arraybuffer",
        timeout: 20000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      await fs.outputFile(gifPath, gifResponse.data);

      const successMessage = `╔═══════════════════╗\n║  ✨ GIF FOUND  ✨  ║\n╚═══════════════════╝\n\n🎬 Title: ${gifTitle}\n🔍 Keyword: ${keyword}\n📊 Total Results: ${gifs.length}\n\n💝 Enjoy your GIF!`;

      // Send the GIF
      await message.reply({
        body: successMessage,
        attachment: fs.createReadStream(gifPath)
      }, () => {
        if (fs.existsSync(gifPath)) {
          try {
            fs.unlinkSync(gifPath);
          } catch (e) {
            console.log("Could not delete temp gif file:", e);
          }
        }
      });

    } catch (error) {
      console.error("GIF search error:", error);
      return message.reply(getLang("error"));
    }
  }
};