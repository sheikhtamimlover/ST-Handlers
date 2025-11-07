const fs = require('fs');
const path = require('path');

module.exports = {
	config: {
		name: "help",
		version: "2.4.60",
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
				// Stage 1: Show categories with serial numbers
				const categories = getCategories();
				const categoryNames = Object.keys(categories).sort();
				
				let helpMessage = '┏━━━━━━━━━━━━━━━━━━━┓\n';
				helpMessage += ' 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦ㅤ\n';
				helpMessage += '┣━━━━━━━━━━━━━━━━━━━┫\n';
				
				categoryNames.forEach((category, index) => {
					const commandCount = categories[category].length;
					const icon = ['🎮', '🛠️', '🎨', '💰', '🎵', '📊', '🔍', '⚙️', '🎯', '📱'][index % 10];
					helpMessage += `┃ ${icon} ${String(index + 1).padStart(2, '0')}. ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
					helpMessage += `┃ ╰─ ${commandCount} command${commandCount > 1 ? 's' : ''}\n`;
				});
				
				helpMessage += '┣━━━━━━━━━━━━━━━━━━━┫\n';
				helpMessage += '┃ 💡 Reply with number to view\n';
				helpMessage += '┃ commands in category\n';
				helpMessage += '┃ 💡 Type !help <cmdname> for\n';
				helpMessage += '┃ direct command details\n';
				helpMessage += '┗━━━━━━━━━━━━━━━━━━━┛\n';
				helpMessage += ' 👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑';

				const sentMessage = await sendMessage(helpMessage, event.threadID);
				
				// Set up onReply for category selection (Stage 1)
				if (sentMessage) {
					global.GoatBot.onReply.set(sentMessage.messageID, {
						commandName: "help",
						messageID: sentMessage.messageID,
						author: event.senderID,
						stage: 1,
						categories: categoryNames,
						categoriesData: categories
					});
				}
			}
		} catch (error) {
			console.error('Error generating help message:', error);
			await sendMessage('An error occurred while generating the help message.', event.threadID);
		}
	},

	onReply: async ({ api, event, Reply }) => {
		if (Reply.author != event.senderID) {
			return api.sendMessage("❌ This is not for you!", event.threadID, event.messageID);
		}

		const choice = parseInt(event.body.trim());

		try {
			if (Reply.stage === 1) {
				// Stage 2: User selected a category - show commands with serial numbers
				if (isNaN(choice) || choice < 1 || choice > Reply.categories.length) {
					return api.sendMessage(`❌ Invalid choice. Please reply with a number between 1 and ${Reply.categories.length}.`, event.threadID, event.messageID);
				}

				const selectedCategory = Reply.categories[choice - 1];
				const commands = Reply.categoriesData[selectedCategory].sort((a, b) => a.name.localeCompare(b.name));

				let categoryMessage = `┏━━━━━━━━━━━━━━━━━━━┓\n`;
				categoryMessage += ` ${selectedCategory.toUpperCase()} 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦ㅤ\n`;
				categoryMessage += `┣━━━━━━━━━━━━━━━━━━━┫\n`;

				commands.forEach((cmd, index) => {
					const num = String(index + 1).padStart(2, '0');
					categoryMessage += `┃ ⚡ ${num}. ${cmd.name}\n`;
				});

				categoryMessage += `┣━━━━━━━━━━━━━━━━━━━┫\n`;
				categoryMessage += `┃ 💡 Reply with number for\n`;
				categoryMessage += `┃ detailed information\n`;
				categoryMessage += `┃ 💡 Type 0 to go back\n`;
				categoryMessage += `┗━━━━━━━━━━━━━━━━━━━┛\n`;
				categoryMessage += ` 📊 Total: ${commands.length} commands`;

				// Delete old onReply data and unsend previous message
				global.GoatBot.onReply.delete(Reply.messageID);
				try {
					await api.unsendMessage(Reply.messageID);
				} catch (error) {
					console.error('Error unsending message:', error);
				}

				const sentMessage = await api.sendMessage(categoryMessage, event.threadID);

				// Set up onReply for command selection (Stage 2)
				if (sentMessage) {
					global.GoatBot.onReply.set(sentMessage.messageID, {
						commandName: "help",
						messageID: sentMessage.messageID,
						author: event.senderID,
						stage: 2,
						commands: commands,
						selectedCategory: selectedCategory,
						parentCategories: Reply.categories,
						parentCategoriesData: Reply.categoriesData
					});
				}

			} else if (Reply.stage === 2) {
				// Check if user wants to go back to categories
				if (choice === 0) {
					const categoryNames = Reply.parentCategories;
					const categories = Reply.parentCategoriesData;
					
					let helpMessage = '┏━━━━━━━━━━━━━━━━━━━┓\n';
					helpMessage += ' 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦ㅤ\n';
					helpMessage += '┣━━━━━━━━━━━━━━━━━━━┫\n';
					
					categoryNames.forEach((category, index) => {
						const commandCount = categories[category].length;
						const icon = ['🎮', '🛠️', '🎨', '💰', '🎵', '📊', '🔍', '⚙️', '🎯', '📱'][index % 10];
						helpMessage += `┃ ${icon} ${String(index + 1).padStart(2, '0')}. ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
						helpMessage += `┃ ╰─ ${commandCount} command${commandCount > 1 ? 's' : ''}\n`;
					});
					
					helpMessage += '┣━━━━━━━━━━━━━━━━━━━┫\n';
					helpMessage += '┃ 💡 Reply with number to view\n';
					helpMessage += '┃ commands in category\n';
					helpMessage += '┃ 💡 Type !help <cmdname> for\n';
					helpMessage += '┃ direct command details\n';
					helpMessage += '┗━━━━━━━━━━━━━━━━━━━┛\n';
					helpMessage += ' 👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑';

					// Delete old onReply data and unsend previous message
					global.GoatBot.onReply.delete(Reply.messageID);
					try {
						await api.unsendMessage(Reply.messageID);
					} catch (error) {
						console.error('Error unsending message:', error);
					}

					const sentMessage = await api.sendMessage(helpMessage, event.threadID);
					
					// Set up onReply for category selection (back to Stage 1)
					if (sentMessage) {
						global.GoatBot.onReply.set(sentMessage.messageID, {
							commandName: "help",
							messageID: sentMessage.messageID,
							author: event.senderID,
							stage: 1,
							categories: categoryNames,
							categoriesData: categories
						});
					}
					return;
				}

				// Stage 3: User selected a specific command - show full details
				if (isNaN(choice) || choice < 1 || choice > Reply.commands.length) {
					return api.sendMessage(`❌ Invalid choice. Please reply with a number between 1 and ${Reply.commands.length}, or 0 to go back.`, event.threadID, event.messageID);
				}

				const selectedCommand = Reply.commands[choice - 1];

				// Delete old onReply data and unsend previous message
				global.GoatBot.onReply.delete(Reply.messageID);
				try {
					await api.unsendMessage(Reply.messageID);
				} catch (error) {
					console.error('Error unsending message:', error);
				}

				try {
					// Load the actual command file to get complete details
					const cmdsFolderPath = path.join(__dirname, '.');
					const files = fs.readdirSync(cmdsFolderPath).filter(file => file.endsWith('.js'));
					
					let fullCommand = null;
					for (const file of files) {
						try {
							const command = require(path.join(cmdsFolderPath, file));
							if (command.config.name.toLowerCase() === selectedCommand.name.toLowerCase()) {
								fullCommand = command;
								break;
							}
						} catch (error) {
							// Skip invalid command files
						}
					}

					if (!fullCommand) {
						fullCommand = { config: selectedCommand };
					}

					let commandDetails = `┏━━━━━━━━━━━━━━━━━━━┓\n`;
					commandDetails += ` ✨ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢 ✨ㅤ\n`;
					commandDetails += `┣━━━━━━━━━━━━━━━━━━━┫\n`;
					commandDetails += `┃ ⚡ 𝗡𝗮𝗺𝗲: ${fullCommand.config.name}\n`;
					commandDetails += `┃ 📌 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${fullCommand.config.version || 'N/A'}\n`;
					commandDetails += `┃ 👤 𝗔𝘂𝘁𝗵𝗼𝗿: ${fullCommand.config.author || 'Unknown'}\n`;
					commandDetails += `┃ 🔐 𝗥𝗼𝗹𝗲: ${fullCommand.config.role !== undefined ? fullCommand.config.role : 'N/A'}\n`;
					commandDetails += `┃ 📂 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝘆: ${fullCommand.config.category || 'uncategorized'}\n`;
					commandDetails += `┃ 💎 𝗣𝗿𝗲𝗺𝗶𝘂𝗺: ${fullCommand.config.premium == true ? '✅ Yes' : '❌ No'}\n`;
					commandDetails += `┃ 🔧 𝗣𝗿𝗲𝗳𝗶𝘅: ${fullCommand.config.usePrefix !== undefined ? (fullCommand.config.usePrefix ? '✅ Required' : '❌ Optional') : '⚙️ Global'}\n`;

					if (fullCommand.config.aliases && fullCommand.config.aliases.length > 0) {
						commandDetails += `┃ 🔄 𝗔𝗹𝗶𝗮𝘀𝗲𝘀: ${fullCommand.config.aliases.join(', ')}\n`;
					}

					if (fullCommand.config.countDown !== undefined) {
						commandDetails += `┃ ⏱️ 𝗖𝗼𝗼𝗹𝗱𝗼𝘄𝗻: ${fullCommand.config.countDown}s\n`;
					}

					commandDetails += `┣━━━━━━━━━━━━━━━━━━━┫\n`;

					// Description
					if (fullCommand.config.description) {
						const desc = typeof fullCommand.config.description === 'string' ? fullCommand.config.description : fullCommand.config.description.en || 'No description available';
						commandDetails += `┃ 📋 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:\n┃ ${desc}\n┣━━━━━━━━━━━━━━━━━━━┫\n`;
					}

					// Guide/Usage
					let guideText = 'No guide available';
					if (fullCommand.config.guide) {
						guideText = typeof fullCommand.config.guide === 'string' ? fullCommand.config.guide : fullCommand.config.guide.en || 'No guide available';
					}

					commandDetails += `┃ 📚 𝗨𝘀𝗮𝗴𝗲 𝗚𝘂𝗶𝗱𝗲:\n┃ ${guideText.replace(/{pn}/g, `!${fullCommand.config.name}`)}\n`;

					commandDetails += `┗━━━━━━━━━━━━━━━━━━━┛\n`;
					commandDetails += ` 👑 𝙾𝚠𝚗𝚎𝚛: 𝑨𝒀𝑬𝑺𝑯𝑨 𝑸𝑼𝑬𝑬𝑵 👑`;

					// Send command details (final stage - no new onReply needed)
					await api.sendMessage(commandDetails, event.threadID);
					
				} catch (error) {
					console.error('Error sending command details:', error);
					await api.sendMessage('❌ An error occurred while displaying command details.', event.threadID, event.messageID);
				}
			}
		} catch (error) {
			console.error('Error in help onReply:', error);
			api.sendMessage('❌ An error occurred while processing your request.', event.threadID, event.messageID);
		}
	}
};