const axios = require('axios');
const FormData = require('form-data');

let data = new FormData();
data.append('prompt', 'Logo moonshine, midnight, full moon, skullbrand,,,,');
data.append('negative_prompt', '');
data.append('width', '512');
data.append('height', '512');

let config = {
  method: 'POST',
  url: 'http://logomaker.breakerai.com/api/genart',
  headers: {
    'User-Agent': 'logopromaxba/1.1.8 (com.havu.ai.logo.maker; build:1; iOS 26.1.0) Alamofire/5.6.4',
    'Accept-Encoding': 'br;q=1.0, gzip;q=0.9, deflate;q=0.8',
    'Upload-Draft-Interop-Version': '6',
    'Upload-Complete': '?1',
    'Accept-Language': 'en-US;q=1.0, bn-US;q=0.9, tr-US;q=0.8'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
