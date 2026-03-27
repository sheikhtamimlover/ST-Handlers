module.exports = {
  config: {
    name: "okjs",
    aliases: ["grouplock", "namelock"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 1,
    premium: false,
    usePrefix: true,
    description: "Lock group name and auto-kick users who change it",
    category: "group management",
    guide: "{pn} on - Enable group name lock\n{pn} off - Disable group name lock\n{pn} list - Show all locked groups"
  },
  langs: {
    en: {
      enabled: "✅ Group name lock enabled! Current name: {groupName}\nUsers who change the name 3 times will get a warning, 4th time = kicked & banned.",
      disabled: "❌ Group name lock disabled for this group.",
      notEnabled: "⚠️ Group name lock is not enabled in this group.",
      list: "📋 Locked Groups:\n{list}",
      noLocked: "No groups are currently locked.",
      warning: "⚠️ WARNING {count}/3\n{name}, you changed the group name!\nThe locked name is: {lockedName}\nOne more change and you'll be kicked & banned!",
      kicked: "🚫 {name} has been kicked and permanently banned for changing the group name 4 times!\nLocked name: {lockedName}",
      autoKick: "🚫 Auto-kicked banned user {name} who was added back to the group.",
      restored: "✅ Group name restored to: {groupName}"
    }
  },
  ST: async function({ message, args, event, api, getLang, threadsData }) {
    const { threadID, senderID } = event;
    const command = args[0]?.toLowerCase();

    let lockData = await threadsData.get(threadID, "data.okjs") || {};
    if (!lockData.locks) lockData.locks = {};
    if (!lockData.violations) lockData.violations = {};
    if (!lockData.banned) lockData.banned = [];

    if (command === "on") {
      const threadInfo = await api.getThreadInfo(threadID);
      const groupName = threadInfo.threadName;
      
      lockData.locks[threadID] = {
        name: groupName,
        enabled: true,
        lockedBy: senderID,
        lockedAt: Date.now()
      };

      await threadsData.set(threadID, lockData, "data.okjs");
      return message.reply(getLang("enabled", { groupName }));
    }

    if (command === "off") {
      if (!lockData.locks[threadID]?.enabled) {
        return message.reply(getLang("notEnabled"));
      }

      lockData.locks[threadID].enabled = false;
      delete lockData.violations[threadID];
      
      await threadsData.set(threadID, lockData, "data.okjs");
      return message.reply(getLang("disabled"));
    }

    if (command === "list") {
      const locks = lockData.locks || {};
      const lockedGroups = Object.entries(locks).filter(([_, data]) => data.enabled);
      
      if (lockedGroups.length === 0) {
        return message.reply(getLang("noLocked"));
      }

      const list = lockedGroups.map(([tid, data], i) => `${i + 1}. ${data.name}`).join("\n");
      return message.reply(getLang("list", { list }));
    }

    return message.reply(getLang("guide"));
  },
  onEvent: async function({ event, api, threadsData, usersData }) {
    if (event.logMessageType !== "log:thread-name") return;

    const { threadID, author, logMessageData } = event;
    
    let lockData = await threadsData.get(threadID, "data.okjs") || {};
    if (!lockData.locks) lockData.locks = {};
    if (!lockData.violations) lockData.violations = {};
    if (!lockData.banned) lockData.banned = [];

    const lock = lockData.locks[threadID];
    if (!lock || !lock.enabled) return;

    const lockedName = lock.name;
    const newName = logMessageData.name;

    if (newName === lockedName) return;

    if (!lockData.violations[threadID]) {
      lockData.violations[threadID] = {};
    }

    if (!lockData.violations[threadID][author]) {
      lockData.violations[threadID][author] = 0;
    }

    lockData.violations[threadID][author]++;
    const count = lockData.violations[threadID][author];

    const userName = await usersData.get(author, "name") || "User";

    if (count === 3) {
      await threadsData.set(threadID, lockData, "data.okjs");
      await api.setTitle(lockedName, threadID);
      await api.sendMessage(
        `⚠️ WARNING ${count}/3\n${userName}, you changed the group name!\nThe locked name is: ${lockedName}\nOne more change and you'll be kicked & banned!`,
        threadID
      );
      return;
    }

    if (count >= 4) {
      lockData.banned.push(author);
      await threadsData.set(threadID, lockData, "data.okjs");
      
      await api.setTitle(lockedName, threadID);
      await api.sendMessage(
        `🚫 ${userName} has been kicked and permanently banned for changing the group name 4 times!\nLocked name: ${lockedName}`,
        threadID
      );
      await api.removeUserFromGroup(author, threadID);
      return;
    }

    await threadsData.set(threadID, lockData, "data.okjs");
    await api.setTitle(lockedName, threadID);
    await api.sendMessage(
      `⚠️ WARNING ${count}/3\n${userName}, you changed the group name!\nThe locked name is: ${lockedName}\n${3 - count} more changes and you'll be kicked & banned!`,
      threadID
    );
  }
};