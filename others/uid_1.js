const { findUid } = global.utils;
const regExCheckURL = /^(http|https):\/\/[^ "]+$/;

module.exports = {
	config: {
		name: "uid",
		version: "1.3",
		author: "NTKhang",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem user id facebook của người dùng",
			en: "View facebook user id of user"
		},
		category: "info",
		guide: {
			vi: "   {pn}: dùng để xem id facebook của bạn"
				+ "\n   {pn} @tag: xem id facebook của những người được tag"
				+ "\n   {pn} <link profile>: xem id facebook của link profile"
				+ "\n   Phản hồi tin nhắn của người khác kèm lệnh để xem id facebook của họ",
			en: "   {pn}: use to view your facebook user id"
				+ "\n   {pn} @tag: view facebook user id of tagged people"
				+ "\n   {pn} <profile link>: view facebook user id of profile link"
				+ "\n   Reply to someone's message with the command to view their facebook user id"
		}
	},

	langs: {
		vi: {
			syntaxError: "Vui lòng tag người muốn xem uid hoặc để trống để xem uid của bản thân"
		},
		en: {
			syntaxError: "Please tag the person you want to view uid or leave it blank to view your own uid"
		}
	},

	onStart: async function ({ message, event, args, getLang }) {
		// 1. Handle Reply
		if (event.messageReply) {
			return message.reply(event.messageReply.senderID);
		}

		// 2. Handle Mentions (@tag) - CHECK FIRST BEFORE SELF
		if (event.mentions && Object.keys(event.mentions).length > 0) {
			const mentions = Object.keys(event.mentions);
			let msg = "";
			for (const id of mentions) {
				const name = event.mentions[id].replace("@", "");
				msg += `👤 ${name}\n🆔 UID: ${id}\n\n`;
			}
			return message.reply(msg.trim());
		}

		// 3. Handle Facebook Profile Links
		if (args[0] && args[0].match(regExCheckURL)) {
			let msg = '';
			for (const link of args) {
				try {
					const uid = await findUid(link);
					msg += `🔗 ${link}\n🆔 UID: ${uid}\n\n`;
				}
				catch (e) {
					msg += `❌ ${link}\n❗ Error: ${e.message}\n\n`;
				}
			}
			return message.reply(msg.trim());
		}

		// 4. Handle Self (No args or no mentions)
		if (!args[0]) {
			return message.reply(event.senderID);
		}

		// 5. Fallback if nothing matches
		return message.reply(getLang("syntaxError"));
	}
};