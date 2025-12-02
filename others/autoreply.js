const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "autoreply",
    aliases: ["autoreact", "autoresponse"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "",
    category: "system",
    guide: ""
  },

  onLoad: function () {
    const configFile = path.join(process.cwd(), "autoreply_config.json");
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify({
        enabled: true,
        targets: [
          {
            uid: "61582917346905",
            message: "chapri caption Ayesha theke copy paste bad diye maiya khujo",
            active: true
          }
        ]
      }, null, 2));
    }
  },

  ST: async function ({ message, args, event }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return;
    }

    const configFile = path.join(process.cwd(), "autoreply_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return { enabled: true, targets: [] };
      } catch {
        return { enabled: true, targets: [] };
      }
    }

    function saveConfig(data) {
      try {
        fs.writeFileSync(configFile, JSON.stringify(data, null, 2));
      } catch (error) {
        console.error("Error saving autoreply config:", error);
      }
    }

    if (args[0] === "add") {
      if (!args[1] || !args.slice(2).join(" ")) {
        return message.reply(
          `❌ Invalid usage!\n\n` +
          `💡 Usage: autoreply add <uid> <message>`
        );
      }

      const config = loadConfig();
      const uid = args[1];
      const replyMessage = args.slice(2).join(" ");

      const existing = config.targets.find(t => t.uid === uid);
      if (existing) {
        existing.message = replyMessage;
        existing.active = true;
      } else {
        config.targets.push({
          uid: uid,
          message: replyMessage,
          active: true
        });
      }

      saveConfig(config);

      return message.reply(
        `✅ AUTO REPLY ADDED\n\n` +
        `👤 UID: ${uid}\n` +
        `💬 Message: ${replyMessage}\n\n` +
        `✅ Will reply to all messages from this user`
      );
    }

    if (args[0] === "remove" || args[0] === "delete") {
      if (!args[1]) {
        return message.reply("❌ Usage: autoreply remove <uid>");
      }

      const config = loadConfig();
      const uid = args[1];
      const index = config.targets.findIndex(t => t.uid === uid);

      if (index === -1) {
        return message.reply("❌ UID not found in autoreply list!");
      }

      const removed = config.targets.splice(index, 1)[0];
      saveConfig(config);

      return message.reply(
        `✅ AUTO REPLY REMOVED\n\n` +
        `👤 UID: ${removed.uid}\n` +
        `💬 Message: ${removed.message}`
      );
    }

    if (args[0] === "edit") {
      if (!args[1] || !args.slice(2).join(" ")) {
        return message.reply(
          `❌ Invalid usage!\n\n` +
          `💡 Usage: autoreply edit <uid> <new message>`
        );
      }

      const config = loadConfig();
      const uid = args[1];
      const newMessage = args.slice(2).join(" ");

      const target = config.targets.find(t => t.uid === uid);
      if (!target) {
        return message.reply("❌ UID not found! Use 'autoreply add' to add new.");
      }

      const oldMessage = target.message;
      target.message = newMessage;
      saveConfig(config);

      return message.reply(
        `✅ AUTO REPLY UPDATED\n\n` +
        `👤 UID: ${uid}\n` +
        `📝 Old: ${oldMessage}\n` +
        `📝 New: ${newMessage}`
      );
    }

    if (args[0] === "toggle") {
      if (!args[1]) {
        return message.reply("❌ Usage: autoreply toggle <uid>");
      }

      const config = loadConfig();
      const uid = args[1];
      const target = config.targets.find(t => t.uid === uid);

      if (!target) {
        return message.reply("❌ UID not found!");
      }

      target.active = !target.active;
      saveConfig(config);

      return message.reply(
        `✅ AUTO REPLY ${target.active ? 'ENABLED' : 'DISABLED'}\n\n` +
        `👤 UID: ${uid}\n` +
        `📊 Status: ${target.active ? 'Active' : 'Inactive'}`
      );
    }

    if (args[0] === "list") {
      const config = loadConfig();

      if (config.targets.length === 0) {
        return message.reply("📋 No autoreply targets configured.");
      }

      let msg = `📋 AUTO REPLY LIST\n\n`;
      config.targets.forEach((target, index) => {
        msg += `${index + 1}. UID: ${target.uid}\n`;
        msg += `   Status: ${target.active ? '✅ Active' : '❌ Inactive'}\n`;
        msg += `   Message: ${target.message}\n\n`;
      });

      msg += `📊 Total: ${config.targets.length} targets`;

      return message.reply(msg);
    }

    if (args[0] === "on" || args[0] === "enable") {
      const config = loadConfig();
      config.enabled = true;
      saveConfig(config);

      return message.reply("✅ Auto Reply System ENABLED!");
    }

    if (args[0] === "off" || args[0] === "disable") {
      const config = loadConfig();
      config.enabled = false;
      saveConfig(config);

      return message.reply("❌ Auto Reply System DISABLED!");
    }

    return message.reply(
      `📋 AUTO REPLY MANAGEMENT\n\n` +
      `💡 Commands:\n` +
      `• autoreply add <uid> <message>\n` +
      `• autoreply edit <uid> <new message>\n` +
      `• autoreply remove <uid>\n` +
      `• autoreply toggle <uid>\n` +
      `• autoreply list\n` +
      `• autoreply on/off\n\n` +
      `📊 Current Status: ${loadConfig().enabled ? 'Enabled' : 'Disabled'}`
    );
  },

  onChat: async function ({ event, message }) {
    const configFile = path.join(process.cwd(), "autoreply_config.json");

    function loadConfig() {
      try {
        if (fs.existsSync(configFile)) {
          return JSON.parse(fs.readFileSync(configFile, "utf-8"));
        }
        return { enabled: true, targets: [] };
      } catch {
        return { enabled: true, targets: [] };
      }
    }

    const config = loadConfig();

    if (!config.enabled) {
      return;
    }

    const target = config.targets.find(t => t.uid === event.senderID && t.active);

    if (target && event.body) {
      return message.reply(target.message);
    }
  }
};