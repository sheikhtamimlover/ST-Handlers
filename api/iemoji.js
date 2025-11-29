//step 1 post 
const axios = require('axios');

let data = JSON.stringify({
  "model": "emoji",
  "userId": "$RCAnonymousID:9d31e5df20814d6a9b152b6535626fad",
  "prompt": "A TOK emoji of car"
});

let config = {
  method: 'POST',
  url: 'https://iemoji.app.juli.sh/generate',
  headers: {
    'User-Agent': 'iEmoji/4 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Content-Type': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'priority': 'u=3'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));

//step2 polling system
const axios = require('axios');

let config = {
  method: 'GET',
  url: 'https://iemoji.app.juli.sh/status/3emfk7r59drme0ctswjrmyk3xc',
  headers: {
    'User-Agent': 'iEmoji/4 CFNetwork/3860.200.71 Darwin/25.1.0',
    'priority': 'u=3',
    'accept-language': 'en-US,en;q=0.9'
  }
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
