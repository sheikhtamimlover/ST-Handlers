module.exports = {
  config: {
    name: "serverinfo",
    version: "2.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Display detailed server information with animated canvas",
    category: "system",
    guide: "{pn}"
  },

  ST: async function({ message, event, api }) {
    try {
      const { createCanvas } = require('canvas');
      const fs = require('fs-extra');
      const os = require('os');
      const path = require('path');
      const axios = require('axios');
      
      // Get system information
      const startTime = Date.now();
      try {
        await axios.get('https://www.google.com', { timeout: 5000 });
      } catch (e) {}
      const ping = Date.now() - startTime;
      
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      
      const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const usedMem = (totalMem - freeMem).toFixed(2);
      const memPercent = ((usedMem / totalMem) * 100).toFixed(1);
      
      const cpus = os.cpus();
      const cpuModel = cpus[0].model;
      const cpuCores = cpus.length;
      
      // Calculate CPU usage
      let totalIdle = 0, totalTick = 0;
      cpus.forEach(cpu => {
        for (let type in cpu.times) {
          totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
      });
      const cpuUsage = (100 - ~~(100 * totalIdle / totalTick)).toFixed(1);
      
      const platform = os.platform();
      const platformName = platform === 'linux' ? 'Linux' : platform === 'win32' ? 'Windows' : platform === 'darwin' ? 'macOS' : platform;
      const nodeVersion = process.version;
      const arch = os.arch();
      const hostname = os.hostname();
      const systemUptime = os.uptime();

      // Create canvas with modern design
      const width = 1600;
      const height = 1150;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Modern gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#0f0c29');
      bgGradient.addColorStop(0.5, '#302b63');
      bgGradient.addColorStop(1, '#24243e');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Animated particles background
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 2 + 1;
        
        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
        particleGradient.addColorStop(0, '#00d4ff');
        particleGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = particleGradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Header section with glow effect
      const headerGradient = ctx.createLinearGradient(0, 80, width, 80);
      headerGradient.addColorStop(0, '#00d4ff');
      headerGradient.addColorStop(0.5, '#7b2ff7');
      headerGradient.addColorStop(1, '#f107a3');
      
      ctx.shadowColor = '#00d4ff';
      ctx.shadowBlur = 30;
      ctx.fillStyle = headerGradient;
      ctx.font = 'bold 70px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('SERVER ANALYTICS', width / 2, 100);
      ctx.shadowBlur = 0;

      // Subtitle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '28px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText('Real-Time System Monitoring Dashboard', width / 2, 145);

      // Decorative line with gradient
      const lineGradient = ctx.createLinearGradient(300, 175, width - 300, 175);
      lineGradient.addColorStop(0, 'transparent');
      lineGradient.addColorStop(0.5, '#00d4ff');
      lineGradient.addColorStop(1, 'transparent');
      ctx.strokeStyle = lineGradient;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(300, 175);
      ctx.lineTo(width - 300, 175);
      ctx.stroke();

      // Helper function for rounded rectangles
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

      // Enhanced info box function with properly positioned text
      function drawInfoCard(x, y, w, h, title, value, subtext, color) {
        ctx.save();
        
        // Card shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10;
        
        // Card background with gradient
        const cardGradient = ctx.createLinearGradient(x, y, x, y + h);
        cardGradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        cardGradient.addColorStop(1, 'rgba(255, 255, 255, 0.06)');
        ctx.fillStyle = cardGradient;
        roundRect(ctx, x, y, w, h, 20);
        ctx.fill();
        
        // Card border
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(${color}, 0.4)`;
        ctx.lineWidth = 2;
        roundRect(ctx, x, y, w, h, 20);
        ctx.stroke();
        
        // Accent bar
        ctx.fillStyle = `rgba(${color}, 0.9)`;
        roundRect(ctx, x, y, 8, h, 20);
        ctx.fill();
        
        // Title - positioned at top
        ctx.shadowBlur = 0;
        ctx.font = 'bold 19px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(title, x + 30, y + 28);
        
        // Value - positioned in center with glow
        const maxWidth = w - 60;
        let displayValue = value;
        ctx.font = 'bold 32px Arial';
        if (ctx.measureText(value).width > maxWidth) {
          displayValue = value.substring(0, Math.floor(value.length * maxWidth / ctx.measureText(value).width) - 3) + '...';
        }
        
        ctx.shadowColor = `rgba(${color}, 0.9)`;
        ctx.shadowBlur = 20;
        ctx.fillStyle = `rgb(${color})`;
        ctx.textBaseline = 'top';
        ctx.fillText(displayValue, x + 30, y + 70);
        ctx.shadowBlur = 0;
        
        // Subtext - positioned at bottom
        if (subtext) {
          ctx.font = '17px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.textBaseline = 'top';
          ctx.fillText(subtext, x + 30, y + 118);
        }
        
        ctx.restore();
      }

      // Enhanced progress bar with centered text inside
      function drawProgressBar(x, y, w, h, percent, label, color) {
        ctx.save();
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        roundRect(ctx, x, y, w, h, 15);
        ctx.fill();
        
        // Progress with gradient
        const progressGradient = ctx.createLinearGradient(x, y, x + w, y);
        progressGradient.addColorStop(0, `rgba(${color}, 0.8)`);
        progressGradient.addColorStop(1, `rgba(${color}, 1)`);
        ctx.fillStyle = progressGradient;
        const progressWidth = (w - 8) * percent / 100;
        roundRect(ctx, x + 4, y + 4, progressWidth, h - 8, 12);
        ctx.fill();
        
        // Glow effect
        ctx.shadowColor = `rgb(${color})`;
        ctx.shadowBlur = 20;
        ctx.fillStyle = `rgba(${color}, 0.3)`;
        roundRect(ctx, x + 4, y + 4, progressWidth, h - 8, 12);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Label inside the bar
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + (w / 2), y + (h / 2));
        
        // Percentage at the right
        ctx.shadowColor = `rgba(${color}, 0.8)`;
        ctx.shadowBlur = 15;
        ctx.textAlign = 'right';
        ctx.fillStyle = `rgb(${color})`;
        ctx.fillText(`${percent}%`, x + w - 15, y + (h / 2));
        ctx.shadowBlur = 0;
        
        ctx.restore();
      }

      // Row 1 - Performance metrics
      const cardWidth = 480;
      const cardHeight = 160;
      const cardSpacing = 70;
      const startX = 80;
      const startY = 230;

      drawInfoCard(startX, startY, cardWidth, cardHeight, 'PING LATENCY', `${ping}ms`, 'Network Response', '0, 212, 255');
      drawInfoCard(startX + cardWidth + cardSpacing, startY, cardWidth, cardHeight, 'CPU USAGE', `${cpuUsage}%`, `${cpuCores} Cores Active`, '123, 47, 247');
      drawInfoCard(startX + (cardWidth + cardSpacing) * 2, startY, cardWidth, cardHeight, 'NODE VERSION', nodeVersion, 'Runtime Environment', '241, 7, 163');

      // Row 2 - System info
      const row2Y = startY + cardHeight + 50;
      drawInfoCard(startX, row2Y, cardWidth, cardHeight, 'PLATFORM', platformName, arch.toUpperCase(), '0, 255, 136');
      drawInfoCard(startX + cardWidth + cardSpacing, row2Y, cardWidth, cardHeight, 'HOSTNAME', hostname.length > 15 ? hostname.substring(0, 15) + '...' : hostname, 'Server Identity', '255, 107, 0');
      drawInfoCard(startX + (cardWidth + cardSpacing) * 2, row2Y, cardWidth, cardHeight, 'CPU CORES', `${cpuCores}`, 'Processing Units', '255, 193, 7');

      // Memory section with enhanced visualization
      const memY = row2Y + cardHeight + 80;
      ctx.save();
      ctx.font = 'bold 26px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText('MEMORY USAGE', startX, memY - 20);
      ctx.restore();
      
      drawProgressBar(startX, memY, width - (startX * 2), 60, parseFloat(memPercent), `${usedMem} GB / ${totalMem} GB`, '0, 212, 255');

      // CPU Model - full width card
      const cpuY = memY + 120;
      ctx.save();
      
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      
      const cpuCardGradient = ctx.createLinearGradient(startX, cpuY, startX, cpuY + 130);
      cpuCardGradient.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      cpuCardGradient.addColorStop(1, 'rgba(255, 255, 255, 0.06)');
      ctx.fillStyle = cpuCardGradient;
      roundRect(ctx, startX, cpuY, width - (startX * 2), 130, 20);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(123, 47, 247, 0.4)';
      ctx.lineWidth = 2;
      roundRect(ctx, startX, cpuY, width - (startX * 2), 130);
      ctx.stroke();
      
      ctx.fillStyle = 'rgba(123, 47, 247, 0.9)';
      roundRect(ctx, startX, cpuY, 8, 130, 20);
      ctx.fill();
      
      ctx.font = 'bold 19px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('CPU PROCESSOR', startX + 30, cpuY + 28);
      
      ctx.shadowColor = 'rgba(123, 47, 247, 0.9)';
      ctx.shadowBlur = 20;
      ctx.font = 'bold 24px Arial';
      ctx.fillStyle = 'rgb(123, 47, 247)';
      ctx.textBaseline = 'top';
      const maxCpuWidth = width - (startX * 2) - 60;
      let shortCpuModel = cpuModel;
      if (ctx.measureText(cpuModel).width > maxCpuWidth) {
        const charLimit = Math.floor(cpuModel.length * maxCpuWidth / ctx.measureText(cpuModel).width) - 3;
        shortCpuModel = cpuModel.substring(0, charLimit) + '...';
      }
      ctx.fillText(shortCpuModel, startX + 30, cpuY + 70);
      ctx.shadowBlur = 0;
      
      ctx.restore();

      // Uptime section
      const uptimeY = cpuY + 190;
      const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      const sysUptimeDays = Math.floor(systemUptime / 86400);
      const sysUptimeHours = Math.floor((systemUptime % 86400) / 3600);
      const sysUptimeMin = Math.floor((systemUptime % 3600) / 60);
      
      ctx.save();
      ctx.font = 'bold 26px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('UPTIME STATISTICS', startX, uptimeY);
      
      // Bot uptime
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.textBaseline = 'top';
      ctx.fillText('Bot Uptime:', startX, uptimeY + 55);
      
      ctx.shadowColor = 'rgba(0, 255, 136, 0.9)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgb(0, 255, 136)';
      ctx.fillText(uptimeStr, startX + 180, uptimeY + 55);
      ctx.shadowBlur = 0;
      
      // System uptime
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText('System Uptime:', startX + 750, uptimeY + 55);
      
      ctx.shadowColor = 'rgba(0, 212, 255, 0.9)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = 'rgb(0, 212, 255)';
      ctx.fillText(`${sysUptimeDays}d ${sysUptimeHours}h ${sysUptimeMin}m`, startX + 1030, uptimeY + 55);
      ctx.shadowBlur = 0;
      
      ctx.restore();

      // Footer with animation indicator
      const footerGradient = ctx.createLinearGradient(0, height - 60, width, height - 60);
      footerGradient.addColorStop(0, 'rgba(0, 212, 255, 0.3)');
      footerGradient.addColorStop(0.5, 'rgba(123, 47, 247, 0.3)');
      footerGradient.addColorStop(1, 'rgba(241, 7, 163, 0.3)');
      ctx.fillStyle = footerGradient;
      ctx.fillRect(0, height - 60, width, 60);
      
      ctx.save();
      ctx.font = 'italic 22px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ST | Sheikh Tamim - Advanced System Monitor • Live Data', width / 2, height - 30);
      ctx.restore();

      // Save and send image
      const imagePath = path.join(__dirname, 'cache', `serverinfo_${event.senderID}.png`);
      await fs.ensureDir(path.dirname(imagePath));
      const buffer = canvas.toBuffer('image/png');
      await fs.writeFile(imagePath, buffer);

      await message.reply({
        attachment: fs.createReadStream(imagePath)
      });

      await fs.unlink(imagePath);

    } catch (error) {
      message.reply(`❌ Error generating server info: ${error.message}`);
    }
  }
};