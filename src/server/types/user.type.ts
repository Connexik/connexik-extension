
export type UserDetails = {
    lId: number,
    lIdentifier: string,
    occupation: string,
    firstName: string,
    lastName: string,
    profileUrl: string
}

export type ConnexikUser = {
    isScanned: boolean,
    isLoggedIn: boolean,
    connexikId: string,
    lId: number,
    firstName: string,
    lastName: string,
    lIdentifier: string,
    occupation: string,
    profileUrl: string,
    rescanTs: number
}