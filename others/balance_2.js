module.exports = {
	config: {
		name: "balance",
		aliases: ["bal"],
		version: "2.4.71",
		author: "NTKhang | Enhanced by ST",
		countDown: 5,
		role: 0,
		description: {
			vi: "xem số tiền hiện có của bạn hoặc người được tag",
			en: "view your money or the money of the tagged person"
		},
		category: "economy",
		guide: {
			vi: "   {pn}: xem số tiền của bạn"
				+ "\n   {pn} <@tag>: xem số tiền của người được tag",
			en: "   {pn}: view your money"
				+ "\n   {pn} <@tag>: view the money of the tagged person"
		}
	},

	langs: {
		vi: {
			money: "Bạn đang có %1$",
			moneyOf: "%1 đang có %2$"
		},
		en: {
			money: "You have %1$",
			moneyOf: "%1 has %2$"
		}
	},

	ST: async function({ message, usersData, event, getLang }) {
		const uid = Object.keys(event.mentions)[0] || event.senderID;
		const userData = await usersData.get(uid);
		const userBank = await usersData.get(uid, "bank") || {};
		const bankBalance = userBank && userBank.bankBalance ? userBank.bankBalance : 0;
		
		if (Object.keys(event.mentions).length > 0) {
			const userName = event.mentions[Object.keys(event.mentions)[0]].replace("@", "");
			message.reply(`💰 ${userName}'s Balance\n━━━━━━━━━━━━━━━━\n💵 Wallet: $${userData.money.toLocaleString()}\n🏦 Bank: $${bankBalance.toLocaleString()}\n━━━━━━━━━━━━━━━━\n💎 Total: $${(userData.money + bankBalance).toLocaleString()}`);
		} else {
			message.reply(`💰 Your Balance\n━━━━━━━━━━━━━━━━\n💵 Wallet: $${userData.money.toLocaleString()}\n🏦 Bank: $${bankBalance.toLocaleString()}\n━━━━━━━━━━━━━━━━\n💎 Total: $${(userData.money + bankBalance).toLocaleString()}`);
		}
	}
};