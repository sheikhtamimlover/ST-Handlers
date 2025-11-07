const moment = require("moment-timezone");

const adminUIDs = [
  "61576212342334",
  "61557290571000",
  "61577728774966",
  "61552957618701",
  "61557290571000"
];

module.exports = {
  config: {
    name: "accept",
    aliases: ['acp'],
    version: "3.6",
    author: "Mahu",
    countDown: 8,
    role: 0,
    shortDescription: "Accept or list friend requests",
    longDescription: "Accept own friend request or list (admin-only) pending requests",
    category: "Utility",
  },

  onReply: async function ({ Reply, event, api }) {
    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;
    if (!event.body) return;
    const args = event.body.trim().toLowerCase().split(/\s+/);

    clearTimeout(Reply.unsendTimeout);

    const form = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      variables: {
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          client_mutation_id: Math.round(Math.random() * 19).toString()
        },
        scale: 3,
        refresh_num: 0
      }
    };

    const success = [];
    const failed = [];

    if (args[0] === "add") {
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
      form.doc_id = "3147613905362928";
    } else if (args[0] === "del") {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const isThreadAdmin = threadInfo.adminIDs.some(e => e.id === event.senderID);
      const isBotAdmin = adminUIDs.includes(event.senderID);
      if (!isThreadAdmin && !isBotAdmin) {
        return api.sendMessage("🎀🐥 𝐎𝐧𝐥𝐲 𝐚𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐝𝐞𝐥𝐞𝐭𝐞 𝐟𝐫𝐢𝐞𝐧𝐝 𝐫𝐞𝐪𝐮𝐞𝐬𝐭𝐬", event.threadID, event.messageID);
      }
      form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
      form.doc_id = "4108254489275063";
    } else {
      return api.sendMessage("💬 𝐑𝐞𝐩𝐥𝐲: <𝐚𝐝𝐝 | 𝐝𝐞𝐥> <𝐧𝐮𝐦𝐛𝐞𝐫 | 𝐚𝐥𝐥>", event.threadID, event.messageID);
    }

    let targetIDs = args.slice(1);

    if (args[1] === "all") {
      targetIDs = [];
      for (let i = 1; i <= listRequest.length; i++) targetIDs.push(i);
    }

    const newTargetIDs = [];
    const promiseFriends = [];

    for (const stt of targetIDs) {
      const u = listRequest[parseInt(stt) - 1];
      if (!u) {
        failed.push(`⚠️ 𝐍𝐨𝐭 𝐟𝐨𝐮𝐧𝐝: ${stt}`);
        continue;
      }
      form.variables.input.friend_requester_id = u.node.id;
      form.variables = JSON.stringify(form.variables);
      newTargetIDs.push(u);
      promiseFriends.push(api.httpPost("https://www.facebook.com/api/graphql/", form));
      form.variables = JSON.parse(form.variables);
    }

    for (let i = 0; i < newTargetIDs.length; i++) {
      try {
        const res = await promiseFriends[i];
        if (JSON.parse(res).errors) {
          failed.push(`❌ ${newTargetIDs[i].node.name}`);
          api.setMessageReaction("❌", event.messageReply?.messageID || event.messageID, () => {}, true);
        } else {
          const u = newTargetIDs[i];
          const timeFormatted = moment(u.time * 1009).tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss");
          success.push(`🎀🐥\n𝐍𝐚𝐦𝐞: ${u.node.name}\n𝐔𝐢𝐝: ${u.node.id}\n𝐓𝐢𝐦𝐞: ${timeFormatted}`);
          api.setMessageReaction("✅", event.messageReply?.messageID || event.messageID, () => {}, true);
        }
      } catch {
        failed.push(`❌ ${newTargetIDs[i].node.name}`);
        api.setMessageReaction("❌", event.messageReply?.messageID || event.messageID, () => {}, true);
      }
    }

    let msg = "";
    if (success.length) msg += `🎀🐥\n𝐅𝐫𝐢𝐞𝐧𝐝 𝐫𝐞𝐪𝐮𝐞𝐬𝐭𝐬 𝐚𝐜𝐜𝐞𝐩𝐭𝐞𝐝:\n\n${success.join("\n\n")}`;
    if (failed.length) msg += `\n\n⚠️ 𝐅𝐚𝐢𝐥𝐞𝐝:\n${failed.join("\n")}`;
    api.sendMessage(msg || "🎀🐥 𝐍𝐨 𝐫𝐞𝐪𝐮𝐞𝐬𝐭𝐬 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐞𝐝.", event.threadID, event.messageID);

    api.unsendMessage(messageID);
  },

  onStart: async function ({ event, api, args, commandName }) {
    const isAdminList = ["-l", "-list"].includes(args[0]?.toLowerCase());

    const form = {
      av: api.getCurrentUserID(),
      fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
      fb_api_caller_class: "RelayModern",
      doc_id: "4499164963466303",
      variables: JSON.stringify({ input: { scale: 3 } })
    };

    const data = await api.httpPost("https://www.facebook.com/api/graphql/", form);
    const listRequest = JSON.parse(data).data.viewer.friending_possibilities.edges;

    if (isAdminList) {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const isThreadAdmin = threadInfo.adminIDs.some(e => e.id === event.senderID);
      const isBotAdmin = adminUIDs.includes(event.senderID);
      if (!isThreadAdmin && !isBotAdmin) {
        return api.sendMessage("🎀🐥\n𝐎𝐧𝐥𝐲 𝐛𝐨𝐭 𝐨𝐫 𝐠𝐫𝐨𝐮𝐩 𝐚𝐝𝐦𝐢𝐧𝐬 𝐜𝐚𝐧 𝐬𝐞𝐞 𝐭𝐡𝐞 𝐥𝐢𝐬𝐭.", event.threadID, event.messageID);
      }

      let msg = `📋 𝐅𝐫𝐢𝐞𝐧𝐝 𝐑𝐞𝐪𝐮𝐞𝐬𝐭 𝐋𝐢𝐬𝐭:\n`;
      listRequest.forEach((user, idx) => {
        msg += `\n${idx + 1}. 𝐍𝐚𝐦𝐞: ${user.node.name}` +
          `\n𝐔𝐢𝐝: ${user.node.id}` +
          `\n𝐔𝐫𝐥: ${user.node.url.replace("www.facebook", "fb")}` +
          `\n𝐓𝐢𝐦𝐞: ${moment(user.time * 1009).tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss")} \n`;
      });

      return api.sendMessage(`${msg}\n\n💬 𝐑𝐞𝐩𝐥𝐲: <𝐚𝐝𝐝 | 𝐝𝐞𝐥> <𝐧𝐮𝐦𝐛𝐞𝐫 | 𝐚𝐥𝐥>`, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          listRequest,
          author: event.senderID,
          unsendTimeout: setTimeout(() => api.unsendMessage(info.messageID), this.config.countDown * 20000)
        });
      }, event.messageID);
    }

    const listFriends = (await api.getFriendsList()).map(f => f.userID);
    if (listFriends.includes(event.senderID)) {
      api.setMessageReaction("😾", event.messageID, () => {}, true);
      return api.sendMessage("🎀🐥\n𝐘𝐨𝐮 𝐚𝐫𝐞 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐟𝐫𝐢𝐞𝐧𝐝𝐬 𝐰𝐢𝐭𝐡 𝐦𝐞.", event.threadID, event.messageID);
    }

    const requesterId = event.senderID;
    const request = listRequest.find(u => u.node.id === requesterId);
    if (!request) {
      api.setMessageReaction("🙁", event.messageID, () => {}, true);
      return api.sendMessage("🎀🐥\n𝐘𝐨𝐮 𝐡𝐚𝐯𝐞𝐧'𝐭 𝐬𝐞𝐧𝐭 𝐦𝐞 𝐚 𝐟𝐫𝐢𝐞𝐧𝐝 𝐫𝐞𝐪𝐮𝐞𝐬𝐭 𝐲𝐞𝐭.", event.threadID, event.messageID);
    }

    const formAccept = {
      av: api.getCurrentUserID(),
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
      doc_id: "3147613905362928",
      variables: JSON.stringify({
        input: {
          source: "friends_tab",
          actor_id: api.getCurrentUserID(),
          friend_requester_id: requesterId,
          client_mutation_id: Math.round(Math.random() * 19).toString()
        },
        scale: 3,
        refresh_num: 0
      })
    };

    try {
      const res = await api.httpPost("https://www.facebook.com/api/graphql/", formAccept);
      if (JSON.parse(res).errors) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return api.sendMessage("🎀🐥\n𝐒𝐨𝐫𝐫𝐲, 𝐜𝐨𝐮𝐥𝐝 𝐧𝐨𝐭 𝐚𝐜𝐜𝐞𝐩𝐭 𝐲𝐨𝐮𝐫 𝐫𝐞𝐪𝐮𝐞𝐬𝐭.", event.threadID, event.messageID);
      }
      const timeFormatted = moment(request.time * 1009).tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss");
      const replyMsg = `🎀🐥\n𝐘𝐨𝐮𝐫 𝐟𝐫𝐢𝐞𝐧𝐝 𝐫𝐞𝐪𝐮𝐞𝐬𝐭 𝐚𝐜𝐜𝐞𝐩𝐭𝐞𝐝:\n\n𝐍𝐚𝐦𝐞: ${request.node.name}\n𝐔𝐢𝐝: ${request.node.id}\n𝐓𝐢𝐦𝐞: ${timeFormatted}`;
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      return api.sendMessage(replyMsg, event.threadID, event.messageID);
    } catch {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("🎀🐥\n𝐒𝐨𝐦𝐞𝐭𝐡𝐢𝐧𝐠 𝐰𝐞𝐧𝐭 𝐰𝐫𝐨𝐧𝐠 𝐰𝐡𝐢𝐥𝐞 𝐚𝐜𝐜𝐞𝐩𝐭𝐢𝐧𝐠.", event.threadID, event.messageID);
    }
  }
};
