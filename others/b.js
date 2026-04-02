module.exports = {
  config: {
    name: "b",
    aliases: ["بوت", "ذكاء", "ai"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: false,
    description: "ذكاء اصطناعي متقدم مع ذاكرة قوية للمحادثات",
    category: "ai",
    guide: "{pn} <سؤالك>\n{pn} clear - مسح الذاكرة\n{pn} memory - عرض الذاكرة"
  },
  langs: {
    en: {
      missingQuery: "❌ Please ask a question!",
      error: "❌ An error occurred while processing your request.",
      thinking: "🤔 Thinking...",
      memoryCleared: "✅ Memory cleared successfully!",
      memoryStatus: "🧠 Memory Status:\n• Messages: {count}\n• Tokens: ~{tokens}\n• Started: {time}",
      noMemory: "❌ No memory available for this conversation."
    },
    ar: {
      missingQuery: "❌ الرجاء طرح سؤال!",
      error: "❌ حدث خطأ أثناء معالجة طلبك.",
      thinking: "🤔 جاري التفكير...",
      memoryCleared: "✅ تم مسح الذاكرة بنجاح!",
      memoryStatus: "🧠 حالة الذاكرة:\n• الرسائل: {count}\n• الرموز: ~{tokens}\n• البداية: {time}",
      noMemory: "❌ لا توجد ذاكرة متاحة لهذه المحادثة."
    }
  },
  onStart: async function({ message, args, event, api, getLang, usersData }) {
    const axios = require("axios");
    
    try {
      const query = args.join(" ").trim();

      if (!query) {
        return message.reply(getLang("missingQuery"));
      }

      if (query.toLowerCase() === "clear" || query === "مسح") {
        delete global.GoatBot.memory[event.threadID];
        return message.reply(getLang("memoryCleared"));
      }

      if (query.toLowerCase() === "memory" || query === "ذاكرة") {
        const memory = global.GoatBot.memory[event.threadID];
        if (!memory || memory.messages.length === 0) {
          return message.reply(getLang("noMemory"));
        }
        
        const tokens = memory.messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / 4;
        const startTime = new Date(memory.startTime).toLocaleString('ar-EG');
        
        return message.reply(
          getLang("memoryStatus")
            .replace("{count}", memory.messages.length)
            .replace("{tokens}", Math.round(tokens))
            .replace("{time}", startTime)
        );
      }

      const userName = await usersData.getName(event.senderID) || "User";
      
      if (!global.GoatBot.memory) {
        global.GoatBot.memory = {};
      }

      if (!global.GoatBot.memory[event.threadID]) {
        global.GoatBot.memory[event.threadID] = {
          messages: [],
          startTime: Date.now(),
          maxMessages: 50,
          maxTokens: 4000
        };
      }

      const memory = global.GoatBot.memory[event.threadID];

      memory.messages.push({
        role: "user",
        content: query,
        timestamp: Date.now(),
        userName: userName
      });

      const estimateTokens = (messages) => {
        return messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / 4;
      };

      while (memory.messages.length > memory.maxMessages || estimateTokens(memory.messages) > memory.maxTokens) {
        memory.messages.shift();
      }

      await message.reply(getLang("thinking"));

      const systemPrompt = `You are ST AI, an intelligent assistant created by Sheikh Tamim. You have memory of this conversation and can reference previous messages. Current user: ${userName}. Always respond naturally and remember context from earlier in the conversation.`;

      const conversationHistory = memory.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data } = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBielrawiMg_x3aypInvs02LmUPErHXXeo",
        {
          contents: [
            {
              parts: [
                { text: systemPrompt },
                ...conversationHistory.map(msg => ({ text: `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}` }))
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048
          }
        },
        {
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return message.reply(getLang("error"));
      }

      const reply = data.candidates[0].content.parts[0].text.trim();

      memory.messages.push({
        role: "assistant",
        content: reply,
        timestamp: Date.now()
      });

      await message.reply(reply);

    } catch (error) {
      console.error("B Command Error:", error.message);
      if (error.response) {
        console.error("API Error:", error.response.status, error.response.data);
      }
      return message.reply(getLang("error"));
    }
  }
};