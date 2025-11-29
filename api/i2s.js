const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

let data = new FormData();
data.append('image', fs.createReadStream('/var/mobile/Containers/Data/Application/AF5522A7-9170-4BAA-BCD0-1D840A7AE68B/Library/Application Support/tmp/419f9b49-2104-4f6b-898f-c2804c40e423'));

let config = {
  method: 'POST',
  url: 'https://api.theapp.studio/emojiUser/createEmoji?_id=692acf6c8033f2ac9b6c8deb',
  headers: {
    'User-Agent': 'emojiapp/4 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    'priority': 'u=3, i',
    'Cookie': '__cf_bm=Iby1kneC8AsBY7144ThAvK9VgwVtNuQv4C0oWbcC.24-1764422932-1.0.1.1-kD46Mjht2E8nVisPlqMkJd0nfl3DtKMiEs8rtTMWm3FTTLIUVSVBHDKyknWue29FCWgf.Slf6N_smxYIMY1H6FmhL6SZG8qyZLghoSrTE0s; connect.sid=s%3ASdexsNhT4b4CSyLA84lE3x1DBEzJrb_r.w5kT%2BBJ2ca%2FGh0D%2B%2B5NZ6KZUq1PlKKm7tKdBDB58BW4'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
