module.exports = {
  config: {
    name: "info",
    version: "2.1.1",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Show bot and owner information with editable name and prefix",
    category: "info",
    guide: {
      en: "info"
    }
  },

  ST: async function({ api, event, message }) {
    const moment = require('moment-timezone');

    const BOT = {
      name: "≛⃝𝙰𝚈𝙴𝙰𝙷𝙰 𝚀𝚄𝙴𝙴𝙽👑",
      prefix: "?",
      timezone: "Asia/Dhaka"
    };

    const OWNER = {
      name: "𝐀𝐲𝐞𝐬𝐡𝐚 𝐐𝐮𝐞𝐞𝐧",
      age: "𝐏𝐫𝐢𝐯𝐞𝐭",
      status: "🌳 𝐏𝐞𝐚𝐜𝐞",
      facebook: "https://facebook.com/ayesha.queen.911",
      instagram: "@ayesha_queen_cute"
    };

    const botName = BOT.name;

    const upTime = process.uptime();
    const formatUptime = `${Math.floor(upTime / 3600)}h ${Math.floor((upTime % 3600) / 60)}m ${Math.floor(upTime % 60)}s`;

    const dateNow = moment().tz(BOT.timezone).format("DD/MM/YYYY");
    const timeNow = moment().tz(BOT.timezone).format("hh:mm:ss A");

    const messageText = `
╭───────────────────╮
│ ㅤ✨ 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 ✨ ㅤㅤ│
╰───────────────────╯

🤖 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢
━━━━━━━━━━━━━━━━━━━━
• Name: ${botName}
• Prefix: ${BOT.prefix}
• Up time: ${formatUptime}
• Date: ${dateNow}
• Time: ${timeNow}

👑 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢
━━━━━━━━━━━━━━━━━━━━
• Name: ${OWNER.name}
• Age: ${OWNER.age}
• Status: ${OWNER.status}
• Facebook: ${OWNER.facebook}
• Instagram: ${OWNER.instagram}

╭──────────────────╮
👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑
╰──────────────────╯
    `;

    return message.reply(messageText);
  }
};