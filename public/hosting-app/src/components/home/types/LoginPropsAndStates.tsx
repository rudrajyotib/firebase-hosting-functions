export type CandidateLoginState = {
    status: 'NotAttempted' | 'LoggedIn' | 'WrongCredentials',
    userName: string,
    attemptCount : number
}