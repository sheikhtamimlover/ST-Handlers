const axios = require("axios");
const randomUseragent = require("random-useragent");
const { v4: uuidv4 } = require("uuid");
const { faker } = require("@faker-js/faker");
const crypto = require("crypto");

function buildHeaders() {
  const randomUA = randomUseragent.getRandom();
  const randomCorsHeader = crypto.randomBytes(12).toString("hex");
  const randomCookieId1 = faker.number.int({ min: 100000000, max: 999999999 });
  const randomGaTs = Math.floor(Date.now() / 1000);
  const uuidToken = uuidv4();

  return {
    "accept": "*/*",
    "accept-language": faker.location.countryCode(),
    "application-name": "web",
    "application-version": faker.system.semver(),
    "content-type": "application/json",
    "priority": "u=1, i",
    "sec-ch-ua": randomUA,
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": `"${faker.helpers.arrayElement(["Windows", "Linux", "macOS"])}"`,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "x-cors-header": randomCorsHeader,
    "cookie": `_ga=GA1.1.${randomCookieId1}.${randomGaTs}; _ga_3DVKZSPS3D=${uuidToken}`,
    "Referer": "https://temp-mail.io/",
    "User-Agent": randomUA
  };
}

async function createTempMail(headers) {
  try {
    const body = {
      min_name_length: 10,
      max_name_length: 10
    };

    const response = await axios.post(
      "https://api.internal.temp-mail.io/api/v3/email/new",
      body,
      { headers }
    );

    console.log("📧 Temp-mail Created:");
    console.log(response.data);

    return response.data;

  } catch (error) {
    console.error("❌ Error Creating Email:", error.response?.data || error.message);
    return null;
  }
}

async function getMessages(email, headers) {
  try {
    const url = `https://api.internal.temp-mail.io/api/v3/email/${email}/messages`;

    const response = await axios.get(url, { headers });

    console.log("\n📨 Inbox Messages:");
    console.log(response.data);

    return response.data;

  } catch (error) {
    console.error("❌ Error Fetching Messages:", error.response?.data || error.message);
    return null;
  }
}

(async () => {
  const headers = buildHeaders(); 

  const emailData = await createTempMail(headers);
  if (!emailData) return;

Z
  await new Promise(res => setTimeout(res, 2000));

  await getMessages(emailData.email, headers);
})();
