const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const dataPath = path.join(__dirname, 'cache', 'emoji_voice_data.json');

async function loadData() {
  try {
    await fs.ensureFile(dataPath);
    const data = await fs.readFile(dataPath, 'utf8');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

async function saveData(data) {
  await fs.ensureDir(path.dirname(dataPath));
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "emoji_voice",
    aliases: ["emojivoice"],
    version: "11.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Emoji দিলে কিউট মেয়ের ভয়েস পাঠাবে 😍",
    category: "noprefix",
    guide: {
      en: "{pn} on - Enable emoji voice (Admin only)\n{pn} off - Disable emoji voice (Admin only)\nSend emoji: 😘🥰😍🥱😁😌🥺🤭😅😏😞🤫🍼🤔🤦😑😢🙊🤨😡🙈😭😱😻😿💔🤣🥹😩🫣🐸"
    }
  },

  ST: async function({ message, args, event, threadsData, api }) {
    const threadID = event.threadID;
    
    if (args[0] === "on" || args[0] === "off") {
      const threadInfo = await api.getThreadInfo(threadID);
      const isAdmin = threadInfo.adminIDs.some(admin => admin.id === event.senderID);
      
      if (!isAdmin) {
        return message.reply("❌ শুধুমাত্র গ্রুপ অ্যাডমিনরা এটি চালু/বন্ধ করতে পারবেন!");
      }
      
      const data = await loadData();
      
      if (args[0] === "on") {
        data[threadID] = true;
        await saveData(data);
        return message.reply("✅ Emoji Voice সফলভাবে চালু করা হয়েছে! 🎵");
      } else {
        data[threadID] = false;
        await saveData(data);
        return message.reply("❌ Emoji Voice বন্ধ করা হয়েছে! 🔇");
      }
    } else {
      const data = await loadData();
      const status = data[threadID] === true ? "চালু আছে ✅" : "বন্ধ আছে ❌";
      return message.reply(`🎵 Emoji Voice বর্তমান অবস্থা: ${status}\n\nব্যবহার:\n• emoji_voice on - চালু করতে (শুধু অ্যাডমিন)\n• emoji_voice off - বন্ধ করতে (শুধু অ্যাডমিন)`);
    }
  },

  onChat: async function({ api, event, message }) {
    const { threadID, messageID, body } = event;
    
    const data = await loadData();
    if (data[threadID] !== true) return;
    
    if (!body || body.length > 2) return;

    const emojiAudioMap = {
      "🥱": "https://files.catbox.moe/9pou40.mp3",
      "😁": "https://files.catbox.moe/60cwcg.mp3",
      "😌": "https://files.catbox.moe/epqwbx.mp3",
      "🥺": "https://files.catbox.moe/wc17iq.mp3",
      "🤭": "https://files.catbox.moe/cu0mpy.mp3",
      "😅": "https://files.catbox.moe/jl3pzb.mp3",
      "😏": "https://files.catbox.moe/z9e52r.mp3",
      "😞": "https://files.catbox.moe/tdimtx.mp3",
      "🤫": "https://files.catbox.moe/0uii99.mp3",
      "🍼": "https://files.catbox.moe/p6ht91.mp3",
      "🤔": "https://files.catbox.moe/hy6m6w.mp3",
      "🥰": "https://files.catbox.moe/dv9why.mp3",
      "🤦": "https://files.catbox.moe/ivlvoq.mp3",
      "😘": "https://files.catbox.moe/sbws0w.mp3",
      "😑": "https://files.catbox.moe/p78xfw.mp3",
      "😢": "https://files.catbox.moe/shxwj1.mp3",
      "🙊": "https://files.catbox.moe/3bejxv.mp3",
      "🤨": "https://files.catbox.moe/4aci0r.mp3",
      "😡": "https://files.catbox.moe/shxwj1.mp3",
      "🙈": "https://files.catbox.moe/3qc90y.mp3",
      "😍": "https://files.catbox.moe/qjfk1b.mp3",
      "😭": "https://files.catbox.moe/itm4g0.mp3",
      "😱": "https://files.catbox.moe/mu0kka.mp3",
      "😻": "https://files.catbox.moe/y8ul2j.mp3",
      "😿": "https://files.catbox.moe/tqxemm.mp3",
      "💔": "https://files.catbox.moe/6yanv3.mp3",
      "🤣": "https://files.catbox.moe/2sweut.mp3",
      "🥹": "https://files.catbox.moe/jf85xe.mp3",
      "😩": "https://files.catbox.moe/b4m5aj.mp3",
      "🫣": "https://files.catbox.moe/ttb6hi.mp3",
      "🐸": "https://files.catbox.moe/utl83s.mp3"
    };

    const emoji = body.trim();
    const audioUrl = emojiAudioMap[emoji];
    
    if (!audioUrl) return;

    const cacheDir = path.join(__dirname, 'cache');
    await fs.ensureDir(cacheDir);

    const filePath = path.join(cacheDir, `${Date.now()}_${encodeURIComponent(emoji)}.mp3`);

    try {
      const response = await axios({
        method: 'GET',
        url: audioUrl,
        responseType: 'stream',
        timeout: 30000
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await message.reply({
        attachment: fs.createReadStream(filePath)
      });

      await fs.unlink(filePath).catch(err => console.error("Error deleting file:", err));

    } catch (error) {
      console.error("Error downloading audio:", error);
      await message.reply("ইমুজি দিয়ে লাভ নাই\nযাও মুড়ি খাও জান😘");
      
      if (fs.existsSync(filePath)) {
        await fs.unlink(filePath).catch(err => console.error("Error deleting file:", err));
      }
    }
  }
};