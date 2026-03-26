module.exports = {
  config: {
    name: "ppjs",
    aliases: ["profilepics", "userphotos"],
    version: "2.4.78",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    premium: false,
    usePrefix: true,
    description: "Fetch user profile information and photos",
    category: "utility",
    guide: "{pn} @mention or reply to a message"
  },
  langs: {
    en: {
      noUser: "Please tag a user or reply to their message!",
      fetching: "⏳ Fetching profile information and photos...",
      profileInfo: "👤 Profile Information:\n━━━━━━━━━━━━━━━━\n📛 Name: {name}\n🆔 User ID: {uid}\n🔗 Profile URL: {url}\n📸 Total Photos Found: {count}\n━━━━━━━━━━━━━━━━\n💬 Reply with the number to get that photo",
      noPhotos: "No photos found for this user!",
      error: "❌ Error: {error}",
      invalidNumber: "Please reply with a valid number from the list!",
      sendingPhoto: "📤 Sending photo {num}..."
    }
  },
  onStart: async function({ message, args, event, api, getLang, usersData }) {
    let targetUID;
    
    if (event.type === "message_reply") {
      targetUID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      targetUID = Object.keys(event.mentions)[0];
    } else {
      return message.reply(getLang("noUser"));
    }

    message.reply(getLang("fetching"));

    try {
      const userInfo = await api.getUserInfo(targetUID);
      const user = userInfo[targetUID];
      
      const photos = await api.getUserPhotos(targetUID, 50);
      
      const profileData = {
        name: user.name,
        uid: targetUID,
        url: user.profileUrl || `https://facebook.com/${targetUID}`,
        count: photos.length
      };

      global.GoatBot.onReply = global.GoatBot.onReply || new Map();
      global.GoatBot.onReply.set(event.messageID, {
        commandName: this.config.name,
        messageID: event.messageID,
        author: event.senderID,
        photos: photos,
        targetUID: targetUID
      });

      let photoList = "";
      photos.forEach((photo, index) => {
        photoList += `\n${index + 1}. Photo ${index + 1}`;
      });

      const fullMessage = getLang("profileInfo", profileData) + (photos.length > 0 ? photoList : "");
      
      return message.reply(fullMessage, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            photos: photos,
            targetUID: targetUID
          });
        }
      });

    } catch (error) {
      return message.reply(getLang("error", { error: error.message }));
    }
  },

  onReply: async function({ message, event, Reply, getLang, api }) {
    const { author, photos, targetUID } = Reply;

    if (event.senderID !== author) return;

    const choice = parseInt(event.body.trim());

    if (isNaN(choice) || choice < 1 || choice > photos.length) {
      return message.reply(getLang("invalidNumber"));
    }

    const selectedPhoto = photos[choice - 1];
    
    try {
      message.reply(getLang("sendingPhoto", { num: choice }));
      
      const stream = await global.utils.getStreamFromURL(selectedPhoto.url || selectedPhoto.src);
      
      return message.reply({
        body: `📸 Photo ${choice} from user ${targetUID}`,
        attachment: stream
      });
    } catch (error) {
      return message.reply(getLang("error", { error: error.message }));
    }
  }
};