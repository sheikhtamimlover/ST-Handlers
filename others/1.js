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
    if (count > 10) count = 10; // Limit to 10 images

    const processingMsg = await message.reply(`🔍 Searching Pinterest for "${query}"...\n📸 Fetching ${count} image(s)...`);

    try {
      // Pinterest API endpoint
      const apiUrl = `https://api.ryzendesu.vip/api/search/pinterest?search=${encodeURIComponent(query)}`;
      
      const response = await axios.get(apiUrl);
      
      if (!response.data || !response.data.data || response.data.data.length === 0) {
        return message.reply("❌ No images found for your search query!");
      }

      const imageUrls = response.data.data.slice(0, count);
      const attachments = [];
      const cacheDir = path.join(__dirname, 'cache');
      
      // Ensure cache directory exists
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
            timeout: 30000
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

      // Send images
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
      }, 60000); // Clean after 1 minute

      // Unsend processing message
      if (processingMsg && processingMsg.messageID) {
        api.unsendMessage(processingMsg.messageID);
      }

    } catch (error) {
      console.error("Pinterest search error:", error);
      
      let errorMsg = "❌ An error occurred while searching Pinterest!";
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMsg = "❌ Pinterest API not available. Please try again later!";
        } else if (error.response.status === 429) {
          errorMsg = "❌ Too many requests! Please wait a moment and try again.";
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = "❌ Request timeout! Please try again.";
      }
      
      return message.reply(errorMsg);
    }
  }
};