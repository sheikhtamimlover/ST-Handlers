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
    description: "Pair yourself with another user and see compatibility with beautiful UI and profile pictures",
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
        // Get profile pictures
        const user1Avatar = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        const user2Avatar = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        
        // Try gif-corner-v2 API with user profiles
        const gifApiUrl = `https://gif-corner-v2.vercel.app/pair?name1=${encodeURIComponent(userName)}&name2=${encodeURIComponent(targetName)}&avatar1=${encodeURIComponent(user1Avatar)}&avatar2=${encodeURIComponent(user2Avatar)}&percentage=${percentage}`;
        imgPath = path.join(__dirname, "cache", `pair_${senderID}_${targetID}.gif`);
        
        const response = await axios.get(gifApiUrl, { 
          responseType: "arraybuffer",
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        
        await fs.outputFile(imgPath, response.data);
        attachment = fs.createReadStream(imgPath);
      } catch (apiError) {
        console.log("gif-corner-v2 API failed, trying alternative API");
        
        try {
          // Alternative API with profiles
          const user1Avatar = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
          const user2Avatar = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
          
          const altApiUrl = `https://pair-gen-api.vercel.app/generate?user1=${encodeURIComponent(userName)}&user2=${encodeURIComponent(targetName)}&avatar1=${encodeURIComponent(user1Avatar)}&avatar2=${encodeURIComponent(user2Avatar)}&percent=${percentage}`;
          imgPath = path.join(__dirname, "cache", `pair_alt_${senderID}_${targetID}.gif`);
          
          const altResponse = await axios.get(altApiUrl, {
            responseType: "arraybuffer",
            timeout: 20000,
            headers: {
              'User-Agent': 'Mozilla/5.0'
            }
          });
          
          await fs.outputFile(imgPath, altResponse.data);
          attachment = fs.createReadStream(imgPath);
        } catch (altError) {
          console.log("Alternative API also failed, using simple canvas generation");
          
          try {
            // Create simple pair image with Canvas
            const Canvas = require("canvas");
            const canvas = Canvas.createCanvas(1200, 800);
            const ctx = canvas.getContext("2d");
            
            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            if (percentage >= 75) {
              gradient.addColorStop(0, "#ff6b6b");
              gradient.addColorStop(1, "#ee5a6f");
            } else if (percentage >= 45) {
              gradient.addColorStop(0, "#f093fb");
              gradient.addColorStop(1, "#f5576c");
            } else {
              gradient.addColorStop(0, "#667eea");
              gradient.addColorStop(1, "#764ba2");
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Load and draw avatars
            const user1Avatar = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            const user2Avatar = `https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            
            const avatar1 = await Canvas.loadImage(user1Avatar);
            const avatar2 = await Canvas.loadImage(user2Avatar);
            
            // Draw circular avatars
            const avatarSize = 250;
            const y = 200;
            
            // User 1 avatar
            ctx.save();
            ctx.beginPath();
            ctx.arc(250, y, avatarSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar1, 250 - avatarSize / 2, y - avatarSize / 2, avatarSize, avatarSize);
            ctx.restore();
            
            // User 2 avatar
            ctx.save();
            ctx.beginPath();
            ctx.arc(950, y, avatarSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar2, 950 - avatarSize / 2, y - avatarSize / 2, avatarSize, avatarSize);
            ctx.restore();
            
            // Heart in the middle
            ctx.font = "120px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.fillText("💕", 600, 230);
            
            // Percentage
            ctx.font = "bold 100px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.fillText(`${percentage}%`, 600, 500);
            
            // Names
            ctx.font = "bold 40px Arial";
            ctx.fillStyle = "#fff";
            ctx.textAlign = "center";
            ctx.fillText(userName, 250, 400);
            ctx.fillText(targetName, 950, 400);
            
            // Status
            ctx.font = "bold 35px Arial";
            ctx.fillText(status, 600, 600);
            
            imgPath = path.join(__dirname, "cache", `pair_canvas_${senderID}_${targetID}.png`);
            const buffer = canvas.toBuffer("image/png");
            await fs.outputFile(imgPath, buffer);
            attachment = fs.createReadStream(imgPath);
          } catch (canvasError) {
            console.log("Canvas generation failed:", canvasError);
            attachment = null;
          }
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