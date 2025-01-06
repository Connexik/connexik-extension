import type { LinkedinUserSchema, StorageResponse } from "./types/local.type";

const keyPrefix = 'connexik'

const setLinkedInUserData = (user: LinkedinUserSchema): Promise<StorageResponse> => {
    return new Promise((resolve, reject) => 
        chrome.storage.local.set({ [`${keyPrefix}:linkedin:user`] : user }).then(() => resolve({success: true})).catch((e: Error) => { reject({success: false, error: e}) })
    );
}

export default {
    setLinkedInUserData
}