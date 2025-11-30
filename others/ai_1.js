const axios = require('axios');

async function callAI(userMessage, conversationHistory = []) {
  let messages;

  if (conversationHistory.length > 0) {
    messages = [
      {
        content: "I want you to act as a 'Chat with AI' bot for engaging in conversational interactions with users. Users will initiate conversations on various topics or simply engage in casual chat, and you will respond with natural, engaging, and contextually relevant dialogue. Additionally, users can request information, share experiences, ask questions, or seek advice, and you will provide informative and helpful responses. Please ensure that the conversations flow smoothly, maintain coherence, and reflect a conversational style.",
        role: "system"
      },
      ...conversationHistory
    ];
  } else {
    messages = [
      {
        content: `I want you to act as a 'Chat with AI' bot for engaging in conversational interactions with users. Users will initiate conversations on various topics or simply engage in casual chat, and you will respond with natural, engaging, and contextually relevant dialogue. Additionally, users can request information, share experiences, ask questions, or seek advice, and you will provide informative and helpful responses. Please ensure that the conversations flow smoothly, maintain coherence, and reflect a conversational style. Here is your prompt: ${userMessage}`,
        role: "user"
      }
    ];
  }

  let data = JSON.stringify({
    "max_tokens": 1024,
    "messages": messages,
    "user": "1B4C290D-969A-4EEF-A638-A06DAF41A27D",
    "model": "gpt-4o-mini"
  });

  let config = {
    method: 'POST',
    url: 'https://ai-keyboard.com/api/openapi/turbo-stream',
    headers: {
      'User-Agent': 'KeyboardGPT/1333 CFNetwork/3860.200.71 Darwin/25.1.0',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'X-Encryption-Token': '03d622c3b6475b7c05056401ac24b994',
      'Cache-Control': 'no-cache'
    },
    data: data,
    responseType: 'text'
  };

  const response = await axios.request(config);
  
  let fullResponse = '';
  const lines = response.data.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const jsonStr = line.substring(6);
      if (jsonStr.trim() === '[DONE]') break;
      
      try {
        const jsonData = JSON.parse(jsonStr);
        if (jsonData.choices && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
          fullResponse += jsonData.choices[0].delta.content;
        }
      } catch (e) {
        continue;
      }
    }
  }

  return fullResponse || "Sorry, I couldn't generate a response.";
}

module.exports = {
  config: {
    name: "ai",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Chat with AI using GPT-4o-mini",
    category: "ai",
    guide: {
      en: "{pn} <question> - Ask AI anything\nReply to AI's message to continue conversation"
    }
  },

  ST: async function({ message, args, event, api }) {
    const question = args.join(" ");
    
    if (!question) {
      return message.reply("Please provide a question!\nExample: ai Hello, how are you?");
    }

    try {
      const response = await callAI(question);
      
      return message.reply(response, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            conversationHistory: [
              {
                role: "user",
                content: question
              },
              {
                role: "assistant",
                content: response
              }
            ]
          });
        }
      });
    } catch (error) {
      console.error("AI Error:", error);
      return message.reply("❌ An error occurred while processing your request. Please try again later.");
    }
  },

  onReply: async function({ message, event, Reply, api }) {
    const { author, conversationHistory } = Reply;

    if (event.senderID !== author) {
      return;
    }

    const userMessage = event.body;

    if (!userMessage) {
      return;
    }

    try {
      conversationHistory.push({
        role: "user",
        content: userMessage
      });

      const response = await callAI(userMessage, conversationHistory);

      conversationHistory.push({
        role: "assistant",
        content: response
      });

      return message.reply(response, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            conversationHistory: conversationHistory
          });
        }
      });
    } catch (error) {
      console.error("AI Reply Error:", error);
      return message.reply("❌ An error occurred while processing your message. Please try again.");
    }
  }
};