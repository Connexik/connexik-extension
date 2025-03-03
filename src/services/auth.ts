import {jwtDecode} from "jwt-decode";

import { INTER_EVENTS, SESSION_STATUS } from "~config";
import type { Session } from "~server/types/user.type";

import authServer from "~server/auth";

const CLIENT_ID = "86xutk8qjyq5n5";
const AUTH_URL = `https://www.linkedin.com/oauth/v2/authorization`;

export const signInWithLinkedIn = async () => {
  const REDIRECT_URI = chrome.identity.getRedirectURL("linkedin");
  const authUrl = `${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=openid%20profile%20email`;

  return new Promise<Session>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async (redirectUrl) => {
        console.log("redirectUrl - ", redirectUrl)
        if (chrome.runtime.lastError || !redirectUrl) {
          console.log("chrome.runtime.lastError - ", chrome.runtime.lastError);
          return reject("Authentication failed");
        }

        const urlParams = new URLSearchParams(new URL(redirectUrl).search);
        const authCode = urlParams.get("code");

        if (!authCode) {
          console.log("redirectUrl - ", redirectUrl)
          return reject("Authentication failed");
        }

        try {
            const session: Session =await authServer.validateToken(authCode, REDIRECT_URI);
            session.lastLoginTs = Date.now();
            await setSession(session);
            resolve(session);
        } catch (err) {
          console.log("signInWithLinkedIn - ", err.message);
          return reject("Authentication failed");
        }
      }
    );
  });
};

const setSession = async (session: Session) => {
  return new Promise<null>((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: INTER_EVENTS.SET_SESSION, payload: session },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          if (response.success) {
            resolve(null);
          } else {
            reject(response.error);
          }
        }
      }
    );
  });
};

const isTokenValid = (token: string) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (error) {
    console.error("Invalid JWT Token:", error);
    return false;
  }
}

export const getSession = async () => {
  return new Promise<Session>((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action: INTER_EVENTS.GET_SESSION },
      async (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          if (response.success) {
            const refetchStatus = response.user.lastLoginTs - (Date.now() - (1000*60*60*24*365));
            const tokenIsValid = isTokenValid(response.user.token);
            if(!tokenIsValid) {
              return resolve(null);
            }

            if(response.user && (response.user.status === SESSION_STATUS.QUEUED || refetchStatus < 0)) {
              const user = await authServer.getAuthUser(response.user.token);
              response.user.status = user.status;

              if(user.status !== response.user.status) {
                await setSession(response.user);
              }
            }
            resolve(response.user);
          } else {
            reject(response.error);
          }
        }
      }
    );
  });
};

export const activeSession = async () => {
  const session = await getSession();
  return session?.status === SESSION_STATUS.ACTIVE;
}