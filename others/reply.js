module.exports = {
  config: {
    name: "reply",
    permission: 0,
    prefix: false,
    description: "Auto reply system",
    category: "system"
  },

  async start({ senderId, nayan, event }) {

    if (!event.body) return;

    const msg = event.body.toLowerCase().trim();

    // Auto reply list
    if (msg === "hi") {
      return nayan.sendMessage(senderId, {
        text: "Hello 👋"
      });
    }

    if (msg === "/") {
      return nayan.sendMessage(senderId, {
        text: "Please type /help ✨"
      });
    }

    if (msg === "hey") {
      return nayan.sendMessage(senderId, {
        text: "Hey 👋"
      });
    }

  }
};