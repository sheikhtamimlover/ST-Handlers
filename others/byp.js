const fs = require("fs-extra");
const path = require("path");

const bypassDataPath = path.join(__dirname, "bypass_data.json");

function loadBypassData() {
  try {
    if (fs.existsSync(bypassDataPath)) {
      return JSON.parse(fs.readFileSync(bypassDataPath, "utf8"));
    }
  } catch (error) {
    console.error("Error loading bypass data:", error);
  }
  return {
    bypassUsers: [],
    bypassCommands: [],
    globalBypass: false
  };
}

function saveBypassData(data) {
  try {
    fs.writeFileSync(bypassDataPath, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error saving bypass data:", error);
    return false;
  }
}

module.exports = {
  config: {
    name: "byp",
    aliases: ["bypass", "forcerun"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    premium: false,
    usePrefix: true,
    description: "Bypass command restrictions and force run any command",
    category: "admin",
    guide: {
      en: "{pn} add user <uid> - Add user to bypass list\n{pn} remove user <uid> - Remove user from bypass list\n{pn} add cmd <command> - Add command to bypass list\n{pn} remove cmd <command> - Remove command from bypass list\n{pn} global on/off - Enable/disable global bypass\n{pn} list - Show all bypass configurations\n{pn} run <command> [args] - Force run any command\n{pn} status - Check bypass status"
    }
  },
  langs: {
    en: {
      userAdded: "✅ User {uid} added to bypass list!",
      userRemoved: "✅ User {uid} removed from bypass list!",
      cmdAdded: "✅ Command '{cmd}' added to bypass list!",
      cmdRemoved: "✅ Command '{cmd}' removed from bypass list!",
      globalEnabled: "✅ Global bypass enabled! All users can run all commands.",
      globalDisabled: "✅ Global bypass disabled!",
      invalidArgs: "❌ Invalid arguments! Use: {pn} help",
      notFound: "❌ Not found in bypass list!",
      listTitle: "🔓 BYPASS CONFIGURATION\n━━━━━━━━━━━━━━━━━━",
      globalStatus: "🌐 Global Bypass: {status}",
      bypassUsers: "👥 Bypass Users ({count}):",
      bypassCmds: "📝 Bypass Commands ({count}):",
      noData: "No data",
      running: "⚡ Force running command: {cmd}",
      cmdNotFound: "❌ Command '{cmd}' not found!",
      executed: "✅ Command executed successfully!",
      error: "❌ Error: {error}",
      statusTitle: "📊 BYPASS STATUS\n━━━━━━━━━━━━━━━━━━",
      yourAccess: "Your Access: {access}",
      canBypass: "Can Bypass: {status}"
    }
  },
  ST: async function({ message, args, event, api, getLang, commandName, role }) {
    const { senderID } = event;
    
    if (role < 2) {
      return message.reply("❌ Only bot admins can use this command!");
    }

    const bypassData = loadBypassData();

    if (args.length === 0) {
      return message.reply(getLang("invalidArgs", { pn: commandName }));
    }

    const action = args[0].toLowerCase();

    switch (action) {
      case "add":
        if (args[1] === "user" && args[2]) {
          const uid = args[2];
          if (!bypassData.bypassUsers.includes(uid)) {
            bypassData.bypassUsers.push(uid);
            saveBypassData(bypassData);
            return message.reply(getLang("userAdded", { uid }));
          }
          return message.reply("⚠️ User already in bypass list!");
        } else if (args[1] === "cmd" && args[2]) {
          const cmd = args[2];
          if (!bypassData.bypassCommands.includes(cmd)) {
            bypassData.bypassCommands.push(cmd);
            saveBypassData(bypassData);
            return message.reply(getLang("cmdAdded", { cmd }));
          }
          return message.reply("⚠️ Command already in bypass list!");
        }
        return message.reply(getLang("invalidArgs", { pn: commandName }));

      case "remove":
        if (args[1] === "user" && args[2]) {
          const uid = args[2];
          const index = bypassData.bypassUsers.indexOf(uid);
          if (index > -1) {
            bypassData.bypassUsers.splice(index, 1);
            saveBypassData(bypassData);
            return message.reply(getLang("userRemoved", { uid }));
          }
          return message.reply(getLang("notFound"));
        } else if (args[1] === "cmd" && args[2]) {
          const cmd = args[2];
          const index = bypassData.bypassCommands.indexOf(cmd);
          if (index > -1) {
            bypassData.bypassCommands.splice(index, 1);
            saveBypassData(bypassData);
            return message.reply(getLang("cmdRemoved", { cmd }));
          }
          return message.reply(getLang("notFound"));
        }
        return message.reply(getLang("invalidArgs", { pn: commandName }));

      case "global":
        if (args[1] === "on") {
          bypassData.globalBypass = true;
          saveBypassData(bypassData);
          return message.reply(getLang("globalEnabled"));
        } else if (args[1] === "off") {
          bypassData.globalBypass = false;
          saveBypassData(bypassData);
          return message.reply(getLang("globalDisabled"));
        }
        return message.reply(getLang("invalidArgs", { pn: commandName }));

      case "list":
        let listMsg = getLang("listTitle");
        listMsg += `\n${getLang("globalStatus", { status: bypassData.globalBypass ? "ON ✅" : "OFF ❌" })}`;
        listMsg += `\n\n${getLang("bypassUsers", { count: bypassData.bypassUsers.length })}`;
        listMsg += bypassData.bypassUsers.length > 0 ? `\n${bypassData.bypassUsers.join(", ")}` : `\n${getLang("noData")}`;
        listMsg += `\n\n${getLang("bypassCmds", { count: bypassData.bypassCommands.length })}`;
        listMsg += bypassData.bypassCommands.length > 0 ? `\n${bypassData.bypassCommands.join(", ")}` : `\n${getLang("noData")}`;
        return message.reply(listMsg);

      case "run":
        if (!args[1]) {
          return message.reply(getLang("invalidArgs", { pn: commandName }));
        }
        
        const cmdToRun = args[1].toLowerCase();
        const cmdArgs = args.slice(2);
        
        try {
          const { commands } = global.GoatBot;
          const command = commands.get(cmdToRun) || [...commands.values()].find(cmd => cmd.config.aliases && cmd.config.aliases.includes(cmdToRun));
          
          if (!command) {
            return message.reply(getLang("cmdNotFound", { cmd: cmdToRun }));
          }

          message.reply(getLang("running", { cmd: cmdToRun }));

          const originalRole = event.senderRole || 0;
          event.senderRole = 3;
          
          const modifiedEvent = {
            ...event,
            senderRole: 3,
            bypassRestrictions: true
          };

          if (command.ST) {
            await command.ST({
              message,
              args: cmdArgs,
              event: modifiedEvent,
              api,
              getLang: command.getLang || getLang,
              commandName: cmdToRun,
              role: 3
            });
          } else if (command.onStart) {
            await command.onStart({
              message,
              args: cmdArgs,
              event: modifiedEvent,
              api,
              getLang: command.getLang || getLang,
              commandName: cmdToRun,
              role: 3
            });
          }

          event.senderRole = originalRole;
          
        } catch (error) {
          console.error("Bypass run error:", error);
          return message.reply(getLang("error", { error: error.message }));
        }
        break;

      case "status":
        const canBypass = bypassData.globalBypass || 
                         bypassData.bypassUsers.includes(senderID) || 
                         role >= 2;
        let statusMsg = getLang("statusTitle");
        statusMsg += `\n${getLang("yourAccess", { access: role === 2 ? "Admin" : role === 1 ? "Moderator" : "User" })}`;
        statusMsg += `\n${getLang("canBypass", { status: canBypass ? "YES ✅" : "NO ❌" })}`;
        statusMsg += `\n\n🌐 Global: ${bypassData.globalBypass ? "ON ✅" : "OFF ❌"}`;
        statusMsg += `\n👤 In User List: ${bypassData.bypassUsers.includes(senderID) ? "YES ✅" : "NO ❌"}`;
        return message.reply(statusMsg);

      default:
        return message.reply(getLang("invalidArgs", { pn: commandName }));
    }
  },

  onChat: async function({ event, api }) {
    const bypassData = loadBypassData();
    const { senderID } = event;

    if (bypassData.globalBypass || bypassData.bypassUsers.includes(senderID)) {
      event.senderRole = 3;
      event.bypassRestrictions = true;
    }

    const messageText = event.body || "";
    const prefix = global.GoatBot.config.prefix || ".";
    
    if (messageText.startsWith(prefix)) {
      const commandName = messageText.slice(prefix.length).split(" ")[0].toLowerCase();
      
      if (bypassData.bypassCommands.includes(commandName)) {
        event.senderRole = 3;
        event.bypassRestrictions = true;
      }
    }
  }
};