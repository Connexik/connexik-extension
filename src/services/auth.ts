import { jwtDecode } from "jwt-decode";

import { INTER_EVENTS, SESSION_STATUS } from "~config";
import type { Session } from "~server/types/user.type";

import authServer from "~server/auth";
import localStore from "../datastore/local"

const CLIENT_ID = "86xutk8qjyq5n5";
const AUTH_URL = `https://www.linkedin.com/oauth/v2/authorization`;

const launchLinkedInAuthFlow = async (redirect_uri: string): Promise<string> => {
  const authUrl = `${AUTH_URL}?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${redirect_uri}&scope=openid%20profile%20email`;

  return new Promise<string>((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl, interactive: true },
      async (redirectUrl) => {
        console.log("redirectUrl - ", redirectUrl);
        if (chrome.runtime.lastError || !redirectUrl) {
          console.log("chrome.runtime.lastError - ", chrome.runtime.lastError);
          return reject("Authentication failed during web auth flow");
        }

        const urlParams = new URLSearchParams(new URL(redirectUrl).search);
        const authCode = urlParams.get("code");

        if (!authCode) {
          console.log("redirectUrl - ", redirectUrl);
          return reject("Authentication failed: No auth code received");
        }

        resolve(authCode);
      }
    );
  });
};

export const signInWithLinkedIn = async (): Promise<Session> => {
  try {
    const REDIRECT_URI = chrome.identity.getRedirectURL("linkedin");
    const authCode = await launchLinkedInAuthFlow(REDIRECT_URI);
    const session: Session = await authServer.validateToken(authCode, REDIRECT_URI);
    session.lastLoginTs = Date.now();
    await setSession(session);
    return session;
  } catch (error) {
    console.error("LinkedIn authentication failed:", error);
    throw error; // Rethrow the error for the caller to handle
  }
};

// const setSession = async (session: Session) => {
//   return new Promise<null>((resolve, reject) => {
//     chrome.runtime.sendMessage(
//       { action: INTER_EVENTS.SET_SESSION, payload: session },
//       (response) => {
//         if (chrome.runtime.lastError) {
//           console.log("chrome.runtime.lastError Error - ", chrome.runtime.lastError)
//           reject(chrome.runtime.lastError);
//         } else {
//           if (response.success) {
//             resolve(null);
//           } else {
//             console.log("Error - ", response.error)
//             reject(response.error);
//           }
//         }
//       }
//     );
//   });
// };

const setSession = async (session: Session) => {
  try {
    const response = await localStore.setLinkedInUserData(session)

    console.log("setSession ",response)
  } catch (e) {
    console.log("Error - ", e)
  }
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
  const response = await localStore.getLinkedInUserData();
  if (response.success) {
    if (!response.user) {
      return null
    }

    const refetchStatus = response.user.lastLoginTs - (Date.now() - (1000 * 60 * 60 * 24 * 365));
    const tokenIsValid = isTokenValid(response.user.token);
    if (!tokenIsValid) {
      return null
    }

    if (response.user && (response.user.status === SESSION_STATUS.QUEUED || refetchStatus < 0)) {
      const user = await authServer.getAuthUser(response.user.token);
      response.user.status = user.status;

      if (user.status !== response.user.status) {
        await setSession(response.user);
      }
    }
    return response.user;
  } else {
    console.log("Error - ", response)
    throw response
  }
};

export const activeSession = async () => {
  const session = await getSession();
  return session?.status === SESSION_STATUS.ACTIVE;
}