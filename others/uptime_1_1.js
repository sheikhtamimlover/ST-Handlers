const { createCanvas } = require('canvas');
const GIFEncoder = require('gifencoder');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

module.exports = {
  config: {
    name: "uptime_1",
    aliases: ["status", "stats", "botinfo"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 10,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Advanced animated bot status with beautiful UI",
    category: "system",
    guide: "{pn} - Show detailed bot status with animation"
  },
  
  langs: {
    en: {
      generating: "🎨 Generating animated status report...",
      error: "❌ Error generating status animation"
    }
  },

  onStart: async function({ message, event, getLang, usersData, threadsData }) {
    try {
      message.reply(getLang("generating"));

      // Get system info
      const totalMem = os.totalmem() / (1024 ** 3);
      const freeMem = os.freemem() / (1024 ** 3);
      const usedMem = totalMem - freeMem;
      const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(1);
      
      const uptimeSeconds = process.uptime();
      const uptimeH = Math.floor(uptimeSeconds / 3600);
      const uptimeM = Math.floor((uptimeSeconds % 3600) / 60);
      const uptimeS = Math.floor(uptimeSeconds % 60);
      
      const osUptime = os.uptime();
      const osUpH = Math.floor(osUptime / 3600);
      const osUpM = Math.floor((osUptime % 3600) / 60);
      
      const cpus = os.cpus();
      const cpuModel = cpus[0].model.substring(0, 40);
      const cpuCores = cpus.length;
      const loadAvg = os.loadavg().map(l => l.toFixed(2));
      
      const platform = os.platform();
      const arch = os.arch();
      const nodeVersion = process.version;
      
      // API Ping simulation
      const startPing = Date.now();
      await new Promise(resolve => setTimeout(resolve, 10));
      const apiPing = Date.now() - startPing;
      const botPing = Date.now() - event.timestamp;
      
      // User and thread stats
      const allUsers = await usersData.getAll();
      const allThreads = await threadsData.getAll();
      const totalUsers = allUsers.length;
      const totalThreads = allThreads.length;
      const activeSessions = Object.keys(global.GoatBot?.onReply || {}).length;

      // Canvas settings
      const width = 800;
      const height = 900;
      const frames = 30;
      
      const encoder = new GIFEncoder(width, height);
      const outputPath = path.join(__dirname, 'cache', `uptime_${event.senderID}.gif`);
      await fs.ensureDir(path.dirname(outputPath));
      
      const stream = fs.createWriteStream(outputPath);
      encoder.createReadStream().pipe(stream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(100);
      encoder.setQuality(10);

      // Generate frames
      for (let frame = 0; frame < frames; frame++) {
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Animated background gradient
        const gradientOffset = (frame / frames) * 360;
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, `hsl(${gradientOffset}, 70%, 20%)`);
        gradient.addColorStop(0.5, `hsl(${gradientOffset + 60}, 60%, 15%)`);
        gradient.addColorStop(1, `hsl(${gradientOffset + 120}, 70%, 20%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Animated particles
        for (let i = 0; i < 20; i++) {
          const x = (i * 40 + frame * 5) % width;
          const y = (Math.sin(frame * 0.1 + i) * 50 + 450);
          ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(frame * 0.2 + i) * 0.1})`;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Title section with animation
        const titleY = 60 + Math.sin(frame * 0.2) * 5;
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 42px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillText('🤖 ST BOT STATUS', width / 2, titleY);
        ctx.shadowBlur = 0;
        
        // Animated underline
        const lineWidth = 300 + Math.sin(frame * 0.3) * 20;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(width / 2 - lineWidth / 2, titleY + 10);
        ctx.lineTo(width / 2 + lineWidth / 2, titleY + 10);
        ctx.stroke();

        let yPos = 130;
        const lineHeight = 35;
        const leftMargin = 60;

        // Helper function to draw section
        const drawSection = (title, items, startY) => {
          // Section title
          ctx.fillStyle = '#ffaa00';
          ctx.font = 'bold 26px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(title, leftMargin, startY);
          
          let y = startY + 35;
          
          // Draw items
          items.forEach((item, index) => {
            const itemY = y + index * lineHeight;
            const alpha = Math.min(1, (frame + index * 2) / frames);
            
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.font = '20px "Courier New"';
            ctx.fillText(item.label, leftMargin + 20, itemY);
            
            ctx.fillStyle = item.color || `rgba(0, 255, 200, ${alpha})`;
            ctx.font = 'bold 20px "Courier New"';
            ctx.fillText(item.value, leftMargin + 300, itemY);
          });
          
          return startY + 35 + items.length * lineHeight + 20;
        };

        // Network Performance
        const getStatusIndicator = (ping) => {
          if (ping < 100) return '🟢';
          if (ping < 300) return '🟡';
          return '🔴';
        };
        
        yPos = drawSection('📡 Network Performance', [
          { label: '├─ API Ping:', value: `${apiPing}ms ${getStatusIndicator(apiPing)}` },
          { label: '├─ Bot Ping:', value: `${botPing}ms ${getStatusIndicator(botPing)}` },
          { label: '└─ Status:', value: 'Online ✅', color: '#00ff00' }
        ], yPos);

        // Uptime Statistics with animated progress bar
        yPos = drawSection('⏱️ Uptime Statistics', [
          { label: '├─ Bot Uptime:', value: `${uptimeH}h ${uptimeM}m ${uptimeS}s` },
          { label: '└─ System Uptime:', value: `${osUpH}h ${osUpM}m` }
        ], yPos);

        // Memory Usage with animated bar
        const memBarWidth = 400;
        const memBarHeight = 25;
        const memBarX = leftMargin + 20;
        const memBarY = yPos;
        
        yPos = drawSection('💾 Memory Usage', [
          { label: '├─ Used:', value: `${usedMem.toFixed(1)}GB / ${totalMem.toFixed(1)}GB` },
          { label: '├─ Percentage:', value: `${memUsagePercent}%`, color: parseFloat(memUsagePercent) > 80 ? '#ff4444' : '#00ff88' },
          { label: '└─ Available:', value: `${freeMem.toFixed(1)}GB` }
        ], yPos);
        
        // Draw memory progress bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(memBarX, memBarY - 35, memBarWidth, memBarHeight);
        
        const memFillWidth = (memBarWidth * parseFloat(memUsagePercent) / 100) * Math.min(1, frame / 15);
        const memGradient = ctx.createLinearGradient(memBarX, 0, memBarX + memFillWidth, 0);
        memGradient.addColorStop(0, '#00ff88');
        memGradient.addColorStop(1, parseFloat(memUsagePercent) > 80 ? '#ff4444' : '#00aaff');
        ctx.fillStyle = memGradient;
        ctx.fillRect(memBarX, memBarY - 35, memFillWidth, memBarHeight);

        // System Specifications
        yPos = drawSection('🧠 System Specifications', [
          { label: '├─ CPU:', value: cpuModel.substring(0, 25) + '...' },
          { label: '├─ Cores:', value: `${cpuCores} cores` },
          { label: '├─ Load Avg:', value: loadAvg.join(', ') },
          { label: '├─ Platform:', value: `${platform} (${arch})` },
          { label: '└─ Node.js:', value: nodeVersion }
        ], yPos);

        // Bot Statistics
        yPos = drawSection('👥 Bot Statistics', [
          { label: '├─ Total Threads:', value: totalThreads.toLocaleString() },
          { label: '├─ Total Users:', value: totalUsers.toLocaleString() },
          { label: '└─ Active Sessions:', value: activeSessions.toString() }
        ], yPos);

        // Footer with pulsing effect
        const footerAlpha = 0.7 + Math.sin(frame * 0.3) * 0.3;
        ctx.fillStyle = `rgba(0, 255, 255, ${footerAlpha})`;
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ Powered by ST | Sheikh Tamim ⚡', width / 2, height - 40);
        
        encoder.addFrame(ctx);
      }

      encoder.finish();
      
      // Wait for stream to finish
      await new Promise(resolve => stream.on('finish', resolve));

      // Send the animated GIF
      await message.reply({
        body: `✨ ST BOT Advanced Status Report\n━━━━━━━━━━━━━━━━━━━━\n⏱️ Uptime: ${uptimeH}h ${uptimeM}m ${uptimeS}s\n💾 Memory: ${memUsagePercent}%\n👥 Users: ${totalUsers.toLocaleString()}\n📡 Threads: ${totalThreads.toLocaleString()}\n━━━━━━━━━━━━━━━━━━━━`,
        attachment: fs.createReadStream(outputPath)
      });

      // Cleanup
      await fs.remove(outputPath);

    } catch (error) {
      console.error('Uptime command error:', error);
      message.reply(getLang("error") + ": " + error.message);
    }
  }
};