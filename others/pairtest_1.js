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
    const axios = require("axios");
    const fs = require("fs-extra");
    const path = require("path");

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

      let imgPath;
      let attachment = null;

      try {
        // Try gif-corner-v2 API first
        const gifApiUrl = `https://gif-corner-v2.vercel.app/pair?percentage=${percentage}`;
        imgPath = path.join(__dirname, "cache", `pair_${senderID}_${targetID}.gif`);
        
        const response = await axios.get(gifApiUrl, { 
          responseType: "arraybuffer",
          timeout: 15000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        
        await fs.outputFile(imgPath, response.data);
        attachment = fs.createReadStream(imgPath);
      } catch (apiError) {
        console.log("gif-corner-v2 API failed, using fallback gifs");
        
        // Fallback to direct gif URLs
        let gifUrl;
        if (percentage >= 75) {
          const loveGifs = [
            "https://i.pinimg.com/originals/9a/bc/57/9abc57951e7bce2701a7c0654e1d0b91.gif",
            "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGxhM2M5ZWRqYmhwZ3Z6dTBjNHFxZnM5ZnRoNWJ5dHByNWJ6dTJyNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26u4cqiYI30juCOGY/giphy.gif",
            "https://media.tenor.com/BXhXhN0avH8AAAAC/love-heart.gif"
          ];
          gifUrl = loveGifs[seed % loveGifs.length];
        } else if (percentage >= 45) {
          const cuteGifs = [
            "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGx6cWJ5OGNjeWh2ZjBhemgyZm5vNDR6dXB1NmN5NW1xMGRhaDRkNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7abldj0b3rxrZUxW/giphy.gif",
            "https://media.tenor.com/yDyQwkeGxmEAAAAC/cute-love.gif",
            "https://media.tenor.com/7qlKVQou8VAAAAAC/couple-cute.gif"
          ];
          gifUrl = cuteGifs[seed % cuteGifs.length];
        } else {
          const friendGifs = [
            "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGEyZHM5ZWx6Y3JlZDN6ZnJ5NjN5OGFwbnByOW9tMDhwNm8xYzl0dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYt5jPR6QX5pnqM/giphy.gif",
            "https://media.tenor.com/V7t5I9ndy0MAAAAC/friends-friendship.gif",
            "https://media.tenor.com/MQ9sN9ZOp9gAAAAC/bye-wave.gif"
          ];
          gifUrl = friendGifs[seed % friendGifs.length];
        }

        try {
          imgPath = path.join(__dirname, "cache", `pair_fallback_${senderID}_${targetID}.gif`);
          const fallbackResponse = await axios.get(gifUrl, { 
            responseType: "arraybuffer",
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          });
          
          await fs.outputFile(imgPath, fallbackResponse.data);
          attachment = fs.createReadStream(imgPath);
        } catch (fallbackError) {
          console.log("Fallback gif also failed, sending text only");
          attachment = null;
        }
      }

      // Send result
      if (attachment) {
        await message.reply({
          body: resultMessage,
          attachment: attachment
        }, () => {
          if (imgPath && fs.existsSync(imgPath)) {
            try {
              fs.unlinkSync(imgPath);
            } catch (e) {
              console.log("Could not delete temp file:", e);
            }
          }
        });
      } else {
        await message.reply(resultMessage);
      }

    } catch (error) {
      console.error("Pairtest error:", error);
      message.reply("❌ An error occurred while processing the pair test. Please try again!");
    }
  }
};