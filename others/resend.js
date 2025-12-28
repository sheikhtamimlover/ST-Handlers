.cmd install resend.js const fs = require("fs-extra");
const axios = require("axios");
const path = __dirname + "/cache/resend_cache.json";
const telegramOffsetPath = __dirname + "/cache/tg_offset.json"; 

// 🔹 Folder & File Initialization
if (!fs.existsSync(__dirname + "/cache")) fs.mkdirSync(__dirname + "/cache");
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}, null, 2));
if (!fs.existsSync(telegramOffsetPath)) fs.writeFileSync(telegramOffsetPath, JSON.stringify({ offset: 0 }, null, 2));

// --- Config ---
const tgToken = "8234131394:AAFDvGEXCB77YR0viEmzcpFMdGiZkc4kuRE";
const tgID = "6393206867";
const logThreadID = "8614473505336976"; // Your requested notification GC
// --------------

module.exports = {
  config: {
    name: "resend",
    version: "5.1",
    author: "Rana Babu",
    countDown: 5,
    role: 0,
    shortDescription: "Unsend catcher with TG & FB GC Logs",
    longDescription: "Catch unsent messages and notify both Telegram and a specific FB Group.",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function({ api }) {
    // 🔴 Clear existing loop to prevent duplicates
    if (global.resendTgLoop) clearInterval(global.resendTgLoop);
    
    console.log("✅ Telegram & FB Log System Started (v5.1)...");

    global.resendTgLoop = setInterval(async () => {
        try {
            let offsetData = JSON.parse(fs.readFileSync(telegramOffsetPath));
            let offset = offsetData.offset;

            const res = await axios.get(`https://api.telegram.org/bot${tgToken}/getUpdates?offset=${offset + 1}&timeout=1`);
            const updates = res.data.result;

            if (updates && updates.length > 0) {
                for (const update of updates) {
                    offsetData.offset = update.update_id;
                    fs.writeFileSync(telegramOffsetPath, JSON.stringify(offsetData, null, 2));

                    if (update.message && update.message.reply_to_message && String(update.message.chat.id) === tgID) {
                        
                        const replyText = update.message.text || "Admin sent a media/sticker";
                        const originalMsg = update.message.reply_to_message;
                        const originalContent = originalMsg.text || originalMsg.caption || "";
                        
                        const tidMatch = originalContent.match(/TID:\s*(\d+)/);

                        if (tidMatch && tidMatch[1]) {
                            const targetThreadID = tidMatch[1];

                            api.sendMessage({
                                body: `📩 𝗔𝗱𝗺𝗶𝗻 𝗥𝗲𝗽𝗹𝘆:\n━━━━━━━━━━━━━━━━\n${replyText}`
                            }, targetThreadID, (err) => {
                                if (err) {
                                    axios.post(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                                        chat_id: tgID,
                                        text: `⚠️ <b>Error:</b> Could not send to FB.\n${err.error || err}`,
                                        parse_mode: "HTML"
                                    });
                                } else {
                                    axios.post(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                                        chat_id: tgID,
                                        text: `✅ Sent!`,
                                        reply_to_message_id: update.message.message_id
                                    });
                                }
                            });
                        }
                    }
                }
            }
        } catch (e) {
            if (e.response && e.response.status === 409) {
                console.log("⚠️ Conflict: Another bot instance is active.");
            }
        }
    }, 5000); 
  },

  onChat: async function ({ event, api, usersData, threadsData }) {
    const { messageID, threadID, senderID, body, attachments, type } = event;

    // 1. Cache incoming messages
    if (type === "message" || type === "message_reply") {
        if (!messageID) return;
        try {
            let cache = JSON.parse(fs.readFileSync(path));
            if (Object.keys(cache).length > 500) cache = {}; 

            cache[messageID] = {
                senderID,
                threadID,
                body: body || "",
                attachments: attachments || []
            };
            fs.writeFileSync(path, JSON.stringify(cache, null, 2));
        } catch (e) {}
    }

    // 2. Detection & Dual Forwarding (TG + FB GC)
    if (type === "message_unsend") {
        try {
            const cache = JSON.parse(fs.readFileSync(path));
            const msgData = cache[messageID]; 
            
            if (!msgData) return;

            let userName = "Unknown";
            try { userName = await usersData.getName(msgData.senderID); } catch (e) {}

            let threadName = "Unknown Group";
            try { 
                const tInfo = await threadsData.get(msgData.threadID);
                threadName = tInfo.threadName || msgData.threadID; 
            } catch (e) {}

            const now = new Date();
            const time = now.toLocaleTimeString("bn-BD", { timeZone: "Asia/Dhaka", hour12: true });

            // Prepare Telegram Message (HTML)
            const escapeHTML = (text) => (text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            let tgMessage = `🚨 <b>Unsend Detected!</b>\n\n`;
            tgMessage += `📂 <b>Group:</b> ${escapeHTML(threadName)}\n`;
            tgMessage += `👤 <b>User:</b> ${escapeHTML(userName)}\n`;
            tgMessage += `🕒 <b>Time:</b> ${time}\n`;
            tgMessage += `───────────────────\n`;
            if (msgData.body) tgMessage += `📝 <b>Message:</b>\n${escapeHTML(msgData.body)}\n`;
            if (msgData.attachments.length > 0) {
                tgMessage += `\n📎 <b>Attachments:</b>\n`;
                msgData.attachments.forEach((att, i) => tgMessage += `${i + 1}. <a href="${att.url}">Link ${att.type}</a>\n`);
            }
            tgMessage += `\n🆔 TID: ${msgData.threadID}`; 

            // Prepare FB Messenger Log Message
            let fbMessage = `🚨 𝗨𝗻𝘀𝗲𝗻𝗱 𝗗𝗲𝘁𝗲𝗰𝘁𝗲𝗱!\n━━━━━━━━━━━━━━━━\n`;
            fbMessage += `👤 User: ${userName}\n`;
            fbMessage += `📂 Group: ${threadName}\n`;
            fbMessage += `🕒 Time: ${time}\n`;
            fbMessage += `📝 Message: ${msgData.body || "No text content"}\n`;
            if (msgData.attachments.length > 0) {
                fbMessage += `📎 Attachments: ${msgData.attachments.length} items. Check Telegram for links.\n`;
            }
            fbMessage += `━━━━━━━━━━━━━━━━\n🆔 TID: ${msgData.threadID}`;

            // --- A. Send to Telegram ---
            axios.post(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
                chat_id: tgID,
                text: tgMessage,
                parse_mode: "HTML",
                disable_web_page_preview: false 
            }).catch(e => console.error("TG Log Error:", e.message));

            // --- B. Send to Facebook Log Thread ---
            api.sendMessage(fbMessage, logThreadID).catch(e => console.error("FB Log Error:", e));

            // Cleanup
            delete cache[messageID];
            fs.writeFileSync(path, JSON.stringify(cache, null, 2));

        } catch (err) {
            console.error("❌ Resend logic error:", err);
        }
    }
  }
};
