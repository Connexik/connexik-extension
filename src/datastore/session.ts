import type { ConnexikUser } from "~server/types/user.type";
import type { StorageResponse } from "./types/local.type";

const keyPrefix = 'connexik'
const listeners = [];

const registerChangeUserData = (callback: Function) => listeners.push(callback);

chrome.storage.local.onChanged.addListener((changes) => {
    for (const [key, { newValue }] of Object.entries(changes)) {
        if(key === `${keyPrefix}:linkedin:user`){
            listeners.forEach((callback: Function) => callback(newValue));
        }
    }
});

const setUserData = (user: ConnexikUser): Promise<StorageResponse> => {
    return new Promise((resolve, reject) => 
        chrome.storage.local.set({ [`${keyPrefix}:linkedin:user`] : user }).then(() => resolve({success: true})).catch((e: Error) => { reject({success: false, error: e}) })
    );
}

const getUserData = (): Promise<ConnexikUser> => {
    return new Promise((resolve, reject) => 
        chrome.storage.local.get(`${keyPrefix}:linkedin:user`).then((val: ConnexikUser) => resolve(val)).catch((e: Error) => { reject({success: false, error: e}) })
    );
}

export default {
    registerChangeUserData,
    setUserData,
    getUserData,
}