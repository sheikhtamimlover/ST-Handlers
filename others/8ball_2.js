module.exports = {
  config: {
    name: "8ball",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 3,
    role: 0,
    description: "Ask the magic 8-ball a question",
    category: "fun",
    guide: "{pn} <your question>"
  },
  ST: async function({ message, args, event }) {
    if (args.length === 0) {
      return message.reply("🔮 Ask me a yes/no question!\nExample: 8ball Will I be rich?");
    }
    
    const responses = [
      "✅ Yes, definitely!",
      "✅ It is certain.",
      "✅ Without a doubt.",
      "✅ Yes, absolutely!",
      "✅ You may rely on it.",
      "🟢 Most likely.",
      "🟢 Outlook good.",
      "🟢 Signs point to yes.",
      "🟡 Reply hazy, try again.",
      "🟡 Ask again later.",
      "🟡 Better not tell you now.",
      "🟡 Cannot predict now.",
      "🟡 Concentrate and ask again.",
      "❌ Don't count on it.",
      "❌ My reply is no.",
      "❌ My sources say no.",
      "❌ Outlook not so good.",
      "❌ Very doubtful."
    ];
    
    const question = args.join(" ");
    const answer = responses[Math.floor(Math.random() * responses.length)];
    
    message.reply(`🔮 Question: ${question}\n\n${answer}`);
  }
};