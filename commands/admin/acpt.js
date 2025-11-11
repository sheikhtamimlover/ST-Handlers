module.exports = {
  config: {
    name: "acpt",
    version: "1.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 2,
    description: "Accept friend requests by serial number",
    category: "admin",
    guide: "{pn} - Shows pending friend requests with serial numbers\nReply with serial numbers to accept (e.g., 1 or 1 2 3 or all)"
  },

  ST: async function({ message, event, api }) {
    try {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
        fb_api_caller_class: "RelayModern",
        doc_id: "4499164963466303",
        variables: JSON.stringify({})
      };

      const listRequest = JSON.parse(await api.httpPost("https://www.facebook.com/api/graphql/", form)).data.viewer.friending_possibilities.edges;

      if (listRequest.length === 0) {
        return message.reply("❌ No pending friend requests!");
      }

      let msg = "📋 Friend Request List:\n\n";
      let requests = [];

      for (let i = 0; i < listRequest.length; i++) {
        const user = listRequest[i].node;
        requests.push({
          uid: user.id,
          name: user.name
        });
        msg += `${i + 1}. ${user.name}\n`;
      }

      msg += `\n💡 Reply with serial number(s) to accept\nExample: 1 or 1 2 3 or all`;

      return message.reply(msg, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: module.exports.config.name,
          messageID: info.messageID,
          author: event.senderID,
          requests: requests
        });
      });

    } catch (error) {
      return message.reply("❌ Error fetching friend requests: " + error.message);
    }
  },

  onReply: async function({ message, event, api, Reply }) {
    const { author, requests } = Reply;

    if (event.senderID !== author) {
      return message.reply("⚠️ You are not authorized to use this!");
    }

    const input = event.body.trim().toLowerCase();

    try {
      let toAccept = [];

      if (input === "all") {
        toAccept = requests;
      } else {
        const numbers = input.split(" ").map(n => parseInt(n)).filter(n => !isNaN(n));
        
        for (let num of numbers) {
          if (num > 0 && num <= requests.length) {
            toAccept.push(requests[num - 1]);
          }
        }
      }

      if (toAccept.length === 0) {
        return message.reply("❌ Invalid serial number(s)!");
      }

      let success = [];
      let failed = [];

      for (let req of toAccept) {
        try {
          const form = {
            av: api.getCurrentUserID(),
            fb_api_req_friendly_name: "FriendingCometFriendRequestConfirmMutation",
            doc_id: "3147613905362928",
            variables: JSON.stringify({
              input: {
                source: "friends_tab",
                actor_id: api.getCurrentUserID(),
                client_mutation_id: Math.round(Math.random() * 19).toString(),
                friend_requester_id: req.uid
              }
            })
          };

          await api.httpPost("https://www.facebook.com/api/graphql/", form);
          success.push(req.name);
        } catch (e) {
          failed.push(req.name);
        }
      }

      let resultMsg = "✅ Friend Request Results:\n\n";
      
      if (success.length > 0) {
        resultMsg += `✔️ Accepted (${success.length}):\n`;
        success.forEach((name, i) => resultMsg += `${i + 1}. ${name}\n`);
      }

      if (failed.length > 0) {
        resultMsg += `\n❌ Failed (${failed.length}):\n`;
        failed.forEach((name, i) => resultMsg += `${i + 1}. ${name}\n`);
      }

      message.reply(resultMsg);
      message.unsend(Reply.messageID);

    } catch (error) {
      return message.reply("❌ Error accepting requests: " + error.message);
    }
  }
};