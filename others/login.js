const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "login",
    aliases: ["fblogin", "accountlogin"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 0,
    role: 2,
    description: "Login to Facebook account with email and password",
    category: "system",
    guide: {
      en: "{pn} <email> <password> - Login with credentials\n{pn} status - Check login status"
    }
  },

  ST: async function ({ message, args, event, api }) {
    const OWNER_UID = "61578414567795";
    
    if (event.senderID !== OWNER_UID) {
      return message.reply("❌ Only bot owner can use this command!");
    }

    if (args[0] === "status") {
      try {
        const appstatePath = path.join(process.cwd(), "appstate.json");
        const currentBotID = api.getCurrentUserID();
        
        let msg = `📊 LOGIN STATUS\n\n`;
        msg += `🤖 Current Bot ID: ${currentBotID}\n`;
        msg += `✅ Status: Active\n`;
        msg += `📁 Appstate: ${fs.existsSync(appstatePath) ? 'Found' : 'Not Found'}\n`;
        msg += `⏰ Checked: ${new Date().toLocaleString()}`;
        
        return message.reply(msg);
      } catch (error) {
        return message.reply(`❌ Error checking status!\n\nError: ${error.message}`);
      }
    }

    if (args.length < 2) {
      return message.reply("❌ Please provide email and password!\n\nUsage: !login <email> <password>");
    }

    const email = args[0];
    const password = args.slice(1).join(" ");

    await message.reply("🔄 Processing login...\n\n⏳ Please wait, this may take a few moments...");

    try {
      const loginApiUrl = "https://api-kaiz.glitch.me/api/login";
      
      const response = await axios.post(loginApiUrl, {
        email: email,
        password: password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      if (!response.data || !response.data.appstate) {
        return message.reply("❌ Login failed!\n\n💡 Possible reasons:\n- Invalid credentials\n- 2FA enabled\n- Account locked\n- Checkpoint required");
      }

      const appstate = response.data.appstate;
      const appstatePath = path.join(process.cwd(), "appstate.json");

      const backupPath = path.join(process.cwd(), `appstate_backup_${Date.now()}.json`);
      if (fs.existsSync(appstatePath)) {
        fs.copyFileSync(appstatePath, backupPath);
      }

      fs.writeFileSync(appstatePath, JSON.stringify(appstate, null, 2), "utf-8");

      const newBotID = appstate.find(item => item.key === "c_user")?.value || "Unknown";

      let msg = `✅ LOGIN SUCCESSFUL!\n\n`;
      msg += `📧 Email: ${email}\n`;
      msg += `🤖 Bot ID: ${newBotID}\n`;
      msg += `📊 Cookie Count: ${appstate.length}\n`;
      msg += `💾 Backup: appstate_backup_${Date.now()}.json\n`;
      msg += `⏰ Time: ${new Date().toLocaleString()}\n\n`;
      msg += `⚠️ Bot will restart in 5 seconds...\n`;
      msg += `💡 New account will be active after restart.`;

      await message.reply(msg);

      setTimeout(() => {
        process.exit(1);
      }, 5000);

    } catch (error) {
      console.error("Login error:", error);
      
      let errorMsg = `❌ LOGIN FAILED!\n\n`;
      
      if (error.response) {
        errorMsg += `🔴 Server Error: ${error.response.status}\n`;
        errorMsg += `📝 Message: ${error.response.data?.message || 'Unknown error'}\n`;
      } else if (error.request) {
        errorMsg += `🔴 Network Error: No response from server\n`;
        errorMsg += `💡 Check your internet connection\n`;
      } else {
        errorMsg += `🔴 Error: ${error.message}\n`;
      }
      
      errorMsg += `\n💡 Troubleshooting:\n`;
      errorMsg += `- Check email and password\n`;
      errorMsg += `- Disable 2FA temporarily\n`;
      errorMsg += `- Try logging in via browser first\n`;
      errorMsg += `- Wait 5-10 minutes and try again`;

      return message.reply(errorMsg);
    }
  }
};