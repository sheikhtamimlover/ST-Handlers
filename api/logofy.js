const axios = require('axios');

let data = JSON.stringify({
  "num_outputs": 1,
  "app_ver": "1.0",
  "output_format": "jpg",
  "prompt": "Construct a strong, architectural symbol for a construction firm, emphasizing symmetry and solid shapes.",
  "plan": "Free",
  "is_paid": false,
  "device_id": "FB512D7D",
  "aspect_ratio": "1:1",
  "append": "Construct a strong, architectural symbol for a construction firm, emphasizing symmetry and solid shapes.logo in An upscale and refined logo design with a luxurious feel. Uses elegant serif fonts, metallic gold or silver accents, fine lines, and minimalistic embellishments. Conveys sophistication, wealth, and exclusivity for high-end brands. with darker background"
});

let config = {
  method: 'POST',
  url: 'https://api.logofy.pro/api/generate',
  headers: {
    'User-Agent': 'Logofy/2 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Content-Type': 'application/json',
    'Accept-Language': 'en-US,en;q=0.9'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
