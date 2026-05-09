module.exports = {
  config: {
    name: "89j",
    aliases: ["scancommands", "cmdscan"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 2,
    premium: false,
    usePrefix: true,
    description: "Scan all command files for errors, missing categories, and unloaded commands",
    category: "owner",
    guide: "{pn} - Scan all command files and generate report"
  },
  langs: {
    en: {
      scanning: "🔍 Scanning all command files...\nPlease wait...",
      reportHeader: "📊 COMMAND SCAN REPORT\n━━━━━━━━━━━━━━━━━━━━\n",
      totalFiles: "📁 Total Files: {total}",
      loadedCommands: "✅ Loaded Commands: {loaded}",
      failedCommands: "❌ Failed to Load: {failed}",
      missingCategory: "⚠️ Missing/Wrong Category: {missing}",
      separator: "\n━━━━━━━━━━━━━━━━━━━━\n",
      failedSection: "\n❌ FAILED TO LOAD:\n",
      categorySection: "\n⚠️ MISSING/WRONG CATEGORY:\n",
      noIssues: "\n✅ All commands loaded successfully with proper categories!",
      error: "❌ Error scanning commands: {error}"
    }
  },
  ST: async function({ message, getLang, commandName }) {
    try {
      const fs = require('fs');
      const path = require('path');
      
      await message.reply(getLang("scanning"));
      
      const commandsPath = path.join(__dirname, '../cmds');
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
      
      const validCategories = [
        "admin", "box chat", "custom", "economy", "education",
        "events", "game", "group", "image", "info", "media",
        "messenger", "music", "owner", "rank", "system", "utility",
        "no prefix", "fun", "anime", "ai", "tools", "moderation"
      ];
      
      let totalFiles = 0;
      let loadedCommands = 0;
      let failedCommands = [];
      let wrongCategory = [];
      
      for (const file of commandFiles) {
        totalFiles++;
        const filePath = path.join(commandsPath, file);
        
        try {
          delete require.cache[require.resolve(filePath)];
          const command = require(filePath);
          
          if (!command.config || !command.config.name) {
            failedCommands.push({
              file: file,
              reason: "Missing config or config.name"
            });
            continue;
          }
          
          if (typeof command.ST !== 'function' && typeof command.onStart !== 'function') {
            failedCommands.push({
              file: file,
              reason: "Missing ST or onStart function"
            });
            continue;
          }
          
          const category = command.config.category ? command.config.category.toLowerCase() : "";
          
          if (!category || category === "" || category === "no category") {
            wrongCategory.push({
              file: file,
              name: command.config.name,
              category: category || "MISSING",
              issue: "No category defined"
            });
          } else if (!validCategories.includes(category)) {
            wrongCategory.push({
              file: file,
              name: command.config.name,
              category: category,
              issue: "Invalid category"
            });
          }
          
          loadedCommands++;
          
        } catch (error) {
          failedCommands.push({
            file: file,
            reason: error.message
          });
        }
      }
      
      let report = getLang("reportHeader");
      report += getLang("totalFiles", { total: totalFiles }) + "\n";
      report += getLang("loadedCommands", { loaded: loadedCommands }) + "\n";
      report += getLang("failedCommands", { failed: failedCommands.length }) + "\n";
      report += getLang("missingCategory", { missing: wrongCategory.length });
      
      if (failedCommands.length === 0 && wrongCategory.length === 0) {
        report += getLang("separator");
        report += getLang("noIssues");
      } else {
        if (failedCommands.length > 0) {
          report += getLang("separator");
          report += getLang("failedSection");
          failedCommands.forEach((cmd, index) => {
            report += `${index + 1}. ${cmd.file}\n   Reason: ${cmd.reason}\n`;
          });
        }
        
        if (wrongCategory.length > 0) {
          report += getLang("separator");
          report += getLang("categorySection");
          wrongCategory.forEach((cmd, index) => {
            report += `${index + 1}. ${cmd.file} (${cmd.name})\n`;
            report += `   Current: "${cmd.category}"\n`;
            report += `   Issue: ${cmd.issue}\n`;
          });
        }
      }
      
      report += getLang("separator");
      report += `\n📋 Suggested valid categories:\n${validCategories.join(", ")}`;
      
      return message.reply(report);
      
    } catch (error) {
      return message.reply(getLang("error", { error: error.message }));
    }
  }
};