module.exports = {
  config: {
    name: "ctgvasay",
    aliases: ["ctg", "chittagong"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Chittagong district er manush der jonno special command",
    category: "fun",
    guide: "{pn} - Apnar location verify korun"
  },
  
  langs: {
    en: {
      askLocation: "Tumi kun district er manush? Reply koro tomar district er naam:",
      ctgWelcome: "Arre dada! Tumi to CTG er manush! 🎉 Fain aso, CTG vasay kotha koite parba! ⚓",
      notCtg: "Tumi to CTG er na! 😏 Tumi CTG vasay kotha koite parba na bhai!",
      ctgOnly: "Ei command khali CTG er manush der jonno! 🚫",
      invalidReply: "Thik moto district naam likho bhai!"
    }
  },

  onStart: async function({ message, event, getLang }) {
    message.reply(getLang("askLocation"), (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        type: "waitingDistrict"
      });
    });
  },

  onReply: async function({ message, event, Reply, getLang }) {
    if (Reply.type === "waitingDistrict" && Reply.author === event.senderID) {
      const userInput = event.body.toLowerCase().trim();
      
      const ctgKeywords = [
        "chittagong", "ctg", "chattogram", "chattrogram",
        "chattogram", "চট্টগ্রাম", "চিটাগং"
      ];
      
      const isFromCtg = ctgKeywords.some(keyword => userInput.includes(keyword));
      
      if (isFromCtg) {
        if (!global.ctgUsers) {
          global.ctgUsers = new Set();
        }
        global.ctgUsers.add(event.senderID);
        
        message.reply(getLang("ctgWelcome") + "\n\n🌊 CTG Zindabad! Porto Nogori! 🐟");
      } else {
        message.reply(getLang("notCtg"));
      }
    }
  },

  onChat: async function({ message, event, getLang }) {
    if (!global.ctgUsers) {
      global.ctgUsers = new Set();
    }
    
    const ctgPhrases = [
      "ctg vasay", "চট্টগ্রাম ভাষায়", "chittagong vasay",
      "ফাইন", "fain", "আইন্দে", "ainde", "গইয়া", "goiya"
    ];
    
    const messageText = event.body.toLowerCase();
    const hasCTGPhrase = ctgPhrases.some(phrase => messageText.includes(phrase));
    
    if (hasCTGPhrase && !global.ctgUsers.has(event.senderID)) {
      message.reply(getLang("ctgOnly") + "\n\nPehle verify hoiya ao je tumi CTG er! Command use koro: ctgvasay");
    }
  }
};