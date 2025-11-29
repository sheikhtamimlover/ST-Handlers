//step 1
const axios = require('axios');

let data = JSON.stringify({
  "prompt": "design a visually appealing flat style logo of Car on a light background. style detail: flat",
  "aspect_ratio": "1:1"
});

let config = {
  method: 'POST',
  url: 'https://queue.fal.run/fal-ai/flux-pro/v1.1-ultra',
  headers: {
    'User-Agent': 'fal.ai/swift-client 0.1.0 - Version 26.1 (Build 23B85)',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'authorization': 'Key 54440e00-95fd-4942-86d0-543083146f60:4c0e11fff0a526b5e98ca881b2251602',
    'accept-language': 'en-US,en;q=0.9',
    'priority': 'u=3'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
//step 2 polling 
const axios = require('axios');

let config = {
  method: 'GET',
  url: 'https://queue.fal.run/fal-ai/flux-pro/requests/36b2c082-c1b8-478e-8fb7-5767af5d1487',
  headers: {
    'User-Agent': 'fal.ai/swift-client 0.1.0 - Version 26.1 (Build 23B85)',
    'Accept': 'application/json',
    'content-type': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'priority': 'u=3',
    'authorization': 'Key 54440e00-95fd-4942-86d0-543083146f60:4c0e11fff0a526b5e98ca881b2251602'
  }
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
