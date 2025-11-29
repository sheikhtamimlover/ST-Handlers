//step 1 prompt enhance
const axios = require('axios');

let data = JSON.stringify({
  "style": "Common",
  "color": "any color",
  "prompt": "Travel agency"
});

let config = {
  method: 'POST',
  url: 'https://bswcwmqacecnmjfxocqu.supabase.co/functions/v1/generatePrompt',
  headers: {
    'User-Agent': 'AI%20Logo%20Generator/3 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Content-Type': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'priority': 'u=3'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
//step 2 logo gen 
const axios = require('axios');

let data = JSON.stringify({
  "prompt": "Create ONE logo for this prompt: Travel agency. Style: Common. Color: any color."
});

let config = {
  method: 'POST',
  url: 'https://bswcwmqacecnmjfxocqu.supabase.co/functions/v1/generateLogo',
  headers: {
    'User-Agent': 'AI%20Logo%20Generator/3 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Content-Type': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'priority': 'u=3'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
