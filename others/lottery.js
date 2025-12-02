const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "lottery",
    aliases: ["lotto", "jackpot", "lucky"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 60,
    role: 0,
    description: "Group lottery system - random winner gets virtual prize with dramatic reveal",
    category: "game",
    guide: "{pn} - Join current lottery\n{pn} draw - Draw winner (admin only)\n{pn} stats - View lottery stats\n{pn} history - View past winners"
  },

  ST: async function ({ message, args, event, api, threadsData, usersData }) {
    try {
      if (!event.isGroup) {
        return message.reply("❌ Lottery only works in groups!");
      }

      const lotteryFile = path.join(process.cwd(), "lottery_data.json");
      
      function loadLotteryData() {
        try {
          if (fs.existsSync(lotteryFile)) {
            return JSON.parse(fs.readFileSync(lotteryFile, "utf-8"));
          }
        } catch (err) {}
        return { threads: {} };
      }

      function saveLotteryData(data) {
        try {
          fs.writeFileSync(lotteryFile, JSON.stringify(data, null, 2));
        } catch (error) {
          console.error("Lottery save error:", error);
        }
      }

      const lotteryData = loadLotteryData();
      const threadID = event.threadID;

      if (!lotteryData.threads[threadID]) {
        lotteryData.threads[threadID] = {
          participants: [],
          winners: [],
          totalDraws: 0,
          createdAt: Date.now()
        };
      }

      const threadLottery = lotteryData.threads[threadID];

      if (args[0] === "stats") {
        const totalParticipants = threadLottery.participants.length;
        const totalDraws = threadLottery.totalDraws;
        const lastWinner = threadLottery.winners[threadLottery.winners.length - 1];

        let statsMsg = `🎰 LOTTERY STATISTICS\n`;
        statsMsg += `═══════════════════════════════════\n\n`;
        statsMsg += `📊 Current Pool:\n`;
        statsMsg += `├─ Participants: ${totalParticipants}\n`;
        statsMsg += `├─ Total Draws: ${totalDraws}\n`;
        statsMsg += `└─ Prize Pool: 💎 ${totalParticipants * 100} coins\n\n`;

        if (lastWinner) {
          const winnerInfo = await usersData.get(lastWinner.uid);
          const winnerName = winnerInfo?.name || "Unknown";
          statsMsg += `🏆 Last Winner:\n`;
          statsMsg += `├─ Name: ${winnerName}\n`;
          statsMsg += `├─ Prize: ${lastWinner.prize}\n`;
          statsMsg += `└─ Date: ${new Date(lastWinner.timestamp).toLocaleString()}\n\n`;
        }

        statsMsg += `💡 Use "${this.config.name}" to join!\n`;
        statsMsg += `═══════════════════════════════════`;

        return message.reply(statsMsg);
      }

      if (args[0] === "history") {
        if (threadLottery.winners.length === 0) {
          return message.reply("📜 No lottery history yet!\n\nBe the first winner! 🎰");
        }

        let historyMsg = `📜 LOTTERY HISTORY\n`;
        historyMsg += `═══════════════════════════════════\n\n`;

        const recentWinners = threadLottery.winners.slice(-10).reverse();
        
        for (let i = 0; i < recentWinners.length; i++) {
          const winner = recentWinners[i];
          const winnerInfo = await usersData.get(winner.uid);
          const winnerName = winnerInfo?.name || "Unknown";
          const date = new Date(winner.timestamp).toLocaleDateString();
          
          historyMsg += `${i + 1}. 🏆 ${winnerName}\n`;
          historyMsg += `   ├─ Prize: ${winner.prize}\n`;
          historyMsg += `   └─ Date: ${date}\n\n`;
        }

        historyMsg += `═══════════════════════════════════\n`;
        historyMsg += `Total Draws: ${threadLottery.totalDraws}`;

        return message.reply(historyMsg);
      }

      if (args[0] === "draw") {
        const threadInfo = await threadsData.get(threadID);
        const senderMember = threadInfo?.members?.find(m => m.userID === event.senderID);
        
        if (!senderMember || (senderMember.role !== "admin" && senderMember.role !== "moderator")) {
          return message.reply("⛔ Only group admins can draw the lottery!");
        }

        if (threadLottery.participants.length < 2) {
          return message.reply("❌ Need at least 2 participants to draw!\n\nCurrent participants: " + threadLottery.participants.length);
        }

        await message.reply(
          `🎰 LOTTERY DRAW INITIATED!\n\n` +
          `🎫 Total Participants: ${threadLottery.participants.length}\n` +
          `💰 Prize Pool: 💎 ${threadLottery.participants.length * 100} coins\n\n` +
          `🎲 Drawing in 3... 2... 1...`
        );

        await new Promise(resolve => setTimeout(resolve, 3000));

        const winnerUID = threadLottery.participants[Math.floor(Math.random() * threadLottery.participants.length)];
        const winnerInfo = await usersData.get(winnerUID);
        const winnerName = winnerInfo?.name || "Unknown Winner";

        const prizes = [
          "💎 1000 Virtual Coins",
          "🏆 Legendary Status",
          "👑 VIP Role for 24h",
          "🎁 Mystery Box",
          "⭐ 5 Star Rating",
          "🔥 Hot Streak Bonus",
          "💰 Jackpot Prize",
          "🎊 Grand Prize"
        ];

        const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];

        threadLottery.winners.push({
          uid: winnerUID,
          name: winnerName,
          prize: randomPrize,
          timestamp: Date.now(),
          participants: threadLottery.participants.length
        });

        threadLottery.totalDraws++;
        threadLottery.participants = [];

        saveLotteryData(lotteryData);

        let winMsg = `🎊 LOTTERY RESULTS 🎊\n`;
        winMsg += `═══════════════════════════════════\n\n`;
        winMsg += `🎰 WINNER ANNOUNCEMENT!\n\n`;
        winMsg += `🏆 CONGRATULATIONS!\n`;
        winMsg += `👤 Winner: ${winnerName}\n`;
        winMsg += `🆔 UID: ${winnerUID}\n`;
        winMsg += `🎁 Prize: ${randomPrize}\n`;
        winMsg += `🎫 Beat ${threadLottery.participants.length - 1} other players!\n\n`;
        winMsg += `═══════════════════════════════════\n`;
        winMsg += `🎲 New lottery started!\n`;
        winMsg += `Use "${this.config.name}" to join next draw!`;

        try {
          await api.setMessageReaction("🎉", event.messageID, () => {}, true);
        } catch (err) {}

        return message.reply(winMsg);
      }

      const participantExists = threadLottery.participants.includes(event.senderID);

      if (participantExists) {
        return message.reply(
          `⚠️ YOU'RE ALREADY IN!\n\n` +
          `🎫 Your ticket is registered\n` +
          `👥 Current participants: ${threadLottery.participants.length}\n` +
          `💰 Current prize pool: 💎 ${threadLottery.participants.length * 100}\n\n` +
          `⏳ Wait for admin to draw!`
        );
      }

      threadLottery.participants.push(event.senderID);
      saveLotteryData(lotteryData);

      const senderInfo = await usersData.get(event.senderID);
      const senderName = senderInfo?.name || "Player";

      let joinMsg = `🎰 LOTTERY ENTRY CONFIRMED!\n`;
      joinMsg += `═══════════════════════════════════\n\n`;
      joinMsg += `✅ ${senderName} joined the lottery!\n\n`;
      joinMsg += `🎫 Ticket Number: #${threadLottery.participants.length}\n`;
      joinMsg += `👥 Total Participants: ${threadLottery.participants.length}\n`;
      joinMsg += `💰 Prize Pool: 💎 ${threadLottery.participants.length * 100} coins\n`;
      joinMsg += `🎲 Odds: 1/${threadLottery.participants.length}\n\n`;
      joinMsg += `═══════════════════════════════════\n`;
      joinMsg += `🍀 Good luck!\n`;
      joinMsg += `⏳ Waiting for admin to draw...`;

      return message.reply(joinMsg);

    } catch (error) {
      console.error("Lottery command error:", error);
      return message.reply(
        `❌ LOTTERY ERROR!\n\n` +
        `Error: ${error.message}\n\n` +
        `Please try again later!`
      );
    }
  }
};