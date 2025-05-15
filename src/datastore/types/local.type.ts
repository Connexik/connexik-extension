export type StorageResponse = {
    success: boolean,
    error?: Error
}

export type LinkedinUserSchema = {
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    expiresAt: number
}