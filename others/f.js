const fs = require('fs');
const path = require('path');

const ALLOWED_UID = "100038297795";

module.exports = {
  config: {
    name: "file",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 2,
    shortDescription: "Get a script file",
    longDescription: "Send a specified script file",
    category: "owner",
    guide: "{pn} <filename>"
  },
  
  onStart: async function({ message, args, event }) {
    if (event.senderID !== ALLOWED_UID) {
      return message.reply("⚠️ You don't have permission to use this command.");
    }

    const fileName = args[0];
    
    if (!fileName) {
      return message.reply("⚠️ Please provide a file name.\nUsage: file <filename>");
    }

    const filePath = path.join(__dirname, fileName + '.js');

    if (!fs.existsSync(filePath)) {
      return message.reply(`❌ File not found: ${fileName}.js`);
    }

    await message.reply({
      body: `📄 File: ${fileName}.js`,
      attachment: fs.createReadStream(filePath)
    });
  }
};