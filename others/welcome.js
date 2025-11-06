const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
  global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "2.0",
    author: "Rakib",
    category: "events"
  },

  langs: {
    en: {
      session1: "🌅 morning",
      session2: "☀️ noon",
      session3: "🌇 afternoon",
      session4: "🌙 evening",
      multiple1: "you",
      multiple2: "you guys",
      defaultWelcomeMessage: `✨ Hello {userNameTag}!\n🎉 Welcome {multiple} to the chat group: 『 {boxName} 』\n👥 You are the {memberCount}th member of this group.\n💫 Have a nice {session}!\n\n👤 Added by: {inviter}`
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const hours = getTime("HH");
    const { threadID } = event;
    const { nickNameBot } = global.GoatBot.config;
    const prefix = global.utils.getPrefix(threadID);
    const dataAddedParticipants = event.logMessageData.addedParticipants;

    // if new member is bot
    if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
      if (nickNameBot)
        api.changeNickname(nickNameBot, threadID, api.getCurrentUserID());
      return message.send(
        `✨⚜️ᥲssᥲᥣᥲmᥙ ᥲᥣᥲіkᥙm☄️🌈,🎊 𝖳𝗁𝖺𝗇𝗄 𝖸𝗈𝗎🎉 𝖿𝗈𝗋 𝗂𝗇𝗏𝗂𝗍𝗂𝗇𝗀 𝗆𝖾 𝗍𝗈 𝗍𝗁𝗂𝗌 𝖼𝗁𝖺𝗍 𝗀𝗋𝗈𝗎𝗉 !🩷🪽\n 𝑴𝒚 𝒑𝒓𝒆𝒇𝒊𝒙 𝒊𝒔 : ${prefix} \n 𝑻𝒐 𝒗𝒊𝒆𝒘 𝒎𝒚 𝒂𝒍𝒍 𝒄𝒐𝒎𝒎𝒂𝒏𝒅𝒔🧾, 𝒑𝒍𝒆𝒂𝒔𝒆 𝒖𝒔𝒆 : ${prefix}help \n 👑𝑴𝒚 𝑶𝒑𝒆𝒓𝒂𝒕𝒐𝒓 𝒊𝒔 : 𝗥𝗮𝗸𝗶𝗯 𝗔𝗱𝗶𝗹 👑\n 💫𝖨𝖿 𝗒𝗈𝗎 𝗇𝖾𝖾𝖽 𝖺𝗇𝗒 𝗄𝗂𝗇𝖽 𝗈𝖿 𝗁𝖾𝗅𝗉 𝗉𝗅𝖾𝖺𝗌𝖾 𝖼𝗈𝗇𝗍𝖺𝖼𝗍 𝗔𝗱𝗺𝗶𝗻 𝗈𝗋 𝗃𝗈𝗂𝗇 𝗈𝗎𝗋 𝗌𝗎𝗉𝗉𝗈𝗋𝗍𝗀𝖼 😊🙂‍↔️🪽`
      );
    }

    // if new member:
    if (!global.temp.welcomeEvent[threadID])
      global.temp.welcomeEvent[threadID] = {
        joinTimeout: null,
        dataAddedParticipants: []
      };

    global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
    clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

    global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {
      const threadData = await threadsData.get(threadID);
      if (threadData.settings.sendWelcomeMessage == false) return;

      const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
      const dataBanned = threadData.data.banned_ban || [];
      const threadName = threadData.threadName;
      const userName = [], mentions = [];
      let multiple = false;

      if (dataAddedParticipants.length > 1) multiple = true;

      for (const user of dataAddedParticipants) {
        if (dataBanned.some((item) => item.id == user.userFbId)) continue;
        userName.push(user.fullName);
        mentions.push({ tag: user.fullName, id: user.userFbId });
      }

      if (userName.length == 0) return;

      // inviter er info (je add koreche)
      const inviterID = event.author || event.logMessageData.inviter || event.senderID;
      let inviterName = "Unknown User";
      try {
        const info = await api.getUserInfo(inviterID);
        inviterName = info[inviterID]?.name || "Unknown User";
      } catch (e) {}

      // total member count
      let memberCount = 0;
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        memberCount = threadInfo.participantIDs.length;
      } catch (e) {}

      let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

      const form = {
        mentions: welcomeMessage.match(/\{userNameTag\}/g) ? mentions : null
      };

      welcomeMessage = welcomeMessage
        .replace(/\{userName\}|\{userNameTag\}/g, userName.join(", "))
        .replace(/\{boxName\}|\{threadName\}/g, threadName)
        .replace(/\{multiple\}/g, multiple ? getLang("multiple2") : getLang("multiple1"))
        .replace(/\{session\}/g,
          hours <= 10 ? getLang("session1")
          : hours <= 12 ? getLang("session2")
          : hours <= 18 ? getLang("session3")
          : getLang("session4")
        )
        .replace(/\{inviter\}/g, inviterName)
        .replace(/\{memberCount\}/g, memberCount);

      form.body = `💌 ━━「 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 」━━ 💌\n\n${welcomeMessage}\n\n✨ Enjoy your time here 💫`;

      if (threadData.data.welcomeAttachment) {
        const files = threadData.data.welcomeAttachment;
        const attachments = files.reduce((acc, file) => {
          acc.push(drive.getFile(file, "stream"));
          return acc;
        }, []);
        form.attachment = (await Promise.allSettled(attachments))
          .filter(({ status }) => status == "fulfilled")
          .map(({ value }) => value);
      }
      message.send(form);
      delete global.temp.welcomeEvent[threadID];
    }, 1500);
  }
};
