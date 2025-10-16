const fs = require('fs');

module.exports = {
  config: {
    name: "file",
    version: "2.0",
    author: "ST | Sheikh Tamim",
    countDown: 2,
    role: 2, // Only bot admin
    shortDescription: "Send bot script file",
    longDescription: "Send the content of a specified bot script file",
    category: "owner",
    guide: "{pn} <file name>\nEx: {pn} fileName"
  },

  onStart: async function ({ message, args, api, event, usersData }) {
    const { threadID, senderID, messageID } = event;
    
    // Bot Admin check
    const botAdmins = global.GoatBot.config?.ADMINBOT || [];//in to this box u and manual set user uid or others user uid for whos can just get access this command
    if (!botAdmins.includes(senderID)) {
      return api.sendMessage("⛔ You are not authorized to use this command.", threadID, messageID);
    }

    const fileName = args[0];
    if (!fileName) {
      return api.sendMessage("⚠️ Please provide a file name.\nExample: .file index", threadID, messageID);
    }

    const filePath = __dirname + `/${fileName}.js`;
    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`❌ File not found: ${fileName}.js`, threadID, messageID);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    api.sendMessage({ body: `📂 Content of ${fileName}.js:\n\n${fileContent}` }, threadID);
  }
};