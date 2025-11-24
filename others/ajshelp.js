const fs = require('fs');
const path = require('path');
const os = require('os');
const { createCanvas } = require('canvas');

module.exports = {
  config: {
    name: "ajshelp",
    aliases: ["ajhelp", "ajshlp", "ahelp"],
    version: "5.4.0",
    role: 0,
    countDown: 0,
    author: "ST | Sheikh Tamim",
    description: "Paginated command help + per-command help with colorful canvas",
    category: "help"
  },

  ST: async ({ api, event, args }) => {
    const cmdsFolderPath = __dirname;
    const files = fs.readdirSync(cmdsFolderPath).filter(f => f.endsWith('.js'));

    const categoryEmojis = {
      'text': '✨', 'tools': '🧰', 'utility': '🧩', 'game': '🎮',
      'system': '⚙️', 'info': '📘', 'image': '🖼️', 'owner': '👑',
      'admin': '🛠️', 'music': '🎵', 'ai': '🤖', 'aichat': '📦',
      'google': '🌍', 'islamic': '🕌', 'config': '⚙️', 'chat': '💭',
      'fun': '🎉', 'media': '🖥️', 'moderation': '🚨', 'rank': '📈',
      'anime': '🌸', 'nsfw': '📦', 'economy': '💰', 'box chat': '📦'
    };

    const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

    const allCommands = files.map(f => {
      try { return require(path.join(cmdsFolderPath, f)).config; }
      catch { return null; }
    }).filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));

    const wrapText = (ctx, text, maxWidth) => {
      const lines = [];
      const paragraphs = text.split('\n');
      for (let para of paragraphs) {
        let line = '';
        const words = para.split(' ');
        for (const word of words) {
          const testLine = line + word + ' ';
          const { width } = ctx.measureText(testLine);
          if (width > maxWidth && line) {
            lines.push(line.trim());
            line = word + ' ';
          } else line = testLine;
        }
        if (line) lines.push(line.trim());
        lines.push('');
      }
      return lines;
    };

    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
      return color;
    };

    const createImage = async (lines) => {
      const width = 1500;
      const fontSize = 42;
      const lineHeight = fontSize + 20;
      const padding = 60;

      const tempCanvas = createCanvas(width, 100);
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.font = `${fontSize}px Sans-serif`;

      let wrappedLines = [];
      for (const line of lines) wrappedLines.push(...wrapText(tempCtx, line, width - padding * 2));

      const height = padding * 2 + wrappedLines.length * lineHeight;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      const color1 = getRandomColor();
      const color2 = getRandomColor();
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 200; i++) {
        ctx.fillStyle = getRandomColor();
        ctx.globalAlpha = 0.05;
        ctx.beginPath();
        ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 15, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#ffffff';
      ctx.font = `${fontSize}px Sans-serif`;
      let y = padding + fontSize;
      for (const line of wrappedLines) {
        ctx.fillText(line, padding, y);
        y += lineHeight;
      }

      const tempPath = path.join(os.tmpdir(), `help_${Date.now()}.png`);
      fs.writeFileSync(tempPath, canvas.toBuffer('image/png'));
      return tempPath;
    };

    try {
      // === Per-command help ===
      if (args[0] && isNaN(args[0])) {
        const commandName = args[0].toLowerCase();
        const cmd = allCommands.find(c =>
          c.name.toLowerCase() === commandName ||
          (c.aliases && c.aliases.map(a => a.toLowerCase()).includes(commandName))
        );
        if (!cmd) return api.sendMessage(`❌ Command not found: ${args[0]}`, event.threadID, event.messageID);

        let usageText = "No guide provided";
        if (cmd.guide) {
          if (typeof cmd.guide === 'string') usageText = cmd.guide;
          else if (typeof cmd.guide === 'object') usageText = Object.entries(cmd.guide).map(([k, v]) => `${k}: ${v}`).join('\n');
        }

        const aliasesText = cmd.aliases && cmd.aliases.length ? cmd.aliases.join(', ') : "None";

        // Image 1: Usage
        const img1Lines = [`✨ COMMAND USAGE ✨`, '________________________', usageText];
        const img1 = await createImage(img1Lines);

        // Image 2: Info
        const img2Lines = [
          `📘 COMMAND INFO 📘`,
          '________________________',
          `Name: ${cmd.name}`,
          `Version: ${cmd.version || 'N/A'}`,
          `Author: ${cmd.author || 'Unknown'}`,
          `Category: ${cmd.category || 'Uncategorized'}`,
          `Role: ${cmd.role || 0}`,
          `Aliases: ${aliasesText}`,
          `👑 Owner: AYESHA QUEEN 👑`
        ];
        const img2 = await createImage(img2Lines);

        await api.sendMessage({ attachment: fs.createReadStream(img1) }, event.threadID);
        fs.unlinkSync(img1);
        await api.sendMessage({ attachment: fs.createReadStream(img2) }, event.threadID);
        fs.unlinkSync(img2);
        return;
      }

      // === Paginated category help ===
      const categories = {};
      for (const cmd of allCommands) {
        const key = cmd.category || "Uncategorized";
        if (!categories[key]) categories[key] = [];
        categories[key].push(cmd.name);
      }

      const perPage = 50;
      const pages = [];
      let currentPage = [];
      let count = 0;

      for (const [catName, cmds] of Object.entries(categories)) {
        const block = [`${categoryEmojis[normalize(catName)] || '📦'}『 ${catName.toUpperCase()} 』`, ...cmds.map(c => `⚡ ${c}`), '________________________'];

        if (count + cmds.length > perPage && currentPage.length > 0) {
          pages.push(currentPage);
          currentPage = [];
          count = 0;
        }

        currentPage.push(...block);
        count += cmds.length;
      }
      if (currentPage.length > 0) pages.push(currentPage);

      let pageNum = 1;
      if (args[0] && !isNaN(args[0])) pageNum = parseInt(args[0]);
      if (pageNum < 1) pageNum = 1;
      if (pageNum > pages.length) pageNum = pages.length;

      const header = [`📌 𝐂𝐚𝐭 𝐁𝐨𝐭 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 — 𝐏𝐚𝐠𝐞 ${pageNum}/${pages.length}`, '________________________'];
      const lines = [...header, ...pages[pageNum - 1]];
      lines.push(`Only For Ayesha Queen`);
      lines.push(`Not For You`);
      lines.push(`👑 Owner: AYESHA QUEEN 👑`);

      const img = await createImage(lines);
      await api.sendMessage({ attachment: fs.createReadStream(img) }, event.threadID);
      fs.unlinkSync(img);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Error generating help images.", event.threadID, event.messageID);
    }
  }
};
