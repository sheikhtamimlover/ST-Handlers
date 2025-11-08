const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "info",
    version: "2.5.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 0,
    shortDescription: "Owner information command",
    longDescription: "This command provides detailed info about Sheikh Tamim — the bot owner, uptime, and social contacts.",
    category: "owner",
    guide: {}
  },

  onStart: async function ({ message }) {
    const data = {
      name: "𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵",
      age: "😁",
      home: "𝐁𝐨𝐫𝐧 𝐈𝐧 𝐁𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡 𝐋𝐢𝐯𝐢𝐧𝐠 𝐭𝐨𝐤𝐲𝐨",
      messenger: "m.me/ayesha.queen.911",
      facebook: "facebook.com/ayesha.queen.911",
      whatsapp: "😁",
      socials: {
        youtube: "N/A",
        telegram: "N/A",
        instagram: "@ayesha_queen_cute",
        capcut: "N/A",
        tiktok: "N/A"
      },
      image: "https://files.catbox.moe/k1zo2t.mp4"
    };

    const now = moment().tz('Asia/Dhaka');
    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const body = `╭───────────────────╮
│ ㅤㅤ✨ 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 ✨   ㅤ│
╰───────────────────╯

🤖 𝐁𝐎𝐓
━━━━━━━━━━━━━━━━━━━━
• ${global.GoatBot.config.nickNameBot}
• ${global.GoatBot.config.prefix}
• ${d}d ${h}h ${m}m ${s}s
• ${now.format('MMM Do YYYY')}
• ${now.format('h:mm A')}

👑 𝐎𝐖𝐍𝐄𝐑
━━━━━━━━━━━━━━━━━━━━
• Name: ${data.name}
• Age: ${data.age} Years
• Home: 🌳 ${data.home} 
• Whatsapp: ${data.whatsapp}
• Facebook: ${data.facebook}

🌐 𝐒𝐎𝐂𝐈𝐀𝐋𝐒
━━━━━━━━━━━━━━━━━━━━
📺 Youtube: ${data.socials.youtube}
✈️ Telegram: ${data.socials.telegram}
📷 Instagram: ${data.socials.instagram}
🧿 CapCut: ${data.socials.capcut}
🎵TikTok: ${data.socials.tiktok}

╭──────────────────╮
👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑
╰──────────────────╯`;

    try {
      const attachment = await global.utils.getStreamFromURL(data.image);
      message.reply({ body, attachment });
    } catch (error) {
      message.reply(body);
    }
  },

  onChat: async function ({ event, message }) {
    if (event.body?.toLowerCase() === "info") {
      this.onStart({ message });
    }
  }
};