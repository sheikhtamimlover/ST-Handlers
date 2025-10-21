module.exports = {  
	config: {  
		name: "balance",  
		aliases: ["bal"],  
		version: "3.0",  
		author: "Rakib Adil",  
		countDown: 5,  
		role: 0,  
		description: "Check your balance or transfer to another user",  
		category: "economy",  
		guide: {  
			en: "{pn} - View your balance\n{pn} @tag - View another user's balance\n{pn} t <amount> (reply) - Transfer money"  
		}  
	},  

	langs: {  
		en: {  
			yourMoney: `✨ [ BALANCE PANEL ] ✨\n\n👤 | User: %1\n💼 | Balance: %2$\n🕒 | Checked: %3`,  
			otherMoney: `✨ [ BALANCE PANEL ] ✨\n\n👤 | %1\n💼 | Balance: %2$\n🕒 | Checked: %3`,  
			transferSuccess: "✅ Transferred 💵%1$ to %2",  
			noBalance: "⚠️ You don’t have enough balance!",  
			noUser: "⚠️ Please reply to a user to transfer money."  
		}  
	},  

	onStart: async function ({ args, message, usersData, event, getLang }) {  
		const now = new Date().toLocaleString("en-US", {  
			timeZone: "Asia/Dhaka",  
			hour12: true,  
			hour: "2-digit",  
			minute: "2-digit",  
			day: "2-digit",  
			month: "short",  
			year: "numeric"  
		});  

		// --- Balance Transfer Option ---  
		if (args[0] === "t") {  
			const amount = parseInt(args[1]);  
			if (!amount || amount <= 0) return message.reply("⚠️ Please enter a valid amount.");  

			if (event.type !== "message_reply") return message.reply(getLang("noUser"));  
			const targetUser = event.messageReply.senderID;  

			const senderData = await usersData.get(event.senderID);  
			if (senderData.money < amount) return message.reply(getLang("noBalance"));  

			const targetData = await usersData.get(targetUser);  
			const targetName = await usersData.getName(targetUser);  

			// Update balances  
			await usersData.set(event.senderID, {  
				...senderData,  
				money: senderData.money - amount  
			});  

			await usersData.set(targetUser, {  
				...targetData,  
				money: targetData.money + amount  
			});  

			return message.reply(getLang("transferSuccess", amount, targetName));  
		}  

		// --- Balance Check ---  
		const mentions = Object.keys(event.mentions);  
		if (mentions.length > 0) {  
			let result = "";  
			for (const uid of mentions) {  
				const userMoney = await usersData.get(uid, "money");  
				const name = event.mentions[uid].replace("@", "");  
				result += getLang("otherMoney", name, userMoney, now) + "\n\n";  
			}  
			return message.reply(result.trim());  
		}  

		const userData = await usersData.get(event.senderID);  
		const name = (await usersData.getName(event.senderID)) || "Unknown User";  
		return message.reply(getLang("yourMoney", name, userData.money, now));  
	}  
};