const fs = require("fs-extra");

module.exports = {
  config: {
    name: "whitelist",
    aliases: ["wl"],
    version: "4.0.0",
    author: "ST",
    countDown: 5,
    role: 2,
    description: {
      en: "Manage whitelist mode for users and threads, including VIP protected list with reply support"
    },
    category: "owner",
    guide: {
      en:
        "  {pn} on/off: Enable/disable user whitelist mode\n" +
        "  {pn} thread on/off: Enable/disable thread whitelist mode\n" +
        "  {pn} add [uid1] [uid2] ... / reply / tag: Add users to whitelist\n" +
        "  {pn} remove [num1] [num2] ... / reply / tag / all: Remove users from whitelist\n" +
        "  {pn} list: Show whitelist users and VIP list\n" +
        "  {pn} thread add [tid1] [tid2] ...: Add threads to whitelist\n" +
        "  {pn} thread remove [num1] [num2] ...: Remove threads from whitelist\n" +
        "  {pn} thread list: Show whitelist threads"
    }
  },

  langs: {
    en: {
      userWlOn: "✅ User whitelist mode ENABLED",
      userWlOff: "❌ User whitelist mode DISABLED",
      threadWlOn: "✅ Thread whitelist mode ENABLED",
      threadWlOff: "❌ Thread whitelist mode DISABLED",
      userAdded: "✅ USER ADDED",
      userRemoved: "❌ USER REMOVED",
      threadAdded: "✅ THREAD ADDED",
      threadRemoved: "❌ THREAD REMOVED",
      userAlready: "⚠️ User %1 is already in whitelist",
      threadAlready: "⚠️ Thread %1 is already in whitelist",
      invalidNumber: "❌ Invalid number",
      noUsers: "📋 No users in whitelist",
      noThreads: "📋 No threads in whitelist",
      noReply: "❌ Please reply to a message or mention a user",
      invalidUid: "❌ Invalid UID",
      protectedUID: "⚠️ Cannot remove protected UID: %1"
    }
  },

  onStart: async function ({ args, message, event, getLang, usersData, threadsData, api }) {
    const { config } = global.GoatBot;
    const { dirConfig } = global.client;
    if (!args[0]) return message.SyntaxError();

    // ===== Helper Functions =====
    const getUserName = async (uid) => {
      try {
        const userInfo = await api.getUserInfo(uid);
        return userInfo[uid]?.name || uid;
      } catch {
        return uid;
      }
    };
    const getThreadName = async (tid) => {
      try {
        const info = await threadsData.get(tid);
        return info.threadName || tid;
      } catch {
        return tid;
      }
    };

    // ===== VIP & Protected Lists =====
    const vipList = config.vipList || ["61578414567795"]; // 👑GOD👑
    const protectedUIDs = config.protectedUIDs || ["61578414567795"];

    // ===== THREAD WHITELIST =====
    if (args[0].toLowerCase() === "thread") {
      if (!args[1]) return message.SyntaxError();
      const action = args[1].toLowerCase();

      switch (action) {
        case "on":
          config.whiteListModeThread.enable = true;
          fs.writeFileSync(dirConfig, JSON.stringify(config, null, 2));
          return message.reply(getLang("threadWlOn"));
        case "off":
          config.whiteListModeThread.enable = false;
          fs.writeFileSync(dirConfig, JSON.stringify(config, null, 2));
          return message.reply(getLang("threadWlOff"));
        case "add": {
          const tids = args.slice(2);
          if (tids.length === 0) return message.reply(getLang("invalidUid"));
          const added = [];
          for (let tid of tids) {
            tid = tid.toString();
            if (config.whiteListModeThread.whiteListThreadIds.includes(tid)) continue;
            config.whiteListModeThread.whiteListThreadIds.push(tid);
            added.push(tid);
          }
          fs.writeFileSync(dirConfig, JSON.stringify(config, null, 2));
          const list = await Promise.all(added.map(async tid => {
            const name = await getThreadName(tid);
            return `╔════════════════\n║ 💬 WHITELISTED THREAD\n╟─ Name : ${name}\n╟─ TID  : ${tid}\n╚════════════════`;
          }));
          return message.reply(list.join("\n"));
        }
        case "remove": {
          const nums = args.slice(2).map(x => parseInt(x)).filter(x => !isNaN(x)).sort((a,b)=>b-a);
          const removed = [];
          for (let num of nums) {
            if (num < 1 || num > config.whiteListModeThread.whiteListThreadIds.length) continue;
            const tid = config.whiteListModeThread.whiteListThreadIds.splice(num - 1, 1)[0];
            removed.push(tid);
          }
          fs.writeFileSync(dirConfig, JSON.stringify(config, null, 2));
          const list = await Promise.all(removed.map(async tid => {
            const name = await getThreadName(tid);
            return `╔════════════════\n║ ❌ THREAD REMOVED\n╟─ Name : ${name}\n╟─ TID  : ${tid}\n╚════════════════`;
          }));
          return message.reply(list.join("\n"));
        }
        case "list": {
          const threads = config.whiteListModeThread.whiteListThreadIds;
          if (!threads || threads.length === 0) return message.reply(getLang("noThreads"));
          const list = await Promise.all(threads.map(async (tid, idx) => {
            const name = await getThreadName(tid);
            return `${idx + 1}\n╔════════════════\n║ 💬 WHITELISTED THREAD\n╟─ Name : ${name}\n╟─ TID  : ${tid}\n╚════════════════`;
          }));
          return message.reply(list.join("\n"));
        }
      }
    }

    // ===== USER WHITELIST =====
    const action = args[0].toLowerCase();

    switch (action) {
      case "on":
        config.whiteListMode.enable = true;
        fs.writeFileSync(dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("userWlOn"));
      case "off":
        config.whiteListMode.enable = false;
        fs.writeFileSync(dirConfig, JSON.stringify(config, null, 2));
        return message.reply(getLang("userWlOff"));

      // ===== ADD =====
      case "add": {
        let uids = [];

        // 1️⃣ Reply user
        if (event.messageReply) uids.push(event.messageReply.senderID);

        // 2️⃣ Mentions
        if (Object.keys(event.mentions).length > 0) uids.push(...Object.keys(event.mentions));

        // 3️⃣ Manually entered UIDs
        uids.push(...args.slice(1).filter(x => !isNaN(x)));

        uids = [...new Set(uids)]; // remove duplicates
        const added = [];
        for (let uid of uids) {
          uid = uid.toString();
          if (config.whiteListMode.whiteListIds.includes(uid) || vipList.includes(uid)) continue;
          config.whiteListMode.whiteListIds.push(uid);
          added.push(uid);
        }

        fs.writeFileSync(dirConfig, JSON.stringify(config, null, 2));

        const list = await Promise.all(added.map(async (uid, idx) => {
          const name = await getUserName(uid);
          return `${idx + 1}\n╔════════════════\n║ 🌸 WHITELISTED USER\n╟─ Name : ${name}\n╟─ UID  : ${uid}\n╚════════════════`;
        }));

        return message.reply(list.join("\n"));
      }

      // ===== REMOVE =====
      case "remove": {
        let uids = [];

        // Reply user
        if (event.messageReply) uids.push(event.messageReply.senderID);

        // Mentioned users
        if (Object.keys(event.mentions).length > 0) uids.push(...Object.keys(event.mentions));

        // Numbers or 'all'
        const normalList = config.whiteListMode.whiteListIds.filter(uid => !vipList.includes(uid));
        let nums = [];
        if (args[1] === "all") nums = normalList.map((_, idx) => idx);
        else nums = args.slice(1).map(x => parseInt(x) - 1).filter(x => !isNaN(x) && x >= 0 && x < normalList.length);

        for (let num of nums) {
          const uid = normalList[num];
          if (uid) uids.push(uid);
        }

        uids = [...new Set(uids)];

        const removed = [];
        const warnings = [];

        for (let uid of uids) {
          if (protectedUIDs.includes(uid) || vipList.includes(uid)) {
            warnings.push(getLang("protectedUID", uid));
            continue;
          }
          const index = config.whiteListMode.whiteListIds.indexOf(uid);
          if (index !== -1) {
            config.whiteListMode.whiteListIds.splice(index, 1);
            removed.push(uid);
          }
        }

        fs.writeFileSync(dirConfig, JSON.stringify(config, null, 2));

        const removedList = await Promise.all(removed.map(async uid => {
          const name = await getUserName(uid);
          return `╔════════════════\n║ ❌ USER REMOVED\n╟─ Name : ${name}\n╟─ UID  : ${uid}\n╚════════════════`;
        }));

        return message.reply([...removedList, ...warnings].join("\n"));
      }

      // ===== LIST =====
      case "list": {
        const vipListOutput = await Promise.all(vipList.map(async uid => {
          const name = await getUserName(uid);
          return `╔════════════════\n║ 👑GOD USER👑\n╟─ Name : ${name}\n╟─ UID  : ${uid}\n╚════════════════`;
        }));

        const normalListFiltered = config.whiteListMode.whiteListIds.filter(uid => !vipList.includes(uid));
        const normalListOutput = normalListFiltered.length === 0
          ? ["📋 No users in whitelist"]
          : await Promise.all(normalListFiltered.map(async (uid, idx) => {
              const name = await getUserName(uid);
              return `${idx + 1}\n╔════════════════\n║ 🌸 WHITELISTED USER\n╟─ Name : ${name}\n╟─ UID  : ${uid}\n╚════════════════`;
            }));

        const totalVIP = vipList.length;
        const totalNormal = normalListFiltered.length;
        const totalUsers = totalVIP + totalNormal;

        const countInfo = `📊 Total Users:\n👑 Gods: ${totalVIP}\n🌸 Whitelisted: ${totalNormal}\n💯 Total: ${totalUsers}`;

        return message.reply(["👑GOD LIST👑", ...vipListOutput, ...normalListOutput, "\n" + countInfo].join("\n\n"));
      }

      default:
        return message.SyntaxError();
    }
  }
};