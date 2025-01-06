import axios from "axios";

const CLIENT_ID = "86xutk8qjyq5n5";
const AUTH_URL = `https://www.linkedin.com/oauth/v2/authorization`;
const TOKEN_URL = `https://www.linkedin.com/oauth/v2/accessToken`;

export const signInWithLinkedIn = async () => {
  const REDIRECT_URI = chrome.identity.getRedirectURL("linkedin");
  const authUrl = `${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid%20profile%20email%20r_1st_connections_size%20r_basicprofile`;


  console.log("authUrl - ",authUrl);
  return new Promise<void>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async (redirectUrl) => {
        console.log("redirectUrl - ", redirectUrl);

        if (chrome.runtime.lastError || !redirectUrl) {
          reject(chrome.runtime.lastError?.message || "Authentication failed");
          return;
        }

        const urlParams = new URLSearchParams(new URL(redirectUrl).search);
        const authCode = urlParams.get("code");

        if (!authCode) {
          reject("No authorization code found");
          return;
        }

        try {
          const response = await axios.post(
            TOKEN_URL,
            new URLSearchParams({
              grant_type: "authorization_code",
              code: authCode,
              redirect_uri: REDIRECT_URI,
              client_id: CLIENT_ID,
              client_secret: "WPL_AP1.JHOZsauEzuF7qGbk.p0IcKw==",
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          );

          const { access_token } = response.data;

          console.log(response.data);

          localStorage.setItem("connexik:user", response.data);

          chrome.storage.local.set({ session: access_token, data: JSON.stringify(response.data) });
          resolve();
        } catch (err) {
            console.log(err);
          reject(err.message);
        }
      }
    );
  });
};

export const getSession = async () => {
  return new Promise<string | null>((resolve) => {
    chrome.storage.local.get("session", (result) => {
      console.log("sesssionsssss - ", result)
      resolve(null);
    });
  });
};
