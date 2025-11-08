const fs = require("fs-extra");
const path = require("path");

const dataPath = path.join(__dirname, 'cache', 'noticebox_data.json');

async function loadData() {
  try {
    await fs.ensureFile(dataPath);
    const data = await fs.readFile(dataPath, 'utf8');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

async function saveData(data) {
  await fs.ensureDir(path.dirname(dataPath));
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "noticebox",
    aliases: ["notice", "rules", "boxrules"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 1,
    description: "Set custom rules/notice for group box",
    category: "box chat",
    guide: {
      en: "{pn} set <message> - Set custom notice for this group\n{pn} view - View current notice\n{pn} remove - Remove notice\n{pn} - Show notice to all members"
    }
  },

  ST: async function({ message, args, event, api, threadsData }) {
    const threadID = event.threadID;
    const data = await loadData();

    if (!args[0]) {
      if (!data[threadID] || !data[threadID].notice) {
        return message.reply("⚠️ এই গ্রুপের জন্য কোন নিয়ম/নোটিস সেট করা নেই!\n\nব্যবহার: noticebox set <আপনার নিয়ম>");
      }

      const notice = data[threadID].notice;
      const setBy = data[threadID].setBy || "Unknown";
      const setTime = data[threadID].setTime || "Unknown";

      return message.reply({
        body: `📋 গ্রুপ নিয়মাবলী/নোটিস\n${'━'.repeat(30)}\n\n${notice}\n\n${'━'.repeat(30)}\n👤 সেট করেছেন: ${setBy}\n⏰ সময়: ${setTime}`
      });
    }

    const command = args[0].toLowerCase();

    if (command === "set") {
      if (args.length < 2) {
        return message.reply("⚠️ নিয়ম/নোটিস লিখুন!\n\nউদাহরণ: noticebox set এই গ্রুপে সবাইকে সম্মান করতে হবে");
      }

      const notice = args.slice(1).join(" ");
      const userInfo = await api.getUserInfo(event.senderID);
      const userName = userInfo[event.senderID]?.name || "Unknown";
      const currentTime = new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });

      if (!data[threadID]) {
        data[threadID] = {};
      }

      data[threadID].notice = notice;
      data[threadID].setBy = userName;
      data[threadID].setTime = currentTime;
      data[threadID].setByUID = event.senderID;

      await saveData(data);

      return message.reply(`✅ গ্রুপ নিয়ম/নোটিস সফলভাবে সেট করা হয়েছে!\n\n📋 নোটিস:\n${notice}\n\n👤 সেট করেছেন: ${userName}\n⏰ সময়: ${currentTime}`);
    }

    else if (command === "view") {
      if (!data[threadID] || !data[threadID].notice) {
        return message.reply("⚠️ এই গ্রুপের জন্য কোন নিয়ম/নোটিস সেট করা নেই!");
      }

      const notice = data[threadID].notice;
      const setBy = data[threadID].setBy || "Unknown";
      const setTime = data[threadID].setTime || "Unknown";

      return message.reply({
        body: `📋 গ্রুপ নিয়মাবলী/নোটিস\n${'━'.repeat(30)}\n\n${notice}\n\n${'━'.repeat(30)}\n👤 সেট করেছেন: ${setBy}\n⏰ সময়: ${setTime}`
      });
    }

    else if (command === "remove" || command === "delete") {
      if (!data[threadID] || !data[threadID].notice) {
        return message.reply("⚠️ এই গ্রুপের জন্য কোন নিয়ম/নোটিস সেট করা নেই!");
      }

      delete data[threadID];
      await saveData(data);

      return message.reply("✅ গ্রুপ নিয়ম/নোটিস সফলভাবে মুছে ফেলা হয়েছে!");
    }

    else {
      return message.reply("⚠️ ভুল কমান্ড!\n\nব্যবহার:\n• noticebox set <নিয়ম> - নিয়ম সেট করুন\n• noticebox view - নিয়ম দেখুন\n• noticebox remove - নিয়ম মুছুন\n• noticebox - সবাইকে নিয়ম দেখান");
    }
  }
};