//Step 1 Get Token 
const axios = require('axios');

let data = JSON.stringify({
  "limited_use": false,
  "assertion": "omlzaWduYXR1cmVYRzBFAiEAiE3WNcAXej2e4XOG71LUHNMRmwaCW+lI0SZIy6sppbYCIBNAwezizWcdcqz1Jyas0EAEFlmAt4TH3gmc/rpm00N4cWF1dGhlbnRpY2F0b3JEYXRhWCV7QNMFWRkNWexRvJmlwBbIqSXyQQIYQ/MyeWTNvDELNEAAAAAB",
  "artifact": "AafgCIGbS2mhgZZRV3aIYIu5aCcTrOdl8UbyXHqZGCBUS9TJYZpuaOd+j77yw98TYpn+uUwzKo/Lkkzf/239JFPQ3Eb1/AiG8dAhgjN7rc299gFDooyr1gIBCeYM0d+ESn1XhL4O+DlY0tFdZEdDFp/3T7xUPhtgZFp1X5O5RRm74KGIzOlKrN/l/UDgEJ7v6aJy9i7p8h602ntL08BWQi5HWpeMIhLqyxKbrbtFF9g3wS4ZospBYi0=",
  "challenge": "AdV75utplrpBXq+ylaSIS9gEaUlOhsQgYZyKF7t/sVmAfm3SLGySvJ61TY+z4t4c0pjnKedbNC2fza5gaZf+4i4sCGhaPimYzhEH03wU0uObiGtPjrDThSFCEUfQz/RJWP+N7TPZHsiTleXLKlACFm8PYvSeWy57WgyFh+JKIg=="
});

let config = {
  method: 'POST',
  url: 'https://firebaseappcheck.googleapis.com/v1/projects/magic-ai-a8432/apps/1:800005182478:ios:7bce9faea7f1b9982b585f:exchangeAppAttestAssertion',
  headers: {
    'User-Agent': 'MagicAI/186 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Content-Type': 'application/json',
    'x-goog-api-key': 'AIzaSyCYwfdhPonH0xd7CinKW5nz6_6D5V6hEgA',
    'x-ios-bundle-identifier': 'com.tappz.magicai',
    'priority': 'u=3',
    'accept-language': 'en-US,en;q=0.9'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));


//Step2 from step1 get tokrn and use in here and video gen actual api
const axios = require('axios');

let data = JSON.stringify({
  "data": {
    "negative": "shaky footage, overexposure, saturated colors, fast cuts, digital noise, flat color profiles, underexposure, blurry images, distorted perspectives, cluttered frames, artificial lighting artifacts, out-of-focus subjects,abrupt zooms, low-resolution footage, monochromatic color schemes unless intentional for artistic effect, clichéd visual effects, inconsistent frame rates",
    "steps": 50,
    "width": 1024,
    "height": 1024,
    "prompt": "A galaxy of marshmallow stars., cinematic depth, 8K ultra-high definition, RAW format, rich color grading, high dynamic range (HDR), immersive wide-angle perspective, hyperdetailed textures (scale: 1.15), natural lighting, seamless deep focus, wide aspect ratio for a cinematic feel, filmic textures, vibrant yet natural color palette, detailed environmental elements, subtle bokeh effect in background, sharp foreground clarity, photorealistic quality, high-quality post-production sharpening"
  }
});

let config = {
  method: 'POST',
  url: 'https://us-central1-magic-ai-a8432.cloudfunctions.net/generateVideo',
  headers: {
    'User-Agent': 'MagicAI/186 CFNetwork/3860.200.71 Darwin/25.1.0',
    'Content-Type': 'application/json',
    'x-firebase-appcheck': 'eyJraWQiOiJVTjJhMmciLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxOjgwMDAwNTE4MjQ3ODppb3M6N2JjZTlmYWVhN2YxYjk5ODJiNTg1ZiIsImF1ZCI6WyJwcm9qZWN0cy84MDAwMDUxODI0NzgiLCJwcm9qZWN0cy9tYWdpYy1haS1hODQzMiJdLCJwcm92aWRlciI6ImRldmljZV9jaGVja19hcHBfYXR0ZXN0IiwiaXNzIjoiaHR0cHM6Ly9maXJlYmFzZWFwcGNoZWNrLmdvb2dsZWFwaXMuY29tLzgwMDAwNTE4MjQ3OCIsImV4cCI6MTc2Mzg5ODcxOSwiaWF0IjoxNzYzODk1MTE5LCJqdGkiOiJZR3VGMFVaUHlhUUlrSDJzMS1UQkoyZ1JGZDR3aXUyLVBVZV9NS2pBYUNrIn0.H3fVxfvmuWEEmsKx56fd_a_oObXDqXGkYiYtU49yoIZLF71DWC3nEtQE77AupWdoJb4EP-OPgz4WJSb5KKVE83PMFOaRgEIN2vDSL7raJsgryVVVxpMIh0JRfO_XRTeXr5z9u9b-WHutBtmUQUNSdHBl5KWw3eFoGpMhU-6PfdN11iyZG3tc6pjuRCBb9jRE4cCF3iCAcKn3dMy9yGOjKcgKWp1gsBYA64WauPsodRiFkRiYimxVx0LGFXDuortgqJawUFOtdtBtoggOq4wZDyEXmzXuEz_iPz1I9BW8YfHtX-hFZvj6l4t2j7lr9dJPcx6PtvoYIo6D77ParMe7Zujq_rBQfswr-xzVDxwhj5IOzCwTrh9oaI__MSV2vGKLvlBNiM5n6r6qZgiA1KJAk0X2djXI-5thkEEMeG4k_gE3_WAOeGLnNfAVUD2lVKFQGYwXt4EJLHMVRrMRPCyBJkOCfqbB9eyUQaZkM3yiueCUKlq5OnSfReDaBq5tDEss',
    'accept-language': 'en-US,en;q=0.9',
    'priority': 'u=3'
  },
  data: data
};

axios.request(config)
  .then(response => console.log(response.data))
  .catch(error => console.log('error', error));
