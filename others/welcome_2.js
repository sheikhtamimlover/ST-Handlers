const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "welcome",
    version: "2.6",
    author: "ST | Sheikh Tamim",
    category: "events"
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID, logMessageData, author } = event;
    const newUsers = logMessageData.addedParticipants;
    const botID = api.getCurrentUserID();

    if (newUsers.some(u => u.userFbId === botID)) return;

    const threadData = await threadsData.get(threadID);
    if (!threadData.settings.sendWelcomeMessage) return;

    let threadInfo;
    try {
      threadInfo = await api.getThreadInfo(threadID);
    } catch (err) {
      console.error("Error getting thread info:", err);
      return;
    }

    const groupName = threadInfo.threadName || "𝑻𝒉𝒊𝒔 𝑮𝒓𝒐𝒖𝒑";
    const memberCount = threadInfo.participantIDs.length;

    for (const user of newUsers) {
      const userId = user.userFbId;
      const fullName = user.fullName;

      try {
        const bdTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
        const now = new Date(bdTime);
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const hours12 = hours % 12 || 12;
        const ampm = hours >= 12 ? "𝐏𝐌" : "𝐀𝐌";
        const timeStr = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

        const session = hours < 12 ? "🌅 𝒎𝒐𝒓𝒏𝒊𝒏𝒈" : 
                       hours < 17 ? "☀️ 𝒂𝒇𝒕𝒆𝒓𝒏𝒐𝒐𝒏" : 
                       hours < 21 ? "🌆 𝒆𝒗𝒆𝒏𝒊𝒏𝒈" : "🌙 𝒏𝒊𝒈𝒉𝒕";

        const getSuffix = (num) => {
          if (num % 100 >= 11 && num % 100 <= 13) return "th";
          switch (num % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
          }
        };

        const memberSuffix = getSuffix(memberCount);

        let adderName = "𝑺𝒐𝒎𝒆𝒐𝒏𝒆";
        if (author !== userId) {
          try {
            const adderInfo = await api.getUserInfo(author);
            adderName = adderInfo[author]?.name || await usersData.getName(author) || adderName;
          } catch (err) {
            console.error("Error getting adder info:", err);
          }
        }

        const apiUrl = `https://xsaim8x-xxx-api.onrender.com/api/welcome?name=${encodeURIComponent(fullName)}&uid=${userId}&threadname=${encodeURIComponent(groupName)}&members=${memberCount}`;
        const tmp = path.join(__dirname, "..", "cache");
        await fs.ensureDir(tmp);
        const imagePath = path.join(tmp, `welcome_${userId}_${Date.now()}.png`);

        const response = await axios.get(apiUrl, {
          responseType: "arraybuffer",
          timeout: 15000
        });

        await fs.writeFile(imagePath, response.data);

        await api.sendMessage({
          body:
            `‎‎‎🌺 ━「 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 」━ 🌺\n\n` +
            `✨ 𝑯𝒆𝒍𝒍𝒐 ${fullName}!\n\n` +
            `🎉 𝑾𝒆𝒍𝒄𝒐𝒎𝒆 𝒚𝒐𝒖 𝒕𝒐 𝒕𝒉𝒆 𝒄𝒉𝒂𝒕 𝒈𝒓𝒐𝒖𝒑: ${groupName}\n\n` +
            `👥 𝒀𝒐𝒖 𝒂𝒓𝒆 𝒕𝒉𝒆 ${memberCount}${memberSuffix} 𝒎𝒆𝒎𝒃𝒆𝒓 𝒐𝒇 𝒕𝒉𝒊𝒔 𝒈𝒓𝒐𝒖𝒑.\n\n` +
            `💫 𝑯𝒂𝒗𝒆 𝒂 𝒏𝒊𝒄𝒆 ${session}!\n\n` +
            `👤 𝑨𝒅𝒅𝒆𝒅 𝒃𝒚: ${adderName}\n\n` +
            `𝑱𝒐𝒊𝒏𝒆𝒅 𝒕𝒊𝒎𝒆: ${timeStr}\n\n` +
            `✨ 𝑬𝒏𝒋𝒐𝒚 𝒚𝒐𝒖𝒓 𝒕𝒊𝒎𝒆 𝒉𝒆𝒓𝒆 💫`,
          attachment: fs.createReadStream(imagePath),
          mentions: [{ tag: fullName, id: userId }]
        }, threadID);

        await fs.remove(imagePath);

      } catch (err) {
        console.error("❌ Error sending welcome message:", err);
        
        try {
          const bdTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });
          const now = new Date(bdTime);
          const hours = now.getHours();
          const minutes = now.getMinutes();
          const hours12 = hours % 12 || 12;
          const ampm = hours >= 12 ? "𝐏𝐌" : "𝐀𝐌";
          const timeStr = `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

          const session = hours < 12 ? "🌅 𝒎𝒐𝒓𝒏𝒊𝒏𝒈" : 
                         hours < 17 ? "☀️ 𝒂𝒇𝒕𝒆𝒓𝒏𝒐𝒐𝒏" : 
                         hours < 21 ? "🌆 𝒆𝒗𝒆𝒏𝒊𝒏𝒈" : "🌙 𝒏𝒊𝒈𝒉𝒕";

          const getSuffix = (num) => {
            if (num % 100 >= 11 && num % 100 <= 13) return "th";
            switch (num % 10) {
              case 1: return "st";
              case 2: return "nd";
              case 3: return "rd";
              default: return "th";
            }
          };

          const memberSuffix = getSuffix(memberCount);

          let adderName = "𝑺𝒐𝒎𝒆𝒐𝒏𝒆";
          if (author !== userId) {
            try {
              const adderInfo = await api.getUserInfo(author);
              adderName = adderInfo[author]?.name || await usersData.getName(author) || adderName;
            } catch (err) {
              console.error("Error getting adder info:", err);
            }
          }

          await api.sendMessage({
            body:
              `‎‎‎🌺 ━「 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 」━ 🌺\n\n` +
              `✨ 𝑯𝒆𝒍𝒍𝒐 ${fullName}!\n\n` +
              `🎉 𝑾𝒆𝒍𝒄𝒐𝒎𝒆 𝒚𝒐𝒖 𝒕𝒐 𝒕𝒉𝒆 𝒄𝒉𝒂𝒕 𝒈𝒓𝒐𝒖𝒑: ${groupName}\n\n` +
              `👥 𝒀𝒐𝒖 𝒂𝒓𝒆 𝒕𝒉𝒆 ${memberCount}${memberSuffix} 𝒎𝒆𝒎𝒃𝒆𝒓 𝒐𝒇 𝒕𝒉𝒊𝒔 𝒈𝒓𝒐𝒖𝒑.\n\n` +
              `💫 𝑯𝒂𝒗𝒆 𝒂 𝒏𝒊𝒄𝒆 ${session}!\n\n` +
              `👤 𝑨𝒅𝒅𝒆𝒅 𝒃𝒚: ${adderName}\n\n` +
              `𝑱𝒐𝒊𝒏𝒆𝒅 𝒕𝒊𝒎𝒆: ${timeStr}\n\n` +
              `✨ 𝑬𝒏𝒋𝒐𝒚 𝒚𝒐𝒖𝒓 𝒕𝒊𝒎𝒆 𝒉𝒆𝒓𝒆 💫`,
            mentions: [{ tag: fullName, id: userId }]
          }, threadID);
        } catch (fallbackErr) {
          console.error("❌ Fallback message also failed:", fallbackErr);
        }
      }
    }
  }
};