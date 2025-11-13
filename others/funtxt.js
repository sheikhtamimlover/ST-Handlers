module.exports = {
  config: {
    name: "funtxt",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: {
      en: "Auto-reply to users based on gender (once per 24 hours)",
      bn: "লিঙ্গ অনুযায়ী ব্যবহারকারীদের স্বয়ংক্রিয় উত্তর (প্রতি ২৪ ঘন্টায় একবার)"
    },
    category: "fun",
    guide: {
      en: "   {pn} on: Enable auto-reply\n   {pn} off: Disable auto-reply\n   Bot will auto-reply to users once per 24 hours",
      bn: "   {pn} on: স্বয়ংক্রিয় উত্তর চালু করুন\n   {pn} off: স্বয়ংক্রিয় উত্তর বন্ধ করুন\n   বট প্রতি ২৪ ঘন্টায় একবার ব্যবহারকারীদের উত্তর দেবে"
    }
  },

  langs: {
    en: {
      turnedOn: "✅ Fun text auto-reply is now ON for this group!",
      turnedOff: "❌ Fun text auto-reply is now OFF for this group!",
      maleReply: "Eto kotha kos kun! te jor ase ? 😏",
      femaleReply: "Eto kotha je bolo jamai ke happy rakhte parba ? 😘",
      replyResponse: "Ki go bolo? Ar kotha nai? 🤔",
      invalid: "❌ Invalid command! Use: {pn} on/off"
    },
    bn: {
      turnedOn: "✅ এই গ্রুপের জন্য ফান টেক্সট স্বয়ংক্রিয় উত্তর চালু করা হয়েছে!",
      turnedOff: "❌ এই গ্রুপের জন্য ফান টেক্সট স্বয়ংক্রিয় উত্তর বন্ধ করা হয়েছে!",
      maleReply: "Eto kotha kos kun! te jor ase ? 😏",
      femaleReply: "Eto kotha je bolo jamai ke happy rakhte parba ? 😘",
      replyResponse: "Ki go bolo? Ar kotha nai? 🤔",
      invalid: "❌ ভুল কমান্ড! ব্যবহার করুন: {pn} on/off"
    }
  },

  onStart: async function({ api, event, args, message, getLang, threadsData }) {
    try {
      const { threadID } = event;
      
      if (!global.funtxtAutoReply) global.funtxtAutoReply = {};
      
      const action = args[0]?.toLowerCase();
      
      if (action === "on") {
        global.funtxtAutoReply[threadID] = true;
        return message.reply(getLang("turnedOn"));
      } else if (action === "off") {
        global.funtxtAutoReply[threadID] = false;
        return message.reply(getLang("turnedOff"));
      } else {
        return message.reply(getLang("invalid"));
      }
      
    } catch (err) {
      console.log(err);
    }
  },

  onChat: async function({ api, event, message, getLang, usersData }) {
    try {
      const { threadID, senderID, messageID, body } = event;
      
      // Initialize global objects
      if (!global.funtxtAutoReply) global.funtxtAutoReply = {};
      if (!global.funtxtUserTracker) global.funtxtUserTracker = {};
      
      // Check if auto-reply is enabled for this thread
      if (!global.funtxtAutoReply[threadID]) return;
      
      // Ignore bot's own messages and command messages
      if (!body || body.startsWith('/') || body.startsWith('.') || body.startsWith('!')) return;
      
      // Check if user was already replied to in last 24 hours
      const currentTime = Date.now();
      const userKey = `${threadID}_${senderID}`;
      const lastReplyTime = global.funtxtUserTracker[userKey];
      
      if (lastReplyTime && (currentTime - lastReplyTime) < 86400000) {
        return; // 24 hours = 86400000 milliseconds
      }
      
      // Get user gender
      const userData = await usersData.get(senderID);
      const userGender = userData.gender;
      
      let replyMessage = "";
      
      if (userGender === 1) {
        // Female user
        replyMessage = getLang("femaleReply");
      } else {
        // Male user or unknown gender
        replyMessage = getLang("maleReply");
      }
      
      // Send reply and track user
      global.funtxtUserTracker[userKey] = currentTime;
      
      return api.sendMessage(
        replyMessage,
        threadID,
        (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: senderID,
              type: "funtxtReply"
            });
          }
        },
        messageID
      );
      
    } catch (err) {
      console.log(err);
    }
  },

  onReply: async function({ api, event, Reply, message, getLang }) {
    try {
      const { threadID, messageID, senderID } = event;
      
      if (Reply.author === senderID && Reply.type === "funtxtReply") {
        return api.sendMessage(
          getLang("replyResponse"),
          threadID,
          (err, info) => {
            if (!err) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                messageID: info.messageID,
                author: senderID,
                type: "funtxtReply"
              });
            }
          },
          messageID
        );
      }
      
    } catch (err) {
      console.log(err);
    }
  }
};