module.exports = {
  config: {
    name: "uptime",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Shows bot uptime and system information in aesthetic style",
    category: "system",
    guide: "{pn}"
  },

  ST: async function({ message, args, event, api, usersData, threadsData }) {
    const loadingMsg = await message.reply(`🌕 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞...\n🌑 [░░░░░░░░░░░░░░] 0%`);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    api.editMessage(`🌕 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞...\n🌒 [▓▓▓▓░░░░░░░░░░] 25%`, loadingMsg.messageID);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    api.editMessage(`🌕 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞...\n🌓 [▓▓▓▓▓▓▓▓░░░░░░] 50%`, loadingMsg.messageID);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    api.editMessage(`🌕 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞...\n🌔 [▓▓▓▓▓▓▓▓▓▓▓▓░░] 75%`, loadingMsg.messageID);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    api.editMessage(`🌕 𝐋𝐨𝐚𝐝𝐢𝐧𝐠 𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞...\n🌕 [▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%`, loadingMsg.messageID);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    const uptimeString = `${days}ᴅ ${hours}ʜ ${minutes}ᴍ ${seconds}ꜱ`;
    
    const ping = Date.now() - event.timestamp;
    
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    
    const totalUsers = await usersData.getAll();
    const totalThreads = await threadsData.getAll();
    
    const message_text = `✧･ﾟ: *✧･ﾟ:* *:･ﾟ✧*:･ﾟ✧\n` +
      `┏━━━━━━━━━━━━━━━━━┓\n` +
      `┃ ✨ 𝐵𝑜𝑡 𝑈𝑝𝑡𝑖𝑚𝑒 𝐼𝑛𝑓𝑜 ✨ㅤ┃\n` +
      `┗━━━━━━━━━━━━━━━━━┛\n\n` +
      `╔═══════════════════╗\n` +
      `║ 🕒 ᴜᴘᴛɪᴍᴇ\n` +
      `║ ➜ ${uptimeString}\n` +
      `╟───────────────────╢\n` +
      `║ 📶 ᴘɪɴɢ\n` +
      `║ ➜ ${ping}ᴍꜱ\n` +
      `╟───────────────────╢\n` +
      `║ 📅 ᴅᴀᴛᴇ\n` +
      `║ ➜ ${date}\n` +
      `╟───────────────────╢\n` +
      `║ 💻 ᴍᴇᴍᴏʀʏ\n` +
      `║ ➜ ${memoryUsage} ᴍʙ\n` +
      `╟───────────────────╢\n` +
      `║ 👥 ᴛᴏᴛᴀʟ ᴜꜱᴇʀꜱ\n` +
      `║ ➜ ${totalUsers.length}\n` +
      `╟───────────────────╢\n` +
      `║ 💬 ᴛᴏᴛᴀʟ ᴛʜʀᴇᴀᴅꜱ\n` +
      `║ ➜ ${totalThreads.length}\n` +
      `╟───────────────────╢\n` +
      `║ 👑 ᴏᴡɴᴇʀ\n` +
      `║ ➜ AYESHA QUEEN\n` +
      `╚═══════════════════╝\n\n` +
      ` ≛⃝𝙰𝚈𝙴𝙰𝙷𝙰 𝚀𝚄𝙴𝙴𝙽👑\n` +
      `✧･ﾟ: *✧･ﾟ:* *:･ﾟ✧*:･ﾟ✧`;
    
    return api.editMessage(message_text, loadingMsg.messageID);
  }
};
