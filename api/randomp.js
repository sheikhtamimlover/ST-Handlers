const axios = require('axios');

let config = {
  method: 'GET',
  url: 'https://api.tattoart.com/v1/arts/random-preset',
  headers: {
    'User-Agent': 'AITattoo/165 CFNetwork/3860.200.71 Darwin/25.1.0',
    'content-type': 'application/json',
    'app-version': '1.6.1',
    'priority': 'u=3',
    'locale': 'en',
    'if-none-match': 'W/"1d-Y10Ka21q6UXcr9btnKV27p/NAFo"',
    'accept-language': 'en-US,en;q=0.9',
    'bundle-id': 'com.roximus.ios.tattoo.generator',
    'region': 'US',
    'timezone': 'Asia/Dhaka',
    'udid': 'c6491b09-1cc8-4499-a6ba-8e2bd19456d5'
  }
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
