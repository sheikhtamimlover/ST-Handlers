const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");

module.exports = {
  config: {
    name: "latthi",
    aliases: ["usta", "latti", "kik"],
    version: "1.0.3",
    author: "Rana babu",
    countDown: 5,
    role: 0,
    longDescription: "{p}latthi @mention or reply someone to kick them 🦶",
    category: "funny",
    guide: "{p}latthi and mention or reply to someone 🦶",
    usePrefix: true,
    premium: false,
    notes: "If you change the author then the command will not work and not usable"
  },

  onStart: async function ({ api, message, event, usersData }) {
    const owner = module.exports.config;
    const eAuth = "UmFuYSBiYWJ1";
    const dAuth = Buffer.from(eAuth, "base64").toString("utf8");
    
    if (owner.author !== dAuth) {
      return message.reply("you've changed the author name, please set it to default(Rana babu) otherwise this command will not work.🙂");
    }

    let one = event.senderID;
    let two;
    const mention = Object.keys(event.mentions || {});
    
    if (mention.length > 0) {
      two = mention[0];
    } else if (event.type === "message_reply" && event.messageReply) {
      two = event.messageReply.senderID;
    } else {
      return message.reply("Kake latthi marte chao? take mention ba reply koro 🌚");
    }

    if (!two) return message.reply("Kake latthi marte chao? take mention ba reply koro 🌚");

    try {
      // Fetch Avatar URLs
      const avatarURL1 = `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
      const avatarURL2 = `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // Helper to load image from URL via axios to ensure buffer stability
      const getImg = async (url) => {
        const res = await axios.get(url, { responseType: 'arraybuffer' });
        return await loadImage(Buffer.from(res.data, 'utf-8'));
      };

      const canvas = createCanvas(950, 850);
      const ctx = canvas.getContext("2d");

      // Load all images
      const [background, avatar1, avatar2] = await Promise.all([
        loadImage("https://i.imgur.com/3DZjUH7.jpeg"),
        getImg(avatarURL1),
        getImg(avatarURL2)
      ]);

      // Draw Background
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // --- DRAW SENDER (Left) ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(180, 250, 85, 0, Math.PI * 2); 
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 95, 165, 170, 170); 
      ctx.restore();

      // --- DRAW TARGET (Right) ---
      ctx.save();
      ctx.beginPath();
      ctx.arc(700, 120, 85, 0, Math.PI * 2); 
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 615, 35, 170, 170); 
      ctx.restore();

      const dir = `${__dirname}/tmp`;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir);
      
      const outputPath = `${dir}/latthi_${event.senderID}.png`;
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(outputPath, buffer);

      message.reply({
        body: "Usta kha! 🦶😵",
        attachment: fs.createReadStream(outputPath)
      }, () => {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      });

    } catch (error) {
      console.error("Latthi Error:", error);
      message.reply("Profile picture load korte somossya hoyeche. Abar chesta korun. 🐸");
    }
  }
};