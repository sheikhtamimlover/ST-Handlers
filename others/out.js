module.exports = {
  config: {
    name: "out",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 2,
    description: "Bot leaves the current group or specified group",
    category: "admin",
    guide: {
      en: "{pn} - Bot leaves current group\n{pn} [threadID] - Bot leaves specified group",
      bn: "{pn} - বট বর্তমান গ্রুপ ছেড়ে যাবে\n{pn} [থ্রেড আইডি] - নির্দিষ্ট গ্রুপ ছেড়ে যাবে"
    }
  },

  ST: async function({ message, args, event, api, commandName }) {
    try {
      const { threadID, senderID } = event;
      
      // If threadID is provided
      if (args[0]) {
        const targetThreadID = args[0];
        
        try {
          const threadInfo = await api.getThreadInfo(targetThreadID);
          const groupName = threadInfo.threadName || "Unnamed Group";
          
          await message.reply(`👋 Leaving group: ${groupName}\n🆔 ID: ${targetThreadID}`);
          
          setTimeout(async () => {
            await api.removeUserFromGroup(api.getCurrentUserID(), targetThreadID);
          }, 2000);
          
        } catch (error) {
          return message.reply("❌ Invalid thread ID or unable to leave that group!");
        }
        
        return;
      }
      
      // Leave current group
      const threadInfo = await api.getThreadInfo(threadID);
      const groupName = threadInfo.threadName || "Unnamed Group";
      
      await message.reply(`👋 Goodbye everyone!\n\n🏷️ Group: ${groupName}\n⏰ Leaving in 3 seconds...`);
      
      setTimeout(async () => {
        await api.removeUserFromGroup(api.getCurrentUserID(), threadID);
      }, 3000);
      
    } catch (error) {
      message.reply("❌ An error occurred: " + error.message);
    }
  }
};