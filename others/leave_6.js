const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "2.2",
		author: "ST | Sheikh Tamim",
		category: "events"
	},

	langs: {
		vi: {
			session1: "buổi sáng",
			session2: "buổi trưa",
			session3: "buổi chiều",
			session4: "buổi tối",
			leaveType1: "đã tự rời khỏi nhóm",
			leaveType2: "𝐖𝐚𝐬 𝐊𝐢𝐜𝐤𝐞𝐝 𝐅𝐫𝐨𝐦 𝐓𝐡𝐞 𝐆𝐫𝐨𝐮𝐩 𝐁𝐲 👉 {kickerName}",
			defaultLeaveMessage: "😦 {userName} {type}\n\n𝐍𝐨𝐰 𝐘𝐨𝐮𝐫 𝐆𝐫𝐨𝐮𝐩 𝐇𝐚𝐬 {memberCount} 👥 𝐌𝐞𝐦𝐛𝐞𝐫\n\n𝐊𝐢𝐜𝐤𝐞𝐝 𝐓𝐢𝐦𝐞: {time12}"
		},
		en: {
			session1: "𝐀𝐌",
			session2: "𝐏𝐌",
			leaveType1: "𝐋𝐞𝐟𝐭 𝐓𝐡𝐞 𝐆𝐫𝐨𝐮𝐩",
			leaveType2: "𝐖𝐚𝐬 𝐊𝐢𝐜𝐤𝐞𝐝 𝐅𝐫𝐨𝐦 𝐓𝐡𝐞 𝐆𝐫𝐨𝐮𝐩 𝐁𝐲 👉 {kickerName}",
			defaultLeaveMessage: "😦 {userName} {type}\n\n𝐍𝐨𝐰 𝐘𝐨𝐮𝐫 𝐆𝐫𝐨𝐮𝐩 𝐇𝐚𝐬 {memberCount} 👥 𝐌𝐞𝐦𝐛𝐞𝐫\n\n𝐊𝐢𝐜𝐤𝐞𝐝 𝐓𝐢𝐦𝐞: {time12}"
		}
	},

	onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
		if (event.logMessageType == "log:unsubscribe")
			return async function () {
				const { threadID } = event;
				const threadData = await threadsData.get(threadID);
				if (!threadData.settings.sendLeaveMessage)
					return;
				const { leftParticipantFbId } = event.logMessageData;
				if (leftParticipantFbId == api.getCurrentUserID())
					return;

				const hours = parseInt(getTime("HH"));
				const minutes = getTime("mm");
				const hours12 = hours % 12 || 12;
				const ampm = hours >= 12 ? getLang("session2") : getLang("session1");
				const time12 = `${hours12}:${minutes} ${ampm}`;

				const [userInfoResult, kickerInfoResult, threadInfoResult] = await Promise.allSettled([
					api.getUserInfo(leftParticipantFbId),
					leftParticipantFbId != event.author ? api.getUserInfo(event.author) : Promise.resolve(null),
					api.getThreadInfo(threadID)
				]);

				let userName = "𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐔𝐬𝐞𝐫";
				if (userInfoResult.status === "fulfilled" && userInfoResult.value) {
					userName = userInfoResult.value[leftParticipantFbId]?.name || await usersData.getName(leftParticipantFbId) || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧 𝐔𝐬𝐞𝐫";
				}

				let kickerName = "";
				if (leftParticipantFbId != event.author) {
					if (kickerInfoResult.status === "fulfilled" && kickerInfoResult.value) {
						kickerName = kickerInfoResult.value[event.author]?.name || await usersData.getName(event.author) || "𝐒𝐨𝐦𝐞𝐨𝐧𝐞";
					}
				}

				let memberCount = 0;

				if (threadInfoResult.status === "fulfilled" && threadInfoResult.value) {
					const threadInfo = threadInfoResult.value;
					memberCount = threadInfo.participantIDs.length;
				}

				let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;

				const leaveType = leftParticipantFbId == event.author ? 
					getLang("leaveType1") : 
					getLang("leaveType2").replace(/\{kickerName\}/g, kickerName);

				leaveMessage = leaveMessage
					.replace(/\{userName\}/g, userName)
					.replace(/\{userNameTag\}/g, userName)
					.replace(/\{type\}/g, leaveType)
					.replace(/\{memberCount\}/g, memberCount)
					.replace(/\{time12\}/g, time12);

				const form = {
					body: leaveMessage
				};

				if (threadData.data.leaveAttachment) {
					const files = threadData.data.leaveAttachment;
					const attachments = files.reduce((acc, file) => {
						acc.push(drive.getFile(file, "stream"));
						return acc;
					}, []);
					form.attachment = (await Promise.allSettled(attachments))
						.filter(({ status }) => status == "fulfilled")
						.map(({ value }) => value);
				}
				message.send(form);
			};
	}
};