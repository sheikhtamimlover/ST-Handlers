module.exports = {
  config: {
    name: "1",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Search and download images from Pinterest",
    category: "image",
    guide: {
      en: "{pn} <search query> - <number of images>\nExample: {pn} anime girl - 5"
    }
  },

  ST: async function({ message, args, event, api }) {
    const axios = require('axios');
    const fs = require('fs-extra');
    const path = require('path');

    if (args.length === 0) {
      return message.reply("❌ Please provide a search query!\n\nUsage: 1 <search> - <number>\nExample: 1 sunset - 3");
    }

    // Parse input
    const input = args.join(" ");
    const parts = input.split("-").map(p => p.trim());
    
    let query = parts[0];
    let count = 1;

    if (parts.length > 1) {
      const numberPart = parseInt(parts[parts.length - 1]);
      if (!isNaN(numberPart)) {
        count = numberPart;
        query = parts.slice(0, -1).join("-").trim();
      }
    }

    // Validate
    if (!query) {
      return message.reply("❌ Please provide a search query!");
    }

    if (count < 1) count = 1;
    if (count > 10) count = 10;

    const processingMsg = await message.reply(`🔍 Searching Pinterest for "${query}"...\n📸 Fetching ${count} image(s)...`);

    try {
      // Multiple API fallbacks
      const apis = [
        `https://api.kenliejugarap.com/pinterestbymarjhun/?search=${encodeURIComponent(query)}`,
        `https://pinterest-api-one.vercel.app/?q=${encodeURIComponent(query)}`,
        `https://api-samir.onrender.com/pinterest?search=${encodeURIComponent(query)}`,
        `https://joshweb.click/api/pinterest?q=${encodeURIComponent(query)}`
      ];

      let imageUrls = [];
      let success = false;

      for (const apiUrl of apis) {
        try {
          const response = await axios.get(apiUrl, { timeout: 15000 });
          
          if (response.data) {
            // Handle different API response formats
            if (Array.isArray(response.data)) {
              imageUrls = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
              imageUrls = response.data.data;
            } else if (response.data.result && Array.isArray(response.data.result)) {
              imageUrls = response.data.result;
            } else if (response.data.images && Array.isArray(response.data.images)) {
              imageUrls = response.data.images;
            }

            if (imageUrls.length > 0) {
              success = true;
              break;
            }
          }
        } catch (err) {
          continue;
        }
      }

      if (!success || imageUrls.length === 0) {
        return message.reply("❌ No images found for your search query! Try different keywords.");
      }

      // Extract image URLs from objects if needed
      imageUrls = imageUrls.map(item => {
        if (typeof item === 'string') return item;
        return item.url || item.image || item.link || item.src || item.original || item;
      }).filter(url => typeof url === 'string' && url.startsWith('http'));

      if (imageUrls.length === 0) {
        return message.reply("❌ Failed to extract image URLs. Please try again!");
      }

      imageUrls = imageUrls.slice(0, count);
      const attachments = [];
      const cacheDir = path.join(__dirname, 'cache');
      
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // Download images
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          const imageUrl = imageUrls[i];
          const imagePath = path.join(cacheDir, `pinterest_${Date.now()}_${i}.jpg`);
          
          const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          fs.writeFileSync(imagePath, Buffer.from(imageResponse.data));
          attachments.push(fs.createReadStream(imagePath));
          
        } catch (error) {
          console.error(`Error downloading image ${i + 1}:`, error.message);
        }
      }

      if (attachments.length === 0) {
        return message.reply("❌ Failed to download images. Please try again!");
      }

      await message.reply({
        body: `✅ Found ${attachments.length} image(s) for "${query}" on Pinterest!`,
        attachment: attachments
      });

      // Clean up cache files
      setTimeout(() => {
        try {
          const files = fs.readdirSync(cacheDir);
          files.forEach(file => {
            if (file.startsWith('pinterest_')) {
              try {
                fs.unlinkSync(path.join(cacheDir, file));
              } catch (e) {}
            }
          });
        } catch (e) {}
      }, 60000);

      if (processingMsg && processingMsg.messageID) {
        api.unsendMessage(processingMsg.messageID);
      }

    } catch (error) {
      console.error("Pinterest search error:", error);
      return message.reply("❌ An error occurred while searching Pinterest! Please try again.");
    }
  }
};