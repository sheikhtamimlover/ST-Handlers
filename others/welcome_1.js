const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "welcome",
    version: "2.0",
    author: "ST | Sheikh Tamim",
    category: "events"
  },

  onStart: async function ({ api, event, threadsData }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData } = event;
    const newUsers = logMessageData.addedParticipants;
    const botID = api.getCurrentUserID();

    if (newUsers.some(u => u.userFbId === botID)) return;

    let threadInfo;
    try {
      threadInfo = await threadsData.get(threadID);
    } catch (err) {
      try {
        threadInfo = await api.getThreadInfo(threadID);
      } catch (e) {
        threadInfo = {};
      }
    }

    const groupName = threadInfo.threadName || threadInfo.name || "this group";
    const memberCount = threadInfo.participantIDs?.length || threadInfo.members?.length || threadInfo.userInfo?.length || 0;

    for (const user of newUsers) {
      const userId = user.userFbId;
      let fullName = user.fullName;

      if (!fullName) {
        try {
          const userInfo = await api.getUserInfo(userId);
          fullName = userInfo[userId]?.name || "New Member";
        } catch (err) {
          fullName = "New Member";
        }
      }

      const timeStr = new Date().toLocaleString("en-BD", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour12: true
      });

      const welcomeText = `‎𝐇𝐞𝐥𝐥𝐨 ${fullName}\n𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐭𝐨 ${groupName}\n𝐘𝐨𝐮'𝐫𝐞 𝐭𝐡𝐞 ${memberCount} 𝐦𝐞𝐦𝐛𝐞𝐫 𝐨𝐧 𝐭𝐡𝐢𝐬 𝐠𝐫𝐨𝐮𝐩, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐣𝐨𝐲 🎉\n━━━━━━━━━━━━━━━━\n📅 ${timeStr}`;

      try {
        const apiUrl = `https://xsaim8x-xxx-api.onrender.com/api/welcome?name=${encodeURIComponent(fullName)}&uid=${userId}&threadname=${encodeURIComponent(groupName)}&members=${memberCount}`;
        const tmp = path.join(__dirname, "..", "cache");
        await fs.ensureDir(tmp);
        const imagePath = path.join(tmp, `welcome_${userId}_${Date.now()}.png`);

        const response = await axios.get(apiUrl, { 
          responseType: "arraybuffer",
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        
        await fs.writeFile(imagePath, Buffer.from(response.data));

        await new Promise(resolve => setTimeout(resolve, 500));

        const stream = fs.createReadStream(imagePath);
        
        await api.sendMessage({
          body: welcomeText,
          attachment: stream
        }, threadID);

        stream.on('end', () => {
          setTimeout(() => {
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
            }
          }, 3000);
        });

      } catch (err) {
        console.error("❌ Error sending welcome image:", err.message);
        try {
          await api.sendMessage(welcomeText, threadID);
        } catch (fallbackErr) {
          console.error("❌ Fallback message failed:", fallbackErr);
        }
      }
    }
  }
};