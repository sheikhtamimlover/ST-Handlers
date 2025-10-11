axios = require('axios');

let data = JSON.stringify({
  "prompt": "Girl"
});

let config = {
  method: 'POST',
  url: 'https://api-dev.magictask.it/v1/ai/generate-emoji',
  headers: {
    'User-Agent': 'GenMoji/41 CFNetwork/3860.100.1 Darwin/25.0.0',
    'Content-Type': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'priority': 'u=3',
    'Cookie': '__cf_bm=297Qz102N8SCJ.y_ODkYp8pq8LUQCdVL08sqwSXTC88-1759934694-1.0.1.1-KakUtebbUYxSVEA86rJ_NA_gCNq5qOyk53ox7z5AMbg9aMi_IfXmcGJSR5SC8uUr_fdEJ_cymrspnlnsHlEgsfSlc.yOC9IiCxJJOlTRm5U'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data ))
  .catch(error => console.log('error', error))