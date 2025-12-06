const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

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

	ST: async function ({ message, usersData, event, getLang, api }) {
		const { bankData } = global.db;

		const createBalanceCard = (userName, walletAmount, bankAmount) => {
			const canvas = createCanvas(1000, 600);
			const ctx = canvas.getContext('2d');
			
			const gradient = ctx.createLinearGradient(0, 0, 1000, 600);
			gradient.addColorStop(0, '#667eea');
			gradient.addColorStop(0.5, '#764ba2');
			gradient.addColorStop(1, '#f093fb');
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, 1000, 600);
			
			for (let i = 0; i < 80; i++) {
				ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
				ctx.beginPath();
				ctx.arc(Math.random() * 1000, Math.random() * 600, Math.random() * 3, 0, Math.PI * 2);
				ctx.fill();
			}
			
			ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
			for (let i = 0; i < 15; i++) {
				ctx.beginPath();
				ctx.arc(Math.random() * 1000, Math.random() * 600, Math.random() * 60 + 20, 0, Math.PI * 2);
				ctx.fill();
			}
			
			ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
			ctx.shadowBlur = 30;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 15;
			ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
			ctx.roundRect(40, 40, 920, 520, 25);
			ctx.fill();
			ctx.shadowColor = 'transparent';
			
			const headerGradient = ctx.createLinearGradient(70, 70, 930, 70);
			headerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
			headerGradient.addColorStop(1, 'rgba(255, 255, 255, 0.7)');
			ctx.fillStyle = headerGradient;
			ctx.roundRect(70, 70, 860, 100, 20);
			ctx.fill();
			
			const titleGradient = ctx.createLinearGradient(100, 100, 500, 100);
			titleGradient.addColorStop(0, '#667eea');
			titleGradient.addColorStop(1, '#764ba2');
			ctx.fillStyle = titleGradient;
			ctx.font = 'bold 48px Arial';
			ctx.textAlign = 'left';
			ctx.fillText('💰 BALANCE', 100, 130);
			
			ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
			ctx.font = '28px Arial';
			ctx.fillText('Premium Account', 100, 155);
			
			ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
			ctx.roundRect(70, 190, 860, 90, 15);
			ctx.fill();
			
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 38px Arial';
			ctx.fillText('👤', 100, 240);
			
			ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
			ctx.font = 'bold 34px Arial';
			ctx.fillText(userName, 160, 242);
			
			ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(100, 260);
			ctx.lineTo(900, 260);
			ctx.stroke();
			
			ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
			ctx.roundRect(70, 300, 420, 110, 15);
			ctx.fill();
			ctx.roundRect(510, 300, 420, 110, 15);
			ctx.fill();
			
			const walletGradient = ctx.createLinearGradient(100, 330, 100, 380);
			walletGradient.addColorStop(0, '#00d4ff');
			walletGradient.addColorStop(1, '#0099ff');
			ctx.fillStyle = walletGradient;
			ctx.font = 'bold 30px Arial';
			ctx.fillText('💵 WALLET', 100, 340);
			
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 36px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(`$${walletAmount.toLocaleString()}`, 280, 385);
			
			const bankGradient = ctx.createLinearGradient(540, 330, 540, 380);
			bankGradient.addColorStop(0, '#00ff88');
			bankGradient.addColorStop(1, '#00cc66');
			ctx.fillStyle = bankGradient;
			ctx.font = 'bold 30px Arial';
			ctx.textAlign = 'left';
			ctx.fillText('🏦 BANK', 540, 340);
			
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 36px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(`$${bankAmount.toLocaleString()}`, 720, 385);
			
			ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
			ctx.roundRect(70, 430, 860, 110, 15);
			ctx.fill();
			
			const totalGradient = ctx.createLinearGradient(70, 470, 930, 470);
			totalGradient.addColorStop(0, '#ff6b6b');
			totalGradient.addColorStop(0.5, '#ffd93d');
			totalGradient.addColorStop(1, '#ff6b6b');
			ctx.fillStyle = totalGradient;
			ctx.font = 'bold 34px Arial';
			ctx.textAlign = 'left';
			ctx.fillText('💎 TOTAL NET WORTH', 100, 475);
			
			ctx.fillStyle = '#ffffff';
			ctx.font = 'bold 42px Arial';
			ctx.textAlign = 'right';
			const total = walletAmount + bankAmount;
			ctx.fillText(`$${total.toLocaleString()}`, 880, 505);
			
			ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
			ctx.font = 'bold 18px Arial';
			ctx.textAlign = 'center';
			ctx.fillText('✨ Powered by ST AI ✨', 500, 555);
			
			return canvas;
		};

		if (Object.keys(event.mentions).length > 0) {
			const uid = Object.keys(event.mentions)[0];
			const userName = event.mentions[uid].replace("@", "");
			const userMoney = await usersData.get(uid, "money");
			const userBank = await bankData.get(uid);
			const bankBalance = userBank ? userBank.bankBalance : 0;
			
			const canvas = createBalanceCard(userName, userMoney, bankBalance);
			const buffer = canvas.toBuffer('image/png');
			const cachePath = path.join(__dirname, '..', '..', 'cache');
			if (!fs.existsSync(cachePath)) {
				fs.mkdirSync(cachePath, { recursive: true });
			}
			const tempPath = path.join(cachePath, `balance_${uid}_${Date.now()}.png`);
			
			fs.writeFileSync(tempPath, buffer);
			
			return message.reply({
				body: `💰 Balance Card Generated!\n👤 User: ${userName}\n💵 Wallet: $${userMoney.toLocaleString()}\n🏦 Bank: $${bankBalance.toLocaleString()}\n💎 Total: $${(userMoney + bankBalance).toLocaleString()}`,
				attachment: fs.createReadStream(tempPath)
			}, () => fs.unlinkSync(tempPath));
		}

		const userData = await usersData.get(event.senderID);
		const userBank = await bankData.get(event.senderID);
		const bankBalance = userBank ? userBank.bankBalance : 0;
		const userName = userData.name || "User";
		
		const canvas = createBalanceCard(userName, userData.money, bankBalance);
		const buffer = canvas.toBuffer('image/png');
		const cachePath = path.join(__dirname, '..', '..', 'cache');
		if (!fs.existsSync(cachePath)) {
			fs.mkdirSync(cachePath, { recursive: true });
		}
		const tempPath = path.join(cachePath, `balance_${event.senderID}_${Date.now()}.png`);
		
		fs.writeFileSync(tempPath, buffer);
		
		return message.reply({
			body: `💰 Your Balance Card\n👤 Name: ${userName}\n💵 Wallet: $${userData.money.toLocaleString()}\n🏦 Bank: $${bankBalance.toLocaleString()}\n💎 Total: $${(userData.money + bankBalance).toLocaleString()}`,
			attachment: fs.createReadStream(tempPath)
		}, () => fs.unlinkSync(tempPath));
	}
};