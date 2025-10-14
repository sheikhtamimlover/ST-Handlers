module.exports = {
  config: {
    name: "groupinfo",
    version: "2.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 1,
    description: "Display group information with avatars in a beautiful canvas",
    category: "group",
    guide: "{pn}"
  },

  ST: async function({ message, event, api, usersData, threadsData }) {
    try {
      const { createCanvas, loadImage } = require('canvas');
      const fs = require('fs-extra');
      const path = require('path');

      // ---------------------------
      // Helper: normalize text
      // - keeps emojis (if present)
      // - converts/strips fancy unicode letters so Canvas can render
      // ---------------------------
      function normalizeText(input) {
        if (!input) return "";
        // extract emojis and pictographs to re-add later (so they won't be stripped)
        const emojis = input.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu) || [];

        // Normalize using NFKD to decompose characters where possible
        let s = input.normalize('NFKD');

        // Remove combining marks (accents, etc.)
        s = s.replace(/[\u0300-\u036f]/g, '');

        // Remove mathematical alphanumeric & other high-plane fancy characters:
        // Replace characters outside basic ASCII range with a space (we'll later condense)
        // But don't remove emojis we extracted earlier (so strip them first from string)
        s = s.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '');

        // Remove anything that is not ASCII printable (keep letters, numbers, punctuation and space)
        s = s.replace(/[^\x20-\x7E]/g, ' ');

        // Collapse multiple spaces and trim
        s = s.replace(/\s+/g, ' ').trim();

        // Re-append emojis (joined, preserving original order approximated by original text)
        // Place emojis at the end (Canvas may render them if system supports)
        const uniqueEmojis = emojis.join('');
        if (uniqueEmojis) {
          // ensure a separating space if text exists
          s = s ? `${s} ${uniqueEmojis}` : uniqueEmojis;
        }
        return s || "";
      }

      // ---------------------------
      // Get thread info
      // ---------------------------
      const threadInfo = await api.getThreadInfo(event.threadID);
      const groupNameRaw = threadInfo.threadName || "Unnamed Group";
      const groupName = normalizeText(groupNameRaw) || "Unnamed Group";

      const totalMembers = (threadInfo.participantIDs && threadInfo.participantIDs.length) || 0;
      const adminIDs = (threadInfo.adminIDs || []).map(a => a.id);
      const totalAdmins = adminIDs.length;

      // Group avatar fallback
      let groupAvatar = threadInfo.imageSrc || "https://i.imgur.com/0WKEwTM.png";

      // ---------------------------
      // Build participants list (with normalized names)
      // ---------------------------
      const participants = [];
      for (let uid of (threadInfo.participantIDs || [])) {
        try {
          const userInfo = await usersData.get(uid);
          const rawName = (userInfo && (userInfo.name || userInfo.fullName)) || "Facebook User";
          participants.push({
            uid,
            nameRaw: rawName,
            name: normalizeText(rawName) || "Facebook User",
            isAdmin: adminIDs.includes(uid),
            avatar: `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
          });
        } catch (e) {
          participants.push({
            uid,
            nameRaw: "Facebook User",
            name: "Facebook User",
            isAdmin: adminIDs.includes(uid),
            avatar: "https://i.imgur.com/0WKEwTM.png"
          });
        }
      }

      const admins = participants.filter(p => p.isAdmin);
      const members = participants.filter(p => !p.isAdmin);

      // ---------------------------
      // Visual settings
      // ---------------------------
      const neonColors = [
        { main: '#00d4ff', glow: 'rgba(0, 212, 255, 0.8)', bg: 'rgba(0, 212, 255, 0.15)' },
        { main: '#f107a3', glow: 'rgba(241, 7, 163, 0.8)', bg: 'rgba(241, 7, 163, 0.15)' },
        { main: '#7b2ff7', glow: 'rgba(123, 47, 247, 0.8)', bg: 'rgba(123, 47, 247, 0.15)' },
        { main: '#00ff88', glow: 'rgba(0, 255, 136, 0.8)', bg: 'rgba(0, 255, 136, 0.15)' },
        { main: '#ff6b00', glow: 'rgba(255, 107, 0, 0.8)', bg: 'rgba(255, 107, 0, 0.15)' },
        { main: '#ffd700', glow: 'rgba(255, 215, 0, 0.8)', bg: 'rgba(255, 215, 0, 0.15)' }
      ];
      const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];

      // canvas layout
      const width = 1600;
      const baseHeight = 1000;
      const avatarSize = 85;
      const avatarSpacing = 25;
      const avatarsPerRow = 13;
      const rowsNeeded = Math.ceil(Math.max(0, members.length) / avatarsPerRow);
      const avatarSectionHeight = rowsNeeded * (avatarSize + avatarSpacing) + 150;
      const height = baseHeight + avatarSectionHeight;

      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // ---------------------------
      // background
      // ---------------------------
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#0a0a1f');
      bgGradient.addColorStop(0.3, '#1a0a2e');
      bgGradient.addColorStop(0.6, '#16213e');
      bgGradient.addColorStop(1, '#0f1419');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // subtle shapes
      ctx.globalAlpha = 0.08;
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 80 + 40;
        const rotation = Math.random() * Math.PI * 2;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        const shapeGradient = ctx.createLinearGradient(-size/2, -size/2, size/2, size/2);
        shapeGradient.addColorStop(0, neonColors[i % neonColors.length].main);
        shapeGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = shapeGradient;
        ctx.fillRect(-size/2, -size/2, size, size);
        ctx.restore();
      }
      ctx.globalAlpha = 0.2;
      for (let i = 0; i < 150; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 4 + 1;
        const color = neonColors[Math.floor(Math.random() * neonColors.length)].main;
        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        particleGradient.addColorStop(0, color);
        particleGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // roundRect helper
      function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }

      // drawGlassCard helper
      function drawGlassCard(x, y, w, h, r, color) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 25;
        ctx.shadowOffsetY = 12;

        const glassGradient = ctx.createLinearGradient(x, y, x, y + h);
        glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        glassGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
        glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        ctx.fillStyle = glassGradient;
        roundRect(ctx, x, y, w, h, r);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        roundRect(ctx, x, y, w, h, r);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        roundRect(ctx, x + 2, y + 2, w - 4, h / 2, r);
        ctx.stroke();
        ctx.restore();
      }

      // ---------------------------
      // Draw group avatar (center)
      // ---------------------------
      try {
        const groupImg = await loadImage(groupAvatar);
        const groupAvatarSize = 220;
        const groupX = width / 2;
        const groupY = 140;

        // glass circle behind
        ctx.save();
        const glassCircleGradient = ctx.createRadialGradient(groupX, groupY, 0, groupX, groupY, groupAvatarSize / 2 + 15);
        glassCircleGradient.addColorStop(0, 'rgba(255,255,255,0.2)');
        glassCircleGradient.addColorStop(1, 'rgba(255,255,255,0.05)');
        ctx.fillStyle = glassCircleGradient;
        ctx.beginPath();
        ctx.arc(groupX, groupY, groupAvatarSize / 2 + 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.shadowColor = randomColor.glow;
        ctx.shadowBlur = 50;

        ctx.save();
        ctx.beginPath();
        ctx.arc(groupX, groupY, groupAvatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(groupImg, groupX - groupAvatarSize / 2, groupY - groupAvatarSize / 2, groupAvatarSize, groupAvatarSize);
        ctx.restore();

        // double borders
        ctx.strokeStyle = randomColor.main;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(groupX, groupY, groupAvatarSize / 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(groupX, groupY, groupAvatarSize / 2 + 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.shadowBlur = 0;
      } catch (e) {
        // fallback circle
        ctx.fillStyle = randomColor.main;
        ctx.beginPath();
        ctx.arc(width / 2, 140, 110, 0, Math.PI * 2);
        ctx.fill();
      }

      // ---------------------------
      // Group name (normalized)
      // ---------------------------
      ctx.shadowColor = randomColor.glow;
      ctx.shadowBlur = 30;
      // use a font family likely available; avoid exotic fonts so Canvas renders reliably
      ctx.font = 'bold 46px "Segoe UI", "Arial", sans-serif';
      ctx.fillStyle = randomColor.main;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const maxNameWidth = width - 300;
      let displayName = groupName || "Unnamed Group";
      // truncate to fit width
      while (ctx.measureText(displayName).width > maxNameWidth && displayName.length > 0) {
        displayName = displayName.substring(0, displayName.length - 1);
      }
      if (displayName.length < groupName.length && displayName.length > 3) {
        displayName = displayName.substring(0, displayName.length - 3) + '...';
      }
      ctx.fillText(displayName, width / 2, 285);
      ctx.shadowBlur = 0;

      // ---------------------------
      // Stats cards
      // ---------------------------
      const cardY = 365;
      const cardWidth = 450;
      const cardHeight = 130;
      const cardSpacing = 100;
      const startX = (width - (cardWidth * 2 + cardSpacing)) / 2;

      // total members
      drawGlassCard(startX, cardY, cardWidth, cardHeight, 25, randomColor.main);
      ctx.save();
      ctx.font = 'bold 24px "Segoe UI", Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('TOTAL MEMBERS', startX + 35, cardY + 30);
      ctx.shadowColor = randomColor.glow;
      ctx.shadowBlur = 20;
      ctx.font = 'bold 48px "Segoe UI", Arial';
      ctx.fillStyle = randomColor.main;
      ctx.fillText(String(totalMembers), startX + 35, cardY + 68);
      ctx.restore();

      // total admins
      const card2X = startX + cardWidth + cardSpacing;
      const admin2Color = neonColors[(neonColors.indexOf(randomColor) + 2) % neonColors.length];
      drawGlassCard(card2X, cardY, cardWidth, cardHeight, 25, admin2Color.main);
      ctx.save();
      ctx.font = 'bold 24px "Segoe UI", Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('TOTAL ADMINS', card2X + 35, cardY + 30);
      ctx.shadowColor = admin2Color.glow;
      ctx.shadowBlur = 20;
      ctx.font = 'bold 48px "Segoe UI", Arial';
      ctx.fillStyle = admin2Color.main;
      ctx.fillText(String(totalAdmins), card2X + 35, cardY + 68);
      ctx.restore();

      // ---------------------------
      // Admins section (title + line)
      // ---------------------------
      const adminSectionY = cardY + cardHeight + 80;
      ctx.shadowBlur = 0;
      ctx.font = 'bold 34px "Segoe UI", Arial';
      const adminTitleGradient = ctx.createLinearGradient(width / 2 - 200, adminSectionY, width / 2 + 200, adminSectionY);
      adminTitleGradient.addColorStop(0, admin2Color.main);
      adminTitleGradient.addColorStop(0.5, '#ffffff');
      adminTitleGradient.addColorStop(1, admin2Color.main);
      ctx.fillStyle = adminTitleGradient;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('GROUP ADMINS', width / 2, adminSectionY);

      const adminLineY = adminSectionY + 50;
      const adminLineGradient = ctx.createLinearGradient(250, adminLineY, width - 250, adminLineY);
      adminLineGradient.addColorStop(0, 'transparent');
      adminLineGradient.addColorStop(0.5, admin2Color.main);
      adminLineGradient.addColorStop(1, 'transparent');
      ctx.strokeStyle = adminLineGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(250, adminLineY);
      ctx.lineTo(width - 250, adminLineY);
      ctx.stroke();

      // ---------------------------
      // Draw admin avatars + names
      // ---------------------------
      const adminStartY = adminLineY + 65;
      const adminAvatarSize = 100;
      const adminSpacing = 40;
      const maxAdminsPerRow = 10;
      const adminRows = Math.max(1, Math.ceil(admins.length / maxAdminsPerRow));

      for (let row = 0; row < adminRows; row++) {
        const adminsInRow = Math.min(maxAdminsPerRow, admins.length - row * maxAdminsPerRow);
        const totalAdminWidth = adminsInRow * (adminAvatarSize + adminSpacing) - adminSpacing;
        const adminStartX = (width - totalAdminWidth) / 2;

        for (let col = 0; col < adminsInRow; col++) {
          const i = row * maxAdminsPerRow + col;
          if (i >= admins.length) break;

          const x = adminStartX + col * (adminAvatarSize + adminSpacing) + adminAvatarSize / 2;
          const y = adminStartY + row * (adminAvatarSize + adminSpacing + 30) + adminAvatarSize / 2;

          try {
            const adminImg = await loadImage(admins[i].avatar);
            // glow rings
            ctx.save();
            for (let ring = 3; ring > 0; ring--) {
              ctx.globalAlpha = 0.2 / ring;
              ctx.strokeStyle = admin2Color.main;
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.arc(x, y, adminAvatarSize / 2 + (ring * 8), 0, Math.PI * 2);
              ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();

            // glass circle behind
            ctx.save();
            const adminGlassGradient = ctx.createRadialGradient(x, y, 0, x, y, adminAvatarSize / 2 + 10);
            adminGlassGradient.addColorStop(0, 'rgba(255,255,255,0.25)');
            adminGlassGradient.addColorStop(1, 'rgba(255,255,255,0.05)');
            ctx.fillStyle = adminGlassGradient;
            ctx.beginPath();
            ctx.arc(x, y, adminAvatarSize / 2 + 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            ctx.shadowColor = admin2Color.glow;
            ctx.shadowBlur = 30;

            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, adminAvatarSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(adminImg, x - adminAvatarSize / 2, y - adminAvatarSize / 2, adminAvatarSize, adminAvatarSize);
            ctx.restore();

            // borders
            ctx.strokeStyle = admin2Color.main;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(x, y, adminAvatarSize / 2, 0, Math.PI * 2);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, adminAvatarSize / 2 + 6, 0, Math.PI * 2);
            ctx.stroke();

            ctx.shadowBlur = 0;

            // crown
            ctx.save();
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 15;
            ctx.font = '28px "Segoe UI Emoji", Arial';
            ctx.fillStyle = '#ffd700';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('👑', x, y - adminAvatarSize / 2 - 22);
            ctx.restore();

            // draw admin name under avatar (normalized)
            const rawName = admins[i].name || "Admin";
            const nameToShow = rawName.length > 20 ? rawName.substring(0, 17) + '...' : rawName;
            ctx.save();
            ctx.font = '18px "Segoe UI", Arial';
            ctx.fillStyle = 'rgba(255,255,255,0.95)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            // small halo for readability
            ctx.shadowColor = admin2Color.glow;
            ctx.shadowBlur = 8;
            ctx.fillText(nameToShow, x, y + adminAvatarSize / 2 + 8);
            ctx.restore();

          } catch (e) {
            // fallback avatar circle
            ctx.fillStyle = admin2Color.main;
            ctx.beginPath();
            ctx.arc(x, y, adminAvatarSize / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // ---------------------------
      // Members section (title + line)
      // ---------------------------
      const membersY = adminStartY + (adminRows * (adminAvatarSize + adminSpacing + 30)) + 50;
      ctx.shadowBlur = 0;
      ctx.font = 'bold 34px "Segoe UI", Arial';
      const memberTitleGradient = ctx.createLinearGradient(width / 2 - 200, membersY, width / 2 + 200, membersY);
      memberTitleGradient.addColorStop(0, randomColor.main);
      memberTitleGradient.addColorStop(0.5, '#ffffff');
      memberTitleGradient.addColorStop(1, randomColor.main);
      ctx.fillStyle = memberTitleGradient;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('GROUP MEMBERS', width / 2, membersY);

      const memberLineY = membersY + 50;
      const memberLineGradient = ctx.createLinearGradient(250, memberLineY, width - 250, memberLineY);
      memberLineGradient.addColorStop(0, 'transparent');
      memberLineGradient.addColorStop(0.5, randomColor.main);
      memberLineGradient.addColorStop(1, 'transparent');
      ctx.strokeStyle = memberLineGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(250, memberLineY);
      ctx.lineTo(width - 250, memberLineY);
      ctx.stroke();

      // ---------------------------
      // Draw members grid (avatars)
      // ---------------------------
      const avatarStartY = memberLineY + 60;
      const gridStartX = (width - (avatarsPerRow * (avatarSize + avatarSpacing) - avatarSpacing)) / 2;

      for (let i = 0; i < members.length; i++) {
        const row = Math.floor(i / avatarsPerRow);
        const col = i % avatarsPerRow;
        const x = gridStartX + col * (avatarSize + avatarSpacing) + avatarSize / 2;
        const y = avatarStartY + row * (avatarSize + avatarSpacing) + avatarSize / 2;

        try {
          const userImg = await loadImage(members[i].avatar);

          ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';
          ctx.shadowBlur = 15;

          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, avatarSize / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(userImg, x - avatarSize / 2, y - avatarSize / 2, avatarSize, avatarSize);
          ctx.restore();

          ctx.strokeStyle = '#00d4ff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, avatarSize / 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;

        } catch (e) {
          ctx.fillStyle = '#00d4ff';
          ctx.beginPath();
          ctx.arc(x, y, avatarSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ---------------------------
      // Footer
      // ---------------------------
      const footerY = height - 70;
      ctx.save();
      const footerGradient = ctx.createLinearGradient(0, footerY, width, footerY);
      footerGradient.addColorStop(0, 'rgba(0,0,0,0.6)');
      footerGradient.addColorStop(0.5, randomColor.bg);
      footerGradient.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = footerGradient;
      ctx.fillRect(0, footerY, width, 70);

      ctx.shadowBlur = 0;
      ctx.font = 'italic 24px "Segoe UI", Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ST | Sheikh Tamim - Group Information Dashboard', width / 2, footerY + 35);
      ctx.restore();

      // ---------------------------
      // Save and send image
      // ---------------------------
      const imagePath = path.join(__dirname, 'cache', `groupinfo_${event.threadID}.png`);
      await fs.ensureDir(path.dirname(imagePath));
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(imagePath, buffer);

      await message.reply({
        attachment: fs.createReadStream(imagePath)
      });

      // cleanup
      try { await fs.unlink(imagePath); } catch (e) { /* ignore */ }

    } catch (error) {
      // send a helpful error message
      try {
        await message.reply(`❌ Error generating group info: ${error.message}`);
      } catch (e) {
        console.error("Failed to send error message:", e);
      }
    }
  }
};
