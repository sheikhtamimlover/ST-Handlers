const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const prefixes = ["bby", "janu", "বাবু", "babu", "bbu", "jnu", "bot", "baby", "বেবি", "জানু", "বট", "طفل", "بوت", "bbz", "beb", "tamim"];

function removePrefix(str, prefixes) {
  for (const prefix of prefixes) {
    if (str.toLowerCase().startsWith(prefix.toLowerCase())) {
      return str.slice(prefix.length).trim();
    }
  }
  return str;
}

module.exports = {
  config: {
    name: 'beb',
    aliases: ["hina"],
    author: 'ST',
    version: '1.1.0',
    countDown: 0,
    role: 0,
    description: {
      en: 'AI Chat with Beb Bot - Chat, Teach, and Check Stats'
    },
    category: 'ai',
    usePrefix: true,
    guide: {
      en: `
Usage:
• {pn} <message> - Chat with Beb AI
• {pn} teach <question> | <answer> | <emoji> - Teach Beb (reply to image to add it)
• {pn} count [userId] - Check teaching count

Examples:
• {pn} hello - Chat with Beb
• {pn} teach what is your name | I am Beb | 😊 - Teach Beb
• {pn} count - Check your teaching count
• {pn} count 123456789 - Check another user's count

Note: Reply to an image when teaching to add it to the response.
      `.trim()
    }
  },

  langs: {
    en: {
      missingArgs: "Hello I'm Beb Bot\nHow can I assist you?\n\n{guide}",
      chatError: "❌ Error: {error}",
      teachSuccess: "✅ Teaching successful!",
      teachError: "❌ Error: {error}",
      teachUsage: "❌ Usage: {prefix}beb teach <question> | <answer> | <emoji (optional)>\n\nExample: {prefix}beb teach hello | hi there! | 👋\n\nNote: Reply to an image to add it to the teaching.",
      teachInvalidFormat: "❌ Please use format: <question> | <answer> | <emoji (optional)>",
      countStats: "📊 Teaching Stats for {userName}\n\n🎓 Total teachings: {count}",
      countError: "❌ Error: {error}",
      bebResponse: "🤖",
      downloadError: "Failed to download image, sending text only"
    }
  },

  ST: async function ({ event, api, args, message, getLang, commandName }) {
    const userId = event.from.id;
    const prefix = global.GoatBot.config.prefix;

    try {
      if (!args[0]) {
        const guide = this.config.guide.en.replace(/{p}/g, prefix);
        return message.reply(getLang("missingArgs").replace("{guide}", guide));
      }

      const subCommand = args[0].toLowerCase();

      // Handle teach command
      if (subCommand === 'teach') {
        return await this.teach({ event, api, args: args.slice(1), message, userId, getLang, prefix });
      }

      // Handle count command
      if (subCommand === 'count') {
        return await this.getCount({ event, api, args: args.slice(1), message, userId, getLang });
      }

      // Handle chat
      const query = args.join(" ");

      try {
        const stapi = new global.utils.STBotApis();
        const response = await axios.post(
          `${stapi.baseURL}/beb/chat`,
          {
            message: query,
            userId: `user_${userId}`,
            senderId: userId.toString()
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { response: responseText, emojis, imageUrl } = response.data;

        // Fix relative image URLs
        let fullImageUrl = imageUrl;
        if (imageUrl && imageUrl.startsWith('/')) {
          fullImageUrl = `${stapi.baseURL}${imageUrl}`;
        }

        await this.sendBebResponse(api, message, event, responseText, emojis, fullImageUrl, commandName, getLang);

      } catch (error) {
        global.log.error('Beb chat error:', error.response?.data || error.message);
        return message.reply(getLang("chatError").replace("{error}", error.response?.data?.message || error.message));
      }
    } catch (error) {
      global.log.error('Beb command error:', error);
      return message.reply(getLang("chatError").replace("{error}", error.message || "Unknown error"));
    }
  },

  onReply: async function ({ event, api, Reply, message, getLang, commandName }) {
    try {
      // Get reply text from both caption and text
      const replyText = event.text || event.caption || '';

      // Skip if empty or special commands
      if (!replyText || replyText === '/r' || replyText === '/edittext') {
        return;
      }

      // Verify this is actually a reply to our bot message
      if (!event.reply_to_message || !event.reply_to_message.from.is_bot) {
        return;
      }

      const stapi = new global.utils.STBotApis();
      const bebResponse = await axios.post(
        `${stapi.baseURL}/beb/chat`,
        {
          message: replyText,
          userId: `user_${event.from.id}`,
          senderId: event.from.id.toString()
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { response: responseText, emojis, imageUrl } = bebResponse.data;

      // Fix relative image URLs
      let fullImageUrl = imageUrl;
      if (imageUrl && imageUrl.startsWith('/')) {
        fullImageUrl = `${stapi.baseURL}${imageUrl}`;
      }

      await this.sendBebResponse(api, message, event, responseText, emojis, fullImageUrl, commandName, getLang);

    } catch (error) {
      global.log.error('Beb onReply error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      await message.reply(getLang("chatError").replace("{error}", errorMsg)).catch(() => {});
    }
  },

  onChat: async function ({ bot, message, msg }) {
    try {
      // Count all messages, not just commands
      if (msg.from?.is_bot) return;

      if (global.ST && global.ST.messageTracker && global.ST.messageTracker.add) {
        global.ST.messageTracker.add(msg.chat.id, msg.from.id);
      }

      if (msg.type === "message_reply") {
        return false;
      }

      let messageText = msg.text?.toLowerCase() || "";
      const hasPrefix = prefixes.some(prefix => messageText.startsWith(prefix.toLowerCase()));

      if (hasPrefix) {
        await message.react('⏳');

        const withoutPrefix = removePrefix(messageText, prefixes);
        const words = withoutPrefix.split(' ');

        if (words.length === 0 || withoutPrefix.trim() === '') {
          const randomResponses = ["এত ডাকো কেনো 😑", "ওই তুমি single না?🫵🤨"];
          const randomResponse = randomResponses[Math.floor(Math.random() * randomResponses.length)];

          const sentMsg = await message.reply(randomResponse);

          if (sentMsg && sentMsg.message_id) {
            global.ST.onReply.set(sentMsg.message_id, {
              commandName: this.config.name,
              type: 'reply',
              messageID: sentMsg.message_id,
              author: msg.from.id
            });
          }
          return false;
        }

        try {
          const stapi = new global.utils.STBotApis();
          const response = await axios.post(
            `${stapi.baseURL}/beb/chat`,
            {
              message: withoutPrefix,
              userId: `user_${msg.from.id}`,
              senderId: msg.from.id.toString()
            },
            { headers: { 'Content-Type': 'application/json' } }
          );

          const { response: mg, emojis, imageUrl } = response.data;

          // Fix relative image URLs
          let fullImageUrl = imageUrl;
          if (imageUrl && imageUrl.startsWith('/')) {
            fullImageUrl = `${stapi.baseURL}${imageUrl}`;
          }

          await this.sendBebResponse(bot, message, msg, mg, emojis, fullImageUrl, this.config.name);
          return false;
        } catch (error) {
          global.log.error('Beb onChat error:', error.response?.data || error.message);
          await message.react('❌').catch(() => {});
          return false;
        }
      }
    } catch (error) {
      global.log.error('Beb onChat error:', error);
      return false;
    }
  },

  sendBebResponse: async function (api, message, event, responseText, emojis, imageUrl, commandName, getLang) {
    try {
      const messageBody = responseText || (getLang ? getLang("bebResponse") : "🤖");

      if (imageUrl) {
        try {
          const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const imagePath = path.join(__dirname, 'tmp', `beb_${Date.now()}.jpg`);

          // Ensure tmp directory exists
          const tmpDir = path.join(__dirname, 'tmp');
          if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true });
          }

          fs.writeFileSync(imagePath, Buffer.from(imageResponse.data));

          const sentMsg = await message.reply({
            body: messageBody,
            attachment: [fs.createReadStream(imagePath)]
          });

          // Clean up temp file
          setTimeout(() => {
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
          }, 10000);

          const msgObj = Array.isArray(sentMsg) ? sentMsg[0] : sentMsg;

          // React with emoji if available
          if (msgObj && emojis) {
            const emojiArray = Array.isArray(emojis) ? emojis : [emojis];
            if (emojiArray.length > 0 && emojiArray[0]) {
              await message.react(emojiArray[0], event.message_id);
            }
          }

          // Store onReply data
          if (msgObj && msgObj.message_id) {
            global.ST.onReply.set(msgObj.message_id, {
              commandName: commandName || this.config.name,
              type: 'reply',
              messageID: msgObj.message_id,
              author: event.from.id
            });
          }

        } catch (imgErr) {
          global.log.error('Image download error:', imgErr);

          // Fallback to text-only message
          const sentMsg = await message.reply(messageBody);

          if (sentMsg && emojis) {
            const emojiArray = Array.isArray(emojis) ? emojis : [emojis];
            if (emojiArray.length > 0 && emojiArray[0]) {
              await message.react(emojiArray[0], event.message_id);
            }
          }

          if (sentMsg && sentMsg.message_id) {
            global.ST.onReply.set(sentMsg.message_id, {
              commandName: commandName || this.config.name,
              type: 'reply',
              messageID: sentMsg.message_id,
              author: event.from.id
            });
          }
        }
      } else {
        // No image, just text reply
        const sentMsg = await message.reply(messageBody);

        if (sentMsg && emojis) {
          const emojiArray = Array.isArray(emojis) ? emojis : [emojis];
          if (emojiArray.length > 0 && emojiArray[0]) {
            await message.react(emojiArray[0], event.message_id);
          }
        }

        if (sentMsg && sentMsg.message_id) {
          global.ST.onReply.set(sentMsg.message_id, {
            commandName: commandName || this.config.name,
            type: 'reply',
            messageID: sentMsg.message_id,
            author: event.from.id
          });
        }
      }
    } catch (error) {
      global.log.error('sendBebResponse error:', error);
      throw error;
    }
  },

  teach: async function ({ event, api, args, message, userId, getLang, prefix }) {
    try {
      if (args.length < 1) {
        return message.reply(
          getLang("teachUsage")
            .replace("{prefix}", prefix)
            .replace("{prefix}", prefix)
        );
      }

      const input = args.join(" ");
      const parts = input.split("|").map(p => p.trim());

      if (parts.length < 2) {
        return message.reply(getLang("teachInvalidFormat"));
      }

      const question = parts[0];
      const answer = parts[1];
      const emoji = parts[2] || '';

      const formData = new FormData();
      formData.append('question', question);
      formData.append('answer', answer);
      formData.append('emojis', emoji);
      formData.append('userId', `user_${userId}`);

      // Handle image attachment from reply
      const replyMsg = event.reply_to_message;
      if (replyMsg) {
        try {
          // Check for photo
          if (replyMsg.photo && replyMsg.photo.length > 0) {
            const photo = replyMsg.photo[replyMsg.photo.length - 1];
            const filePath = await message.downloadAttachment({ type: 'photo', data: photo });
            if (filePath && fs.existsSync(filePath)) {
              formData.append('images', fs.createReadStream(filePath));
            }
          }
          // Check for document (image file)
          else if (replyMsg.document && replyMsg.document.mime_type?.startsWith('image/')) {
            const filePath = await message.downloadAttachment({ type: 'document', data: replyMsg.document });
            if (filePath && fs.existsSync(filePath)) {
              formData.append('images', fs.createReadStream(filePath));
            }
          }
        } catch (attachErr) {
          global.log.error('Attachment download error:', attachErr);
        }
      }

      const stapi = new global.utils.STBotApis();
      const response = await axios.post(
        `${stapi.baseURL}/api/teach`,
        formData,
        { headers: formData.getHeaders() }
      );

      // React to confirm success
      await message.react('✅', event.message_id);

      return message.reply(response.data.message || getLang("teachSuccess"));

    } catch (error) {
      global.log.error('Teach error:', error.response?.data || error.message);

      // React with error emoji
      await message.react('❌', event.message_id).catch(() => {});

      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      return message.reply(getLang("teachError").replace("{error}", errorMsg));
    }
  },

  getCount: async function ({ event, api, args, message, userId, getLang }) {
    try {
      const targetUserId = args[0] || userId;
      const stapi = new global.utils.STBotApis();

      const response = await axios.get(`${stapi.baseURL}/api/count/${targetUserId}`);
      const count = response.data.count || 0;

      let userName = 'Unknown User';
      try {
        const user = await global.db.getUser(String(targetUserId));
        userName = user.firstName || 'Unknown User';
      } catch (err) {
        // Use targetUserId as fallback
        userName = targetUserId;
      }

      return message.reply(
        getLang("countStats")
          .replace("{userName}", userName)
          .replace("{count}", count)
      );

    } catch (error) {
      global.log.error('Count error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.message || "Unknown error";
      return message.reply(getLang("countError").replace("{error}", errorMsg));
    }
  }
};