module.exports = {
  config: {
    name: "flip",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Flip a coin - heads or tails",
    category: "fun",
    guide: "{pn}"
  },
  
  ST: async function({ message, event }) {
    const results = ['🪙 Heads!', '🪙 Tails!'];
    const result = results[Math.floor(Math.random() * results.length)];
    
    return message.reply(`🎲 Flipping coin...\n\n${result}`);
  }
};