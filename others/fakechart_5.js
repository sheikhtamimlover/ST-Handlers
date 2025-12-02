const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "growth",
    aliases: ["metrics", "analytics"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 0,
    description: "",
    category: "system",
    guide: ""
  },

  onLoad: function () {
    const statsFile = path.join(process.cwd(), "growth_metrics.json");
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
    const statsFile = path.join(process.cwd(), "growth_metrics.json");

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
        console.error("Error saving growth metrics:", error);
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

      console.log(`[GROWTH] Auto update: +${threadIncrease} threads, +${userIncrease} users`);
    }

    const updateInterval = setInterval(() => {
      performUpdate();
    }, 7200000);

    global.growthUpdateInterval = updateInterval;

    console.log("[GROWTH] Auto-update system started (2 hour intervals)");
  },

  ST: async function ({ message, args, event }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return message.reply("❌ Access Denied! This command is restricted.");
    }

    const statsFile = path.join(process.cwd(), "growth_metrics.json");

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
        console.error("Error saving growth metrics:", error);
      }
    }

    function formatDateBD(isoString) {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        timeZone: 'Asia/Dhaka',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    }

    function formatTimeRemaining(milliseconds) {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    }

    if (args[0] === "help" || args[0] === "guide" || args[0] === "commands") {
      let guideMsg = `📚 GROWTH COMMAND GUIDE\n\n`;
      guideMsg += `🔧 SYSTEM CONTROL:\n`;
      guideMsg += `• growth on/off - Enable/disable system\n`;
      guideMsg += `• growth interval <hours> - Set update interval\n\n`;
      
      guideMsg += `📊 METRICS MANAGEMENT:\n`;
      guideMsg += `• growth set <type> <value> - Set exact value\n`;
      guideMsg += `• growth add <type> <value> - Add to current\n`;
      guideMsg += `• growth subtract <type> <value> - Subtract from current\n`;
      guideMsg += `  Types: thread, user\n\n`;
      
      guideMsg += `⚡ ACTIONS:\n`;
      guideMsg += `• growth force - Force manual sync\n`;
      guideMsg += `• growth reset - Reset to defaults\n\n`;
      
      guideMsg += `📋 HISTORY:\n`;
      guideMsg += `• growth history [limit] - View history\n`;
      guideMsg += `• growth history clear - Clear all\n`;
      guideMsg += `• growth history clear <num1> <num2>... - Clear specific\n\n`;
      
      guideMsg += `💡 EXAMPLES:\n`;
      guideMsg += `• growth set thread 500\n`;
      guideMsg += `• growth add user 100\n`;
      guideMsg += `• growth subtract thread 50\n`;
      guideMsg += `• growth interval 3\n`;
      guideMsg += `• growth history 20\n`;
      guideMsg += `• growth history clear 1 5 10`;
      
      return message.reply(guideMsg);
    }

    if (args[0] === "on" || args[0] === "enable") {
      const stats = loadStats();
      stats.enabled = true;
      saveStats(stats);

      return message.reply("✅ Growth Tracking System ENABLED!");
    }

    if (args[0] === "off" || args[0] === "disable") {
      const stats = loadStats();
      stats.enabled = false;
      saveStats(stats);

      return message.reply("❌ Growth Tracking System DISABLED!");
    }

    if (args[0] === "set") {
      if (!args[1] || !args[2]) {
        return message.reply(
          `❌ Invalid usage!\n\n` +
          `💡 Usage: growth set <type> <value>\n` +
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

    if (args[0] === "add" || args[0] === "+") {
      if (!args[1] || !args[2]) {
        return message.reply(
          `❌ Invalid usage!\n\n` +
          `💡 Usage: growth add <type> <value>\n` +
          `Types: thread, user`
        );
      }

      const stats = loadStats();
      const type = args[1].toLowerCase();
      const value = parseInt(args[2]);

      if (isNaN(value)) {
        return message.reply("❌ Invalid value! Use a number.");
      }

      if (type === "thread" || type === "threads") {
        const oldThreads = stats.threads;
        stats.threads += value;
        stats.lastUpdate = new Date().toISOString();

        stats.history.push({
          date: new Date().toISOString(),
          threadIncrease: value,
          userIncrease: 0,
          totalThreads: stats.threads,
          totalUsers: stats.users,
          manual: true
        });

        if (stats.history.length > 100) {
          stats.history = stats.history.slice(-100);
        }

        saveStats(stats);

        return message.reply(
          `✅ THREADS ADJUSTED\n\n` +
          `📊 Previous: ${oldThreads}\n` +
          `➕ Added: ${value > 0 ? '+' : ''}${value}\n` +
          `📈 Current: ${stats.threads}\n\n` +
          `⏰ ${formatDateBD(new Date().toISOString())}`
        );
      }

      if (type === "user" || type === "users") {
        const oldUsers = stats.users;
        stats.users += value;
        stats.lastUpdate = new Date().toISOString();

        stats.history.push({
          date: new Date().toISOString(),
          threadIncrease: 0,
          userIncrease: value,
          totalThreads: stats.threads,
          totalUsers: stats.users,
          manual: true
        });

        if (stats.history.length > 100) {
          stats.history = stats.history.slice(-100);
        }

        saveStats(stats);

        return message.reply(
          `✅ USERS ADJUSTED\n\n` +
          `👥 Previous: ${oldUsers}\n` +
          `➕ Added: ${value > 0 ? '+' : ''}${value}\n` +
          `👥 Current: ${stats.users}\n\n` +
          `⏰ ${formatDateBD(new Date().toISOString())}`
        );
      }

      return message.reply("❌ Invalid type! Use: thread or user");
    }

    if (args[0] === "subtract" || args[0] === "-") {
      if (!args[1] || !args[2]) {
        return message.reply(
          `❌ Invalid usage!\n\n` +
          `💡 Usage: growth subtract <type> <value>\n` +
          `Types: thread, user`
        );
      }

      const stats = loadStats();
      const type = args[1].toLowerCase();
      const value = parseInt(args[2]);

      if (isNaN(value)) {
        return message.reply("❌ Invalid value! Use a number.");
      }

      if (type === "thread" || type === "threads") {
        const oldThreads = stats.threads;
        stats.threads -= value;
        if (stats.threads < 0) stats.threads = 0;
        stats.lastUpdate = new Date().toISOString();

        stats.history.push({
          date: new Date().toISOString(),
          threadIncrease: -value,
          userIncrease: 0,
          totalThreads: stats.threads,
          totalUsers: stats.users,
          manual: true
        });

        if (stats.history.length > 100) {
          stats.history = stats.history.slice(-100);
        }

        saveStats(stats);

        return message.reply(
          `✅ THREADS ADJUSTED\n\n` +
          `📊 Previous: ${oldThreads}\n` +
          `➖ Subtracted: -${value}\n` +
          `📈 Current: ${stats.threads}\n\n` +
          `⏰ ${formatDateBD(new Date().toISOString())}`
        );
      }

      if (type === "user" || type === "users") {
        const oldUsers = stats.users;
        stats.users -= value;
        if (stats.users < 0) stats.users = 0;
        stats.lastUpdate = new Date().toISOString();

        stats.history.push({
          date: new Date().toISOString(),
          threadIncrease: 0,
          userIncrease: -value,
          totalThreads: stats.threads,
          totalUsers: stats.users,
          manual: true
        });

        if (stats.history.length > 100) {
          stats.history = stats.history.slice(-100);
        }

        saveStats(stats);

        return message.reply(
          `✅ USERS ADJUSTED\n\n` +
          `👥 Previous: ${oldUsers}\n` +
          `➖ Subtracted: -${value}\n` +
          `👥 Current: ${stats.users}\n\n` +
          `⏰ ${formatDateBD(new Date().toISOString())}`
        );
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
        `🔄 GROWTH METRICS RESET\n\n` +
        `📊 Threads: 150\n` +
        `👥 Users: 1000\n` +
        `📋 History: Cleared\n` +
        `⏰ ${formatDateBD(new Date().toISOString())}`
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
        `⚡ MANUAL SYNC\n\n` +
        `📈 THREADS\n` +
        `├─ Previous: ${oldThreads}\n` +
        `├─ Increase: +${threadIncrease}\n` +
        `└─ Current: ${stats.threads}\n\n` +
        `👥 USERS\n` +
        `├─ Previous: ${oldUsers}\n` +
        `├─ Increase: +${userIncrease}\n` +
        `└─ Current: ${stats.users}\n\n` +
        `⏰ ${formatDateBD(new Date().toISOString())}`
      );
    }

    if (args[0] === "history" || args[0] === "hist") {
      if (args[1] === "clear" || args[1] === "delete") {
        const stats = loadStats();

        if (args[2]) {
          const indices = args.slice(2).map(n => parseInt(n));
          const validIndices = indices.filter(n => !isNaN(n) && n > 0 && n <= stats.history.length);
          
          if (validIndices.length === 0) {
            return message.reply("❌ Invalid record number(s)!");
          }

          const sortedIndices = validIndices.sort((a, b) => b - a);
          const deletedRecords = [];

          sortedIndices.forEach(index => {
            const actualIndex = index - 1;
            if (stats.history[actualIndex]) {
              deletedRecords.push({
                number: index,
                record: stats.history[actualIndex]
              });
              stats.history.splice(actualIndex, 1);
            }
          });

          saveStats(stats);

          let msg = `✅ RECORDS DELETED\n\n`;
          msg += `📋 Deleted ${deletedRecords.length} record(s):\n\n`;
          
          deletedRecords.forEach(item => {
            msg += `#${item.number} - ${formatDateBD(item.record.date)}\n`;
            msg += `   📈 Threads: ${item.record.threadIncrease > 0 ? '+' : ''}${item.record.threadIncrease}\n`;
            msg += `   👥 Users: ${item.record.userIncrease > 0 ? '+' : ''}${item.record.userIncrease}\n\n`;
          });

          msg += `📊 Remaining: ${stats.history.length} records`;
          
          return message.reply(msg);
        }

        const historyCount = stats.history.length;

        if (historyCount === 0) {
          return message.reply("📋 History is already empty.");
        }

        stats.history = [];
        saveStats(stats);

        return message.reply(
          `✅ HISTORY CLEARED\n\n` +
          `📋 Deleted Records: ${historyCount}\n` +
          `📊 Current Metrics Preserved:\n` +
          `├─ Threads: ${stats.threads}\n` +
          `└─ Users: ${stats.users}\n\n` +
          `⏰ Cleared: ${formatDateBD(new Date().toISOString())}`
        );
      }

      const stats = loadStats();

      if (!stats.history || stats.history.length === 0) {
        return message.reply("📋 No history records found.");
      }

      const limit = parseInt(args[1]) || 10;
      const startIndex = Math.max(0, stats.history.length - limit);
      const historyToShow = stats.history.slice(startIndex);

      let msg = `📋 GROWTH HISTORY (Last ${historyToShow.length})\n\n`;
      
      historyToShow.forEach((entry, index) => {
        const num = startIndex + index + 1;
        
        msg += `${num}. ${formatDateBD(entry.date)}\n`;
        msg += `   📈 Threads: ${entry.threadIncrease > 0 ? '+' : ''}${entry.threadIncrease} (${entry.totalThreads})\n`;
        msg += `   👥 Users: ${entry.userIncrease > 0 ? '+' : ''}${entry.userIncrease} (${entry.totalUsers})\n`;
        
        if (entry.forced) {
          msg += `   ⚡ Manual Sync\n`;
        } else if (entry.manual) {
          msg += `   🔧 Manual Adjust\n`;
        } else if (entry.auto) {
          msg += `   🤖 Auto Sync\n`;
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
          `💡 Usage: growth interval <hours>\n` +
          `Example: growth interval 2`
        );
      }

      const hours = parseFloat(args[1]);

      if (isNaN(hours) || hours <= 0) {
        return message.reply("❌ Invalid hours! Use a positive number.");
      }

      const stats = loadStats();
      stats.updateInterval = hours * 3600000;
      saveStats(stats);

      if (global.growthUpdateInterval) {
        clearInterval(global.growthUpdateInterval);
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

      global.growthUpdateInterval = updateInterval;

      return message.reply(
        `✅ SYNC INTERVAL CHANGED\n\n` +
        `⏰ New Interval: ${hours} hour(s)\n` +
        `⏱️ Milliseconds: ${stats.updateInterval}\n` +
        `🔄 Auto-sync restarted`
      );
    }

    const stats = loadStats();
    const lastUpdate = new Date(stats.lastUpdate);
    const bdNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    const lastUpdateBD = new Date(lastUpdate.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
    
    const timeSinceUpdateMs = bdNow - lastUpdateBD;
    const timeUntilNextMs = stats.updateInterval - timeSinceUpdateMs;

    let msg = `📊 GROWTH ANALYTICS\n\n`;
    msg += `🔘 System: ${stats.enabled ? '✅ Enabled' : '❌ Disabled'}\n\n`;
    msg += `📈 Current Metrics:\n`;
    msg += `├─ Threads: ${stats.threads}\n`;
    msg += `└─ Users: ${stats.users}\n\n`;
    msg += `⏰ Last Sync: ${formatDateBD(stats.lastUpdate)}\n`;
    msg += `⏳ Next Sync: ${timeUntilNextMs > 0 ? formatTimeRemaining(timeUntilNextMs) : 'Soon'}\n`;
    msg += `⏱️ Interval: ${stats.updateInterval / 3600000} hour(s)\n\n`;
    msg += `📋 History Records: ${stats.history.length}\n\n`;
    msg += `💡 Type "growth help" for full command list`;

    return message.reply(msg);
  }
};