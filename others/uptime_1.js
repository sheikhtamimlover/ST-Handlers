const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

if (!global.botStart) global.botStart = Date.now();

module.exports = {
  config: {
    name: "uptime",
    version: "5.1",
    author: "ST | Sheikh Tamim",
    description: "Bot Uptime Dashboard",
    guide: "{p}uptime",
    category: "system",
    countDown: 5,
    role: 0
  },

  ST: async function({ api, event, usersData, threadsData, message }) {
    try {
      const uptimeSeconds = os.uptime();
      const sDays = Math.floor(uptimeSeconds / 86400);
      const sHours = Math.floor((uptimeSeconds % 86400) / 3600);
      const sMinutes = Math.floor((uptimeSeconds % 3600) / 60);
      const sSeconds = Math.floor(uptimeSeconds % 60);
      const serverUptimeStr = `${sDays}d ${sHours}h ${sMinutes}m ${sSeconds}s`;

      const botSeconds = Math.floor((Date.now() - global.botStart) / 1000);
      const bDays = Math.floor(botSeconds / 86400);
      const bHours = Math.floor((botSeconds % 86400) / 3600);
      const bMinutes = Math.floor((botSeconds % 3600) / 60);
      const bSeconds = Math.floor(botSeconds % 60);
      const botUptimeStr = `${bDays}d ${bHours}h ${bMinutes}m ${bSeconds}s`;

      const cpus = os.cpus();
      const cpuModel = cpus?.[0]?.model || "Unknown CPU";
      const cpuCores = cpus?.length || 1;
      const load = os.loadavg();
      const load1 = (load[0] || 0).toFixed(2);
      const loadPercent = Math.min((parseFloat(load1) / cpuCores) * 100, 100);

      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memPercent = ((usedMem / totalMem) * 100).toFixed(1);
      const totalMB = (totalMem / 1024 / 1024).toFixed(1);
      const usedMB = (usedMem / 1024 / 1024).toFixed(1);

      const platform = `${os.platform()} (${os.arch()})`;
      const nodeVersion = process.version;

      let totalUsers = "N/A", totalThreads = "N/A";
      try {
        totalUsers = (await usersData?.getAll())?.length ?? "N/A";
        totalThreads = (await threadsData?.getAll())?.length ?? "N/A";
      } catch {}

      let diskInfo = "N/A", diskPercent = 0;
      try {
        const { stdout } = await exec("df -k / | tail -1");
        const parts = stdout.trim().split(/\s+/);
        if (parts.length >= 5) {
          const usedGB = (parseInt(parts[2]) / 1024 / 1024).toFixed(1);
          const totalGB = (parseInt(parts[1]) / 1024 / 1024).toFixed(1);
          diskPercent = parseInt(parts[4].replace('%','')) || 0;
          diskInfo = `${usedGB}GB / ${totalGB}GB (${diskPercent}%)`;
        }
      } catch {}

      const width = 900, height = 600;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#0f2027");
      grad.addColorStop(0.5, "#203a43");
      grad.addColorStop(1, "#2c5364");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      const pad = 25;
      const cardX = pad, cardY = pad, cardW = width - pad * 2, cardH = height - pad * 2;
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 20);
      ctx.fill();

      ctx.fillStyle = "#00ffe7";
      ctx.font = "700 32px Sans";
      ctx.fillText("📊 UPTIME DASHBOARD", cardX + 30, cardY + 60);

      let lineY = cardY + 120;
      const lineGap = 35;
      const printStat = (label, value) => {
        ctx.font = "600 20px Sans";
        ctx.fillStyle = "#ffd700";
        ctx.fillText(label, cardX + 30, lineY);
        ctx.font = "500 18px Sans";
        ctx.fillStyle = "#fff";
        ctx.fillText(value, cardX + 250, lineY);
        lineY += lineGap;
      };

      printStat("🤖 Bot Uptime:", botUptimeStr);
      printStat("🖥️ Server Uptime:", serverUptimeStr);
      printStat("🧠 CPU:", `${cpuModel} (${cpuCores} cores)`);
      printStat("📈 Load:", `${load1} (${loadPercent.toFixed(1)}%)`);
      printStat("💾 RAM:", `${usedMB} MB / ${totalMB} MB (${memPercent}%)`);
      printStat("💽 Disk:", diskInfo);
      printStat("👥 Users:", totalUsers);
      printStat("💬 Threads:", totalThreads);
      printStat("⚙️ System:", platform);
      printStat("🔗 Node.js:", nodeVersion);

      const drawCircle = (cx, cy, radius, percent, color, label) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 15;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, radius, -Math.PI/2, -Math.PI/2 + 2 * Math.PI * (percent/100));
        ctx.strokeStyle = color;
        ctx.lineWidth = 15;
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "600 18px Sans";
        ctx.textAlign = "center";
        ctx.fillText(`${percent.toFixed(0)}%`, cx, cy);
        ctx.font = "500 14px Sans";
        ctx.fillText(label, cx, cy + 20);
      };

      const circleY = cardY + cardH - 100;
      drawCircle(cardX + 150, circleY, 50, parseFloat(memPercent), "#ff6b6b", "RAM");
      drawCircle(cardX + 350, circleY, 50, loadPercent, "#4ecdc4", "CPU");
      drawCircle(cardX + 550, circleY, 50, diskPercent, "#ffe66d", "DISK");

      const buffer = canvas.toBuffer("image/png");
      const tempPath = path.join(os.tmpdir(), `uptime_${Date.now()}.png`);
      await fs.writeFile(tempPath, buffer);

      await message.reply({
        body: "📊 System Dashboard Generated",
        attachment: fs.createReadStream(tempPath)
      });

      await fs.unlink(tempPath);

    } catch (error) {
      await message.reply(`❌ Error: ${error.message}`);
    }
  }
};