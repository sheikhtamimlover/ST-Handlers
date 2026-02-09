module.exports.config = {
  name: 'listbox',
  aliases: ["boxlist"],
  version: '1.0.0',
  author: 'manhIT',
  role: 2,
  description: '𝗟𝗶𝘀𝘁 𝘁𝗵𝗿𝗲𝗮𝗱 𝗯𝗼𝘁 𝗽𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝘁𝗲𝗱',
  category: '𝗜𝗡𝗙𝗢',
  guide: '{pn}',
  countDown: 2
};


module.exports.onReply = async function({ api, event, args, threadsData, Reply }) {

  if (parseInt(event.senderID) !== parseInt(Reply.author)) return;

  var arg = event.body.split(" ");
  var idgr = Reply.groupid[arg[1] - 1];


  switch (Reply.type) {

    case "reply":
      {
        if (arg[0] == "out") {
          api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr);
          console.log("𝗢𝘂𝘁 𝘁𝗵𝗿𝗲𝗮𝗱 𝘄𝗶𝘁𝗵 𝗶𝗱: " + idgr + "\n" + (await threadsData.getData(idgr)).name);
          break;
        }

      }
  }
};


module.exports.onStart = async function({ api, event, commandName }) {
  var inbox = await api.getThreadList(100, null, ['INBOX']);
  let list = [...inbox].filter(group => group.isSubscribed && group.isGroup);

  var listthread = [];

  //////////


  for (var groupInfo of list) {
    let data = (await api.getThreadInfo(groupInfo.threadID));

    listthread.push({
      id: groupInfo.threadID,
      name: groupInfo.name,
      sotv: data.userInfo.length,
    });

  } //for

  var listbox = listthread.sort((a, b) => {
    if (a.sotv > b.sotv) return -1;
    if (a.sotv < b.sotv) return 1;
  });

  let msg = '',
    i = 1;
  var groupid = [];
  for (var group of listbox) {
    msg += `${i++}. ${group.name}\n🧩𝗧𝗜𝗗: ${group.id}\n🍂𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${group.sotv}\n\n`;
    groupid.push(group.id);
  }

  api.sendMessage(msg, event.threadID, (e, data) =>
    global.GoatBot.onReply.set({
      name: this.config.name,
      author: event.senderID,
      messageID: data.messageID,
      groupid,
      type: 'reply'
    })
  );
};
