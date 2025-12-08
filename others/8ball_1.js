module.exports = {
  config: {
    name: "8ball",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Ask the magic 8-ball a question and get a mystical answer",
    category: "fun",
    guide: "{pn} <your question>"
  },
  ST: async function({ message, args, event }) {
    const question = args.join(" ");
    
    if (!question) {
      return message.reply("❓ Please ask the magic 8-ball a question!\n\nExample: 8ball Will I be rich?");
    }

    const answers = [
      "🔮 It is certain.",
      "🔮 It is decidedly so.",
      "🔮 Without a doubt.",
      "🔮 Yes definitely.",
      "🔮 You may rely on it.",
      "🔮 As I see it, yes.",
      "🔮 Most likely.",
      "🔮 Outlook good.",
      "🔮 Yes.",
      "🔮 Signs point to yes.",
      "🔮 Reply hazy, try again.",
      "🔮 Ask again later.",
      "🔮 Better not tell you now.",
      "🔮 Cannot predict now.",
      "🔮 Concentrate and ask again.",
      "🔮 Don't count on it.",
      "🔮 My reply is no.",
      "🔮 My sources say no.",
      "🔮 Outlook not so good.",
      "🔮 Very doubtful."
    ];

    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];

    const response = `━━━━━━━━━━━━━━━━━━
🎱 MAGIC 8-BALL 🎱
━━━━━━━━━━━━━━━━━━

❓ Question: ${question}

${randomAnswer}

━━━━━━━━━━━━━━━━━━`;

    return message.reply(response);
  }
};