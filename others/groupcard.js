const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");
const GIFEncoder = require("gif-encoder-2");

module.exports = {
  config: {
    name: "groupcard",
    aliases: ["gc", "threadcard"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Create animated group card with thread info and members",
    category: "group",
    guide: "{pn} - Generate group card with animation"
  },

  langs: {
    en: {
      generating: "🎨 Creating animated group card...\nThis may take a moment ⏳",
      error: "❌ Error generating group card: {error}",
      success: "✅ Group card created successfully!"
    }
  },

  ST: async function({ message, event, api, getLang, usersData, threadsData }) {
    try {
      const threadID = event.threadID;
      message.reply(getLang("generating"));

      // Get thread info
      const threadInfo = await api.getThreadInfo(threadID);
      const threadName = threadInfo.threadName || "Unnamed Group";
      const totalMembers = threadInfo.participantIDs.length;
      
      // Get thread image
      let threadImage;
      try {
        if (threadInfo.imageSrc) {
          const response = await axios.get(threadInfo.imageSrc, { responseType: "arraybuffer" });
          threadImage = await loadImage(Buffer.from(response.data));
        } else {
          threadImage = null;
        }
      } catch {
        threadImage = null;
      }

      // Get admins
      const adminIDs = threadInfo.adminIDs.map(admin => admin.id);

      // Get all members data with gender
      const membersData = [];
      let maleCount = 0;
      let femaleCount = 0;
      let totalMessages = 0;

      for (const userID of threadInfo.participantIDs) {
        try {
          const userData = await usersData.get(userID);
          const userInfo = await api.getUserInfo(userID);
          const gender = userInfo[userID]?.gender || "UNKNOWN";
          
          if (gender === "MALE") maleCount++;
          else if (gender === "FEMALE") femaleCount++;

          membersData.push({
            id: userID,
            name: userData?.name || userInfo[userID]?.name || "Facebook User",
            avatar: userInfo[userID]?.thumbSrc || `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            isAdmin: adminIDs.includes(userID),
            messageCount: userData?.exp || 0
          });

          totalMessages += userData?.exp || 0;
        } catch {
          membersData.push({
            id: userID,
            name: "Facebook User",
            avatar: `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            isAdmin: adminIDs.includes(userID),
            messageCount: 0
          });
        }
      }

      // Sort: Admins first, then by message count
      membersData.sort((a, b) => {
        if (a.isAdmin && !b.isAdmin) return -1;
        if (!a.isAdmin && b.isAdmin) return 1;
        return b.messageCount - a.messageCount;
      });

      // Canvas dimensions
      const width = 1200;
      const headerHeight = 350;
      const membersPerRow = 5;
      const memberCardSize = 180;
      const memberRows = Math.ceil(membersData.length / membersPerRow);
      const height = headerHeight + (memberRows * (memberCardSize + 40)) + 100;

      // Create GIF encoder
      const encoder = new GIFEncoder(width, height);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(100);
      encoder.setQuality(10);

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Neon colors for admins
      const neonColors = [
        "#00ffff", "#ff00ff", "#00ff00", "#ffff00", 
        "#ff0080", "#0080ff", "#ff8000", "#80ff00"
      ];

      // Animation frames
      const frames = 30;

      for (let frame = 0; frame < frames; frame++) {
        const progress = frame / frames;

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `hsl(${(progress * 360)}, 70%, 15%)`);
        gradient.addColorStop(0.5, `hsl(${(progress * 360 + 60)}, 60%, 10%)`);
        gradient.addColorStop(1, `hsl(${(progress * 360 + 120)}, 70%, 15%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Header background
        const headerGradient = ctx.createLinearGradient(0, 0, width, headerHeight);
        headerGradient.addColorStop(0, `hsla(${(progress * 360)}, 80%, 30%, 0.3)`);
        headerGradient.addColorStop(1, `hsla(${(progress * 360 + 180)}, 80%, 30%, 0.3)`);
        ctx.fillStyle = headerGradient;
        ctx.fillRect(0, 0, width, headerHeight);

        // Draw thread profile picture
        if (threadImage) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(150, 150, 80, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(threadImage, 70, 70, 160, 160);
          ctx.restore();

          // Animated border
          ctx.strokeStyle = `hsl(${(progress * 360 + 180)}, 100%, 50%)`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(150, 150, 82, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Thread name
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(threadName, width / 2, 80);

        // Stats boxes
        const stats = [
          { label: "Total Members", value: totalMembers, x: 320, color: "#00ffff" },
          { label: "Male", value: maleCount, x: 520, color: "#0080ff" },
          { label: "Female", value: femaleCount, x: 720, color: "#ff0080" },
          { label: "Messages", value: totalMessages.toLocaleString(), x: 920, color: "#00ff00" }
        ];

        stats.forEach((stat, index) => {
          const offsetY = Math.sin((progress * Math.PI * 2) + (index * 0.5)) * 5;
          
          // Stat box
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(stat.x - 80, 160 + offsetY, 160, 100);
          
          // Border
          ctx.strokeStyle = stat.color;
          ctx.lineWidth = 2;
          ctx.strokeRect(stat.x - 80, 160 + offsetY, 160, 100);

          // Value
          ctx.fillStyle = stat.color;
          ctx.font = "bold 36px Arial";
          ctx.textAlign = "center";
          ctx.fillText(stat.value, stat.x, 200 + offsetY);

          // Label
          ctx.fillStyle = "#ffffff";
          ctx.font = "16px Arial";
          ctx.fillText(stat.label, stat.x, 240 + offsetY);
        });

        // Members section title
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "left";
        ctx.fillText("👥 Members", 40, headerHeight + 50);

        // Draw members
        let currentX = 60;
        let currentY = headerHeight + 100;
        let memberIndex = 0;

        for (const member of membersData) {
          if (memberIndex > 0 && memberIndex % membersPerRow === 0) {
            currentX = 60;
            currentY += memberCardSize + 40;
          }

          try {
            // Load avatar
            const avatarResponse = await axios.get(member.avatar, { responseType: "arraybuffer" });
            const avatarImg = await loadImage(Buffer.from(avatarResponse.data));

            const offsetY = Math.sin((progress * Math.PI * 2) + (memberIndex * 0.3)) * 3;

            // Member card background
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(currentX - 10, currentY - 10 + offsetY, memberCardSize, memberCardSize);

            // Avatar circle
            ctx.save();
            ctx.beginPath();
            ctx.arc(currentX + 75, currentY + 60 + offsetY, 50, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImg, currentX + 25, currentY + 10 + offsetY, 100, 100);
            ctx.restore();

            // Border (neon for admins)
            if (member.isAdmin) {
              const adminColorIndex = adminIDs.indexOf(member.id) % neonColors.length;
              ctx.strokeStyle = neonColors[adminColorIndex];
              ctx.lineWidth = 4;
              ctx.shadowBlur = 15;
              ctx.shadowColor = neonColors[adminColorIndex];
            } else {
              ctx.strokeStyle = "#555555";
              ctx.lineWidth = 2;
              ctx.shadowBlur = 0;
            }
            ctx.beginPath();
            ctx.arc(currentX + 75, currentY + 60 + offsetY, 52, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Admin badge
            if (member.isAdmin) {
              ctx.fillStyle = "#ffd700";
              ctx.font = "20px Arial";
              ctx.textAlign = "center";
              ctx.fillText("👑", currentX + 120, currentY + 30 + offsetY);
            }

            // Name
            ctx.fillStyle = "#ffffff";
            ctx.font = "14px Arial";
            ctx.textAlign = "center";
            const displayName = member.name.length > 15 ? member.name.substring(0, 12) + "..." : member.name;
            ctx.fillText(displayName, currentX + 75, currentY + 135 + offsetY);

            // Message count
            ctx.fillStyle = "#aaaaaa";
            ctx.font = "12px Arial";
            ctx.fillText(`${member.messageCount} msgs`, currentX + 75, currentY + 155 + offsetY);

          } catch (err) {
            // Skip if avatar fails to load
          }

          currentX += memberCardSize + 20;
          memberIndex++;
        }

        // Add frame to GIF
        encoder.addFrame(ctx);
      }

      encoder.finish();
      const buffer = encoder.out.getData();

      // Save GIF
      const filePath = path.join(__dirname, "cache", `groupcard_${threadID}.gif`);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, buffer);

      // Send GIF
      await message.reply({
        body: getLang("success"),
        attachment: fs.createReadStream(filePath)
      });

      // Cleanup
      await fs.unlink(filePath);

    } catch (error) {
      console.error(error);
      message.reply(getLang("error", { error: error.message }));
    }
  }
};