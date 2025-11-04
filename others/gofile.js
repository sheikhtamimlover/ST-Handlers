const axios = require("axios");

const folderId = "your url id";
const apiToken = "YOUR_VALID_TOKEN";

axios.get(`https://api.gofile.io/contents/${folderId}`, {
  headers: {
    accept: "*/*",
    authorization: `Bearer ${apiToken}`
  },
})
.then(res => console.log(res.data))
.catch(err => console.error(err.response?.data || err.message));