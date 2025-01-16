import type { ConnexikUser, UserDetails } from "./types/user.type"
import config from "~config";
import userServer from '../datastore/local';

const getUserDetails = async ({identifier, username, title, firstName, lastName, profileUrl}: UserDetails): Promise<ConnexikUser> => {
    const response = await fetch(`${config.SERVER_URL}/api/v1/user/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, username, title, firstName, lastName }),
      });

    const respData = await response.json();

    if(respData.status !== 200){
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

    await userServer.setLinkedInUserData(finalData);
    return finalData;
}

const scanUser = async (convexikId: string, text: string) => {
    const response = await fetch(`${config.SERVER_URL}/api/v1/user/scanner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ convexikId, text, }),
      });
    const data = await response.json();

    if(data.status !== 200){
      return { message: data.message };
    }
}

export default {
    getUserDetails,
    scanUser
}