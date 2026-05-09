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
    description: "Scan all command files for errors, missing categories, and unloaded commands. Use '89j fix' to auto-fix issues",
    category: "owner",
    guide: "{pn} - Scan all command files and generate report\n{pn} fix - Auto-fix all detected issues"
  },
  langs: {
    en: {
      reportHeader: "📊 COMMAND SCAN REPORT\n━━━━━━━━━━━━━━━━━━━━\n",
      totalFiles: "📁 Total Files: {total}",
      loadedCommands: "✅ Loaded Commands: {loaded}",
      failedCommands: "❌ Failed to Load: {failed}",
      missingCategory: "⚠️ Missing/Wrong Category: {missing}",
      separator: "\n━━━━━━━━━━━━━━━━━━━━\n",
      failedSection: "\n❌ FAILED TO LOAD:\n",
      categorySection: "\n⚠️ MISSING/WRONG CATEGORY:\n",
      noIssues: "\n✅ All commands loaded successfully with proper categories!",
      error: "❌ Error scanning commands: {error}",
      fixing: "🔧 Starting auto-fix process...\n",
      fixComplete: "\n✅ Auto-fix complete!\n📝 Fixed: {fixed} files\n⚠️ Could not fix: {failed} files",
      fixingFile: "Fixing {file}..."
    }
  },
  ST: async function({ message, getLang, args }) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const commandsPath = path.join(__dirname);
      
      if (!fs.existsSync(commandsPath)) {
        return message.reply(getLang("error", { error: "Commands directory not found" }));
      }
      
      const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && file !== '89j.js');
      
      const validCategories = [
        "admin", "box chat", "custom", "economy", "education",
        "events", "game", "group", "image", "info", "media",
        "messenger", "music", "owner", "rank", "system", "utility",
        "no prefix", "fun", "anime", "ai", "tools", "moderation"
      ];
      
      const categoryMap = {
        "utility": ["util", "tool"],
        "fun": ["entertainment", "meme"],
        "ai": ["openai", "chatgpt"],
        "game": ["games", "gaming"],
        "music": ["audio", "sound"],
        "image": ["img", "photo", "picture"],
        "info": ["information"],
        "admin": ["administrator", "mod"],
        "economy": ["eco", "money", "currency"]
      };
      
      let totalFiles = 0;
      let loadedCommands = 0;
      let failedCommands = [];
      let wrongCategory = [];
      
      for (const file of commandFiles) {
        totalFiles++;
        const filePath = path.join(commandsPath, file);
        
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          
          if (!fileContent.includes('module.exports')) {
            failedCommands.push({
              file: file,
              reason: "No module.exports found",
              fixable: false
            });
            continue;
          }
          
          delete require.cache[require.resolve(filePath)];
          
          let command;
          try {
            command = require(filePath);
          } catch (reqError) {
            failedCommands.push({
              file: file,
              reason: reqError.message.substring(0, 80),
              fixable: false
            });
            continue;
          }
          
          if (!command || typeof command !== 'object') {
            failedCommands.push({
              file: file,
              reason: "Invalid module export",
              fixable: false
            });
            continue;
          }
          
          if (!command.config || !command.config.name) {
            failedCommands.push({
              file: file,
              reason: "Missing config or config.name",
              fixable: false
            });
            continue;
          }
          
          if (typeof command.ST !== 'function' && typeof command.onStart !== 'function') {
            failedCommands.push({
              file: file,
              reason: "Missing ST or onStart function",
              fixable: false
            });
            continue;
          }
          
          const category = command.config.category ? command.config.category.toLowerCase() : "";
          
          if (!category || category === "" || category === "no category") {
            wrongCategory.push({
              file: file,
              name: command.config.name,
              category: category || "MISSING",
              issue: "No category defined",
              fixable: true,
              suggestedCategory: "utility"
            });
          } else if (!validCategories.includes(category)) {
            let suggestedCategory = "utility";
            for (const [valid, aliases] of Object.entries(categoryMap)) {
              if (aliases.includes(category)) {
                suggestedCategory = valid;
                break;
              }
            }
            wrongCategory.push({
              file: file,
              name: command.config.name,
              category: category,
              issue: "Invalid category",
              fixable: true,
              suggestedCategory: suggestedCategory
            });
          }
          
          loadedCommands++;
          
        } catch (error) {
          failedCommands.push({
            file: file,
            reason: error.message.substring(0, 80),
            fixable: false
          });
        }
      }
      
      if (args[0] === "fix") {
        let fixedCount = 0;
        let failedFixes = 0;
        let fixReport = getLang("fixing");
        
        for (const item of wrongCategory) {
          if (!item.fixable) continue;
          
          try {
            const filePath = path.join(commandsPath, item.file);
            let fileContent = fs.readFileSync(filePath, 'utf8');
            
            const categoryRegex = /category:\s*["']([^"']*)["']/;
            const match = fileContent.match(categoryRegex);
            
            if (match) {
              fileContent = fileContent.replace(
                categoryRegex,
                `category: "${item.suggestedCategory}"`
              );
            } else {
              fileContent = fileContent.replace(
                /config:\s*{/,
                `config: {\n    category: "${item.suggestedCategory}",`
              );
            }
            
            fs.writeFileSync(filePath, fileContent, 'utf8');
            delete require.cache[require.resolve(filePath)];
            
            fixReport += `✅ ${item.file} → ${item.suggestedCategory}\n`;
            fixedCount++;
          } catch (error) {
            fixReport += `❌ ${item.file} - ${error.message.substring(0, 50)}\n`;
            failedFixes++;
          }
        }
        
        fixReport += getLang("fixComplete", { fixed: fixedCount, failed: failedFixes });
        return message.reply(fixReport);
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
          const displayFailed = failedCommands.slice(0, 15);
          displayFailed.forEach((cmd, index) => {
            report += `${index + 1}. ${cmd.file}\n   ${cmd.reason}\n`;
          });
          if (failedCommands.length > 15) {
            report += `\n...and ${failedCommands.length - 15} more failed commands\n`;
          }
        }
        
        if (wrongCategory.length > 0) {
          report += getLang("separator");
          report += getLang("categorySection");
          const displayWrong = wrongCategory.slice(0, 15);
          displayWrong.forEach((cmd, index) => {
            report += `${index + 1}. ${cmd.file} (${cmd.name})\n`;
            report += `   Current: "${cmd.category}" → Suggested: "${cmd.suggestedCategory}"\n`;
          });
          if (wrongCategory.length > 15) {
            report += `\n...and ${wrongCategory.length - 15} more category issues\n`;
          }
        }
        
        report += getLang("separator");
        report += `💡 Use "89j fix" to automatically fix category issues\n`;
      }
      
      report += getLang("separator");
      report += `📋 Valid categories:\n${validCategories.join(", ")}`;
      
      return message.reply(report);
      
    } catch (error) {
      return message.reply(getLang("error", { error: error.message }));
    }
  }
};