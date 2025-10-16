module.exports = {
  config: {
    name: "version",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Display current bot version with beautiful neon canvas image",
    category: "info",
    guide: "{pn}"
  },

  ST: async function({ message, event, api, usersData, threadsData, prefix }) {
    const { createCanvas, loadImage, registerFont } = require('canvas');
    const fs = require('fs-extra');
    const path = require('path');
    const axios = require('axios');

    try {
      const packageJson = require('../../package.json');
      const currentVersion = packageJson.version;

      // Create canvas
      const canvas = createCanvas(1400, 700);
      const ctx = canvas.getContext('2d');

      // Modern gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 1400, 700);
      bgGradient.addColorStop(0, '#1a1a2e');
      bgGradient.addColorStop(0.3, '#16213e');
      bgGradient.addColorStop(0.7, '#0f3460');
      bgGradient.addColorStop(1, '#1a1a2e');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1400, 700);

      // Subtle geometric pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 1400; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 700);
        ctx.stroke();
      }
      for (let i = 0; i < 700; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(1400, i);
        ctx.stroke();
      }

      // Glowing particles
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * 1400;
        const y = Math.random() * 700;
        const size = Math.random() * 3 + 1;
        const alpha = Math.random() * 0.6 + 0.2;
        
        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        particleGradient.addColorStop(0, `rgba(0, 255, 255, ${alpha})`);
        particleGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
        
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Professional neon text function
      function drawPremiumNeon(text, x, y, fontSize, mainColor, glowColor, intensity = 1) {
        ctx.font = `bold ${fontSize}px "Impact", "Arial Black", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.letterSpacing = '2px';
        
        // Multiple glow layers for depth
        for (let i = 5; i > 0; i--) {
          ctx.shadowColor = glowColor;
          ctx.shadowBlur = (20 * i * intensity);
          ctx.strokeStyle = glowColor;
          ctx.lineWidth = i * 0.5;
          ctx.strokeText(text, x, y);
        }
        
        // Main stroke
        ctx.shadowBlur = 15 * intensity;
        ctx.strokeStyle = mainColor;
        ctx.lineWidth = 3;
        ctx.strokeText(text, x, y);
        
        // Fill with gradient
        const textGradient = ctx.createLinearGradient(x - 200, y - fontSize/2, x + 200, y + fontSize/2);
        textGradient.addColorStop(0, '#ffffff');
        textGradient.addColorStop(0.5, mainColor);
        textGradient.addColorStop(1, '#ffffff');
        ctx.fillStyle = textGradient;
        ctx.fillText(text, x, y);
        
        // Reset
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }

      // Decorative top line
      const lineGradient = ctx.createLinearGradient(200, 80, 1200, 80);
      lineGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
      lineGradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.8)');
      lineGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, 80);
      ctx.lineTo(1200, 80);
      ctx.stroke();

      // Title
      drawPremiumNeon('ST BOT', 700, 150, 90, '#00d4ff', '#00ffff', 1.2);

      // Decorative line under title
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(400, 210);
      ctx.lineTo(1000, 210);
      ctx.stroke();

      // Version label
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 10;
      ctx.fillText('CURRENT VERSION', 700, 280);
      ctx.shadowBlur = 0;

      // Version number (main focus)
      drawPremiumNeon(currentVersion, 700, 370, 120, '#00ff88', '#00ff88', 1.5);

      // Info panel background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(250, 470, 900, 160, 15);
      ctx.fill();
      ctx.stroke();

      // Info items
      const commands = [
        { cmd: `${prefix}update`, desc: 'Check Updates', icon: '🔄' },
        { cmd: `${prefix}streport`, desc: 'Report Issues', icon: '🐛' },
        { cmd: `${prefix}stai`, desc: 'AI Assistant', icon: '🤖' }
      ];

      ctx.font = 'bold 22px Arial';
      ctx.textAlign = 'left';
      
      let startX = 300;
      commands.forEach((item, index) => {
        const posX = startX + (index * 300);
        const posY = 520;
        
        // Icon
        ctx.font = '32px Arial';
        ctx.fillStyle = '#00d4ff';
        ctx.shadowColor = '#00d4ff';
        ctx.shadowBlur = 15;
        ctx.fillText(item.icon, posX, posY);
        ctx.shadowBlur = 0;
        
        // Command
        ctx.font = 'bold 20px "Courier New", monospace';
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 8;
        ctx.fillText(item.cmd, posX + 50, posY);
        ctx.shadowBlur = 0;
        
        // Description
        ctx.font = '16px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(item.desc, posX + 50, posY + 30);
      });

      // Bottom decorative line
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, 660);
      ctx.lineTo(1200, 660);
      ctx.stroke();

      // Save image
      const imagePath = path.join(__dirname, 'cache', `version_${event.senderID}.png`);
      const buffer = canvas.toBuffer('image/png');
      await fs.outputFile(imagePath, buffer);

      // Send image
      await message.reply({
        attachment: fs.createReadStream(imagePath)
      });

      // Clean up
      await fs.remove(imagePath);

    } catch (error) {
      console.error(error);
      message.reply("❌ Error displaying version information. Please try again.");
    }
  }
};