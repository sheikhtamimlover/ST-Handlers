module.exports = {
  config: {
    name: "count",
    version: "2.0",
    author: "VIP HACK",
    countDown: 5,
    role: 0,
    description: "Count group members by gender",
    category: "info"
  },

  onStart: async function ({ api, event }) {
    try {
      const info = await api.getThreadInfo(event.threadID);
      const members = info.userInfo;

      let male = [];
      let female = [];
      let unknown = [];

      for (let user of members) {
        let name = user.name || "Unknown";

        let g = (user.gender || "").toString().toLowerCase();

        // Support all gender formats
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

      // Male list
      msg += "♂️ Male list:\n";
      if (male.length === 0) msg += "No male found.\n";
      else male.forEach((n, i) => (msg += `${i + 1}. ${n}\n`));

      msg += "\n";

      // Female list
      msg += "♀️ Female list:\n";
      if (female.length === 0) msg += "No female found.\n";
      else female.forEach((n, i) => (msg += `${i + 1}. ${n}\n`));

      msg += "\n";

      // Unknown gender list (optional)
      if (unknown.length > 0) {
        msg += "❓ Unknown gender:\n";
        unknown.forEach((n, i) => (msg += `${i + 1}. ${n}\n`));
      }

      return api.sendMessage(msg, event.threadID);

    } catch (e) {
      console.log(e);
      return api.sendMessage("❌ Error while counting members.", event.threadID);
    }
  }
};