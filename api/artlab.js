const axios = require('axios');

let data = JSON.stringify({
  "styleName": "realistic",
  "aspectRatio": "1:1",
  "prompt": "sci-fi style, cyber Tamagushi. futuristic, technological, alien worlds, space themes, advanced civilizations",
  "samples": 1
});

let config = {
  method: 'POST',
  url: 'https://api.ai-art-gen.com/v1/arts/stability/text2img',
  headers: {
    'User-Agent': 'AIArtGenerator/1415 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Content-Type': 'application/json',
    'app-version': '4.1.9',
    'priority': 'u=3',
    'locale': 'en',
    'accept-language': 'en-US,en;q=0.9',
    'bundle-id': 'com.roximus.ios.art.generator',
    'timezone': 'Asia/Dhaka',
    'udid': '1b2f140c-57d3-4346-acc3-328dee6aa5e9'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
