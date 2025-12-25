const axios = require("axios");
const fs = require("fs");
const path = require("path");

const a = {
  y: /(youtube\.com|youtu\.be)/i,
  i: /(instagram\.com|instagr\.am)/i,
  t: /(tiktok\.com|vm\.tiktok\.com)/i,
  c: /(capcut\.com)/i,
  f: /(facebook\.com|fb\.watch)/i,
  x: /(twitter\.com|x\.com)/i,
  d: /(dailymotion\.com|dai\.ly)/i,
  v: /(vimeo\.com)/i,
  p: /(pinterest\.com|pin\.it)/i,
  m: /(imgur\.com)/i,
  s: /(soundcloud\.com|on\.soundcloud\.com)/i,
  o: /(spotify\.com|spotify\.link)/i,
  e: /(ted\.com)/i,
  u: /(tumblr\.com)/i
};

function b(q) {
  return Object.values(a).some(r => r.test(q));
}

async function c(q, api, t, m) {
  api.setMessageReaction("⏳", m, () => {}, true);

  const d = a.o.test(q); 
  const e = a.y.test(q); 

  if (!b(q)) {
    api.setMessageReaction("❌", m, () => {}, true);
    return;
  }

  let h;
  try {
    const g = `https://downvid.onrender.com/api/download?url=${encodeURIComponent(q)}`;
    h = await axios.get(g, { timeout: 60000 });
  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", m, () => {}, true);
    api.sendMessage("❌ Download failed (connection error).", t, m);
    return;
  }

  const i2 = h.data;

  if (!i2 || i2.status !== "success") {
    api.setMessageReaction("❌", m, () => {}, true);
    api.sendMessage("❌ Download failed (API error).", t, m);
    return;
  }

  const j = i2?.data?.data || {};
  const k = i2.video || j.nowm || null;
  const l = i2.audio || null;

  let n = [];
  let o2 = "";

  if (d) {
    if (!l) {
      api.setMessageReaction("❌", m, () => {}, true);
      api.sendMessage("❌ No audio for Spotify link.", t, m);
      return;
    }
    n.push({ u: l, t: "a" });
    o2 = "✅ Spotify Audio 🎧\n\n";
  }
  else if (e) {
    if (k) n.push({ u: k, t: "v" });
    if (l) n.push({ u: l, t: "a" });
    if (!n.length) {
      api.setMessageReaction("❌", m, () => {}, true);
      api.sendMessage("❌ No media for YouTube link.", t, m);
      return;
    }
    o2 = n.length === 2
      ? "✅ YouTube Video + Audio 🎬🎧\n\n"
      : (n[0].t === "v" ? "✅ YouTube Video 🎬\n\n" : "✅ YouTube Audio 🎧\n\n");
  }
  else {
    if (!k) {
      api.setMessageReaction("❌", m, () => {}, true);
      api.sendMessage("❌ No video found for this link.", t, m);
      return;
    }
    n.push({ u: k, t: "v" });
    o2 = "✅ Video Downloaded 🎬\n\n";
  }

  const p2 = j.title || j.shortTitle || "Downloaded Media";
  const q2 = j.like ?? "N/A";
  const r2 = j.comment ?? "N/A";

  let s2 = o2;
  s2 += `📌 ${p2}\n`;
  s2 += `👍 ${q2}   💬 ${r2}\n\n`;
  s2 += `🔗 ${q}`;

  const t2 = path.join(__dirname, "cache");
  if (!fs.existsSync(t2)) fs.mkdirSync(t2, { recursive: true });

  const u2 = [];
  const v2 = [];

  try {
    for (const w of n) {
      let x = w.t === "a" ? "mp3" : "mp4";
      const y = w.u.split("?")[0].split(".").pop();
      if (y && y.length <= 4) x = y;

      const z = path.join(
        t2,
        `autodl_${Date.now()}_${Math.random().toString(36).slice(2)}.${x}`
      );
      const A = await axios.get(w.u, { responseType: "arraybuffer", timeout: 120000 });
      fs.writeFileSync(z, A.data);
      u2.push(fs.createReadStream(z));
      v2.push(z);
    }

    api.sendMessage(
      { body: s2, attachment: u2 },
      t,
      () => {
        v2.forEach(B => { try { fs.unlinkSync(B); } catch (_) {} });
      },
      m
    );

    api.setMessageReaction("✅", m, () => {}, true);
  } catch (err) {
    console.error(err);
    v2.forEach(B => { try { fs.unlinkSync(B); } catch (_) {} });
    api.setMessageReaction("❌", m, () => {}, true);
    api.sendMessage("❌ Error while downloading or sending file(s).", t, m);
  }
}

module.exports = {
  config: {
    name: "autodl",
    aliases: ["dl", "auto"],
    version: "3.2",
    author: "Aryan Chauhan",
    category: "media",
    description: "Auto downloader (YouTube video+audio, Spotify audio, others video)",
    guide: "{pn} <url> OR just send link"
  },

  onStart: async function a2({ api, event, args }) {
    const t = event.threadID;
    const m = event.messageID;

    if (!args[0]) {
      api.setMessageReaction("❌", m, () => {}, true);
      return api.sendMessage("❌ Provide a link.", t, m);
    }

    const k = args.join(" ").match(/https?:\/\/\S+/i);
    if (!k) {
      api.setMessageReaction("❌", m, () => {}, true);
      return api.sendMessage("❌ Invalid URL.", t, m);
    }

    await c(k[0], api, t, m);
  },

  onChat: async function b2({ api, event }) {
    const t = event.threadID;
    const m = event.messageID;
    const q = event.body;

    if (!q) return;

    const k = q.match(/https?:\/\/\S+/i);
    if (!k) return;

    await c(k[0], api, t, m);
  }
};
