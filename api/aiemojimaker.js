//step 1
const axios = require('axios');

let data = JSON.stringify({
  "prompt": "Black nib pen",
  "style": "Emoji",
  "visibility": "public",
  "timezone": "Asia/Dhaka",
  "language": "en"
});

let config = {
  method: 'POST',
  url: 'https://aiemoji.metainnovation.site/ai-emoji/portal/generate/text2Image',
  headers: {
    'User-Agent': 'Dart/3.5 (dart:io)',
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/json',
    'x-client-version': '1.1.0',
    'accept-language': 'en_US',
    'authorization': 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyX2lkXzgzY2FmNzQ4LTBmYTUtNDY4Ny05MmNjLTkxNDNkN2YxZTU1NiIsInVzZXJOYW1lIjoiUmFzaGVkdWwgUmFzaGVkdWwifQ.a8vn7AY-KDn0Saf24XHKgTcaWJGiLjweGZIY87b-WbxaEsonukr1STF8HEv_nlrtRQ_Cix5_AYoGJ8WTytfjjA',
    'x-device-id': '69F371E5-AE3E-410D-ABE7-E8F0A030E396',
    'x-timezone': '+06',
    'x-platform': 'ios'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));

//step 2
const axios = require('axios');

let data = JSON.stringify({
  "leftEmojiCodepoint": "1f607",
  "rightEmojiCodepoint": "1f608",
  "timezone": "Asia/Dhaka",
  "language": "en"
});

let config = {
  method: 'POST',
  url: 'https://aiemoji.metainnovation.site/ai-emoji/portal/merge/getMerge',
  headers: {
    'User-Agent': 'Dart/3.5 (dart:io)',
    'Accept-Encoding': 'gzip',
    'Content-Type': 'application/json',
    'x-client-version': '1.1.0',
    'accept-language': 'en_US',
    'authorization': 'Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyX2lkXzgzY2FmNzQ4LTBmYTUtNDY4Ny05MmNjLTkxNDNkN2YxZTU1NiIsInVzZXJOYW1lIjoiUmFzaGVkdWwgUmFzaGVkdWwifQ.a8vn7AY-KDn0Saf24XHKgTcaWJGiLjweGZIY87b-WbxaEsonukr1STF8HEv_nlrtRQ_Cix5_AYoGJ8WTytfjjA',
    'x-device-id': '69F371E5-AE3E-410D-ABE7-E8F0A030E396',
    'x-timezone': '+06',
    'x-platform': 'ios'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
