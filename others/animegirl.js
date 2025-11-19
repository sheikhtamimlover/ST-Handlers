const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "animegirl",
    version: "1.0.0",
    author: "ST | Sheikh Tamim",
    countDown: 5,
    role: 0,
    description: "Random Anime Girl Pics",
    category: "image",
    guide: "{pn}"
  },

  ST: async function({ message, event, api }) {
    try {
      const link = [
        "https://i.imgur.com/2iXk7mU.jpg",
        "https://i.imgur.com/OQQeOP3.jpg",
        "https://i.imgur.com/bMM8iJZ.jpg",
        "https://i.imgur.com/vJBXAhy.jpg",
        "https://i.imgur.com/C3b91UO.jpg",
        "https://i.imgur.com/iQbs8eX.jpg",
        "https://i.imgur.com/ZkpN7kz.jpg",
        "https://i.imgur.com/rfzt2WQ.jpg",
        "https://i.imgur.com/KSJQf1f.jpg",
        "https://i.imgur.com/BJ6yXNe.jpg",
        "https://i.imgur.com/IMubWyZ.jpg",
        "https://i.imgur.com/bXHiz1E.jpg",
        "https://i.imgur.com/6TF2Xft.jpg",
        "https://i.imgur.com/eab5Ex9.jpg",
        "https://i.imgur.com/ZLCFLkt.jpg",
        "https://i.imgur.com/dfBFRCY.jpg",
        "https://i.imgur.com/8hEm7Ib.jpg",
        "https://i.imgur.com/VjrmG8l.jpg",
        "https://i.imgur.com/g0rKS8v.jpg",
        "https://i.imgur.com/pwIiuie.jpg",
        "https://i.imgur.com/3JSCTMb.jpg",
        "https://i.imgur.com/cwaipdJ.jpg",
        "https://i.imgur.com/6YrFPL6.jpg",
        "https://i.imgur.com/hefR6oA.jpg",
        "https://i.imgur.com/IEellAV.jpg",
        "https://i.imgur.com/sIIKN0X.jpg",
        "https://i.imgur.com/U1dHNbT.jpg",
        "https://i.imgur.com/fWsdzoT.jpg",
        "https://i.imgur.com/9rwW06s.jpg",
        "https://i.imgur.com/kCtN9ET.jpg",
        "https://i.imgur.com/IfdtKRK.jpg",
        "https://i.imgur.com/lvbHmrc.jpg",
        "https://i.imgur.com/YQQ4OSq.jpg",
        "https://i.imgur.com/byXallB.jpg",
        "https://i.imgur.com/COb8HI9.jpg",
        "https://i.imgur.com/xFIa63u.jpg",
        "https://i.imgur.com/7JKSRQi.jpg",
        "https://i.imgur.com/EADdeTw.jpg",
        "https://i.imgur.com/zW5Yjr6.jpg",
        "https://i.imgur.com/i0lZw0Z.jpg",
        "https://i.imgur.com/COu7WrN.jpg",
        "https://i.imgur.com/z7RmDnI.jpg",
        "https://i.imgur.com/owd3yEE.jpg",
        "https://i.imgur.com/g5zU3Mg.jpg",
        "https://i.imgur.com/1M8Qo3e.jpg",
        "https://i.imgur.com/vVynRQK.jpg",
        "https://i.imgur.com/RHoJdo4.jpg",
        "https://i.imgur.com/NhnPV3T.jpg",
        "https://i.imgur.com/i9C8TaY.jpg",
        "https://i.imgur.com/JL99iUN.jpg",
        "https://i.imgur.com/4sZxV7H.jpg",
        "https://i.imgur.com/9ij2ZBZ.jpg",
        "https://i.imgur.com/qEJ1Bac.jpg",
        "https://i.imgur.com/TaxJ5C0.jpg",
        "https://i.imgur.com/kzUdnNU.jpg",
        "https://i.imgur.com/yAr7DHH.jpg",
        "https://i.imgur.com/dYZ3Fvm.jpg",
        "https://i.imgur.com/EteGnuY.jpg",
        "https://i.imgur.com/E5axqu9.jpg",
        "https://i.imgur.com/hZxona6.jpg",
        "https://i.imgur.com/5HsEx6v.jpg",
        "https://i.imgur.com/r4G6tQi.jpg",
        "https://i.imgur.com/3eMPpUl.jpg",
        "https://i.imgur.com/tasryGt.jpg",
        "https://i.imgur.com/rzlJZst.jpg",
        "https://i.imgur.com/4gx3rnh.jpg",
        "https://i.imgur.com/j4WDARE.jpg",
        "https://i.imgur.com/J9rhsQn.jpg",
        "https://i.imgur.com/tMwtFht.jpg",
        "https://i.imgur.com/AXmBgGk.jpg"
      ];

      const randomUrl = link[Math.floor(Math.random() * link.length)];
      
      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      const cachePath = path.join(cacheDir, `animegirl_${event.threadID}_${Date.now()}.jpg`);

      const response = await axios({
        url: randomUrl,
        method: "GET",
        responseType: "arraybuffer",
        timeout: 60000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      await fs.writeFile(cachePath, response.data);

      await api.sendMessage({
        body: `✨ Random Anime Girl Pic\n📸 Total Images: ${link.length}`,
        attachment: fs.createReadStream(cachePath)
      }, event.threadID, event.messageID);

      setTimeout(() => {
        fs.unlink(cachePath).catch(() => {});
      }, 5000);

    } catch (error) {
      console.error("Anime girl command error:", error);
      return message.reply("❌ Failed to load anime girl image. Please try again!");
    }
  }
};