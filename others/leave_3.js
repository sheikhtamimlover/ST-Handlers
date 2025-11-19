const { getTime, drive } = global.utils;

module.exports = {
	config: {
		name: "leave",
		version: "1.5",
		author: "ST | Sheikh Tamim",
		category: "events"
	},

	langs: {
		vi: {
			session1: "sáng",
			session2: "trưa",
			session3: "chiều",
			session4: "tối",
			leaveType1: "tự rời khỏi nhóm",
			leaveType2: "đã bị kick khỏi nhóm bởi {kickerName}",
			defaultLeaveMessage: "💔 {userName} {type}\n\n👥 Bây giờ nhóm của bạn có {memberCount} thành viên\n\n📊 Thống kê nhóm:\n♂️ Nam: {maleCount}\n♀️ Nữ: {femaleCount}\n🍁 Admin: {adminCount}"
		},
		en: {
			session1: "morning",
			session2: "noon",
			session3: "afternoon",
			session4: "evening",
			leaveType1: "𝐋𝐞𝐟𝐭 𝐓𝐡𝐞 𝐆𝐫𝐨𝐮𝐩",
			leaveType2: "𝐖𝐚𝐬 𝐊𝐢𝐜𝐤𝐞𝐝 𝐅𝐫𝐨𝐦 𝐓𝐡𝐞 𝐆𝐫𝐨𝐮𝐩 𝐁𝐲 👉 {kickerName}",
			defaultLeaveMessage: "💔 {userName} {type}\n\n𝐍𝐨𝐰 𝐘𝐨𝐮𝐫 𝐆𝐫𝐨𝐮𝐩 𝐇𝐚𝐬 {memberCount} 👥 𝐌𝐞𝐦𝐛𝐞𝐫\n\n𝐍𝐨𝐰 𝐘𝐨𝐮𝐫 𝐆𝐫𝐨𝐮𝐩 𝐇𝐚𝐬\n♂️ 𝐌𝐚𝐥𝐞 : {maleCount}\n♀️ 𝐅𝐞𝐦𝐚𝐥𝐞 : {femaleCount}\n🍁 𝐀𝐝𝐦𝐢𝐧 : {adminCount}"
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
				const hours = getTime("HH");

				const threadName = threadData.threadName;
				let userName;
				
				try {
					const userInfo = await api.getUserInfo(leftParticipantFbId);
					userName = userInfo[leftParticipantFbId]?.name;
				} catch (err) {
					console.error("Error getting user info:", err);
				}
				
				if (!userName) {
					userName = await usersData.getName(leftParticipantFbId);
				}
				
				if (!userName || userName === leftParticipantFbId) {
					userName = "Unknown User";
				}

				let kickerName = "";
				if (leftParticipantFbId != event.author) {
					try {
						const kickerInfo = await api.getUserInfo(event.author);
						kickerName = kickerInfo[event.author]?.name;
					} catch (err) {
						console.error("Error getting kicker info:", err);
					}
					
					if (!kickerName) {
						kickerName = await usersData.getName(event.author);
					}
					
					if (!kickerName || kickerName === event.author) {
						kickerName = "Unknown User";
					}
				}

				let threadInfo;
				let memberCount = 0;
				let maleCount = 0;
				let femaleCount = 0;
				let adminCount = 0;

				try {
					threadInfo = await api.getThreadInfo(threadID);
					memberCount = threadInfo.participantIDs.length;
					adminCount = threadInfo.adminIDs.length;

					const participantIDs = threadInfo.participantIDs;
					const usersInfo = await api.getUserInfo(participantIDs);
					
					for (const id of participantIDs) {
						const gender = usersInfo[id]?.gender;
						if (gender === "MALE" || gender === 1) {
							maleCount++;
						} else if (gender === "FEMALE" || gender === 2) {
							femaleCount++;
						}
					}
				} catch (err) {
					console.error("Error getting thread info:", err);
				}

				let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;

				const leaveType = leftParticipantFbId == event.author ? 
					getLang("leaveType1") : 
					getLang("leaveType2").replace(/\{kickerName\}/g, kickerName);

				leaveMessage = leaveMessage
					.replace(/\{userName\}/g, userName)
					.replace(/\{userNameTag\}/g, userName)
					.replace(/\{type\}/g, leaveType)
					.replace(/\{threadName\}|\{boxName\}/g, threadName)
					.replace(/\{memberCount\}/g, memberCount)
					.replace(/\{maleCount\}/g, maleCount)
					.replace(/\{femaleCount\}/g, femaleCount)
					.replace(/\{adminCount\}/g, adminCount)
					.replace(/\{time\}/g, hours)
					.replace(/\{session\}/g, hours <= 10 ?
						getLang("session1") :
						hours <= 12 ?
							getLang("session2") :
							hours <= 18 ?
								getLang("session3") :
								getLang("session4")
					);

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