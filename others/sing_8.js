const axios = require("axios");
const yts = require("yt-search");

module.exports = {
	config: {
		name: "sing",
    aliases: ["song","play"],
		version: "1.1",
		author: "modified by Rana",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Play music fast"
		},
		longDescription: {
			en: "Download and send music with react status"
		},
		category: "media",
		guide: {
			en: "{pn} <song name>"
		}
	},

	onStart: async function ({ api, event, args }) {

		const { threadID, messageID } = event;

		if (!args.length) return;

		try {

			// ⏳ pending react
			api.setMessageReaction("⏳", messageID, () => {}, true);

			const query = args.join(" ");

			// search fast
			const result = await yts(query);

			if (!result.videos.length) {

				api.setMessageReaction("❌", messageID, () => {}, true);
				return;
			}

			const video = result.videos[0];

			// download api
			const apiUrl =
				`https://nayan-video-downloader.vercel.app/ytdown?url=https://youtu.be/${video.videoId}`;

			const res = await axios.get(apiUrl, {
				timeout: 30000
			});

			if (!res.data.status) {

				api.setMessageReaction("❌", messageID, () => {}, true);
				return;
			}

			const audioUrl = res.data.data.audio;

			// send audio fast
			await api.sendMessage(
				{
					attachment: await global.utils.getStreamFromURL(audioUrl)
				},
				threadID
			);

			// ✅ success react
			api.setMessageReaction("✅", messageID, () => {}, true);

		} catch (err) {

			console.log(err);

			api.setMessageReaction("❌", messageID, () => {}, true);

		}
	}
};
