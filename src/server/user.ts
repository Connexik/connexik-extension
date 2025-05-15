import type { ConnexikUser, UserDetails } from "./types/user.type"
import config, { SESSION_STATUS } from "~config";
import sessionStore from '../datastore/session';
import { getSession } from "~services/auth";

const getUserDetails = async ({ identifier, username, title, firstName, lastName, profileUrl }: UserDetails): Promise<ConnexikUser> => {
  const session = await getSession();
  if (session?.status !== SESSION_STATUS.ACTIVE) {
    return;
  }

  const response = await fetch(`${config.SERVER_URL}/api/v1/user/config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`
    },
    body: JSON.stringify({ identifier, username, title, firstName, lastName }),
  });

  const respData = await response.json();

  if (respData.status !== 200) {
    return;
  }

  const userData = respData.payload;

  const finalData = {
    connexikId: userData.connexikId,
    isScanned: userData.isScanned,
    isLoggedIn: userData.isLoggedIn,
    rescanTs: new Date(userData.rescanTs).getSeconds(),
    identifier,
    username,
    firstName,
    lastName,
    title,
    profileUrl,
  }

  await sessionStore.setUserData(finalData);
  return finalData;
}

const scanUser = async (connexikId: string, text: string) => {
  const session = await getSession();
  if (session?.status !== SESSION_STATUS.ACTIVE) {
    return;
  }

  const response = await fetch(`${config.SERVER_URL}/api/v1/user/scanner`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.token}`
    },
    body: JSON.stringify({ connexikId, text, }),
  });
  const data = await response.json();

  if (data.status !== 200) {
    return { message: data.message };
  }
}

export default {
  getUserDetails,
  scanUser
}