const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "robo2",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "Monitor bot group activities (add/kick/leave)",
    category: "system",
    guide: "{pn} on/off - Enable/disable monitoring\n{pn} info - Show monitoring status"
  },

  onLoad: function () {
    const configFile = path.join(__dirname, "..", "..", "robo2_bot_config.json");
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify({
        enabled: true,
        logThread: "886960563901648"
      }, null, 2));
    }
  },

  ST: async function ({ message, args, event }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return message.reply("⛔ Only the owner can use this command!");
    }

    const configFile = path.join(__dirname, "..", "..", "robo2_bot_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return {
          enabled: true,
          logThread: "886960563901648"
        };
      } catch {
        return {
          enabled: true,
          logThread: "886960563901648"
        };
      }
    }

    function saveConfig(data) {
      try {
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving robo2 config:", error);
      }
    }

    if (args[0] === "on" || args[0] === "enable") {
      const config = loadConfig();
      config.enabled = true;
      saveConfig(config);

      return message.reply("✅ Bot Activity Monitor ENABLED!");
    }

    if (args[0] === "off" || args[0] === "disable") {
      const config = loadConfig();
      config.enabled = false;
      saveConfig(config);

      return message.reply("❌ Bot Activity Monitor DISABLED!");
    }

    if (args[0] === "info" || args[0] === "status") {
      const config = loadConfig();

      return message.reply(
        `📊 BOT ACTIVITY MONITOR STATUS\n\n` +
        `🔘 Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
        `📌 Log Thread: ${config.logThread}\n\n` +
        `📋 Monitored Activities:\n` +
        `• Bot added to groups\n` +
        `• Bot kicked from groups\n` +
        `• Bot left groups\n\n` +
        `💡 Commands:\n` +
        `• robo2 on/off\n` +
        `• robo2 info`
      );
    }

    return message.reply(
      `📋 BOT ACTIVITY MONITOR\n\n` +
      `💡 Commands:\n` +
      `• robo2 on/off\n` +
      `• robo2 info\n\n` +
      `📊 Status: ${loadConfig().enabled ? 'Enabled' : 'Disabled'}`
    );
  },

  onEvent: async function ({ event, api, threadsData, usersData }) {
    const configFile = path.join(__dirname, "..", "..", "robo2_bot_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return {
          enabled: true,
          logThread: "886960563901648"
        };
      } catch {
        return {
          enabled: true,
          logThread: "886960563901648"
        };
      }
    }

    function getDhakaTime() {
      const now = new Date();
      const dhakaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
      
      const day = String(dhakaTime.getDate()).padStart(2, '0');
      const month = String(dhakaTime.getMonth() + 1).padStart(2, '0');
      const year = dhakaTime.getFullYear();
      const hours = String(dhakaTime.getHours()).padStart(2, '0');
      const minutes = String(dhakaTime.getMinutes()).padStart(2, '0');
      const seconds = String(dhakaTime.getSeconds()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
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
          if (user.userFbId === botID) {
            let adderName = "Unknown User";

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

            const botAddMsg = `╭─────────────────⭓
│ 🤖 BOT ADDED TO GROUP
├─────────────────⭓
│ 📌 Group Name: ${threadName}
│ 🆔 TID: ${event.threadID}
├─────────────────⭓
│ 👤 Added by: ${adderName}
│ 🆔 Adder UID: ${event.author}
├─────────────────⭓
│ ⏰ Time: ${getDhakaTime()}
│ 📊 Status: Successfully Added ✅
╰─────────────────⭓`;

            await api.sendMessage(botAddMsg, config.logThread);
          }
        }
      }

      if (event.logMessageType === "log:unsubscribe") {
        const leftUserFbId = event.logMessageData.leftParticipantFbId;
        
        if (leftUserFbId === botID) {
          const wasKicked = event.author && event.author !== leftUserFbId;
          let removerName = "Unknown User";

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

          const botRemoveMsg = wasKicked 
            ? `╭─────────────────⭓
│ 🚫 BOT KICKED FROM GROUP
├─────────────────⭓
│ 📌 Group Name: ${threadName}
│ 🆔 TID: ${event.threadID}
├─────────────────⭓
│ 👤 Kicked by: ${removerName}
│ 🆔 Kicker UID: ${event.author}
├─────────────────⭓
│ ⏰ Time: ${getDhakaTime()}
│ 📊 Status: Removed by Admin ❌
╰─────────────────⭓`
            : `╭─────────────────⭓
│ 👋 BOT LEFT GROUP
├─────────────────⭓
│ 📌 Group Name: ${threadName}
│ 🆔 TID: ${event.threadID}
├─────────────────⭓
│ ⏰ Time: ${getDhakaTime()}
│ 📊 Status: Left Automatically 🚪
╰─────────────────⭓`;

          await api.sendMessage(botRemoveMsg, config.logThread);
        }
      }

    } catch (error) {
      console.error("Robo2 bot monitor error:", error);
    }
  }
};