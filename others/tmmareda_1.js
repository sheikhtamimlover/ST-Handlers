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
      otherUserReply: "are you dhon kata hijla?",
      spamWarning: "jamai nai dekhe kurkurani uthse ?"
    }
  },

  onStart: async function() {},

  onChat: async function({ message, event, getLang }) {
    const specialUID = "61577849747621";
    
    if (!global.tmmareda) {
      global.tmmareda = {
        spamCount: {},
        blocked: {},
        lastMessage: {}
      };
    }
    
    if (event.senderID === specialUID) {
      const now = Date.now();
      const userSpam = global.tmmareda.spamCount[specialUID] || [];
      
      if (global.tmmareda.blocked[specialUID] && now - global.tmmareda.blocked[specialUID] < 300000) {
        return;
      }
      
      if (global.tmmareda.blocked[specialUID] && now - global.tmmareda.blocked[specialUID] >= 300000) {
        delete global.tmmareda.blocked[specialUID];
        global.tmmareda.spamCount[specialUID] = [];
      }
      
      userSpam.push(now);
      global.tmmareda.spamCount[specialUID] = userSpam.filter(time => now - time < 10000);
      
      if (global.tmmareda.spamCount[specialUID].length >= 3) {
        message.reply(getLang("spamWarning"));
        global.tmmareda.blocked[specialUID] = now;
        global.tmmareda.spamCount[specialUID] = [];
        return;
      }
      
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
    
    if (Reply.type === "waitingReply" && Reply.author === specialUID) {
      if (event.senderID === specialUID) {
        message.reply(getLang("specialUserReply"));
      } else {
        message.reply(getLang("otherUserReply"));
      }
    }
  }
};