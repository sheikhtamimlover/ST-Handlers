const os = require("os");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const Canvas = require("canvas");

module.exports = {
  config: {
    name: "dash",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 3,
    role: 0,
    description: "Shows full system dashboard in image",
    category: "system",
    guide: "{pn}"
  },

  ST: async function ({ api, event, message }) {
    try {
      const cpus = os.cpus();
      const cpuModel = cpus[0].model;
      const cpuCores = cpus.length;

      const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const usedMem = (totalMem - freeMem).toFixed(2);
      const memUsage = ((usedMem / totalMem) * 100).toFixed(2);

      let diskTotal = "N/A";
      let diskUsed = "N/A";
      let diskFree = "N/A";
      let diskPercent = "N/A";

      try {
        const disk = execSync("df -h / | awk 'NR==2{print $2, $3, $4, $5}'")
          .toString()
          .trim()
          .split(" ");
        [diskTotal, diskUsed, diskFree, diskPercent] = disk;
      } catch (e) {
        console.log("Disk info not available");
      }

      const uptime = os.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      const width = 1500;
      const height = 900;
      const canvas = Canvas.createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#0d1117";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#ffffff";
      ctx.font = "55px Sans-serif";
      ctx.fillText("System Dashboard", 50, 90);

      ctx.font = "32px Sans-serif";

      ctx.fillStyle = "#58a6ff";
      ctx.fillText("CPU", 50, 160);

      ctx.fillStyle = "#fff";
      ctx.font = "28px Sans-serif";
      ctx.fillText(`Model: ${cpuModel}`, 50, 210);
      ctx.fillText(`Cores: ${cpuCores}`, 50, 250);

      ctx.fillStyle = "#58a6ff";
      ctx.font = "32px Sans-serif";
      ctx.fillText("Memory", 50, 330);

      ctx.font = "28px Sans-serif";
      ctx.fillStyle = "#fff";
      ctx.fillText(`Total: ${totalMem} GB`, 50, 370);
      ctx.fillText(`Free: ${freeMem} GB`, 50, 410);
      ctx.fillText(`Usage: ${memUsage}%`, 50, 450);

      ctx.fillStyle = "#58a6ff";
      ctx.font = "32px Sans-serif";
      ctx.fillText("Disk", 50, 530);

      ctx.fillStyle = "#fff";
      ctx.font = "28px Sans-serif";
      ctx.fillText(`Total: ${diskTotal}`, 50, 570);
      ctx.fillText(`Used: ${diskUsed}`, 50, 610);
      ctx.fillText(`Free: ${diskFree}`, 50, 650);
      ctx.fillText(`Usage: ${diskPercent}`, 50, 690);

      ctx.fillStyle = "#58a6ff";
      ctx.font = "32px Sans-serif";
      ctx.fillText("Runtime & Bot", 900, 160);

      ctx.fillStyle = "#fff";
      ctx.font = "28px Sans-serif";
      ctx.fillText(`OS: ${os.type().toLowerCase()} (${os.release()})`, 900, 210);
      ctx.fillText(`Arch: ${os.arch()}`, 900, 250);
      ctx.fillText(`Hostname: ${os.hostname()}`, 900, 290);
      ctx.fillText(
        `Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`,
        900,
        330
      );

      ctx.fillStyle = "#58a6ff";
      ctx.font = "32px Sans-serif";
      ctx.fillText("Bot Runtime", 900, 400);

      const nodeVersion = process.version;
      ctx.fillStyle = "#fff";
      ctx.font = "28px Sans-serif";
      ctx.fillText(`Node Version: ${nodeVersion}`, 900, 450);

      ctx.fillStyle = "#58a6ff";
      ctx.font = "28px Sans-serif";
      ctx.fillText("Command Analytics", 900, 520);

      const commands = [
        ["cmd1", 200],
        ["help", 180],
        ["uptime", 160],
        ["ping", 140],
        ["menu", 120]
      ];

      let x = 900;
      const baseY = 750;

      commands.forEach(([name, value]) => {
        const barHeight = value;

        ctx.fillStyle = "#ff4fd8";
        ctx.fillRect(x, baseY - barHeight, 35, barHeight);

        ctx.fillStyle = "#fff";
        ctx.font = "18px Sans-serif";
        ctx.fillText(name, x, baseY + 20);

        x += 55;
      });

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const filePath = path.join(cacheDir, `dash-${Date.now()}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer());

      await message.reply({
        attachment: fs.createReadStream(filePath)
      });

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

    } catch (e) {
      return message.reply("❌ Error creating dashboard: " + e.message);
    }
  }
};