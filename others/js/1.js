const botID = api.getCurrentUserID();
				if (dataGban.hasOwnProperty(botID)) {
					if (!dataGban[botID].toDate) {
						log.err('GBAN', getText('login', 'gbanMessage', dataGban[botID].date, dataGban[botID].reason, dataGban[botID].date));
						hasBanned = true;
					}
					else {
						const currentDate = (new Date((await axios.get("http://worldtimeapi.org/api/timezone/UTC")).data.utc_datetime)).getTime();
						if (currentDate < (new Date(dataGban[botID].date)).getTime()) {
							log.err('GBAN', getText('login', 'gbanMessage', dataGban[botID].date, dataGban[botID].reason, dataGban[botID].date, dataGban[botID].toDate));
							hasBanned = true;
						}
					}
				}
				// ———————————————— CHECK ADMIN ———————————————— //
				for (const idad of global.GoatBot.config.adminBot) {
					if (dataGban.hasOwnProperty(idad)) {
						if (!dataGban[idad].toDate) {
							log.err('GBAN', getText('login', 'gbanMessage', dataGban[idad].date, dataGban[idad].reason, dataGban[idad].date));
							hasBanned = true;
						}
						else {

							const currentDate = (new Date((await axios.get("http://worldtimeapi.org/api/timezone/UTC")).data.utc_datetime)).getTime();
							if (currentDate < (new Date(dataGban[idad].date)).getTime()) {
								log.err('GBAN', getText('login', 'gbanMessage', dataGban[idad].date, dataGban[idad].reason, dataGban[idad].date, dataGban[idad].toDate));
								hasBanned = true;
							}
						}
					}
				}
				if (hasBanned == true)
					process.exit();
			}
			catch (e) {
				console.log(e);
				log.err('GBAN', getText('login', 'checkGbanError'));
				process.exit();
			}