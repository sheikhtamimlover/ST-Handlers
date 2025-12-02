const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "secretsanta",
    aliases: ["santa", "giftexchange", "secretgift"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 30,
    role: 1,
    description: "Secret Santa gift exchange system - random pairing with mystery reveals",
    category: "games",
    guide: "{pn} start - Start new Secret Santa\n{pn} join - Join current event\n{pn} reveal - Reveal your Secret Santa\n{pn} end - End event and show all pairs"
  },

  ST: async function ({ message, args, event, api, threadsData, usersData }) {
    try {
      if (!event.isGroup) {
        return message.reply("❌ Secret Santa only works in groups!");
      }

      const santaFile = path.join(process.cwd(), `santa_${event.threadID}.json`);

      function loadSantaData() {
        if (fs.existsSync(santaFile)) {
          return JSON.parse(fs.readFileSync(santaFile, "utf-8"));
        }
        return { active: false, participants: [], pairs: [] };
      }

      function saveSantaData(data) {
        fs.writeFileSync(santaFile, JSON.stringify(data, null, 2));
      }

      const santaData = loadSantaData();

      if (args[0] === "start") {
        if (santaData.active) {
          return message.reply("❌ Secret Santa already running!\n\nUse 'secretsanta join' to participate!");
        }

        santaData.active = true;
        santaData.participants = [];
        santaData.pairs = [];
        santaData.startedBy = event.senderID;
        santaData.startDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
        saveSantaData(santaData);

        let startMsg = `🎅 SECRET SANTA EVENT STARTED! 🎄\n\n`;
        startMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        startMsg += `🎁 Gift Exchange is OPEN!\n\n`;
        startMsg += `📋 HOW TO PARTICIPATE:\n`;
        startMsg += `1️⃣ Type: secretsanta join\n`;
        startMsg += `2️⃣ Wait for others to join\n`;
        startMsg += `3️⃣ Admin ends event to reveal pairs\n\n`;
        startMsg += `🎯 Minimum: 3 participants\n`;
        startMsg += `⏰ Started: ${santaData.startDate}\n`;
        startMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        startMsg += `🎄 Let the gifting begin! 🎅`;

        return message.reply(startMsg);
      }

      if (args[0] === "join") {
        if (!santaData.active) {
          return message.reply("❌ No active Secret Santa!\n\nAsk an admin to start one with: secretsanta start");
        }

        const userData = await usersData.get(event.senderID);
        const userName = userData?.name || "Unknown User";

        if (santaData.participants.some(p => p.uid === event.senderID)) {
          return message.reply(`❌ ${userName}, you're already joined!`);
        }

        santaData.participants.push({
          uid: event.senderID,
          name: userName
        });
        saveSantaData(santaData);

        let joinMsg = `✅ ${userName} JOINED!\n\n`;
        joinMsg += `🎅 Participants: ${santaData.participants.length}\n`;
        joinMsg += `👥 Current Members:\n`;
        santaData.participants.forEach((p, i) => {
          joinMsg += `${i + 1}. ${p.name}\n`;
        });
        joinMsg += `\n🎁 Waiting for more Santas...`;

        return message.reply(joinMsg);
      }

      if (args[0] === "reveal") {
        if (!santaData.active || santaData.pairs.length === 0) {
          return message.reply("❌ No pairs assigned yet!\n\nWait for admin to end the event.");
        }

        const myPair = santaData.pairs.find(p => p.giver === event.senderID);
        
        if (!myPair) {
          return message.reply("❌ You're not in this Secret Santa event!");
        }

        const receiverData = await usersData.get(myPair.receiver);
        const receiverName = receiverData?.name || "Mystery Person";

        let revealMsg = `🎁 YOUR SECRET SANTA ASSIGNMENT 🎁\n\n`;
        revealMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        revealMsg += `🎅 You are Secret Santa for:\n\n`;
        revealMsg += `👤 ${receiverName}\n`;
        revealMsg += `🆔 UID: ${myPair.receiver}\n\n`;
        revealMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        revealMsg += `🎯 Your Mission:\n`;
        revealMsg += `Give them an awesome gift!\n`;
        revealMsg += `Keep your identity SECRET! 🤫\n\n`;
        revealMsg += `🎄 Happy Gifting! 🎅`;

        return api.sendMessage(revealMsg, event.senderID);
      }

      if (args[0] === "end") {
        if (!santaData.active) {
          return message.reply("❌ No active Secret Santa to end!");
        }

        if (santaData.participants.length < 3) {
          return message.reply(`❌ Need at least 3 participants!\n\nCurrent: ${santaData.participants.length}`);
        }

        const shuffled = [...santaData.participants].sort(() => Math.random() - 0.5);
        
        santaData.pairs = [];
        for (let i = 0; i < shuffled.length; i++) {
          const giver = shuffled[i];
          const receiver = shuffled[(i + 1) % shuffled.length];
          
          santaData.pairs.push({
            giver: giver.uid,
            giverName: giver.name,
            receiver: receiver.uid,
            receiverName: receiver.name
          });
        }

        santaData.active = false;
        santaData.endDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
        saveSantaData(santaData);

        let endMsg = `🎅 SECRET SANTA PAIRS ASSIGNED! 🎄\n\n`;
        endMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        endMsg += `✅ Event Completed!\n`;
        endMsg += `👥 Total Participants: ${santaData.participants.length}\n`;
        endMsg += `🎁 Pairs Created: ${santaData.pairs.length}\n\n`;
        endMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        endMsg += `📬 CHECK YOUR DMs!\n`;
        endMsg += `Everyone has been messaged their Secret Santa assignment!\n\n`;
        endMsg += `🎯 Use: secretsanta reveal\n`;
        endMsg += `to see who you're gifting to!\n\n`;
        endMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
        endMsg += `🎄 Happy Holidays! 🎅`;

        await message.reply(endMsg);

        for (const pair of santaData.pairs) {
          try {
            let dmMsg = `🎅 SECRET SANTA ASSIGNMENT 🎄\n\n`;
            dmMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
            dmMsg += `Hi ${pair.giverName}!\n\n`;
            dmMsg += `You are Secret Santa for:\n`;
            dmMsg += `👤 ${pair.receiverName}\n\n`;
            dmMsg += `🎁 Give them an awesome gift!\n`;
            dmMsg += `🤫 Keep it SECRET!\n`;
            dmMsg += `━━━━━━━━━━━━━━━━━━━━━\n`;
            dmMsg += `🎄 Happy Gifting! 🎅`;

            await api.sendMessage(dmMsg, pair.giver);
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (err) {
            console.log("DM error for:", pair.giverName);
          }
        }

        return;
      }

      let helpMsg = `🎅 SECRET SANTA COMMANDS 🎄\n\n`;
      helpMsg += `📋 Available Commands:\n`;
      helpMsg += `• secretsanta start - Begin event\n`;
      helpMsg += `• secretsanta join - Participate\n`;
      helpMsg += `• secretsanta reveal - See assignment\n`;
      helpMsg += `• secretsanta end - Finish & assign\n\n`;
      
      if (santaData.active) {
        helpMsg += `🎁 Current Event:\n`;
        helpMsg += `✅ ACTIVE\n`;
        helpMsg += `👥 Participants: ${santaData.participants.length}\n`;
      } else {
        helpMsg += `❌ No active event\n`;
        helpMsg += `Start one with: secretsanta start`;
      }

      return message.reply(helpMsg);

    } catch (error) {
      console.error("Secret Santa error:", error);
      return message.reply(
        `❌ SECRET SANTA FAILED!\n\n` +
        `Error: ${error.message}\n\n` +
        `Santa's sleigh crashed! Try again.`
      );
    }
  }
};