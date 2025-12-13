module.exports = {
  config: {
    name: "save",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 3,
    role: 0,
    description: "Save replied message to specific thread",
    category: "utility",
    guide: "{pn} (reply to a message) - Save message to archive thread"
  },

  ST: async function({ message, event, api }) {
    const targetThreadID = "886960563901648";

    try {
      if (!event.messageReply) {
        return message.reply('❌ Please reply to a message that you want to save!');
      }

      const reply = event.messageReply;
      const senderName = reply.senderName || "Unknown User";
      const messageBody = reply.body || "[No text content]";
      const messageTime = new Date().toLocaleString();
      
      let savedMessage = `╭─────────────────⭓
│ 💾 Saved Message
├─────────────────⭓
│ 👤 From: ${senderName}
│ 🕐 Time: ${messageTime}
├─────────────────⭓
│ 💬 Message:
│ ${messageBody}
╰─────────────────⭓`;

      const attachments = [];

      if (reply.attachments && reply.attachments.length > 0) {
        for (const attachment of reply.attachments) {
          if (attachment.type === 'photo') {
            attachments.push(await global.utils.getStreamFromURL(attachment.url));
          } else if (attachment.type === 'video') {
            attachments.push(await global.utils.getStreamFromURL(attachment.url));
          } else if (attachment.type === 'audio') {
            attachments.push(await global.utils.getStreamFromURL(attachment.url));
          } else if (attachment.type === 'file') {
            attachments.push(await global.utils.getStreamFromURL(attachment.url));
          }
        }
        
        savedMessage += `\n\n📎 Attachments: ${reply.attachments.length} file(s)`;
      }

      await api.sendMessage(
        {
          body: savedMessage,
          attachment: attachments.length > 0 ? attachments : undefined
        },
        targetThreadID
      );

      await message.reply('✅ Message saved successfully to archive thread!');

    } catch (error) {
      console.error('Save command error:', error);
      await message.reply('❌ An error occurred while saving the message. Please try again.');
    }
  }
};