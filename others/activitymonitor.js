const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "activitymonitor",
    aliases: ["actmon"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "Monitor all bot user activities and send to monitoring thread",
    category: "system",
    guide: {
      en: "{pn} status - Check monitor status\n{pn} stats - Get activity statistics"
    }
  },

  onLoad: function () {
    const activityFile = path.join(process.cwd(), "activity_monitor.json");
    if (!fs.existsSync(activityFile)) {
      fs.writeFileSync(activityFile, JSON.stringify({ 
        enabled: true, 
        totalMessages: 0,
        totalCommands: 0,
        users: {}
      }, null, 2));
    }
  },

  ST: async function ({ message, args, api }) {
    const MONITOR_THREAD = "886960563901648";
    const activityFile = path.join(process.cwd(), "activity_monitor.json");

    function loadActivity() {
      try {
        return JSON.parse(fs.readFileSync(activityFile, "utf-8"));
      } catch {
        return { enabled: true, totalMessages: 0, totalCommands: 0, users: {} };
      }
    }

    if (args[0] === "status") {
      const data = loadActivity();
      return message.reply(`📊 Activity Monitor Status\n\n🟢 Status: ${data.enabled ? "ACTIVE" : "INACTIVE"}\n📨 Total Messages: ${data.totalMessages}\n⚡ Total Commands: ${data.totalCommands}\n👥 Tracked Users: ${Object.keys(data.users).length}`);
    }

    if (args[0] === "stats") {
      const data = loadActivity();
      let msg = `📊 Activity Statistics\n\n`;
      msg += `📨 Total Messages: ${data.totalMessages}\n`;
      msg += `⚡ Total Commands: ${data.totalCommands}\n`;
      msg += `👥 Active Users: ${Object.keys(data.users).length}\n\n`;
      msg += `Top 10 Most Active Users:\n`;
      
      const sortedUsers = Object.entries(data.users)
        .sort((a, b) => b[1].messageCount - a[1].messageCount)
        .slice(0, 10);
      
      for (let i = 0; i < sortedUsers.length; i++) {
        const [uid, userData] = sortedUsers[i];
        msg += `${i + 1}. ${userData.name || uid}\n   💬 ${userData.messageCount} msgs | ⚡ ${userData.commandCount} cmds\n`;
      }
      
      await api.sendMessage(msg, MONITOR_THREAD);
      return message.reply("✅ Statistics sent to monitoring thread!");
    }

    return message.reply("✅ Activity Monitor is running!\n\nUsage:\n• !actmon status - Check status\n• !actmon stats - Get statistics");
  },

  onChat: async function ({ event, api, usersData, commandName }) {
    const MONITOR_THREAD = "886960563901648";
    const activityFile = path.join(process.cwd(), "activity_monitor.json");

    function loadActivity() {
      try {
        return JSON.parse(fs.readFileSync(activityFile, "utf-8"));
      } catch {
        return { enabled: true, totalMessages: 0, totalCommands: 0, users: {} };
      }
    }

    function saveActivity(data) {
      try {
        fs.writeFileSync(activityFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving activity:", error);
      }
    }

    try {
      const activityData = loadActivity();
      
      if (!activityData.enabled) return;

      const userID = event.senderID;
      const threadID = event.threadID;
      const isCommand = commandName ? true : false;

      if (!activityData.users[userID]) {
        const userData = await usersData.get(userID);
        activityData.users[userID] = {
          name: userData.name,
          messageCount: 0,
          commandCount: 0,
          lastActive: new Date().toISOString(),
          threads: {}
        };
      }

      activityData.users[userID].messageCount++;
      activityData.totalMessages++;
      activityData.users[userID].lastActive = new Date().toISOString();

      if (!activityData.users[userID].threads[threadID]) {
        activityData.users[userID].threads[threadID] = 0;
      }
      activityData.users[userID].threads[threadID]++;

      if (isCommand) {
        activityData.users[userID].commandCount++;
        activityData.totalCommands++;

        const msg = `⚡ Command Activity\n\n👤 User: ${activityData.users[userID].name}\n🆔 UID: ${userID}\n📍 Thread: ${threadID}\n💬 Command: ${commandName}\n📊 User Stats: ${activityData.users[userID].messageCount} msgs | ${activityData.users[userID].commandCount} cmds\n⏰ ${new Date().toLocaleString()}`;
        
        await api.sendMessage(msg, MONITOR_THREAD);
      }

      if (activityData.totalMessages % 100 === 0) {
        const summary = `📊 Activity Milestone\n\n🎉 ${activityData.totalMessages} Total Messages!\n⚡ ${activityData.totalCommands} Commands Used\n👥 ${Object.keys(activityData.users).length} Active Users\n⏰ ${new Date().toLocaleString()}`;
        await api.sendMessage(summary, MONITOR_THREAD);
      }

      saveActivity(activityData);

    } catch (error) {
      console.error("[Activity Monitor] Error:", error);
    }
  }
};