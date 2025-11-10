module.exports = {
  config: {
    name: "friday",
    version: "1.1.1",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Send Jumma Mubarak messages to a group or all groups",
    category: "fun",
    guide: {
      en: "friday [all]"
    }
  },

  ST: async function({ api, event, args, message }) {
    const { threadID } = event;
    const allOption = args[0] && args[0].toLowerCase() === "all";

    const firstMessage = `😁\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n✅`;
    
    const sendJummaMessage = async (targetThreadID) => {
      try {
        await api.sendMessage(firstMessage, targetThreadID);

        let threadInfo;
        try {
          threadInfo = await api.getThreadInfo(targetThreadID);
        } catch (e) {
          threadInfo = { threadName: "group" };
        }

        const groupName = threadInfo.threadName || "group";

        const secondMessage = `প্রিও "${groupName}" মেম্বার বাসি

🕌 জুম্মা মুবারক 🕌

সকলের জন্য আজকের Jumma দিনটি হোক আনন্দ, শান্তি ও বরকতের।  
আল্লাহর রহমত সবাইকে ঘিরে রাখুক।  
আপনার দোয়া কবুল হোক এবং জীবনে সুখ ও সমৃদ্ধি বর্ষিত হোক।  

জুম্মা মুবারক সবাইকে! 🤲
👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑`;

        await api.sendMessage(secondMessage, targetThreadID);
      } catch (error) {
        console.error(`Failed to send message to ${targetThreadID}:`, error);
      }
    };

    if (allOption) {
      try {
        const allThreads = await api.getThreadList(100, null, ["INBOX"]);
        let sentCount = 0;
        for (const thread of allThreads) {
          if (thread.isGroup) {
            await sendJummaMessage(thread.threadID);
            sentCount++;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        return message.reply(`✅ Jumma Mubarak message sent to ${sentCount} groups!`);
      } catch (error) {
        return message.reply("❌ Failed to send messages to all groups.");
      }
    } else {
      await sendJummaMessage(threadID);
    }
  }
};