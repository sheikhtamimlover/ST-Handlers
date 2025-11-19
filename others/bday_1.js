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
    guide: "{pn}"
  },

  ST: async function({ api, event, message }) {
    try {
      const cacheDir = path.join(__dirname, "..", "..", "cache");
      await fs.ensureDir(cacheDir);
      const cachePath = path.join(cacheDir, `bday_${Date.now()}.png`);

      const currentYear = new Date().getFullYear();
      const currentDate = new Date();
      
      let targetDate = new Date(currentYear, 7, 11, 0, 0, 0); // August 11 (month is 0-indexed)
      
      if (currentDate > targetDate) {
        targetDate = new Date(currentYear + 1, 7, 11, 0, 0, 0);
      }

      const diffMs = targetDate - currentDate;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const diffSeconds = Math.floor((diffMs / 1000) % 60);

      let responseMessage;

      if (diffDays === 0 && diffHours === 0 && diffMinutes <= 5) {
        responseMessage =
          `╔═══ 🎉 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎉 ════╗\n` +
          `║  - 𝗔𝘆𝗲𝘀𝗵𝗮 𝗤𝘂𝗲𝗲𝗻 💖 \n` +
          `╟─────────────────\n` +
          `║ 🎂 Everyone Please Wish Her Today! \n` +
          `║ 🥳 আজ আমাদের Maam এর জন্মদিন! \n` +
          `║ ❤️ মন থেকে উইশ করো সবাই! \n` +
          `╟─────────────────\n` +
          `║ 📩 Connect With Her: \n` +
          `║ ➤ 📘 Facebook : \n` +
          `║ www.facebook.com/61578414567795 \n` +
          `║ ➤ 💬 Messenger : \n` +
          `║ m.me/61578414567795 \n` +
          `╟─────────────────\n` +
          `║ 🫶 উইশ করো, দোয়া করো\n` +
          `║ এবং ভালোবাসা জানাও প্রিয় মেডাম 𝗔𝘆𝗲𝘀𝗵𝗮 𝗤𝘂𝗲𝗲𝗻 রে! ❤️‍🩹 \n` +
          `╚═════════════════════════╝`;
      } else if (diffDays === 1) {
        responseMessage =
          `👉Admin 𝗔𝘆𝗲𝘀𝗵𝗮 𝗤𝘂𝗲𝗲𝗻 এর জন্মদিন আগামীকাল!\n অবশেষে এডমিনের জন্মদিন ফাঁস হয়ে গেল!\n\n উইশ করতে ভুলবে না কিন্তু...🥰😘`;
      } else if (diffDays === 0) {
        responseMessage =
          `╔═══ 🎉 𝐇𝐀𝐏𝐏𝐘 𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 🎉 ════╗\n` +
          `║  - 𝗔𝘆𝗲𝘀𝗵𝗮 𝗤𝘂𝗲𝗲𝗻 💖 \n` +
          `╟─────────────────\n` +
          `║ 🎂 Everyone Please Wish Her Today! \n` +
          `║ 🥳 আজ আমাদের Maam এর জন্মদিন! \n` +
          `║ ❤️ মন থেকে উইশ করো সবাই! \n` +
          `╟─────────────────\n` +
          `║ 📩 Connect With Her: \n` +
          `║ ➤ 📘 Facebook : \n` +
          `║ www.facebook.com/61578414567795 \n` +
          `║ ➤ 💬 Messenger : \n` +
          `║ m.me/61578414567795 \n` +
          `╟─────────────────\n` +
          `║ 🫶 উইশ করো, দোয়া করো\n` +
          `║ এবং ভালোবাসা জানাও প্রিয় মেডাম 𝗔𝘆𝗲𝘀𝗵𝗮 𝗤𝘂𝗲𝗲𝗻 রে! ❤️‍🩹 \n` +
          `╚═════════════════════════╝`;
      } else {
        responseMessage =
          `╔═══════════════════╗\n` +
          `║ 🎂 Admin 𝗔𝘆𝗲𝘀𝗵𝗮 𝗤𝘂𝗲𝗲𝗻\n` +
          `║ এর জন্মদিন ফাঁস হয়ে গেছে ❤️‍🩹🤌\n` +
          `║═══════════════════\n` +
          `║ 📅 Days : ${diffDays}\n` +
          `║ ⏰ Hours : ${diffHours}\n` +
          `║ 🕰️ Minutes : ${diffMinutes}\n` +
          `║ ⏳ Seconds : ${diffSeconds}\n` +
          `╚════════════════════╝`;
      }

      const url = `https://graph.facebook.com/61578414567795/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const response = await axios({
        url,
        method: "GET",
        responseType: "stream",
        timeout: 30000
      });

      const writer = fs.createWriteStream(cachePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await message.send({
        body: responseMessage,
        attachment: fs.createReadStream(cachePath)
      });

      setTimeout(() => {
        if (fs.existsSync(cachePath)) {
          fs.unlinkSync(cachePath);
        }
      }, 1000);

    } catch (error) {
      console.error("Birthday command error:", error);
      
      const currentYear = new Date().getFullYear();
      const currentDate = new Date();
      let targetDate = new Date(currentYear, 7, 11, 0, 0, 0);
      
      if (currentDate > targetDate) {
        targetDate = new Date(currentYear + 1, 7, 11, 0, 0, 0);
      }

      const diffMs = targetDate - currentDate;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const diffSeconds = Math.floor((diffMs / 1000) % 60);

      const fallbackMessage =
        `╔═══════════════════╗\n` +
        `║ 🎂 Admin 𝗔𝘆𝗲𝘀𝗵𝗮 𝗤𝘂𝗲𝗲𝗻\n` +
        `║ এর জন্মদিন ফাঁস হয়ে গেছে ❤️‍🩹🤌\n` +
        `║═══════════════════\n` +
        `║ 📅 Days : ${diffDays}\n` +
        `║ ⏰ Hours : ${diffHours}\n` +
        `║ 🕰️ Minutes : ${diffMinutes}\n` +
        `║ ⏳ Seconds : ${diffSeconds}\n` +
        `╚════════════════════╝`;

      return message.reply(fallbackMessage);
    }
  }
};