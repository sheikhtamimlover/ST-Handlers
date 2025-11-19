const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "animescrape",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Scrape anime torrents from nyaa.si",
    category: "anime",
    guide: "{pn} <anime title>"
  },

  ST: async function({ message, args, event }) {
    if (!args[0]) {
      return message.reply("Please provide an anime title to search!");
    }

    const text = args.join(" ");
    const url = `https://nyaa.si/?f=0&c=1_2&q=${encodeURIComponent(text)}`;

    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);
      const arrayList = $(".table-responsive table tbody tr");
      const res = [];

      arrayList.each((idx, el) => {
        if (idx < 5) {
          const Data = {};
          Data.name = $(el).children("td").children("a").text().replace(/\t/gi, "").replace(/\n/gi, "");
          Data.torrentLink = $(el).children(".text-center").children("a")[1]?.attribs?.href || "";
          if (Data.name && Data.torrentLink) {
            res.push(Data);
          }
        }
      });

      if (res.length === 0) {
        return message.reply("No results found for: " + text);
      }

      let content = "🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹\n\n";
      
      res.forEach((item, index) => {
        content += `${index + 1}. ${item.name}\n\n${item.torrentLink}\n\n🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹🔸🔹\n\n`;
      });

      const filePath = path.join(__dirname, "cache", "torrent-links.txt");
      await fs.ensureDir(path.join(__dirname, "cache"));
      await fs.writeFile(filePath, content);

      await message.send({
        body: `Scraping Success ✅\n\nFound ${res.length} results for: ${text}\n\nDownload and check the text file below!\n\nNote: This API can only search for anime series/movies. Inside the text file there are torrent links that were scraped.\n\nSource: https://nyaa.si/`,
        attachment: fs.createReadStream(filePath)
      });

      await fs.unlink(filePath);

    } catch (error) {
      console.error(error);
      message.reply("Failed to scrape anime torrents. Please try again later.");
    }
  }
};