const axios = require('axios');

let data = JSON.stringify({
  "aspect_ratio": "1:1",
  "sendText": "woman in rain, neon city",
  "documentID": "ifHpRDdXjT2s3kZjHvQu",
  "userId": "e1jzwttKD4Pdqvq1maY85WUDF4A2",
  "sendTextWithInstruction": "Hyper-realistic, cinematic, film-like tones, dramatic lighting, dynamic shot. woman in rain, neon city"
});

let config = {
  method: 'POST',
  url: 'https://us-central1-wallpapers-44f47.cloudfunctions.net/createImageTurbo4',
  headers: {
    'User-Agent': 'Wallpapers/588911 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Content-Type': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'priority': 'u=3'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
