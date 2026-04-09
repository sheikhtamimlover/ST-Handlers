const axios = require('axios');

const getAPIBase = async () => {
  const base = await axios.get(
    'https://gitlab.com/Rakib-Adil-69/shizuoka-command-store/-/raw/main/apiUrls.json'
  );
  return base.data.rakib;
};

const autoReplies = [
  'vag vai bukachuda eshe geche 🏃‍♂️🏃‍♀️',
  'হুম জান বলো 😚',
  'eto baby boilo na lojja lage🙈',
  'কি হইছে বলো তাড়াতাড়ি😒',
  'জান বাল ফালাবা?🙂',
  'জাবলো..',
  'আমি ন পাট খেতে যাবা?🙂',
  'message my owner m.me/RAKIB.404X 🙂',
  'কি বলবি বল?😒',
  'হুম, কি তোর চাকর নাকি?😒',
  'তোর জন্য একটা গল্প আছে!',
  'kicche eto dakos kn..😾?',
  '😍😘'
];

const autoEmojis = ['👀', '🫶', '🫦', '😍', '😘', '🥵', '👽', '😻', '😽', '💗', '🤡', '😾', '🙈', '💅', '🐸', '🐰'];
const keywords = ['bby', 'baby', 'bot', 'robot', 'বট', 'বেবি', 'shizuoka', 'bbe'];

const sendMessage = (api, threadID, message, messageID) =>
  api.sendMessage(message, threadID, () => {}, messageID);

const cError = (api, threadID, messageID) =>
  sendMessage(api, threadID, 'API Error! Please try again later..', messageID);

const userName = async (api, uid) => {
  try {
    const info = await api.getUserInfo(uid);
    if (!info) return 'Bolod';
    return (
      (info[uid] && info[uid].name) || Object.values(info)[0]?.name || 'Vondo'
    );
  } catch (error) {
    return 'Bokacda';
  }
};

const startsWithEmojis = (text = '') => /^[\p{Emoji}\p{P}]/gu.test(text || '');

