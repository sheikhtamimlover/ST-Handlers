const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');
const Canvas = require('canvas');

module.exports.config = {
  name: "dash",
  version: "1.0.1",
  credits: "VIP HACK | AYESHA QUEEN",
  description: "System dashboard with emoji icons",
  commandCategory: "system",
  cooldowns: 3
};

function uptimeFormat(sec) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return `${d}d • ${h}h • ${m}m • ${s}s`;
}

module.exports.onStart = async ({ api, event }) => {
  try {

    // SYSTEM INFO
    const cpu = os.cpus();
    const cpuModel = cpu[0].model;
    const cpuCores = cpu.length;

    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);
    const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

    // DISK
    let diskTotal = "N/A", diskUsed = "N/A", diskFree = "N/A", diskPercent = "N/A";
    try {
      const df = execSync("df -h /home/container || df -h /").toString().trim().split("\n")[1].split(/\s+/);
      diskTotal = df[1];
      diskUsed = df[2];
      diskFree = df[3];
      diskPercent = df[4];
    } catch (e) {}

    const hostUptime = uptimeFormat(os.uptime());
    const botUptime = uptimeFormat(process.uptime());

    // Canvas
    const W = 1500, H = 900;
    const canvas = Canvas.createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#fff";
    ctx.font = "55px Sans-serif";
    ctx.fillText("System Dashboard", 50, 90);

    const leftX = 50;
    let y = 150;
    ctx.font = "33px Sans-serif";
    ctx.fillStyle = "#2fb0ff";

    // CPU
    ctx.fillText("🧠 CPU", leftX, y);
    ctx.fillStyle = "#fff";
    ctx.font = "26px Sans-serif";
    ctx.fillText(`Model: ${cpuModel}`, leftX, y + 50);
    ctx.fillText(`Cores: ${cpuCores}`, leftX, y + 90);

    // Memory
    y += 160;
    ctx.fillStyle = "#2fb0ff";
    ctx.font = "33px Sans-serif";
    ctx.fillText("💾 Memory", leftX, y);
    ctx.fillStyle = "#fff";
    ctx.font = "26px Sans-serif";
    ctx.fillText(`Total: ${totalMem} GB`, leftX, y + 50);
    ctx.fillText(`Used: ${usedMem} GB`, leftX, y + 90);
    ctx.fillText(`Free: ${freeMem} GB`, leftX, y + 130);
    ctx.fillText(`Usage: ${memPercent}%`, leftX, y + 170);

    // Disk
    y += 230;
    ctx.fillStyle = "#2fb0ff";
    ctx.font = "33px Sans-serif";
    ctx.fillText("🗄️ Disk", leftX, y);
    ctx.fillStyle = "#fff";
    ctx.font = "26px Sans-serif";
    ctx.fillText(`Total: ${diskTotal}`, leftX, y + 50);
    ctx.fillText(`Used: ${diskUsed}`, leftX, y + 90);
    ctx.fillText(`Free: ${diskFree}`, leftX, y + 130);
    ctx.fillText(`Usage: ${diskPercent}`, leftX, y + 170);

    // Right side
    const rx = 900;
    let ry = 150;

    ctx.fillStyle = "#2fb0ff";
    ctx.font = "33px Sans-serif";
    ctx.fillText("🖥️ Runtime & OS", rx, ry);

    ctx.fillStyle = "#fff";
    ctx.font = "26px Sans-serif";
    ctx.fillText(`OS: ${os.type()} (${os.release()})`, rx, ry + 50);
    ctx.fillText(`Arch: ${os.arch()}`, rx, ry + 90);
    ctx.fillText(`Hostname: ${os.hostname()}`, rx, ry + 130);
    ctx.fillText(`Uptime: ${hostUptime}`, rx, ry + 170);

    // Bot runtime
    ry += 230;
    ctx.fillStyle = "#2fb0ff";
    ctx.font = "33px Sans-serif";
    ctx.fillText("🤖 Bot Runtime", rx, ry);

    ctx.fillStyle = "#fff";
    ctx.font = "26px Sans-serif";
    ctx.fillText(`Process Uptime: ${botUptime}`, rx, ry + 50);
    ctx.fillText(`Node Version: ${process.version}`, rx, ry + 90);

    // Bar chart sample
    ctx.fillStyle = "#2fb0ff";
    ctx.font = "33px Sans-serif";
    ctx.fillText("📊 Command Analytics", rx, 580);

    const commands = [
      ["cmd", 327],
      ["uptime", 298],
      ["bcm", 260],
      ["adm", 242],
      ["menu", 220],
      ["play", 216],
      ["help", 206],
      ["shell", 198],
    ];

    const chartX = rx;
    const chartY = 620;
    const barWidth = 40;
    const gap = 20;
    let bx = chartX;

    const maxVal = 327;
    const chartHeight = 220;

    for (const [name, val] of commands) {
      const h = (val / maxVal) * chartHeight;

      ctx.fillStyle = "#ff4fd8";
      ctx.fillRect(bx, chartY + (chartHeight - h), barWidth, h);

      ctx.fillStyle = "#fff";
      ctx.font = "20px Sans-serif";
      ctx.fillText(val, bx, chartY + (chartHeight - h) - 10);

      ctx.font = "18px Sans-serif";
      ctx.fillText(name, bx, chartY + chartHeight + 25);

      bx += barWidth + gap;
    }

    // Save
    const out = `/tmp/dash-emoji-${Date.now()}.png`;
    fs.writeFileSync(out, canvas.toBuffer());

    api.sendMessage(
      { attachment: fs.createReadStream(out) },
      event.threadID,
      () => fs.unlinkSync(out),
      event.messageID
    );

  } catch (err) {
    api.sendMessage("❌ Error generating dashboard: " + err.message, event.threadID);
  }
};