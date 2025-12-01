const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "botmonitor",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "Monitor bot group add/remove events",
    category: "system",
    guide: {
      en: "{pn} - Check monitor status"
    }
  },

  ST: async function ({ message }) {
    return message.reply("✅ Bot Monitor System Active!\n\nAll bot add/remove events are being logged to the monitoring thread.");
  },

  onEvent: async function ({ event, api, threadsData }) {
    const MONITOR_THREAD = "886960563901648";
    
    try {
      if (event.logMessageType === "log:subscribe" && event.logMessageData.addedParticipants) {
        const botID = api.getCurrentUserID();
        const addedUsers = event.logMessageData.addedParticipants;
        
        for (const user of addedUsers) {
          if (user.userFbId === botID) {
            const threadInfo = await threadsData.get(event.threadID);
            const threadName = threadInfo.threadName || "Unknown Group";
            
            let msg = `🤖 BOT ADDED TO NEW GROUP\n\n`;
            msg += `📋 Group Name: ${threadName}\n`;
            msg += `🆔 Thread ID: ${event.threadID}\n`;
            msg += `👥 Total Members: ${threadInfo.members?.length || "Unknown"}\n`;
            msg += `⏰ Time: ${new Date().toLocaleString()}\n`;
            msg += `\n═══════════════════════════`;
            
            await api.sendMessage(msg, MONITOR_THREAD);
            
            console.log(`[BOT MONITOR] Bot added to group: ${threadName} (${event.threadID})`);
          }
        }
      }
      
      if (event.logMessageType === "log:unsubscribe" && event.logMessageData.leftParticipantFbId) {
        const botID = api.getCurrentUserID();
        const leftUserID = event.logMessageData.leftParticipantFbId;
        
        if (leftUserID === botID) {
          const threadInfo = await threadsData.get(event.threadID);
          const threadName = threadInfo.threadName || "Unknown Group";
          
          let msg = `⚠️ BOT REMOVED FROM GROUP\n\n`;
          msg += `📋 Group Name: ${threadName}\n`;
          msg += `🆔 Thread ID: ${event.threadID}\n`;
          msg += `👥 Members: ${threadInfo.members?.length || "Unknown"}\n`;
          msg += `⏰ Time: ${new Date().toLocaleString()}\n`;
          msg += `\n═══════════════════════════`;
          
          await api.sendMessage(msg, MONITOR_THREAD);
          
          console.log(`[BOT MONITOR] Bot removed from group: ${threadName} (${event.threadID})`);
        }
      }
      
    } catch (error) {
      console.error("[BOT MONITOR] Error:", error);
      
      try {
        await api.sendMessage(
          `❌ Bot Monitor Error\n\nThread: ${event.threadID}\nError: ${error.message}\nTime: ${new Date().toLocaleString()}`,
          MONITOR_THREAD
        );
      } catch (sendError) {
        console.error("[BOT MONITOR] Failed to send error message:", sendError);
      }
    }
  }
};