const chatWithBot = async (api, threadID, messageID, senderID, input) => {
  try {
    const reply = autoReplies[Math.floor(Math.random() * autoReplies.length)];

    if (!input || input.trim().length === 0) {
      return sendMessage(api, threadID, reply, messageID);
    }

    const rakib = `${await getAPIBase()}/rakib`;
    const res = await axios.get(
      `${rakib}/chat?text=${encodeURIComponent(input)}`
    );

    const teached = res.data?.message;

    if (teached) {
      api.sendMessage(
        teached,
        threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: 'shizuoka',
            type: 'reply',
            author: senderID
          });
        },
        messageID
      );
    } else {
      const emoji = autoEmojis[Math.floor(Math.random() * autoEmojis.length)];

      api.setMessageReaction(emoji, messageID, () => {}, true);

      api.sendMessage(
        reply,
        threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: 'shizuoka',
            type: 'reply',
            author: senderID
          });
        },
        messageID
      );
    }
  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const teachBot = async (api, threadID, messageID, senderID, teach) => {
  const parts = teach.split(' - ');
  if (parts.length < 2) {
    return sendMessage(
      api,
      threadID,
      '❌ Wrong Format!\n\nCorrect Format: teach <ask> - <answer1>, <answer2>\n\nExample: teach hello - hi, hey, hello there',
      messageID
    );
  }

  const ask = parts[0].trim();
  const answers = parts.slice(1).join(' - ').trim();

  if (!ask || !answers) {
    return sendMessage(
      api,
      threadID,
      '❌ Wrong Format!\n\nCorrect Format: teach <ask> - <answer1>, <answer2>\n\nExample: teach hello - hi, hey, hello there',
      messageID
    );
  }

  const answerArray = answers
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);

  if (answerArray.length === 0) {
    return sendMessage(
      api,
      threadID,
      '❌ Please provide at least one answer!\n\nExample: teach hello - hi, hey',
      messageID
    );
  }

  const an = answerArray.join(', ');
  try {
    const rakib = `${await getAPIBase()}/rakib`;
    const res = await axios.post(`${rakib}/teach`, {
      ask,
      answers: an,
      uid: senderID
    });
    return sendMessage(
      api,
      threadID,
      `✅ Taught successfully!\n\n❓ Ask: "${ask}"\n💬 Answers: "${an}"`,
      messageID
    );
  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const showAllTeach = async (api, threadID, messageID) => {
  try {
    const rakib = `${await getAPIBase()}/rakib`;
    const res = await axios.get(`${rakib}/allteach`);
    if (!res.data)
      return sendMessage(
        api,
        threadID,
        "Couldn't fetch total teachings.. fk",
        messageID
      );
    const { totalTeachCount, totalQsn } = res.data;
    const msg = `📊 Total Teaching Stats:\n\n📝 Questions: ${totalQsn}\n📚 Teachings: ${totalTeachCount}`;
    return sendMessage(api, threadID, msg, messageID);
  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

const showTeachers = async (api, threadID, messageID, senderID) => {
  try {
    const rakib = `${await getAPIBase()}/rakib`;
    const res = await axios.get(`${rakib}/teacher`);
    if (
      !res.data?.teachers ||
      !Array.isArray(res.data.teachers) ||
      res.data.teachers.length === 0
    )
      return sendMessage(
        api,
        threadID,
        'No teachers found, teach de mogar dol..',
        messageID
      );

    let list = [];
    for (const [i, t] of res.data.teachers.entries()) {
      const uid = t._id;
      const teachCount = t.teaches || 0;
      const name = await userName(api, uid).catch(() => 'Achuda..');
      list.push(`${i + 1}. ${name} -> ${teachCount} teaches..`);
    }
    return sendMessage(
      api,
      threadID,
      `👨‍🏫 Bot Teachers: \n ______________ \n ${list.join('\n')}`,
      messageID
    );
  } catch (error) {
    console.log(error);
    return cError(api, threadID, messageID);
  }
};

module.exports = {
  config: {
    name: 'shizuoka',
    aliases: ['bby', 'baby'],
    version: '1.0.9',
    author: 'Rakib Adil',
    countDown: 5,
    role: 0,
    usePrefix: false,
    premium: false,
    description: {
      en: 'Smart chatbot, better than all simsimi yk. teach, edit, delete, find and see your stats.'
    },
    category: 'chat',
    guide: {
      en: 'Teach: bot teach <ask> - <answer1>,<answer2>   Edit: bot editmsg <ask> - <oldAns> / <newAns>   Delete: bot dltmsg <ask>   Search: bot msg <ask>   All Messages: bot allmsg   All Teachers: bot teachers   Total Teach Stats: bot allteach   My Stats: bot mystats'
    }
  },

  langs: {
    en: {
      teachMe: 'Please teach me this sentence! 🦆💨'
    }
  },

  onStart: async function ({ api, args, event, getLang, usersData }) {
    const { threadID, messageID, senderID } = event;
    const input = args.join(' ').trim();
    const inputLower = input.toLowerCase();
    const commandMatch = inputLower.match(/^(teach|allteach|teachers|mystats)/);
    
    const rakib = `${await getAPIBase()}/rakib`;

    try {
      if (commandMatch) {
        const command = commandMatch[1];
        const rest = input.slice(command.length).trim();
        
        switch (command) {
          case 'teach':
            return teachBot(api, threadID, messageID, senderID, rest);
          case 'allteach':
            return showAllTeach(api, threadID, messageID);
          case 'teachers':
            return showTeachers(api, threadID, messageID);
          case 'mystats': {
            try {
              const res = await axios.get(`${rakib}/mystats?uid=${senderID}`);
              return sendMessage(
                api,
                threadID,
                `📊 Your Stats:\n _____________\n🧠 Teachings: ${
                  res.data?.yourTeachings || 0
                }`,
                messageID
              );
            } catch (error) {
              console.log(error);
              cError(api, threadID, messageID);
            }
          }
        }
      } else {
        return chatWithBot(
          api,
          threadID,
          messageID,
          senderID,
          input
        );
      }
    } catch (error) {
      console.log(error);
      cError(api, threadID, messageID);
    }
  },

  onChat: async function ({ api, message, event, getLang }) {
      const body = (
        event.body ||
        event.messageReply?.body ||
        ''
      ).toString();
      if (!body) return;
      if (startsWithEmojis(body)) return;
      const input = body.toLowerCase().trim();
      if (!input) return;

      const matchedKeyword = keywords.find((k) => input === k || input.startsWith(k + ' '));
      if (matchedKeyword) {
        const query = input.startsWith(matchedKeyword + ' ') ? input.slice(matchedKeyword.length).trim() : '';
        if (query) {
          try {
            const rakib = `${await getAPIBase()}/rakib`;
            const ckShort = await axios.get(`${rakib}/chat?text=${encodeURIComponent(query)}`);
            if (ckShort.data?.message) {
              const msg = ckShort.data.message;
              return api.sendMessage(
                msg,
                event.threadID,
                (err, info) => {
                  global.GoatBot.onReply.set(info.messageID, {
                    commandName: 'shizuoka',
                    type: 'reply',
                    author: event.senderID
                  });
                },
                event.messageID
              );
            }

            return sendMessage(
              api,
              event.threadID,
              getLang('teachMe'),
              event.messageID
            );
          } catch (error) {
            console.log(error);
            return chatWithBot(api, event.threadID, event.messageID, event.senderID, query);
          }
        } else {
          return chatWithBot(api, event.threadID, event.messageID, event.senderID, matchedKeyword);
        }
      }
  },

  onReply: async function ({ api, event, Reply }) {
    try {
      const { senderID, threadID, messageID } = event;
      if (!Reply || Reply.commandName !== 'shizuoka') return;

      if (Reply.type === 'reply') {
        const userMsg = (event.body || '').toString().trim();
        if (!userMsg) return;
        return chatWithBot(api, threadID, messageID, senderID, userMsg);
      }
    } catch (error) {
      console.log(error);
      return cError(api, event.threadID, event.messageID);
    }
  }
};