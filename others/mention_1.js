module.exports = {
  config: {
    name: "mention",
    aliases: ["tagall", "tag"],
    version: "1.4",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 1,
    description: "Mention members via reply or all at once, including bot",
    category: "group",
    guide: {
      en: "{pn} (reply) - Mention replied user\n"
        + "{pn} all - Tag all members at once (bot included)\n"
        + "{pn} <message> (reply) - Mention replied user with custom message\n"
        + "{pn} all <message> - Tag all at once with custom message"
    }
  },

  onStart: async function({ api, event, args, message, usersData }) {
    const { participantIDs, threadID, senderID, messageReply } = event;

    const isAll = args[0]?.toLowerCase() === "all";
    const customMsg = isAll ? args.slice(1).join(" ") : args.join(" ");
    const defaultMsg = "All member active hon pls";
    const finalMsg = customMsg || defaultMsg;

    // Fetch thread info
    const threadInfo = await api.getThreadInfo(threadID);
    const userNicknames = {};
    threadInfo.userInfo.forEach(user => {
      userNicknames[user.id] = user.name;
    });

    if (isAll) {
      // Tag all members including bot
      let mentions = [];
      let body = "┏━━━━━━━━━━━━━┓\n";

      let count = 1;
      for (let id of participantIDs) {
        const nickname = userNicknames[id] || await usersData.getName(id);
        body += `┃ ${count}. @${nickname}\n`;
        mentions.push({ tag: `@${nickname}`, id });
        count++;
      }

      body += "┗━━━━━━━━━━━━━┛\n\n";
      body += "╭─━━━━━━━━━━━━━━━━━━─╮\n";
      body += ` 🔔 ${finalMsg} 🔔\n`;
      body += "╰─━━━━━━━━━━━━━━━━━━─╯\n\n";
      body += `✨ Total Members: ${count - 1} ✨`;

      return message.reply({ body, mentions });
    } else {
      // Single mention
      let targetID;
      let nickname;

      if (messageReply) {
        // Reply-based
        targetID = messageReply.senderID;
        nickname = userNicknames[targetID] || await usersData.getName(targetID);
      } else {
        // No reply → mention sender
        targetID = senderID;
        nickname = userNicknames[targetID] || await usersData.getName(targetID);
      }

      const body = `┏━━━━━━━━━━━━━┓\n`
        + `┃ 👤 @${nickname}\n`
        + `┗━━━━━━━━━━━━━┓\n\n`
        + `╭─━━━━━━━━━━━━━━━━━━─╮\n`
        + ` 🔔 ${finalMsg} 🔔\n`
        + "╰─━━━━━━━━━━━━━━━━━━─╯\n";

      return message.reply({
        body,
        mentions: [{ tag: `@${nickname}`, id: targetID }]
      });
    }
  }
};