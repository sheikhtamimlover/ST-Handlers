const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gchistory",
    aliases: ["gchist", "clearhistory"],
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

    const stats = loadStats();

    if (args[0] === "view" || args[0] === "show" || args[0] === "v") {
      if (!stats.history || stats.history.length === 0) {
        return message.reply("📋 No history records found.");
      }

      const limit = parseInt(args[1]) || 10;
      const historyToShow = stats.history.slice(-limit);

      let msg = `📋 GC HISTORY (Last ${historyToShow.length} records)\n\n`;
      
      historyToShow.forEach((entry, index) => {
        const date = new Date(entry.date);
        const num = stats.history.length - limit + index + 1;
        
        msg += `${num}. ${date.toLocaleDateString()} ${date.toLocaleTimeString()}\n`;
        msg += `   📈 Threads: ${entry.threadIncrease > 0 ? '+' : ''}${entry.threadIncrease} (Total: ${entry.totalThreads})\n`;
        msg += `   👥 Users: ${entry.userIncrease > 0 ? '+' : ''}${entry.userIncrease} (Total: ${entry.totalUsers})\n`;
        
        if (entry.manual) {
          msg += `   🔧 Manual Change\n`;
        } else if (entry.forced) {
          msg += `   ⚡ Forced Update\n`;
        } else {
          msg += `   🤖 Auto Update\n`;
        }
        msg += `\n`;
      });

      msg += `📊 Total Records: ${stats.history.length}`;
      
      return message.reply(msg);
    }

    if (args[0] === "clear" || args[0] === "delete" || args[0] === "c") {
      const historyCount = stats.history.length;

      if (historyCount === 0) {
        return message.reply("📋 History is already empty.");
      }

      stats.history = [];
      saveStats(stats);

      return message.reply(
        `✅ HISTORY CLEARED\n\n` +
        `📋 Deleted Records: ${historyCount}\n` +
        `📊 Current Stats Preserved:\n` +
        `├─ Threads: ${stats.threads}\n` +
        `└─ Users: ${stats.users}\n\n` +
        `⏰ Cleared: ${new Date().toLocaleString()}`
      );
    }

    if (args[0] === "export" || args[0] === "save" || args[0] === "e") {
      if (!stats.history || stats.history.length === 0) {
        return message.reply("📋 No history to export.");
      }

      const exportFile = path.join(process.cwd(), `gc_history_export_${Date.now()}.json`);
      
      try {
        const exportData = {
          exportDate: new Date().toISOString(),
          currentStats: {
            threads: stats.threads,
            users: stats.users
          },
          totalRecords: stats.history.length,
          history: stats.history
        };

        fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));

        await message.reply({
          body: `✅ HISTORY EXPORTED\n\n📊 Total Records: ${stats.history.length}\n⏰ Exported: ${new Date().toLocaleString()}`,
          attachment: fs.createReadStream(exportFile)
        }, async () => {
          try {
            await fs.unlink(exportFile);
          } catch (e) {
            console.error("Error deleting export file:", e);
          }
        });

      } catch (error) {
        return message.reply(`❌ Export failed: ${error.message}`);
      }
      return;
    }

    if (args[0] === "last" || args[0] === "latest" || args[0] === "l") {
      if (!stats.history || stats.history.length === 0) {
        return message.reply("📋 No history records found.");
      }

      const lastEntry = stats.history[stats.history.length - 1];
      const date = new Date(lastEntry.date);

      let msg = `📋 LAST HISTORY RECORD\n\n`;
      msg += `📅 Date: ${date.toLocaleDateString()}\n`;
      msg += `⏰ Time: ${date.toLocaleTimeString()}\n\n`;
      msg += `📈 Thread Change: ${lastEntry.threadIncrease > 0 ? '+' : ''}${lastEntry.threadIncrease}\n`;
      msg += `📊 Total Threads: ${lastEntry.totalThreads}\n\n`;
      msg += `👥 User Change: ${lastEntry.userIncrease > 0 ? '+' : ''}${lastEntry.userIncrease}\n`;
      msg += `📊 Total Users: ${lastEntry.totalUsers}\n\n`;
      
      if (lastEntry.manual) {
        msg += `🔧 Type: Manual Change`;
      } else if (lastEntry.forced) {
        msg += `⚡ Type: Forced Update`;
      } else {
        msg += `🤖 Type: Auto Update`;
      }

      return message.reply(msg);
    }

    if (args[0] === "stats" || args[0] === "summary" || args[0] === "s") {
      if (!stats.history || stats.history.length === 0) {
        return message.reply("📋 No history to analyze.");
      }

      const totalThreadIncrease = stats.history.reduce((sum, entry) => sum + entry.threadIncrease, 0);
      const totalUserIncrease = stats.history.reduce((sum, entry) => sum + entry.userIncrease, 0);
      const manualChanges = stats.history.filter(e => e.manual).length;
      const forcedUpdates = stats.history.filter(e => e.forced).length;
      const autoUpdates = stats.history.filter(e => !e.manual && !e.forced).length;

      let msg = `📊 HISTORY STATISTICS\n\n`;
      msg += `📋 Total Records: ${stats.history.length}\n\n`;
      msg += `📈 Total Thread Growth: ${totalThreadIncrease > 0 ? '+' : ''}${totalThreadIncrease}\n`;
      msg += `👥 Total User Growth: ${totalUserIncrease > 0 ? '+' : ''}${totalUserIncrease}\n\n`;
      msg += `🔧 Manual Changes: ${manualChanges}\n`;
      msg += `⚡ Forced Updates: ${forcedUpdates}\n`;
      msg += `🤖 Auto Updates: ${autoUpdates}\n\n`;
      msg += `📊 Current Stats:\n`;
      msg += `├─ Threads: ${stats.threads}\n`;
      msg += `└─ Users: ${stats.users}`;

      return message.reply(msg);
    }

    return message.reply(
      `📋 GC HISTORY MANAGEMENT\n\n` +
      `💡 Commands:\n` +
      `• gchistory view [limit] - View history\n` +
      `• gchistory clear - Clear all history\n` +
      `• gchistory last - Show last record\n` +
      `• gchistory stats - Show statistics\n` +
      `• gchistory export - Export to file\n\n` +
      `📊 Current History: ${stats.history ? stats.history.length : 0} records`
    );
  }
};