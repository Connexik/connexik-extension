import type { Session } from "~server/types/user.type";
import type { StorageResponse } from "./types/local.type";

const AUTH_KEY = "connexik:auth:session";

const setLinkedInUserData = (user: Session): Promise<StorageResponse> => {
    return new Promise((resolve, reject) =>
        chrome.storage.local.set({ [AUTH_KEY]: user }).then(() => resolve({ success: true })).catch((e: Error) => { reject({ success: false, error: e }) })
    );
}

const getLinkedInUserData = (): Promise<{ success: true, user: Session } | { success: false, error: any }> => {
    return new Promise((resolve, reject) =>
        chrome.storage.local.get(AUTH_KEY).then((data) => resolve({ success: true, user: data[AUTH_KEY] })).catch((e: Error) => { reject({ success: false, error: e }) })
    );
}

export default {
    setLinkedInUserData,
    getLinkedInUserData
}