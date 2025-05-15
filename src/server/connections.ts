import config, { SESSION_STATUS } from "~config"
import { getSession } from "~services/auth";

const acceptFilter = async (
  connexikId: string,
  pendingInvitations: object,
  filters: string[]
) => {
  try {
    const session = await getSession();
    if (session?.status !== SESSION_STATUS.ACTIVE) {
      return { message: "Session expired! Login again." };
    }

    const response = await fetch(
      `${config.SERVER_URL}/api/v1/connections/accept/filter`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`
        },
        body: JSON.stringify({ connexikId, pendingInvitations, filters })
      }
    )
    const data = await response.json()

    if (data.status !== 200) {
      return { message: data.message }
    }

    return data.payload
  } catch (e) {
    return { message: "Something went wrong" }
  }
}

const growConnectionsCount = async (connexikId: string) => {
  try {
    const session = await getSession();
    if (session?.status !== SESSION_STATUS.ACTIVE) {
      return { message: "Session expired! Login again." };
    }

    const response = await fetch(
      `${config.SERVER_URL}/api/v1/connections/grow/count?connexikId=${connexikId}`,
      {
        method: "POST", // Explicitly specify the GET method
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`
        }
      }
    )
    const data = await response.json()

    if (data.status !== 200) {
      return { message: data.message }
    }

    return data.payload?.remaining || 0
  } catch (e) {
    return 0;
  }
}

const growFilter = async (
  connexikId: string,
  connections: object,
  filter: string
) => {
  try {
    const session = await getSession();
    if (session?.status !== SESSION_STATUS.ACTIVE) {
      return { message: "Session expired! Login again." };
    }

    const response = await fetch(
      `${config.SERVER_URL}/api/v1/connections/grow/filter`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token}`
        },
        body: JSON.stringify({ connexikId, connections, filter })
      }
    )
    const data = await response.json()

    if (data.status !== 200) {
      return { message: data.message }
    }

    return data.payload
  } catch (ex) {
    return { message: "Something went wrong" }
  }
}

export default {
  acceptFilter,
  growConnectionsCount,
  growFilter
}
