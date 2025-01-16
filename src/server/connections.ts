import config from "~config";

const acceptFilter = async (convexikId: string, pendingInvitations: object, filters: string[]) => {
    const response = await fetch(`${config.SERVER_URL}/api/v1/connections/accept/filter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ convexikId, pendingInvitations, filters, }),
      });
    const data = await response.json();

    if(data.status !== 200){
      return { message: data.message };
    }

    return data.payload;
}

export default {
    acceptFilter
}