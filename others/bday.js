const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "bday",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "See admin's birthday",
    category: "info",
    guide: {
      en: "{pn} - Check admin birthday countdown"
    }
  },

  onStart: async function({ api, event, message }) {
    const cachePath = path.join(__dirname, "cache", "bday.png");
    await fs.ensureDir(path.dirname(cachePath));

    const targetDate = new Date("December 16, 2025 00:00:00");
    const now = new Date();

    const diffMs = targetDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const diffSeconds = Math.floor((diffMs / 1000) % 60);

    if (diffDays === 1) {
      const tomorrowMessage =
        `👉Admin 𝗔𝘆𝗲𝘀𝗵𝗮 𝗤𝘂𝗲𝗲𝗻 এর জন্মদিন আগামীকাল!\n অবশেষে এডমিনের জন্মদিন ফাঁস হয়ে গেল!\n\n উইশ করতে ভুলবে না কিন্তু...🥰😘`;
      return message.reply(tomorrowMessage);
    }

    if (diffDays === 0 && diffHours >= 0) {
      const happyBirthdayMessage = 
        `╔═══ 🎉 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎉 ════╗\n` +
        `║  - 𝗔𝘆𝗲𝘀𝗵𝗮 𝗤𝘂𝗲𝗲𝗻 💖 \n` +
        `╟─────────────────\n` +
        `║ 🎂 Everyone Please Wish Her Today! \n` +
        `║ 🥳 আজ আমাদের Maam এর জন্মদিন! \n` +
        `║ ❤️ মন থেকে উইশ করো সবাই! \n` +
        `╟─────────────────\n` +
        `║ 📩 Connect With Him: \n` +
        `║ ➤ 📘 Facebook : \n` +
        `║ www.facebook.com/61578414567795 \n` +
        `║ ➤ 💬 Messenger : \n` +
        `║ m.me/61578414567795 \n` +
        `╟─────────────────\n` +
        `║ 🫶 উইশ করো, দোয়া করো\n` +
        `║ এবং ভালোবাসা জানাও প্রিয় মেডাম 𝗔𝘆𝗲𝘀𝗵𝗮 𝗤𝘂𝗲𝗲𝗻 রে! ❤️‍🩹 \n` +
        `╚═════════════════════════╝`;
      return message.reply(happyBirthdayMessage);
    }

    if (diffDays < 0) {
      const leakMessage =
        `╔═══════════════════╗\n` +
        `║ 🎂 Admin 𝗔𝘆𝗲𝘀𝗵𝗮 𝗤𝘂𝗲𝗲𝗻\n` +
        `║ এর জন্মদিন ফাঁস হয়ে গেছে ❤️‍🩹🤌\n` +
        `╚═══════════════════╝`;
      return message.reply(leakMessage);
    }

    const countdownMessage = 
      `╔═══════════════════╗\n` +
      `║ 🎂 Admin 𝗔𝘆𝗲𝘀𝗵𝗮 𝗤𝘂𝗲𝗲𝗻\n` +
      `║ এর জন্মদিন ফাঁস হয়ে গেছে ❤️‍🩹🤌\n` +
      `║═══════════════════\n` +
      `║ 📅 Days : ${diffDays}\n` +
      `║ ⏰ Hours : ${diffHours}\n` +
      `║ 🕰️ Minutes : ${diffMinutes}\n` +
      `║ ⏳ Seconds : ${diffSeconds}\n` +
      `╚════════════════════╝`;

    const url = `https://graph.facebook.com/61578414567795/picture?height=720&width=720`;

    try {
      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(cachePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await message.reply({
        body: countdownMessage,
        attachment: fs.createReadStream(cachePath),
      });

      await fs.unlink(cachePath);
    } catch (error) {
      console.error("Birthday command error:", error);
      return message.reply(countdownMessage);
    }
  }
};