const { GoatWrapper } = require("fca-liane-utils");

module.exports = {
  config: {
    name: "pp",
    aliases: [],
    version: "1.1",
    author: "NIB",
    countDown: 5,
    role: 0,
    shortDescription: "PROFILE image",
    longDescription: "PROFILE image",
    category: "image",
    guide: {
      en: "   {pn} @tag or reply to see profile picture"
    }
  },

  langs: {
    vi: {
      noTag: "Bạn phải tag người bạn muốn tát"
    },
    en: {
      noTag: "You must tag the person you want to get profile picture of"
    }
  },

  onStart: async function ({ event, message, usersData }) {
    let avt;
    const uid1 = event.senderID;
    const uid2 = Object.keys(event.mentions)[0];

    if (event.type === "message_reply") {
      avt = await usersData.getAvatarUrl(event.messageReply.senderID);
    } else {
      if (!uid2) {
        avt = await usersData.getAvatarUrl(uid1);
      } else {
        avt = await usersData.getAvatarUrl(uid2);
      }
    }

    return message.reply({
      body: "",
      attachment: await global.utils.getStreamFromURL(avt)
    });
  }
};

// ✅ Enable No-Prefix
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });