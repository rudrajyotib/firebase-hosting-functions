export type CandidateLoginState = {
    status: 'NotAttempted' | 'LoggedIn' | 'WrongCredentials',
    userName: string,
    attemptCount : number,
    examineeId: string
}