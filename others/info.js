const fs = require("fs-extra");
const request = require("request");
const os = require("os");

module.exports = {
  config: {
    name: "info",
    aliases: ["info"],
    version: "1.4",
    author: "Tom 🦆💨",
    shortDescription: "Display bot and user information",
    longDescription: "Shows user info, bot details, uptime, and video clips",
    category: "INFO",
    guide: { en: "Type 'info' or use prefix + info" },
    usePrefix: false // to enable no-prefix
  },

  onStart: async function (context) {
    await module.exports.sendInfo(context); // works with prefix
  },

  onChat: async function ({ api, event }) {
    const body = (event.body || "").toLowerCase().trim();
    const prefix = global.GoatBot.config.prefix;
    const triggers = ["info", "cmdname", `${prefix}info`, `${prefix}cmdname`];
    if (triggers.includes(body)) {
      await module.exports.sendInfo({ api, event });
    }
  },

  sendInfo: async function ({ api, event }) {
    const userInfo = {
      name: "卡姆鲁尔",
      age: "17+",
      location: "𝗥𝗮𝗻𝗴𝗽𝘂𝗿",
      bio: "JavaScript Lover | Forever Curious",
      botName: "『 𝗕𝗔'𝗕𝗬 くめ 』",
      botVersion: "1.0"
    };

    const formatTime = seconds => {
      const d = Math.floor(seconds / (3600 * 24));
      const h = Math.floor((seconds % (3600 * 24)) / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${d}d ${h}h ${m}m ${s}s`;
    };

    const msg = `
╭━━〔 𝐀𝐝𝐦𝐢𝐧 𝐈𝐧𝐟𝐨 〕━━╮
┣ ⏤👤 𝗡𝗮𝗺𝗲: ${userInfo.name}
┣ ⏤🎂 𝗔𝗴𝗲: ${userInfo.age}
┣ ⏤📍 𝗟𝗼𝗰𝗮𝘁𝗶𝗼𝗻: ${userInfo.location}
┣ ⏤📝 𝗕𝗶𝗼: ${userInfo.bio}
╰━━━━━━━━━━━━━━╯

╭━━〔 𝗕𝗼𝘁 𝗜𝗻𝗳𝗼 〕━━╮
┣ ⏤🤖 𝗡𝗮𝗺𝗲: ${userInfo.botName}
┣ ⏤🛠 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${userInfo.botVersion}
┣ ⏤⏱ 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲: ${formatTime(process.uptime())}
┣ ⏤🖥 𝗦𝘆𝘀 𝗨𝗽𝘁𝗶𝗺𝗲: ${formatTime(os.uptime())}
╰━━━━━━━━━━━━━━╯`.trim();

    const videoLinks = [
      "https://res.cloudinary.com/mahiexe/video/upload/v1748510603/mahi/1748510602853-453438222.mp4",
      "https://res.cloudinary.com/mahiexe/video/upload/v1748510603/mahi/1748510602853-453438222.mp4"
    ];

    try {
      const attachments = await Promise.all(videoLinks.map(async (url, i) => {
        const path = `${__dirname}/cache/info_video_${i}.mp4`;
        await new Promise((resolve, reject) =>
          request(url)
            .pipe(fs.createWriteStream(path))
            .on("finish", resolve)
            .on("error", reject)
        );
        return fs.createReadStream(path);
      }));

      await api.sendMessage(
        { body: msg, attachment: attachments },
        event.threadID,
        () => {
          // Clean up cache files
          attachments.forEach(a => a.path && fs.unlink(a.path, () => {}));
        },
        event.messageID
      );
    } catch (err) {
      console.error("❌ Error loading video:", err);
      api.sendMessage("⚠️ Failed to fetch info. Please try again later.", event.threadID);
    }
  }
};
