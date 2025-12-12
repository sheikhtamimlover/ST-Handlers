const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createCanvas, loadImage, registerFont } = require('canvas');

module.exports = {
  config: {
    name: "phone",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Virtual phone simulator with apps",
    category: "fun",
    guide: {
      en: "{pn} - Start virtual phone\nReply with app name to open apps"
    }
  },

  onStart: async function({ message, event, api }) {
    try {
      const canvas = createCanvas(800, 1600);
      const ctx = canvas.getContext('2d');

      // Phone background (locked screen)
      const gradient = ctx.createLinearGradient(0, 0, 0, 1600);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 1600);

      // Time display
      const currentTime = new Date();
      const hours = currentTime.getHours().toString().padStart(2, '0');
      const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${hours}:${minutes}`, 400, 400);

      // Date display
      const date = currentTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
      ctx.font = '40px Arial';
      ctx.fillText(date, 400, 480);

      // Lock icon
      ctx.beginPath();
      ctx.arc(400, 600, 60, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(370, 600, 60, 80);
      ctx.fillRect(360, 660, 80, 40);

      // Swipe up instruction
      ctx.font = 'italic 35px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('Reply "unlock" to unlock', 400, 1400);

      // Notch at top
      ctx.fillStyle = '#000000';
      ctx.fillRect(250, 0, 300, 60);
      ctx.beginPath();
      ctx.arc(250, 60, 30, Math.PI * 1.5, Math.PI);
      ctx.arc(550, 60, 30, 0, Math.PI * 0.5);
      ctx.fill();

      const pathName = path.join(__dirname, 'cache', `phone_${event.senderID}.png`);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(pathName, buffer);

      message.reply({
        body: "📱 Virtual Phone\n━━━━━━━━━━━━━━━\n🔒 Phone is locked\n\nReply 'unlock' to access home screen",
        attachment: fs.createReadStream(pathName)
      }, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          screen: 'locked'
        });
      });

    } catch (error) {
      message.reply("❌ Error creating virtual phone: " + error.message);
    }
  },

  onReply: async function({ message, event, Reply, api }) {
    const { author, screen } = Reply;
    
    if (event.senderID !== author) {
      return message.reply("⚠️ This is not your phone!");
    }

    const userInput = event.body.toLowerCase().trim();

    try {
      // LOCKED SCREEN
      if (screen === 'locked') {
        if (userInput === 'unlock') {
          const canvas = createCanvas(800, 1600);
          const ctx = canvas.getContext('2d');

          // Home screen background
          const gradient = ctx.createLinearGradient(0, 0, 0, 1600);
          gradient.addColorStop(0, '#0f3460');
          gradient.addColorStop(1, '#16213e');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 800, 1600);

          // Status bar
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, 0, 800, 80);
          ctx.fillStyle = '#ffffff';
          ctx.font = '30px Arial';
          ctx.fillText(`${new Date().getHours()}:${new Date().getMinutes().toString().padStart(2, '0')}`, 50, 50);
          ctx.fillText('📶 ⚡ 🔋 95%', 600, 50);

          // Draw app icons
          const apps = [
            { name: 'Chrome', icon: '🌐', color: '#4285f4', row: 0, col: 0 },
            { name: 'Gallery', icon: '🖼️', color: '#ea4335', row: 0, col: 1 },
            { name: 'Camera', icon: '📷', color: '#34a853', row: 0, col: 2 },
            { name: 'Music', icon: '🎵', color: '#fbbc04', row: 1, col: 0 },
            { name: 'Calculator', icon: '🔢', color: '#ff6b6b', row: 1, col: 1 },
            { name: 'Settings', icon: '⚙️', color: '#95a5a6', row: 1, col: 2 },
            { name: 'Messages', icon: '💬', color: '#0084ff', row: 2, col: 0 },
            { name: 'Notes', icon: '📝', color: '#ffd93d', row: 2, col: 1 },
            { name: 'Weather', icon: '🌤️', color: '#87ceeb', row: 2, col: 2 }
          ];

          const startX = 100;
          const startY = 250;
          const spacing = 220;

          apps.forEach(app => {
            const x = startX + (app.col * spacing);
            const y = startY + (app.row * spacing);

            // App icon background
            ctx.fillStyle = app.color;
            ctx.beginPath();
            ctx.roundRect(x, y, 180, 180, 40);
            ctx.fill();

            // App icon emoji
            ctx.font = 'bold 80px Arial';
            ctx.fillText(app.icon, x + 50, y + 115);

            // App name
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(app.name, x + 90, y + 220);
            ctx.textAlign = 'left';
          });

          // Bottom dock
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.roundRect(100, 1350, 600, 180, 40);
          ctx.fill();

          // Dock icons
          ctx.font = 'bold 70px Arial';
          ctx.fillText('📞', 150, 1470);
          ctx.fillText('📧', 350, 1470);
          ctx.fillText('🎮', 550, 1470);

          const pathName = path.join(__dirname, 'cache', `phone_${event.senderID}.png`);
          const buffer = canvas.toBuffer('image/png');
          fs.writeFileSync(pathName, buffer);

          message.reply({
            body: "📱 Home Screen\n━━━━━━━━━━━━━━━\n✅ Phone unlocked!\n\n📌 Available Apps:\n• Chrome - Web browser\n• Gallery - View photos\n• Camera - Take photos\n• Music - Music player\n• Calculator - Math calculations\n• Settings - Phone settings\n• Messages - Text messages\n• Notes - Take notes\n• Weather - Check weather\n\nReply with app name to open",
            attachment: fs.createReadStream(pathName)
          }, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              screen: 'home'
            });
          });
        }
      }

      // HOME SCREEN
      else if (screen === 'home') {
        // CHROME APP
        if (userInput === 'chrome') {
          const canvas = createCanvas(800, 1600);
          const ctx = canvas.getContext('2d');

          // Chrome interface
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 800, 1600);

          // Chrome header
          ctx.fillStyle = '#4285f4';
          ctx.fillRect(0, 0, 800, 120);
          
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 40px Arial';
          ctx.fillText('← Chrome Browser', 30, 75);

          // Search/URL bar
          ctx.fillStyle = '#f1f3f4';
          ctx.beginPath();
          ctx.roundRect(50, 180, 700, 100, 50);
          ctx.fill();

          ctx.fillStyle = '#5f6368';
          ctx.font = '35px Arial';
          ctx.fillText('🔍 Enter URL or search...', 100, 245);

          // Suggestions
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 35px Arial';
          ctx.fillText('🔥 Popular Sites:', 50, 380);

          const sites = ['Google', 'YouTube', 'Facebook', 'Wikipedia', 'Amazon'];
          sites.forEach((site, i) => {
            ctx.fillStyle = '#e8f0fe';
            ctx.fillRect(50, 420 + (i * 100), 700, 80);
            ctx.fillStyle = '#1a73e8';
            ctx.font = '32px Arial';
            ctx.fillText(`🌐 ${site}.com`, 80, 470 + (i * 100));
          });

          const pathName = path.join(__dirname, 'cache', `phone_${event.senderID}.png`);
          const buffer = canvas.toBuffer('image/png');
          fs.writeFileSync(pathName, buffer);

          message.reply({
            body: "🌐 Chrome Browser\n━━━━━━━━━━━━━━━\n\nReply with a URL to visit\nExample: google.com\n\nOr reply 'back' to return home",
            attachment: fs.createReadStream(pathName)
          }, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              screen: 'chrome'
            });
          });
        }

        // CALCULATOR APP
        else if (userInput === 'calculator') {
          const canvas = createCanvas(800, 1600);
          const ctx = canvas.getContext('2d');

          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, 800, 1600);

          // Display
          ctx.fillStyle = '#2d2d2d';
          ctx.fillRect(20, 100, 760, 200);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 70px Arial';
          ctx.textAlign = 'right';
          ctx.fillText('0', 750, 240);

          // Buttons
          const buttons = [
            ['C', '÷', '×', '←'],
            ['7', '8', '9', '-'],
            ['4', '5', '6', '+'],
            ['1', '2', '3', '='],
            ['0', '.', '', '']
          ];

          let y = 350;
          buttons.forEach(row => {
            let x = 20;
            row.forEach(btn => {
              if (btn) {
                ctx.fillStyle = ['C', '÷', '×', '-', '+', '='].includes(btn) ? '#ff9500' : '#505050';
                ctx.fillRect(x, y, 180, 150);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 50px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(btn, x + 90, y + 95);
              }
              x += 195;
            });
            y += 165;
          });

          const pathName = path.join(__dirname, 'cache', `phone_${event.senderID}.png`);
          const buffer = canvas.toBuffer('image/png');
          fs.writeFileSync(pathName, buffer);

          message.reply({
            body: "🔢 Calculator\n━━━━━━━━━━━━━━━\n\nReply with calculation\nExample: 2+2, 10*5, 100/4\n\nOr reply 'back' to return home",
            attachment: fs.createReadStream(pathName)
          }, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              screen: 'calculator'
            });
          });
        }

        // WEATHER APP
        else if (userInput === 'weather') {
          const canvas = createCanvas(800, 1600);
          const ctx = canvas.getContext('2d');

          const gradient = ctx.createLinearGradient(0, 0, 0, 1600);
          gradient.addColorStop(0, '#87ceeb');
          gradient.addColorStop(1, '#4682b4');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 800, 1600);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 50px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('← Weather', 400, 80);

          ctx.font = 'bold 150px Arial';
          ctx.fillText('☀️', 400, 350);

          ctx.font = 'bold 120px Arial';
          ctx.fillText('28°C', 400, 550);

          ctx.font = '45px Arial';
          ctx.fillText('Sunny', 400, 650);
          ctx.fillText('Dhaka, Bangladesh', 400, 720);

          ctx.font = '35px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('🌡️ Feels like: 30°C', 100, 900);
          ctx.fillText('💧 Humidity: 65%', 100, 980);
          ctx.fillText('💨 Wind: 12 km/h', 100, 1060);
          ctx.fillText('🌅 Sunrise: 5:45 AM', 100, 1140);
          ctx.fillText('🌇 Sunset: 6:30 PM', 100, 1220);

          const pathName = path.join(__dirname, 'cache', `phone_${event.senderID}.png`);
          const buffer = canvas.toBuffer('image/png');
          fs.writeFileSync(pathName, buffer);

          message.reply({
            body: "🌤️ Weather App\n━━━━━━━━━━━━━━━\n\nCurrent weather information\n\nReply 'back' to return home",
            attachment: fs.createReadStream(pathName)
          }, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              screen: 'weather'
            });
          });
        }

        else {
          message.reply("❌ App not found! Reply with a valid app name.");
        }
      }

      // CHROME SCREEN
      else if (screen === 'chrome') {
        if (userInput === 'back') {
          return this.onStart({ message, event, api });
        }

        const canvas = createCanvas(800, 1600);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 1600);

        // Chrome header
        ctx.fillStyle = '#4285f4';
        ctx.fillRect(0, 0, 800, 120);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 35px Arial';
        ctx.fillText('← Chrome', 30, 75);

        // URL bar
        ctx.fillStyle = '#f1f3f4';
        ctx.beginPath();
        ctx.roundRect(50, 180, 700, 80, 40);
        ctx.fill();
        ctx.fillStyle = '#5f6368';
        ctx.font = '28px Arial';
        ctx.fillText(`🔒 ${userInput}`, 100, 230);

        // Website content simulation
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 50px Arial';
        ctx.fillText(`Welcome to ${userInput}`, 50, 400);
        
        ctx.font = '32px Arial';
        ctx.fillStyle = '#5f6368';
        const lines = [
          'This is a simulated webpage.',
          'In a real browser, you would see',
          'the actual content of the website.',
          '',
          'Features:',
          '✓ Secure HTTPS connection',
          '✓ Fast loading speed',
          '✓ Mobile optimized'
        ];
        
        lines.forEach((line, i) => {
          ctx.fillText(line, 50, 500 + (i * 60));
        });

        const pathName = path.join(__dirname, 'cache', `phone_${event.senderID}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(pathName, buffer);

        message.reply({
          body: `🌐 Visiting: ${userInput}\n━━━━━━━━━━━━━━━\n\n✅ Page loaded successfully!\n\nReply with another URL or 'back' to return`,
          attachment: fs.createReadStream(pathName)
        }, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            screen: 'chrome'
          });
        });
      }

      // CALCULATOR SCREEN
      else if (screen === 'calculator') {
        if (userInput === 'back') {
          return this.onStart({ message, event, api });
        }

        try {
          const result = eval(userInput.replace('×', '*').replace('÷', '/'));
          
          const canvas = createCanvas(800, 1600);
          const ctx = canvas.getContext('2d');

          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, 800, 1600);

          ctx.fillStyle = '#2d2d2d';
          ctx.fillRect(20, 100, 760, 200);
          ctx.fillStyle = '#888';
          ctx.font = '35px Arial';
          ctx.textAlign = 'right';
          ctx.fillText(userInput, 750, 160);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 70px Arial';
          ctx.fillText(result.toString(), 750, 240);

          const pathName = path.join(__dirname, 'cache', `phone_${event.senderID}.png`);
          const buffer = canvas.toBuffer('image/png');
          fs.writeFileSync(pathName, buffer);

          message.reply({
            body: `🔢 Result: ${result}\n━━━━━━━━━━━━━━━\n\nReply with another calculation or 'back'`,
            attachment: fs.createReadStream(pathName)
          }, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: this.config.name,
              messageID: info.messageID,
              author: event.senderID,
              screen: 'calculator'
            });
          });
        } catch (error) {
          message.reply("❌ Invalid calculation! Try again.");
        }
      }

      // WEATHER SCREEN
      else if (screen === 'weather') {
        if (userInput === 'back') {
          return this.onStart({ message, event, api });
        }
      }

    } catch (error) {
      message.reply("❌ Error: " + error.message);
    }
  }
};