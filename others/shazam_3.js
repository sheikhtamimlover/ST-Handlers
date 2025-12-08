const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require('fluent-ffmpeg');

module.exports = {
  config: {
    name: "shazam",
    aliases: ["i", "🤔","🤨"," 😀","🥹","🌚"],
    version: "1.0.0",
    author: "ST | Sheikh Tamim | Enhance By Ayesha Queen",
    countDown: 5,
    role: 0,
    description: "Identify songs from audio/video and download",
    category: "music",
    guide: "{pn} - Reply to audio/video\n{pn} i - Reply to audio/video for detailed info"
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

    const showDetailedInfo = args[0] && args[0].toLowerCase() === 'i';
    const processingMsg = await message.reply(`🙌 ${userName}, Please wait... ≛⃝𝙰𝚈𝙴𝙰𝙷𝙰 𝚀𝚄𝙴𝙴𝙽👑 identifying the song... `);

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

      const FormData = require('form-data');
      const audioBuffer = fs.readFileSync(audioPath);
      
      const shazamResponse = await axios.post('https://shazam.p.rapidapi.com/songs/v2/detect', audioBuffer, {
        params: { timezone: 'America/Chicago', locale: 'en-US' },
        headers: {
          'content-type': 'text/plain',
          'X-RapidAPI-Key': 'f0c08b968fmsh13f29073076ae38p1e0fcfjsn3e6eb1a5ea30',
          'X-RapidAPI-Host': 'shazam.p.rapidapi.com'
        }
      });

      const result = shazamResponse.data;

      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

      await message.unsend(processingMsg.messageID);

      if (result && result.track) {
        const track = result.track;
        
        const title = track.title || 'Unknown';
        const artist = track.subtitle || 'Unknown Artist';
        const coverArt = track.images?.coverart || track.images?.background;
        
        if (showDetailedInfo) {
          let infoMessage = `✅ Song Information\n\n`;
          infoMessage += `🎵 ${title}\n`;
          infoMessage += `👤 ${artist}\n`;

          if (track.sections) {
            const metadataSection = track.sections.find(s => s.type === 'SONG');
            if (metadataSection && metadataSection.metadata) {
              metadataSection.metadata.forEach(meta => {
                if (meta.title === 'Album') {
                  infoMessage += `💿 ${meta.text}\n`;
                } else if (meta.title === 'Released') {
                  infoMessage += `📅 ${meta.text}\n`;
                } else if (meta.title === 'Label') {
                  infoMessage += `🏷️ ${meta.text}\n`;
                }
              });
            }
          }

          if (track.genres && track.genres.primary) {
            infoMessage += `🎸 ${track.genres.primary}\n`;
          }

          if (coverArt) {
            try {
              const artworkResponse = await axios.get(coverArt, {
                responseType: "arraybuffer"
              });

              const artworkPath = path.join(cacheDir, `artwork_${timestamp}.jpg`);
              fs.writeFileSync(artworkPath, Buffer.from(artworkResponse.data));

              await message.reply({
                body: infoMessage,
                attachment: fs.createReadStream(artworkPath)
              });

              if (fs.existsSync(artworkPath)) {
                fs.unlinkSync(artworkPath);
              }
            } catch (artworkError) {
              console.error("Artwork download error:", artworkError);
              return message.reply(infoMessage);
            }
          } else {
            return message.reply(infoMessage);
          }
        } else {
          let basicMessage = `✅ Song Found!\n\n`;
          basicMessage += `🎵 ${title}\n`;
          basicMessage += `👤 ${artist}\n`;
          
          const previewUrl = track.hub?.actions?.find(a => a.type === 'uri')?.uri;
          
          if (previewUrl && previewUrl.includes('.mp3')) {
            try {
              const downloadMsg = await message.reply("🤏 Downloading preview...");
              
              const songResponse = await axios.get(previewUrl, {
                responseType: "arraybuffer"
              });

              const songPath = path.join(cacheDir, `song_${timestamp}.mp3`);
              fs.writeFileSync(songPath, Buffer.from(songResponse.data));

              await message.unsend(downloadMsg.messageID);

              await message.reply({
                body: basicMessage + `\n😌 Preview downloaded`,
                attachment: fs.createReadStream(songPath)
              });

              if (fs.existsSync(songPath)) {
                fs.unlinkSync(songPath);
              }
            } catch (downloadError) {
              console.error("Download error:", downloadError);
              basicMessage += `\n🔗 Preview: ${previewUrl}\n🤐 Download failed`;
              return message.reply(basicMessage);
            }
          } else {
            if (track.url) {
              basicMessage += `\n🔗 Link: ${track.url}`;
            }
            return message.reply(basicMessage + `\n🤐 No preview available`);
          }
        }
      } else {
        return message.reply("🤐 No song matches found. Try with a clearer audio sample.");
      }

    } catch (error) {
      await message.unsend(processingMsg.messageID);
      console.error("Shazam error:", error);
      return message.reply(`🤐 Error identifying song: ${error.message}`);
    }
  }
};