import type { LinkedinUserSchema, StorageResponse } from "./types/local.type";

const AUTH_KEY = "connexik:auth:session";

const setLinkedInUserData = (user: LinkedinUserSchema): Promise<StorageResponse> => {
    return new Promise((resolve, reject) =>
        chrome.storage.local.set({ [AUTH_KEY]: user }).then(() => resolve({ success: true })).catch((e: Error) => { reject({ success: false, error: e }) })
    );
}

const getLinkedInUserData = (): Promise<{ success: boolean, data: LinkedinUserSchema }> => {
    return new Promise((resolve, reject) =>
        chrome.storage.local.get(AUTH_KEY).then((data) => resolve({ success: true, data: data[AUTH_KEY] })).catch((e: Error) => { reject({ success: false, error: e }) })
    );
}

export default {
    setLinkedInUserData,
    getLinkedInUserData
}