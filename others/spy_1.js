module.exports = {
  config: {
    name: "spy",
    aliases: ["userinfo", "stalk"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Display target user information with neon color animations",
    category: "info",
    guide: "{pn} [@mention or reply]\n{pn} [UID]\n{pn} [leave blank for self]"
  },
  langs: {
    en: {
      noUser: "❌ User not found!",
      fetching: "🔍 Spying on target...",
      error: "❌ Error fetching user information!"
    }
  },
  ST: async function({ message, args, event, api, getLang, usersData }) {
    let targetUID;
    
    // Determine target UID
    if (Object.keys(event.mentions).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
    } else if (event.messageReply) {
      targetUID = event.messageReply.senderID;
    } else if (args[0]) {
      targetUID = args[0];
    } else {
      targetUID = event.senderID;
    }

    try {
      message.reply(getLang("fetching"));
      
      // Fetch user info
      const userInfo = await api.getUserInfo(targetUID);
      const userData = await usersData.get(targetUID);
      const user = userInfo[targetUID];
      
      if (!user) {
        return message.reply(getLang("noUser"));
      }

      // Neon color codes
      const colors = ['🟣', '🔵', '🟢', '🟡', '🟠', '🔴', '🟣'];
      let colorIndex = 0;

      const getNextColor = () => {
        const color = colors[colorIndex % colors.length];
        colorIndex++;
        return color;
      };

      // Build animated info display
      const infoLines = [
        `╔═══════════════════════════╗`,
        `║   🎭 SPY INFORMATION 🎭    ║`,
        `╚═══════════════════════════╝`,
        ``,
        `${getNextColor()} ᴜsᴇʀɴᴀᴍᴇ: ${user.name}`,
        `${getNextColor()} ᴜɪᴅ: ${targetUID}`,
        `${getNextColor()} ɢᴇɴᴅᴇʀ: ${user.gender === 1 ? 'Female' : user.gender === 2 ? 'Male' : 'Other'}`,
        `${getNextColor()} ᴘʀᴏғɪʟᴇ: ${user.profileUrl || 'N/A'}`,
        `${getNextColor()} ʙɪʀᴛʜᴅᴀʏ: ${user.birthday || 'Hidden'}`,
        `${getNextColor()} ʟᴏᴄᴀᴛɪᴏɴ: ${user.location?.name || 'Hidden'}`,
        `${getNextColor()} ʀᴇʟᴀᴛɪᴏɴsʜɪᴘ: ${user.relationship_status || 'Hidden'}`,
        ``,
        `╔═══════════════════════════╗`,
        `║      BOT DATA STATS       ║`,
        `╚═══════════════════════════╝`,
        ``,
        `${getNextColor()} ᴍᴏɴᴇʏ: ${userData?.money || 0}$ 💰`,
        `${getNextColor()} ᴇxᴘ: ${userData?.exp || 0} ⭐`,
        `${getNextColor()} ʙᴀɴɴᴇᴅ: ${userData?.banned ? 'Yes ❌' : 'No ✅'}`,
        ``,
        `┌───────────────────────────┐`,
        `│ 🌟 ST BOT SPY SYSTEM 🌟   │`,
        `└───────────────────────────┘`
      ];

      const finalMessage = infoLines.join('\n');

      // Get profile picture
      const avatar = `https://graph.facebook.com/${targetUID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      message.reply({
        body: finalMessage,
        attachment: await global.utils.getStreamFromURL(avatar)
      });

    } catch (error) {
      console.error(error);
      message.reply(getLang("error"));
    }
  }
};