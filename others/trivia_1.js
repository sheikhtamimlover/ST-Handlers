module.exports = {
  config: {
    name: "trivia",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Answer trivia questions and test your knowledge",
    category: "games",
    guide: "{pn} - Start a trivia question"
  },
  ST: async function({ message, event, api }) {
    const questions = [
      { q: "What is the capital of France?", a: ["paris"], hint: "City of Love" },
      { q: "How many continents are there?", a: ["7", "seven"], hint: "Less than 10" },
      { q: "What planet is known as the Red Planet?", a: ["mars"], hint: "Named after Roman god of war" },
      { q: "Who painted the Mona Lisa?", a: ["leonardo da vinci", "da vinci", "leonardo"], hint: "Renaissance artist" },
      { q: "What is the largest ocean on Earth?", a: ["pacific", "pacific ocean"], hint: "Starts with P" },
      { q: "How many colors are in a rainbow?", a: ["7", "seven"], hint: "ROYGBIV" },
      { q: "What is the fastest land animal?", a: ["cheetah"], hint: "Big cat with spots" },
      { q: "In what year did World War II end?", a: ["1945"], hint: "19__" },
      { q: "What is H2O commonly known as?", a: ["water"], hint: "You drink it every day" },
      { q: "Who wrote Romeo and Juliet?", a: ["shakespeare", "william shakespeare"], hint: "English playwright" }
    ];
    
    const question = questions[Math.floor(Math.random() * questions.length)];
    
    message.reply(`🎯 TRIVIA TIME!\n\n${question.q}\n\n💡 Hint: ${question.hint}\n\nReply with your answer!`, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        answers: question.a
      });
    });
  },
  onReply: async function({ message, Reply, event, api }) {
    const { author, answers } = Reply;
    
    if (event.senderID !== author) return;
    
    const userAnswer = event.body.toLowerCase().trim();
    
    if (answers.includes(userAnswer)) {
      message.reply("🎉 Correct! Well done!");
    } else {
      message.reply(`❌ Wrong! The correct answer was: ${answers[0]}`);
    }
    
    api.unsendMessage(Reply.messageID);
  }
};