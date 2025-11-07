module.exports = {
  config: {
    name: "box",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Display all group boxes with detailed information",
    category: "info",
    guide: {
      en: "{pn} [page] - Show group boxes\n{pn} info <number/ID> - Get detailed info about a group",
      bn: "{pn} [পেজ] - গ্রুপ বক্স দেখুন\n{pn} info <নম্বর/আইডি> - গ্রুপের বিস্তারিত তথ্য দেখুন"
    }
  },

  onStart: async function({ message, args, event, api, getLang, Users, commandName }) {
    try {
      const threads = await api.getThreadList(100, null, ["INBOX"]);
      const groupThreads = threads.filter(thread => thread.isGroup);

      if (args[0] === "info") {
        const target = args[1];
        if (!target) return message.reply("❌ Please provide a group number or ID!");

        let targetThread;
        if (!isNaN(target)) {
          const num = parseInt(target);
          targetThread = groupThreads[num - 1];
        } else {
          targetThread = groupThreads.find(t => t.threadID === target);
        }

        if (!targetThread) return message.reply("❌ Group not found!");

        const threadInfo = await api.getThreadInfo(targetThread.threadID);
        
        let maleCount = 0;
        let femaleCount = 0;
        
        if (threadInfo.userInfo) {
          for (let participant of threadInfo.userInfo) {
            if (participant.gender === "MALE") maleCount++;
            else if (participant.gender === "FEMALE") femaleCount++;
          }
        }

        const createdDate = threadInfo.timestamp ? new Date(threadInfo.timestamp).toLocaleDateString() : "Unknown";
        const approvalMode = threadInfo.approvalMode ? "Approval Required" : "Open Group";

        const detailMsg = `╔═✦〘 𝐁𝐎𝐗 𝐈𝐍𝐅𝐎 〙✦═╗
┃
┃ 📝 𝙽𝙰𝙼𝙴: ${threadInfo.threadName || "Unnamed Group"}
┃ 🆔 𝚃𝙷𝚁𝙴𝙰𝙳 𝙸𝙳: ${targetThread.threadID}
┃ 👥 𝙼𝙴𝙼𝙱𝙴𝚁𝚂: ${threadInfo.participantIDs.length}
┃ ♀️ 𝙵𝙴𝙼𝙰𝙻𝙴: ${femaleCount}
┃ ♂️ 𝙼𝙰𝙻𝙴: ${maleCount}
┃ ⚜️ 𝙰𝙳𝙼𝙸𝙽: ${threadInfo.adminIDs ? threadInfo.adminIDs.length : 0}
┃ 💬 𝙼𝙴𝚂𝚂𝙰𝙶𝙴𝚂: ${threadInfo.messageCount || "N/A"}
┃ 📅 𝙲𝚁𝙴𝙰𝚃𝙴𝙳: ${createdDate}
┃ ⚠️ 𝚂𝚃𝙰𝚃𝚄𝚂: ${approvalMode}
┃
╠═══════════════════╣
 👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑
╚═══════════════════╝`;

        const imageURL = threadInfo.imageSrc || threadInfo.thumbSrc;
        
        if (imageURL) {
          const axios = require("axios");
          const fs = require("fs-extra");
          const path = require("path");
          
          const cacheDir = path.join(__dirname, "cache");
          await fs.ensureDir(cacheDir);
          
          const imgPath = path.join(cacheDir, `box_${targetThread.threadID}.jpg`);
          
          const response = await axios({
            url: imageURL,
            method: 'GET',
            responseType: 'stream'
          });
          
          const writer = fs.createWriteStream(imgPath);
          response.data.pipe(writer);
          
          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
          
          message.reply({
            body: detailMsg,
            attachment: fs.createReadStream(imgPath)
          }, () => fs.unlinkSync(imgPath));
        } else {
          message.reply(detailMsg);
        }

        return;
      }

      const itemsPerPage = 50;
      const page = parseInt(args[0]) || 1;
      const totalPages = Math.ceil(groupThreads.length / itemsPerPage);

      if (page < 1 || page > totalPages) {
        return message.reply(`❌ Invalid page! Available pages: 1-${totalPages}`);
      }

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const pageGroups = groupThreads.slice(startIndex, endIndex);

      let groupList = "";
      for (let i = 0; i < pageGroups.length; i++) {
        const index = startIndex + i + 1;
        const thread = pageGroups[i];
        const threadInfo = await api.getThreadInfo(thread.threadID);
        
        let maleCount = 0;
        let femaleCount = 0;
        
        if (threadInfo.userInfo) {
          for (let participant of threadInfo.userInfo) {
            if (participant.gender === "MALE") maleCount++;
            else if (participant.gender === "FEMALE") femaleCount++;
          }
        }
        
        groupList += `┃ ${index}. ${threadInfo.threadName || "Unnamed Group"}\n`;
        groupList += `┃ 👥 Members: ${threadInfo.participantIDs.length} (♀️${femaleCount} ♂️${maleCount})\n`;
        groupList += `┃ ⚜️ Admins: ${threadInfo.adminIDs ? threadInfo.adminIDs.length : 0}\n`;
        groupList += `┃ 🆔 ID: ${thread.threadID}\n┃\n`;
      }

      const prefix = global.GoatBot?.config?.prefix || ".";
      const boxMsg = `╔═✦〘 𝐆𝐑𝐎𝐔𝐏 𝐁𝐎𝐗𝐄𝐒 〙✦═╗
┃
┃ 📊 𝚃𝙾𝚃𝙰𝙻 𝙶𝚁𝙾𝚄𝙿𝚂: ${groupThreads.length}
┃ 📄 𝙿𝙰𝙶𝙴: ${page}/${totalPages}
┃
╠═══════════════════╣
┃
${groupList}┃
╠═══════════════════╣
┃ 💡 𝚄𝚂𝙰𝙶𝙴:
┃ • ${prefix}box ${page < totalPages ? page + 1 : 1} - Next page
┃ • ${prefix}box info <number/ID>
┃   Get detailed info
┃ • Reply with number
┃   to see box info
┃
╠═══════════════════╣
 👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑
╚═══════════════════╝`;

      message.reply(boxMsg, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          groupThreads,
          page
        });
      });

    } catch (error) {
      message.reply("❌ An error occurred while fetching group information.\n" + error.message);
    }
  },

  onReply: async function({ message, event, Reply, api, Users }) {
    const { author, groupThreads } = Reply;
    
    if (event.senderID !== author) return;
    
    const userReply = event.body.trim();
    
    if (!isNaN(userReply)) {
      try {
        const num = parseInt(userReply);
        const targetThread = groupThreads[num - 1];
        
        if (!targetThread) return message.reply("❌ Invalid group number!");
        
        const threadInfo = await api.getThreadInfo(targetThread.threadID);
        
        let maleCount = 0;
        let femaleCount = 0;
        
        if (threadInfo.userInfo) {
          for (let participant of threadInfo.userInfo) {
            if (participant.gender === "MALE") maleCount++;
            else if (participant.gender === "FEMALE") femaleCount++;
          }
        }

        const createdDate = threadInfo.timestamp ? new Date(threadInfo.timestamp).toLocaleDateString() : "Unknown";
        const approvalMode = threadInfo.approvalMode ? "Approval Required" : "Open Group";

        const detailMsg = `╔═✦〘 𝐁𝐎𝐗 𝐈𝐍𝐅𝐎 〙✦═╗
┃
┃ 📝 𝙽𝙰𝙼𝙴: ${threadInfo.threadName || "Unnamed Group"}
┃ 🆔 𝚃𝙷𝚁𝙴𝙰𝙳 𝙸𝙳: ${targetThread.threadID}
┃ 👥 𝙼𝙴𝙼𝙱𝙴𝚁𝚂: ${threadInfo.participantIDs.length}
┃ ♀️ 𝙵𝙴𝙼𝙰𝙻𝙴: ${femaleCount}
┃ ♂️ 𝙼𝙰𝙻𝙴: ${maleCount}
┃ ⚜️ 𝙰𝙳𝙼𝙸𝙽: ${threadInfo.adminIDs ? threadInfo.adminIDs.length : 0}
┃ 💬 𝙼𝙴𝚂𝚂𝙰𝙶𝙴𝚂: ${threadInfo.messageCount || "N/A"}
┃ 📅 𝙲𝚁𝙴𝙰𝚃𝙴𝙳: ${createdDate}
┃ ⚠️ 𝚂𝚃𝙰𝚃𝚄𝚂: ${approvalMode}
┃
╠═══════════════════╣
 👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑
╚═══════════════════╝`;

        const imageURL = threadInfo.imageSrc || threadInfo.thumbSrc;
        
        if (imageURL) {
          const axios = require("axios");
          const fs = require("fs-extra");
          const path = require("path");
          
          const cacheDir = path.join(__dirname, "cache");
          await fs.ensureDir(cacheDir);
          
          const imgPath = path.join(cacheDir, `box_${targetThread.threadID}.jpg`);
          
          const response = await axios({
            url: imageURL,
            method: 'GET',
            responseType: 'stream'
          });
          
          const writer = fs.createWriteStream(imgPath);
          response.data.pipe(writer);
          
          await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
          
          message.reply({
            body: detailMsg,
            attachment: fs.createReadStream(imgPath)
          }, () => fs.unlinkSync(imgPath));
        } else {
          message.reply(detailMsg);
        }

        message.unsend(Reply.messageID);
      } catch (error) {
        message.reply("❌ Error: " + error.message);
      }
    }
  }
};