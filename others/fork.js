module.exports = {
    config: {
        name: "fork",
        version: "1.3.0",
        author: "Rakib Adil",
        description: "get the bot file or github fork",
        guide: "{pn}fork <name>",
        countDown: 2,
        role: 0,
        category: "utility"
    },
   
   onStart: async ({api, args, event, message}) => {
       
       const fork = {
           ST :{
               link : "https://github.com/sheikhtamimlover/ST-BOT.git",
               info : "🔥 𝚂𝚃 𝙱𝚘𝚝 𝚒𝚜 𝚊 𝚜𝚝𝚊𝚋𝚕𝚎 𝙶𝚘𝚊𝚝𝙱𝚘𝚝 𝚏𝚘𝚛𝚔 𝚠𝚒𝚝𝚑 𝚙𝚛𝚎𝚖𝚒𝚞𝚖 𝚏𝚎𝚊𝚝𝚞𝚛𝚎𝚜 𝚊𝚗𝚍 𝚊𝚌𝚝𝚒𝚟𝚎 𝚞𝚙𝚍𝚊𝚝𝚎𝚜. 𝙻𝚘𝚐𝚒𝚗 𝚠𝚒𝚝𝚑 𝚎𝚖𝚊𝚒𝚕 & 𝚙𝚊𝚜𝚜"
           }, 
           
           AEST : {
               link : "https://github.com/xemonbae01/Anchestor-V2.git",
               info: "⚡ 𝙰𝚗𝚌𝚑𝚎𝚜𝚝𝚘𝚛 𝚅𝟸 𝚏𝚘𝚛𝚔: 𝚕𝚒𝚐𝚑𝚝𝚠𝚎𝚒𝚐𝚑𝚝, 𝚌𝚕𝚎𝚊𝚗 𝚌𝚘𝚍𝚎𝚋𝚊𝚜𝚎 𝚊𝚗𝚍 𝚞𝚜𝚎𝚛-𝚏𝚛𝚒𝚎𝚗𝚍𝚕𝚢."
           },
           DIPTO : {
               link : "https://github.com/dipto-008/Goat-Bot-V2.git",
               info : "💎 𝙶𝚘𝚊𝚝 𝙱𝚘𝚝 𝚅2 𝚋𝚢 𝙳𝚒𝚙𝚝𝚘: 𝚏𝚊𝚜𝚝 𝚛𝚎𝚜𝚙𝚘𝚗𝚜𝚛, 𝙼𝚘𝚗𝚐𝚘𝙳𝙱 𝚜𝚞𝚙𝚙𝚘𝚛𝚝, 𝚊𝚗𝚍 𝚌𝚞𝚜𝚝𝚘𝚖 𝚖𝚘𝚍𝚞𝚕𝚎𝚜"
           }
       };
       
       if(args.length === 0 ) return message.reply("𝚙𝚕𝚎𝚊𝚜𝚎 𝚙𝚛𝚘𝚟𝚒𝚍𝚎 𝚊 𝚗𝚊𝚖𝚎 𝚝𝚘 𝚐𝚎𝚝 𝚝𝚑𝚎 𝚏𝚘𝚛𝚔 𝚘𝚛 𝚞𝚜𝚎 (!fork list / !fork -l) 𝚝𝚘 𝚟𝚒𝚎𝚠 𝚕𝚒𝚜𝚝", event.messageID);
       
       const name = args[0].toUpperCase();
       
       if(name === "LIST" || name ==="-L") {
           const forkNames = Object.keys(fork);
           return message.reply(
               `📜 𝙰𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚏𝚘𝚛𝚔𝚜 \n\n ${forkNames.map(name => `• ${name}`).join("\n")}`,
               event.messageID
               );
       };
       
       
       if(fork[name]) {
       api.sendMessage(` 🔗 𝚑𝚎𝚛𝚎 𝚒𝚜 𝚢𝚘𝚞𝚛 ${name} 𝚏𝚘𝚛𝚔 𝚕𝚒𝚗𝚔 \n\n ${fork[name].link} \n\n 𝐅𝐞𝐚𝐭𝐮𝐫𝐞𝐬 ${fork[name].info} \n\n 𝚙𝚕𝚎𝚊𝚜𝚎 𝚏𝚘𝚕𝚕𝚘𝚠 𝚝𝚑𝚎 𝚘𝚠𝚗𝚎𝚛 𝚊𝚗𝚍 𝚐𝚒𝚟𝚎 𝚊 𝚜𝚝𝚊𝚛 𝚝𝚘 𝚝𝚑𝚎 𝚏𝚘𝚛𝚔`, event.threadID, event.messageID);
       
       api.setMessageReaction("✅", event.messageID, event.threadID, () => {}, true);
       } else{
           api.sendMessage(`𝚗𝚘 𝚏𝚘𝚛𝚔 𝚕𝚒𝚗𝚔 𝚏𝚘𝚞𝚗𝚍 𝚏𝚘𝚛 𝚝𝚑𝚎 ${name} `, event.threadID, event.messageID);
           
           api.setMessageReaction("❌", event.messageID, event.threadID, () => {}, true);
       }
   }
};
