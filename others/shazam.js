const { recognizeSong } = require('st-shazam');
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require('fluent-ffmpeg');

module.exports = {
  config: {
    name: "shazam",
    aliases: [],
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Identify songs from audio/video and download",
    category: "music",
    guide: "{pn} - Reply to audio/video\n{pn} info - Reply to audio/video for detailed info"
  },

  ST: async function ({ message, args, event, usersData }) {
    const userName = await usersData.getName(event.senderID);

    if (!event.messageReply) {
      return message.reply("⚠️ Please reply to an audio or video message with !shazam");
    }

    const attachments = event.messageReply.attachments;
    if (!attachments || attachments.length === 0) {
      return message.reply("⚠️ The message you replied to doesn't contain any audio or video.");
    }

    const mediaAttachment = attachments.find(att => 
      att.type === 'audio' || att.type === 'video'
    );

    if (!mediaAttachment) {
      return message.reply("⚠️ Please reply to a message containing audio or video.");
    }

    const showDetailedInfo = args[0] && args[0].toLowerCase() === 'info';
    const processingMsg = await message.reply(`🎵 ${userName}, identifying song... Please wait.`);

    try {
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      const timestamp = Date.now();
      let audioPath;
      
      const response = await axios.get(mediaAttachment.url, {
        responseType: "arraybuffer"
      });

      if (mediaAttachment.type === 'video') {
        const videoPath = path.join(cacheDir, `video_${timestamp}.mp4`);
        fs.writeFileSync(videoPath, Buffer.from(response.data));
        
        audioPath = path.join(cacheDir, `audio_${timestamp}.mp3`);
        
        try {
          await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
              .noVideo()
              .audioCodec('libmp3lame')
              .audioFrequency(44100)
              .audioChannels(2)
              .audioBitrate('192k')
              .format('mp3')
              .save(audioPath)
              .on('end', () => {
                if (!fs.existsSync(audioPath)) {
                  reject(new Error("Audio file was not created after conversion"));
                } else {
                  resolve();
                }
              })
              .on('error', (err) => {
                reject(new Error("Failed to extract audio from video: " + err.message));
              });
          });
        } catch (err) {
          if (fs.existsSync(videoPath)) {
            try { fs.unlinkSync(videoPath); } catch(e) {}
          }
          if (fs.existsSync(audioPath)) {
            try { fs.unlinkSync(audioPath); } catch(e) {}
          }
          throw err;
        }
        
        try {
          if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }
        } catch(e) {
          console.error("Error deleting video file:", e.message);
        }
        
      } else {
        audioPath = path.join(cacheDir, `audio_${timestamp}.mp3`);
        fs.writeFileSync(audioPath, Buffer.from(response.data));
      }

      const result = await recognizeSong(audioPath);

      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

      await message.unsend(processingMsg.messageID);

      if (result.results && result.results.matches && result.results.matches.length > 0) {
        const matchId = result.results.matches[0].id;
        const songData = result.resources['shazam-songs'][matchId];
        const attributes = songData.attributes;
    
        const previewUrl = result.resources?.["shazam-songs"]?.[matchId]?.attributes?.streaming?.preview;

        if (showDetailedInfo) {
          const albumData = result.resources.albums ? Object.values(result.resources.albums)[0] : null;
          const genreData = result.resources.genres ? Object.values(result.resources.genres)[0] : null;

          const duration = songData.meta?.duration || 0;
          const minutes = Math.floor(duration / 60);
          const seconds = Math.floor(duration % 60);

          let infoMessage = `✅ Song Information\n\n`;
          infoMessage += `🎵 ${attributes.title}\n`;
          infoMessage += `👤 ${attributes.artist}\n`;

          if (albumData) {
            infoMessage += `💿 ${albumData.attributes.name}\n`;
            infoMessage += `📅 ${albumData.attributes.releaseDate}\n`;
          }

          infoMessage += `🏷️ ${attributes.label}\n`;

          if (genreData) {
            infoMessage += `🎸 ${genreData.attributes.name}\n`;
          }

          infoMessage += `⏱️ Duration: ${minutes}:${seconds.toString().padStart(2, '0')}\n`;

          return message.reply(infoMessage);
        } else {
          let basicMessage = `✅ Song Found!\n\n`;
          basicMessage += `🎵 ${attributes.title}\n`;
          basicMessage += `👤 ${attributes.artist}\n`;
          
          if (previewUrl) {
            try {
              const downloadMsg = await message.reply("⬇️ Downloading preview...");
              
              const songResponse = await axios.get(previewUrl, {
                responseType: "arraybuffer"
              });

              const songPath = path.join(cacheDir, `song_${timestamp}.mp3`);
              fs.writeFileSync(songPath, Buffer.from(songResponse.data));

              await message.unsend(downloadMsg.messageID);

              await message.reply({
                body: basicMessage + `\n📥 Preview downloaded`,
                attachment: fs.createReadStream(songPath)
              });

              if (fs.existsSync(songPath)) {
                fs.unlinkSync(songPath);
              }
            } catch (downloadError) {
              console.error("Download error:", downloadError);
              basicMessage += `\n🔗 Preview: ${previewUrl}\n❌ Download failed`;
              return message.reply(basicMessage);
            }
          } else {
            return message.reply(basicMessage + `\n❌ No preview available`);
          }
        }
      } else {
        return message.reply("❌ No song matches found. Try with a clearer audio sample.");
      }

    } catch (error) {
      await message.unsend(processingMsg.messageID);
      console.error("Shazam error:", error);
      return message.reply(`❌ Error identifying song: ${error.message}`);
    }
  }
};