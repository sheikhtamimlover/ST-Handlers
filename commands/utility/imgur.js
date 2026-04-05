const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const UPLOAD_API = "https://uploadimgur.com/api/upload";
const CACHE_DIR = path.join(__dirname, "cache");

function getAttachmentUrl(attachment = {}) {
  return (
    attachment.url ||
    attachment.largePreviewUrl ||
    attachment.previewUrl ||
    attachment.playableUrl ||
    attachment.playable_url ||
    attachment.href ||
    null
  );
}

function sanitizeFileName(name = "file") {
  const cleaned = String(name)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
    .replace(/\s+/g, "_")
    .trim();

  return cleaned || "file";
}

function getExtFromUrl(url) {
  try {
    const parsed = new URL(url);
    return path.extname(parsed.pathname || "");
  } catch {
    return "";
  }
}

function getExtension(attachment = {}) {
  const originalName = attachment.filename || attachment.name;
  if (originalName) {
    const ext = path.extname(originalName);
    if (ext) return ext;
  }

  const sourceUrl = getAttachmentUrl(attachment);
  if (sourceUrl) {
    const urlExt = getExtFromUrl(sourceUrl);
    if (urlExt) return urlExt;
  }

  const type = String(attachment.type || "").toLowerCase();
  const extMap = {
    photo: ".jpg",
    image: ".jpg",
    animated_image: ".gif",
    video: ".mp4",
    audio: ".mp3",
    sticker: ".png",
    file: ".bin"
  };

  return extMap[type] || ".bin";
}

function guessMimeType(attachment = {}, ext = "") {
  const existing = attachment.mimeType || attachment.mimetype;
  if (existing) return existing;

  const mimeByExt = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".mkv": "video/x-matroska",
    ".avi": "video/x-msvideo",
    ".webm": "video/webm",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".aac": "audio/aac",
    ".pdf": "application/pdf",
    ".zip": "application/zip",
    ".rar": "application/vnd.rar",
    ".7z": "application/x-7z-compressed",
    ".txt": "text/plain",
    ".json": "application/json"
  };

  const lowerExt = String(ext || "").toLowerCase();
  if (mimeByExt[lowerExt]) return mimeByExt[lowerExt];

  const type = String(attachment.type || "").toLowerCase();
  if (type === "photo" || type === "image" || type === "sticker") return "image/jpeg";
  if (type === "animated_image") return "image/gif";
  if (type === "video") return "video/mp4";
  if (type === "audio") return "audio/mpeg";

  return "application/octet-stream";
}

async function ensureCacheDir() {
  await fs.promises.mkdir(CACHE_DIR, { recursive: true });
}

async function downloadFile(url, savePath) {
  const response = await axios.get(url, {
    responseType: "stream",
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(savePath);
    response.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

async function uploadFile(filePath, fileName, contentType) {
  const form = new FormData();

  form.append("image", fs.createReadStream(filePath), {
    filename: fileName,
    contentType
  });

  const response = await axios.post(UPLOAD_API, form, {
    headers: {
      ...form.getHeaders(),
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      origin: "https://uploadimgur.com",
      referer: "https://uploadimgur.com/"
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  });

  const link = response?.data?.link;
  if (!link) {
    throw new Error("No link returned from upload API");
  }

  return link;
}

async function safeUnlink(filePath) {
  try {
    await fs.promises.unlink(filePath);
  } catch {}
}

function formatError(error) {
  if (typeof error?.response?.data === "string") return error.response.data;
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Unknown error"
  );
}

module.exports = {
  config: {
    name: "imgur",
    version: "1.0",
    author: "Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: {
      en: "Upload replied attachments to uploadimgur and return direct URLs"
    },
    category: "utility",
    guide: {
      en: "{pn} (reply to a message with attachment(s))\n{pn} (send with attachment(s) directly)"
    }
  },

  ST: async function ({ message, event }) {
    const attachments =
      event.messageReply?.attachments?.length
        ? event.messageReply.attachments
        : event.attachments?.length
          ? event.attachments
          : [];

    if (!attachments.length) {
      return message.reply(
        "❌ Reply to a message with attachment(s) or send the command with attachment(s) directly.\n\nSupported: image, video, audio, file, sticker, gif."
      );
    }

    await ensureCacheDir();

    const successList = [];
    const failList = [];

    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i];
      const sourceUrl = getAttachmentUrl(attachment);

      if (!sourceUrl) {
        failList.push({
          index: i + 1,
          type: attachment.type || "unknown",
          reason: "No downloadable URL found"
        });
        continue;
      }

      const ext = getExtension(attachment);
      const rawName = attachment.filename || attachment.name || `${attachment.type || "file"}_${i + 1}${ext}`;
      const safeName = sanitizeFileName(rawName);
      const fileName = path.extname(safeName) ? safeName : `${safeName}${ext}`;

      const tempPath = path.join(
        CACHE_DIR,
        `iu_${event.threadID || "thread"}_${event.senderID || "user"}_${Date.now()}_${i}${ext}`
      );

      try {
        await downloadFile(sourceUrl, tempPath);
        const link = await uploadFile(tempPath, fileName, guessMimeType(attachment, ext));

        successList.push({
          index: i + 1,
          type: attachment.type || "attachment",
          link
        });
      } catch (error) {
        failList.push({
          index: i + 1,
          type: attachment.type || "unknown",
          reason: formatError(error)
        });
      } finally {
        await safeUnlink(tempPath);
      }
    }

    if (!successList.length) {
      const failText = failList
        .map(item => `${item.index}. [${item.type}] ${item.reason}`)
        .join("\n");

      return message.reply(`❌ Failed to upload all attachment(s).\n\n${failText}`);
    }

    let body = `✅ Uploaded ${successList.length}/${attachments.length} attachment(s):\n\n`;
    body += successList.map(item => `${item.index}. ${item.link}`).join("\n");

    if (failList.length) {
      body += `\n\n⚠️ Failed ${failList.length} attachment(s):\n`;
      body += failList.map(item => `${item.index}. [${item.type}] ${item.reason}`).join("\n");
    }

    return message.reply(body);
  }
};