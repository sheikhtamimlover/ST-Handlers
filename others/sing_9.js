const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sing",
    aliases: ["song", "music"],
    version: "3.1",
    author: "Neoaz 🐊 + Rana Fix",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Download song" },
    category: "media",
    guide: { en: "{pn} <name> | -l <name>" }
  },

  onStart: async function ({ message, args, event, api, commandName }) {
    if (!args[0]) return message.reply("Song name dao 😒");

    const isList = args[0] === "-l";
    const query = isList ? args.slice(1).join(" ") : args.join(" ");

    if (!query) return message.reply("Song name dao 😒");

    // 🔄 pending reaction animation
    let toggle = true;
    const loadingReact = setInterval(() => {
      api.setMessageReaction(
        toggle ? "⏳" : "⌛",
        event.messageID,
        () => {},
        true
      );
      toggle = !toggle;
    }, 1000);

    try {
      const res = await axios.get(
        `https://neokex-dlapis.vercel.app/api/search?q=${encodeURIComponent(query)}`
      );

      const results = res.data.results;

      if (!results || results.length === 0) {
        clearInterval(loadingReact);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply("Kono song pawa jay nai 😢");
      }

      // ================= LIST MODE =================
      if (isList) {
        const top = results.slice(0, 6);

        let msg = "";
        const attachments = [];
        const cacheDir = path.join(__dirname, "cache");

        await fs.ensureDir(cacheDir);

        for (let i = 0; i < top.length; i++) {
          msg += `${i + 1}. ${top[i].title}\n[${top[i].duration}]\n\n`;

          const imgPath = path.join(
            cacheDir,
            `sing_${Date.now()}_${i}.jpg`
          );

          const img = await axios.get(top[i].thumbnail, {
            responseType: "arraybuffer"
          });

          await fs.writeFile(
            imgPath,
            Buffer.from(img.data)
          );

          attachments.push(
            fs.createReadStream(imgPath)
          );
        }

        message.reply(
          {
            body: msg.trim(),
            attachment: attachments
          },
          (err, info) => {
            global.GoatBot.onReply.set(
              info.messageID,
              {
                commandName,
                author: event.senderID,
                results: top
              }
            );
          }
        );

        clearInterval(loadingReact);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      }

      // ================= DIRECT PLAY =================
      else {
        const selected = results[0];

        const dl = await axios.get(
          `https://neokex-dlapis.vercel.app/api/alldl?url=${encodeURIComponent(selected.url)}`
        );

        const pollUrl =
          dl.data.audio.downloadUrl;

        let streamUrl = null;

        for (let i = 0; i < 60; i++) {
          const check =
            await axios.get(pollUrl);

          if (
            check.data.status ===
            "completed"
          ) {
            streamUrl =
              check.data.viewUrl;
            break;
          }

          await new Promise(r =>
            setTimeout(r, 1000)
          );
        }

        if (!streamUrl)
          throw new Error("Timeout");

        const cacheDir =
          path.join(__dirname, "cache");

        await fs.ensureDir(cacheDir);

        const filePath = path.join(
          cacheDir,
          `${Date.now()}.mp3`
        );

        const file = await axios.get(
          streamUrl,
          {
            responseType:
              "arraybuffer"
          }
        );

        await fs.writeFile(
          filePath,
          Buffer.from(file.data)
        );

        await message.reply({
          body: selected.title,
          attachment:
            fs.createReadStream(
              filePath
            )
        });

        clearInterval(loadingReact);

        api.setMessageReaction(
          "✅",
          event.messageID,
          () => {},
          true
        );

        fs.remove(filePath)
          .catch(() => {});
      }

    } catch (err) {

      clearInterval(loadingReact);

      api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );

      message.reply(
        "Error hoise 😑"
      );
    }
  },

  // ================= REPLY SELECT =================
  onReply: async function ({
    message,
    event,
    Reply,
    api
  }) {

    const choice =
      parseInt(event.body);

    if (
      isNaN(choice) ||
      choice < 1 ||
      choice > Reply.results.length
    ) return;

    // 🔄 pending animation
    let toggle = true;

    const loadingReact =
      setInterval(() => {

        api.setMessageReaction(
          toggle ? "⏳" : "⌛",
          event.messageID,
          () => {},
          true
        );

        toggle = !toggle;

      }, 1000);

    const selected =
      Reply.results[choice - 1];

    try {

      const dl = await axios.get(
        `https://neokex-dlapis.vercel.app/api/alldl?url=${encodeURIComponent(selected.url)}`
      );

      const pollUrl =
        dl.data.audio.downloadUrl;

      let streamUrl = null;

      for (let i = 0; i < 60; i++) {

        const check =
          await axios.get(pollUrl);

        if (
          check.data.status ===
          "completed"
        ) {

          streamUrl =
            check.data.viewUrl;

          break;
        }

        await new Promise(r =>
          setTimeout(r, 1000)
        );
      }

      if (!streamUrl)
        throw new Error(
          "Timeout"
        );

      const cacheDir =
        path.join(
          __dirname,
          "cache"
        );

      await fs.ensureDir(
        cacheDir
      );

      const filePath =
        path.join(
          cacheDir,
          `${Date.now()}.mp3`
        );

      const file =
        await axios.get(
          streamUrl,
          {
            responseType:
              "arraybuffer"
          }
        );

      await fs.writeFile(
        filePath,
        Buffer.from(
          file.data
        )
      );

      await message.reply({
        body:
          selected.title,
        attachment:
          fs.createReadStream(
            filePath
          )
      });

      clearInterval(
        loadingReact
      );

      api.setMessageReaction(
        "✅",
        event.messageID,
        () => {},
        true
      );

      fs.remove(
        filePath
      ).catch(() => {});

    } catch (err) {

      clearInterval(
        loadingReact
      );

      api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );

      message.reply(
        "Download fail 😢"
      );
    }
  }
};