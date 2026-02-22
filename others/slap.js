const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "slap",
    version: "1.0.3",
    author: "Rana babu",
    countDown: 5,
    role: 0,
    longDescription: "{p}slap @mention or reply someone you want to slap that person 👋",
    category: "funny",
    guide: "{p}slap and mention or reply to someone to slap them 🤕",
    usePrefix: true,
    premium: false,
    notes: "If you change the author then the command will not work and not usable"
  },

  onStart: async function ({ api, message, event, usersData }) {
    const owner = module.exports.config;
    // Base64 for "Rana babu"
    const eAuth = "UmFuYSBiYWJ1";
    const dAuth = Buffer.from(eAuth, "base64").toString("utf8");
    if (owner.author !== dAuth) return message.reply("you've changed the author name, please set it to default(Rana babu) otherwise this command will not work.🙂");

    let one = event.senderID, two;
    const mention = Object.keys(event.mentions || {});
    
    if (mention.length > 0) {
      two = mention[0];
    } else if (event.type === "message_reply" && event.messageReply) {
      two = event.messageReply.senderID;
    } else {
      return message.reply("please mention or reply someone message to slap him/her 🌚");
    };

    if (!two) return message.reply("please mention or reply someone message to slap him/her 🌚");

    try {
      const avatarURL1 = await usersData.getAvatarUrl(one);
      const avatarURL2 = await usersData.getAvatarUrl(two);

      const canvas = createCanvas(950, 850);
      const ctx = canvas.getContext("2d");

      // background image
      const background = await loadImage("https://i.imgur.com/LSi7qDR.jpeg");
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      const avatar1 = await loadImage(avatarURL1);
      const avatar2 = await loadImage(avatarURL2);

      // --- POSITIONS ---
      // Avatar 2 (Target) - Right Side
      ctx.save();
      ctx.beginPath();
      ctx.arc(725, 300, 85, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 640, 220, 170, 170); // Target
      ctx.restore();

      // Avatar 1 (Sender) - Left Side
      ctx.save();
      ctx.beginPath();
      ctx.arc(175, 370, 85, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 90, 280, 170, 170); // Sender
      ctx.restore();

      const outputPath = `${__dirname}/tmp/slap_image.png`;
      const buffer = canvas.toBuffer("image/png");

      await fs.ensureDir(`${__dirname}/tmp`);
      fs.writeFileSync(outputPath, buffer);

      message.reply({
        body: "Take that! 👋😵",
        attachment: fs.createReadStream(outputPath)
      }, () => fs.unlinkSync(outputPath));
    } catch (error) {
      console.error(error.message);
      message.reply("an error occurred, please try again later.🐸");
    }
  }
};
