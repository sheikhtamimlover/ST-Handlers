module.exports = {
  config: {
    name: "guessnumber_1",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Guess the number between 1-100",
    category: "games",
    guide: "{pn} - Start the game"
  },
  ST: async function({ message, event, api }) {
    const secretNumber = Math.floor(Math.random() * 100) + 1;
    const maxAttempts = 7;
    
    message.reply(`🎮 GUESS THE NUMBER!\n\nI'm thinking of a number between 1 and 100.\nYou have ${maxAttempts} attempts to guess it!\n\nReply with your guess!`, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        secretNumber: secretNumber,
        attempts: 0,
        maxAttempts: maxAttempts
      });
    });
  },
  onReply: async function({ message, Reply, event, api }) {
    const { author, secretNumber, attempts, maxAttempts, messageID } = Reply;
    
    if (event.senderID !== author) return;
    
    const guess = parseInt(event.body);
    
    if (isNaN(guess) || guess < 1 || guess > 100) {
      return message.reply("Please enter a valid number between 1 and 100!");
    }
    
    const newAttempts = attempts + 1;
    
    if (guess === secretNumber) {
      message.reply(`🎉 CORRECT! You guessed it in ${newAttempts} attempt(s)!\nThe number was ${secretNumber}!`);
      api.unsendMessage(messageID);
      return;
    }
    
    if (newAttempts >= maxAttempts) {
      message.reply(`😢 Game Over! You've used all ${maxAttempts} attempts.\nThe number was ${secretNumber}.`);
      api.unsendMessage(messageID);
      return;
    }
    
    const hint = guess < secretNumber ? "higher" : "lower";
    const remaining = maxAttempts - newAttempts;
    
    message.reply(`${guess < secretNumber ? '⬆️' : '⬇️'} Try ${hint}!\nAttempts remaining: ${remaining}`, (err, info) => {
      api.unsendMessage(messageID);
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: author,
        secretNumber: secretNumber,
        attempts: newAttempts,
        maxAttempts: maxAttempts
      });
    });
  }
};