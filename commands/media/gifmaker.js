module.exports = {
  config: {
    name: "gifmaker",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    description: "Create animated GIF from images",
    category: "media",
    guide: {
      en: "{pn} [width] [height] [delay] - Reply to images to create GIF",
      bn: "{pn} [প্রস্থ] [উচ্চতা] [বিলম্ব] - ছবিতে রিপ্লাই করে GIF তৈরি করুন"
    }
  },

  ST: async function({ message, args, event, api }) {
    const GIFEncoder = require('gifencoder');
    const { createCanvas, loadImage } = require('canvas');
    const fs = require('fs-extra');
    const axios = require('axios');
    const path = require('path');

    try {
      if (event.type !== "message_reply" || !event.messageReply.attachments || event.messageReply.attachments.length < 2) {
        return message.reply("⚠️ Please reply to at least 2 images to create a GIF!");
      }

      const width = parseInt(args[0]) || 500;
      const height = parseInt(args[1]) || 500;
      const delay = parseInt(args[2]) || 200;

      const attachments = event.messageReply.attachments.filter(att => att.type === "photo");
      
      if (attachments.length < 2) {
        return message.reply("⚠️ Need at least 2 images to create a GIF!");
      }

      message.reply(`🎨 Creating GIF from ${attachments.length} images...\nSize: ${width}x${height}\nDelay: ${delay}ms`);

      const encoder = new GIFEncoder(width, height);
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      const outputPath = path.join(__dirname, 'cache', `gif_${Date.now()}.gif`);
      const stream = fs.createWriteStream(outputPath);

      encoder.createReadStream().pipe(stream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(delay);
      encoder.setQuality(10);

      for (let i = 0; i < attachments.length; i++) {
        const imageUrl = attachments[i].url;
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imgBuffer = Buffer.from(response.data);
        
        const img = await loadImage(imgBuffer);
        ctx.drawImage(img, 0, 0, width, height);
        encoder.addFrame(ctx);
      }

      encoder.finish();

      await new Promise(resolve => stream.on('finish', resolve));

      await message.reply({
        body: `✅ GIF created successfully!\n📊 Frames: ${attachments.length}\n⏱️ Delay: ${delay}ms\n📐 Size: ${width}x${height}`,
        attachment: fs.createReadStream(outputPath)
      });

      fs.unlinkSync(outputPath);

    } catch (error) {
      console.error(error);
      message.reply(`❌ Error creating GIF: ${error.message}`);
    }
  }
};