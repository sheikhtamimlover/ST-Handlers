module.exports = {
  config: {
    name: "gcinfo",
    version: "1.0",
    author: "Rana x ChatGPT",
    countDown: 5,
    role: 0,
    shortDescription: "Show group info with photo",
    longDescription: "Shows group chat info and sends group picture",
    category: "group",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, threadsData }) {
    try {
      const threadID = event.threadID;

      const info = await api.getThreadInfo(threadID);

      const name = info.threadName || "No Name";
      const id = info.threadID;
      const emoji = info.emoji || "❌";
      const members = info.participantIDs.length;
      const adminCount = info.adminIDs.length;

      const msg =
`📌 𝗚𝗥𝗢𝗨𝗣 𝗜𝗡𝗙𝗢

📝 Name: ${name}
🆔 ID: ${id}
👥 Members: ${members}
👑 Admins: ${adminCount}
😀 Emoji: ${emoji}`;

      // Send group picture if exists
      if (info.imageSrc) {
        const axios = require("axios");
        const fs = require("fs-extra");

        const img = (await axios.get(info.imageSrc, { responseType: "arraybuffer" })).data;
        const path = __dirname + "/cache/gc.png";

        fs.writeFileSync(path, Buffer.from(img, "utf-8"));

        return api.sendMessage(
          {
            body: msg,
            attachment: fs.createReadStream(path)
          },
          threadID,
          () => fs.unlinkSync(path)
        );
      } else {
        return api.sendMessage(msg, threadID);
      }

    } catch (e) {
      console.log(e);
      return api.sendMessage("❌ Failed to get group info.", event.threadID);
    }
  }
};