module.exports = {
  config: {
    name: "setstyle",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Set your stylish name for welcome messages",
    category: "user",
    guide: "{pn} <your stylish name>"
  },
  ST: async function({ message, args, event, usersData }) {
    const { senderID } = event;
    
    if (args.length === 0) {
      return message.reply("❌ Please provide your stylish name!\n\nExample: setstyle 『𝐒𝐓』𝐒𝐡𝐞𝐢𝐤𝐡");
    }
    
    const stylishName = args.join(" ");
    
    // Save stylish name to user database
    await usersData.set(senderID, {
      data: {
        stylishName: stylishName
      }
    });
    
    return message.reply(`✅ Successfully set your stylish name to:\n\n${stylishName}\n\n💡 This name will be used in welcome messages!`);
  }
};