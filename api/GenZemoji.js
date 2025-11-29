const axios = require('axios');

let data = JSON.stringify({
  "style": 1,
  "UID": "3CBA6864-19B3-439C-81CE-E7F591E90D41",
  "isPrivate": false,
  "message": "Girl"
});

let config = {
  method: 'POST',
  url: 'https://api.unikwork.com/genzemoji/api/v2/emoji/create',
  headers: {
    'User-Agent': 'MessageEmoji/1 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Content-Type': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9',
    'Authorization': 'eyJwYXNzIjogIlRlc3RAMTIzIiwgInBhY2thZ2UiOiAiY29ycmVjdGNhcmUuY29tLk1lc3NhZ2VFbW9qaSIsICJ0aW1lIjogMTc2NDQxMTUyNjQ1MX0='
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
