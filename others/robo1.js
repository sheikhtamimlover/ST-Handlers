const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports = {
  config: {
    name: "robo1",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "Hourly bot uptime report system",
    category: "system",
    guide: "{pn} on/off - Enable/disable hourly reports\n{pn} info - Show report status\n{pn} now - Send report immediately"
  },

  onLoad: function () {
    const configFile = path.join(__dirname, "..", "..", "robo1_uptime_config.json");
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify({
        enabled: true,
        logThread: "886960563901648",
        lastReport: 0
      }, null, 2));
    }

    const uptimeInterval = setInterval(async () => {
      try {
        const config = JSON.parse(fs.readFileSync(configFile, "utf-8"));
        if (!config.enabled) return;

        const now = Date.now();
        const oneHour = 60 * 60 * 1000;

        if (now - config.lastReport >= oneHour) {
          const uptime = process.uptime();
          const days = Math.floor(uptime / 86400);
          const hours = Math.floor((uptime % 86400) / 3600);
          const minutes = Math.floor((uptime % 3600) / 60);
          const seconds = Math.floor(uptime % 60);

          const totalMem = os.totalmem() / (1024 * 1024);
          const freeMem = os.freemem() / (1024 * 1024);
          const usedMem = totalMem - freeMem;
          const memPercentage = ((usedMem / totalMem) * 100).toFixed(1);

          const cpuUsage = process.cpuUsage();
          const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000).toFixed(2);

          const dhakaTime = new Date().toLocaleString('en-US', { 
            timeZone: 'Asia/Dhaka',
            dateStyle: 'full',
            timeStyle: 'long'
          });

          let uptimeStr = "";
          if (days > 0) uptimeStr += `${days}d `;
          if (hours > 0) uptimeStr += `${hours}h `;
          uptimeStr += `${minutes}m ${seconds}s`;

          const uptimeMsg = `╭─────────────────⭓
│ 🤖 HOURLY BOT REPORT
├─────────────────⭓
│ ⏱️ Uptime: ${uptimeStr}
│ 💾 Memory: ${memPercentage}%
│ 📊 Used: ${usedMem.toFixed(0)}MB / ${totalMem.toFixed(0)}MB
│ 🔄 CPU Time: ${cpuPercent}s
│ 🖥️ Platform: ${os.platform()}
│ 📡 Node: ${process.version}
├─────────────────⭓
│ ✅ Status: Online & Running
│ 🔋 Health: Operational
├─────────────────⭓
│ 🕐 Dhaka Time:
│ ${dhakaTime}
╰─────────────────⭓`;

          if (global.api) {
            await global.api.sendMessage(uptimeMsg, config.logThread);
          }

          config.lastReport = now;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
        }
      } catch (error) {
        console.error("Robo1 uptime report error:", error);
      }
    }, 60000);

    if (global.robo1UptimeInterval) {
      clearInterval(global.robo1UptimeInterval);
    }
    global.robo1UptimeInterval = uptimeInterval;
  },

  ST: async function ({ message, args, event, api }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return message.reply("⛔ Only the owner can use this command!");
    }

    const configFile = path.join(__dirname, "..", "..", "robo1_uptime_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return {
          enabled: true,
          logThread: "886960563901648",
          lastReport: 0
        };
      } catch {
        return {
          enabled: true,
          logThread: "886960563901648",
          lastReport: 0
        };
      }
    }

    function saveConfig(data) {
      try {
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving robo1 config:", error);
      }
    }

    if (args[0] === "on" || args[0] === "enable") {
      const config = loadConfig();
      config.enabled = true;
      saveConfig(config);

      return message.reply("✅ Hourly Uptime Report ENABLED!\n\n📊 Reports will be sent every hour to the log thread.");
    }

    if (args[0] === "off" || args[0] === "disable") {
      const config = loadConfig();
      config.enabled = false;
      saveConfig(config);

      return message.reply("❌ Hourly Uptime Report DISABLED!");
    }

    if (args[0] === "now" || args[0] === "send") {
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const totalMem = os.totalmem() / (1024 * 1024);
      const freeMem = os.freemem() / (1024 * 1024);
      const usedMem = totalMem - freeMem;
      const memPercentage = ((usedMem / totalMem) * 100).toFixed(1);

      const cpuUsage = process.cpuUsage();
      const cpuPercent = ((cpuUsage.user + cpuUsage.system) / 1000000).toFixed(2);

      const dhakaTime = new Date().toLocaleString('en-US', { 
        timeZone: 'Asia/Dhaka',
        dateStyle: 'full',
        timeStyle: 'long'
      });

      let uptimeStr = "";
      if (days > 0) uptimeStr += `${days}d `;
      if (hours > 0) uptimeStr += `${hours}h `;
      uptimeStr += `${minutes}m ${seconds}s`;

      const config = loadConfig();

      const uptimeMsg = `╭─────────────────⭓
│ 🤖 MANUAL BOT REPORT
├─────────────────⭓
│ ⏱️ Uptime: ${uptimeStr}
│ 💾 Memory: ${memPercentage}%
│ 📊 Used: ${usedMem.toFixed(0)}MB / ${totalMem.toFixed(0)}MB
│ 🔄 CPU Time: ${cpuPercent}s
│ 🖥️ Platform: ${os.platform()}
│ 📡 Node: ${process.version}
├─────────────────⭓
│ ✅ Status: Online & Running
│ 🔋 Health: Operational
├─────────────────⭓
│ 🕐 Dhaka Time:
│ ${dhakaTime}
╰─────────────────⭓`;

      await api.sendMessage(uptimeMsg, config.logThread);

      return message.reply("✅ Uptime report sent to log thread!");
    }

    if (args[0] === "info" || args[0] === "status") {
      const config = loadConfig();
      const nextReport = config.lastReport > 0 
        ? new Date(config.lastReport + 3600000).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })
        : "Not sent yet";

      return message.reply(
        `📊 HOURLY UPTIME REPORT STATUS\n\n` +
        `🔘 Status: ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n` +
        `📌 Log Thread: ${config.logThread}\n` +
        `⏰ Last Report: ${config.lastReport > 0 ? new Date(config.lastReport).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }) : 'Never'}\n` +
        `🕐 Next Report: ${config.enabled ? nextReport : 'Disabled'}\n\n` +
        `💡 Commands:\n` +
        `• robo1 on/off\n` +
        `• robo1 now - Send report now\n` +
        `• robo1 info`
      );
    }

    return message.reply(
      `📋 HOURLY UPTIME REPORT SYSTEM\n\n` +
      `💡 Commands:\n` +
      `• robo1 on/off\n` +
      `• robo1 now - Send report now\n` +
      `• robo1 info\n\n` +
      `📊 Status: ${loadConfig().enabled ? 'Enabled' : 'Disabled'}`
    );
  }
};