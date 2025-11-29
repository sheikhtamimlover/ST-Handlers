const axios = require('axios');
const FormData = require('form-data');

let data = new FormData();
data.append('user_prompt', 'Bear building a snowman');
data.append('quality', 'low');
data.append('style_id', '3d');
data.append('generation_type', 'text_to_emoji');
data.append('user_id', 'a9a55c38-8788-4db9-a349-aa185418e882');
data.append('timestamp', '1764441733373');
data.append('platform', 'ios');
data.append('app_version', '1.2.1');
data.append('locale', 'en-US');
data.append('is_pro_user', 'false');
data.append('count', '1');
data.append('rc_user_id', '$RCAnonymousID:93e56c21f19746ddb97e58f9e2ca4cec');
data.append('package_id', 'com.gigantic.aiemoji');

let config = {
  method: 'POST',
  url: 'https://aiemoji-backend-production.up.railway.app/api/v1/generate/emoji/',
  headers: {
    'User-Agent': 'ktor-client',
    'Accept': 'application/json',
    'accept-charset': 'UTF-8',
    'accept-language': 'en-US,en;q=0.9',
    'x-api-key': '2e3611cd-bb1a-41fd-9bc1-d1971c5e29a2',
    'priority': 'u=3, i'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
