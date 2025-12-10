module.exports = {
  config: {
    name: "pair",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Randomly pair two members in the group",
    category: "fun",
    guide: "{pn} - Randomly pair two group members"
  },
  ST: async function({ message, event, api, usersData }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const members = threadInfo.participantIDs.filter(id => id !== api.getCurrentUserID());
      
      if (members.length < 2) {
        return message.reply("❌ Not enough members to create a pair!");
      }

      const randomIndex1 = Math.floor(Math.random() * members.length);
      let randomIndex2 = Math.floor(Math.random() * members.length);
      
      while (randomIndex2 === randomIndex1) {
        randomIndex2 = Math.floor(Math.random() * members.length);
      }

      const person1ID = members[randomIndex1];
      const person2ID = members[randomIndex2];

      const user1Data = await usersData.get(person1ID);
      const user2Data = await usersData.get(person2ID);

      const person1Name = user1Data.name || "Unknown";
      const person2Name = user2Data.name || "Unknown";

      const lovePercentage = Math.floor(Math.random() * 101);

      const msg = `💕 Perfect Pair Found! 💕\n\n` +
                  `👤 ${person1Name}\n` +
                  `❤️ +\n` +
                  `👤 ${person2Name}\n\n` +
                  `💘 Love Compatibility: ${lovePercentage}%\n` +
                  `${lovePercentage > 70 ? "🔥 Perfect Match!" : lovePercentage > 40 ? "💝 Good Chemistry!" : "💔 Just Friends!"}`;

      return message.reply(msg);

    } catch (error) {
      console.error("Pair command error:", error);
      return message.reply("❌ An error occurred while creating a pair!");
    }
  }
};