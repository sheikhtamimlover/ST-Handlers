const axios = require('axios');

let data = JSON.stringify({
  "image_uuid": "101A8C7B-FDAD-43B9-8337-A915C5BF03B7",
  "isReferenceImage": false,
  "user_uuid": "LvriHtd07dPlglz6pz8uhHCvCS13",
  "width": 768,
  "prompt": "Car",
  "num_inference_steps": 60,
  "guidance_scale": 8,
  "filter_code": 3,
  "height": 768
});

let config = {
  method: 'POST',
  url: 'https://us-central1-genzart-prod.cloudfunctions.net/run_txt2image_and_store',
  headers: {
    'User-Agent': 'GenZArt/4.4.8 (com.lifecassette.GenZArt.prod; build:135; iOS 26.1.0) Alamofire/5.6.4',
    'Accept-Encoding': 'br;q=1.0, gzip;q=0.9, deflate;q=0.8',
    'Content-Type': 'application/json',
    'priority': 'u=3, i',
    'accept-language': 'en-US;q=1.0, bn-US;q=0.9, tr-US;q=0.8'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
