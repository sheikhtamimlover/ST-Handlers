const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");

// ---- text wrap helper ----
async function wrapText(ctx, text, maxWidth) {
  return new Promise((resolve) => {
    if (ctx.measureText(text).width < maxWidth)
      return resolve([text]);
    if (ctx.measureText("W").width > maxWidth)
      return resolve(null);

    const words = text.split(" ");
    const lines = [];
    let line = "";

    while (words.length > 0) {
      let split = false;

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
    version: "1.2.0",
    author: "Shanto",
    countDown: 5,
    role: 0,
    category: "fun",
    shortDescription: {
      en: "Fake ‘hacking’ image with profile picture",
      bn: "প্রোফাইল ছবি দিয়ে ফানি হ্যাকিং স্টাইল ছবি বানায়"
    },
    longDescription: {
      en: "Generate a fun hacking-style image using the target's Facebook avatar.",
      bn: "যাকে mention করবে, reply করবে বা uid দেবে (কিছু না দিলে নিজের), তার প্রোফাইল ছবি দিয়ে ফানি হ্যাকিং স্টাইলের ছবি বানাবে (স্রেফ মজা, রিয়াল হ্যাক না)।"
    },
    guide: {
      en: [
        "{pn}              → hack yourself",
        "{pn} @tag         → hack mentioned user",
        "{pn} reply + {pn} → hack replied user",
        "{pn} 1000xxxxxxx  → hack by uid"
      ].join("\n"),
      bn: [
        "{pn}              → নিজের আইডি-কে হ্যাকিং স্টাইলে দেখাবে",
        "{pn} @tag         → যাকে ট্যাগ করবে, তার আইডি-কে হ্যাকিং স্টাইলে দেখাবে",
        "{pn} reply + {pn} → যার মেসেজে reply করবে, তাকে target করবে",
        "{pn} 1000xxxxxxx  → uid দিয়ে target করবে"
      ].join("\n")
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      // নিশ্চিত করো tmp ফোল্ডার আছে
      const tmpDir = __dirname + "/tmp";
      fs.ensureDirSync(tmpDir);

      const pathImg = tmpDir + "/background.png";
      const pathAvt1 = tmpDir + "/Avtmot.png";

      // ---- target নির্বাচন ----
      let targetID;

      // 1) reply করা থাকলে → reply sender
      if (event.type === "message_reply" && event.messageReply?.senderID) {
        targetID = event.messageReply.senderID;
      }
      // 2) mention থাকলে → প্রথম mention
      else if (event.mentions && Object.keys(event.mentions).length > 0) {
        const mentionIDs = Object.keys(event.mentions);
        targetID = mentionIDs[0];
      }
      // 3) args[0] যদি numeric uid হয়
      else if (args && args[0] && /^\d+$/.test(args[0])) {
        targetID = args[0];
      }
      // 4) ডিফল্ট: নিজে
      else {
        targetID = event.senderID;
      }

      const userInfo = await api.getUserInfo(targetID);
      const name = userInfo?.[targetID]?.name || "Unknown User";

      // background list (ইচ্ছা করলে আরও লিংক যোগ করতে পারো)
      const backgrounds = [
        "https://files.catbox.moe/ibmk54.jpg"
      ];
      const rd = backgrounds[Math.floor(Math.random() * backgrounds.length)];

      // ─ Avatar ডাউনলোড ─
      const avtRes = await axios.get(
        `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(pathAvt1, Buffer.from(avtRes.data, "utf-8"));

      // ─ Background ডাউনলোড ─
      const bgRes = await axios.get(rd, { responseType: "arraybuffer" });
      fs.writeFileSync(pathImg, Buffer.from(bgRes.data, "utf-8"));

      // ─ Canvas কাজ ─
      const baseImage = await loadImage(pathImg);
      const baseAvt1 = await loadImage(pathAvt1);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      // ব্যাকগ্রাউন্ড বসাও
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // নাম লিখা
      ctx.font = "400 23px Arial";
      ctx.fillStyle = "#00FF99";
      ctx.textBaseline = "top";

      const lines = await wrapText(ctx, name, 1160);
      const textX = 146;
      let textY = 451;

      if (lines && lines.length) {
        for (const line of lines) {
          ctx.fillText(line, textX, textY);
          textY += 26; // লাইন হাইট
        }
      } else {
        ctx.fillText(name, textX, textY);
      }

      // প্রোফাইল ছবি
      ctx.save();
      ctx.drawImage(baseAvt1, 55, 410, 70, 70);
      ctx.restore();

      const imageBuffer = canvas.toBuffer("image/png");
      fs.writeFileSync(pathImg, imageBuffer);
      fs.removeSync(pathAvt1);

      // ─ ফাইনাল মেসেজ ─
      const bodyText =
        "✅ 𝙁𝙖𝙠𝙚 𝙃𝙖𝙘𝙠 𝘾𝙤𝙢𝙥𝙡𝙚𝙩𝙚𝙙!\n" +
        `👤 Target: ${name}\n\n` +
        "😆 চিন্তা কইরো না, এটা শুধু মজা করার জন্য তৈরি ফানি কমান্ড।\n" +
        "💚 কোনো সিরিয়াস হ্যাক না, স্রেফ SHANTO BOT-এর ফান ফিচার।";

      return api.sendMessage(
        {
          body: bodyText,
          attachment: fs.createReadStream(pathImg)
        },
        event.threadID,
        () => {
          try { fs.unlinkSync(pathImg); } catch (e) {}
        },
        event.messageID
      );
    } catch (error) {
      console.error(error);
      return api.sendMessage(
        "❌ Error generating hack image! পরে আবার ট্রাই করো।",
        event.threadID,
        event.messageID
      );
    }
  }
};