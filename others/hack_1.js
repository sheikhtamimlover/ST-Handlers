const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

// ====== নাম সুন্দর করে ভাঙার জন্য (অরিজিনাল ফাংশন) ======
async function wrapText(ctx, text, maxWidth) {
  return new Promise((resolve) => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    if (ctx.measureText("W").width > maxWidth) return resolve(null);

    const words = text.split(" ");
    const lines = [];
    let line = "";

    while (words.length > 0) {
      let split = false;

      // যদি একেকটা শব্দ অনেক বড় হয়, সেটাকেও ভেঙে নিচ্ছে
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) {
          words[1] = `${temp.slice(-1)}${words[1]}`;
        } else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }

      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
        line += `${words.shift()} `;
      } else {
        lines.push(line.trim());
        line = "";
      }

      if (words.length === 0) lines.push(line.trim());
    }

    return resolve(lines);
  });
}

module.exports = {
  config: {
    name: "hack",
    author: "Shanto",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Fake FB hacking prank card",
      bn: "ফেক ফেসবুক হ্যাক প্র্যাঙ্ক কার্ড"
    },
    longDescription: {
      en: "Generate a fake FB hacking card with terminal style for prank only.",
      bn: "কারো প্রোফাইল পিক আর নাম দিয়ে টার্মিনাল স্টাইল ফেক হ্যাক কার্ড বানাও (শুধু প্র্যাঙ্কের জন্য)।"
    },
    guide: {
      en: [
        "{pn}              → hack yourself",
        "{pn} @tag         → hack tagged user",
        "{pn} (reply)      → hack replied user"
      ].join("\n"),
      bn: [
        "{pn}              → নিজের উপর প্র্যাঙ্ক হ্যাক কার্ড",
        "{pn} @tag         → ট্যাগ করা আইডির উপর হ্যাক কার্ড",
        "{pn} রিপ্লাই সহ   → যার মেসেজে রিপ্লাই দিছো, তার হ্যাক কার্ড"
      ].join("\n")
    }
  },

  onStart: async function ({ api, event }) {
    try {
      // ====== টার্গেট আইডি ঠিক করা (uid কমান্ডের মত স্ট্রিক্ট) ======
      let targetID;
      const { mentions, messageReply, senderID } = event;

      if (mentions && Object.keys(mentions).length > 0) {
        // প্রথম mention করা আইডি
        const mentionIDs = Object.keys(mentions);
        targetID = mentionIDs[0];
      } else if (messageReply && messageReply.senderID) {
        // রিপ্লাই করা হলে
        targetID = messageReply.senderID;
      } else {
        // না থাকলে নিজেই
        targetID = senderID;
      }

      // ====== ইউজার ইনফো ======
      const info = await api.getUserInfo(targetID);
      const name = info[targetID]?.name || "Target User";

      // ====== path সেটআপ ======
      const dirTmp = __dirname + "/tmp";
      if (!fs.existsSync(dirTmp)) {
        fs.mkdirSync(dirTmp, { recursive: true });
      }
      const pathBg = dirTmp + "/hack_bg_v2.png";
      const pathAvt = dirTmp + "/hack_avt_v2.png";

      // ====== ব্যাকগ্রাউন্ড ডাউনলোড (আগের মত আলাদা হ্যাকিং bg) ======
      const bgUrl = "https://files.catbox.moe/ibmk54.jpg"; // তোমার পছন্দের অরিজিনাল BG
      const bgBuffer = (
        await axios.get(bgUrl, {
          responseType: "arraybuffer",
        })
      ).data;
      fs.writeFileSync(pathBg, Buffer.from(bgBuffer, "utf-8"));

      // ====== প্রোফাইল পিকচার (অরিজিনাল স্টাইল) ======
      const avtBuffer = (
        await axios.get(
          `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(pathAvt, Buffer.from(avtBuffer, "utf-8"));

      // ====== ক্যানভাস শুরু ======
      const baseImage = await loadImage(pathBg);
      const baseAvt = await loadImage(pathAvt);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      // BG বসানো (অরিজিনাল ইমেজ)
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // নাম লেখার আগে ফন্ট সেট
      ctx.font = "400 23px Arial";
      ctx.fillStyle = "#1878F3";

      // নাম সুন্দর করে ভাঙা (wrap)
      const lines = await wrapText(ctx, name, 1160);
      ctx.fillText(lines.join("\n"), 146, 451);

      // প্রোফাইল পিকচার বসানো (অরিজিনাল পজিশন)
      ctx.drawImage(baseAvt, 55, 410, 70, 70);

      // ফাইনাল ইমেজ সেভ
      const outBuffer = canvas.toBuffer();
      fs.writeFileSync(pathBg, outBuffer);
      fs.removeSync(pathAvt);

      // ====== টেক্সট মেসেজ (প্র্যাঙ্ক + ভয় + warning) ======
      const bodyText =
`[ SYSTEM_ROOT@SHANTO_SERVER ]# initializing exploit...
[>] Target locked: ${name}
[>] ID captured : ${targetID}

⚠️ সিকিউরিটি অ্যালার্ট:
• ডিভাইস ইনফো ট্রেস করা হয়েছে
• সেশন টোকেন বাইপাসড
• প্রাইভেট ডাটা স্ক্যানিং চলছে...

📡 টার্গেট এখন পুরোপুরি আমাদের কন্ট্রোলে আছে।
💀 পার্সোনাল মেসেজ, গ্যালারি, গোপন চ্যাট—সব কিছু লগ হচ্ছে...

❗ নোট: এটা শুধু ফেইসবুক হ্যাক প্র্যাঙ্ক, সিরিয়াস নিও না ❤️
Made by Shanto`;

      return api.sendMessage(
        {
          body: bodyText,
          attachment: fs.createReadStream(pathBg),
        },
        event.threadID,
        () => {
          try {
            fs.unlinkSync(pathBg);
          } catch (e) {}
        },
        event.messageID
      );
    } catch (e) {
      console.error(e);
      return api.sendMessage(
        "⚠ SYSTEM ERROR: Target firewall একটু জোরে ধরে ফেলেছে। কিছুক্ষণ পরে আবার চেষ্টা করো 😈",
        event.threadID,
        event.messageID
      );
    }
  },
};