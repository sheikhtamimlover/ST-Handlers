const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "help",
		version: "2.4.61",
		role: 0,
		countDown: 0,
		author: "ST | Sheikh Tamim",
		description: "Displays all available commands and their categories.",
		category: "help"
	},

	ST: async ({ api, event, args }) => {
		const cmdsFolderPath = path.join(__dirname, '.');
		const files = fs.readdirSync(cmdsFolderPath).filter(file => file.endsWith('.js'));

		const sendMessage = async (message, threadID, messageID = null) => {
			try {
				return await api.sendMessage(message, threadID, messageID);
			} catch (error) {
				console.error('Error sending message:', error);
			}
		};

		const getCategories = () => {
			const categories = {};
			for (const file of files) {
				try {
					const command = require(path.join(cmdsFolderPath, file));
					const { category } = command.config;
					const categoryName = category || 'uncategorized';
					if (!categories[categoryName]) categories[categoryName] = [];
					categories[categoryName].push(command.config);
				} catch (error) {
					// Skip invalid command files
				}
			}
			return categories;
		};

		const categoryEmojis = {
			'text': '✨',
			'tools': '🧰',
			'utility': '🧩',
			'game': '🎮',
			'system': '⚙️',
			'info': '📘',
			'image': '🖼️',
			'owner': '👑',
			'admin': '🛠️',
			'music': '🎵',
			'ai': '🤖',
			'ai-image': '🧠',
			'google': '🌍',
			'islamic': '🕌',
			'config': '⚙️',
			'chat': '💭',
			'fun': '🎉',
			'media': '🖥️',
			'moderation': '🚨',
			'rank': '📈',
			'anime': '🌸'
		};

		try {
			// If specific command requested directly
			if (args[0] && !args[0].match(/^\d+$/)) {
				const commandName = args[0].toLowerCase();
				const command = files.map(file => {
					try {
						return require(path.join(cmdsFolderPath, file));
					} catch {
						return null;
					}
				}).filter(cmd => cmd !== null)
				.find(cmd => cmd.config.name.toLowerCase() === commandName || (cmd.config.aliases && cmd.config.aliases.includes(commandName)));

				if (command) {
					// Display command details with fancy design
					let commandDetails = `┏━━━━━━━━━━━━━━━━━━━┓\n`;
					commandDetails += ` ✨ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 ✨ㅤ\n`;
					commandDetails += `┣━━━━━━━━━━━━━━━━━━━┫\n`;
					commandDetails += `┃ ⚡ 𝗡𝗮𝗺𝗲: ${command.config.name}\n`;
					commandDetails += `┃ 📌 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${command.config.version || 'N/A'}\n`;
					commandDetails += `┃ 👤 𝗔𝘂𝘁𝗵𝗼𝗿: ${command.config.author || 'Unknown'}\n`;
					commandDetails += `┃ 🔐 𝗥𝗼𝗹𝗲: ${command.config.role !== undefined ? command.config.role : 'N/A'}\n`;
					commandDetails += `┃ 📂 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${command.config.category || 'uncategorized'}\n`;
					commandDetails += `┃ 💎 𝗣𝗿𝗲𝗺𝗶𝘂𝗺: ${command.config.premium == true ? '✅ Yes' : '❌ No'}\n`;
					commandDetails += `┃ 🔧 𝗣𝗿𝗲𝗳𝗶𝘅: ${command.config.usePrefix !== undefined ? (command.config.usePrefix ? '✅ Required' : '❌ Optional') : '⚙️ Global'}\n`;

					if (command.config.aliases && command.config.aliases.length > 0) {
						commandDetails += `┃ 🔄 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${command.config.aliases.join(', ')}\n`;
					}

					if (command.config.countDown !== undefined) {
						commandDetails += `┃ ⏱️ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${command.config.countDown}s\n`;
					}

					commandDetails += `┣━━━━━━━━━━━━━━━━━━━┫\n`;

					// Description
					if (command.config.description) {
						const desc = typeof command.config.description === 'string' ? command.config.description : command.config.description.en || 'No description available';
						commandDetails += `┃ 📋 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:\n┃ ${desc}\n┣━━━━━━━━━━━━━━━━━━━┫\n`;
					}

					// Guide/Usage
					const guideText = command.config.guide ? (typeof command.config.guide === 'string' ? command.config.guide : command.config.guide.en || 'No guide available') : 'No guide available';
					commandDetails += `┃ 📚 𝗨𝘀𝗮𝗴𝗲 𝗚𝘂𝗶𝗱𝗲:\n┃ ${guideText.replace(/{pn}/g, `!${command.config.name}`)}\n`;

					commandDetails += `┗━━━━━━━━━━━━━━━━━━━┛\n`;
					commandDetails += ` 👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑`;

					await sendMessage(commandDetails, event.threadID);
				} else {
					await sendMessage(`❌ Command not found: ${commandName}`, event.threadID);
				}
			} else {
				// Show all commands grouped by category
				const categories = getCategories();
				const categoryNames = Object.keys(categories).sort();
				
				let helpMessage = '🌺 ⌬⌬ 𝐂𝐚𝐭 𝐁𝐨𝐭 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ⌬⌬ 🌺\n________________________\n\n';
				
				categoryNames.forEach((category) => {
					const emoji = categoryEmojis[category.toLowerCase()] || '📦';
					const categoryTitle = category.toUpperCase();
					const commands = categories[category].sort((a, b) => a.name.localeCompare(b.name));
					
					helpMessage += `${emoji}『 ${categoryTitle} 』\n`;
					commands.forEach(cmd => {
						helpMessage += `⚡ ${cmd.name}\n`;
					});
					helpMessage += '________________________\n\n';
				});
				
				helpMessage += '🤖 Cat Bot is always ready to help you!\n\n';
				helpMessage += ' 👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑';

				await sendMessage(helpMessage, event.threadID);
			}
		} catch (error) {
			console.error('Error generating help message:', error);
			await sendMessage('An error occurred while generating the help message.', event.threadID);
		}
	}
};
