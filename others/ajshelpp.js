const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "ajshelpp",
    aliases: ["ajhelpp", "ajshlpp", "ahelpp"],
    version: "3.1.0",
    role: 0,
    countDown: 0,
    author: "ST | Sheikh Tamim",
    description: "Shows command list & details",
    category: "help"
  },

  ST: async ({ api, event, args }) => {
    const cmdsFolderPath = __dirname;
    const files = fs.readdirSync(cmdsFolderPath).filter(f => f.endsWith('.js'));

    const sendMessage = async (msg) => {
      try {
        return await api.sendMessage(msg, event.threadID, event.messageID);
      } catch (e) {
        console.error(e);
      }
    };

    const getCategories = () => {
      const categories = {};

      const normalize = (name) => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9 ]/g, "")
          .trim();
      };

      for (const file of files) {
        try {
          const cmd = require(path.join(cmdsFolderPath, file));
          let category = cmd.config.category || "uncategorized";

          const key = normalize(category);

          if (!categories[key]) {
            categories[key] = {
              original: category,
              commands: []
            };
          }

          categories[key].commands.push(cmd.config);

        } catch { }
      }

      return categories;
    };

    const categoryEmojis = {
      'text': '✨', 'tools': '🧰', 'utility': '🧩', 'game': '🎮',
      'system': '⚙️', 'info': '📘', 'image': '🖼️', 'owner': '👑',
      'admin': '🛠️', 'music': '🎵', 'ai': '🤖', 'aichat': '🤖',
      'google': '🌍', 'islamic': '🕌', 'config': '⚙️', 'chat': '💭',
      'fun': '🎉', 'media': '🖥️', 'moderation': '🚨', 'rank': '📈',
      'anime': '🌸', 'nsfw': '📦', 'economy': '💰'
    };

    try {

      if (args[0] && args[0] !== "all" && !args[0].match(/^\d+$/)) {
        const name = args[0].toLowerCase();

        const command = files.map(f => {
          try { return require(path.join(cmdsFolderPath, f)); } catch { return null; }
        }).find(cmd =>
          cmd && (
            cmd.config.name.toLowerCase() === name ||
            (cmd.config.aliases && cmd.config.aliases.includes(name))
          )
        );

        if (!command)
          return sendMessage(`❌ Command not found: ${name}`);

        let msg = `┏━━━━━━━━━━━━━━━━━━━┓
 ✨ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 ✨
┣━━━━━━━━━━━━━━━━━━━┫
┃ ⚡ Name: ${command.config.name}
┃ 📌 Version: ${command.config.version || 'N/A'}
┃ 👤 Author: ${command.config.author || 'Unknown'}
┃ 📂 Category: ${command.config.category || 'uncategorized'}
┣━━━━━━━━━━━━━━━━━━━┫
┃ 📚 Usage:
┃ ${command.config.guide || 'No guide'}
┗━━━━━━━━━━━━━━━━━━━┛
👑 Owner: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑`;

        return sendMessage(msg);
      }

      const categories = getCategories();
      const categoryKeys = Object.keys(categories).sort();

      if (!args[0]) {
        let msg = `🌺 ⌬⌬ 𝐂𝐚𝐭 𝐁𝐨𝐭 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬 ⌬⌬ 🌺
________________________

`;

        categoryKeys.forEach(key => {
          const emoji = categoryEmojis[key] || '📦';
          const name = categories[key].original.toUpperCase();
          msg += `${emoji} ${name}\n`;
        });

        msg += `
________________________

Use:
➡ Only Ayesha Know And Use This Command

👑 Owner: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑`;

        return sendMessage(msg);
      }

      if (args[0] === "all") {

        const page = parseInt(args[1]) || 1;
        const limit = 100;

        const pages = [];
        let currentPage = [];
        let currentCount = 0;

        categoryKeys.forEach(key => {
          const cmds = categories[key].commands.sort((a, b) => a.name.localeCompare(b.name));
          const count = cmds.length;

          if (currentCount + count <= limit || currentCount === 0) {
            currentPage.push({ key, cmds });
            currentCount += count;
          } else {
            pages.push(currentPage);
            currentPage = [{ key, cmds }];
            currentCount = count;
          }
        });

        if (currentPage.length) pages.push(currentPage);

        const totalPages = pages.length;

        if (page > totalPages)
          return sendMessage(`❌ Invalid page! Total pages: ${totalPages}`);

        const selected = pages[page - 1];

        let msg = `📌 𝐂𝐚𝐭 𝐁𝐨𝐭 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 — 𝐏𝐚𝐠𝐞 ${page}/${totalPages}
________________________

`;

        selected.forEach(section => {
          const emoji = categoryEmojis[section.key] || "📦";
          const name = categories[section.key].original.toUpperCase();
          msg += `${emoji}『 ${name} 』\n`;
          section.cmds.forEach(cmd => {
            msg += `⚡ ${cmd.name}\n`;
          });
          msg += `________________________\n\n`;
        });

        msg += `Use:
➡ Only Ayesha Know And Use This Command

👑 Owner: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑`;

        return sendMessage(msg);
      }

    } catch (err) {
      console.error(err);
      return sendMessage("❌ Error generating help message.");
    }
  }
};
