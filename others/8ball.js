module.exports = {
  config: {
    name: "8ball",
    aliases: ["ask", "magic8"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Ask the magic 8-ball a question and get a mystical answer",
    category: "fun",
    guide: "{pn} <your question>"
  },
  
  ST: async function({ message, args, event }) {
    if (args.length === 0) {
      return message.reply("❓ Please ask a question!\n\nExample: 8ball Will I be rich?");
    }
    
    const question = args.join(" ");
    
    const answers = [
      "🔮 It is certain",
      "🔮 Without a doubt",
      "🔮 Yes definitely",
      "🔮 You may rely on it",
      "🔮 As I see it, yes",
      "🔮 Most likely",
      "🔮 Outlook good",
      "🔮 Yes",
      "🔮 Signs point to yes",
      "🔮 Reply hazy, try again",
      "🔮 Ask again later",
      "🔮 Better not tell you now",
      "🔮 Cannot predict now",
      "🔮 Concentrate and ask again",
      "🔮 Don't count on it",
      "🔮 My reply is no",
      "🔮 My sources say no",
      "🔮 Outlook not so good",
      "🔮 Very doubtful"
    ];
    
    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    
    return message.reply(`🎱 Magic 8-Ball\n━━━━━━━━━━━━━━\n❓ Question: ${question}\n\n${randomAnswer}`);
  }
};