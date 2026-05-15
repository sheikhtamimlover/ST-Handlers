module.exports = {
  config: {
    name: "pairtest",
    aliases: ["pair", "testpair"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Pair yourself with another user and see compatibility with beautiful UI",
    category: "fun",
    guide: "{pn} @mention or reply to someone"
  },
  
  langs: {
    en: {
      missingTarget: "❌ Please mention someone or reply to their message!",
      selfPair: "❌ You cannot pair with yourself!",
      processing: "💝 Processing your pair test...",
      pairResult: "╭─────━━━━━━━━─────╮\n│  💞 PAIR TEST RESULTS 💞  │\n╰─────━━━━━━━━─────╯\n\n👤 {user1}\n💕 paired with\n👤 {user2}\n\n╔══════════════════╗\n║  Compatibility Score  ║\n╚══════════════════╝\n\n{bar}\n💯 {percentage}%\n\n╭───────────────────╮\n│    Relationship Status    │\n╰───────────────────╯\n{status}\n\n💌 {message}\n\n╭─────────────────╮\n│  Love Prediction  │\n╰─────────────────╯\n{prediction}\n\n✨ {quote}"
    }
  },

  ST: async function({ message, args, event, api, getLang, usersData }) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;

    try {
      let targetID;
      let targetName;
      let userName;

      // Get sender name
      try {
        const senderData = await usersData.get(senderID);
        userName = senderData.name || "User";
      } catch {
        userName = "User";
      }

      // Check if reply to message
      if (messageReply) {
        targetID = messageReply.senderID;
        try {
          const targetData = await usersData.get(targetID);
          targetName = targetData.name || "User";
        } catch {
          targetName = "User";
        }
      }
      // Check if mention
      else if (Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0];
        targetName = mentions[targetID];
      }
      else {
        return message.reply(getLang("missingTarget"));
      }

      // Check if pairing with self
      if (targetID === senderID) {
        return message.reply(getLang("selfPair"));
      }

      // Send processing message
      await message.reply(getLang("processing"));

      // Calculate compatibility (seeded random based on IDs)
      const seed = parseInt(senderID) + parseInt(targetID);
      const percentage = ((seed % 100) + 1);
      
      // Create visual percentage bar
      const filledBlocks = Math.floor(percentage / 5);
      const emptyBlocks = 20 - filledBlocks;
      const bar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

      // Determine status and messages based on percentage
      let status, statusMessage, prediction, quote;

      if (percentage >= 90) {
        status = "💖 PERFECT MATCH 💖";
        statusMessage = "You two are meant to be together! The chemistry is undeniable! 🔥";
        prediction = "🌟 Marriage prediction: Within 2 years!\n💍 Success rate: 99%";
        quote = "When two souls are meant for each other, no distance is too far.";
      } else if (percentage >= 75) {
        status = "💕 EXCELLENT PAIR 💕";
        statusMessage = "Amazing connection! You complement each other perfectly! ✨";
        prediction = "🌟 Strong potential for long-term relationship\n💑 Success rate: 85%";
        quote = "Love is not about finding the perfect person, but seeing an imperfect person perfectly.";
      } else if (percentage >= 60) {
        status = "💗 GREAT MATCH 💗";
        statusMessage = "Really good compatibility! Keep nurturing this bond! 🌸";
        prediction = "🌟 Good chances for lasting relationship\n💏 Success rate: 70%";
        quote = "The best love is the kind that awakens the soul.";
      } else if (percentage >= 45) {
        status = "💝 GOOD POTENTIAL 💝";
        statusMessage = "There's definitely something here! Work on it together! 💪";
        prediction = "🌟 Moderate compatibility, needs effort\n💞 Success rate: 55%";
        quote = "Love is friendship set on fire.";
      } else if (percentage >= 30) {
        status = "💛 FRIENDS ZONE 💛";
        statusMessage = "Better as friends, but who knows what future holds! 🤝";
        prediction = "🌟 Friendship has strong foundation\n🤝 Success rate: 40%";
        quote = "Sometimes the best relationships start as friendships.";
      } else {
        status = "💔 INCOMPATIBLE 💔";
        statusMessage = "Maybe not the best match, but miracles happen! 🍀";
        prediction = "🌟 Low compatibility detected\n🔮 Success rate: 25%";
        quote = "Not every story has a happy ending, and that's okay.";
      }

      // Prepare final message
      const resultMessage = getLang("pairResult")
        .replace("{user1}", userName)
        .replace("{user2}", targetName)
        .replace("{bar}", bar)
        .replace("{percentage}", percentage)
        .replace("{status}", status)
        .replace("{message}", statusMessage)
        .replace("{prediction}", prediction)
        .replace("{quote}", quote);

      // Get gif based on percentage
      let gifUrl;
      if (percentage >= 75) {
        const loveGifs = [
          "https://i.imgur.com/6J9MQZM.gif",
          "https://i.imgur.com/VcEkHYU.gif",
          "https://i.imgur.com/8xzBXkN.gif"
        ];
        gifUrl = loveGifs[seed % loveGifs.length];
      } else if (percentage >= 45) {
        const cuteGifs = [
          "https://i.imgur.com/Pk0Tj3Q.gif",
          "https://i.imgur.com/kU8fPHC.gif",
          "https://i.imgur.com/7wSCHty.gif"
        ];
        gifUrl = cuteGifs[seed % cuteGifs.length];
      } else {
        const friendGifs = [
          "https://i.imgur.com/xN6rLTt.gif",
          "https://i.imgur.com/RW5azkJ.gif",
          "https://i.imgur.com/nYFCqBK.gif"
        ];
        gifUrl = friendGifs[seed % friendGifs.length];
      }

      // Send result with gif
      const axios = require("axios");
      const fs = require("fs-extra");
      const path = require("path");

      const imgPath = path.join(__dirname, "cache", `pair_${senderID}_${targetID}.gif`);
      
      const response = await axios.get(gifUrl, { responseType: "arraybuffer" });
      await fs.outputFile(imgPath, response.data);

      await message.reply({
        body: resultMessage,
        attachment: fs.createReadStream(imgPath)
      }, () => fs.unlinkSync(imgPath));

    } catch (error) {
      console.error("Pairtest error:", error);
      message.reply("❌ An error occurred while processing the pair test. Please try again!");
    }
  }
};