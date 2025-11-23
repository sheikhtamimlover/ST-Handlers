const axios = require('axios');

let data = JSON.stringify({
  "model": "gpt-3.5-turbo",
  "numCompletions": 1,
  "messages": [
    {
      "role": "assistant",
      "content": "How can I help you?"
    },
    {
      "role": "user",
      "content": "Oh"
    }
  ]
});

let config = {
  method: 'POST',
  url: 'https://api.appexlabs.io/v1/chat/openai/completions',
  headers: {
    'User-Agent': 'Bonsai/29 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Content-Type': 'application/json',
    'x-user-id': '02B6DACA-2725-4B5A-A620-993C62C746EC',
    'x-app-id': 'com.joinappex.bonsai-1.3',
    'priority': 'u=3',
    'x-api-key': 'nnS0zfWRuC4yeYAp0jagT9IyX8qj5kwNh0Tqfo56',
    'accept-language': 'en-US,en;q=0.9'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
