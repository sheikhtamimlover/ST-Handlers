const axios = require('axios');

let data = JSON.stringify({
  "height": 1024,
  "samples": 1,
  "styleName": "classic",
  "width": 1024,
  "prompt": "Abstract watercolor galaxy"
});

let config = {
  method: 'POST',
  url: 'https://api.tattoart.com/v1/arts/text2img',
  headers: {
    'User-Agent': 'AITattoo/165 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Content-Type': 'application/json',
    'app-version': '1.6.1',
    'priority': 'u=3',
    'locale': 'en',
    'accept-language': 'en-US,en;q=0.9',
    'bundle-id': 'com.roximus.ios.tattoo.generator',
    'region': 'US',
    'timezone': 'Asia/Dhaka',
    'udid': 'c6491b09-1cc8-4499-a6ba-8e2bd19456d5'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
