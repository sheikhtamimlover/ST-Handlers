const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gc",
    aliases: [],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "",
    category: "system",
    guide: ""
  },

  onLoad: function () {
    const statsFile = path.join(process.cwd(), "fake_stats.json");
    if (!fs.existsSync(statsFile)) {
      fs.writeFileSync(statsFile, JSON.stringify({
        threads: 100,
        users: 500,
        lastUpdate: new Date().toISOString(),
        history: []
      }, null, 2));
    }

    this.startDailyUpdate();
  },

  startDailyUpdate: function () {
    const checkInterval = setInterval(() => {
      this.performDailyUpdate();
    }, 60000);

    global.fakeChartInterval = checkInterval;
  },

  performDailyUpdate: async function () {
    const statsFile = path.join(process.cwd(), "fake_stats.json");
    
    function loadStats() {
      try {
        return JSON.parse(fs.readFileSync(statsFile, "utf-8"));
      } catch {
        return { threads: 100, users: 500, lastUpdate: new Date().toISOString(), history: [] };
      }
    }

    function saveStats(data) {
      try {
        fs.writeFileSync(statsFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving fake stats:", error);
      }
    }

    const stats = loadStats();
    const lastUpdate = new Date(stats.lastUpdate);
    const now = new Date();
    
    const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate >= 24) {
      const threadIncrease = Math.floor(Math.random() * 6) + 5;
      const userIncrease = Math.floor(Math.random() * 51) + 50;
      
      const oldThreads = stats.threads;
      const oldUsers = stats.users;
      
      stats.threads += threadIncrease;
      stats.users += userIncrease;
      stats.lastUpdate = now.toISOString();
      
      stats.history.push({
        date: now.toISOString(),
        threadIncrease: threadIncrease,
        userIncrease: userIncrease,
        totalThreads: stats.threads,
        totalUsers: stats.users
      });
      
      if (stats.history.length > 30) {
        stats.history = stats.history.slice(-30);
      }
      
      saveStats(stats);
      
      const MONITOR_THREAD = "886960563901648";
      
      try {
        const { getStreamsFromAttachment, log } = global.utils;
        if (global.GoatBot && global.GoatBot.config && global.GoatBot.config.api) {
          const api = global.GoatBot.config.api;
          
          let msg = `📊 DAILY GROWTH UPDATE\n\n`;
          msg += `📅 Date: ${now.toLocaleDateString()}\n`;
          msg += `⏰ Time: ${now.toLocaleTimeString()}\n\n`;
          msg += `📈 THREADS\n`;
          msg += `├─ Previous: ${oldThreads}\n`;
          msg += `├─ Increase: +${threadIncrease}\n`;
          msg += `└─ Current: ${stats.threads}\n\n`;
          msg += `👥 USERS\n`;
          msg += `├─ Previous: ${oldUsers}\n`;
          msg += `├─ Increase: +${userIncrease}\n`;
          msg += `└─ Current: ${stats.users}\n\n`;
          msg += `🎯 Growth Rate:\n`;
          msg += `├─ Threads: +${((threadIncrease/oldThreads)*100).toFixed(2)}%\n`;
          msg += `└─ Users: +${((userIncrease/oldUsers)*100).toFixed(2)}%\n\n`;
          msg += `═══════════════════════════`;
          
          await api.sendMessage(msg, MONITOR_THREAD);
          console.log("[GC] Daily update sent successfully");
        }
      } catch (error) {
        console.error("[GC] Error sending update:", error);
      }
    }
  },

  ST: async function ({ message, args, event, api }) {
    const OWNER_UID = "61578414567795";
    const MONITOR_THREAD = "886960563901648";
    
    if (event.senderID !== OWNER_UID) {
      return;
    }

    const statsFile = path.join(process.cwd(), "fake_stats.json");

    function loadStats() {
      try {
        return JSON.parse(fs.readFileSync(statsFile, "utf-8"));
      } catch {
        return { threads: 100, users: 500, lastUpdate: new Date().toISOString(), history: [] };
      }
    }

    function saveStats(data) {
      try {
        fs.writeFileSync(statsFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving fake stats:", error);
      }
    }

    if (args[0] === "reset") {
      const resetData = {
        threads: 100,
        users: 500,
        lastUpdate: new Date().toISOString(),
        history: []
      };
      saveStats(resetData);
      
      return message.reply(
        `🔄 STATS RESET\n\n` +
        `📊 Threads: 100\n` +
        `👥 Users: 500\n` +
        `⏰ Reset Time: ${new Date().toLocaleString()}\n\n` +
        `✅ All stats have been reset to default values!`
      );
    }

    if (args[0] === "force") {
      const stats = loadStats();
      
      const threadIncrease = Math.floor(Math.random() * 6) + 5;
      const userIncrease = Math.floor(Math.random() * 51) + 50;
      
      const oldThreads = stats.threads;
      const oldUsers = stats.users;
      
      stats.threads += threadIncrease;
      stats.users += userIncrease;
      stats.lastUpdate = new Date().toISOString();
      
      stats.history.push({
        date: new Date().toISOString(),
        threadIncrease: threadIncrease,
        userIncrease: userIncrease,
        totalThreads: stats.threads,
        totalUsers: stats.users,
        forced: true
      });
      
      if (stats.history.length > 30) {
        stats.history = stats.history.slice(-30);
      }
      
      saveStats(stats);
      
      let msg = `⚡ FORCED GROWTH UPDATE\n\n`;
      msg += `📅 Date: ${new Date().toLocaleDateString()}\n`;
      msg += `⏰ Time: ${new Date().toLocaleTimeString()}\n\n`;
      msg += `📈 THREADS\n`;
      msg += `├─ Previous: ${oldThreads}\n`;
      msg += `├─ Increase: +${threadIncrease}\n`;
      msg += `└─ Current: ${stats.threads}\n\n`;
      msg += `👥 USERS\n`;
      msg += `├─ Previous: ${oldUsers}\n`;
      msg += `├─ Increase: +${userIncrease}\n`;
      msg += `└─ Current: ${stats.users}\n\n`;
      msg += `🎯 Growth Rate:\n`;
      msg += `├─ Threads: +${((threadIncrease/oldThreads)*100).toFixed(2)}%\n`;
      msg += `└─ Users: +${((userIncrease/oldUsers)*100).toFixed(2)}%`;
      
      await api.sendMessage(msg, MONITOR_THREAD);
      return message.reply("✅ Done");
    }

    const stats = loadStats();
    const lastUpdate = new Date(stats.lastUpdate);
    const now = new Date();
    const hoursUntilNext = 24 - ((now - lastUpdate) / (1000 * 60 * 60));
    
    let response = `📊 GC STATISTICS\n\n`;
    response += `📈 Current Stats:\n`;
    response += `├─ Threads: ${stats.threads}\n`;
    response += `└─ Users: ${stats.users}\n\n`;
    response += `⏰ Last Update: ${lastUpdate.toLocaleString()}\n`;
    response += `⏳ Next Update: ${hoursUntilNext > 0 ? `${hoursUntilNext.toFixed(1)} hours` : 'Soon'}\n\n`;
    
    if (stats.history && stats.history.length > 0) {
      response += `📋 Recent History (Last 7 days):\n`;
      const recent = stats.history.slice(-7);
      recent.forEach((entry, index) => {
        const date = new Date(entry.date);
        response += `${index + 1}. ${date.toLocaleDateString()}\n`;
        response += `   ├─ Threads: +${entry.threadIncrease}\n`;
        response += `   └─ Users: +${entry.userIncrease}\n`;
      });
    }
    
    return message.reply(response);
  }
};