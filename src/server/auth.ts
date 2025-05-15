import config from "~config";
import axios from "axios";

const validateToken = async (authCode: string, redirectURI: string) => {
    const response = await axios.post(
        `${config.SERVER_URL}/api/v1/auth/token`,
        {
          authCode,
          redirectURI,
        }
      );

      if(response.data?.status !== 200) {
        throw new Error(response.data?.message || "Authentication failed");
      }

      return response.data.payload;
}

const getAuthUser = async (token: string) => {
    const response = await axios.post(
        `${config.SERVER_URL}/api/v1/auth/status`,{},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
      );

      if(response.data?.status !== 200) {
        throw new Error(response.data?.message || "authentication_failed");
      }

      return response.data.payload;
}

export default {
    validateToken,
    getAuthUser
}