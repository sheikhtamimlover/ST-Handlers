module.exports = {
  config: {
    name: "penis",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 1,
    role: 0,
    description: "( ͡° ͜ʖ ͡°)",
    category: "random",
    guide: "{pn}"
  },

  ST: async function({ event, message }) {
    const length = Math.floor(Math.random() * 10);
    message.reply(`8${'='.repeat(length)}D`);
  }
};