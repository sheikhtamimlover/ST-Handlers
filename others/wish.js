const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "wish",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Happy birthday wish for your friends",
    category: "fun",
    guide: {
      en: "{pn} @mention - Send birthday wish to mentioned user"
    }
  },

  ST: async function ({ args, usersData, api, event, message }) {
    const cacheDir = path.join(__dirname, "cache");
    await fs.ensureDir(cacheDir);
    
    const bgPath = path.join(cacheDir, `bg_${event.threadID}_${Date.now()}.png`);
    const avtPath = path.join(cacheDir, `avt_${event.threadID}_${Date.now()}.png`);

    const targetID = Object.keys(event.mentions)[0] || event.senderID;
    
    const wrapText = async function(ctx, text, maxWidth) {
      if (ctx.measureText(text).width < maxWidth) return [text];
      if (ctx.measureText("W").width > maxWidth) return null;

      const words = text.split(" ");
      const lines = [];
      let line = "";

      while (words.length > 0) {
        if (!words[0]) {
          words.shift();
          continue;
        }

        let split = false;
        while (words[0] && ctx.measureText(words[0]).width >= maxWidth) {
          const word = words[0];
          words[0] = word.slice(0, -1);
          if (split) {
            words[1] = word.slice(-1) + (words[1] || "");
          } else {
            split = true;
            words.splice(1, 0, word.slice(-1));
          }
        }

        if (words[0] && ctx.measureText(line + words[0]).width < maxWidth) {
          line += words.shift() + " ";
        } else {
          lines.push(line.trim());
          line = "";
        }

        if (words.length === 0) {
          lines.push(line.trim());
        }
      }
      return lines.filter(l => l.length > 0);
    };
    
    try {
      const targetName = await usersData.getName(targetID);
      const wisherName = await usersData.getName(event.senderID);

      const bgURLs = ["https://i.postimg.cc/k4RS69d8/20230921-195836.png"];
      const bgURL = bgURLs[Math.floor(Math.random() * bgURLs.length)];

      const { loadImage, createCanvas } = require("canvas");

      const avtResponse = await axios.get(
        `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { 
          responseType: "arraybuffer",
          timeout: 10000
        }
      );
      await fs.writeFile(avtPath, Buffer.from(avtResponse.data));

      const bgResponse = await axios.get(bgURL, { 
        responseType: "arraybuffer",
        timeout: 10000
      });
      await fs.writeFile(bgPath, Buffer.from(bgResponse.data));

      const bgImage = await loadImage(bgPath);
      const avtImage = await loadImage(avtPath);
      const canvas = createCanvas(bgImage.width, bgImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
      ctx.font = "400 32px Arial";
      ctx.fillStyle = "#1878F3";
      ctx.textAlign = "start";

      const nameLines = await wrapText(ctx, targetName, 1160);
      if (nameLines && nameLines.length > 0) {
        ctx.fillText(nameLines.join("\n"), 120, 727);
      }

      ctx.drawImage(avtImage, 70, 270, 400, 400);

      const imageBuffer = canvas.toBuffer("image/png");
      await fs.writeFile(bgPath, imageBuffer);
      
      if (await fs.pathExists(avtPath)) {
        await fs.remove(avtPath);
      }

      const wishMessage =
        "┏┓┏┓\n" +
        "┃┗┛ 𝒂𝒑𝒑𝒚_🎂🎆🎉\n" +
        "┃┏┓┃ 🄱🄸🅁🅃🄷🄳🄰🅈🎉🎆\n" +
        "┗┛┗┛ Birthday Wishes For You..💐💗\n" +
        "🥰 " + targetName + " 😘\n\n" +
        "_𝐇𝐚𝐩𝐩𝐲 𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐲 🎂_\n" +
        "অনেক অনেক শুভ কামনা, দোয়া ও ভালবাসা রইল তোমার জন্য ❤\n" +
        "তোমার জীবনের প্রতিটা ক্ষণ আনন্দময় হোক এই কামনা করি...\n" +
        "শুভ জন্মদিন 🎂🎂🎂\n" +
        "🌷🌷\n\n" +
        "_𝐇𝐚𝐩𝐩𝐲 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 𝐖𝐢𝐬𝐡𝐞𝐬 𝐟𝐨𝐫 𝐔😍_\n" +
        "𝐈 𝐰𝐢𝐬𝐡 𝐮 𝐦𝐚𝐧𝐲 𝐦𝐨𝐫𝐞 𝐡𝐚𝐩𝐩𝐲 𝐫𝐞𝐭𝐮𝐫𝐧𝐬 𝐨𝐟 𝐭𝐡𝐞 𝐝𝐚𝐲 💞\n\n" +
        "🖤 আশা করি সারাজীবন এমনই থাকবা, সবসময় ভালো থাকো এই কামনা করি\n" +
        "❤ জন্মদিনে শুধু এটাই কাম‍্য যাতে ভবিষ্যতে অনেক অনেক সুখী হও ❤\n" +
        "শুভ জন্মদিন 🫂 ❤️‍🩹\n\n" +
        "𝐌𝐚𝐤𝐢𝐧𝐠 𝐭𝐡𝐢𝐬 𝐰𝐢𝐬𝐡: " + wisherName;

      await message.reply({
        body: wishMessage,
        attachment: fs.createReadStream(bgPath)
      });

      setTimeout(async () => {
        if (await fs.pathExists(bgPath)) {
          await fs.remove(bgPath);
        }
      }, 5000);

    } catch (error) {
      console.error("Wish command detailed error:", error.message, error.stack);
      
      if (await fs.pathExists(avtPath)) await fs.remove(avtPath);
      if (await fs.pathExists(bgPath)) await fs.remove(bgPath);
      
      return message.reply("❌ An error occurred while creating the birthday wish.\n\nError: " + error.message);
    }
  }
};