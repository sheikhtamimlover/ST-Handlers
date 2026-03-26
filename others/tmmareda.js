module.exports = {
  config: {
    name: "tmmareda",
    aliases: ["specialuser"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 0,
    premium: false,
    usePrefix: false,
    description: "Special response for specific user",
    category: "fun",
    guide: "Auto trigger on chat"
  },
  
  langs: {
    en: {
      specialUserMsg: "sare pora pic deo taratari",
      specialUserReply: "chup bbsless",
      otherUserReply: "are you dhon kata hijla?"
    }
  },

  onChat: async function({ message, event, getLang }) {
    const specialUID = "61577849747621";
    
    if (event.senderID === specialUID) {
      message.reply(getLang("specialUserMsg"), (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          type: "waitingReply"
        });
      });
    }
  },

  onReply: async function({ message, event, Reply, getLang }) {
    const specialUID = "61577849747621";
    
    if (Reply.type === "waitingReply") {
      if (event.senderID === specialUID) {
        message.reply(getLang("specialUserReply"));
      } else {
        message.reply(getLang("otherUserReply"));
      }
    }
  },

  ST: async function({ message }) {
    message.reply("This command works automatically when the special user sends a message.");
  }
};