
export type UserDetails = {
    identifier: number,
    username: string,
    title: string,
    firstName: string,
    lastName: string,
    profileUrl: string
}

export type ConnexikUser = {
    isScanned: boolean,
    isLoggedIn: boolean,
    connexikId: string,
    identifier: number,
    firstName: string,
    lastName: string,
    username: string,
    title: string,
    profileUrl: string,
    rescanTs: number
}

export type Session = {
    token: string,
    status: string,
    firstName: string,
    lastName: string,
    lastLoginTs: number
}
