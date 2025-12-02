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
    description: "Display fake growth statistics",
    category: "system",
    guide: "{pn} - View current fake statistics"
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

    const stats = loadStats();

    let msg = `📈 BOT GROWTH STATISTICS\n\n`;
    msg += `👥 Total Users: ${stats.users.toLocaleString()}\n`;
    msg += `💬 Active Groups: ${stats.threads.toLocaleString()}\n\n`;
    msg += `📊 Growth Rate: ${stats.enabled ? '📈 Increasing' : '⏸️ Paused'}\n`;
    msg += `⏰ Last Updated: ${formatDateBD(stats.lastUpdate)}\n\n`;
    
    if (stats.history && stats.history.length > 0) {
      const recentGrowth = stats.history.slice(-5);
      const totalThreadGrowth = recentGrowth.reduce((sum, entry) => sum + entry.threadIncrease, 0);
      const totalUserGrowth = recentGrowth.reduce((sum, entry) => sum + entry.userIncrease, 0);
      
      msg += `📈 Recent Growth (Last ${recentGrowth.length} updates):\n`;
      msg += `├─ Groups: +${totalThreadGrowth}\n`;
      msg += `└─ Users: +${totalUserGrowth}\n\n`;
    }
    
    msg += `🔥 Status: ${stats.enabled ? 'Active & Growing' : 'System Paused'}\n`;
    msg += `💡 Engagement: ${Math.floor(Math.random() * 20) + 80}%`;

    return message.reply(msg);
  }
};