const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gccount",
    aliases: ["setcount"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "",
    category: "system",
    guide: ""
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
      const stats = loadStats();
      let msg = `📊 CURRENT COUNT\n\n`;
      msg += `📈 Threads: ${stats.threads}\n`;
      msg += `👥 Users: ${stats.users}\n\n`;
      msg += `💡 Usage:\n`;
      msg += `• gccount thread <number>\n`;
      msg += `• gccount user <number>\n`;
      msg += `• gccount both <threads> <users>`;
      
      return message.reply(msg);
    }

    const stats = loadStats();
    const oldThreads = stats.threads;
    const oldUsers = stats.users;

    if (args[0] === "thread" || args[0] === "threads" || args[0] === "t") {
      const newThreadCount = parseInt(args[1]);
      
      if (isNaN(newThreadCount) || newThreadCount < 0) {
        return message.reply("❌ Invalid thread count! Use a positive number.");
      }

      stats.threads = newThreadCount;
      stats.lastUpdate = new Date().toISOString();
      
      stats.history.push({
        date: new Date().toISOString(),
        threadIncrease: newThreadCount - oldThreads,
        userIncrease: 0,
        totalThreads: newThreadCount,
        totalUsers: stats.users,
        manual: true
      });

      if (stats.history.length > 30) {
        stats.history = stats.history.slice(-30);
      }

      saveStats(stats);

      return message.reply(
        `✅ THREAD COUNT UPDATED\n\n` +
        `📊 Previous: ${oldThreads}\n` +
        `📈 Current: ${newThreadCount}\n` +
        `📉 Change: ${newThreadCount > oldThreads ? '+' : ''}${newThreadCount - oldThreads}\n` +
        `⏰ Updated: ${new Date().toLocaleString()}`
      );
    }

    if (args[0] === "user" || args[0] === "users" || args[0] === "u") {
      const newUserCount = parseInt(args[1]);
      
      if (isNaN(newUserCount) || newUserCount < 0) {
        return message.reply("❌ Invalid user count! Use a positive number.");
      }

      stats.users = newUserCount;
      stats.lastUpdate = new Date().toISOString();
      
      stats.history.push({
        date: new Date().toISOString(),
        threadIncrease: 0,
        userIncrease: newUserCount - oldUsers,
        totalThreads: stats.threads,
        totalUsers: newUserCount,
        manual: true
      });

      if (stats.history.length > 30) {
        stats.history = stats.history.slice(-30);
      }

      saveStats(stats);

      return message.reply(
        `✅ USER COUNT UPDATED\n\n` +
        `👥 Previous: ${oldUsers}\n` +
        `👥 Current: ${newUserCount}\n` +
        `📉 Change: ${newUserCount > oldUsers ? '+' : ''}${newUserCount - oldUsers}\n` +
        `⏰ Updated: ${new Date().toLocaleString()}`
      );
    }

    if (args[0] === "both" || args[0] === "all" || args[0] === "b") {
      const newThreadCount = parseInt(args[1]);
      const newUserCount = parseInt(args[2]);
      
      if (isNaN(newThreadCount) || isNaN(newUserCount) || newThreadCount < 0 || newUserCount < 0) {
        return message.reply("❌ Invalid counts! Usage: gccount both <threads> <users>");
      }

      stats.threads = newThreadCount;
      stats.users = newUserCount;
      stats.lastUpdate = new Date().toISOString();
      
      stats.history.push({
        date: new Date().toISOString(),
        threadIncrease: newThreadCount - oldThreads,
        userIncrease: newUserCount - oldUsers,
        totalThreads: newThreadCount,
        totalUsers: newUserCount,
        manual: true
      });

      if (stats.history.length > 30) {
        stats.history = stats.history.slice(-30);
      }

      saveStats(stats);

      return message.reply(
        `✅ COUNTS UPDATED\n\n` +
        `📈 THREADS\n` +
        `├─ Previous: ${oldThreads}\n` +
        `├─ Current: ${newThreadCount}\n` +
        `└─ Change: ${newThreadCount > oldThreads ? '+' : ''}${newThreadCount - oldThreads}\n\n` +
        `👥 USERS\n` +
        `├─ Previous: ${oldUsers}\n` +
        `├─ Current: ${newUserCount}\n` +
        `└─ Change: ${newUserCount > oldUsers ? '+' : ''}${newUserCount - oldUsers}\n\n` +
        `⏰ Updated: ${new Date().toLocaleString()}`
      );
    }

    if (args[0] === "add" || args[0] === "+") {
      const addThreads = parseInt(args[1]) || 0;
      const addUsers = parseInt(args[2]) || 0;

      stats.threads += addThreads;
      stats.users += addUsers;
      stats.lastUpdate = new Date().toISOString();
      
      stats.history.push({
        date: new Date().toISOString(),
        threadIncrease: addThreads,
        userIncrease: addUsers,
        totalThreads: stats.threads,
        totalUsers: stats.users,
        manual: true
      });

      if (stats.history.length > 30) {
        stats.history = stats.history.slice(-30);
      }

      saveStats(stats);

      return message.reply(
        `✅ COUNTS INCREASED\n\n` +
        `📈 Threads: ${oldThreads} → ${stats.threads} (+${addThreads})\n` +
        `👥 Users: ${oldUsers} → ${stats.users} (+${addUsers})\n` +
        `⏰ Updated: ${new Date().toLocaleString()}`
      );
    }

    if (args[0] === "subtract" || args[0] === "sub" || args[0] === "-") {
      const subThreads = parseInt(args[1]) || 0;
      const subUsers = parseInt(args[2]) || 0;

      stats.threads = Math.max(0, stats.threads - subThreads);
      stats.users = Math.max(0, stats.users - subUsers);
      stats.lastUpdate = new Date().toISOString();
      
      stats.history.push({
        date: new Date().toISOString(),
        threadIncrease: -subThreads,
        userIncrease: -subUsers,
        totalThreads: stats.threads,
        totalUsers: stats.users,
        manual: true
      });

      if (stats.history.length > 30) {
        stats.history = stats.history.slice(-30);
      }

      saveStats(stats);

      return message.reply(
        `✅ COUNTS DECREASED\n\n` +
        `📈 Threads: ${oldThreads} → ${stats.threads} (-${subThreads})\n` +
        `👥 Users: ${oldUsers} → ${stats.users} (-${subUsers})\n` +
        `⏰ Updated: ${new Date().toLocaleString()}`
      );
    }

    return message.reply(
      `❌ Invalid command!\n\n` +
      `💡 Usage:\n` +
      `• gccount - Show current counts\n` +
      `• gccount thread <number>\n` +
      `• gccount user <number>\n` +
      `• gccount both <threads> <users>\n` +
      `• gccount add <threads> <users>\n` +
      `• gccount sub <threads> <users>`
    );
  }
};