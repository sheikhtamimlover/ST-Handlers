const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "help",
    version: "2.4.65",
    role: 0,
    countDown: 0,
    author: "ST | Sheikh Tamim + Modified by Alamin",
    description: "Displays all available commands and their categories, with simple search suggestions.",
    category: "help"
  },

  ST: async ({ api, event, args, threadsData, prefix }) => {
    const cmdsFolderPath = path.join(__dirname, ".");
    const files = fs.readdirSync(cmdsFolderPath).filter(file => file.endsWith(".js"));

    const sendMessage = async (message, threadID, messageID = null) => {
      try {
        return await api.sendMessage(message, threadID, messageID);
      } catch (error) {
        console.error("Error sending message:", error);
      }
    };

    // 🗂️ Get all categories, clean duplicates, and remove "ST_" prefixes
    const getCategories = () => {
      const categories = {};
      for (const file of files) {
        try {
          const command = require(path.join(cmdsFolderPath, file));
          if (!command.config) continue;
          let categoryName = command.config.category || "Uncategorized";

          // remove "ST_", "ST-" and normalize
          categoryName = categoryName.replace(/^ST[_-]/i, "").trim();
          categoryName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();

          if (!categories[categoryName]) categories[categoryName] = [];
          categories[categoryName].push(command.config);
        } catch {}
      }
      return categories;
    };

    // 🧩 Detect Prefix
    let threadPrefix = prefix || global.GoatBot.config.prefix;
    if (threadsData && threadsData.get) {
      const data = await threadsData.get(event.threadID);
      if (data && data.prefix) threadPrefix = data.prefix;
    }

    try {
      // 🔍 SEARCH MODE
      if (args[0] && !args[0].match(/^\d+$/)) {
        const commandName = args[0].toLowerCase();

        const allCommands = files
          .map(file => {
            try {
              return require(path.join(cmdsFolderPath, file));
            } catch {
              return null;
            }
          })
          .filter(cmd => cmd && cmd.config);

        const command = allCommands.find(
          cmd =>
            cmd.config.name.toLowerCase() === commandName ||
            (cmd.config.aliases && cmd.config.aliases.includes(commandName))
        );

        if (command) {
          const c = command.config;
          let commandDetails = `━━━━━━━━━━━━━━\n`;
          commandDetails += `⚙️ 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 𝘿𝙀𝙏𝘼𝙄𝙇𝙎\n`;
          commandDetails += `╭─╼━━━━━━━━╾─╮\n`;
          commandDetails += `│ ⚡ Name: ${c.name}\n`;
          commandDetails += `│ 📝 Version: ${c.version || "N/A"}\n`;
          commandDetails += `│ 👤 Author: ${c.author || "Unknown"}\n`;
          commandDetails += `│ 🔐 Role: ${c.role ?? "N/A"}\n`;
          commandDetails += `│ 📂 Category: ${c.category || "Uncategorized"}\n`;
          commandDetails += `│ 💎 Premium: ${c.premium ? "✅ Required" : "❌ Not Required"}\n`;
          commandDetails += `│ 🔧 Use Prefix: ${
            c.usePrefix !== undefined ? (c.usePrefix ? "✅ Required" : "❌ Not Required") : "⚙️ Global Setting"
          }\n`;
          commandDetails += `│ ⏱️ Cooldown: ${c.countDown || 0}s\n`;
          if (c.aliases && c.aliases.length > 0)
            commandDetails += `│ 🔄 Aliases: ${c.aliases.join(", ")}\n`;
          commandDetails += `╰─━━━━━━━━━╾─╯\n`;
          commandDetails += `📋 Description:\n${c.description || "No description"}\n`;
          commandDetails += `📚 Usage: ${
            c.guide
              ? typeof c.guide === "string"
                ? c.guide.replace(/{pn}/g, `${threadPrefix}${c.name}`)
                : c.guide.en?.replace(/{pn}/g, `${threadPrefix}${c.name}`) || "No guide"
              : "No guide"
          }\n`;
          commandDetails += `━━━━━━━━━━━━━━\n💫 ST_BOT Command Info`;
          return sendMessage(commandDetails, event.threadID);
        } else {
          const allCommandsList = allCommands.map(cmd => cmd.config.name.toLowerCase());
          const similar = allCommandsList.filter(n => n.includes(commandName)).slice(0, 5);
          if (similar.length > 0) {
            return sendMessage(
              `❌ No exact command found for "${commandName}".\n\n🤔 Did you mean:\n${similar
                .map(s => `• ${s}`)
                .join("\n")}`,
              event.threadID
            );
          } else {
            return sendMessage(`❌ No command found named "${commandName}".`, event.threadID);
          }
        }
      }

      // 🧭 SHOW ALL CATEGORIES (with BIG PAGE SYSTEM)
      const categories = getCategories();
      const categoryNames = Object.keys(categories).sort();

      // ⬆️ SHOW MORE ITEMS PER PAGE
      const itemsPerPage = 10;
      const totalPages = Math.ceil(categoryNames.length / itemsPerPage);
      let currentPage = parseInt(args[0]) || 1;
      if (currentPage < 1) currentPage = 1;
      if (currentPage > totalPages) currentPage = totalPages;

      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      const selectedCategories = categoryNames.slice(startIdx, endIdx);

      let helpMessage = "━━━━━━━━━━━━━━\n";
      helpMessage += `📋 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 (Page ${currentPage}/${totalPages}):\n\n`;

      const emojis = {
        admin: "🛡️",
        ai: "🤖",
        "ai image": "🖼️",
        "ai image edit": "🎨",
        anime: "😺",
        "box chat": "🗃️",
        chat: "💬",
        config: "⚙️",
        "contacts admin": "📞",
        custom: "✨",
        developer: "👨‍💻",
        economy: "💰",
        fun: "😜",
        game: "🎮",
        "group chat": "👥",
        image: "🖼️",
        "image generator": "🎨",
        info: "ℹ️",
        information: "📰",
        love: "❤️",
        media: "🎞️",
        music: "🎵",
        owner: "👑",
        rank: "🏆",
        software: "💻",
        system: "⚙️",
        tools: "🛠️",
        utility: "🧰",
        wiki: "📚",
        help: "❓"
      };

      let categoryIndex = startIdx;
      selectedCategories.forEach(cat => {
        categoryIndex++;
        const emoji = emojis[cat.toLowerCase()] || "📂";
        const cmds = categories[cat].map(c => `│ ⌯ ${c.name}`).join("\n");
        helpMessage += `╭─╼━━━━━━━━╾─╮\n`;
        helpMessage += `│ ${categoryIndex}. ${emoji} | ${cat}\n`;
        helpMessage += `${cmds}\n`;
        helpMessage += `╰─━━━━━━━━━╾─╯\n`;
      });

      helpMessage += "━━━━━━━━━━━━━━\n";
      helpMessage += `🔢 Total Commands: ${files.length}\n`;
      helpMessage += `⚡ Prefix: ${threadPrefix}\n`;
      helpMessage += `👑 Role: All Users\n`;
      helpMessage += `👤 Owner: 𝐌𝐨𝐡𝐚𝐦𝐦𝐚𝐝 𝐀𝐥𝐚𝐦𝐢𝐧\n`;
      helpMessage += `💡 Reply with category number to view details\n`;
      helpMessage += `📖 Use: ${threadPrefix}help [page] or ${threadPrefix}help [command]\n`;
      helpMessage += "━━━━━━━━━━━━━━";

      const sentMessage = await sendMessage(helpMessage, event.threadID);

      if (sentMessage) {
        global.GoatBot.onReply.set(sentMessage.messageID, {
          commandName: "help",
          messageID: sentMessage.messageID,
          author: event.senderID,
          stage: 1,
          categories: categoryNames,
          categoriesData: categories,
          currentPage: currentPage,
          startIdx: startIdx
        });
      }
    } catch (err) {
      console.error("Error generating help message:", err);
      sendMessage("⚠️ Failed to generate help list.", event.threadID);
    }
  },

  onReply: async ({ api, event, Reply, message }) => {
    const { author, categories, categoriesData, startIdx } = Reply;

    if (event.senderID !== author) return;

    try {
      const userInput = parseInt(event.body.trim());
      
      if (isNaN(userInput) || userInput < 1) {
        return message.reply("❌ Please enter a valid category number.");
      }

      const selectedCategoryIndex = userInput - 1;
      const selectedCategory = categories[selectedCategoryIndex];
      
      if (!selectedCategory || !categoriesData[selectedCategory]) {
        return message.reply(`❌ Invalid selection. Please choose a number between 1 and ${categories.length}.`);
      }

      const commands = categoriesData[selectedCategory];
      let categoryMessage = `━━━━━━━━━━━━━━\n`;
      categoryMessage += `📂 Category: ${selectedCategory}\n`;
      categoryMessage += `📊 Total Commands: ${commands.length}\n`;
      categoryMessage += `╭─╼━━━━━━━━╾─╮\n`;
      
      commands.forEach(cmd => {
        categoryMessage += `│ ⚡ ${cmd.name}\n`;
        categoryMessage += `│ 📝 ${cmd.description || "No description"}\n`;
        categoryMessage += `│ ──────────\n`;
      });
      
      categoryMessage += `╰─━━━━━━━━━╾─╯\n`;
      categoryMessage += `━━━━━━━━━━━━━━`;

      await message.reply(categoryMessage);
      api.unsendMessage(event.messageReply.messageID);
    } catch (err) {
      console.error("Reply error:", err);
      message.reply("❌ Failed to display category details.");
    }
  }
};