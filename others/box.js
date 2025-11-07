module.exports = {
  config: {
    name: "box",
    aliases: ["boxinfo"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Show all groups and view group details",
    category: "group",
    guide: {
      en: "{pn} [page] - Show groups\n{pn} info <number/ID> - View details",
      bn: "{pn} [পেজ] - গ্রুপ দেখান\n{pn} info <নম্বর/আইডি> - বিস্তারিত দেখুন"
    }
  },

  ST: async function({ message, args, event, api, prefix, usersData }) {
    const { threadID } = event;

    try {
      if (args[0] === "info" && args[1]) {
        const inbox = await api.getThreadList(100, null, ["INBOX"]);
        const groups = inbox.filter(thread => thread.isGroup);
        
        let targetThread;
        
        if (!isNaN(args[1]) && parseInt(args[1]) <= groups.length) {
          const index = parseInt(args[1]) - 1;
          targetThread = groups[index].threadID;
        } else {
          targetThread = args[1];
        }

        const threadInfo = await api.getThreadInfo(targetThread);

        let maleCount = 0;
        let femaleCount = 0;

        for (const participantID of threadInfo.participantIDs) {
          try {
            const userInfo = await usersData.get(participantID);
            if (userInfo && userInfo.gender !== undefined) {
              if (userInfo.gender === 1) {
                femaleCount++;
              } else if (userInfo.gender === 2) {
                maleCount++;
              }
            } else {
              const fbUserInfo = await api.getUserInfo(participantID);
              if (fbUserInfo && fbUserInfo[participantID]) {
                if (fbUserInfo[participantID].gender === 1) {
                  femaleCount++;
                } else if (fbUserInfo[participantID].gender === 2) {
                  maleCount++;
                }
              }
            }
          } catch (error) {
            console.error('Error fetching user gender:', error);
          }
        }

        const createdDate = threadInfo.timestamp ? new Date(threadInfo.timestamp).toLocaleDateString() : "Invalid Date";
        const approvalMode = threadInfo.approvalMode ? "Approval Required" : "Open Group";

        let detailMsg = `╔═✦〘 𝐁𝐎𝐗 𝐈𝐍𝐅𝐎 〙✦═╗\n`;
        detailMsg += `┃\n`;
        detailMsg += `┃ 📝 𝙽𝙰𝙼𝙴: ${threadInfo.threadName}\n`;
        detailMsg += `┃ 🆔 𝚃𝙷𝚁𝙴𝙰𝙳 𝙸𝙳: ${threadInfo.threadID}\n`;
        detailMsg += `┃ 👥 𝙼𝙴𝙼𝙱𝙴𝚁𝚂: ${threadInfo.participantIDs.length}\n`;
        detailMsg += `┃ ♀️ 𝙵𝙴𝙼𝙰𝙻𝙴: ${femaleCount}\n`;
        detailMsg += `┃ ♂️ 𝙼𝙰𝙻𝙴: ${maleCount}\n`;
        detailMsg += `┃ ⚜️ 𝙰𝙳𝙼𝙸𝙽: ${threadInfo.adminIDs.length}\n`;
        detailMsg += `┃ 💬 𝙼𝙴𝚂𝚂𝙰𝙶𝙴𝚂: ${threadInfo.messageCount}\n`;
        detailMsg += `┃ 📅 𝙲𝚁𝙴𝙰𝚃𝙴𝙳: ${createdDate}\n`;
        detailMsg += `┃ ⚠️ 𝚂𝚃𝙰𝚃𝚄𝚂: ${approvalMode}\n`;
        detailMsg += `┃\n`;
        detailMsg += `╠═══════════════════╣\n`;
        detailMsg += ` 👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑\n`;
        detailMsg += `╚═══════════════════╝`;

        if (threadInfo.imageSrc) {
          const axios = require("axios");
          const fs = require("fs");
          const path = require("path");
          
          const imgPath = path.join(__dirname, `cache_${threadInfo.threadID}.jpg`);
          const response = await axios.get(threadInfo.imageSrc, { responseType: "arraybuffer" });
          fs.writeFileSync(imgPath, Buffer.from(response.data));

          message.reply({
            body: detailMsg,
            attachment: fs.createReadStream(imgPath)
          }, () => fs.unlinkSync(imgPath));
        } else {
          message.reply(detailMsg);
        }

      } else {
        const inbox = await api.getThreadList(100, null, ["INBOX"]);
        const groups = inbox.filter(thread => thread.isGroup);

        if (groups.length === 0) {
          return message.reply("❌ No groups found!");
        }

        const itemsPerPage = 10;
        const page = parseInt(args[0]) || 1;
        const totalPages = Math.ceil(groups.length / itemsPerPage);
        
        if (page < 1 || page > totalPages) {
          return message.reply(`❌ Invalid page! Total pages: ${totalPages}`);
        }

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageGroups = groups.slice(startIndex, endIndex);

        let msg = `╔═✦〘 𝐆𝐑𝐎𝐔𝐏 𝐁𝐎𝐗𝐄𝐒 〙✦═╗\n`;
        msg += `┃\n`;
        msg += `┃ 📊 𝚃𝙾𝚃𝙰𝙻 𝙶𝚁𝙾𝚄𝙿𝚂: ${groups.length}\n`;
        msg += `┃ 📄 𝙿𝙰𝙶𝙴: ${page}/${totalPages}\n`;
        msg += `┃\n`;
        msg += `╠═══════════════════╣\n`;
        msg += `┃\n`;

        pageGroups.forEach((group, index) => {
          const globalIndex = startIndex + index + 1;
          msg += `┃ ${globalIndex}. ${group.name}\n`;
          msg += `┃ 👥 Members: ${group.participantIDs.length}\n`;
          msg += `┃ 🆔 ID: ${group.threadID}\n`;
          msg += `┃\n`;
        });

        msg += `╠═══════════════════╣\n`;
        msg += `┃ 💡 𝚄𝚂𝙰𝙶𝙴:\n`;
        msg += `┃ • ${prefix}box ${page + 1} - Next page\n`;
        msg += `┃ • ${prefix}box info <number/ID>\n`;
        msg += `┃ Get detailed info\n`;
        msg += `┃ • Reply with number\n`;
        msg += `┃ to see box info\n`;
        msg += `┃\n`;
        msg += `╠═══════════════════╣\n`;
        msg += ` 👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑\n`;
        msg += `╚═══════════════════╝`;

        global.GoatBot.onReply = global.GoatBot.onReply || new Map();

        message.reply(msg, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              groups: groups
            });
          }
        });
      }

    } catch (error) {
      console.error(error);
      message.reply("❌ An error occurred while fetching group information!");
    }
  },

  onReply: async function({ message, event, Reply, api, usersData }) {
    const { author, groups } = Reply;

    if (event.senderID !== author) return;

    const choice = parseInt(event.body.trim());

    if (isNaN(choice) || choice < 1 || choice > groups.length) {
      return;
    }

    try {
      const group = groups[choice - 1];
      const threadInfo = await api.getThreadInfo(group.threadID);

      let maleCount = 0;
      let femaleCount = 0;

      for (const participantID of threadInfo.participantIDs) {
        try {
          const userInfo = await usersData.get(participantID);
          if (userInfo && userInfo.gender !== undefined) {
            if (userInfo.gender === 1) {
              femaleCount++;
            } else if (userInfo.gender === 2) {
              maleCount++;
            }
          } else {
            const fbUserInfo = await api.getUserInfo(participantID);
            if (fbUserInfo && fbUserInfo[participantID]) {
              if (fbUserInfo[participantID].gender === 1) {
                femaleCount++;
              } else if (fbUserInfo[participantID].gender === 2) {
                maleCount++;
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user gender:', error);
        }
      }

      const createdDate = threadInfo.timestamp ? new Date(threadInfo.timestamp).toLocaleDateString() : "Invalid Date";
      const approvalMode = threadInfo.approvalMode ? "Approval Required" : "Open Group";

      let detailMsg = `╔═✦〘 𝐁𝐎𝐗 𝐈𝐍𝐅𝐎 〙✦═╗\n`;
      detailMsg += `┃\n`;
      detailMsg += `┃ 📝 𝙽𝙰𝙼𝙴: ${threadInfo.threadName}\n`;
      detailMsg += `┃ 🆔 𝚃𝙷𝚁𝙴𝙰𝙳 𝙸𝙳: ${threadInfo.threadID}\n`;
      detailMsg += `┃ 👥 𝙼𝙴𝙼𝙱𝙴𝚁𝚂: ${threadInfo.participantIDs.length}\n`;
      detailMsg += `┃ ♀️ 𝙵𝙴𝙼𝙰𝙻𝙴: ${femaleCount}\n`;
      detailMsg += `┃ ♂️ 𝙼𝙰𝙻𝙴: ${maleCount}\n`;
      detailMsg += `┃ ⚜️ 𝙰𝙳𝙼𝙸𝙽: ${threadInfo.adminIDs.length}\n`;
      detailMsg += `┃ 💬 𝙼𝙴𝚂𝚂𝙰𝙶𝙴𝚂: ${threadInfo.messageCount}\n`;
      detailMsg += `┃ 📅 𝙲𝚁𝙴𝙰𝚃𝙴𝙳: ${createdDate}\n`;
      detailMsg += `┃ ⚠️ 𝚂𝚃𝙰𝚃𝚄𝚂: ${approvalMode}\n`;
      detailMsg += `┃\n`;
      detailMsg += `╠═══════════════════╣\n`;
      detailMsg += ` 👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑\n`;
      detailMsg += `╚═══════════════════╝`;

      global.GoatBot.onReply.delete(Reply.messageID);
      try {
        await api.unsendMessage(Reply.messageID);
      } catch (error) {
        console.error('Error unsending message:', error);
      }

      if (threadInfo.imageSrc) {
        const axios = require("axios");
        const fs = require("fs");
        const path = require("path");
        
        const imgPath = path.join(__dirname, `cache_${threadInfo.threadID}.jpg`);
        const response = await axios.get(threadInfo.imageSrc, { responseType: "arraybuffer" });
        fs.writeFileSync(imgPath, Buffer.from(response.data));

        message.reply({
          body: detailMsg,
          attachment: fs.createReadStream(imgPath)
        }, () => fs.unlinkSync(imgPath));
      } else {
        message.reply(detailMsg);
      }

    } catch (error) {
      console.error(error);
      message.reply("❌ An error occurred while fetching group details!");
    }
  }
};