import type { ConnexikUser, UserDetails } from "./types/user.type"

const getUserDetails = async ({lId, lIdentifier, occupation, firstName, lastName, profileUrl}: UserDetails): Promise<ConnexikUser> => {
    return {
        isScanned: false,
        isLoggedIn: false,
        connexikId: 'abc',
        lId,
        lIdentifier,
        firstName,
        lastName,
        occupation,
        profileUrl,
        rescanTs: new Date('2025-12-01').getSeconds()
    }
}

export default {
    getUserDetails
}