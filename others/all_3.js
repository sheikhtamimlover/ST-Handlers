module.exports = {
	config: {
		name: "all",
		version: "1.2",
		author: "ST | Sheikh Tamim",
		countDown: 5,
		role: 1,
		description: {
			vi: "Tag tất cả thành viên trong nhóm chat của bạn",
			en: "Tag all members in your group chat"
		},
		category: "box chat",
		guide: {
			vi: "   {pn} [nội dung | để trống]",
			en: "   {pn} [content | empty]"
		}
	},

	ST: async function({ message, args, event, threadsData, usersData }) {
		const threadData = await threadsData.get(event.threadID);
		if (!threadData || !threadData.participantIDs) {
			return message.reply("Unable to get group members.");
		}
		
		const { participantIDs } = threadData;
		const lengthAllUser = participantIDs.length;
		const mentions = [];
		let body = args.join(" ") || "";
		let bodyLength = body.length;
		let i = 0;
		let fromIndex = 0;

		for (const uid of participantIDs) {
			if (bodyLength < lengthAllUser) {
				body += body[bodyLength - 1] || " ";
				bodyLength++;
			}
			if (body.slice(0, i).lastIndexOf(body[i]) != -1)
				fromIndex = i;
			mentions.push({
				tag: body[i] || " ",
				id: uid,
				fromIndex
			});
			i++;
		}
		message.reply({ body, mentions });
	}
};