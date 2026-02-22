const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "kiss",
    version: "3.0.0",
    author: "Rakib Adil",
    countDown: 5,
    role: 0,
    shortDescription: "Kiss someone 😘",
    longDescription: "Mention or reply someone to kiss 😚",
    category: "fun",
    guide: "{p}kiss @mention or reply",
    usePrefix: true
  },

  onStart: async function ({ message, event, usersData }) {
    try {
      const senderID = event.senderID;
      let targetID;

      // ✅ GoatBot mention fix
      if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }

      // ✅ Reply fallback
      if (!targetID && event.type === "message_reply") {
        targetID = event.messageReply.senderID;
      }

      if (!targetID) {
        return message.reply("⚠️ কাউকে mention বা reply করো 😚");
      }

      const senderAvatar = await usersData.getAvatarUrl(senderID);
      const targetAvatar = await usersData.getAvatarUrl(targetID);

      const canvas = createCanvas(900, 600);
      const ctx = canvas.getContext("2d");

      // ✅ Your new background link added
      const bg = await loadImage("https://tinyurl.com/24kjrrvj");
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      const av1 = await loadImage(senderAvatar);
      const av2 = await loadImage(targetAvatar);

      // 🔥 LEFT SIDE = Sender (command user)
      ctx.save();
      ctx.beginPath();
      ctx.arc(250, 350, 90, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(av1, 160, 260, 180, 180);
      ctx.restore();

      // 🔥 RIGHT SIDE = Target (mentioned / replied user)
      ctx.save();
      ctx.beginPath();
      ctx.arc(650, 350, 90, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(av2, 560, 260, 180, 180);
      ctx.restore();

      const filePath = path.join(__dirname, "tmp", `kiss_${Date.now()}.png`);
      fs.ensureDirSync(path.dirname(filePath));
      fs.writeFileSync(filePath, canvas.toBuffer());

      return message.reply(
        {
          body: "Ummmmaaaaahhh! 😽😘",
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error(err);
      return message.reply("❌ Error হয়েছে!");
    }
  }
};