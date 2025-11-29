module.exports = {
  config: {
    name: "cnt",
    version: "3.0",
    author: "VIP HACK",
    countDown: 5,
    role: 0,
    description: "Count group members by gender (Admin Only)",
    category: "info"
  },

  onStart: async function ({ api, event }) {

    const BOT_ADMIN = "61578414567795";

    if (event.senderID !== BOT_ADMIN) {
      return api.sendMessage("❌ You are not allowed to use this command.", event.threadID);
    }

    try {
      const info = await api.getThreadInfo(event.threadID);
      const members = info.userInfo;

      let male = [];
      let female = [];
      let unknown = [];

      for (let user of members) {
        let name = user.name || "Unknown";

        let g = (user.gender || "").toString().toLowerCase();

        if (g === "1" || g === "male" || g === "m") {
          male.push(name);
        }
        else if (g === "2" || g === "female" || g === "f") {
          female.push(name);
        }
        else {
          unknown.push(name);
        }
      }

      let msg = "";

      msg += "🚹 Male list:\n";
      if (male.length === 0) msg += "No male found.\n";
      else male.forEach((n, i) => msg += `${i + 1}. ${n}\n`);

      msg += "\n";

      msg += "🚺 Female list:\n";
      if (female.length === 0) msg += "No female found.\n";
      else female.forEach((n, i) => msg += `${i + 1}. ${n}\n`);

      msg += "\n";

      if (unknown.length > 0) {
        msg += "⚧️ Geys :\n";
        unknown.forEach((n, i) => msg += `${i + 1}. ${n}\n`);
        msg += "\n";
      }

      msg += `🚹 = ${male.length}\n`;
      msg += `🚺 = ${female.length}\n`;
      msg += `⚧️ = ${unknown.length}\n`;
      msg += `🚻 = ${members.length}`;

      return api.sendMessage(msg, event.threadID);

    } catch (e) {
      console.log(e);
      return api.sendMessage("❌ Error while counting members.", event.threadID);
    }
  }
};