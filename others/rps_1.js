module.exports = {
  config: {
    name: "rps",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Play Rock Paper Scissors with the bot",
    category: "games",
    guide: "{pn} <rock|paper|scissors>"
  },
  ST: async function({ message, args, event, api }) {
    const choices = ['rock', 'paper', 'scissors'];
    const userChoice = args[0]?.toLowerCase();
    
    if (!userChoice || !choices.includes(userChoice)) {
      return message.reply("❌ Please choose: rock, paper, or scissors\nExample: rps rock");
    }
    
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    
    const emojis = {
      rock: "🪨",
      paper: "📄",
      scissors: "✂️"
    };
    
    let result;
    if (userChoice === botChoice) {
      result = "🤝 It's a tie!";
    } else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'paper' && botChoice === 'rock') ||
      (userChoice === 'scissors' && botChoice === 'paper')
    ) {
      result = "🎉 You win!";
    } else {
      result = "😔 You lose!";
    }
    
    message.reply(`${emojis[userChoice]} You chose: ${userChoice}\n${emojis[botChoice]} Bot chose: ${botChoice}\n\n${result}`);
  }
};