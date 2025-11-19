module.exports = {
	config: {
		name: "anifact",
		version: "1.0.0",
		author: "ST | Sheikh Tamim",
		countDown: 0,
		role: 0,
		shortDescription: "random animal fact",
		longDescription: "Get random animal facts",
		category: "random-img",
		guide: "{pn}"
	},

	ST: async function({ message, event }) {
		try {
			const axios = require('axios');
			const fs = require("fs-extra");
			const request = require("request");
			const animals = ['dog', 'cat', 'panda', 'fox', 'koala', 'bird', 'raccoon', 'kangaroo', 'red_panda'];
			const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
			
			const res = await axios.get(`https://some-random-api.com/animal/${randomAnimal}`);
			const data = res.data;
			
			const callback = function() {
				return message.send({
					body: `Facts about ${randomAnimal}: ${data.fact}`,
					attachment: fs.createReadStream(__dirname + `/cache/anifact.png`)
				}, () => fs.unlinkSync(__dirname + `/cache/anifact.png`));
			};
			
			return request(encodeURI(data.image)).pipe(fs.createWriteStream(__dirname + `/cache/anifact.png`)).on("close", callback);
		} catch (err) {
			console.log(err);
			return message.send(`Error: ${err.message}`);
		}
	}
};