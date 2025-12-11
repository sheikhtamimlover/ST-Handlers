const os = require('os');

module.exports = {
  config: {
    name: "uptime",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Show bot uptime",
    category: "system",
    guide: "{pn}"
  },

  ST: async function({ message, event, api }) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    let uptimeString = '';
    if (days > 0) uptimeString += `${days} day${days > 1 ? 's' : ''}, `;
    if (hours > 0) uptimeString += `${hours} hour${hours > 1 ? 's' : ''}, `;
    if (minutes > 0) uptimeString += `${minutes} minute${minutes > 1 ? 's' : ''}, `;
    uptimeString += `${seconds} second${seconds > 1 ? 's' : ''}`;

    const uptimeMessage = `╭─────────────⭓\n` +
      `│ ⏰ Bot Uptime\n` +
      `├─────────────⭓\n` +
      `│ 🕐 ${uptimeString}\n` +
      `╰─────────────⭓`;

    await message.reply(uptimeMessage);
  }
};