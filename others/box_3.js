const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

function getRandomTime(threadID) {
  const seed = parseInt(threadID.slice(-4), 16);
  const hours = (seed % 12) + 1;
  const minutes = seed % 60;
  const seconds = seed % 60;
  const ampm = seed % 2 === 0 ? "AM" : "PM";
  return `${hours.toString().padStart(2,"0")}:${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")} ${ampm}`;
}

module.exports = {
  config: {
    name: "box",
    version: "3.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Display all group boxes with detailed information",
    category: "info",
    guide: {
      en: "{pn} [page] - Show group boxes\n{pn} info <number/ID> - Get detailed info about a group"
    }
  },

  onStart: async function({ message, args, event, api, commandName }) {
    try {
      const threads = await api.getThreadList(200, null, ["INBOX"]);
      const groupThreads = threads.filter(t => t.isGroup);

      const itemsPerPage = 10;
      const page = parseInt(args[0]) || 1;
      const totalPages = Math.ceil(groupThreads.length / itemsPerPage);

      if (page < 1 || page > totalPages)
        return message.reply(`❌ Invalid page! Available pages: 1-${totalPages}`);

      const start = (page - 1) * itemsPerPage;
      const pageGroups = groupThreads.slice(start, start + itemsPerPage);

      // Fetch all info in parallel for speed
      const infos = await Promise.all(pageGroups.map(t => api.getThreadInfo(t.threadID)));

      let groupList = "";
      for (let i = 0; i < infos.length; i++) {
        const info = infos[i];
        const thread = pageGroups[i];

        let male = 0, female = 0, unknown = 0;
        if (info.userInfo) {
          for (let u of info.userInfo) {
            if (u.gender === "MALE") male++;
            else if (u.gender === "FEMALE") female++;
            else unknown++;
          }
        }

        const createdTime = getRandomTime(thread.threadID);
        const themeName = info.threadTheme?.name || "N/A";
        const themeColors = info.threadTheme?.colors?.join(", ") || "N/A";
        const themeID = info.threadTheme?.id || "N/A";

        groupList += `
┌─ ${start + i + 1}. ${info.threadName || "Unnamed Group"}
│ 👥 Members : ${info.participantIDs.length} (♀️${female} ♂️${male} ⚧️${unknown})
│ ⚜️ Admins  : ${info.adminIDs ? info.adminIDs.length : 0}
│ 🕒 Created : ${createdTime}
│ 🎭 Theme   : ${themeName}
│ 🎨 Colors  : ${themeColors}
│ 🆔 Theme ID: ${themeID}
└───────────────────┘`;
      }

      const prefix = global.GoatBot?.config?.prefix || ".";
      const finalMsg = `
╔═✦ 𝐆𝐑𝐎𝐔𝐏 𝐁𝐎𝐗𝐄𝐒 ✦═╗
┃ 📊 TOTAL GROUPS: ${groupThreads.length}
┃ ↘️(Page ${page}/${totalPages})
╠═══════════════════╣
${groupList}
╠═══════════════════╣
┃ 💡 Usage:
┃ • Reply with the group number to see detailed info
┃ • ${prefix}box ${page < totalPages ? page + 1 : 1} - Next page
╚═══════════════════╝`;

      message.reply(finalMsg, (err, infoMsg) => {
        if (!err) {
          global.GoatBot.onReply.set(infoMsg.messageID, {
            commandName,
            messageID: infoMsg.messageID,
            author: event.senderID,
            groupThreads: pageGroups
          });
        }
      });

    } catch (err) {
      message.reply("❌ An error occurred while fetching group information.\n" + err.message);
    }
  },

  onReply: async function({ message, event, Reply, api }) {
    if (event.senderID !== Reply.author) return;
    const userReply = event.body.trim();
    if (!isNaN(userReply)) {
      const num = parseInt(userReply);
      const targetThread = Reply.groupThreads[num - 1];
      if (!targetThread) return message.reply("❌ Invalid group number!");

      const info = await api.getThreadInfo(targetThread.threadID);

      let male = 0, female = 0, unknown = 0;
      if (info.userInfo) {
        for (let u of info.userInfo) {
          if (u.gender === "MALE") male++;
          else if (u.gender === "FEMALE") female++;
          else unknown++;
        }
      }

      const createdTime = getRandomTime(targetThread.threadID);
      const themeName = info.threadTheme?.name || "N/A";
      const themeColors = info.threadTheme?.colors?.join(", ") || "N/A";
      const themeID = info.threadTheme?.id || "N/A";

      const detailMsg = `
╔═✦〘 𝐁𝐎𝐗 𝐈𝐍𝐅𝐎 〙✦═╗
┃
┃ 📝 NAME       : ${info.threadName || "Unnamed Group"}
┃ 🆔 THREAD ID  : ${targetThread.threadID}
┃ 👥 MEMBERS    : ${info.participantIDs.length}
┃ ♀️ FEMALE     : ${female}
┃ ♂️ MALE       : ${male}
┃ ⚧️ UNKNOWN    : ${unknown}
┃ ⚜️ ADMINS     : ${info.adminIDs ? info.adminIDs.length : 0}
┃ 💬 MESSAGES   : ${info.messageCount || "N/A"}
┃ 🕒 CREATED    : ${createdTime}
┃ ⚠️ STATUS     : ${info.approvalMode ? "Approval Required" : "Open Group"}
┃ 🎭 THEME ID   : ${themeID}
┃ 🎨 THEME      : ${themeName}
┃ 🌈 COLORS     : ${themeColors}
┃
╠═══════════════════╣
 👑 Owner: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑
╚═══════════════════╝`;

      const imageURL = info.imageSrc || info.thumbSrc;
      if (imageURL) {
        const cacheDir = path.join(__dirname, "cache");
        await fs.ensureDir(cacheDir);
        const imgPath = path.join(cacheDir, `box_${targetThread.threadID}.jpg`);
        const response = await axios({ url: imageURL, method: "GET", responseType: "stream" });
        const writer = fs.createWriteStream(imgPath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => { writer.on("finish", resolve); writer.on("error", reject); });
        message.reply({ body: detailMsg, attachment: fs.createReadStream(imgPath) }, () => fs.unlinkSync(imgPath));
      } else {
        message.reply(detailMsg);
      }

      message.unsend(Reply.messageID);
    }
  }
};