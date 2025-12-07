module.exports = {
  config: {
    name: "trivia",
    aliases: ["quiz"],
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Test your knowledge with random trivia questions",
    category: "game",
    guide: "{pn}"
  },
  
  onStart: async function({ message, event, usersData }) {
    const questions = [
      {
        q: "What is the capital of France?",
        options: ["A) London", "B) Berlin", "C) Paris", "D) Madrid"],
        answer: "C",
        explanation: "Paris is the capital of France!"
      },
      {
        q: "Which planet is known as the Red Planet?",
        options: ["A) Venus", "B) Mars", "C) Jupiter", "D) Saturn"],
        answer: "B",
        explanation: "Mars is called the Red Planet due to its reddish appearance!"
      },
      {
        q: "What is the largest ocean on Earth?",
        options: ["A) Atlantic", "B) Indian", "C) Arctic", "D) Pacific"],
        answer: "D",
        explanation: "The Pacific Ocean is the largest ocean on Earth!"
      },
      {
        q: "Who painted the Mona Lisa?",
        options: ["A) Van Gogh", "B) Picasso", "C) Leonardo da Vinci", "D) Michelangelo"],
        answer: "C",
        explanation: "Leonardo da Vinci painted the famous Mona Lisa!"
      },
      {
        q: "What is the smallest country in the world?",
        options: ["A) Monaco", "B) Vatican City", "C) San Marino", "D) Liechtenstein"],
        answer: "B",
        explanation: "Vatican City is the smallest country in the world!"
      },
      {
        q: "How many continents are there?",
        options: ["A) 5", "B) 6", "C) 7", "D) 8"],
        answer: "C",
        explanation: "There are 7 continents on Earth!"
      },
      {
        q: "What is the fastest land animal?",
        options: ["A) Lion", "B) Cheetah", "C) Leopard", "D) Tiger"],
        answer: "B",
        explanation: "The Cheetah can run up to 70 mph!"
      },
      {
        q: "Which element has the chemical symbol 'O'?",
        options: ["A) Gold", "B) Oxygen", "C) Silver", "D) Iron"],
        answer: "B",
        explanation: "O is the chemical symbol for Oxygen!"
      },
      {
        q: "What year did World War II end?",
        options: ["A) 1943", "B) 1944", "C) 1945", "D) 1946"],
        answer: "C",
        explanation: "World War II ended in 1945!"
      },
      {
        q: "How many sides does a hexagon have?",
        options: ["A) 5", "B) 6", "C) 7", "D) 8"],
        answer: "B",
        explanation: "A hexagon has 6 sides!"
      }
    ];
    
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    const questionText = `🎯 TRIVIA CHALLENGE\n━━━━━━━━━━━━━━\n\n${randomQuestion.q}\n\n${randomQuestion.options.join('\n')}\n\n━━━━━━━━━━━━━━\nReply with A, B, C, or D`;
    
    return message.reply(questionText, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        messageID: info.messageID,
        author: event.senderID,
        answer: randomQuestion.answer,
        explanation: randomQuestion.explanation
      });
    });
  },
  
  onReply: async function({ message, event, Reply, usersData }) {
    const { answer, explanation, author } = Reply;
    
    if (event.senderID !== author) {
      return message.reply("⚠️ This is not your quiz!");
    }
    
    const userAnswer = event.body.trim().toUpperCase();
    
    if (!['A', 'B', 'C', 'D'].includes(userAnswer)) {
      return message.reply("❌ Please reply with A, B, C, or D only!");
    }
    
    if (userAnswer === answer) {
      const currentMoney = await usersData.get(event.senderID, "money");
      const reward = 500;
      await usersData.set(event.senderID, {
        money: currentMoney + reward
      });
      
      return message.reply(`✅ CORRECT!\n\n${explanation}\n\n💰 You earned $${reward}!`);
    } else {
      return message.reply(`❌ WRONG!\n\nCorrect answer: ${answer}\n\n${explanation}\n\nBetter luck next time!`);
    }
  }
};