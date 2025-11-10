module.exports = {
  config: {
    name: "ev",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Send @everyone message one time",
    category: "fun",
    guide: {
      en: "{pn} - Tag everyone with message"
    }
  },

  ST: async function({ api, event, message }) {
    const msg = "@everyone চিপা থেকে বের হও সবাই";
    await api.sendMessage({
      body: msg,
      mentions: [{
        tag: "@everyone",
        id: "0"
      }]
    }, event.threadID);
  }
};