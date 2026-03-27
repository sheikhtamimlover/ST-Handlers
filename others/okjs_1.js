module.exports = {
  config: {
    name: "okjs",
    aliases: ["grouplock"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 1,
    premium: false,
    usePrefix: true,
    description: "Lock group name/image/theme per group and auto-kick violators",
    category: "group management",
    guide: "{pn} on - Enable group protection in THIS group only\n{pn} off - Disable group protection in THIS group\n{pn} list - Show all protected groups"
  },
  langs: {
    en: {
      enabled: "✅ Group Protection Enabled!\n📝 Name: {groupName}\n🔒 Settings locked for THIS group only\n\n⚠️ Users who change name/image/theme:\n• 3 times = Warning\n• 4th time = Kicked & Banned",
      disabled: "❌ Group protection disabled for this group.",
      notEnabled: "⚠️ Group protection is not enabled in this group.",
      list: "📋 Protected Groups ({count}):\n{list}",
      noLocked: "No groups are currently protected.",
      nameWarning: "⚠️ WARNING {count}/3\n{name}, you changed the group NAME!\n🔒 Locked name: {lockedName}\n⚡ {remaining} more changes = kicked & banned!",
      imageWarning: "⚠️ WARNING {count}/3\n{name}, you changed the group IMAGE!\n⚡ {remaining} more changes = kicked & banned!",
      themeWarning: "⚠️ WARNING {count}/3\n{name}, you changed the group THEME!\n⚡ {remaining} more changes = kicked & banned!",
      kicked: "🚫 {name} KICKED & BANNED!\nReason: Changed group {type} 4 times\n🔒 Original {type} restored",
      autoKick: "🚫 Auto-kicked banned user: {name}"
    }
  },
  ST: async function({ message, args, event, api, getLang, threadsData }) {
    const { threadID, senderID } = event;
    const command = args[0]?.toLowerCase();

    // Get global okjs data
    let globalData = await threadsData.get("global", "data.okjs") || { protectedGroups: {} };
    if (!globalData.protectedGroups) globalData.protectedGroups = {};

    if (command === "on") {
      const threadInfo = await api.getThreadInfo(threadID);
      
      globalData.protectedGroups[threadID] = {
        name: threadInfo.threadName,
        image: threadInfo.imageSrc || null,
        theme: threadInfo.color || null,
        enabled: true,
        lockedBy: senderID,
        lockedAt: Date.now(),
        violations: {},
        banned: []
      };

      await threadsData.set("global", globalData, "data.okjs");
      return message.reply(getLang("enabled", { groupName: threadInfo.threadName }));
    }

    if (command === "off") {
      if (!globalData.protectedGroups[threadID]?.enabled) {
        return message.reply(getLang("notEnabled"));
      }

      delete globalData.protectedGroups[threadID];
      await threadsData.set("global", globalData, "data.okjs");
      return message.reply(getLang("disabled"));
    }

    if (command === "list") {
      const protectedGroups = Object.entries(globalData.protectedGroups || {}).filter(([_, data]) => data.enabled);
      
      if (protectedGroups.length === 0) {
        return message.reply(getLang("noLocked"));
      }

      const list = protectedGroups.map(([tid, data], i) => `${i + 1}. ${data.name} (ID: ${tid})`).join("\n");
      return message.reply(getLang("list", { count: protectedGroups.length, list }));
    }

    return message.reply("Usage:\n• okjs on - Protect THIS group\n• okjs off - Unprotect THIS group\n• okjs list - Show all protected groups");
  },

  onEvent: async function({ event, api, threadsData, usersData }) {
    const { threadID, author, logMessageType, logMessageData } = event;
    
    // Get global okjs data
    let globalData = await threadsData.get("global", "data.okjs") || { protectedGroups: {} };
    if (!globalData.protectedGroups) globalData.protectedGroups = {};

    const protection = globalData.protectedGroups[threadID];
    if (!protection || !protection.enabled) return;

    let violationType = null;
    let oldValue = null;

    // Detect change type
    if (logMessageType === "log:thread-name") {
      violationType = "name";
      oldValue = protection.name;
      const newName = logMessageData.name;
      if (newName === oldValue) return;
    } else if (logMessageType === "log:thread-image") {
      violationType = "image";
      oldValue = protection.image;
    } else if (logMessageType === "log:thread-color") {
      violationType = "theme";
      oldValue = protection.theme;
      const newTheme = logMessageData.theme_color;
      if (newTheme === oldValue) return;
    } else {
      return;
    }

    // Initialize user violations
    if (!protection.violations[author]) {
      protection.violations[author] = { name: 0, image: 0, theme: 0 };
    }

    protection.violations[author][violationType]++;
    const count = protection.violations[author][violationType];
    const userName = await usersData.get(author, "name") || "User";

    // Save data
    globalData.protectedGroups[threadID] = protection;
    await threadsData.set("global", globalData, "data.okjs");

    // Restore original settings
    if (violationType === "name") {
      await api.setTitle(protection.name, threadID);
    } else if (violationType === "image" && protection.image) {
      try {
        const axios = require("axios");
        const fs = require("fs");
        const path = require("path");
        const response = await axios.get(protection.image, { responseType: "stream" });
        const tempPath = path.join(__dirname, "tmp", `groupimg_${threadID}.jpg`);
        const writer = fs.createWriteStream(tempPath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });
        await api.changeGroupImage(fs.createReadStream(tempPath), threadID);
        fs.unlinkSync(tempPath);
      } catch (err) {
        console.error("Failed to restore group image:", err);
      }
    } else if (violationType === "theme" && protection.theme) {
      await api.changeThreadColor(protection.theme, threadID);
    }

    // Handle violations
    if (count >= 4) {
      protection.banned.push(author);
      globalData.protectedGroups[threadID] = protection;
      await threadsData.set("global", globalData, "data.okjs");
      
      await api.sendMessage(getLang("kicked", { name: userName, type: violationType.toUpperCase() }), threadID);
      setTimeout(() => api.removeUserFromGroup(author, threadID), 1000);
      return;
    }

    // Send warning
    const remaining = 3 - count;
    let warningKey = violationType + "Warning";
    if (violationType === "name") {
      await api.sendMessage(getLang(warningKey, { count, name: userName, lockedName: protection.name, remaining }), threadID);
    } else {
      await api.sendMessage(getLang(warningKey, { count, name: userName, remaining }), threadID);
    }
  }
};