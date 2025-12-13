const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "robo4",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "Monitor all member activities (add/remove/kick/leave)",
    category: "system",
    guide: "{pn} on/off - Enable/disable monitoring\n{pn} info - Show monitoring status\n{pn} stats - Show activity statistics"
  },

  onLoad: function () {
    const configFile = path.join(__dirname, "..", "..", "robo4_member_config.json");
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify({
        enabled: true,
        logThread: "886960563901648",
        activityStats: {
          totalAdded: 0,
          totalLeft: 0,
          totalKicked: 0
        }
      }, null, 2));
    }
  },

  ST: async function ({ message, args, event }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return message.reply("⛔ Only the owner can use this command!");
    }

    const configFile = path.join(__dirname, "..", "..", "robo4_member_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return {
          enabled: true,
          logThread: "886960563901648",
          activityStats: {
            totalAdded: 0,
            totalLeft: 0,
            totalKicked: 0
          }
        };
      } catch {
        return {
          enabled: true,
          logThread: "886960563901648",
          activityStats: {
            totalAdded: 0,
            totalLeft: 0,
            totalKicked: 0
          }
        };
      }
    }

    function saveConfig(data) {
      try {
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving robo4 config:", error);
      }
    }

    if (args[0] === "on" || args[0] === "enable") {
      const config = loadConfig();
      config.enabled = true;
      saveConfig(config);

      return message.reply("✅ Member Activity Monitor ENABLED!");
    }

    if (args[0] === "off" || args[0] === "disable") {
      const config = loadConfig();
      config.enabled = false;
      saveConfig(config);

      return message.reply("❌ Member Activity Monitor DISABLED!");
    }

    if (args[0] === "stats" || args[0] === "statistics") {
      const config = loadConfig();
      const stats = config.activityStats || { totalAdded: 0, totalLeft: 0, totalKicked: 0 };

      return message.reply(
        `📊 MEMBER ACTIVITY STATISTICS\n\n` +
        `➕ Total Members Added: ${stats.totalAdded}\n` +
        `👋 Total Members Left: ${stats.totalLeft}\n` +
        `🚫 Total Members Kicked: ${stats.totalKicked}\n` +
        `📈 Total Activities: ${stats.totalAdded + stats.totalLeft + stats.totalKicked}`
      );
    }

    if (args[0] === "clear" || args[0] === "reset") {
      const config = loadConfig();
      config.activityStats = {
        totalAdded: 0,
        totalLeft: 0,
        totalKicked: 0
      };
      saveConfig(config);

      return message.reply("✅ Member activity statistics cleared!");
    }

    if (args[0] === "info" || args[0] === "status") {
      const config = loadConfig();

      return message.reply(
        `📊 MEMBER ACTIVITY MONITOR STATUS\n\n` +
        `🔘 Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
        `📌 Log Thread: ${config.logThread}\n\n` +
        `📋 Monitored Activities:\n` +
        `• Member joins/added\n` +
        `• Member leaves\n` +
        `• Member kicked/removed\n\n` +
        `💡 Commands:\n` +
        `• robo4 on/off\n` +
        `• robo4 stats - View statistics\n` +
        `• robo4 clear - Clear stats\n` +
        `• robo4 info`
      );
    }

    return message.reply(
      `📋 MEMBER ACTIVITY MONITOR\n\n` +
      `💡 Commands:\n` +
      `• robo4 on/off\n` +
      `• robo4 stats - View statistics\n` +
      `• robo4 clear - Clear stats\n` +
      `• robo4 info\n\n` +
      `📊 Status: ${loadConfig().enabled ? 'Enabled' : 'Disabled'}`
    );
  },

  onEvent: async function ({ event, api, threadsData, usersData }) {
    const configFile = path.join(__dirname, "..", "..", "robo4_member_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return {
          enabled: true,
          logThread: "886960563901648",
          activityStats: {
            totalAdded: 0,
            totalLeft: 0,
            totalKicked: 0
          }
        };
      } catch {
        return {
          enabled: true,
          logThread: "886960563901648",
          activityStats: {
            totalAdded: 0,
            totalLeft: 0,
            totalKicked: 0
          }
        };
      }
    }

    function saveConfig(data) {
      try {
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving robo4 config:", error);
      }
    }

    function getDhakaTime() {
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const dhakaTime = new Date(utc + (3600000 * 6));
      
      const day = String(dhakaTime.getDate()).padStart(2, '0');
      const month = String(dhakaTime.getMonth() + 1).padStart(2, '0');
      const year = dhakaTime.getFullYear();
      
      let hours = dhakaTime.getHours();
      const minutes = String(dhakaTime.getMinutes()).padStart(2, '0');
      const seconds = String(dhakaTime.getSeconds()).padStart(2, '0');
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const displayHours = String(hours).padStart(2, '0');
      
      return `${day}/${month}/${year} ${displayHours}:${minutes}:${seconds} ${ampm}`;
    }

    const config = loadConfig();

    if (!config.enabled) {
      return;
    }

    const botID = api.getCurrentUserID();

    try {
      let threadName = "Unknown Thread";
      try {
        const threadInfo = await threadsData.get(event.threadID);
        threadName = threadInfo?.threadName || "Unknown Group";
      } catch {}

      if (event.logMessageType === "log:subscribe") {
        const addedUsers = event.logMessageData.addedParticipants || [];
        
        for (const user of addedUsers) {
          const userId = user.userFbId;
          
          if (userId === botID) {
            continue;
          }

          let userName = "Unknown User";
          let adderName = "Unknown User";

          try {
            const userInfo = await api.getUserInfo(userId);
            userName = userInfo[userId]?.name || await usersData.getName(userId) || "Unknown User";
          } catch {
            try {
              userName = await usersData.getName(userId) || "Unknown User";
            } catch {
              userName = "Unknown User";
            }
          }

          try {
            const adderInfo = await api.getUserInfo(event.author);
            adderName = adderInfo[event.author]?.name || await usersData.getName(event.author) || "Unknown User";
          } catch {
            try {
              adderName = await usersData.getName(event.author) || "Unknown User";
            } catch {
              adderName = "Unknown User";
            }
          }

          if (!config.activityStats) {
            config.activityStats = { totalAdded: 0, totalLeft: 0, totalKicked: 0 };
          }
          config.activityStats.totalAdded++;
          saveConfig(config);

          const addMsg = `╭─────────────────⭓
│ ➕ MEMBER ADDED TO GROUP
├─────────────────⭓
│ 👤 Member: ${userName}
│ 🆔 UID: ${userId}
├─────────────────⭓
│ 📌 Group: ${threadName}
│ 🆔 TID: ${event.threadID}
├─────────────────⭓
│ 👤 Added by: ${adderName}
│ 🆔 Adder UID: ${event.author}
├─────────────────⭓
│ ⏰ Time: ${getDhakaTime()}
│ 📊 Total Added: ${config.activityStats.totalAdded}
╰─────────────────⭓`;

          await api.sendMessage(addMsg, config.logThread);
        }
      }

      if (event.logMessageType === "log:unsubscribe") {
        const leftUserFbId = event.logMessageData.leftParticipantFbId;
        
        if (leftUserFbId === botID) {
          return;
        }

        let userName = "Unknown User";
        let removerName = "Unknown User";

        try {
          const userInfo = await api.getUserInfo(leftUserFbId);
          userName = userInfo[leftUserFbId]?.name || await usersData.getName(leftUserFbId) || "Unknown User";
        } catch {
          try {
            userName = await usersData.getName(leftUserFbId) || "Unknown User";
          } catch {
            userName = "Unknown User";
          }
        }

        const wasKicked = event.author && event.author !== leftUserFbId;

        if (wasKicked) {
          try {
            const removerInfo = await api.getUserInfo(event.author);
            removerName = removerInfo[event.author]?.name || await usersData.getName(event.author) || "Unknown User";
          } catch {
            try {
              removerName = await usersData.getName(event.author) || "Unknown User";
            } catch {
              removerName = "Unknown User";
            }
          }
        }

        if (!config.activityStats) {
          config.activityStats = { totalAdded: 0, totalLeft: 0, totalKicked: 0 };
        }

        if (wasKicked) {
          config.activityStats.totalKicked++;
        } else {
          config.activityStats.totalLeft++;
        }
        saveConfig(config);

        const removeMsg = wasKicked 
          ? `╭─────────────────⭓
│ 🚫 MEMBER KICKED FROM GROUP
├─────────────────⭓
│ 👤 Member: ${userName}
│ 🆔 UID: ${leftUserFbId}
├─────────────────⭓
│ 📌 Group: ${threadName}
│ 🆔 TID: ${event.threadID}
├─────────────────⭓
│ 👤 Kicked by: ${removerName}
│ 🆔 Kicker UID: ${event.author}
├─────────────────⭓
│ ⏰ Time: ${getDhakaTime()}
│ 📊 Total Kicked: ${config.activityStats.totalKicked}
╰─────────────────⭓`
          : `╭─────────────────⭓
│ 👋 MEMBER LEFT GROUP
├─────────────────⭓
│ 👤 Member: ${userName}
│ 🆔 UID: ${leftUserFbId}
├─────────────────⭓
│ 📌 Group: ${threadName}
│ 🆔 TID: ${event.threadID}
├─────────────────⭓
│ 📊 Action: Left Voluntarily
│ ⏰ Time: ${getDhakaTime()}
│ 📈 Total Left: ${config.activityStats.totalLeft}
╰─────────────────⭓`;

        await api.sendMessage(removeMsg, config.logThread);
      }

    } catch (error) {
      console.error("Robo4 member monitor error:", error);
    }
  }
};