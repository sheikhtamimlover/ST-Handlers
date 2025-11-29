const axios = require('axios');

let data = JSON.stringify({
  "data": {
    "prompt": "Car"
  }
});

let config = {
  method: 'POST',
  url: 'https://us-central1-ai-emoji-generator.cloudfunctions.net/generateEmoji',
  headers: {
    'User-Agent': 'Nico-Melian.AI-Emoji/1.0 iPhone/26.1 hw/iPhone14_3',
    'Content-Type': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'priority': 'u=3, i'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
