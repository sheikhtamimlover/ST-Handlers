const axios = require('axios');

let data = JSON.stringify({
  "max_tokens": 1024,
  "messages": [
    {
      "content": "I want you to act as a 'Chat with AI' bot for engaging in conversational interactions with users. Users will initiate conversations on various topics or simply engage in casual chat, and you will respond with natural, engaging, and contextually relevant dialogue. Additionally, users can request information, share experiences, ask questions, or seek advice, and you will provide informative and helpful responses. Please ensure that the conversations flow smoothly, maintain coherence, and reflect a conversational style. Here is your prompt Hi. Answer in a neutral manner",
      "role": "user"
    }
  ],
  "user": "1B4C290D-969A-4EEF-A638-A06DAF41A27D",
  "model": "gpt-4o-mini"
});

let config = {
  method: 'POST',
  url: 'https://ai-keyboard.com/api/openapi/turbo-stream',
  headers: {
    'User-Agent': 'KeyboardGPT/1333 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'X-Encryption-Token': '03d622c3b6475b7c05056401ac24b994',
    'Cache-Control': 'no-cache'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
