module.exports = {
  config: {
    name: 'allbox',
    version: '1.0.0',
    author: 'ST | Sheikh Tamim',
    countDown: 5,
    role: 2,
    description: '[Ban/Unban/Del/Remove] List thread The bot has joined in.',
    category: 'admin',
    guide: '{pn} [page number/all]'
  },

  onReply: async function({ api, event, Reply, threadsData }) {
    const { threadID, messageID, senderID } = event;
    if (parseInt(senderID) !== parseInt(Reply.author)) return;
    
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Dhaka").format("HH:mm:ss L");
    const arg = event.body.split(" ");
    const idgr = Reply.groupid[arg[1] - 1];
    const groupName = Reply.groupName[arg[1] - 1];

    switch (Reply.type) {
      case "reply": {
        if (arg[0].toLowerCase() === "ban") {
          await threadsData.set(idgr, {
            banned: true,
            dateAdded: time
          });
          
          await api.sendMessage(`»Notifications from Owner«\n\nYour group has been banned from using the bot.`, idgr);
          return api.sendMessage(`★★BanSuccess★★\n\n🔷${groupName}\n🔰TID: ${idgr}`, threadID, () =>
            api.unsendMessage(Reply.messageID)
          );
        }

        if (arg[0].toLowerCase() === "unban" || arg[0].toLowerCase() === "ub") {
          await threadsData.set(idgr, {
            banned: false,
            dateAdded: null
          });
          
          await api.sendMessage(`»Notifications from Owner«\n\nYour group has been unbanned!`, idgr);
          return api.sendMessage(`★★UnbanSuccess★★\n\n🔷${groupName}\n🔰TID: ${idgr}`, threadID, () =>
            api.unsendMessage(Reply.messageID)
          );
        }

        if (arg[0].toLowerCase() === "del") {
          await threadsData.delData(idgr);
          return api.sendMessage(`★★DelSuccess★★\n\n🔷${groupName}\n🔰TID: ${idgr}\nSuccessfully deleted the data!`, threadID, () =>
            api.unsendMessage(Reply.messageID)
          );
        }

        if (arg[0].toLowerCase() === "out") {
          await api.sendMessage(`»Notifications from Owner«\n\n★★Deleted from chat★★`, idgr);
          await api.sendMessage(`★★OutSuccess★★\n\n🔷${groupName}\n🔰TID: ${idgr}`, threadID);
          await api.unsendMessage(Reply.messageID);
          return api.removeUserFromGroup(api.getCurrentUserID(), idgr);
        }
      }
    }
  },

  ST: async function({ api, event, args, message, threadsData }) {
    try {
      const { threadID } = event;

      if (args[0] === "all") {
        let threadList = [];
        let data = await api.getThreadList(100, null, ["INBOX"]);

        for (const thread of data) {
          if (thread.isGroup) {
            threadList.push({
              threadName: thread.name,
              threadID: thread.threadID,
              messageCount: thread.messageCount
            });
          }
        }

        threadList.sort((a, b) => b.messageCount - a.messageCount);

        let groupid = [];
        let groupName = [];
        let page = parseInt(args[1]) || 1;
        if (page < 1) page = 1;
        
        let limit = 100;
        let msg = "🎭DS GROUP [Data]🎭\n\n";
        let numPage = Math.ceil(threadList.length / limit);

        for (let i = limit * (page - 1); i < limit * page; i++) {
          if (i >= threadList.length) break;
          let group = threadList[i];
          msg += `${i + 1}. ${group.threadName}\n🔰TID: ${group.threadID}\n💌MessageCount: ${group.messageCount}\n\n`;
          groupid.push(group.threadID);
          groupName.push(group.threadName);
        }
        
        msg += `--Page ${page}/${numPage}--\nUse ${global.GoatBot.config.prefix}allbox page number/all\n\n`;

        return api.sendMessage(msg + '🎭Reply Out, Ban, Unban, Del + number to manage that thread!', threadID, (e, data) =>
          global.GoatBot.onReply.set(data.messageID, {
            commandName: this.config.name,
            author: event.senderID,
            messageID: data.messageID,
            groupid,
            groupName,
            type: 'reply'
          })
        );
      } else {
        let threadList = [];
        let i = 1;
        let data = await api.getThreadList(100, null, ["INBOX"]);

        for (const thread of data) {
          if (thread.isGroup) {
            try {
              let nameThread = thread.name || "Name doesn't exist";
              threadList.push(`${i++}. ${nameThread}\n🔰TID: ${thread.threadID}`);
            } catch (e) {
              console.log(e);
            }
          }
        }

        return message.reply(
          threadList.length > 0
            ? `🍄There are currently ${threadList.length} groups\n\n${threadList.join("\n")}`
            : "There are currently no groups!"
        );
      }
    } catch (err) {
      console.log(err);
      return message.reply("❌ Error: " + err.message);
    }
  }
};