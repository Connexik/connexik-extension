import type { ConnexikUser, UserDetails } from "./types/user.type"
import config from "~config";

const getUserDetails = async ({identifier, username, title, firstName, lastName, profileUrl}: UserDetails): Promise<ConnexikUser> => {
    const response = await fetch(`${config.SERVER_URL}/api/v1/user/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, username, title, firstName, lastName }),
      });

    const userData: ConnexikUser = await response.json();

    return userData;
}

const scanUser = async (convexikId: string, text: string) => {
    await fetch(`${config.SERVER_URL}/api/v1/user/scanner`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ convexikId, text, }),
      });
}

export default {
    getUserDetails,
    scanUser
}