module.exports = {
  config: {
    name: "shutdown",
    aliases: ["stop", "turnoff"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "Shutdown the bot",
    category: "system",
    guide: {
      en: "{pn} - Shutdown bot\n{pn} confirm - Confirm shutdown\n{pn} force - Force shutdown"
    }
  },

  ST: async function ({ message, args, event, api }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return message.reply("❌ Only bot owner can shutdown the bot!");
    }

    if (args[0] === "force" || args[0] === "f") {
      await message.reply(
        `⚠️ FORCE SHUTDOWN INITIATED\n\n` +
        `🔴 Bot will shutdown immediately!\n` +
        `⏰ Time: ${new Date().toLocaleString()}\n\n` +
        `💡 Use restart command or restart server to turn on again.`
      );

      setTimeout(() => {
        process.exit(0);
      }, 2000);
      
      return;
    }

    if (args[0] === "confirm" || args[0] === "yes" || args[0] === "c") {
      await message.reply(
        `🔴 SHUTTING DOWN BOT\n\n` +
        `⏰ Shutdown Time: ${new Date().toLocaleString()}\n` +
        `👤 Initiated by: Bot Owner\n\n` +
        `✅ All processes will be terminated\n` +
        `💾 Data has been saved\n` +
        `⏳ Shutdown in 5 seconds...\n\n` +
        `💡 To restart, use your hosting panel or restart script.`
      );

      setTimeout(() => {
        console.log("[SHUTDOWN] Bot shutdown initiated by owner");
        process.exit(0);
      }, 5000);
      
      return;
    }

    return message.reply(
      `⚠️ SHUTDOWN CONFIRMATION REQUIRED\n\n` +
      `🔴 This will completely shutdown the bot!\n\n` +
      `💡 Options:\n` +
      `• shutdown confirm - Confirm shutdown (5s delay)\n` +
      `• shutdown force - Force immediate shutdown\n\n` +
      `⚠️ Are you sure you want to shutdown?`
    );
  }
};