const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "fakechart",
    aliases: ["fc", "fakestats"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "",
    category: "system",
    guide: ""
  },

  onLoad: function () {
    const statsFile = path.join(process.cwd(), "fakechart_stats.json");
    if (!fs.existsSync(statsFile)) {
      fs.writeFileSync(statsFile, JSON.stringify({
        enabled: true,
        threads: 150,
        users: 1000,
        lastUpdate: new Date().toISOString(),
        updateInterval: 7200000,
        history: []
      }, null, 2));
    }

    this.startAutoUpdate();
  },

  startAutoUpdate: function () {
    const statsFile = path.join(process.cwd(), "fakechart_stats.json");

    function loadStats() {
      try {
        if (fs.existsSync(statsFile)) {
          return JSON.parse(fs.readFileSync(statsFile, "utf-8"));
        }
        return { 
          enabled: true, 
          threads: 150, 
          users: 1000, 
          lastUpdate: new Date().toISOString(), 
          updateInterval: 7200000,
          history: [] 
        };
      } catch {
        return { 
          enabled: true, 
          threads: 150, 
          users: 1000, 
          lastUpdate: new Date().toISOString(), 
          updateInterval: 7200000,
          history: [] 
        };
      }
    }

    function saveStats(data) {
      try {
        fs.writeFileSync(statsFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving fakechart stats:", error);
      }
    }

    function performUpdate() {
      const stats = loadStats();

      if (!stats.enabled) {
        return;
      }

      const threadIncrease = Math.floor(Math.random() * 9) + 2;
      const userIncrease = Math.floor(Math.random() * 251) + 50;

      stats.threads += threadIncrease;
      stats.users += userIncrease;
      stats.lastUpdate = new Date().toISOString();

      stats.history.push({
        date: new Date().toISOString(),
        threadIncrease: threadIncrease,
        userIncrease: userIncrease,
        totalThreads: stats.threads,
        totalUsers: stats.users,
        auto: true
      });

      if (stats.history.length > 100) {
        stats.history = stats.history.slice(-100);
      }

      saveStats(stats);

      console.log(`[FAKECHART] Auto update: +${threadIncrease} threads, +${userIncrease} users`);
    }

    const updateInterval = setInterval(() => {
      performUpdate();
    }, 7200000);

    global.fakeChartUpdateInterval = updateInterval;

    console.log("[FAKECHART] Auto-update system started (2 hour intervals)");
  },

  ST: async function ({ message, args, event }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return;
    }

    const statsFile = path.join(process.cwd(), "fakechart_stats.json");

    function loadStats() {
      try {
        if (fs.existsSync(statsFile)) {
          return JSON.parse(fs.readFileSync(statsFile, "utf-8"));
        }
        return { 
          enabled: true, 
          threads: 150, 
          users: 1000, 
          lastUpdate: new Date().toISOString(), 
          updateInterval: 7200000,
          history: [] 
        };
      } catch {
        return { 
          enabled: true, 
          threads: 150, 
          users: 1000, 
          lastUpdate: new Date().toISOString(), 
          updateInterval: 7200000,
          history: [] 
        };
      }
    }

    function saveStats(data) {
      try {
        fs.writeFileSync(statsFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving fakechart stats:", error);
      }
    }

    if (args[0] === "on" || args[0] === "enable") {
      const stats = loadStats();
      stats.enabled = true;
      saveStats(stats);

      return message.reply("✅ Fake Chart System ENABLED!");
    }

    if (args[0] === "off" || args[0] === "disable") {
      const stats = loadStats();
      stats.enabled = false;
      saveStats(stats);

      return message.reply("❌ Fake Chart System DISABLED!");
    }

    if (args[0] === "set") {
      if (!args[1] || !args[2] || !args[3]) {
        return message.reply(
          `❌ Invalid usage!\n\n` +
          `💡 Usage: fakechart set <type> <value>\n` +
          `Types: thread, user`
        );
      }

      const stats = loadStats();
      const type = args[1].toLowerCase();
      const value = parseInt(args[2]);

      if (isNaN(value) || value < 0) {
        return message.reply("❌ Invalid value! Use a positive number.");
      }

      if (type === "thread" || type === "threads") {
        stats.threads = value;
        saveStats(stats);
        return message.reply(`✅ Threads set to: ${value}`);
      }

      if (type === "user" || type === "users") {
        stats.users = value;
        saveStats(stats);
        return message.reply(`✅ Users set to: ${value}`);
      }

      return message.reply("❌ Invalid type! Use: thread or user");
    }

    if (args[0] === "reset") {
      const stats = loadStats();
      stats.threads = 150;
      stats.users = 1000;
      stats.lastUpdate = new Date().toISOString();
      stats.history = [];
      saveStats(stats);

      return message.reply(
        `🔄 FAKE CHART RESET\n\n` +
        `📊 Threads: 150\n` +
        `👥 Users: 1000\n` +
        `📋 History: Cleared\n` +
        `⏰ ${new Date().toLocaleString()}`
      );
    }

    if (args[0] === "force" || args[0] === "update") {
      const stats = loadStats();

      const threadIncrease = Math.floor(Math.random() * 9) + 2;
      const userIncrease = Math.floor(Math.random() * 251) + 50;

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

      if (stats.history.length > 100) {
        stats.history = stats.history.slice(-100);
      }

      saveStats(stats);

      return message.reply(
        `⚡ FORCED UPDATE\n\n` +
        `📈 THREADS\n` +
        `├─ Previous: ${oldThreads}\n` +
        `├─ Increase: +${threadIncrease}\n` +
        `└─ Current: ${stats.threads}\n\n` +
        `👥 USERS\n` +
        `├─ Previous: ${oldUsers}\n` +
        `├─ Increase: +${userIncrease}\n` +
        `└─ Current: ${stats.users}\n\n` +
        `⏰ ${new Date().toLocaleString()}`
      );
    }

    if (args[0] === "history" || args[0] === "hist") {
      const stats = loadStats();

      if (!stats.history || stats.history.length === 0) {
        return message.reply("📋 No history records found.");
      }

      const limit = parseInt(args[1]) || 10;
      const historyToShow = stats.history.slice(-limit);

      let msg = `📋 FAKE CHART HISTORY (Last ${historyToShow.length})\n\n`;
      
      historyToShow.forEach((entry, index) => {
        const date = new Date(entry.date);
        const num = stats.history.length - limit + index + 1;
        
        msg += `${num}. ${date.toLocaleDateString()} ${date.toLocaleTimeString()}\n`;
        msg += `   📈 Threads: +${entry.threadIncrease} (${entry.totalThreads})\n`;
        msg += `   👥 Users: +${entry.userIncrease} (${entry.totalUsers})\n`;
        
        if (entry.forced) {
          msg += `   ⚡ Forced Update\n`;
        } else if (entry.auto) {
          msg += `   🤖 Auto Update\n`;
        }
        msg += `\n`;
      });

      msg += `📊 Total Records: ${stats.history.length}`;
      
      return message.reply(msg);
    }

    if (args[0] === "interval" || args[0] === "time") {
      if (!args[1]) {
        return message.reply(
          `❌ Invalid usage!\n\n` +
          `💡 Usage: fakechart interval <hours>\n` +
          `Example: fakechart interval 2`
        );
      }

      const hours = parseFloat(args[1]);

      if (isNaN(hours) || hours <= 0) {
        return message.reply("❌ Invalid hours! Use a positive number.");
      }

      const stats = loadStats();
      stats.updateInterval = hours * 3600000;
      saveStats(stats);

      if (global.fakeChartUpdateInterval) {
        clearInterval(global.fakeChartUpdateInterval);
      }

      const updateInterval = setInterval(() => {
        const s = loadStats();
        if (!s.enabled) return;

        const threadIncrease = Math.floor(Math.random() * 9) + 2;
        const userIncrease = Math.floor(Math.random() * 251) + 50;

        s.threads += threadIncrease;
        s.users += userIncrease;
        s.lastUpdate = new Date().toISOString();

        s.history.push({
          date: new Date().toISOString(),
          threadIncrease: threadIncrease,
          userIncrease: userIncrease,
          totalThreads: s.threads,
          totalUsers: s.users,
          auto: true
        });

        if (s.history.length > 100) {
          s.history = s.history.slice(-100);
        }

        saveStats(s);
      }, stats.updateInterval);

      global.fakeChartUpdateInterval = updateInterval;

      return message.reply(
        `✅ UPDATE INTERVAL CHANGED\n\n` +
        `⏰ New Interval: ${hours} hour(s)\n` +
        `⏱️ Milliseconds: ${stats.updateInterval}\n` +
        `🔄 Auto-update restarted`
      );
    }

    const stats = loadStats();
    const lastUpdate = new Date(stats.lastUpdate);
    const now = new Date();
    const timeSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);
    const timeUntilNext = (stats.updateInterval / (1000 * 60 * 60)) - timeSinceUpdate;

    let msg = `📊 FAKE CHART STATUS\n\n`;
    msg += `🔘 System: ${stats.enabled ? '✅ Enabled' : '❌ Disabled'}\n\n`;
    msg += `📈 Current Stats:\n`;
    msg += `├─ Threads: ${stats.threads}\n`;
    msg += `└─ Users: ${stats.users}\n\n`;
    msg += `⏰ Last Update: ${lastUpdate.toLocaleString()}\n`;
    msg += `⏳ Next Update: ${timeUntilNext > 0 ? `${timeUntilNext.toFixed(1)} hours` : 'Soon'}\n`;
    msg += `⏱️ Interval: ${stats.updateInterval / 3600000} hour(s)\n\n`;
    msg += `📋 History Records: ${stats.history.length}\n\n`;
    msg += `💡 Commands:\n`;
    msg += `• fakechart on/off\n`;
    msg += `• fakechart set <type> <value>\n`;
    msg += `• fakechart force - Force update\n`;
    msg += `• fakechart history [limit]\n`;
    msg += `• fakechart interval <hours>\n`;
    msg += `• fakechart reset`;

    return message.reply(msg);
  }
};