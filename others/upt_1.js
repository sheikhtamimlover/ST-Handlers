const os = require('os');

module.exports = {
  config: {
    name: "upt",
    aliases: ["uptime", "status"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Show bot status and system information",
    category: "info",
    guide: "{pn}"
  },

  ST: async function({ message, api }) {
    try {
      const startTime = Date.now();
      
      // Calculate bot uptime
      const botUptime = process.uptime();
      const botUptimeHours = Math.floor(botUptime / 3600);
      const botUptimeMinutes = Math.floor((botUptime % 3600) / 60);
      const botUptimeSeconds = Math.floor(botUptime % 60);
      
      // Calculate system uptime
      const sysUptime = os.uptime();
      const sysUptimeHours = Math.floor(sysUptime / 3600);
      const sysUptimeMinutes = Math.floor((sysUptime % 3600) / 60);
      
      // Memory usage
      const totalMem = os.totalmem() / (1024 * 1024);
      const freeMem = os.freemem() / (1024 * 1024);
      const usedMem = totalMem - freeMem;
      const memPercentage = ((usedMem / totalMem) * 100).toFixed(1);
      
      // Memory status
      let memStatus = "🟢 Optimal";
      if (memPercentage > 80) memStatus = "🔴 Critical";
      else if (memPercentage > 60) memStatus = "🟡 High";
      
      // CPU info
      const cpus = os.cpus();
      const cpuModel = cpus[0]?.model || "unknown";
      const cpuCores = cpus.length;
      const loadAvg = os.loadavg();
      
      // Platform info
      const platform = os.platform();
      const arch = os.arch();
      const nodeVersion = process.version;
      
      // API ping test
      const apiPingStart = Date.now();
      await api.getThreadInfo(message.threadID || "0");
      const apiPing = Date.now() - apiPingStart;
      
      // Bot ping
      const botPing = Date.now() - startTime;
      
      // Ping status
      let apiStatus = "🟢 Excellent";
      if (apiPing > 100) apiStatus = "🟡 Good";
      if (apiPing > 300) apiStatus = "🔴 Slow";
      
      let botStatus = "🟢 Excellent";
      if (botPing > 200) botStatus = "🟡 Good";
      if (botPing > 500) botStatus = "🔴 Slow";
      
      const statusMessage = `╭──────────────────╮
 🤖 ST BOT STATUS 
╰──────────────────╯

📡 Network Performance
├─ API Ping: ${apiPing}ms ${apiStatus}
├─ Bot Ping: ${botPing}ms ${botStatus}
└─ Status: Online & Operational ✅

⏱️ Uptime Statistics
├─ Bot Uptime: ${botUptimeHours}h ${botUptimeMinutes}m ${botUptimeSeconds}s
└─ System Uptime: ${sysUptimeHours}h ${sysUptimeMinutes}m

💾 Memory Usage
├─ Used: ${usedMem.toFixed(1)}MB / ${totalMem.toFixed(1)}MB
├─ Percentage: ${memPercentage}% ${memStatus}
└─ Available: ${freeMem.toFixed(1)}MB

🧠 System Specifications
├─ CPU: ${cpuModel}
├─ Cores: ${cpuCores} cores
├─ Load Average: ${loadAvg[0].toFixed(2)}, ${loadAvg[1].toFixed(2)}, ${loadAvg[2].toFixed(2)}
├─ Platform: ${platform} (${arch})
└─ Node.js: ${nodeVersion}

╭──────────────────╮ 👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑
╰──────────────────╯`;

      return message.reply(statusMessage);
      
    } catch (error) {
      console.error("Uptime command error:", error);
      return message.reply("❌ Error fetching bot status: " + error.message);
    }
  }
};