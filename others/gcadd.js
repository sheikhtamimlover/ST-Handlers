const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gcadd",
    aliases: ["gcincrement", "gcplus"],
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
  },

  ST: async function ({ message, args, event }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return;
    }

    const statsFile = path.join(process.cwd(), "fake_stats.json");

    function loadStats() {
      try {
        if (fs.existsSync(statsFile)) {
          return JSON.parse(fs.readFileSync(statsFile, "utf-8"));
        }
        return { 
          threads: 100, 
          users: 500, 
          lastUpdate: new Date().toISOString(), 
          history: [] 
        };
      } catch {
        return { 
          threads: 100, 
          users: 500, 
          lastUpdate: new Date().toISOString(), 
          history: [] 
        };
      }
    }

    function saveStats(data) {
      try {
        fs.writeFileSync(statsFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving stats:", error);
      }
    }

    if (args.length === 0) {
      return message.reply(
        `💡 GCADD USAGE\n\n` +
        `Add to counts permanently:\n\n` +
        `• gcadd thread <number>\n` +
        `• gcadd user <number>\n` +
        `• gcadd both <threads> <users>\n\n` +
        `These counts persist after bot restarts!`
      );
    }

    const stats = loadStats();
    const oldThreads = stats.threads;
    const oldUsers = stats.users;

    if (args[0] === "thread" || args[0] === "threads" || args[0] === "t") {
      const addAmount = parseInt(args[1]);
      
      if (isNaN(addAmount)) {
        return message.reply("❌ Invalid amount! Use a valid number.");
      }

      stats.threads += addAmount;
      stats.lastUpdate = new Date().toISOString();
      
      stats.history.push({
        date: new Date().toISOString(),
        threadIncrease: addAmount,
        userIncrease: 0,
        totalThreads: stats.threads,
        totalUsers: stats.users,
        manual: true,
        permanent: true
      });

      if (stats.history.length > 30) {
        stats.history = stats.history.slice(-30);
      }

      saveStats(stats);

      return message.reply(
        `✅ THREADS ADDED (PERMANENT)\n\n` +
        `📊 Previous: ${oldThreads}\n` +
        `➕ Added: ${addAmount > 0 ? '+' : ''}${addAmount}\n` +
        `📈 Current: ${stats.threads}\n\n` +
        `💾 Saved permanently!\n` +
        `⏰ ${new Date().toLocaleString()}`
      );
    }

    if (args[0] === "user" || args[0] === "users" || args[0] === "u") {
      const addAmount = parseInt(args[1]);
      
      if (isNaN(addAmount)) {
        return message.reply("❌ Invalid amount! Use a valid number.");
      }

      stats.users += addAmount;
      stats.lastUpdate = new Date().toISOString();
      
      stats.history.push({
        date: new Date().toISOString(),
        threadIncrease: 0,
        userIncrease: addAmount,
        totalThreads: stats.threads,
        totalUsers: stats.users,
        manual: true,
        permanent: true
      });

      if (stats.history.length > 30) {
        stats.history = stats.history.slice(-30);
      }

      saveStats(stats);

      return message.reply(
        `✅ USERS ADDED (PERMANENT)\n\n` +
        `👥 Previous: ${oldUsers}\n` +
        `➕ Added: ${addAmount > 0 ? '+' : ''}${addAmount}\n` +
        `👥 Current: ${stats.users}\n\n` +
        `💾 Saved permanently!\n` +
        `⏰ ${new Date().toLocaleString()}`
      );
    }

    if (args[0] === "both" || args[0] === "all" || args[0] === "b") {
      const addThreads = parseInt(args[1]);
      const addUsers = parseInt(args[2]);
      
      if (isNaN(addThreads) || isNaN(addUsers)) {
        return message.reply("❌ Invalid amounts! Usage: gcadd both <threads> <users>");
      }

      stats.threads += addThreads;
      stats.users += addUsers;
      stats.lastUpdate = new Date().toISOString();
      
      stats.history.push({
        date: new Date().toISOString(),
        threadIncrease: addThreads,
        userIncrease: addUsers,
        totalThreads: stats.threads,
        totalUsers: stats.users,
        manual: true,
        permanent: true
      });

      if (stats.history.length > 30) {
        stats.history = stats.history.slice(-30);
      }

      saveStats(stats);

      return message.reply(
        `✅ COUNTS ADDED (PERMANENT)\n\n` +
        `📈 THREADS\n` +
        `├─ Previous: ${oldThreads}\n` +
        `├─ Added: ${addThreads > 0 ? '+' : ''}${addThreads}\n` +
        `└─ Current: ${stats.threads}\n\n` +
        `👥 USERS\n` +
        `├─ Previous: ${oldUsers}\n` +
        `├─ Added: ${addUsers > 0 ? '+' : ''}${addUsers}\n` +
        `└─ Current: ${stats.users}\n\n` +
        `💾 Saved permanently!\n` +
        `⏰ ${new Date().toLocaleString()}`
      );
    }

    return message.reply(
      `❌ Invalid command!\n\n` +
      `💡 Usage:\n` +
      `• gcadd thread <number>\n` +
      `• gcadd user <number>\n` +
      `• gcadd both <threads> <users>`
    );
  }
};